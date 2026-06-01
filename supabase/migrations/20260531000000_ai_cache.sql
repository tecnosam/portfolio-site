create table if not exists public.ai_cache (
  cache_key  text        primary key,
  value      jsonb       not null,
  pinecone_version integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.ai_cache enable row level security;

-- API routes run with the anon key; allow full CRUD on cache rows
create policy "anon can manage cache"
  on public.ai_cache
  for all
  to anon, authenticated
  using (true)
  with check (true);
