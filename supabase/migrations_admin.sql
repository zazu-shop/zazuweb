-- Ejecuta esto en Supabase: Dashboard > SQL Editor > New query

-- Lectura y actualización de pedidos: SOLO para usuarios autenticados
-- (tu futuro login de admin). El público sigue pudiendo CREAR pedidos
-- (política ya existente en migrations_pedidos.sql), pero no puede leerlos
-- ni modificarlos.
create policy "Lectura de pedidos solo admin autenticado"
  on orders for select
  using (auth.role() = 'authenticated');

create policy "Actualización de pedidos solo admin autenticado"
  on orders for update
  using (auth.role() = 'authenticated');

create policy "Lectura de items de pedido solo admin autenticado"
  on order_items for select
  using (auth.role() = 'authenticated');