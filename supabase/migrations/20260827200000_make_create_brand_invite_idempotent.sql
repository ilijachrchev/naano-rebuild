-- Make brand invite creation replay-safe per workspace.
alter table public.collaborations
  add column idempotency_key text;

create unique index collaborations_workspace_idempotency_key_unique
  on public.collaborations (workspace_id, idempotency_key)
  where idempotency_key is not null;

drop function public.create_brand_invite(
  uuid, uuid, uuid, bigint, bigint, char, public.offer_type, date, boolean, uuid
);

-- Create a brand invite and reserve its fee as one transactional command.
create or replace function public.create_brand_invite(
  p_workspace_id uuid,
  p_proposer_id uuid,
  p_creator_id uuid,
  p_fee_cents bigint,
  p_list_price_cents bigint,
  p_currency char(3),
  p_offer_type public.offer_type,
  p_post_by date,
  p_approval_required boolean,
  p_idempotency_key text,
  p_brief_id uuid default null
) returns uuid
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  collaboration_id uuid;
  offer_id uuid;
  normalized_currency char(3);
  offer_expires_at timestamptz := now() + interval '48 hours';
begin
  if p_proposer_id is null then
    raise exception 'authentication required to create a brand invite'
      using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.workspace_members m
    where m.workspace_id = p_workspace_id
      and m.user_id = p_proposer_id
  ) then
    raise exception 'caller is not a member of workspace %', p_workspace_id
      using errcode = '42501';
  end if;

  if p_idempotency_key is not null then
    -- Serialize concurrent replays before checking the database-enforced key.
    perform pg_catalog.pg_advisory_xact_lock(
      pg_catalog.hashtextextended(
        p_workspace_id::text || pg_catalog.chr(31) || p_idempotency_key,
        0
      )
    );

    select c.id into collaboration_id
    from public.collaborations c
    where c.workspace_id = p_workspace_id
      and c.idempotency_key = p_idempotency_key;

    if found then
      return collaboration_id;
    end if;
  end if;

  if p_fee_cents is null or p_fee_cents <= 0 then
    raise exception 'fee_cents must be greater than zero'
      using errcode = '22023';
  end if;

  if p_list_price_cents is null or p_list_price_cents < 0 then
    raise exception 'list_price_cents must be non-negative'
      using errcode = '22023';
  end if;

  if p_currency is null or btrim(p_currency::text) !~ '^[A-Z]{3}$' then
    raise exception 'currency must be a three-letter uppercase code'
      using errcode = '22023';
  end if;
  normalized_currency := p_currency;

  if p_offer_type is null then
    raise exception 'offer_type is required'
      using errcode = '22023';
  end if;

  if p_post_by is null then
    raise exception 'post_by is required'
      using errcode = '22023';
  end if;

  if p_approval_required is null then
    raise exception 'approval_required is required'
      using errcode = '22023';
  end if;

  if not exists (
    select 1
    from public.creators c
    where c.id = p_creator_id
  ) then
    raise exception 'creator % does not exist', p_creator_id
      using errcode = '23503';
  end if;

  if p_brief_id is not null and not exists (
    select 1
    from public.briefs b
    where b.id = p_brief_id
      and b.workspace_id = p_workspace_id
  ) then
    raise exception 'brief % does not belong to workspace %', p_brief_id, p_workspace_id
      using errcode = '23503';
  end if;

  insert into public.collaborations (
    workspace_id,
    creator_id,
    brief_id,
    origin,
    offer_type,
    post_by,
    approval_required,
    status,
    respond_by,
    idempotency_key
  ) values (
    p_workspace_id,
    p_creator_id,
    p_brief_id,
    'brand_invite'::public.collab_origin,
    p_offer_type,
    p_post_by,
    p_approval_required,
    'requested'::public.collab_status,
    offer_expires_at,
    p_idempotency_key
  )
  returning id into collaboration_id;

  insert into public.collaboration_offers (
    collaboration_id,
    proposer_id,
    proposer_role,
    terms_snapshot,
    list_price_cents,
    fee_cents,
    currency,
    expires_at
  ) values (
    collaboration_id,
    p_proposer_id,
    'brand'::public.user_role,
    jsonb_build_object(
      'feeCents', p_fee_cents,
      'listPriceCents', p_list_price_cents,
      'currency', normalized_currency,
      'offerType', p_offer_type,
      'postBy', p_post_by,
      'approvalRequired', p_approval_required,
      'briefId', p_brief_id
    ),
    p_list_price_cents,
    p_fee_cents,
    normalized_currency,
    offer_expires_at
  )
  returning id into offer_id;

  update public.collaborations
  set current_offer_id = offer_id
  where id = collaboration_id;

  -- validate_fund_hold locks the workspace and checks available wallet funds.
  insert into public.fund_holds (
    workspace_id,
    collaboration_id,
    offer_id,
    amount_cents,
    currency,
    status
  ) values (
    p_workspace_id,
    collaboration_id,
    offer_id,
    p_fee_cents,
    normalized_currency,
    'reserved'::public.fund_hold_status
  );

  return collaboration_id;
end;
$$;

revoke all on function public.create_brand_invite(
  uuid, uuid, uuid, bigint, bigint, char, public.offer_type, date, boolean, text, uuid
) from public;

revoke all on function public.create_brand_invite(
  uuid, uuid, uuid, bigint, bigint, char, public.offer_type, date, boolean, text, uuid
) from anon;

revoke all on function public.create_brand_invite(
  uuid, uuid, uuid, bigint, bigint, char, public.offer_type, date, boolean, text, uuid
) from authenticated;

grant execute on function public.create_brand_invite(
  uuid, uuid, uuid, bigint, bigint, char, public.offer_type, date, boolean, text, uuid
) to service_role;
