import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Category, WidgetProps } from "@/types";
import { storage } from "@/storage";
import { createClient } from "@/api";
import { captureViewport } from "@/screenshot";
import { Pill } from "@/Pill";
import { Panel } from "@/Panel";
import styles from "@/styles.css";

function readApiUrl(override?: string): string | null {
  if (override) return override;
  if (typeof process !== "undefined" && process.env && process.env.NEXT_PUBLIC_FEEDBACK_API_URL) {
    return process.env.NEXT_PUBLIC_FEEDBACK_API_URL;
  }
  return null;
}

function readUrlParamName(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const p = new URLSearchParams(window.location.search);
    return p.get("fbname");
  } catch { return null; }
}

export function FeedbackWidget(props: WidgetProps) {
  const apiUrl = readApiUrl(props.apiUrl);

  // hideOnPaths check
  const path = typeof window !== "undefined" ? window.location.pathname : "";
  if (props.hideOnPaths?.some((p) => path === p)) return null;

  const [hostNode, setHostNode] = useState<HTMLDivElement | null>(null);
  const shadowRootRef = useRef<ShadowRoot | null>(null);

  // Create a host div and attach a shadow root to it once
  useEffect(() => {
    if (typeof document === "undefined") return;
    const host = document.createElement("div");
    host.setAttribute("data-fbw-host", "");
    document.body.appendChild(host);

    const isTest = typeof process !== "undefined" && process.env?.NODE_ENV === "test";
    const mountRoot = isTest ? host : host.attachShadow({ mode: "open" });

    if (!isTest) {
      const styleEl = document.createElement("style");
      styleEl.textContent = typeof styles === "string" ? styles : "";
      (mountRoot as ShadowRoot).appendChild(styleEl);
    }

    const mount = document.createElement("div");
    mountRoot.appendChild(mount);
    shadowRootRef.current = isTest ? null : (mountRoot as ShadowRoot);
    setHostNode(mount);

    return () => {
      host.remove();
      setHostNode(null);
      shadowRootRef.current = null;
    };
  }, []);

  if (!apiUrl) {
    if (typeof console !== "undefined") console.warn("[feedback-widget] no apiUrl provided (prop or NEXT_PUBLIC_FEEDBACK_API_URL). Widget hidden.");
    return null;
  }

  if (!hostNode) return null;
  return createPortal(<WidgetInner {...props} apiUrl={apiUrl} />, hostNode);
}

type InnerProps = WidgetProps & { apiUrl: string };

function WidgetInner({ projectSlug, userName, position = "bottom-right", apiUrl, onSubmit }: InnerProps) {
  const client = useMemo(() => createClient(apiUrl), [apiUrl]);

  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sentCount, setSentCount] = useState(0);
  const [justSent, setJustSent] = useState<{ id: string; undo_token: string; content: string } | null>(null);
  const [screenshotId, setScreenshotId] = useState<string | null>(null);

  // Name resolution: explicit prop > URL param > localStorage > ""
  const initialName = userName ?? readUrlParamName() ?? storage.getName() ?? "";
  const [name, setName] = useState(initialName);
  const [category, setCategory] = useState<Category>(storage.getLastCategory());
  const [draft, setDraft] = useState(storage.getDraft());

  // Persist on change
  useEffect(() => { if (name) storage.setName(name); }, [name]);
  useEffect(() => { storage.setLastCategory(category); }, [category]);
  useEffect(() => { storage.setDraft(draft); }, [draft]);

  // Keyboard shortcut: Cmd/Ctrl+Shift+F toggles panel, Esc closes
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const isToggle = (e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === "F" || e.key === "f");
      if (isToggle) { e.preventDefault(); setOpen((v) => !v); }
      if (e.key === "Escape" && open) setOpen(false);
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  async function attachScreenshot() {
    setBusy(true);
    try {
      const blob = await captureViewport();
      const id = await client.uploadScreenshot(projectSlug, blob);
      setScreenshotId(id);
    } catch (err) {
      console.error("[feedback-widget] screenshot capture failed", err);
    } finally {
      setBusy(false);
    }
  }

  async function send() {
    if (!draft.trim()) return;
    setBusy(true);
    try {
      const res = await client.submit({
        project_slug: projectSlug,
        submitter_name: name || null,
        category,
        content: draft,
        page_url: window.location.href,
        page_path: window.location.pathname,
        viewport: { width: window.innerWidth, height: window.innerHeight },
        user_agent: navigator.userAgent,
        screenshot_id: screenshotId,
      });
      setSentCount((c) => c + 1);
      setJustSent({ id: res.id, undo_token: res.undo_token, content: draft });
      onSubmit?.({ id: res.id, category, content: draft });
      setDraft("");
      storage.clearDraft();
      setScreenshotId(null);
      setTimeout(() => setJustSent(null), 4000);
    } catch (err) {
      console.error("[feedback-widget] submit failed", err);
    } finally {
      setBusy(false);
    }
  }

  async function undo() {
    if (!justSent) return;
    try {
      await client.undo(justSent.id, justSent.undo_token);
      setDraft(justSent.content);
      storage.setDraft(justSent.content);
      setSentCount((c) => Math.max(0, c - 1));
      setJustSent(null);
    } catch (err) {
      console.error("[feedback-widget] undo failed", err);
    }
  }

  const pageInfo = {
    page_path: typeof window !== "undefined" ? window.location.pathname : "",
    viewport: typeof window !== "undefined" ? `${window.innerWidth}×${window.innerHeight}` : "",
    timestamp: new Date().toISOString().slice(0, 16).replace("T", " "),
  };

  return (
    <div className={`fbw-root${position === "bottom-left" ? " left" : ""}`}>
      <Panel
        open={open}
        sentCount={sentCount}
        defaultName={name}
        defaultCategory={category}
        defaultDraft={draft}
        pageInfo={pageInfo}
        justSent={!!justSent}
        busy={busy}
        screenshotAttached={!!screenshotId}
        onClose={() => setOpen(false)}
        onNameChange={setName}
        onCategoryChange={setCategory}
        onDraftChange={setDraft}
        onAttachScreenshot={attachScreenshot}
        onSend={send}
        onUndo={undo}
      />
      <Pill count={sentCount} onClick={() => setOpen((v) => !v)} />
    </div>
  );
}
