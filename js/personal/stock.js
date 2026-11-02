import { estado } from '../estado.js';
import { $, ars, esc, num, toast, conBloqueo } from '../utils.js';
import { urlFoto } from '../config.js';
import { fotosDe } from '../datos/fotos.js';
import { opcionesCategorias } from './categorias.js';
import { ajustar, guardarPrecios, pedirEliminar, agregarFotos, cambiarCategoria } from './stock-acciones.js';

export function renderStock(){
  // Quita de la selección los productos que ya no existen
  estado.seleccion = new Set([...estado.seleccion].filter(id => estado.productos.some(p => p.id === id)));
  $('#tabla-stock').innerHTML = estado.productos.length
    ? estado.productos.map(filaProducto).join('')
    : '<p class="vacio">Todavía no hay productos. Cargá el primero arriba.</p>';
  actualizarBarra();
}

// Actualiza el contador de la barra de selección
export function actualizarBarra(){
  const n = estado.seleccion.size;
  $('#sel-count').textContent = n === 1 ? '1 seleccionado' : `${n} seleccionados`;
  $('#sel-todos').checked = estado.productos.length > 0 && n === estado.productos.length;
}

function filaProducto(p){
  const marcado = estado.seleccion.has(p.id) ? 'checked' : '';
  const portada = fotosDe(p.id)[0];
  return `<div class="fila">
    <label class="sel-wrap"><input type="checkbox" class="sel" data-sel="${esc(p.id)}" ${marcado} aria-label="Seleccionar ${esc(p.nombre)}"></label>
    <div class="info"><strong>${esc(p.nombre)}</strong><span>${ars.format(num(p.precio))} · stock: <b>${num(p.stock)}</b> · fotos: <b>${fotosDe(p.id).length}</b></span></div>
    <div class="precios">
      <label>Categoría <select data-categoria="${esc(p.id)}">${opcionesCategorias(p.categoria_id)}</select></label>
      <label>Costo $ <input type="number" min="0" step="0.01" data-costo="${esc(p.id)}" value="${num(p.costo)}"></label>
      <label>Precio $ <input type="number" min="0" step="0.01" data-precio="${esc(p.id)}" value="${num(p.precio)}"></label>
      <button class="btn" data-accion="precios" data-id="${esc(p.id)}">Guardar precios</button>
    </div>
    <div class="ctl">
      ${portada ? `<img class="miniatura" src="${esc(urlFoto(portada.imagen_path))}" alt="">` : ''}
      <label class="btn">Agregar fotos<input type="file" accept="image/*" multiple class="archivo" data-foto="${esc(p.id)}"></label>
      <input class="num" type="number" min="1" step="1" data-cant="${esc(p.id)}" value="${esc(estado.cantidades[p.id] ?? 1)}" aria-label="Cantidad">
      <button class="btn" data-accion="entrada" data-id="${esc(p.id)}">Sumar stock</button>
      <button class="btn" data-accion="salida" data-id="${esc(p.id)}">Restar stock</button>
      <button class="btn primario" data-accion="venta" data-id="${esc(p.id)}">Vender</button>
      <button class="btn borrar" data-accion="eliminar" data-id="${esc(p.id)}">Eliminar</button>
    </div>
  </div>`;
}

export function initStock(){
  const tabla = $('#tabla-stock');

  tabla.addEventListener('input', e => {
    const i = e.target.closest('input[data-cant]');
    if (i) estado.cantidades[i.dataset.cant] = i.value;
  });

  tabla.addEventListener('click', e => {
    const b = e.target.closest('button[data-accion]');
    if (!b) return;
    if (b.dataset.accion === 'precios') conBloqueo(() => guardarPrecios(b));
    else if (b.dataset.accion === 'eliminar') pedirEliminar(b);
    else conBloqueo(() => ajustar(b.dataset.id, b.dataset.accion));
  });

  tabla.addEventListener('change', e => {
    const sel = e.target.closest('input[data-sel]');
    if (sel){
      if (sel.checked) estado.seleccion.add(sel.dataset.sel);
      else estado.seleccion.delete(sel.dataset.sel);
      actualizarBarra();
      return;
    }
    const cat = e.target.closest('select[data-categoria]');
    if (cat){
      conBloqueo(() => cambiarCategoria([cat.dataset.categoria], cat.value || null));
      return;
    }
    const inp = e.target.closest('input[data-foto]');
    if (!inp || !inp.files.length) return;
    const archivos = [...inp.files];
    const id = inp.dataset.foto;
    inp.value = '';
    conBloqueo(() => agregarFotos(id, archivos));
  });

  $('#sel-todos').addEventListener('change', e => {
    estado.seleccion = new Set(e.target.checked ? estado.productos.map(p => p.id) : []);
    renderStock();
  });

  $('#mover-btn').addEventListener('click', () => conBloqueo(async () => {
    const ids = [...estado.seleccion];
    if (!ids.length) return toast('Marcá al menos un producto.', 'error');
    const ok = await cambiarCategoria(ids, $('#mover-a').value || null);
    if (ok){
      estado.seleccion = new Set();
      renderStock();
    }
  }));
}
