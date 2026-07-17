-- Ejecuta esto en Supabase: Dashboard > SQL Editor > New query

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric(10, 2),
  category text default 'General',
  image_url text,
  stock integer default 10,
  created_at timestamp with time zone default now()
);

create table if not exists contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  created_at timestamp with time zone default now()
);

-- Datos de ejemplo para probar el Bazar de inmediato
insert into products (name, description, price, category, image_url, stock) values
  ('Amuleto de Cuervo Negro', 'Tallado en madera de roble ahumado, engastado en latón envejecido.', 129.00, 'Amuletos', 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=600', 5),
  ('Grimorio de Bolsillo', 'Cubierta en cuero repujado a mano con el sigilo de la casa.', 89.00, 'Grimorios', 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=600', 12),
  ('Vela de Vigilia Púrpura', 'Cera de soja con resina de mirra, para rituales de introspección.', 45.00, 'Velas', 'https://images.unsplash.com/photo-1602523961358-f9f03dd557db?w=600', 20),
  ('Daga Ritual de Latón', 'Empuñadura grabada a mano con runas protectoras.', 149.00, 'Amuletos', 'https://images.unsplash.com/photo-1589994965851-a8f479c573a4?w=600', 5),
  ('Tarot del Bosque Antiguo', '78 cartas ilustradas con bestiario medieval.', 79.00, 'Grimorios', 'https://images.unsplash.com/photo-1633613286991-611fe299c4be?w=600', 12),
  ('Vela de Protección Negra', 'Carbón activado y salvia, para limpiar espacios.', 39.00, 'Velas', 'https://images.unsplash.com/photo-1602874801007-bd36c0a1d9d3?w=600', 20);

-- Row Level Security: el backend usa la service_role key (bypasea RLS),
-- pero lo activamos igual para que el frontend NUNCA pueda escribir
-- directo a Postgres si en el futuro usas la anon key desde el cliente.
alter table products enable row level security;
alter table contact_messages enable row level security;

create policy "Lectura pública de productos"
  on products for select
  using (true);

create policy "Envío público de mensajes de contacto"
  on contact_messages for insert
  with check (true);