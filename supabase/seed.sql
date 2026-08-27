-- Deterministic, fictional demo data for local development.
-- UUIDs, dates, URLs, and metrics are fixed so repeated resets produce the same data.

begin;
set constraints all deferred;

create temporary table seed_creators on commit drop as
select
  v.ordinal,
  ('10000000-0000-4000-8000-' || lpad(v.ordinal::text, 12, '0'))::uuid as id,
  v.display_name,
  v.headline,
  v.country,
  v.industries,
  v.price_per_post_cents,
  v.est_impressions,
  v.followers,
  case v.ordinal % 4
    when 1 then jsonb_build_object(
      'jobTitle', jsonb_build_object('Marketing', 42, 'Sales', 24, 'Founder', 18, 'Product', 16),
      'seniority', jsonb_build_object('Individual contributor', 28, 'Manager', 36, 'Director', 24, 'VP or C-suite', 12),
      'sampleN', 1800 + v.ordinal * 37
    )
    when 2 then jsonb_build_object(
      'jobTitle', jsonb_build_object('Engineering', 38, 'Product', 29, 'Founder', 20, 'Operations', 13),
      'seniority', jsonb_build_object('Individual contributor', 34, 'Manager', 31, 'Director', 21, 'VP or C-suite', 14),
      'sampleN', 1800 + v.ordinal * 37
    )
    when 3 then jsonb_build_object(
      'jobTitle', jsonb_build_object('People', 35, 'Operations', 27, 'Founder', 22, 'Finance', 16),
      'seniority', jsonb_build_object('Individual contributor', 24, 'Manager', 33, 'Director', 27, 'VP or C-suite', 16),
      'sampleN', 1800 + v.ordinal * 37
    )
    else jsonb_build_object(
      'jobTitle', jsonb_build_object('Sales', 36, 'Marketing', 28, 'Customer success', 21, 'Founder', 15),
      'seniority', jsonb_build_object('Individual contributor', 30, 'Manager', 29, 'Director', 25, 'VP or C-suite', 16),
      'sampleN', 1800 + v.ordinal * 37
    )
  end as audience_snapshot,
  58 + ((v.ordinal * 7) % 40) as match_default
