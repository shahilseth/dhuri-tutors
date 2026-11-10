-- Phase 8: lets the admin's "Reject" action on a /join sign-up permanently hide it from the
-- "New sign-ups" dashboard section, instead of it looking identical to a still-pending one.
-- See schema.md §3 and tracker.md's 2026-11-10 decision log for why this was added.

alter table listings
  add column rejected_at timestamptz;   -- set by rejectSignupAction; never set on admin-created listings
