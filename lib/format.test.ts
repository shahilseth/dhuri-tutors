import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ago,
  classesText,
  feeText,
  intl,
  isStale,
  modeLabel,
  slugify,
  subjectLabel,
  telUrl,
  whatsappMessage,
  whatsappUrl,
} from "./format";

describe("feeText", () => {
  it("shows a range when both fees are set", () => {
    expect(feeText(800, 1500)).toBe("₹800 to ₹1,500 a month");
  });

  it("shows a single amount when only one fee is set", () => {
    expect(feeText(800, null)).toBe("₹800 a month");
    expect(feeText(null, 1500)).toBe("₹1,500 a month");
  });

  it("falls back to 'Fee on request' when neither is set", () => {
    expect(feeText(null, null)).toBe("Fee on request");
  });
});

describe("classesText", () => {
  it("collapses a continuous numeric range", () => {
    expect(classesText(["9", "10", "11", "12"])).toBe("Class 9 to 12");
  });

  it("lists non-continuous numeric classes with commas", () => {
    expect(classesText(["6", "8", "10"])).toBe("Class 6, 8, 10");
  });

  it("uses config labels for non-numeric classes", () => {
    expect(classesText(["jee", "neet"])).toBe("JEE, NEET");
  });

  it("returns an empty string for no classes", () => {
    expect(classesText([])).toBe("");
  });
});

describe("modeLabel", () => {
  it("maps known modes to their display word", () => {
    expect(modeLabel("academy")).toBe("academy");
    expect(modeLabel("home")).toBe("home tuition");
    expect(modeLabel("online")).toBe("online");
  });

  it("falls back to the raw value for an unknown mode", () => {
    expect(modeLabel("carrier-pigeon")).toBe("carrier-pigeon");
  });
});

describe("subjectLabel", () => {
  it("maps a stored value to its display label", () => {
    expect(subjectLabel("maths")).toBe("Maths");
    expect(subjectLabel("spoken-english")).toBe("Spoken English");
  });

  it("falls back to the raw value for an unknown subject", () => {
    expect(subjectLabel("made-up")).toBe("made-up");
  });
});

describe("ago and isStale", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-29T00:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("describes recent dates in days", () => {
    expect(ago(new Date("2026-10-29T00:00:00Z"))).toBe("today");
    expect(ago(new Date("2026-10-28T00:00:00Z"))).toBe("1 day ago");
    expect(ago(new Date("2026-10-26T00:00:00Z"))).toBe("3 days ago");
  });

  it("switches to months and years for older dates", () => {
    expect(ago(new Date("2026-08-29T00:00:00Z"))).toBe("2 months ago");
    expect(ago(new Date("2024-10-29T00:00:00Z"))).toBe("2 years ago");
  });

  it("treats a never-verified listing as stale", () => {
    expect(isStale(null)).toBe(true);
  });

  it("is not stale within STALE_AFTER_DAYS", () => {
    expect(isStale(new Date("2026-10-01T00:00:00Z").toISOString())).toBe(false);
  });

  it("is stale past STALE_AFTER_DAYS", () => {
    expect(isStale(new Date("2026-08-01T00:00:00Z").toISOString())).toBe(true);
  });
});

describe("intl", () => {
  it("prefixes a 10-digit phone with the country code", () => {
    expect(intl("9988776655")).toBe("919988776655");
  });

  it("strips any non-digits defensively", () => {
    expect(intl("99887 76655")).toBe("919988776655");
  });
});

describe("whatsappMessage, whatsappUrl, telUrl", () => {
  it("includes the ref code in the message", () => {
    expect(whatsappMessage("D12")).toContain("D12");
  });

  it("builds a wa.me URL with the encoded message", () => {
    const url = whatsappUrl("9988776655", "Hi there");
    expect(url).toBe("https://wa.me/919988776655?text=Hi%20there");
  });

  it("builds a tel: URL", () => {
    expect(telUrl("9988776655")).toBe("tel:+919988776655");
  });
});

describe("slugify", () => {
  it("lowercases and hyphenates a name", () => {
    expect(slugify("Sharma Maths Classes")).toBe("sharma-maths-classes");
  });

  it("strips punctuation and collapses repeated separators", () => {
    expect(slugify("R.K. Sharma's Academy!!")).toBe("r-k-sharma-s-academy");
  });

  it("trims leading and trailing hyphens", () => {
    expect(slugify("  --Dhuri Tutors--  ")).toBe("dhuri-tutors");
  });
});
