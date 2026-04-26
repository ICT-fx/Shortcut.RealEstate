create table if not exists models (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  glb_url     text not null,
  rooms       jsonb not null default '[]'::jsonb,
  order_id    uuid references orders(id) on delete set null,
  is_demo     boolean not null default false,
  created_at  timestamptz default now()
);

alter table models enable row level security;

-- Public can read the demo model
create policy "public read demo model"
  on models for select
  using (is_demo = true);

-- Authenticated clients can read their own model
create policy "clients read own model"
  on models for select
  using (
    auth.uid() is not null
    and order_id in (
      select id from orders where client_id = auth.uid()
    )
  );

-- Admins can do everything
create policy "admins manage models"
  on models
  using (
    (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
  )
  with check (
    (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
  );
