# Catálogo y stock

Página pública de catálogo para clientes (con pedido por WhatsApp) y panel del personal
para stock, pedidos, alta de productos y finanzas. Los datos viven en Supabase.

## Estructura

```
index.html              Estructura de la página
css/
  base.css              Colores, tipografía, botones y paneles
  cliente.css           Catálogo, tarjetas y carrito
  personal.css          Panel del personal
  finanzas.css          Solapa de finanzas
js/
  config.js             Conexión a Supabase y número de WhatsApp
  supabase.js           Cliente de Supabase
  estado.js             Estado compartido de la página
  utils.js              Funciones comunes (formato, mensajes, navegación)
  app.js                Arranque: conecta todas las partes
  datos/                Lectura y escritura de la base
    productos.js
    pedidos.js
    movimientos.js
    tiempo-real.js      Actualización en vivo entre dispositivos
  cliente/              Vista de clientes
    catalogo.js         Grilla de productos y búsqueda
    carrito.js          Carrito, confirmar pedido y copiar mensaje
    whatsapp.js         Texto del pedido y enlace de WhatsApp
  personal/             Panel del personal
    sesion.js           Inicio y cierre de sesión
    pedidos.js          Entregar o cancelar pedidos
    stock.js            Solapa Stock (armado de la tabla y eventos)
    stock-acciones.js   Sumar, restar, vender, precios, fotos y eliminar
    alta.js             Cargar producto nuevo
    fotos.js            Compresión y subida de fotos
    movimientos.js      Lista de movimientos recientes
  finanzas/
    meses.js            Agrupación por mes y lista de los últimos 12 meses
    calculo.js          Ventas, costos, ganancia y compras por mes
    csv.js              Exportación a CSV
    vista.js            Selector de mes y tarjetas de finanzas
supabase/
  setup.sql             Tablas, reglas de seguridad, funciones y almacenamiento
scripts/
  publicar.sh           Sube el proyecto a GitHub y activa GitHub Pages
```

## Puesta en marcha

1. En Supabase, ejecutá `supabase/setup.sql` en **SQL Editor**.
2. En **Authentication**, desactivá el registro de nuevos usuarios y creá el usuario del personal.
3. Creá un repositorio público vacío en GitHub.
4. Abrí un Codespace desde ese repositorio y subí la carpeta del proyecto.
5. Desde la terminal de Codespaces, en la raíz del proyecto, ejecutá:

   ```bash
   bash scripts/publicar.sh
   ```

   Al final muestra la dirección de la página.

## Probar en local

```bash
python3 -m http.server 8000
```

Después abrí el puerto 8000 desde la pestaña **Ports** de Codespaces.

## Hacer cambios

- **Número de WhatsApp:** `js/config.js`.
- **Colores y diseño:** `css/base.css`.
- **Una función concreta:** buscala en su archivo dentro de `js/`. Cada módulo tiene una sola responsabilidad.
- **Nueva tabla, regla o función de la base:** agregala a `supabase/setup.sql` y ejecutala en Supabase.

Para publicar cualquier cambio, volvé a ejecutar `bash scripts/publicar.sh`. GitHub Pages actualiza la página sola.

## Seguridad

- En `js/config.js` solo va la clave pública (anon). La clave `service_role` nunca va en el proyecto.
- Las reglas de la base (`supabase/setup.sql`) son las que impiden que cualquiera cambie stock o precios.
- La contraseña del personal no está en ningún archivo: se valida en Supabase Auth.

## Categorías

- Se crean, renombran y eliminan desde el panel del personal, en la sección **Categorías**.
- Al eliminar una categoría, sus productos quedan sin categoría. No se borran.
- Para asignar productos: en la solapa **Stock**, cada producto tiene su selector de categoría, o podés marcar varios con las casillas y usar **Mover seleccionados**.
- El cliente elige categoría desde el botón de tres líneas, arriba a la izquierda del catálogo.
- Archivos: `supabase/categorias.sql` (base), `js/datos/categorias.js`, `js/cliente/menu.js`, `js/personal/categorias.js`, `css/categorias.css`.

## Galería de fotos

- Cada producto puede tener varias fotos. La primera es la principal y es la que se ve en el catálogo.
- En la solapa **Stock**, el botón **Agregar fotos** suma fotos sin reemplazar las que ya están. Se pueden elegir varias a la vez.
- En el panel **Fotos de productos** se elige un producto para ver sus fotos, cambiar la principal o eliminar alguna.
- En el catálogo, tocar la foto o el nombre abre el visor a pantalla completa. Se desliza con el dedo, o con las flechas en computadora.
- Archivos: `supabase/fotos.sql` (base, correr después de `categorias.sql`), `js/datos/fotos.js`, `js/cliente/visor.js`, `js/personal/galeria.js`, `css/visor.css`.

## Ofertas

- En la solapa **Stock** (y en el alta de producto) se puede cargar un **precio de oferta** opcional. Tiene que ser menor al precio normal. Para quitar la oferta, se borra el campo.
- En el catálogo, el precio normal aparece tachado en gris, al lado el precio de oferta y el porcentaje de descuento en verde.
- El carrito, el mensaje de WhatsApp y las ventas usan el precio final.
- Archivos: `supabase/ofertas.sql` (base, correr después de `fotos.sql`), `css/ofertas.css`.
