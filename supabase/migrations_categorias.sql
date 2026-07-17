-- Ejecuta esto en Supabase: Dashboard > SQL Editor > New query
-- (Es seguro volver a correrlo aunque ya tengas la tabla products creada:
-- los "if not exists" e "if exists" evitan errores de duplicado.)

alter table products add column if not exists category text default 'General';
alter table products add column if not exists image_url text;
alter table products add column if not exists stock integer default 10;

-- Actualiza los productos de ejemplo con categoría e imagen placeholder
update products set category = 'Amuletos', image_url = 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=600'
  where name = 'Amuleto de Cuervo Negro';
update products set category = 'Grimorios', image_url = 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=600'
  where name = 'Grimorio de Bolsillo';
update products set category = 'Velas', image_url = 'https://images.unsplash.com/photo-1602523961358-f9f03dd557db?w=600'
  where name = 'Vela de Vigilia Púrpura';

-- Más piezas de ejemplo para probar filtros con varias categorías
insert into products (name, description, price, category, image_url, stock) values
  ('Daga Ritual de Latón', 'Empuñadura grabada a mano con runas protectoras.', 149.00, 'Amuletos', 'https://images.unsplash.com/photo-1589994965851-a8f479c573a4?w=600', 5),
  ('Tarot del Bosque Antiguo', '78 cartas ilustradas con bestiario medieval.', 79.00, 'Grimorios', 'https://images.unsplash.com/photo-1633613286991-611fe299c4be?w=600', 12),
  ('Vela de Protección Negra', 'Carbón activado y salvia, para limpiar espacios.', 39.00, 'Velas', 'https://images.unsplash.com/photo-1602874801007-bd36c0a1d9d3?w=600', 20),
  ('Copa de Peltre Grabada', 'Réplica artesanal de copa ceremonial medieval.', 99.00, 'Amuletos', 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600', 8)
on conflict do nothing;

-- Índice para acelerar el filtro por categoría
create index if not exists idx_products_category on products (category);