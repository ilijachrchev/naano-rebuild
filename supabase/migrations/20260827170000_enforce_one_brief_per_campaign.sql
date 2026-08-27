-- A campaign owns one durable brief. This also gives brief generation a
-- conflict target so concurrent requests converge on the same row.
alter table public.briefs
  add constraint briefs_campaign_id_key unique (campaign_id);
