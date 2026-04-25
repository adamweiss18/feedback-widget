import type { Category } from "@/types";

const PREFIX = "fb_widget_";

const key = (k: string) => PREFIX + k;

function safeGet(k: string): string | null {
  try { return localStorage.getItem(key(k)); } catch { return null; }
}
function safeSet(k: string, v: string): void {
  try { localStorage.setItem(key(k), v); } catch { /* quota, privacy mode, etc. */ }
}
function safeRemove(k: string): void {
  try { localStorage.removeItem(key(k)); } catch { /* noop */ }
}

export const storage = {
  getName(): string | null { return safeGet("name"); },
  setName(name: string): void { safeSet("name", name); },
  clearName(): void { safeRemove("name"); },

  getLastCategory(): Category {
    const v = safeGet("category");
    if (v === "bug" || v === "UX" || v === "copy" || v === "feature" || v === "question") return v;
    return "UX";
  },
  setLastCategory(c: Category): void { safeSet("category", c); },

  getDraft(): string { return safeGet("draft") ?? ""; },
  setDraft(content: string): void { safeSet("draft", content); },
  clearDraft(): void { safeRemove("draft"); },
};
