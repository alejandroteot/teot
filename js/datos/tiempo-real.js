import { sb } from '../supabase.js';

// Cuando cambia algo en la base, avisa para que cada pantalla se actualice sola.
export function escucharCambios({onCategorias, onProductos, onFotos, onPedidos, onMovimientos}){
  sb.channel('cambios-catalogo')
    .on('postgres_changes', {event: '*', schema: 'public', table: 'categorias'}, () => onCategorias())
    .on('postgres_changes', {event: '*', schema: 'public', table: 'productos'}, () => onProductos())
    .on('postgres_changes', {event: '*', schema: 'public', table: 'producto_fotos'}, () => onFotos())
    .on('postgres_changes', {event: '*', schema: 'public', table: 'pedidos'}, () => onPedidos())
    .on('postgres_changes', {event: '*', schema: 'public', table: 'movimientos'}, () => onMovimientos())
    .subscribe();
}