from (values
  (1,  'Ava Lindholm',       'B2B demand generation strategist for efficient growth teams',                'Sweden',         array['B2B SaaS', 'Marketing Technology'],                 72000, 16500, 48200),
  (2,  'Mateo Silva',        'Founder-led sales and category design operator',                              'Portugal',       array['Sales Technology', 'B2B SaaS', 'Startups'],           64000, 14200, 39100),
  (3,  'Priya Raman',        'People analytics leader making work better with evidence',                    'United Kingdom', array['Future of Work', 'Analytics'],                         58000, 12800, 33700),
  (4,  'Jonas Weber',        'Product-led growth lessons from European software teams',                     'Germany',        array['B2B SaaS', 'Product Management'],                     81000, 19000, 55600),
  (5,  'Nadia El-Amin',      'Cybersecurity storytelling for buyers beyond the security team',              'Netherlands',    array['Cybersecurity', 'Enterprise Software'],               76000, 17400, 42100),
  (6,  'Luca Bianchi',       'Revenue operations systems for scaling go-to-market teams',                   'Italy',          array['Revenue Operations', 'Sales Technology'],             53000, 11600, 29800),
  (7,  'Sofia Kowalska',     'AI product strategy without the hype cycle',                                  'Poland',         array['Artificial Intelligence', 'Product Management'],      88000, 22600, 68400),
  (8,  'Emil Novak',         'Developer experience and platform engineering field notes',                   'Czechia',        array['Developer Tools', 'Cloud Infrastructure'],            69000, 15100, 44700),
  (9,  'Amara Okafor',       'Fintech partnerships and inclusive product growth',                           'Ireland',        array['Fintech', 'Partnerships'],                             61000, 13700, 36500),
  (10, 'Theo Martin',        'Practical brand building for technical founders',                             'France',         array['Brand Strategy', 'Startups', 'B2B SaaS'],             79000, 18300, 51900),
  (11, 'Leila Haddad',       'Customer success systems that turn adoption into expansion',                  'Spain',          array['Customer Success', 'B2B SaaS'],                       47000, 9800,  25400),
  (12, 'Erik Andersen',      'Sustainable operations for modern supply chains',                             'Denmark',        array['Supply Chain', 'Climate Technology'],                 66000, 14500, 38200),
  (13, 'Maya Thompson',      'Enterprise marketing through customer evidence',                              'United States',  array['Enterprise Software', 'Content Marketing'],           94000, 24800, 73500),
  (14, 'Noah Williams',      'Data leadership, metrics, and decisions that survive contact with reality',   'Canada',         array['Data Infrastructure', 'Analytics'],                   83000, 20500, 61100),
  (15, 'Chiara Rossi',       'Community-led growth for global software brands',                             'Italy',          array['Community', 'Marketing Technology'],                  52000, 11200, 31400),
  (16, 'Oskar Berg',         'Designing calm, effective finance operations',                                'Norway',         array['Fintech', 'Finance Operations'],                      57000, 12400, 34600),
  (17, 'Zara Khan',          'Responsible AI governance for teams shipping real products',                  'United Kingdom', array['Artificial Intelligence', 'Governance'],              91000, 23900, 70200),
  (18, 'Felix Muller',       'Industrial software and the next generation of manufacturing',               'Germany',        array['Manufacturing', 'Enterprise Software'],               68000, 14900, 40800),
  (19, 'Ines Costa',         'Lifecycle marketing that respects the customer',                              'Portugal',       array['Lifecycle Marketing', 'B2B SaaS'],                    44000, 9100,  23700),
  (20, 'Daniel Kim',         'Engineering leadership for resilient, high-trust teams',                      'South Korea',    array['Engineering Leadership', 'Developer Tools'],          86000, 21800, 65900),
  (21, 'Amina Diallo',       'Climate tech commercialization and market creation',                          'France',         array['Climate Technology', 'Energy'],                       73000, 16100, 43100),
  (22, 'Hugo Jensen',        'Procurement transformation for digital-first enterprises',                    'Denmark',        array['Procurement', 'Enterprise Software'],                 49000, 10300, 27100),
  (23, 'Elena Petrova',      'Building product organizations customers can feel',                           'Estonia',        array['Product Management', 'B2B SaaS'],                     75000, 16900, 47400),
  (24, 'Rafael Santos',      'Modern sales leadership for complex buying journeys',                         'Brazil',         array['Sales Leadership', 'Revenue Operations'],             63000, 13900, 39700),
  (25, 'Marta Zielinska',    'Talent strategy for companies growing across borders',                        'Poland',         array['Future of Work', 'Human Resources'],                  51000, 10800, 28900),
  (26, 'Samir Patel',        'Cloud economics and infrastructure decisions for builders',                   'United States',  array['Cloud Infrastructure', 'FinOps'],                     97000, 26300, 78100),
  (27, 'Louise Dubois',      'B2B editorial strategy built on useful expertise',                             'Belgium',        array['Content Marketing', 'Brand Strategy'],                55000, 11900, 32200),
  (28, 'Tomas Horak',        'Automation, robotics, and practical factory innovation',                       'Czechia',        array['Robotics', 'Manufacturing'],                          62000, 13400, 37600),
  (29, 'Mei Lin Chen',       'APAC go-to-market strategy for ambitious software companies',                 'Singapore',      array['Go-to-Market', 'B2B SaaS', 'Asia Pacific'],           89000, 23100, 69300),
  (30, 'Ben Carter',         'Founder finance from first revenue to growth round',                           'Australia',      array['Finance Operations', 'Startups'],                     59000, 12700, 35100),
  (31, 'Yasmin Rahman',      'Healthcare innovation through better workflows and data',                     'United Kingdom', array['Health Technology', 'Data Infrastructure'],           78000, 17600, 46300),
  (32, 'Alejandro Ruiz',     'Partner ecosystems that compound B2B growth',                                  'Spain',          array['Partnerships', 'Go-to-Market'],                       54000, 11400, 30600),
  (33, 'Klara Svensson',     'Employee experience grounded in organizational research',                     'Sweden',         array['Future of Work', 'Human Resources', 'Analytics'],      48000, 10100, 26800),
  (34, 'David Mensah',       'Payments infrastructure and fintech growth across markets',                   'Ghana',          array['Fintech', 'Payments'],                                71000, 15800, 41700),
  (35, 'Hannah Brooks',      'Customer research for products people keep using',                             'Canada',         array['Customer Research', 'Product Management'],            60000, 13100, 36900),
  (36, 'Nikola Jovanovic',   'Security engineering translated for business leaders',                        'Serbia',         array['Cybersecurity', 'Engineering Leadership'],            67000, 14700, 40200),
  (37, 'Camille Bernard',    'Sustainable brand strategy with commercial discipline',                       'France',         array['Brand Strategy', 'Climate Technology'],               65000, 14300, 38800),
  (38, 'Rohan Mehta',        'Enterprise AI adoption from pilot to operating model',                         'India',          array['Artificial Intelligence', 'Enterprise Software'],     92000, 24400, 72400),
  (39, 'Eva de Vries',       'Remote operations and async leadership that actually works',                   'Netherlands',    array['Future of Work', 'Operations'],                       50000, 10600, 28100),
  (40, 'Marcus Reed',        'Pipeline strategy for technical B2B categories',                               'United States',  array['Demand Generation', 'Developer Tools', 'B2B SaaS'],   84000, 21100, 63700)
) as v(ordinal, display_name, headline, country, industries, price_per_post_cents, est_impressions, followers);

