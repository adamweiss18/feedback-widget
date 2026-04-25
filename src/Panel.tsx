import { useState } from "react";
import type { Category } from "@/types";
import { Chips } from "@/Chips";

type Props = {
  open: boolean;
  sentCount: number;
  defaultName: string;
  defaultCategory: Category;
  defaultDraft: string;
  pageInfo: { page_path: string; viewport: string; timestamp: string };
  justSent: boolean;
  busy: boolean;
  screenshotAttached: boolean;
  onClose: () => void;
  onNameChange: (v: string) => void;
  onCategoryChange: (c: Category) => void;
  onDraftChange: (v: string) => void;
  onAttachScreenshot: () => void;
  onSend: () => void;
  onUndo: () => void;
};

export function Panel(p: Props) {
  const [name, setName] = useState(p.defaultName);
  const [category, setCategory] = useState<Category>(p.defaultCategory);
  const [draft, setDraft] = useState(p.defaultDraft);

  if (!p.open) return null;

  function handleName(v: string) { setName(v); p.onNameChange(v); }
  function handleCategory(c: Category) { setCategory(c); p.onCategoryChange(c); }
  function handleDraft(v: string) { setDraft(v); p.onDraftChange(v); }

  return (
    <div className="fbw-panel" role="dialog" aria-label="Leave feedback">
      <header>
        <span className="title">
          Leave feedback
          {p.sentCount > 0 && <span className="count" aria-label={`${p.sentCount} sent`}>{p.sentCount} sent</span>}
        </span>
        <button className="close" onClick={p.onClose} aria-label="Close panel" type="button">×</button>
      </header>
      <div className="body">
        {p.justSent && (
          <div className="fbw-banner" role="status">
            <span>✓ Sent · ready for another</span>
            <button className="undo" onClick={p.onUndo} type="button">undo</button>
          </div>
        )}

        <input
          className="fbw-input"
          placeholder="Your name (optional)"
          value={name}
          onChange={(e) => handleName(e.target.value)}
        />

        <Chips value={category} onChange={handleCategory} />

        <textarea
          className="fbw-textarea"
          placeholder="What's on your mind?"
          value={draft}
          onChange={(e) => handleDraft(e.target.value)}
        />

        <div className="fbw-attach-row">
          <button
            className={`fbw-shot-btn${p.screenshotAttached ? " attached" : ""}`}
            onClick={p.onAttachScreenshot}
            disabled={p.busy}
            type="button"
          >
            {p.screenshotAttached ? "Screenshot attached ✓" : "Attach screenshot"}
          </button>
          {!p.screenshotAttached && <span className="hint">optional</span>}
        </div>

        <div className="fbw-ctx">
          page: {p.pageInfo.page_path} · viewport: {p.pageInfo.viewport} · {p.pageInfo.timestamp}
        </div>

        <button className="fbw-send" onClick={p.onSend} disabled={p.busy || !draft.trim()} type="button">
          {p.busy ? "Sending…" : "Send feedback"}
        </button>

        {p.sentCount > 0 && (
          <button className="fbw-ghost" onClick={p.onClose} type="button">
            Done · close panel
          </button>
        )}

        <div className="fbw-footer-line">Name + category remembered for next time</div>
      </div>
    </div>
  );
}
