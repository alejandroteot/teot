import { sb } from '../supabase.js';
import { estado } from '../estado.js';
import { $, esc, toast, errorMsg, conBloqueo, pedirConfirmacion } from '../utils.js';
import { urlFoto, BUCKET } from '../config.js';
import { fotosDe } from '../datos/fotos.js';

// Panel "Fotos de productos": elegís un producto y administrás su galería
export function renderGaleria(){
  const sel = $('#galeria-producto');
  const actual = sel.value;
  sel.innerHTML = estado.productos.length
    ? estado.productos.map(p =>
        `<option value="${esc(p.id)}">${esc(p.nombre)} (${fotosDe(p.id).length})</option>`).join('')
    : '<option value="">Sin productos</option>';
  if (actual && estado.productos.some(p => p.id === actual)) sel.value = actual;

  const id = sel.value;
  const fotos = id ? fotosDe(id) : [];
  $('#galeria-fotos').innerHTML = fotos.length
    ? fotos.map((f, i) => `<figure class="foto-admin">
        <img src="${esc(urlFoto(f.imagen_path))}" alt="">
        ${i === 0 ? '<span class="tag-principal">Principal</span>' : ''}
        <div class="acc">
          ${i === 0 ? '' : `<button class="btn" data-accion="principal" data-id="${esc(f.id)}">Hacer principal</button>`}
          <button class="btn borrar" data-accion="borrar-foto" data-id="${esc(f.id)}" data-path="${esc(f.imagen_path)}">Eliminar</button>
        </div>
      </figure>`).join('')
    : `<p class="vacio">${id ? 'Este producto todavía no tiene fotos. Agregalas desde la solapa Stock.' : ''}</p>`;
}

export function initGaleria(){
  $('#galeria-producto').addEventListener('change', renderGaleria);

  $('#galeria-fotos').addEventListener('click', e => {
    const b = e.target.closest('button[data-accion]');
    if (!b) return;
    if (b.dataset.accion === 'principal'){
      conBloqueo(() => hacerPrincipal(b.dataset.id));
    } else {
      pedirConfirmacion(b, 'Eliminar', () => conBloqueo(() => borrarFoto(b.dataset.id, b.dataset.path)));
    }
  });
}

// La foto principal es la de menor orden: se le da un orden menor que el de las demás
async function hacerPrincipal(id){
  const lista = fotosDe($('#galeria-producto').value);
  const minimo = Math.min(...lista.map(f => f.orden));
  const {error} = await sb.from('producto_fotos').update({orden: minimo - 1}).eq('id', id);
  if (error) return toast(errorMsg(error), 'error');
  toast('Foto principal actualizada.');
}

async function borrarFoto(id, path){
  const {error} = await sb.from('producto_fotos').delete().eq('id', id);
  if (error) return toast(errorMsg(error), 'error');
  // Libera el archivo del almacenamiento. Si falla, la foto ya no se muestra igual.
  await sb.storage.from(BUCKET).remove([path]);
  toast('Foto eliminada.');
}
