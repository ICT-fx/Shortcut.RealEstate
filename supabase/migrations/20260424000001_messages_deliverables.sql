-- messages table
create table if not exists messages (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid references orders(id) on delete cascade,
  sender_id   uuid references auth.users(id),
  sender_role text not null check (sender_role in ('client', 'team')),
  content     text not null,
  created_at  timestamptz default now()
);

alter table messages enable row level security;

create policy "clients see own order messages"
  on messages for select
  using (order_id in (select id from orders where client_id = auth.uid()));

create policy "clients insert own order messages"
  on messages for insert
  with check (
    order_id in (select id from orders where client_id = auth.uid())
    and sender_id = auth.uid()
    and sender_role = 'client'
  );

-- deliverables table
create table if not exists deliverables (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid references orders(id) on delete cascade,
  file_name     text not null,
  file_url      text not null,
  uploaded_by   text not null check (uploaded_by in ('client', 'team')),
  created_at    timestamptz default now()
);

alter table deliverables enable row level security;

create policy "clients see own order deliverables"
  on deliverables for select
  using (order_id in (select id from orders where client_id = auth.uid()));

create policy "clients insert own order deliverables"
  on deliverables for insert
  with check (
    order_id in (select id from orders where client_id = auth.uid())
    and uploaded_by = 'client'
  );

-- RLS on orders (idempotent)
alter table orders enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'orders' and policyname = 'clients see own orders'
  ) then
    create policy "clients see own orders"
      on orders for select
      using (user_id = auth.uid());
  end if;
end $$;
