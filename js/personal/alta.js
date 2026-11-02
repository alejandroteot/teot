import { sb } from '../supabase.js';
import { $, toast, errorMsg, conBloqueo } from '../utils.js';
import { registrar } from '../datos/movimientos.js';
import { agregarFotos } from './stock-acciones.js';

// Carga de producto nuevo. Si tiene stock inicial, queda registrado como alta.
export function initAlta(){
  $('#form-producto').addEventListener('submit', e => {
    e.preventDefault();
    conBloqueo(async () => {
      const nombre = $('#p-nombre').value.trim();
      const precio = parseFloat($('#p-precio').value);
      const costo = parseFloat($('#p-costo').value);
      const stock = parseInt($('#p-stock').value, 10);
      const categoria_id = $('#p-categoria').value || null;
      const ofertaRaw = $('#p-oferta').value.trim();
      const precio_oferta = ofertaRaw === '' ? null : parseFloat(ofertaRaw);
      if (!nombre || !Number.isFinite(precio) || precio < 0
          || !Number.isFinite(costo) || costo < 0
          || !Number.isFinite(stock) || stock < 0){
        return toast('Completá nombre, precio, costo y stock válidos.', 'error');
      }
      if (precio_oferta !== null && (!Number.isFinite(precio_oferta) || precio_oferta <= 0 || precio_oferta >= precio)){
        return toast('La oferta tiene que ser un número menor al precio normal.', 'error');
      }
      try {
        const archivos = [...$('#p-foto').files];
        const {data, error} = await sb.from('productos')
          .insert({nombre, precio, costo, stock, categoria_id, precio_oferta})
          .select()
          .single();
        if (error) throw error;
        if (stock > 0){
          await registrar({producto_id: data.id, nombre, tipo: 'alta', cantidad: stock, precio, costo, total: 0});
        }
        if (archivos.length) await agregarFotos(data.id, archivos);
        e.target.reset();
        toast(`"${nombre}" agregado al catálogo.`);
      } catch (err) {
        toast(errorMsg(err), 'error');
      }
    });
  });
}
