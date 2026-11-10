import { describe, expect, it } from "vitest";
import type { TeachingEntry } from "./types";
import {
  type ListingFormInput,
  type RequestFormInput,
  teachingEntriesUnion,
  validateListingInput,
  validateRequestInput,
  validateTeachingEntries,
} from "./validation";

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
    area: "bamal",
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

function validAdultRequest(overrides: Partial<RequestFormInput> = {}): RequestFormInput {
  return {
    class: "10",
    subjects: ["maths"],
    all_subjects: "",
    board: "",
    mode: "home",
    area: "bamal",
    area_other: "",
    timings: ["evening"],
    budget_min: "",
    budget_max: "",
    is_adult: "yes",
    name: "Sample Parent",
    student_name: "",
    phone: "9876543210",
    notes: "",
    consent: "yes",
    ...overrides,
  };
}

describe("validateRequestInput: happy path", () => {
  it("accepts a fully valid adult submission", () => {
    const result = validateRequestInput(validAdultRequest());
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.is_adult).toBe(true);
      expect(result.value.student_name).toBeNull();
      expect(result.value.area).toBe("bamal");
      expect(result.value.area_other).toBeNull();
    }
  });

  it("accepts 'All subjects for this class' instead of a subjects list", () => {
    const result = validateRequestInput(validAdultRequest({ subjects: [], all_subjects: "yes" }));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.all_subjects).toBe(true);
      expect(result.value.subjects).toEqual([]);
    }
  });

  it("accepts 'Other village' with free text, saved to area_other not area", () => {
    const result = validateRequestInput(validAdultRequest({ area: "other", area_other: "Chotti Nagri" }));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.area).toBeNull();
      expect(result.value.area_other).toBe("Chotti Nagri");
    }
  });
});

describe("validateRequestInput: adult vs minor branching", () => {
  it("requires the student's first name when under 18", () => {
    const result = validateRequestInput(
      validAdultRequest({ is_adult: "no", name: "Sample Parent", student_name: "" }),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.student_name).toBeDefined();
  });

  it("accepts a minor's request with a student name and a parent's name/phone", () => {
    const result = validateRequestInput(
      validAdultRequest({ is_adult: "no", name: "Sample Parent", student_name: "Sample Child" }),
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.is_adult).toBe(false);
      expect(result.value.name).toBe("Sample Parent");
      expect(result.value.student_name).toBe("Sample Child");
    }
  });

  it("rejects when 18-or-older isn't answered", () => {
    const result = validateRequestInput(validAdultRequest({ is_adult: "" }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.is_adult).toBeDefined();
  });
});

describe("validateRequestInput: budget", () => {
  it("accepts both budgets unset", () => {
    const result = validateRequestInput(validAdultRequest({ budget_min: "", budget_max: "" }));
    expect(result.ok).toBe(true);
  });

  it("accepts min <= max", () => {
    const result = validateRequestInput(validAdultRequest({ budget_min: "1000", budget_max: "2000" }));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.budget_min).toBe(1000);
      expect(result.value.budget_max).toBe(2000);
    }
  });

  it("rejects min greater than max", () => {
    const result = validateRequestInput(validAdultRequest({ budget_min: "2000", budget_max: "1000" }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.budget_max).toBeDefined();
  });
});

describe("validateRequestInput: other fields", () => {
  it("requires at least one subject when 'all subjects' isn't ticked", () => {
    const result = validateRequestInput(validAdultRequest({ subjects: [], all_subjects: "" }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.subjects).toBeDefined();
  });

  it("requires a class from the list", () => {
    const result = validateRequestInput(validAdultRequest({ class: "13" }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.class).toBeDefined();
  });

  it("requires an area, 'other' with text, from the list", () => {
    const result = validateRequestInput(validAdultRequest({ area: "mars-colony" }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.area).toBeDefined();
  });

  it("requires village text when 'Other village' is picked without typing one", () => {
    const result = validateRequestInput(validAdultRequest({ area: "other", area_other: "" }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.area_other).toBeDefined();
  });

  it("requires at least one timing", () => {
    const result = validateRequestInput(validAdultRequest({ timings: [] }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.timings).toBeDefined();
  });

  it("rejects an invalid phone", () => {
    const result = validateRequestInput(validAdultRequest({ phone: "12345" }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.phone).toBeDefined();
  });

  it("requires consent", () => {
    const result = validateRequestInput(validAdultRequest({ consent: "" }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.consent).toBeDefined();
  });

  it("rejects notes longer than 300 characters", () => {
    const result = validateRequestInput(validAdultRequest({ notes: "a".repeat(301) }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.notes).toBeDefined();
  });
});

describe("validateTeachingEntries", () => {
  const schoolEntry: TeachingEntry = { track: "school", classes: ["9", "10"], subjects: ["maths"] };
  const examEntry: TeachingEntry = { track: "exam", classes: ["jee"], subjects: ["physics", "quant"] };
  const skillEntry: TeachingEntry = { track: "skill", classes: [], subjects: ["coding"] };

  it("accepts one valid entry per track", () => {
    const result = validateTeachingEntries([schoolEntry, examEntry, skillEntry]);
    expect(result.ok).toBe(true);
  });

  it("rejects an empty list", () => {
    const result = validateTeachingEntries([]);
    expect(result.ok).toBe(false);
  });

  it("rejects an entry with no subjects", () => {
    const result = validateTeachingEntries([{ ...schoolEntry, subjects: [] }]);
    expect(result.ok).toBe(false);
  });

  it("rejects a subject not in lib/config.ts", () => {
    const result = validateTeachingEntries([{ ...schoolEntry, subjects: ["astrology"] }]);
    expect(result.ok).toBe(false);
  });

  it("rejects a school entry with no classes", () => {
    const result = validateTeachingEntries([{ ...schoolEntry, classes: [] }]);
    expect(result.ok).toBe(false);
  });

  it("rejects an exam entry with more than one class", () => {
    const result = validateTeachingEntries([{ ...examEntry, classes: ["jee", "neet"] }]);
    expect(result.ok).toBe(false);
  });

  it("rejects a skill entry that has classes", () => {
    const result = validateTeachingEntries([{ ...skillEntry, classes: ["9"] }]);
    expect(result.ok).toBe(false);
  });
});

describe("teachingEntriesUnion", () => {
  it("unions and dedupes subjects and classes across entries", () => {
    const entries: TeachingEntry[] = [
      { track: "school", classes: ["9", "10"], subjects: ["maths"] },
      { track: "school", classes: ["10", "11"], subjects: ["maths", "science"] },
      { track: "skill", classes: [], subjects: ["coding"] },
    ];
    const union = teachingEntriesUnion(entries);
    expect(union.classes.sort()).toEqual(["10", "11", "9"].sort());
    expect(union.subjects.sort()).toEqual(["coding", "maths", "science"].sort());
  });

  it("returns empty arrays for no entries", () => {
    expect(teachingEntriesUnion([])).toEqual({ subjects: [], classes: [] });
  });
});
