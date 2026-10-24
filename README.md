# Tanda / Fadu Print

Prototipo navegable de impresión por tandas para la FADU.

## Stack

- React 19 + Vite 8 + TypeScript
- Tailwind CSS 4
- React Router 8
- Datos demo persistidos en `localStorage`
- Deploy estático en Vercel y GitHub Pages

## Correr el proyecto

Requiere Node 22.12 o superior.

```bash
npm install
npm run dev
```

La app abre en `http://localhost:5173/`. El design system está en `http://localhost:5173/design-system`.

Scripts útiles:

```bash
npm run gen:theme    # genera src/theme/theme.generated.css desde tokens.ts
npm run typecheck
npm run lint
npm run build
```

`predev` y `prebuild` generan el tema automáticamente.

## Entradas principales

| Ruta | Pantalla |
| --- | --- |
| `/` | Home del estudiante |
| `/imprenta` | Panel de la imprenta |
| `/design-system` | Referencia visual de tokens y componentes |

## Rutas de apoyo

| Ruta | Pantalla |
| --- | --- |
| `/alertas` | Alertas del estudiante |
| `/pedidos` | Historial de pedidos |
| `/perfil` | Perfil del estudiante |
| `/locales` | Mapa y listado de locales |
| `/locales/:slug` | Perfil de un local |
| `/comparar` | Comparación de locales |
| `/tandas` | Tandas disponibles |
| `/pedido/:id` | Detalle y comprobante |
| `/pedido/:id/cola` | Seguimiento de cola |
| `/imprenta/tandas` | Tandas de la imprenta |
| `/imprenta/tandas/:id` | Cola de una tanda |
| `/imprenta/stock` | Stock de papel |
| `/imprenta/resenas` | Reseñas y respuestas |
| `/imprenta/perfil` | Perfil público de la imprenta |

## Flujos para mostrar

1. **Imprimir suelto:** Home → Imprimir → subir archivo demo → validación → especificaciones → carrito → comparar locales → pago → confirmación → cola.
2. **Tanda:** Tandas disponibles → sumarse a una tanda → archivo y especificaciones → coincidencia → pago → confirmación → cola.
3. **Buscar local:** Home → Buscar locales → mapa/lista → perfil del local → reportar cola o imprimir ahí.
4. **Imprenta:** desde el switch externo **Vista imprenta** → panel de El Poli → tanda, stock, reseñas y perfil público.

## Comportamiento demo

- No hay autenticación, pagos, subida real de archivos, procesamiento de PDFs, geolocalización ni mapas reales.
- El reloj está fijo en **miércoles 11:20**. Los estados, esperas y movimientos de cola son ficticios.
- La demo arranca sin pedido en curso: el bloque **Últimos pedidos** y el acceso flotante **Mi pedido** aparecen recién cuando confirmás una impresión.
- Las preferencias, locales guardados y ajustes de la demo se guardan en `localStorage` con la clave `tanda-demo-v2`. El pedido, el flujo de impresión y las tandas se reinician al recargar la página.
- **Menú demo** (Home o perfil) permite cargar estados de validación, abrir rutas de apoyo y reiniciar la demo.
- **Vista estudiante / Vista imprenta** es un control de demo externo al dispositivo en desktop. En mobile se accede desde el **Menú demo**.
- El pago es simulado y no se envían datos de tarjeta.

## Diseño

`src/theme/tokens.ts` es la fuente única de verdad para color, tipografía, espaciado, radios, sombras y medidas del dispositivo. Cualquier token nuevo se refleja en `src/theme/tokenClasses.ts` y se valida con `npm run gen:theme`.

La regla ESLint `tokens/no-raw-design-values` bloquea colores, píxeles, fuentes y valores arbitrarios de Tailwind fuera del sistema. La documentación completa está en `DESIGN.md` y la referencia navegable en `/design-system`.

## Deploy en GitHub Pages

El workflow `.github/workflows/deploy-pages.yml` compila con `GITHUB_PAGES=true`, genera `dist/404.html` y publica el resultado en la rama `gh-pages`. El `404.html` es necesario para que los deep links del SPA funcionen al recargar.

1. Hacer push a `main`.
2. Esperar a que termine **Deploy GitHub Pages** en la pestaña Actions.
3. En GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch**.
4. Elegir branch **gh-pages** y carpeta **/ (root)**. Guardar.
5. La demo queda publicada en `https://madmatzz.github.io/Tanda-Fadu/`.

Cada push a `main` actualiza la rama `gh-pages` automáticamente. El build local normal sigue usando `/`; el workflow es el que aplica el base `/Tanda-Fadu/` para Pages.

## Deploy en Vercel

El repo ya incluye `vercel.json` con el rewrite SPA para que funcionen los deep links como `/locales/el-poli` o `/imprenta/tandas/tanda-1`.

1. Subir el proyecto a GitHub (repo `Tanda-Fadu`).
2. En Vercel: **Add New Project** → importar el repositorio.
3. Framework: **Vite**; build: `npm run build`; output: `dist`.
4. Deploy. Cada push a `main` publica y cada branch genera una preview.

Verificación post-deploy: `/`, `/imprenta`, `/design-system`, `/locales/el-poli`, `/alertas`, `/pedidos`, `/perfil`, `/comparar`, `/imprenta/stock` y `/imprenta/resenas` deben abrir también al recargar.
