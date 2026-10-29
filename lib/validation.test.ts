import { describe, expect, it } from "vitest";
import { type ListingFormInput, validateListingInput } from "./validation";

function validInput(overrides: Partial<ListingFormInput> = {}): ListingFormInput {
  return {
    kind: "teacher",
    name: "Sample Sharma",
    contact_person: "",
    phone: "9876543210",
    whatsapp: "",
    subjects: ["maths"],
    classes: ["9", "10"],
    boards: ["PSEB"],
    modes: ["home"],
    area: "Bank Road",
    address: "",
    fee_min: "",
    fee_max: "",
    fee_note: "",
    timings: "",
    about: "",
    slug: "sample-sharma",
    ...overrides,
  };
}

describe("validateListingInput: happy path", () => {
  it("accepts a fully valid submission", () => {
    const result = validateListingInput(validInput());
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.phone).toBe("9876543210");
      expect(result.value.whatsapp).toBeNull();
      expect(result.value.slug).toBe("sample-sharma");
    }
  });
});

describe("validateListingInput: phone formats", () => {
  it("accepts a plain 10-digit number starting 6-9", () => {
    const result = validateListingInput(validInput({ phone: "9988776655" }));
    expect(result.ok).toBe(true);
  });

  it("strips spaces and hyphens before checking", () => {
    const result = validateListingInput(validInput({ phone: "98-765 43210" }));
    expect(result.ok).toBe(true);
  });

  it("drops a leading 91 country code from a 12-digit number", () => {
    const result = validateListingInput(validInput({ phone: "919876543210" }));
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.phone).toBe("9876543210");
  });

  it("drops a leading 0 trunk prefix from an 11-digit number", () => {
    const result = validateListingInput(validInput({ phone: "09876543210" }));
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.phone).toBe("9876543210");
  });

  it("rejects a number starting 0-5", () => {
    const result = validateListingInput(validInput({ phone: "5876543210" }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.phone).toBeDefined();
  });

  it("rejects a number that is too short", () => {
    const result = validateListingInput(validInput({ phone: "98765" }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.phone).toBeDefined();
  });

  it("treats a blank whatsapp as same-as-phone (null)", () => {
    const result = validateListingInput(validInput({ whatsapp: "" }));
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.whatsapp).toBeNull();
  });

  it("validates whatsapp with the same phone rule when provided", () => {
    const result = validateListingInput(validInput({ whatsapp: "123" }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.whatsapp).toBeDefined();
  });
});

describe("validateListingInput: fee min/max", () => {
  it("accepts both fees unset", () => {
    const result = validateListingInput(validInput({ fee_min: "", fee_max: "" }));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.fee_min).toBeNull();
      expect(result.value.fee_max).toBeNull();
    }
  });

  it("accepts min <= max", () => {
    const result = validateListingInput(validInput({ fee_min: "800", fee_max: "1500" }));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.fee_min).toBe(800);
      expect(result.value.fee_max).toBe(1500);
    }
  });

  it("accepts min equal to max", () => {
    const result = validateListingInput(validInput({ fee_min: "1000", fee_max: "1000" }));
    expect(result.ok).toBe(true);
  });

  it("rejects min greater than max", () => {
    const result = validateListingInput(validInput({ fee_min: "2000", fee_max: "1000" }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.fee_max).toBeDefined();
  });

  it("rejects a negative fee", () => {
    const result = validateListingInput(validInput({ fee_min: "-5" }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.fee_min).toBeDefined();
  });

  it("rejects a fee over 100000", () => {
    const result = validateListingInput(validInput({ fee_max: "100001" }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.fee_max).toBeDefined();
  });

  it("rejects a non-numeric fee", () => {
    const result = validateListingInput(validInput({ fee_min: "abc" }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.fee_min).toBeDefined();
  });
});

describe("validateListingInput: empty arrays", () => {
  it("requires at least one subject", () => {
    const result = validateListingInput(validInput({ subjects: [] }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.subjects).toBeDefined();
  });

  it("requires at least one class", () => {
    const result = validateListingInput(validInput({ classes: [] }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.classes).toBeDefined();
  });

  it("requires at least one mode", () => {
    const result = validateListingInput(validInput({ modes: [] }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.modes).toBeDefined();
  });

  it("allows an empty boards array (boards are optional)", () => {
    const result = validateListingInput(validInput({ boards: [] }));
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.boards).toEqual([]);
  });
});

describe("validateListingInput: invalid list values", () => {
  it("rejects a subject not in lib/config.ts", () => {
    const result = validateListingInput(validInput({ subjects: ["astrology"] }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.subjects).toBeDefined();
  });

  it("rejects a class not in lib/config.ts", () => {
    const result = validateListingInput(validInput({ classes: ["13"] }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.classes).toBeDefined();
  });

  it("rejects a mode not in lib/config.ts", () => {
    const result = validateListingInput(validInput({ modes: ["telepathy"] }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.modes).toBeDefined();
  });

  it("rejects a board not in lib/config.ts", () => {
    const result = validateListingInput(validInput({ boards: ["IB"] }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.boards).toBeDefined();
  });

  it("rejects an area not in lib/config.ts", () => {
    const result = validateListingInput(validInput({ area: "Mars Colony" }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.area).toBeDefined();
  });
});

describe("validateListingInput: other fields", () => {
  it("rejects a name that is too short", () => {
    const result = validateListingInput(validInput({ name: "A" }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.name).toBeDefined();
  });

  it("rejects a kind that isn't teacher or academy", () => {
    const result = validateListingInput(validInput({ kind: "school" }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.kind).toBeDefined();
  });

  it("rejects a slug with uppercase or invalid characters", () => {
    const result = validateListingInput(validInput({ slug: "Sample_Sharma!" }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.slug).toBeDefined();
  });

  it("rejects a slug shorter than 3 characters", () => {
    const result = validateListingInput(validInput({ slug: "ab" }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.slug).toBeDefined();
  });

  it("rejects an about longer than 600 characters", () => {
    const result = validateListingInput(validInput({ about: "a".repeat(601) }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.about).toBeDefined();
  });
});
