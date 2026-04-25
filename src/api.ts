import type { FeedbackSubmission, FeedbackResponse } from "@/types";

export type Client = {
  submit(body: FeedbackSubmission): Promise<FeedbackResponse>;
  uploadScreenshot(projectSlug: string, blob: Blob): Promise<string>;
  undo(id: string, token: string): Promise<void>;
};

export function createClient(apiUrl: string): Client {
  const base = apiUrl.replace(/\/$/, "");

  async function postJson<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(base + path, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`);
    return (await res.json()) as T;
  }

  return {
    async submit(body) {
      return postJson<FeedbackResponse>("/api/feedback", body);
    },

    async uploadScreenshot(projectSlug, blob) {
      const reserve = await postJson<{ screenshot_id: string; signed_put_url: string }>("/api/screenshot", { project_slug: projectSlug });
      const put = await fetch(reserve.signed_put_url, {
        method: "PUT",
        headers: { "content-type": "image/png" },
        body: blob,
      });
      if (!put.ok) throw new Error(`screenshot PUT failed: ${put.status}`);
      return reserve.screenshot_id;
    },

    async undo(id, token) {
      await postJson<{ ok: boolean }>(`/api/feedback/${id}/undo`, { undo_token: token });
    },
  };
}
