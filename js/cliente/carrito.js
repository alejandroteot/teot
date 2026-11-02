import { sb } from '../supabase.js';
import { estado } from '../estado.js';
import { $, ars, esc, num, toast, errorMsg, conBloqueo, precioFinal } from '../utils.js';
import { mensajePedido, abrirWhatsapp } from './whatsapp.js';

export function itemsCarrito(){
  return Object.entries(estado.carrito)
    .filter(([, c]) => c > 0)
    .map(([id, c]) => ({p: estado.productos.find(x => x.id === id), c}))
    .filter(x => x.p);
}

function totalDe(items){
  return items.reduce((s, {p, c}) => s + precioFinal(p) * c, 0);
}

export function renderCarrito(){
  const items = itemsCarrito();
  const btn = $('#confirmar');
  const cantidad = items.reduce((s, {c}) => s + c, 0);

  // Barra verde: aparece cuando hay algo en el carrito
  $('#barra-compra').classList.toggle('visible', items.length > 0);
  $('#barra-n').textContent = cantidad;

  if (!items.length){
    $('#carrito').innerHTML = '<p class="vacio">Tu carrito está vacío.</p>';
    btn.disabled = true;
    $('#copiar').disabled = true;
    return;
  }
  const total = totalDe(items);
  $('#carrito').innerHTML = `<ul>${items.map(({p, c}) =>
      `<li><span>${esc(p.nombre)} × ${c}</span><span>${ars.format(precioFinal(p) * c)}</span></li>`).join('')}</ul>
    <div class="total"><span>Total</span><strong>${ars.format(total)}</strong></div>
    <textarea id="mensaje" class="ancho" rows="5" readonly>${esc(mensajePedido(items, total))}</textarea>`;
  btn.disabled = false;
  $('#copiar').disabled = false;
}

export function initCarrito(){
  $('#confirmar').addEventListener('click', () => conBloqueo(confirmarPedido));
  $('#copiar').addEventListener('click', copiarMensaje);
  $('#barra-compra').addEventListener('click', () => {
    $('.carrito').scrollIntoView({behavior: 'smooth', block: 'start'});
  });
}

async function confirmarPedido(){
  const items = itemsCarrito();
  if (!items.length) return;
  const sin = items.filter(({p, c}) => num(p.stock) < c).map(({p}) => p.nombre);
  if (sin.length) return toast(`Sin stock suficiente de: ${sin.join(', ')}`, 'error');

  // Antes de cualquier await, para que el navegador permita abrir WhatsApp
  abrirWhatsapp(items, totalDe(items));

  const {error} = await sb.from('pedidos').insert({
    cliente: 'Pedido web',
    items: items.map(({p, c}) => ({id: p.id, nombre: p.nombre, precio: precioFinal(p), cantidad: c})),
    total: totalDe(items),
    estado: 'pendiente',
  });
  if (error){
    return toast(error.code === '42501'
      ? 'No se pudo registrar el pedido. Igual podés mandarlo por WhatsApp.'
      : errorMsg(error), 'error');
  }
  estado.carrito = {};
  document.dispatchEvent(new Event('carrito:cambio'));
  toast('Pedido listo. Mandalo por WhatsApp para confirmarlo.');
}

function copiarMensaje(){
  const ta = $('#mensaje');
  if (!ta) return;
  ta.focus();
  ta.select();
  ta.setSelectionRange(0, ta.value.length);
  let ok = false;
  try { ok = document.execCommand('copy'); } catch { ok = false; }
  toast(ok
    ? 'Mensaje copiado. Pegalo en el chat de WhatsApp.'
    : 'No se pudo copiar. Seleccioná el texto y copialo a mano.', ok ? 'ok' : 'error');
}
