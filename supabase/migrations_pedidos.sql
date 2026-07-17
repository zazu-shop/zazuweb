-- Ejecuta esto en Supabase: Dashboard > SQL Editor > New query
-- Crea el sistema de pedidos: numeración (ZZ-XXXXXX), tabla de pedidos y
-- sus items. El frontend genera el id y el order_number en el navegador
-- antes de insertar (así el cliente ve su número al instante, y no
-- necesitamos abrir permiso de LECTURA pública sobre pedidos, que
-- contienen correo y teléfono). El default de abajo es solo un respaldo.

create sequence if not exists order_number_seq start 1;

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null default ('ZZ-' || lpad(nextval('order_number_seq')::text, 5, '0')),
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  total numeric(10, 2) not null,
  payment_method text default 'yape_manual',
  status text default 'pendiente_verificacion', -- pendiente_verificacion | pagado | cancelado
  created_at timestamp with time zone default now()
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id),
  name text not null,
  price numeric(10, 2) not null,
  qty integer not null,
  created_at timestamp with time zone default now()
);

create unique index if not exists idx_orders_order_number on orders (order_number);

-- RLS: el checkout corre desde el navegador con la publishable key, así que
-- necesitamos permitir crear pedidos públicamente. La LECTURA se deja
-- cerrada (solo tú, desde el dashboard de Supabase, o con la secret key
-- del backend) para que nadie pueda ver pedidos ajenos por su UUID.
alter table orders enable row level security;
alter table order_items enable row level security;

create policy "Creación pública de pedidos"
  on orders for insert
  with check (true);

create policy "Creación pública de items de pedido"
  on order_items for insert
  with check (true);