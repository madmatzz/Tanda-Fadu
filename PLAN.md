# PLAN.md — App Tanda / Fadu Print

Plan de implementación del **prototipo navegable** de Tanda / Fadu Print, con la estética “Papel & mandarina”, formato vertical de iPhone 17 y deploy web en Vercel.

> **Regla principal:** la app se construye sobre la estructura de los PNG originales de `pov usuario` y `pov imprenta`. Las pantallas de los PNG se mantienen y las funciones del brief se integran dentro de ellas o en sheets. Además, el prototipo suma **rutas propias** para Alertas, Mis pedidos, Perfil del estudiante, Comparación, Stock y Reseñas, construidas con la misma gramática visual. La piel es la v2; la arquitectura de navegación y la jerarquía de cada pantalla se mantienen lo más fiel posible a los mockups.

---

## 1. Objetivo y alcance

### Qué vamos a construir

Una **web app mobile-first** que se ve y se siente como una app nativa, pensada para un viewport de iPhone 17 (402 × 874 pt), con:

- **4 flujos completos**:
  1. **Imprimir** — subir archivo, validar, especificar, carrito, elegir local, pagar y seguir el pedido.
  2. **Buscar locales** — mapa de pisos, lista de locales, perfil público, cola, stock, reseñas.
  3. **Ver tandas** — lista de tandas, match con el archivo, unirse y continuar el flujo de impresión.
  4. **Imprenta** — panel de El Poli, tandas, cola de tanda, perfil editable, stock, avisos y reseñas.
- **Dos URLs**: `/` para estudiante y `/imprenta` para imprenta, con un botón visible para cambiar de vista.
- Datos mock, estados simulados y persistencia local.
- Deploy estático en Vercel, con el código en GitHub.

### Qué NO incluye

| No incluido | Cómo se resuelve en el prototipo |
|---|---|
| Backend / base de datos | Datos en `src/demo/seed.ts` + `localStorage` |
| Login real | Perfil demo precargado; switch de rol |
| Subida y procesamiento real de archivos | Archivos de ejemplo + metadatos; validación simulada |
| Pagos reales | Checkout simulado con estados de éxito/error |
| Geolocalización y mapas reales | Planta esquemática de FADU + ubicación mock |
| Tiempo real entre dispositivos | Estado compartido entre roles en la misma sesión |
| App Store / React Native | Web app instalable con “Agregar a inicio” (PWA-lite) |

### Criterio de fidelidad

- Se mantienen el **header**, la **jerarquía**, las **cards**, los **CTAs fijos** y el **orden de la información** de cada PNG.
- Se pueden fusionar estados y eliminar pantallas redundantes, pero no se cambia la estructura de las que quedan.
- Las features nuevas del brief se agregan como **secciones dentro de una pantalla existente** o como **sheets**.
- Las rutas adicionales (Alertas, Mis pedidos, Perfil del estudiante, Comparación, Stock y Reseñas) reutilizan la estructura y los componentes de las pantallas base; no reemplazan ninguna pantalla de los PNG.
- La estética es la v2 aprobada (papel, tinta, mandarina, vidrio en capas flotantes), no la v1 verde de los PNG.

---

## 2. Decisiones de producto

| Decisión | Elección | Por qué |
|---|---|---|
| Formato | Web app React + Vite | Hosting simple en Vercel, sin tiendas ni builds nativos |
| Viewport | 402 × 874 pt (iPhone 17) | Proporción vertical real; escala a 320–430 px |
| Desktop | Marco de teléfono centrado, con isla dinámica y barra de estado simulada | La demo se ve como app también en notebook |
| Mobile | Full bleed + safe areas reales | Sin marcos falsos en el teléfono |
| Arranque | Directo en `/` (Home) | Sin onboarding ni pantalla de bienvenida |
| Navegación | Home como hub + headers con back | Es la navegación de los PNG; sin tab bar |
| URLs | `/` estudiante · `/imprenta` imprenta | Cada audiencia tiene su entrada directa |
| Switch de vista | Botón visible en el footer de cada home | Se cambia de rol sin buscar rutas |
| Roles | Estudiante + imprenta en la v1 | El flujo de imprenta cierra la historia de la cola |
| Reloj de demo | Fijo en miércoles 11:20 | Evita que la demo caiga en “cerrado” |
| Datos | Los nombres, precios y colas de los PNG | Fidelidad con el producto original |
| Persistencia | `localStorage` con versión y reset | La demo sobrevive recargas; se puede limpiar |
| Design system | Se mantiene en `/design-system` | Sigue siendo la referencia visual |

### Reglas del prototipo

1. Todo dato es ficticio y está marcado como **Demo** en el pie de la app.
2. Ninguna acción llama a una API externa.
3. Los estados se simulan con timers y acciones del rol imprenta.
4. El botón **Reiniciar demo** vuelve al estado inicial.
5. Los estados “raros” (archivo rechazado, sin stock, local cerrado) se pueden mostrar a demanda desde el menú Demo.

---

## 3. Los 4 flujos

### Flujo 1 — Imprimir

