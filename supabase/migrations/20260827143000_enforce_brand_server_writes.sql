-- Brand onboarding writes are privileged commands; authenticated clients retain read access only.
drop policy "ws owner write" on public.workspaces;
drop policy "brand profile rw" on public.brand_profiles;

create policy "brand profile members read" on public.brand_profiles
  for select using (public.is_member(workspace_id));
