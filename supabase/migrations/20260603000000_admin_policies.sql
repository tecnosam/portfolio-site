-- Allow authenticated users (admin) to read all tables
create policy "authenticated can read contact messages"
  on public.contact_messages for select
  to authenticated using (true);

create policy "authenticated can update contact messages"
  on public.contact_messages for update
  to authenticated using (true) with check (true);

create policy "authenticated can read jd submissions"
  on public.jd_submissions for select
  to authenticated using (true);

create policy "authenticated can read help inquiries"
  on public.help_inquiries for select
  to authenticated using (true);

create policy "authenticated can read ai cache"
  on public.ai_cache for select
  to authenticated using (true);