-- A fixed bcrypt hash for the local-only password "password".
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  confirmation_token, recovery_token, email_change_token_new, email_change,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
select
  '00000000-0000-0000-0000-000000000000'::uuid,
  u.id,
  'authenticated',
  'authenticated',
  u.email,
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.',
  '2026-08-01 09:00:00+00'::timestamptz,
  '', '', '', '',
  jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email')),
  jsonb_build_object('full_name', u.full_name, 'demo', true),
  '2026-08-01 09:00:00+00'::timestamptz,
  '2026-08-01 09:00:00+00'::timestamptz
from (
  select '00000000-0000-4000-8000-000000000100'::uuid as id,
         'demo.brand@naano.example'::text as email,
         'Morgan Lee'::text as full_name
  union all
  select c.id, 'creator-' || lpad(c.ordinal::text, 2, '0') || '@naano.example', c.display_name
  from seed_creators c
) u;

insert into auth.identities (
  id, provider_id, user_id, identity_data, provider,
  last_sign_in_at, created_at, updated_at
)
select
  ('11000000-0000-4000-8000-' || lpad(row_number() over (order by u.id)::text, 12, '0'))::uuid,
  u.id::text,
  u.id,
  jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true),
  'email',
  '2026-08-01 09:00:00+00'::timestamptz,
  '2026-08-01 09:00:00+00'::timestamptz,
  '2026-08-01 09:00:00+00'::timestamptz
from auth.users u
where u.id = '00000000-0000-4000-8000-000000000100'::uuid
   or u.id in (select id from seed_creators);

update public.profiles
set locale = 'en'
where id = '00000000-0000-4000-8000-000000000100'::uuid
   or id in (select id from seed_creators);

insert into public.workspaces (id, name, website, logo_url, owner_id, created_at)
values (
  '20000000-0000-4000-8000-000000000001'::uuid,
  'Northstar Labs Demo',
  'https://northstar.example',
  'https://northstar.example/demo-logo.svg',
  '00000000-0000-4000-8000-000000000100'::uuid,
  '2026-08-02 09:00:00+00'::timestamptz
);

insert into public.workspace_members (workspace_id, user_id, role, created_at)
values (
  '20000000-0000-4000-8000-000000000001'::uuid,
  '00000000-0000-4000-8000-000000000100'::uuid,
  'owner',
  '2026-08-02 09:01:00+00'::timestamptz
);

insert into public.brand_profiles (
  workspace_id, tagline, industry, company_size, value_prop, description,
  product_summary, features, differentiators, icps, scanned_at
)
values (
  '20000000-0000-4000-8000-000000000001'::uuid,
  'Turn product signals into confident revenue decisions.',
  'B2B analytics software',
  '51-200',
  'Northstar Labs helps go-to-market teams connect product usage signals with the accounts most likely to expand.',
  'A fictional demo workspace for exploring naano campaign planning, creator booking, attribution, and wallet flows.',
  'A collaborative revenue intelligence workspace that prioritizes accounts using product engagement and buying signals.',
  '["Account signal scoring", "Pipeline attribution", "Collaborative playbooks", "Warehouse-native reporting"]'::jsonb,
  '["Combines product and revenue context", "Explains every account score", "Designed for cross-functional workflows"]'::jsonb,
  '[{"role":"VP Marketing","companyType":"Growth-stage B2B SaaS","pain":"Cannot connect content engagement to pipeline","productFit":"Uses attribution and account signals to prioritize spend","tags":["demand generation","attribution","pipeline"]},{"role":"Revenue Operations Director","companyType":"Multi-product software company","pain":"Revenue data is fragmented across tools","productFit":"Creates a shared account-level operating view","tags":["revops","data","forecasting"]},{"role":"Head of Product Growth","companyType":"Product-led SaaS","pain":"High-intent usage does not reach go-to-market teams quickly","productFit":"Routes product signals into coordinated expansion plays","tags":["PLG","product analytics","expansion"]}]'::jsonb,
  '2026-08-02 09:15:00+00'::timestamptz
);