```
U1 Home
 └─ “Imprimir” → U2 Nueva impresión
      → U3 Subir archivo
      → U4 Validación
           ├─ óptimo ──────────────────────────┐
           ├─ conversión → convertido ──────────┤
           └─ rechazado → corregir → reintentar ┘
      → U5 Especificaciones
      → U6 Carrito
      → U7 ¿Dónde imprimir? (comparación) · /comparar?desde=carrito
           ├─ “Ver detalle” → U17 perfil del local
           └─ “Elegir local”
      → U9 Impresión en tandas (si hay match)
      → U10 Forma de pago
           └─ tarjeta → U11 Pago con tarjeta
      → U12 Pedido confirmado
      → U14 Resumen en cola (⇄ U14b ver pedidos)
      → U13 Home con pedido en curso (estado)
```

**Pantallas que se mantienen:** U2, U3, U4 (4 estados), U5, U6, U7, U9, U10, U11, U12, U14.
**Se fusionan:** U4a/b/c/d en una sola pantalla con estados; U13 es un estado de U1; U14b es un estado expandido de U14.

**Rutas de apoyo:** `/alertas` (desde el banner de U1), `/pedidos` (desde “Ver todos” en U1 y desde U14) y `/perfil` (desde el footer de U1) acompañan el flujo sin reemplazar ninguna pantalla.

### Flujo 2 — Buscar locales

```
U1 Home
 └─ “Buscar locales” → U15 Mapa de pisos
      → tap local → U16 local seleccionado (estado de U15)
      ├─ “Comparar” → U7 /comparar?desde=locales
      → “Ver servicios” → U17 Perfil de imprenta
           ├─ “Ver tandas actuales” → U18 Tandas disponibles
           ├─ “Imprimir” → U2 con local preseleccionado
           ├─ “Ver más locales” → vuelve a U15
           ├─ “Reportar cola” → sheet M1
           ├─ “Escribir reseña” → sheet M3
           └─ “Ver todas las reseñas” → sheet M4
```

**Pantallas que se mantienen:** U15, U17.
**Se fusionan:** U16 es un estado de selección de U15.
**Ruta propia de comparación:** `/comparar` (U7), con entrada desde U15 y desde el carrito.
**Features del brief:** buscador y filtros compactos en U15; cola y stock en las LocalCards; mejor horario, reseñas, avisos y mapa en U17.

### Flujo 3 — Ver tandas

```
U1 Home
 ├─ “Tandas disponibles” → U18 Lista de tandas
 │    → “Elegir tanda” → U19 Subir archivo (contexto tanda)
 │    → U20 Validación (contexto tanda)
 │    → U5 Especificaciones → U6 Carrito → U10 Pago → U12 → U14
 └─ “Tandas hot” → U18 con la tanda preseleccionada
```

**Pantallas que se mantienen:** U18.
**Se reutilizan:** U19 = U3 con `?flujo=tanda`; U20 = U4 con `?flujo=tanda`.
**Match:** U9 aparece dentro del flujo de impresión cuando el archivo coincide con una tanda.

### Flujo 4 — Imprenta

```
/imprenta
 └─ I1 Panel
      ├─ “Cola virtual” → I3 Cola de tanda
      ├─ “Tandas” → I2 Tandas disponibles → I3
      │                              └─ “Confirmar tanda” → vuelve a I2
      ├─ “Editar perfil” → I4 Editar mi perfil
      │      ├─ editar horarios/teléfono
      │      ├─ editar catálogo
      │      ├─ editar/eliminar aviso
      │      ├─ ver resumen de reseñas (link a /imprenta/resenas)
      │      └─ mapa esquemático
      ├─ “Stock y avisos” → /imprenta/stock
      ├─ “Ver y responder reviews” → /imprenta/resenas
      └─ “Cargar Aviso” → sheet M5
```

**Pantallas que se mantienen:** I1, I2, I3, I4.
**Rutas propias:** `/imprenta/stock` y `/imprenta/resenas`, accesibles desde I1 y construidas con la gramática de I4/U17. No reemplazan I4; lo complementan.

---

## 4. Mapa de pantallas fiel a los PNG

### 4.1 Estudiante

