import { describe, it, expect, beforeEach } from "vitest";
import { storage } from "@/storage";

beforeEach(() => {
  localStorage.clear();
});

describe("storage", () => {
  it("round-trips the submitter name", () => {
    storage.setName("Adam");
    expect(storage.getName()).toBe("Adam");
  });

  it("returns null when no name has been set", () => {
    expect(storage.getName()).toBeNull();
  });

  it("round-trips the last category", () => {
    storage.setLastCategory("UX");
    expect(storage.getLastCategory()).toBe("UX");
  });

  it("defaults last category to 'UX' when unset", () => {
    expect(storage.getLastCategory()).toBe("UX");
  });

  it("persists a draft content string", () => {
    storage.setDraft("in progress text");
    expect(storage.getDraft()).toBe("in progress text");
    storage.clearDraft();
    expect(storage.getDraft()).toBe("");
  });
});
