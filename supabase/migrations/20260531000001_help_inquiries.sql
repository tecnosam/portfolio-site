create table if not exists public.help_inquiries (
  id           uuid        primary key default gen_random_uuid(),
  business_info text       not null,
  analysis     jsonb       not null,
  created_at   timestamptz not null default now()
);

alter table public.help_inquiries enable row level security;

create policy "anon can insert inquiries"
  on public.help_inquiries
  for insert
  to anon, authenticated
  with check (true);

create policy "anon can read inquiry by id"
  on public.help_inquiries
  for select
  to anon, authenticated
  using (true);