| ID | PNG original | Ruta | Pantalla | Estado en el prototipo |
|---|---|---|---|---|
| U1 | `homepage - 1.png` | `/` | Home | Se mantiene: acciones, últimos pedidos, tandas hot, footer |
| U2 | `nueva impresion - 1.png` | `/imprimir` | Nueva impresión | Se mantiene |
| U3 | `nueva impresion - 2.png` | `/imprimir/archivo` | Subir archivo | Se mantiene; también se usa con `?flujo=tanda` |
| U4 | `conversion en curso`, `archivo convertido`, `archivo optimo`, `archivo rechazado` | `/imprimir/validacion` | Validación | Una pantalla con 4 estados; se mantiene la estructura de cada uno |
| U5 | `especificaciones.png` | `/imprimir/especificaciones` | Especificaciones | Se mantiene |
| U6 | `carrito.png` | `/imprimir/carrito` | Carrito | Se mantiene |
| U7 | `comparacion de locales.png` | `/comparar` | ¿Dónde imprimir? | Se mantiene: RadioCards, precio, rating, dos colas, CTA. Entra desde el carrito (`?desde=carrito`) y desde U15 (`?desde=locales`) |
| U9 | `Impresión en tandas.png` | `/imprimir/tanda` | Match de tanda | Se mantiene: tanda compatible + no compatible, CTA |
| U10 | `Selección de pago.png` | `/imprimir/pago` | Forma de pago | Se mantiene |
| U11 | `Pago con tarjeta.png` | `/imprimir/tarjeta` | Pago con tarjeta | Se mantiene |
| U12 | `Pedido confirmado.png` | `/pedido/:id` | Pedido confirmado | Se mantiene: ticket, stepper, retiro, CTA |
| U14 | `resumen impresion en cola.png` | `/pedido/:id/cola` | Resumen en cola | Se mantiene: ticket, progreso, cola virtual y presencial |
| U14b | `... _ver pedidos_ ...` | misma ruta | Ver pedidos | Estado expandido de U14, sin ruta nueva |
| U13 | `... pedido en curso como popup ...` | misma ruta `/` | Home con pedido en curso | Estado de U1: pill flotante “Mi pedido” |
| U15 | `donde imprimir_ - mapa ...` | `/locales` | Mapa de locales | Se mantiene: mapa de pisos + sheet de locales + CTA |
| U16 | `donde imprimir_.png` | misma ruta | Local seleccionado | Estado de U15: dot y card con ring mandarina |
| U17 | `perfil de imprenta.png` | `/locales/:slug` | Perfil de imprenta | Se mantiene: hero, info, concurrencia, catálogo, reviews, mapa, footer sticky |
| U18 | `TANDAS DISPONIBLES.png` | `/tandas` | Tandas disponibles | Se mantiene: lista de tandas, nota, link sin tanda, CTA |

**Estados que se mantienen dentro de su pantalla, sin ruta propia:**

- **U4a/U4b/U4c/U4d** → una sola ruta con estados.
- **U13** → estado de Home.
- **U14b** → estado de U14.
- **U16** → estado de U15.
- **U19/U20** → reutilización de U3/U4 con contexto de tanda.

### 4.2 Rutas adicionales del estudiante

| Ruta | Pantalla | Base visual | Entradas |
|---|---|---|---|
| `/alertas` | Alertas | Banner de U1 + AlertBox de U17; lista con cards del sistema | Ícono de campana en U1, banner de aviso, AlertBox de U17 |
| `/pedidos` | Mis pedidos | Filas de “Últimos pedidos” de U1 + estado U14b | “Ver todos” en U1, “Ver pedidos” en U14 |
| `/perfil` | Perfil del estudiante | Cards de U17/I4 adaptadas a datos del estudiante | Footer de U1 |
| `/comparar` | Comparación | U7 exacta | Carrito (U6) y U15 |

> Estas rutas usan el mismo AppHeader, cards, chips y CTAs que el resto. No alteran la estructura de las pantallas originales: agregan destinos para acciones que en los PNG estaban implícitas. `/comparar` es la ruta propia de U7; se incluye en esta tabla para tener el mapa completo de rutas.

### 4.3 Imprenta

| ID | PNG original | Ruta | Pantalla | Estado en el prototipo |
|---|---|---|---|---|
| I1 | `pov imprenta inicio de flujo.png` | `/imprenta` | Panel | Se mantiene: logo, editar perfil, cargar aviso, cola virtual, tandas, reviews |
| I2 | `tandas disponibles - 1.png` | `/imprenta/tandas` | Tandas | Se mantiene: 3 TandaCards con stats y CTA |
| I3 | `cola de tanda - 1.png` | `/imprenta/tandas/:id` | Cola de tanda | Se mantiene: pendientes, ilustración de bandeja, completados, CTA |
| I4 | `editar mi perfil de la imprenta - 1.png` | `/imprenta/perfil` | Editar perfil | Se mantiene: hero editable, info, concurrencia, catálogo, reviews, mapa |
| I5 | Base: catálogo de I4 + aviso de I1 | `/imprenta/stock` | Stock y avisos | Ruta propia: niveles OK/bajo/sin stock y publicación de avisos |
| I6 | Base: reviews de I1 y U17 | `/imprenta/resenas` | Reseñas | Ruta propia: promedio, lista completa y respuesta del local |

**Total:** 24 rutas de app + `/design-system`. Sin tab bar; navegación por headers y CTAs como en los PNG.

### 4.4 Sheets

| ID | Se abre desde | Función |
|---|---|---|
| M1 | U15 / U17 | **Reportar cola**: “¿Estás en el local?”, cuánta gente hay, actualizar espera |
| M2 | U15 | **Filtros**: servicio, color, papel, abierto, espera, rating |
| M3 | U17 | **Escribir reseña**: estrellas + texto |
| M4 | U17 | **Ver todas las reseñas** del local (estudiante) |
| M5 | I1 / I4 | **Cargar / editar aviso**: stock, técnico, descuento |
| M6 | U1 / I1 | **Menú Demo**: saltar a estados, cambiar rol, resetear |

---

## 5. Brief → dónde se integra

