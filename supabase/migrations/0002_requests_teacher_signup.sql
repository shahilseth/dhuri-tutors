-- Schema for Phase 7 (parent request form) and Phase 8 (teacher sign-up form).
-- See schema.md §3 for the full design. Never edit this file after it has been applied; add a new migration instead.

-- New listings columns (Phase 8: sign-up profile fields, serves_areas for home tutors).
alter table listings
  add column serves_areas text[] not null default '{}',   -- villages a home tutor also travels to, beyond `area`
  add column area_other text,                              -- free text when "Other village" is picked
  add column experience_years integer,
  add column qualification_level text,
  add column qualification text,
  add column languages text[],
  add column headline text,
  add column source text not null default 'admin' check (source in ('admin', 'self'));

create index listings_serves_areas_idx on listings using gin (serves_areas);

-- One row per "add to teaching list" entry (School / Entrance exam / Skill tabs in the /join form
-- and the admin listing form's shared teaching-list component). listings.subjects/classes stay the
-- union of a listing's entries, rewritten on every save, so the existing search keeps working.
create table teaching_entries (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings (id) on delete cascade,
  track text not null check (track in ('school', 'exam', 'skill')),
  classes text[] not null default '{}',   -- only meaningful for track = 'school'
  subjects text[] not null default '{}',
  sort integer not null default 0
);

create index teaching_entries_listing_idx on teaching_entries (listing_id);

-- Private edit link per listing (Phase 8). The raw token is only ever in the WhatsApp
-- message sent to the teacher; only its hash is stored.
create table edit_tokens (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings (id) on delete cascade,
  token_hash text not null unique,
  created_at timestamptz not null default now(),
  revoked_at timestamptz   -- set when a new link is issued
);

create index edit_tokens_listing_idx on edit_tokens (listing_id);

-- One row per /request submission (Phase 7). No FK to listings: a request is matched to
-- listings at read time (by area/serves_areas and subjects/classes), not linked permanently.
create table requests (
  id uuid primary key default gen_random_uuid(),
  ref_code text not null unique,          -- "R1", "R2", ...; never reused
  is_adult boolean not null,
  name text not null,                     -- the adult being contacted: the requester, or their parent
  student_name text,                      -- student's first name; set only when not is_adult
  phone text not null,                    -- the same adult's mobile (their own, or the parent's)
  class text,
  subjects text[] not null default '{}',
  all_subjects boolean not null default false,
  board text,
  mode text,
  area text,
  area_other text,
  timings text[] not null default '{}',   -- morning / afternoon / evening / weekends
  budget_min integer,
  budget_max integer,
  notes text,
  consent_at timestamptz not null,
  status text not null default 'new' check (status in ('new', 'contacted', 'matched', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index requests_status_created_idx on requests (status, created_at desc);

create trigger requests_set_updated_at
  before update on requests
  for each row
  execute function set_updated_at();

-- RLS on, no policies: only the service-role key (held server-side) can read or write.
alter table teaching_entries enable row level security;
alter table edit_tokens enable row level security;
alter table requests enable row level security;
