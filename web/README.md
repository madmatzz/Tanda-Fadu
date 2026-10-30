# Tanda · app sin frameworks

App oficial hecha con HTML, CSS y JavaScript común, con dos vistas: la del estudiante y la de
la imprenta. No hay que instalar nada: se abre `index.html` (estudiante) o `imprenta/index.html`
(imprenta) en el navegador. Los datos de la demo se guardan en el navegador (localStorage) y
los comparten las dos vistas: lo que hace la imprenta (imprimir, cargar un aviso, cambiar el
stock) lo ve el estudiante, y al revés. Desde el "Menú demo" se pasa de una vista a la otra.

## Pantallas del estudiante

Cada pantalla es un archivo HTML con su script en `js/pages/`:

| Archivo | Pantalla |
|---|---|
| `index.html` | Inicio |
| `imprimir.html` | Nueva impresión (subir archivo) |
| `especificaciones.html` | Especificaciones y pedidos especiales |
| `validacion.html` | Validación, ajuste y resumen del archivo |
| `comparar.html` | ¿Dónde imprimir? (comparar locales) |
| `pago.html` | Selección de pago |
| `confirmado.html` | Pedido confirmado (ticket digital) |
| `pedido.html` | Tu pedido (seguimiento y colas) |
| `pedidos.html` | Mis pedidos |
| `detalle-pedido.html` | Detalle de un pedido entregado |
| `locales.html` | ¿Dónde imprimir? (mapa por pisos y lista de locales) |
| `local.html` | Perfil de un local |
| `tandas.html` | Tandas disponibles |
| `tanda.html` | Tu tanda coincide |
| `avisos.html` | Avisos de los locales |
| `perfil.html` | Mi perfil |

## Pantallas de la imprenta

Están en `imprenta/`, con su script en `js/pages/imprenta/`. Administran El Poli:

| Archivo | Pantalla |
|---|---|
| `imprenta/index.html` | Panel: resumen del día, cola presencial, stock, reseñas y avisos |
| `imprenta/cola.html` | Cola virtual: el pedido que se imprime, los que esperan y los que hay que entregar |
| `imprenta/tandas.html` | Tandas del local |
| `imprenta/tanda.html` | Detalle de una tanda, con la impresora y el botón para imprimirla |
| `imprenta/local.html` | Mi local: vista previa del perfil y datos editables |
| `imprenta/stock.html` | Stock de papel |
| `imprenta/resenas.html` | Reseñas y respuestas |

La imprenta se ve en **modo oscuro**, como el "detrás de escena" de la app. No tiene estilos
aparte: cada HTML lleva `<html class="theme-imprenta">`, y en `css/tokens.css` esa clase
redefine los colores (fondos oscuros, tinta clara). Por eso todos los componentes sirven en
las dos vistas. Además, cada HTML de `imprenta/` lleva `<base href="../">`: todas sus rutas
(estilos, scripts, imágenes y links) se escriben desde la carpeta `web/`.

## Cómo está organizado

```
css/
  tokens.css       colores, tipografía, radios, espacios y sombras (el sistema visual)
  base.css         reset, marco del teléfono y utilidades de texto y layout
  components.css   botones, tarjetas, campos, chips, paneles…
  screens.css      estilos propios de cada pantalla
js/
  icons.js         íconos de Lucide como SVG
  logic.js         precios, validación de archivos, tiempos y búsquedas
  data.js          datos ficticios: locales, tandas, pedidos, avisos y reseñas
  store.js         estado de la demo y las acciones que lo cambian
  ui.js            componentes: cada función devuelve el HTML de un componente
  app.js           dibuja la pantalla y conecta los clics y campos con las acciones
  sheets.js        paneles compartidos: menú demo e informar cola
  imprenta.js      piezas de la vista de imprenta: navegación, filas de pedidos y paneles
  floors.js        planos de los pisos de la FADU (trazos copiados de img/mapas)
  pages/           una pantalla por archivo (pages/imprenta/ para la imprenta)
imprenta/          los HTML de la vista de imprenta
img/, fonts/       imágenes (logos de Tanda, favicon) y la fuente Inter
img/locales/       foto y logo de cada local
img/mapas/         planos originales de cada piso en SVG (muros y patios)
```

### El mapa de locales

`locales.html` dibuja los planos de `js/floors.js` como SVG dentro de la página, así se
pueden pintar con los colores de `tokens.css`. Si se corrige un plano en `img/mapas/`,
hay que copiar el atributo `d` de sus capas de muros y patios a `floors.js`.
La ubicación y el color de cada local en el plano están en `data.js` (`map: { floor, x, y, color }`,
con `x` e `y` entre 0 y 1 sobre el plano).

### Cómo funciona una pantalla

Cada archivo de `js/pages/` llama a `App.start({ render, actions })`:

- `render()` devuelve el HTML de la pantalla armado con los componentes de `ui.js`.
  Se vuelve a dibujar solo cada vez que cambia el estado.
- `actions` son las funciones que se disparan desde el HTML:
  - `data-action="nombre"` al hacer clic,
  - `data-input="nombre"` al escribir en un campo,
  - `data-change="nombre"` al elegir una opción, una casilla o un archivo.
- Una zona con `data-scroll` (y un `id`) scrollea en vertical arrastrando con el mouse; con
  `data-scroll-x` scrollea en horizontal, como el carrusel de tandas. En los dos casos mantiene
  su scroll al redibujar. Una zona con `data-gesture` maneja sus propios arrastres (el mapa).

Para cambiar un color o una medida, se edita `css/tokens.css` y se actualiza en toda la app.