| Punto del brief | Pantalla original | Cómo se resuelve |
|---|---|---|
| Centralizar la información de los locales | U1, U15, U17 | Cards de locales + perfil completo |
| Buscar según el tipo de impresión | U15 | Buscador + chips de servicio + sheet de filtros M2 |
| Comparar precios y disponibilidad | U7 · `/comparar` | La pantalla de comparación ya existe: precio, rating y dos colas por local |
| Reviews y valoraciones | U17 · `/imprenta/resenas` | ReviewsCard existente + sheet para escribir/ver; la imprenta responde en su ruta de reseñas |
| Avisos de stock, técnicos y descuentos | U1, U17, `/alertas`, I1, I4 | Banner en Home, AlertBox en el local, ruta de alertas y “Cargar Aviso” en el panel |
| Mejor momento para ir | U17 | ConcurrenciaCard + BarChart existentes; se resalta la hora actual y se agrega “Mejor momento: 16:00” |
| Cola en tiempo real | U15, U17, U14, I1, I3 | Espera + última actualización + sheet “Reportar cola” |
| Sistema de stock por local | U17, `/imprenta/stock`, I4 | Catálogo con niveles OK/bajo/sin stock; edición en la ruta de stock y en I4 |
| Dos audiencias | `/` y `/imprenta` | URLs separadas + link de cambio de vista en el footer |

> **Rutas de apoyo:** `/pedidos` y `/perfil` no responden a un punto literal del brief, pero completan la app: historial de pedidos, datos del estudiante, locales guardados y controles de demo.

### Ajustes mínimos dentro de la estructura existente

- **U1**: única modificación del header: campana con punto de no leídos → `/alertas`. “Ver todos” en “Últimos pedidos” → `/pedidos`; franja de aviso activo arriba de “Últimos pedidos”; footer con “Mi perfil” → `/perfil` y botón “Soy imprenta” → `/imprenta`. Si hay pedido en curso, aparece el pill flotante de U13.
- **U15**: fila compacta de búsqueda/filtros arriba del mapa y acción “Comparar” → `/comparar`. La estructura del mapa y el sheet no cambia.
- **U17**: link “Reportar cola” dentro de la card de concurrencia; “Escribir reseña” y “Ver todas las reseñas” en la sección de reviews; AlertBox con link a `/alertas`.
- **U7**: ruta propia `/comparar`; chip de stock (“Papel OK” / “Stock bajo”) dentro de cada RadioCard. No cambia la estructura.
- **I1**: el row “Ver y responder reviews” navega a `/imprenta/resenas`; se agrega un row compacto “Stock y avisos” → `/imprenta/stock` (y una alerta si hay stock crítico). No se agrega una card gigante.
- **I4**: el catálogo existente pasa a mostrar niveles de stock y un link “Gestionar stock” → `/imprenta/stock`; el aviso editable ya está en el PNG.
- **Rutas adicionales**: Alertas, Mis pedidos y Perfil del estudiante usan el AppHeader con back y las mismas cards; no cambian la estructura de U1, U14 ni U17.

---

## 6. Navegación, URLs y switch de vista

### URLs

| URL | Audiencia | Entrada |
|---|---|---|
| `/` | Estudiante | U1 Home |
| `/imprenta` | Imprenta | I1 Panel |
| `/design-system` | Ambos | Página del design system |

**Rutas propias adicionales:** `/alertas`, `/pedidos`, `/perfil`, `/comparar`, `/imprenta/stock` y `/imprenta/resenas`. El resto son deep links internos de cada flujo.

### Switch de vista

- En el **footer de U1**: botón “Soy imprenta →” que navega a `/imprenta`.
- En el **footer de I1**: botón “Ver como estudiante →” que navega a `/`.
- En el **menú Demo** (M6): opción “Cambiar de vista”.
- El switch no altera la estructura del header ni agrega un tab bar.

### Navegación

- **Home como hub**: las tres acciones principales llevan a los flujos 1, 2 y 3.
- **Accesos a rutas propias**:
  - Campana en U1 → `/alertas`; “Ver todos” en Últimos pedidos → `/pedidos`; footer → `/perfil`.
  - U15 y carrito → `/comparar` (con `?desde=locales` o `?desde=carrito` para que el back vuelva al origen).
  - I1 → `/imprenta/stock` y `/imprenta/resenas`.
- **Headers con back** en todos los subflujos, como en los PNG.
- **CTAs fijos** al pie de las pantallas que los tienen en el PNG (U2, U3, U5, U6, U7, U9, U10, U11, U12, U14, U15, U17, U18, I2, I3).
- **Sin tab bar**: se respeta la navegación original.
- **ScrollToTop** en cada cambio de ruta.
- **Home indicator** simulado solo en desktop; en mobile se usan las safe areas reales.

---

## 7. Shell iPhone 17

- **Viewport de diseño:** 402 × 874 pt (iPhone 17 / 17 Pro).
- **Desktop:** marco centrado de 402:874, escalable si la ventana es baja; bisel de tinta, isla dinámica, barra de estado simulada (9:41, señal, wifi, batería) y sombra flotante.
- **Mobile:** sin marco; `100dvh`, `viewport-fit=cover` y padding con `env(safe-area-inset-*)`.
- **Scroll:** dentro de la pantalla en desktop; scroll normal en mobile.
- **Header:** 64 px, vidrio, título a la izquierda y sección a la derecha, back circular en subflujos. Ya existe `AppHeader` y se reutiliza.
- **CTA fijo:** pill de 56 px con safe area, como en los PNG.
- **Transiciones:** 150–220 ms, respetando `prefers-reduced-motion`.

