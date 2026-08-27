-- Complete collaboration delivery and settlement through transactional commands.
alter table public.collaborations
  add column content_url text;

-- Collaboration state changes are privileged commands, not direct client updates.
drop policy "collab brand update" on public.collaborations;
drop policy "collab creator update" on public.collaborations;

create unique index payouts_one_per_collaboration
  on public.payouts (collaboration_id)
  where collaboration_id is not null;

-- Record creator content and advance an accepted collaboration atomically.
create or replace function public.submit_collaboration_content(
  p_creator_id uuid,
  p_collaboration_id uuid,
  p_content_url text
) returns uuid
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  collaboration_creator_id uuid;
  collaboration_status public.collab_status;
begin
  select c.creator_id, c.status
    into collaboration_creator_id, collaboration_status
  from public.collaborations c
  where c.id = p_collaboration_id
  for update;

  if not found or collaboration_creator_id is distinct from p_creator_id then
    raise exception 'collaboration % does not belong to creator %',
      p_collaboration_id, p_creator_id
      using errcode = '42501';
  end if;

  if collaboration_status <> 'accepted'::public.collab_status then
    raise exception 'collaboration % is not in accepted status', p_collaboration_id
      using errcode = '55000';
  end if;

  if p_content_url is null or btrim(p_content_url) = '' then
    raise exception 'content_url is required'
      using errcode = '22023';
  end if;

  update public.collaborations
  set content_url = btrim(p_content_url),
      status = 'content_submitted'::public.collab_status,
      updated_at = now()
  where id = p_collaboration_id;

  return p_collaboration_id;
end;
$$;

revoke all on function public.submit_collaboration_content(uuid, uuid, text) from public;
revoke all on function public.submit_collaboration_content(uuid, uuid, text) from anon;
revoke all on function public.submit_collaboration_content(uuid, uuid, text) from authenticated;
grant execute on function public.submit_collaboration_content(uuid, uuid, text) to service_role;

-- Capture reserved funds, append the charge, create earnings, and complete the collaboration.
create or replace function public.approve_and_settle_collaboration(
  p_workspace_id uuid,
  p_actor_id uuid,
  p_collaboration_id uuid
) returns uuid
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  collaboration_row public.collaborations%rowtype;
  offer_row public.collaboration_offers%rowtype;
  hold_row public.fund_holds%rowtype;
  charge_id uuid := gen_random_uuid();
  available_before bigint;
  settlement_time timestamptz := now();
begin
  if not exists (
    select 1
    from public.workspace_members m
    where m.workspace_id = p_workspace_id
      and m.user_id = p_actor_id
  ) then
    raise exception 'caller is not a member of workspace %', p_workspace_id
      using errcode = '42501';
  end if;

  select c.* into collaboration_row
  from public.collaborations c
  where c.id = p_collaboration_id
  for update;

  if not found or collaboration_row.workspace_id is distinct from p_workspace_id then
    raise exception 'collaboration % does not belong to workspace %',
      p_collaboration_id, p_workspace_id
      using errcode = '42501';
  end if;

  if collaboration_row.status = 'completed'::public.collab_status then
    return p_collaboration_id;
  end if;

  if collaboration_row.status <> 'content_submitted'::public.collab_status
     and not (
       collaboration_row.status = 'accepted'::public.collab_status
       and collaboration_row.approval_required = false
     ) then
    raise exception 'collaboration % is not ready for settlement', p_collaboration_id
      using errcode = '55000';
  end if;

  perform 1
  from public.workspaces w
  where w.id = p_workspace_id
  for update;

  select o.* into offer_row
  from public.collaboration_offers o
  where o.id = collaboration_row.accepted_offer_id
    and o.collaboration_id = p_collaboration_id
    and o.accepted_at is not null;

  if not found then
    raise exception 'collaboration % does not have an accepted offer snapshot',
      p_collaboration_id
      using errcode = '55000';
  end if;

  select h.* into hold_row
  from public.fund_holds h
  where h.workspace_id = p_workspace_id
    and h.collaboration_id = p_collaboration_id
    and h.offer_id = offer_row.id
    and h.status = 'reserved'::public.fund_hold_status
  for update;

  if not found then
    raise exception 'collaboration % does not have a reserved hold for its accepted offer',
      p_collaboration_id
      using errcode = '55000';
  end if;

  available_before := public.wallet_available_cents(
    p_workspace_id,
    hold_row.currency
  );

  if available_before < 0 then
    raise exception 'wallet available balance cannot be negative: %', available_before
      using errcode = '23514';
  end if;

  insert into public.wallet_transactions (
    id,
    workspace_id,
    type,
    amount_cents,
    currency,
    collaboration_id,
    idempotency_key,
    created_at
  ) values (
    charge_id,
    p_workspace_id,
    'charge'::public.wallet_txn_type,
    offer_row.fee_cents,
    offer_row.currency,
    p_collaboration_id,
    'collaboration-settlement:' || p_collaboration_id::text,
    settlement_time
  );

  update public.fund_holds
  set status = 'captured'::public.fund_hold_status,
      captured_transaction_id = charge_id,
      updated_at = settlement_time
  where id = hold_row.id
    and status = 'reserved'::public.fund_hold_status;

  if not found then
    raise exception 'collaboration % reserved hold changed during settlement',
      p_collaboration_id
      using errcode = '40001';
  end if;

  insert into public.payouts (
    creator_id,
    collaboration_id,
    amount_cents,
    status,
    created_at
  ) values (
    collaboration_row.creator_id,
    p_collaboration_id,
    offer_row.fee_cents,
    'pending'::public.payout_status,
    settlement_time
  );

  update public.collaborations
  set status = 'completed'::public.collab_status,
      updated_at = settlement_time
  where id = p_collaboration_id;

  return p_collaboration_id;
end;
$$;

revoke all on function public.approve_and_settle_collaboration(uuid, uuid, uuid) from public;
revoke all on function public.approve_and_settle_collaboration(uuid, uuid, uuid) from anon;
revoke all on function public.approve_and_settle_collaboration(uuid, uuid, uuid) from authenticated;
grant execute on function public.approve_and_settle_collaboration(uuid, uuid, uuid) to service_role;
