-- Dhuri Tutors V0 schema: listings, taps, tap-count view.
-- See schema.md for the full design. Never edit this file after it has been applied; add a new migration instead.

create extension if not exists pgcrypto;

-- One row per teacher or academy. Only published rows are shown publicly.
create table listings (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,          -- public URL part, e.g. "sharma-maths-classes"
  ref_code text not null unique,      -- short code in the WhatsApp message, e.g. "D12"; never reused
  kind text not null check (kind in ('teacher', 'academy')),
  name text not null,
  contact_person text,
  phone text not null,                -- 10 digits, no country code
  whatsapp text,                      -- 10 digits; null means same as phone
  subjects text[] not null default '{}',
  classes text[] not null default '{}',
  boards text[] not null default '{}',
  modes text[] not null default '{}',
  area text not null,
  address text,
  city text not null default 'Dhuri',
  fee_min integer,
  fee_max integer,
  fee_note text,
  timings text,
  about text,
  published boolean not null default false,
  consent_at timestamptz,             -- set when the teacher agrees; required to publish
  last_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint listings_fee_range check (fee_min is null or fee_max is null or fee_min <= fee_max),
  constraint listings_publish_needs_consent check (not published or consent_at is not null)
);

-- Public search filters by city + published, then narrows by subject/class/mode tags.
create index listings_city_published_idx on listings (city, published);
create index listings_subjects_idx on listings using gin (subjects);
create index listings_classes_idx on listings using gin (classes);
create index listings_modes_idx on listings using gin (modes);

-- One row per contact tap (WhatsApp or call). Deleting a listing deletes its taps.
create table taps (
  id bigserial primary key,
  listing_id uuid not null references listings (id) on delete cascade,
  channel text not null check (channel in ('whatsapp', 'call')),
  visitor text,                       -- first 24 hex chars of sha256(TAP_SALT|ip|user-agent); never the raw IP
  created_at timestamptz not null default now()
);

create index taps_listing_created_idx on taps (listing_id, created_at desc);

-- Keeps updated_at current on every edit, so callers never have to set it themselves.
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger listings_set_updated_at
  before update on listings
  for each row
  execute function set_updated_at();

-- De-duplicates taps: same listing + channel + visitor + calendar day (Asia/Kolkata) counts once.
create or replace view listing_tap_counts with (security_invoker = true) as
with unique_taps as (
  select distinct on (listing_id, channel, coalesce(visitor, id::text),
                      (created_at at time zone 'Asia/Kolkata')::date)
    listing_id, channel, created_at
  from taps
)
select
  l.id as listing_id,
  count(t.listing_id) filter (where t.channel = 'whatsapp') as whatsapp_total,
  count(t.listing_id) filter (where t.channel = 'call')     as call_total,
  count(t.listing_id) filter (where t.channel = 'whatsapp' and t.created_at > now() - interval '30 days') as whatsapp_30d,
  count(t.listing_id) filter (where t.channel = 'call'     and t.created_at > now() - interval '30 days') as call_30d
from listings l
left join unique_taps t on t.listing_id = l.id
group by l.id;

-- RLS on, no policies: only the service-role key (held server-side) can read or write.
alter table listings enable row level security;
alter table taps enable row level security;
