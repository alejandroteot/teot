// Estado compartido de la página. Los módulos leen y escriben acá.
export const estado = {
  isStaff: false,
  ocupado: false,
  productos: [],
  categorias: [],
  fotos: {},                    // { productoId: [ {id, imagen_path, orden}, ... ] }
  pedidos: [],
  movimientos: [],
  carrito: {},                  // { productoId: cantidad }
  cantidades: {},               // cantidad elegida en la solapa Stock
  seleccion: new Set(),         // productos marcados en la solapa Stock
  categoriaSeleccionada: 'todas', // 'todas' | 'sin' | id de una categoría
  mesSeleccionado: null,
};