### Tokens nuevos

Agregar al generador y a `tokenClasses.ts`:

- `container.device: 402`, `container.device-h: 874`.
- `radius.device: 54`.
- `size.island-w: 126`, `size.island-h: 37`.
- `spacing.safe-top: 62`, `spacing.safe-bottom: 34`.
- `shadow.device`.

Todo pasa por tokens; no se permiten valores crudos ni clases arbitrarias.

---

## 8. Datos mock fieles a los PNG

### 8.1 Locales

| Local | Piso | Precio 8 págs A4 B&N | Rating | Cola virtual | Cola presencial | Estado |
|---|---|---|---|---|---|---|
| El Poli | Piso 0 | $800 | 4.8 | 8 min | 5 min | Abierto · stock OK |
| Desalvo | Piso 1 | $880 | 4.3 | 15 min | 12 min | Abierto · stock bajo |
| Quinto Color | Piso 1 | $960 | 4.7 | 20 min | 10 min | Abierto |
| CEFADU | Piso 0 | $720 | 4.2 | 25 min | 18 min | Abierto · aviso técnico |
| La Copia Ciudad | Piso 2 | $840 | 4.4 | 12 min | 8 min | Abierto |

> Los precios, ratings y colas salen de `comparacion de locales.png`. El panel de El Poli usa cola virtual 23 y 5 tandas, como `pov imprenta inicio de flujo.png`.

### 8.2 Home

- **Últimos pedidos**:
  - El Poli · 4 archivos · doble faz · color · **Listo**.
  - Desalvo · 2 archivos · simple faz · b&n · **Entregado**.
- **Tandas hot**:
  - CEFADU · b&n simple faz · +12 · cierra en 30 min.
  - Quinto Color · color doble faz · +7 · cierra en 2 h.
  - La Copia Ciudad · b&n · +3 · cierra en 4 h.

### 8.3 Tandas

- **U18**:
  - A4, 1–10 páginas · El Poli · B&N · Obra 80 g/m² · 25/30 · 8 min.
  - A3, 1–5 páginas · Quinto Color · color · Ilustración · 12/30 · 20 min.
  - A3, 1–5 páginas · Desalvo · B&N · Obra · 6/10 · 10 min.
- **I2**:
  - Tanda 1 · A4 Color (1–10 págs) · 30 personas · 10 min · 245.
  - Tanda 2 · A3 Color (1–5 págs) · 20 personas · 15 min · 140.
  - Tanda 3 · A4 ByN (+20 págs) · 15 personas · 10 min · 220.
- **I3**: pendientes #37 y #36 (Ailén, 4 págs, EN COLA); completados #35, #34, #33 (IMPRESO); ilustración de bandeja 6/3.

### 8.4 Pedido y cola

- Pedido **#FADU-0248**, ticket **#36**, archivo `Entrega.pdf`, El Poli, 5 minutos.
- Cola virtual: +7, 37, **Vos (36)**, 35, Camila, 34 imprimiendo.
- Cola presencial: 3 personas.
- Estados: Recibido → En cola → Listo.

### 8.5 Perfil de El Poli

- Abierto · Lun–Sáb 08:00–22:00 · 4787-9412.
- Aviso: “Stock limitado de papel 80g y foamboard. Confirmar disponibilidad antes de imprimir.”
- Concurrencia: pico 18:00–20:00; barras 3, 4, 5, 6, 7, 9, 8, 5 (08 a 22 h).
- Catálogo: Papel 80g, Papel 120g, Foamboard 3mm.
- Reviews: 4.8 · Calidad 4.8 · Precio 4.5 · Velocidad 4.9; “Aguante el poli” (Agustín Pereyra, 4/5); “Ejemplo” (Julieta Rossi, 5).
- Mapa: Piso 0.

### 8.6 Archivos demo y estados

| Archivo | Estado | Recorrido |
|---|---|---|
| `entrega_final.pdf` | Óptimo | Validación → specs |
| `monografia.docx` | Conversión | Procesando 65% → convertido → specs |
| `foto-baja-res.jpg` | Rechazado | Checklist con errores → corregir |

El dropzone acepta un archivo real y usa su extensión/tamaño para elegir el estado, pero **no lo sube**. También hay botones “usar archivo demo”.

### 8.7 Estado y simulación

- `DemoProvider` con `useReducer` y `localStorage` (`tanda-demo-v1`).
- `resetDemo()` vuelve a la semilla y al rol estudiante.
- **Reportar cola**: actualiza presencial/virtual, espera y `updatedAt`; un reporte por local cada 30 minutos simulados.
- **Pedido**: avanza cuando la imprenta lo mueve; no hay timers automáticos que rompan la demo.
- **Tanda**: al confirmar, los pedidos pasan a “imprimiendo” y luego a “listo”.
- **Aviso**: lo publicado por la imprenta aparece en Home/U17 del estudiante.
- **Review**: la respuesta de la imprenta se ve en U17.

---

## 9. Arquitectura técnica

### Stack

