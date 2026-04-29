import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

vi.mock("@/styles.css", () => ({ default: "" }));

vi.mock("@/screenshot", () => ({
  captureViewport: vi.fn().mockResolvedValue(new Blob(["x"], { type: "image/png" })),
}));

// Mock the API client so tests don't hit the network
const submitMock = vi.fn();
vi.mock("@/api", () => ({
  createClient: () => ({
    submit: submitMock,
    uploadScreenshot: vi.fn(),
    undo: vi.fn(),
  }),
}));

import { FeedbackWidget } from "@/FeedbackWidget";

beforeEach(() => {
  submitMock.mockReset();
  localStorage.clear();
});

describe("FeedbackWidget", () => {
  it("renders the pill collapsed by default", () => {
    render(<FeedbackWidget projectSlug="demo" apiUrl="https://api.example.com" />);
    expect(screen.getByRole("button", { name: /open feedback/i })).toBeInTheDocument();
  });

  it("opens the panel when the pill is clicked", async () => {
    render(<FeedbackWidget projectSlug="demo" apiUrl="https://api.example.com" />);
    fireEvent.click(screen.getByRole("button", { name: /open feedback/i }));
    expect(await screen.findByRole("dialog", { name: /leave feedback/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/what's on your mind\?/i)).toBeInTheDocument();
  });

  it("submits feedback and shows the just-sent banner", async () => {
    submitMock.mockResolvedValue({ id: "fb-1", created_at: "2026-04-24T10:00:00Z", undo_token: "tok" });

    render(<FeedbackWidget projectSlug="demo" apiUrl="https://api.example.com" userName="Adam" />);
    fireEvent.click(screen.getByRole("button", { name: /open feedback/i }));

    const textarea = screen.getByPlaceholderText(/what's on your mind\?/i) as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: "Header clips" } });

    fireEvent.click(screen.getByRole("button", { name: /send feedback/i }));

    await waitFor(() => expect(submitMock).toHaveBeenCalled());
    expect(submitMock.mock.calls[0][0].content).toBe("Header clips");
    expect(submitMock.mock.calls[0][0].submitter_name).toBe("Adam");

    await waitFor(() => expect(screen.getByText(/sent · ready for another/i)).toBeInTheDocument());
    expect(screen.getByText(/1 sent/i)).toBeInTheDocument();
  });

  it("clears the textarea after a successful send", async () => {
    submitMock.mockResolvedValue({ id: "fb-2", created_at: "2026-04-24T10:00:00Z", undo_token: "tok" });

    render(<FeedbackWidget projectSlug="demo" apiUrl="https://api.example.com" />);
    fireEvent.click(screen.getByRole("button", { name: /open feedback/i }));

    const textarea = screen.getByPlaceholderText(/what's on your mind\?/i) as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: "Some feedback" } });
    expect(textarea.value).toBe("Some feedback");

    fireEvent.click(screen.getByRole("button", { name: /send feedback/i }));

    await waitFor(() => expect(submitMock).toHaveBeenCalled());
    await waitFor(() => expect(textarea.value).toBe(""));
  });

  it("respects hideOnPaths by not rendering", () => {
    // jsdom starts at http://localhost/; hide on that path
    const { container } = render(
      <FeedbackWidget projectSlug="demo" apiUrl="https://api.example.com" hideOnPaths={["/"]} />
    );
    expect(container.querySelector(".fbw-root")).toBeNull();
  });
});
