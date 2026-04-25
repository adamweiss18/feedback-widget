import { describe, it, expect, beforeEach, vi } from "vitest";
import { createClient } from "@/api";

const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

beforeEach(() => {
  fetchMock.mockReset();
});

describe("api client", () => {
  const client = createClient("https://api.example.com");

  it("submits feedback and returns the response", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ id: "fb-1", created_at: "2026-04-24T10:00:00Z", undo_token: "tok" }), { status: 200 })
    );
    const r = await client.submit({
      project_slug: "demo",
      category: "UX",
      content: "header clips",
    });
    expect(r.id).toBe("fb-1");
    expect(r.undo_token).toBe("tok");

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.example.com/api/feedback");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body).project_slug).toBe("demo");
  });

  it("throws on non-2xx submit response", async () => {
    fetchMock.mockResolvedValue(new Response("rate limited", { status: 429 }));
    await expect(client.submit({ project_slug: "demo", category: "UX", content: "x" })).rejects.toThrow();
  });

  it("reserves a screenshot and uploads via signed PUT URL", async () => {
    fetchMock
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ screenshot_id: "scr-1", signed_put_url: "https://signed.example/put", storage_path: "p" }), { status: 200 })
      )
      .mockResolvedValueOnce(new Response(null, { status: 200 }));

    const blob = new Blob(["x"], { type: "image/png" });
    const id = await client.uploadScreenshot("demo", blob);

    expect(id).toBe("scr-1");
    const reserveCall = fetchMock.mock.calls[0];
    expect(reserveCall[0]).toBe("https://api.example.com/api/screenshot");
    const putCall = fetchMock.mock.calls[1];
    expect(putCall[0]).toBe("https://signed.example/put");
    expect(putCall[1].method).toBe("PUT");
  });

  it("undoes a submitted feedback", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    await client.undo("fb-1", "tok-abc");
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.example.com/api/feedback/fb-1/undo");
    expect(JSON.parse(init.body)).toEqual({ undo_token: "tok-abc" });
  });
});
