# Tanda / Fadu Print

Prototipo navegable de impresión por tandas para la FADU. Es una demo mobile-first con estética **Papel & mandarina**, sin backend: los datos viven en el navegador y simulan los flujos de estudiante e imprenta.

## Stack

- React 19 + Vite 8 + TypeScript
- Tailwind CSS 4
- React Router 8
- Datos demo persistidos en `localStorage`
- Deploy estático en Vercel

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
| `/imprenta/stock` | Stock y avisos |
| `/imprenta/resenas` | Reseñas y respuestas |
| `/imprenta/perfil` | Perfil público de la imprenta |

## Flujos para mostrar

1. **Imprimir suelto:** Home → Imprimir → subir archivo demo → validación → especificaciones → carrito → comparar locales → pago → confirmación → cola.
2. **Tanda:** Tandas disponibles → sumarse a una tanda → archivo y especificaciones → coincidencia → pago → confirmación → cola.
3. **Buscar local:** Home → Buscar locales → mapa/lista → perfil del local → reportar cola o imprimir ahí.
4. **Imprenta:** desde el switch externo **Vista imprenta** → panel de El Poli → tanda, stock y avisos, reseñas y perfil público.

## Comportamiento demo

- No hay autenticación, pagos, subida real de archivos, procesamiento de PDFs, geolocalización ni mapas reales.
- El reloj está fijo en **miércoles 11:20**. Los estados, esperas y movimientos de cola son ficticios.
- Los cambios se guardan en `localStorage` con la clave `tanda-demo-v2`.
- **Menú demo** (Home o perfil) permite cargar estados de validación, abrir rutas de apoyo y reiniciar la demo.
- **Vista estudiante / Vista imprenta** es un control de demo externo al dispositivo en desktop. En mobile se accede desde el **Menú demo**.
- El pago es simulado y no se envían datos de tarjeta.

## Diseño

`src/theme/tokens.ts` es la fuente única de verdad para color, tipografía, espaciado, radios, sombras y medidas del dispositivo. Cualquier token nuevo se refleja en `src/theme/tokenClasses.ts` y se valida con `npm run gen:theme`.

La regla ESLint `tokens/no-raw-design-values` bloquea colores, píxeles, fuentes y valores arbitrarios de Tailwind fuera del sistema. La documentación completa está en `DESIGN.md` y la referencia navegable en `/design-system`.

## Deploy en Vercel

El repo ya incluye `vercel.json` con el rewrite SPA para que funcionen los deep links como `/locales/el-poli` o `/imprenta/tandas/tanda-1`.

1. Subir el proyecto a GitHub (repo `tanda-fadu-print`).
2. En Vercel: **Add New Project** → importar el repositorio.
3. Framework: **Vite**; build: `npm run build`; output: `dist`.
4. Deploy. Cada push a `main` publica y cada branch genera una preview.

Verificación post-deploy: `/`, `/imprenta`, `/design-system`, `/locales/el-poli`, `/alertas`, `/pedidos`, `/perfil`, `/comparar`, `/imprenta/stock` y `/imprenta/resenas` deben abrir también al recargar.
