"use server";

import { countMatchingListings } from "@/lib/data";

/** Backs the R1 "N teachers match" live line (app_flow.md, Phase 7). Read-only, no auth needed. */
export async function getMatchCount(input: {
  classValue: string;
  subjects: string[];
  allSubjects: boolean;
  mode: string;
}): Promise<number> {
  return countMatchingListings({
    class: input.classValue || undefined,
    subjects: input.allSubjects ? undefined : input.subjects,
    mode: input.mode || undefined,
  });
}
