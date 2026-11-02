import { sb } from '../supabase.js';
import { estado } from '../estado.js';
import { errorMsg, toast } from '../utils.js';

// Trae todas las fotos y las agrupa por producto, en el orden en que se muestran
export async function cargarFotos(){
  const {data, error} = await sb.from('producto_fotos').select('*').order('orden', {ascending: true});
  if (error){
    toast(errorMsg(error), 'error');
    return false;
  }
  const mapa = {};
  for (const f of data){
    if (!mapa[f.producto_id]) mapa[f.producto_id] = [];
    mapa[f.producto_id].push(f);
  }
  estado.fotos = mapa;
  return true;
}

// Fotos de un producto ([] si no tiene)
export function fotosDe(productoId){
  return estado.fotos[productoId] || [];
}
