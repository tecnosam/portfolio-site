create table if not exists public.jd_submissions (
  id            uuid        primary key default gen_random_uuid(),
  job_description text      not null default '',
  inferred_role text        not null default '',
  fit_score     integer     not null default 0,
  verdict       text        not null default '',
  created_at    timestamptz not null default now()
);

alter table public.jd_submissions enable row level security;

create policy "anon can insert jd submissions"
  on public.jd_submissions
  for insert
  to anon, authenticated
  with check (true);

create policy "anon can read jd submission by id"
  on public.jd_submissions
  for select
  to anon, authenticated
  using (true);
