import { estado } from '../estado.js';
import { $, ars, esc, num, toast, conBloqueo, precioFinal, porcentajeOff } from '../utils.js';
import { urlFoto } from '../config.js';
import { fotosDe } from '../datos/fotos.js';
import { opcionesCategorias } from './categorias.js';
import { ajustar, guardarPrecios, pedirEliminar, agregarFotos, cambiarCategoria } from './stock-acciones.js';

// Quita acentos y mayúsculas para que la búsqueda sea tolerante
function normalizar(texto){
  return String(texto ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

// Productos que coinciden con el buscador (por nombre o por categoría)
export function productosVisibles(){
  const q = normalizar(estado.busquedaStock);
  const nombreCategoria = id => normalizar(estado.categorias.find(c => c.id === id)?.nombre);
  return estado.productos.filter(p =>
    !q || normalizar(p.nombre).includes(q) || nombreCategoria(p.categoria_id).includes(q));
}

export function renderStock(){
  // Quita de la selección los productos que ya no existen
  estado.seleccion = new Set([...estado.seleccion].filter(id => estado.productos.some(p => p.id === id)));

  const visibles = productosVisibles();
  const total = estado.productos.length;
  $('#conteo-stock').textContent = !total ? ''
    : visibles.length === total ? `${total} productos`
    : `Mostrando ${visibles.length} de ${total}`;

  $('#tabla-stock').innerHTML = !total
    ? '<p class="vacio">Todavía no hay productos. Cargá el primero arriba.</p>'
    : visibles.length
      ? visibles.map(filaProducto).join('')
      : '<p class="vacio">No hay productos que coincidan con la búsqueda.</p>';
  actualizarBarra();
}

// Contador de la barra de selección. "Seleccionar visibles" refleja solo la lista filtrada.
export function actualizarBarra(){
  const n = estado.seleccion.size;
  const visibles = productosVisibles();
  const marcados = visibles.filter(p => estado.seleccion.has(p.id)).length;
  $('#sel-count').textContent = n === 1 ? '1 seleccionado' : `${n} seleccionados`;
  $('#sel-todos').checked = visibles.length > 0 && marcados === visibles.length;
}

// Precio para la lista de stock: si hay oferta, muestra el normal y el de oferta
function infoPrecio(p){
  if (porcentajeOff(p) > 0){
    return `${ars.format(num(p.precio))} → <b>${ars.format(precioFinal(p))}</b> (${porcentajeOff(p)}% OFF)`;
  }
  return ars.format(num(p.precio));
}

function filaProducto(p){
  const marcado = estado.seleccion.has(p.id) ? 'checked' : '';
  const portada = fotosDe(p.id)[0];
  return `<div class="fila">
    <label class="sel-wrap"><input type="checkbox" class="sel" data-sel="${esc(p.id)}" ${marcado} aria-label="Seleccionar ${esc(p.nombre)}"></label>
    <div class="info"><strong>${esc(p.nombre)}</strong><span>${infoPrecio(p)} · stock: <b>${num(p.stock)}</b> · fotos: <b>${fotosDe(p.id).length}</b></span></div>
    <div class="precios">
      <label>Categoría <select data-categoria="${esc(p.id)}">${opcionesCategorias(p.categoria_id)}</select></label>
      <label>Costo $ <input type="number" min="0" step="0.01" data-costo="${esc(p.id)}" value="${num(p.costo)}"></label>
      <label>Precio $ <input type="number" min="0" step="0.01" data-precio="${esc(p.id)}" value="${num(p.precio)}"></label>
      <label>Oferta $ <input type="number" min="0" step="0.01" data-oferta="${esc(p.id)}" value="${p.precio_oferta ? num(p.precio_oferta) : ''}" placeholder="sin oferta"></label>
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

  // El buscador filtra la lista sin perder lo que se estaba escribiendo
  $('#buscar-stock').addEventListener('input', e => {
    estado.busquedaStock = e.target.value;
    renderStock();
  });

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

  // Marca o desmarca solo los productos que se ven con el buscador
  $('#sel-todos').addEventListener('change', e => {
    for (const p of productosVisibles()){
      if (e.target.checked) estado.seleccion.add(p.id);
      else estado.seleccion.delete(p.id);
    }
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
