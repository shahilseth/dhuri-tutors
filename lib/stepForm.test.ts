import { describe, expect, it } from "vitest";
import { clearDraft, loadDraft, parseStep, saveDraft, type StepDraftStorage } from "./stepForm";

function fakeStorage(initial: Record<string, string> = {}): StepDraftStorage {
  const store = { ...initial };
  return {
    getItem: (key) => (key in store ? store[key] : null),
    setItem: (key, value) => {
      store[key] = value;
    },
    removeItem: (key) => {
      delete store[key];
    },
  };
}

function throwingStorage(): StepDraftStorage {
  return {
    getItem: () => {
      throw new Error("blocked");
    },
    setItem: () => {
      throw new Error("blocked");
    },
    removeItem: () => {
      throw new Error("blocked");
    },
  };
}

describe("loadDraft", () => {
  it("returns {} when the key is missing", () => {
    expect(loadDraft(fakeStorage(), "request-draft")).toEqual({});
  });

  it("returns the parsed object when present", () => {
    const storage = fakeStorage({ "request-draft": JSON.stringify({ class: "10" }) });
    expect(loadDraft(storage, "request-draft")).toEqual({ class: "10" });
  });

  it("returns {} for invalid JSON", () => {
    const storage = fakeStorage({ "request-draft": "{not json" });
    expect(loadDraft(storage, "request-draft")).toEqual({});
  });

  it("returns {} when the stored value isn't an object", () => {
    const storage = fakeStorage({ "request-draft": JSON.stringify("hello") });
    expect(loadDraft(storage, "request-draft")).toEqual({});
  });

  it("returns {} when storage throws (e.g. private browsing)", () => {
    expect(loadDraft(throwingStorage(), "request-draft")).toEqual({});
  });
});

describe("saveDraft", () => {
  it("writes the draft as JSON", () => {
    const storage = fakeStorage();
    saveDraft(storage, "request-draft", { class: "10" });
    expect(storage.getItem("request-draft")).toBe(JSON.stringify({ class: "10" }));
  });

  it("swallows a storage failure instead of throwing", () => {
    expect(() => saveDraft(throwingStorage(), "request-draft", { class: "10" })).not.toThrow();
  });
});

describe("clearDraft", () => {
  it("removes the key", () => {
    const storage = fakeStorage({ "request-draft": "{}" });
    clearDraft(storage, "request-draft");
    expect(storage.getItem("request-draft")).toBeNull();
  });

  it("swallows a storage failure instead of throwing", () => {
    expect(() => clearDraft(throwingStorage(), "request-draft")).not.toThrow();
  });
});

describe("parseStep", () => {
  it("defaults to 1 when the param is missing", () => {
    expect(parseStep(undefined, 4)).toBe(1);
  });

  it("parses a valid numeric string", () => {
    expect(parseStep("2", 4)).toBe(2);
  });

  it("clamps a step above the total down to the last step", () => {
    expect(parseStep("9", 4)).toBe(4);
  });

  it("falls back to 1 for zero or negative values", () => {
    expect(parseStep("0", 4)).toBe(1);
    expect(parseStep("-3", 4)).toBe(1);
  });

  it("falls back to 1 for a non-numeric value", () => {
    expect(parseStep("two", 4)).toBe(1);
  });

  it("takes the first value when the param repeats in the URL", () => {
    expect(parseStep(["3", "1"], 4)).toBe(3);
  });
});

