import { estado } from './estado.js';

export const $ = s => document.querySelector(s);

export const ars = new Intl.NumberFormat('es-AR', {style: 'currency', currency: 'ARS'});

export const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[c]));

export const num = v => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

export const ahora = () => new Date().toISOString();

export const fechaCorta = f => new Date(f).toLocaleString('es-AR', {dateStyle: 'short', timeStyle: 'short'});

export function errorMsg(e){
  const msg = String(e?.message || '');
  if (e?.code === '42501') return 'No tenés permiso para esa acción. Revisá que hayas iniciado sesión.';
  if (e?.code === '23505') return 'Ya existe un registro con ese nombre.';
  if (msg.includes('stock insuficiente')) return 'No hay stock suficiente para esa operación.';
  if (msg.includes('falta stock')) return msg.charAt(0).toUpperCase() + msg.slice(1) + '.';
  if (msg.includes('Invalid login')) return 'Email o contraseña incorrectos.';
  return 'Hubo un problema. Intentá de nuevo.';
}

let toastT;
export function toast(msg, tipo = 'ok'){
  const t = $('#toast');
  t.textContent = msg;
  t.className = 'toast' + (tipo === 'error' ? ' error' : '');
  t.hidden = false;
  clearTimeout(toastT);
  toastT = setTimeout(() => { t.hidden = true; }, 3500);
}

export function aviso(txt){ $('#aviso').textContent = txt; }

export function mostrar(vista){
  $('#cliente').hidden = vista !== 'cliente';
  $('#login').hidden = vista !== 'login';
  $('#personal').hidden = vista !== 'personal';
  $('#pie').hidden = vista !== 'cliente';
  window.scrollTo(0, 0);
}

// Evita que una misma acción se dispare dos veces mientras corre.
// Se llama directo desde el clic, así las acciones que abren WhatsApp
// siguen dentro del gesto del usuario.
export async function conBloqueo(fn){
  if (estado.ocupado) return;
  estado.ocupado = true;
  try { await fn(); } finally { estado.ocupado = false; }
}

// Primer toque: el botón pide confirmar. Segundo toque dentro de 4 segundos: ejecuta.
export function pedirConfirmacion(boton, textoBase, ejecutar){
  if (boton.dataset.confirmar !== '1'){
    boton.dataset.confirmar = '1';
    boton.textContent = '¿Seguro? Tocá de nuevo';
    boton.classList.add('peligro');
    clearTimeout(boton._t);
    boton._t = setTimeout(() => {
      boton.dataset.confirmar = '';
      boton.textContent = textoBase;
      boton.classList.remove('peligro');
    }, 4000);
    return;
  }
  ejecutar();
}

// Precio que paga el cliente: el de oferta si existe y es menor al normal
export function precioFinal(p){
  const normal = num(p.precio), oferta = num(p.precio_oferta);
  return oferta > 0 && oferta < normal ? oferta : normal;
}

// Porcentaje de descuento (0 si no hay oferta)
export function porcentajeOff(p){
  const normal = num(p.precio), final = precioFinal(p);
  if (normal <= 0 || final >= normal) return 0;
  return Math.round((1 - final / normal) * 100);
}
