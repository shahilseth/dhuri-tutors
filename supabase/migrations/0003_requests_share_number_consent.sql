-- Adds a per-request flag the admin ticks on /admin/requests, after confirming with the
-- parent, that it's okay to forward their number to a matched teacher. Separate from
-- requests.consent_at, which is the parent's own agreement at R3 to have the request
-- itself shared with matching teachers — not their phone number specifically.
-- See schema.md §3 ("requests") and app_flow.md A5.

alter table requests
  add column share_number_consent boolean not null default false;
