import { estado } from '../estado.js';
import { $, ars, precioFinal } from '../utils.js';
import { urlFoto } from '../config.js';
import { fotosDe } from '../datos/fotos.js';

let fotos = [];      // rutas de las fotos del producto que se está viendo
let indice = 0;
let titulo = '';
let inicioX = null;

// Abre la foto a pantalla completa con todas las fotos del producto
export function abrirVisor(productoId){
  const lista = fotosDe(productoId);
  if (!lista.length) return;
  const p = estado.productos.find(x => x.id === productoId);
  fotos = lista.map(f => f.imagen_path);
  indice = 0;
  titulo = p ? `${p.nombre} · ${ars.format(precioFinal(p))}` : '';
  renderVisor();
  $('#visor').hidden = false;
  document.body.style.overflow = 'hidden';
}

export function cerrarVisor(){
  $('#visor').hidden = true;
  document.body.style.overflow = '';
}

function renderVisor(){
  const multi = fotos.length > 1;
  $('#visor-img').src = urlFoto(fotos[indice]);
  $('#visor-img').alt = titulo;
  $('#visor-titulo').textContent = titulo;
  $('#visor-puntos').innerHTML = multi
    ? fotos.map((_, i) => `<span class="${i === indice ? 'activo' : ''}"></span>`).join('')
    : '';
  $('#visor-ant').hidden = !multi;
  $('#visor-sig').hidden = !multi;
}

function mover(delta){
  if (fotos.length < 2) return;
  indice = (indice + delta + fotos.length) % fotos.length;
  renderVisor();
}

export function initVisor(){
  $('#visor-cerrar').addEventListener('click', cerrarVisor);
  $('#visor-ant').addEventListener('click', () => mover(-1));
  $('#visor-sig').addEventListener('click', () => mover(1));

  // Tocar el fondo (fuera de la foto) cierra el visor
  $('#visor').addEventListener('click', e => {
    if (e.target.id === 'visor' || e.target.id === 'visor-escena') cerrarVisor();
  });

  // Deslizar con el dedo para cambiar de foto
  const escena = $('#visor-escena');
  escena.addEventListener('touchstart', e => {
    inicioX = e.touches[0].clientX;
  }, {passive: true});
  escena.addEventListener('touchend', e => {
    if (inicioX === null) return;
    const dx = e.changedTouches[0].clientX - inicioX;
    inicioX = null;
    if (Math.abs(dx) > 50) mover(dx < 0 ? 1 : -1);
  });

  // En computadora: flechas del teclado y Escape
  document.addEventListener('keydown', e => {
    if ($('#visor').hidden) return;
    if (e.key === 'Escape') cerrarVisor();
    if (e.key === 'ArrowLeft') mover(-1);
    if (e.key === 'ArrowRight') mover(1);
  });
}
