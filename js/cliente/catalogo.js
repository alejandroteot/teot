import { estado } from '../estado.js';
import { $, ars, esc, num } from '../utils.js';
import { urlFoto } from '../config.js';
import { fotosDe } from '../datos/fotos.js';
import { renderCarrito } from './carrito.js';
import { abrirVisor } from './visor.js';

export function nombreCategoria(){
  const sel = estado.categoriaSeleccionada;
  if (sel === 'todas') return 'Todas las categorías';
  if (sel === 'sin') return 'Sin categoría';
  return estado.categorias.find(c => c.id === sel)?.nombre || 'Todas las categorías';
}

function enCategoria(p){
  const sel = estado.categoriaSeleccionada;
  if (sel === 'todas') return true;
  if (sel === 'sin') return !p.categoria_id;
  return p.categoria_id === sel;
}

export function renderCatalogo(){
  const q = $('#buscar').value.trim().toLowerCase();
  // Los productos sin stock quedan al final; dentro de cada grupo siguen por nombre
  const lista = estado.productos
    .filter(enCategoria)
    .filter(p => !q || String(p.nombre).toLowerCase().includes(q))
    .sort((a, b) => (num(b.stock) > 0) - (num(a.stock) > 0));

  $('#titulo-categoria').textContent = nombreCategoria();

  let vacio = 'No hay productos en esta categoría.';
  if (!estado.productos.length) vacio = 'Todavía no hay productos cargados.';
  else if (q) vacio = 'No hay productos con ese nombre.';

  $('#grilla').innerHTML = lista.length ? lista.map(tarjeta).join('') : `<p class="vacio">${vacio}</p>`;
  renderCarrito();
}

function tarjeta(p){
  const stock = num(p.stock), en = estado.carrito[p.id] || 0;
  const fotos = fotosDe(p.id);
  const media = fotos.length
    ? `<img class="foto" src="${esc(urlFoto(fotos[0].imagen_path))}" alt="${esc(p.nombre)}" loading="lazy">`
    : `<div class="sin-foto" aria-hidden="true">${esc(String(p.nombre).charAt(0).toUpperCase())}</div>`;
  const mas = fotos.length > 1 ? `<span class="mas-fotos">+${fotos.length - 1} fotos</span>` : '';
  const botones = en
    ? `<button class="btn" data-accion="restar" data-id="${esc(p.id)}" aria-label="Quitar uno">−</button>
       <span>${en}</span>
       <button class="btn" data-accion="sumar" data-id="${esc(p.id)}" aria-label="Agregar uno" ${en >= stock ? 'disabled' : ''}>+</button>`
    : `<button class="btn primario" data-accion="sumar" data-id="${esc(p.id)}" ${stock <= 0 ? 'disabled' : ''}>Comprar</button>`;
  return `<article class="card">
    <div class="media" data-ver="${esc(p.id)}">
      ${media}
      <span class="pill ${stock > 0 ? 'ok' : 'no'}">${stock > 0 ? 'Disponible' : 'Sin stock'}</span>
      ${mas}
    </div>
    <div class="cuerpo">
      <h3 data-ver="${esc(p.id)}">${esc(p.nombre)}</h3>
      <p class="precio">${ars.format(num(p.precio))}</p>
      <div class="acciones">${botones}</div>
    </div>
  </article>`;
}

export function initCatalogo(){
  $('#buscar').addEventListener('input', renderCatalogo);

  $('#grilla').addEventListener('click', e => {
    // Tocar la foto o el nombre abre el visor
    const ver = e.target.closest('[data-ver]');
    if (ver){
      abrirVisor(ver.dataset.ver);
      return;
    }
    const b = e.target.closest('button[data-accion]');
    if (!b) return;
    const p = estado.productos.find(x => x.id === b.dataset.id);
    if (!p) return;
    const c = estado.carrito[p.id] || 0;
    if (b.dataset.accion === 'sumar'){
      if (c < num(p.stock)) estado.carrito[p.id] = c + 1;
    } else if (c > 1){
      estado.carrito[p.id] = c - 1;
    } else {
      delete estado.carrito[p.id];
    }
    renderCatalogo();
  });

  // El carrito avisa cuando se vacía después de un pedido
  document.addEventListener('carrito:cambio', renderCatalogo);
  // El menú avisa cuando el cliente elige una categoría
  document.addEventListener('categoria:cambio', renderCatalogo);
}