- React 19 + TypeScript + Vite 8.
- Tailwind CSS v4 con tokens generados (`npm run gen:theme`).
- React Router 8.
- `lucide-react`.
- Sin librerías de estado, mapas ni gráficos: Context + `useReducer`, SVG/CSS para mapa y barras.

### Estructura propuesta

```
src/
  app/
    App.tsx                 # rutas
    DemoProvider.tsx        # estado global + persistencia
    demo/
      types.ts
      seed.ts
      reducer.ts
      selectors.ts
    shell/
      AppFrame.tsx          # marco iPhone / full bleed
      StatusBar.tsx
      Screen.tsx
      ScreenHeader.tsx
      FixedFooter.tsx
      Sheet.tsx
      Toast.tsx
  screens/
    student/
      HomeScreen.tsx          # U1
      PrintIntroScreen.tsx    # U2
      UploadScreen.tsx        # U3 / U19
      ValidationScreen.tsx    # U4 / U20
      SpecsScreen.tsx         # U5
      CartScreen.tsx          # U6
      CompareScreen.tsx       # U7
      TandaMatchScreen.tsx    # U9
      PaymentScreen.tsx       # U10
      CardPaymentScreen.tsx   # U11
      OrderConfirmedScreen.tsx# U12
      QueueScreen.tsx         # U14 / U14b
      LocalsMapScreen.tsx     # U15 / U16
      LocalProfileScreen.tsx  # U17
      TandasScreen.tsx        # U18
      AlertsScreen.tsx        # /alertas
      OrdersScreen.tsx        # /pedidos
      StudentProfileScreen.tsx# /perfil
    shop/
      ShopPanelScreen.tsx     # I1
      ShopTandasScreen.tsx    # I2
      ShopTandaScreen.tsx     # I3
      ShopProfileScreen.tsx   # I4
      ShopStockScreen.tsx     # /imprenta/stock
      ShopReviewsScreen.tsx   # /imprenta/resenas
  components/               # primitivos existentes + compuestos
    LocalCard.tsx
    TandaCard.tsx
    OrderRow.tsx
    QueueVisualization.tsx
    BarChart.tsx
    RatingStars.tsx
    ReviewCard.tsx
    ReviewComposer.tsx
    AlertCard.tsx
    StockRow.tsx
    CatalogChips.tsx
    MapSchematic.tsx
    PrinterTrayIllustration.tsx
    FloatingOrderPill.tsx
    ReportQueueSheet.tsx
    FilterSheet.tsx
    ReviewSheet.tsx
    AlertSheet.tsx
    DemoMenu.tsx
  pages/DesignSystemPage.tsx
  theme/
  lib/
```

### Estado

Un único `DemoProvider` con `useReducer`:

- `role: "student" | "shop"`
- `draft`: archivo, specs, local/tanda elegida, método de pago.
- `orders`, `tandas`, `locals`, `alerts`, `reviews`.
- `lastQueueReport` por local.
- `demoClock`.
- Persistencia versionada y `resetDemo()`.

Acciones principales:

```
SET_ROLE · SET_FILE · SET_VALIDATION · SET_SPECS · SELECT_LOCAL
SELECT_TANDA · SET_PAYMENT · CONFIRM_ORDER · REPORT_QUEUE
SHOP_ADVANCE_ORDER · SHOP_CONFIRM_TANDA · SHOP_SET_STOCK
SHOP_PUBLISH_ALERT · MARK_ALERTS_READ · ADD_REVIEW · SHOP_REPLY_REVIEW
OPEN_DEMO_MENU · RESET_DEMO
```

### Rutas

- `BrowserRouter` + `Routes` anidadas con shells por rol.
- `ScrollToTop` en cada cambio de ruta.
- `NotFound` redirige a `/`.
- `/design-system` queda fuera del shell de la app.
- Query params para estados: `?flujo=tanda`, `?demo=rechazado`, `?local=el-poli`, `?desde=carrito|locales`.

### Componentes nuevos

- **Layout**: `AppFrame`, `StatusBar`, `Screen`, `ScreenHeader`, `FixedFooter`, `Sheet`, `Toast`, `DemoBadge`.
- **Dominio**: `LocalCard`, `QueueBadge`, `QueueReportSheet`, `FilterSheet`, `BestTimeCard` (dentro de U17), `BarChart`, `StockChips`, `AlertBanner`, `AlertCard`, `RatingStars`, `ReviewCard`, `ReviewComposer`, `ReviewSheet`, `TandaCard`, `OrderRow`, `OrderStatusStepper`, `QueueVisualization`, `ReceiptTicket`, `PrinterTrayIllustration`, `FloatingOrderPill`, `MapSchematic`, `DemoMenu`.
- **Imprenta**: `ShopStatCard`, `StockRow`, `AlertComposer`, `ReviewReply`.

Se reutilizan los primitivos existentes: `AppHeader`, `Button`, `IconButton`, `Chip`, `Card`, `RadioCard`, `SegmentedControl`, `SummaryBox`, `FileCard`, `ProgressBar`, `ValidationList`, `KeyValueRow`, `Select`, `TextInput`, `Textarea`, `Stepper`, `ErrorNote`, `SectionLabel`, `LinkText`, `Divider`.

### Gráficos y mapa

