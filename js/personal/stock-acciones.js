import { sb } from '../supabase.js';
import { estado } from '../estado.js';
import { num, errorMsg, toast, conBloqueo, pedirConfirmacion } from '../utils.js';
import { fotosDe } from '../datos/fotos.js';
import { subirFoto } from './fotos.js';

const MENSAJE = {entrada: 'Stock sumado.', salida: 'Stock restado.', venta: 'Venta registrada.'};

// Sumar, restar o vender. La función de la base valida el stock y registra el movimiento.
export async function ajustar(id, tipo){
  const p = estado.productos.find(x => x.id === id);
  if (!p) return;
  const cant = Math.floor(Number(estado.cantidades[id] ?? 1));
  if (!(cant > 0)) return toast('La cantidad tiene que ser mayor a cero.', 'error');
  if (tipo !== 'entrada' && cant > num(p.stock)){
    return toast(`Solo hay ${num(p.stock)} de ${p.nombre} en stock.`, 'error');
  }
  const {error} = await sb.rpc('ajustar_stock', {p_id: id, p_tipo: tipo, p_cantidad: cant});
  if (error) return toast(errorMsg(error), 'error');
  toast(MENSAJE[tipo]);
}

export async function guardarPrecios(boton){
  const fila = boton.closest('.fila');
  const id = boton.dataset.id;
  const precio = parseFloat(fila.querySelector('[data-precio]').value);
  const costo = parseFloat(fila.querySelector('[data-costo]').value);
  if (!Number.isFinite(precio) || precio < 0 || !Number.isFinite(costo) || costo < 0){
    return toast('Precio y costo tienen que ser números válidos.', 'error');
  }
  const {error} = await sb.from('productos').update({precio, costo}).eq('id', id);
  if (error) return toast(errorMsg(error), 'error');
  toast('Precios actualizados.');
}

export function pedirEliminar(boton){
  pedirConfirmacion(boton, 'Eliminar', () => conBloqueo(() => eliminarProducto(boton.dataset.id)));
}

async function eliminarProducto(id){
  const p = estado.productos.find(x => x.id === id);
  const {error} = await sb.from('productos').delete().eq('id', id);
  if (error) return toast(errorMsg(error), 'error');
  delete estado.cantidades[id];
  estado.seleccion.delete(id);
  toast(`"${p ? p.nombre : 'Producto'}" eliminado del catálogo.`);
}

// Agrega fotos a la galería del producto, después de las que ya tiene
export async function agregarFotos(productoId, archivos){
  const lista = fotosDe(productoId);
  let orden = lista.length ? Math.max(...lista.map(f => f.orden)) + 1 : 0;
  let subidas = 0;
  for (const archivo of archivos){
    try {
      const imagen_path = await subirFoto(archivo);
      const {error} = await sb.from('producto_fotos').insert({producto_id: productoId, imagen_path, orden});
      if (error) throw error;
      orden++;
      subidas++;
    } catch {
      toast(`No se pudo cargar "${archivo.name}".`, 'error');
    }
  }
  if (subidas) toast(subidas === 1 ? 'Foto agregada.' : `${subidas} fotos agregadas.`);
}

// Sirve tanto para un producto como para varios marcados. Devuelve true si salió bien.
export async function cambiarCategoria(ids, categoria_id){
  const {error} = await sb.from('productos').update({categoria_id}).in('id', ids);
  if (error){
    toast(errorMsg(error), 'error');
    return false;
  }
  toast(ids.length === 1 ? 'Categoría actualizada.' : `${ids.length} productos movidos.`);
  return true;
}
