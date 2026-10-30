# Tanda / Fadu Print

Prototipo navegable de impresión por tandas para la FADU, hecho **sin frameworks**: HTML, CSS y JavaScript común. La app oficial vive en [`web/`](web/) y no necesita instalación ni build.

Tiene dos vistas que comparten los mismos datos: **estudiante** (quien imprime) e **imprenta** (el local que recibe los pedidos). Lo que hace una lo ve la otra.

## Cómo abrirla

No hace falta instalar nada:

- Estudiante: abrir [`web/index.html`](web/index.html) en el navegador.
- Imprenta: abrir [`web/imprenta/index.html`](web/imprenta/index.html).

Para servirla como en producción (recomendado si el navegador bloquea algo al abrir archivos locales):

```bash
npx serve web
# o
python -m http.server 8000 --directory web
```

Después entrar a `http://localhost:3000/` o `http://localhost:8000/`.

## Pantallas del estudiante

| Archivo | Pantalla |
|---|---|
| `web/index.html` | Inicio |
| `web/imprimir.html` | Nueva impresión (subir archivo) |
| `web/especificaciones.html` | Especificaciones y pedidos especiales |
| `web/validacion.html` | Validación, ajuste y resumen del archivo |
| `web/comparar.html` | ¿Dónde imprimir? (comparar locales) |
| `web/pago.html` | Selección de pago |
| `web/confirmado.html` | Pedido confirmado (ticket digital) |
| `web/pedido.html` | Tu pedido (seguimiento y colas) |
| `web/pedidos.html` | Mis pedidos |
| `web/detalle-pedido.html` | Detalle de un pedido entregado |
| `web/locales.html` | ¿Dónde imprimir? (mapa por pisos y lista de locales) |
| `web/local.html` | Perfil de un local |
| `web/tandas.html` | Tandas disponibles |
| `web/tanda.html` | Tu tanda coincide |
| `web/avisos.html` | Avisos de los locales |
| `web/perfil.html` | Mi perfil |

## Pantallas de la imprenta

Están en `web/imprenta/`, con su script en `web/js/pages/imprenta/`. Administran El Poli:

| Archivo | Pantalla |
|---|---|
| `web/imprenta/index.html` | Panel: resumen del día, cola presencial, stock, reseñas y avisos |
| `web/imprenta/cola.html` | Cola virtual: el pedido que se imprime, los que esperan y los que hay que entregar |
| `web/imprenta/tandas.html` | Tandas del local |
| `web/imprenta/tanda.html` | Detalle de una tanda, con la impresora y el botón para imprimirla |
| `web/imprenta/local.html` | Mi local: vista previa del perfil y datos editables |
| `web/imprenta/stock.html` | Stock de papel |
| `web/imprenta/resenas.html` | Reseñas y respuestas |

La imprenta se ve en **modo oscuro**, como el "detrás de escena" de la app. Cada HTML lleva `<html class="theme-imprenta">` y `web/css/tokens.css` redefine los colores para esa vista. Además, cada HTML de `imprenta/` lleva `<base href="../">`, así todas sus rutas se escriben desde `web/`.

## Estructura

```
web/
  index.html, *.html       pantallas del estudiante
  imprenta/                pantallas de la imprenta
  css/
    tokens.css             colores, tipografía, radios, espacios y sombras
    base.css               reset, marco del teléfono y utilidades
    components.css         botones, tarjetas, campos, chips, paneles…
    screens.css            estilos propios de cada pantalla
  js/
    icons.js               íconos de Lucide como SVG
    logic.js               precios, validación de archivos, tiempos y búsquedas
    data.js                datos ficticios: locales, tandas, pedidos, avisos y reseñas
    store.js               estado de la demo y acciones que lo cambian
    ui.js                  componentes: cada función devuelve el HTML de un componente
    app.js                 dibuja la pantalla y conecta clics y campos con las acciones
    sheets.js              paneles compartidos: menú demo e informar cola
    imprenta.js            piezas de la vista de imprenta
    floors.js              planos de los pisos de la FADU
    pages/                 una pantalla por archivo
  img/, fonts/             imágenes, logos, planos y la fuente Inter
```

Cada pantalla llama a `App.start({ render, actions })`: `render()` devuelve el HTML y se vuelve a dibujar cuando cambia el estado; `actions` responde a `data-action`, `data-input` y `data-change`. El detalle completo está en [`web/README.md`](web/README.md).

## Datos de la demo

- No hay autenticación, pagos, subida real de archivos, procesamiento de PDFs, geolocalización ni mapas reales.
- El reloj está fijo en **miércoles 11:20**. Los estados, esperas y movimientos de cola son ficticios.
- La demo arranca sin pedido en curso: el acceso flotante **Mi pedido** aparece recién cuando confirmás una impresión.
- Los cambios se guardan en `localStorage` con la clave `tanda-demo-web` y los comparten las dos vistas.
- **Menú demo** (Home o perfil) permite cargar estados de validación, abrir rutas de apoyo y reiniciar la demo.
- **Vista estudiante / Vista imprenta** es un control de demo externo al dispositivo en desktop. En mobile se accede desde el **Menú demo**.
- El pago es simulado y no se envían datos de tarjeta.

## Deploy

### Vercel

El repo incluye `vercel.json` con `outputDirectory: "web"` y sin build. Al importar el proyecto en Vercel alcanza con dejar el preset **Other** y desplegar; cada push publica la app.

### GitHub Pages

El workflow `.github/workflows/deploy-pages.yml` copia `web/` a la rama `gh-pages` en cada push a `main`. En GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch**, elegir branch **gh-pages** y carpeta **/ (root)**.

## Documentación

- [`web/README.md`](web/README.md) — estructura interna, pantallas y cómo funciona una pantalla.
- [`DESIGN.md`](DESIGN.md) — sistema visual: colores, tipografía, espaciado y componentes.
