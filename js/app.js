import { estado } from './estado.js';
import { aviso } from './utils.js';
import { cargarCategorias } from './datos/categorias.js';
import { cargarProductos } from './datos/productos.js';
import { cargarFotos } from './datos/fotos.js';
import { cargarPedidos } from './datos/pedidos.js';
import { cargarMovimientos } from './datos/movimientos.js';
import { escucharCambios } from './datos/tiempo-real.js';
import { renderCatalogo, initCatalogo } from './cliente/catalogo.js';
import { initCarrito } from './cliente/carrito.js';
import { initMenu } from './cliente/menu.js';
import { initVisor } from './cliente/visor.js';
import { haySesion, initSesion } from './personal/sesion.js';
import { renderPedidos, initPedidos } from './personal/pedidos.js';
import { renderStock, initStock } from './personal/stock.js';
import { initAlta } from './personal/alta.js';
import { renderCategoriasAdmin, renderSelectsCategorias, initCategorias } from './personal/categorias.js';
import { renderGaleria, initGaleria } from './personal/galeria.js';
import { renderMovimientos } from './personal/movimientos.js';
import { renderFinanzas, initFinanzas } from './finanzas/vista.js';

async function refrescarCategorias(){
  if (!(await cargarCategorias())) return;
  // Si la categoría elegida ya no existe, vuelve a "Todas"
  const sel = estado.categoriaSeleccionada;
  if (sel !== 'todas' && sel !== 'sin' && !estado.categorias.some(c => c.id === sel)){
    estado.categoriaSeleccionada = 'todas';
  }
  renderCatalogo();
  if (estado.isStaff){
    renderSelectsCategorias();
    renderCategoriasAdmin();
    renderStock();
  }
}

async function refrescarProductos(){
  if (!(await cargarProductos())) return;
  renderCatalogo();
  if (estado.isStaff){
    renderStock();
    renderCategoriasAdmin();
    renderGaleria();
  }
}

async function refrescarFotos(){
  if (!(await cargarFotos())) return;
  renderCatalogo();
  if (estado.isStaff){
    renderStock();
    renderGaleria();
  }
}

async function refrescarPedidos(){
  if (!estado.isStaff) return;
  if (!(await cargarPedidos())) return;
  renderPedidos();
}

async function refrescarMovimientos(){
  if (!estado.isStaff) return;
  if (!(await cargarMovimientos())) return;
  renderMovimientos();
  renderFinanzas();
}

async function entrarPersonal(){
  renderSelectsCategorias();
  renderCategoriasAdmin();
  renderStock();
  renderGaleria();
  await refrescarPedidos();
  await refrescarMovimientos();
}

function salirPersonal(){
  estado.pedidos = [];
  estado.movimientos = [];
  renderCatalogo();
}

async function iniciar(){
  initCatalogo();
  initMenu();
  initVisor();
  initCarrito();
  initSesion({onEntrar: entrarPersonal, onSalir: salirPersonal});
  initPedidos();
  initStock();
  initAlta();
  initCategorias();
  initGaleria();
  initFinanzas();

  estado.isStaff = await haySesion();
  await refrescarCategorias();
  await refrescarProductos();
  await refrescarFotos();
  if (estado.isStaff) await entrarPersonal();

  escucharCambios({
    onCategorias: refrescarCategorias,
    onProductos: refrescarProductos,
    onFotos: refrescarFotos,
    onPedidos: refrescarPedidos,
    onMovimientos: refrescarMovimientos,
  });
  aviso('');
}

iniciar();
