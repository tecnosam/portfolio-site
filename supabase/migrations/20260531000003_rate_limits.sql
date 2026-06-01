create table if not exists public.rate_limits (
  key   text not null,
  date  date not null default current_date,
  count integer not null default 1,
  primary key (key, date)
);

alter table public.rate_limits enable row level security;

create policy "anon can manage rate limits"
  on public.rate_limits
  for all
  to anon, authenticated
  using (true)
  with check (true);

-- Atomically insert-or-increment and return the new count.
-- SECURITY DEFINER so it can operate without RLS interference.
create or replace function public.increment_rate_limit(p_key text)
returns integer
language sql
security definer
as $$
  insert into public.rate_limits (key, date, count)
  values (p_key, current_date, 1)
  on conflict (key, date)
  do update set count = rate_limits.count + 1
  returning count;
$$;

grant execute on function public.increment_rate_limit(text) to anon, authenticated;