- **Concurrencia / mejor horario**: barras SVG/CSS con datos de `occupancyByHour`; hora actual resaltada en mandarina; eje de 08 a 22 h.
- **Mapa**: planta isométrica simplificada en SVG, con dots por local y sheet de locales. Sin API de mapas ni claves.
- **Cola**: visualización de personas con íconos, como en los PNG.
- **Ticket**: card con borde superior tipo zigzag, hecha con CSS.

### Accesibilidad

- Contraste AA en texto y chips.
- Tap targets de 44 px mínimo.
- Foco visible mandarina; navegación por teclado.
- Sheets con `role="dialog"`, foco atrapado y cierre con Escape.
- `aria-live` para toasts y cambios de estado del pedido.
- No depender solo del color para estados.

---

## 10. Etapas de implementación

| Etapa | Alcance | Entregable | Tamaño |
|---|---|---|---|
| **0. Base** | Rutas `/` y `/imprenta`, shell iPhone, header, CTA fijo, sheet, toast, tokens de device, PWA meta | App vacía navegable en desktop y mobile | S |
| **1. Datos y Home** | Tipos, semilla fiel a los PNG, provider, reducer, persistencia, U1, `/alertas`, `/pedidos`, `/perfil`, switch de vista, menú demo | Home + datos + rutas de apoyo del estudiante | M |
| **2. Buscar locales** | U15/U16, U17, filtros, reporte de cola, reseñas, stock, banner de avisos, `/comparar` desde U15 | Flujo 2 completo | M/L |
| **3. Imprimir** | U2, U3, U4 (estados), U5, U6, U7 `/comparar`, U9, U10, U11, U12, U14/U14b, U13 | Flujo 1 completo | L |
| **4. Tandas** | U18, U3/U4 con contexto, match U9, integración con pago/ticket | Flujo 3 completo | M |
| **5. Imprenta** | I1, I2, I3, I4, `/imprenta/stock`, `/imprenta/resenas`, sincronización con estudiante | Flujo 4 completo | M/L |
| **6. QA y deploy** | Responsive, accesibilidad, Lighthouse, README, GitHub, Vercel | Prototipo publicado | S/M |

**Estimación total:** 6 bloques de trabajo, aproximadamente 1 semana de desarrollo enfocado. Cada etapa deja algo presentable.

### Corte mínimo presentable

1. Etapa 0 + 1: Home con las 3 acciones y switch de rol.
2. Etapa 2: mapa + perfil + reporte de cola.
3. Etapa 3: flujo de impresión hasta ticket.
4. Etapa 5: panel de imprenta con avance del pedido.

Ese corte ya cuenta la historia completa del brief.

---

## 11. QA y criterios de aceptación

### Por flujo

**Flujo 1 — Imprimir**

- [ ] Home → Imprimir → archivo → validación → specs → carrito → `/comparar` → pago → confirmación.
- [ ] `/comparar` entra desde el carrito y el back vuelve al carrito.
- [ ] Los 4 estados de validación se pueden demostrar.
- [ ] El total cambia con páginas, color y papel.
- [ ] El ticket #36 aparece en U14 con cola virtual y presencial.
- [ ] U13 muestra el pill flotante “Mi pedido”.

**Flujo 2 — Buscar locales**

- [ ] Mapa de pisos con dots y sheet de locales.
- [ ] Selección de local con ring mandarina y CTA “Ver servicios”.
- [ ] Filtros por servicio/color/papel/espera.
- [ ] “Comparar” abre `/comparar` y el back vuelve a `/locales`.
- [ ] U17 muestra cola, mejor horario, stock, avisos, reviews y mapa.
- [ ] Reportar cola actualiza la espera y muestra “actualizado hace X”.
- [ ] Escribir reseña actualiza el promedio.

**Flujo 3 — Ver tandas**

- [ ] U18 lista las 3 tandas con progreso y espera.
- [ ] “Elegir tanda” entra al flujo de archivo con contexto.
- [ ] El upload/validación muestran el header “Tandas”.
- [ ] U9 muestra la tanda compatible y la no compatible.
- [ ] Unirse a la tanda continúa a specs/pago/ticket.

**Flujo 4 — Imprenta**

- [ ] `/imprenta` muestra logo, acciones, cola 23, tandas 5 y reviews.
- [ ] I2 lista las 3 tandas; I3 muestra pendientes/completados y confirmar.
- [ ] Confirmar tanda actualiza el pedido del estudiante.
- [ ] I4 edita horarios, teléfono, catálogo y aviso; linkea a `/imprenta/resenas`.
- [ ] `/imprenta/stock` cambia niveles y publica avisos.
- [ ] `/imprenta/resenas` lista, responde y actualiza el rating.
- [ ] “Cargar Aviso” publica un aviso visible en el estudiante.
- [ ] El switch vuelve a `/`.

### Rutas propias

- [ ] `/alertas` lista avisos, filtra por tipo y marca leídos; se entra por la campana de U1 y por los avisos de U17.
- [ ] `/pedidos` muestra el pedido activo y el historial; cada fila abre su ticket.
- [ ] `/perfil` muestra datos demo, locales guardados, preferencias y controles de demo; el switch de rol funciona.
- [ ] `/comparar` conserva la estructura de U7 y muestra precio, rating, cola virtual y presencial.
- [ ] `/imprenta/stock` y `/imprenta/resenas` mantienen la gramática visual de I4/I1 y no rompen la navegación del panel.
- [ ] Todas las rutas tienen header con back y un destino de vuelta claro.