insert into public.creators (
  id, display_name, headline, country, linkedin_url, followers, industries,
  price_per_post_cents, est_impressions, audience_snapshot, match_default,
  marketplace_visible, created_at
)
select
  c.id,
  c.display_name,
  c.headline,
  c.country,
  'https://www.linkedin.com/in/demo-' || lower(replace(c.display_name, ' ', '-')),
  c.followers,
  c.industries,
  c.price_per_post_cents,
  c.est_impressions,
  c.audience_snapshot,
  c.match_default,
  true,
  '2026-07-01 08:00:00+00'::timestamptz + c.ordinal * interval '3 hours'
from seed_creators c;

insert into public.campaigns (
  id, workspace_id, name, objective, region, channel,
  open_to_applications, post_deadline_days, status, created_at
)
values
  ('30000000-0000-4000-8000-000000000001'::uuid, '20000000-0000-4000-8000-000000000001'::uuid, 'Signal-Led Growth',       'Show how product signals help marketers prioritize pipeline.',        'Europe',        'linkedin', true,  10, 'live',   '2026-08-03 08:00:00+00'::timestamptz),
  ('30000000-0000-4000-8000-000000000002'::uuid, '20000000-0000-4000-8000-000000000001'::uuid, 'Revenue Clarity',         'Build trust in explainable account scoring for revenue teams.',       'North America', 'linkedin', true,  14, 'live',   '2026-08-04 08:00:00+00'::timestamptz),
  ('30000000-0000-4000-8000-000000000003'::uuid, '20000000-0000-4000-8000-000000000001'::uuid, 'From Usage to Expansion', 'Teach product-led teams to act on expansion signals.',                 'Global',        'linkedin', true,  12, 'live',   '2026-08-05 08:00:00+00'::timestamptz),
  ('30000000-0000-4000-8000-000000000004'::uuid, '20000000-0000-4000-8000-000000000001'::uuid, 'Attribution Field Notes', 'Share practical lessons for connecting creator engagement to revenue.', 'Global',        'linkedin', false, 7, 'closed', '2026-06-10 08:00:00+00'::timestamptz);

insert into public.briefs (
  id, campaign_id, workspace_id, title, source, objectives,
  key_messages, guidelines, content, status, created_at
)
values
  ('31000000-0000-4000-8000-000000000001'::uuid, '30000000-0000-4000-8000-000000000001'::uuid, '20000000-0000-4000-8000-000000000001'::uuid, 'The signal gap in modern demand generation',  'ai',     'Explain why intent without context creates noisy prioritization.',                       '["Product signals need business context", "Every score should be explainable", "Shared evidence improves campaign decisions"]'::jsonb, 'Use a concrete operating example. Avoid invented customer claims or guaranteed outcomes.',                 '{"callToAction":"Explore the signal framework","tone":"Practical and evidence-led"}'::jsonb, 'ready', '2026-08-03 08:20:00+00'::timestamptz),
  ('31000000-0000-4000-8000-000000000002'::uuid, '30000000-0000-4000-8000-000000000002'::uuid, '20000000-0000-4000-8000-000000000001'::uuid, 'Account scoring people can challenge',        'manual', 'Show how transparent inputs create more useful sales and marketing alignment.',          '["Opaque scores slow adoption", "Evidence should be inspectable", "Alignment starts with shared definitions"]'::jsonb, 'Write for revenue operations leaders. Keep examples fictional and clearly framed.',                       '{"callToAction":"Compare your current scoring workflow","tone":"Analytical"}'::jsonb, 'ready', '2026-08-04 08:20:00+00'::timestamptz),
  ('31000000-0000-4000-8000-000000000003'::uuid, '30000000-0000-4000-8000-000000000003'::uuid, '20000000-0000-4000-8000-000000000001'::uuid, 'Expansion signals deserve an operating rhythm','ai',     'Give product growth leaders a practical cross-functional expansion playbook.',           '["Usage signals decay quickly", "Routing needs ownership", "A shared workflow closes the loop"]'::jsonb, 'Include three practical steps and one honest limitation. Do not present demo metrics as benchmarks.',       '{"callToAction":"Map one expansion signal this week","tone":"Direct and useful"}'::jsonb, 'ready', '2026-08-05 08:20:00+00'::timestamptz),
  ('31000000-0000-4000-8000-000000000004'::uuid, '30000000-0000-4000-8000-000000000004'::uuid, '20000000-0000-4000-8000-000000000001'::uuid, 'A practical attribution field guide',          'manual', 'Summarize a fictional pilot workflow from creator post to qualified account.',           '["Start with a stable tracking link", "Define qualification before launch", "Connect evidence to pipeline carefully"]'::jsonb, 'Label all examples and performance figures as demo data.',                                                '{"callToAction":"Audit one campaign path","tone":"Retrospective"}'::jsonb, 'ready', '2026-06-10 08:20:00+00'::timestamptz);

commit;
