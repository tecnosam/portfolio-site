-- Contact messages table
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text,
  message text not null,
  read boolean default false,
  created_at timestamptz default now()
);

-- Blog posts table (for future use)
create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  excerpt text,
  content text,
  tags text[] default '{}',
  published boolean default false,
  read_time text,
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- JD analysis log (optional, for analytics)
create table if not exists public.jd_analyses (
  id uuid primary key default gen_random_uuid(),
  fit_score integer,
  job_title text,
  company text,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.contact_messages enable row level security;
alter table public.blog_posts enable row level security;
alter table public.jd_analyses enable row level security;

-- Contact messages: only server can insert (via service role or anon insert)
create policy "anyone can submit contact messages"
  on public.contact_messages
  for insert
  to anon, authenticated
  with check (true);

-- Blog posts: anyone can read published posts
create policy "anyone can read published blog posts"
  on public.blog_posts
  for select
  to anon, authenticated
  using (published = true);

-- JD analyses: anyone can insert (anonymous logging)
create policy "anyone can log jd analysis"
  on public.jd_analyses
  for insert
  to anon, authenticated
  with check (true);
