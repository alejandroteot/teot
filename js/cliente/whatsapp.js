import { WA_NUMERO } from '../config.js';
import { precioFinal } from '../utils.js';

// Texto del pedido, una línea por producto y el total al final.
export function mensajePedido(items, total){
  const fmt2 = v => Number.isInteger(v) ? String(v) : v.toFixed(2);
  const lineas = items.map(({p, c}) => `-${c} ${p.nombre} ${fmt2(precioFinal(p) * c)}`);
  return ['Hola! mi pedido es', ...lineas, `total ${fmt2(total)}`].join('\n');
}

export function urlWhatsapp(items, total){
  return `https://api.whatsapp.com/send?phone=${WA_NUMERO}&text=${encodeURIComponent(mensajePedido(items, total))}`;
}

// Abre WhatsApp con el pedido. Tiene que llamarse dentro del clic del usuario.
export function abrirWhatsapp(items, total){
  const enlace = document.createElement('a');
  enlace.href = urlWhatsapp(items, total);
  enlace.target = '_blank';
  enlace.rel = 'noopener';
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
}