### Mobile / visual

- [ ] Sin scroll horizontal entre 320 y 430 px.
- [ ] Safe areas respetadas en iPhone con notch.
- [ ] Header, CTA fijo y footer no se pisan.
- [ ] Teclado no rompe inputs ni sheets.
- [ ] En desktop, el marco 402:874 entra completo y escala.
- [ ] Estados vacíos, loading y error tienen diseño.
- [ ] Contraste AA y foco visible.
- [ ] `prefers-reduced-motion` respetado.

### Técnico

- [ ] `npm run typecheck` pasa.
- [ ] `npm run lint` pasa (cero valores crudos).
- [ ] `npm run build` pasa.
- [ ] Deep links funcionan en Vercel (`/`, `/imprenta`, `/alertas`, `/pedidos`, `/perfil`, `/comparar`, `/imprenta/stock`, `/imprenta/resenas`, `/locales/el-poli` recargados).
- [ ] Lighthouse mobile ≥ 90 en performance y 100 en accesibilidad (objetivo del prototipo).

---

## 12. Deploy en Vercel + GitHub

### Pasos

1. `git init` y primer commit (el proyecto hoy no es un repo).
2. Crear repo en GitHub: `tanda-fadu-print`.
3. Push de `main`.
4. En Vercel: **Add New Project** → importar el repo.
5. Configuración:
   - Framework: **Vite**.
   - Build command: `npm run build`.
   - Output directory: `dist`.
   - Node: 22 LTS o superior.
6. Agregar `vercel.json` para SPA:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

7. Deploy. Cada push a `main` publica; cada branch genera preview.
8. Verificar:
   - `/` abre la Home.
   - `/imprenta` abre el panel.
   - `/alertas`, `/pedidos`, `/perfil`, `/comparar`, `/imprenta/stock` y `/imprenta/resenas` abren sin 404.
   - `/design-system` sigue funcionando.
   - `/locales/el-poli` recargado no da 404.
   - El build de Vercel corre `prebuild` y genera el tema.

### PWA-lite

- `manifest.webmanifest` con nombre, colores y `display: standalone`.
- `apple-touch-icon` y `theme-color`.
- `viewport-fit=cover`.
- Sin service worker en la primera versión.

### README

Incluir:

- Qué es el prototipo y qué es demo.
- Cómo correr (`npm install`, `npm run dev`).
- Las entradas principales: `/`, `/imprenta`, `/design-system`.
- Las rutas de apoyo: `/alertas`, `/pedidos`, `/perfil`, `/comparar`, `/imprenta/stock`, `/imprenta/resenas`.
- Cómo cambiar de rol y resetear.
- Cómo deployar.

---

## 13. Riesgos y decisiones abiertas

| Tema | Riesgo | Recomendación |
|---|---|---|
| Fidelidad vs. features nuevas | Agregar secciones puede romper la estructura del PNG | Integrarlas solo donde el brief las pide; las rutas extra reutilizan las pantallas base |
| Geolocalización real | Permisos, privacidad y poca confiabilidad | No usarla; simular con ubicación de FADU y reporte manual |
| Archivos reales | Subida y procesamiento fuera de alcance | Aceptar archivo solo para leer nombre/tamaño; estados demo |
| Persistencia | Datos viejos tras cambiar el modelo | Clave versionada + reset visible |
| Mapa real | API key, costo y fidelidad | Planta SVG esquemática |
| Design system público | Puede confundir con la app | Link discreto en el footer, no en el header |
| Reloj fijo | Puede parecer raro | Mostrar “Demo · miércoles 11:20” en el menú Demo |
| iPhone 17 exacto | Medidas lógicas pueden variar | Usar 402 × 874 y probar 390–430; el layout es fluido |

### Decisiones ya confirmadas

- Se incluye el rol imprenta en la v1.
- El prototipo arranca directo en `/`, sin bienvenida.
- Dos URLs (`/` y `/imprenta`) + switch visible.
- Se mantiene la estructura de los PNG; se pueden fusionar estados redundantes.
- Se mantienen rutas propias para Alertas, Mis pedidos, Perfil, Comparación, Stock y Reseñas.
- Los 4 flujos son la prioridad.

---

## 14. Definición de terminado

El prototipo está listo cuando:

- Se pueden recorrer los 4 flujos completos en menos de 8 minutos.
- La estructura de cada pantalla se reconoce contra su PNG original.
- Las rutas de Alertas, Mis pedidos, Perfil, Comparación, Stock y Reseñas son accesibles y tienen un back claro.
- Se puede cambiar de rol desde el footer y ver el mismo pedido desde los dos lados.
- Se puede reportar una cola y ver el cambio reflejado.
- Se puede publicar un aviso y verlo en el estudiante.
- La app se ve correcta en un iPhone real y en el marco de desktop.
- Está publicada en Vercel y el código en GitHub.
- El design system sigue disponible y consistente en `/design-system`.
