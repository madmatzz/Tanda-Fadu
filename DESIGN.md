# DESIGN.md — Tanda / Fadu Print · v2

Sistema de diseño de **Fadu Print**, relevado de los mockups en `/pov usuario` y `/pov imprenta` y reinterpretado en la dirección visual **Papel & tinta**.

La app tiene **dos roles**: **usuario** (estudiante que imprime) e **imprenta** (local que recibe pedidos). La v2 no cambia flujos ni funcionalidad: cambia la piel. Los PNG originales siguen siendo la referencia de producto.

> **Nota de estado:** la app oficial es la versión sin frameworks de `web/`. La versión viva de este documento es [`web/design-system.html`](web/design-system.html); este archivo queda como referencia del sistema visual.

---

## 1. Principios visuales

1. **Papel antes que pantalla.** El fondo es un papel cálido (`color-bg`), no blanco puro. Las superficies son blanco hueso (`color-surface`).
2. **Tinta para leer, naranja para actuar.** El texto y las acciones primarias usan tinta. El naranja (`color-accent`) marca avance, selección y energía de marca.
3. **Vidrio solo en capas flotantes.** Header, chips y controles pueden usar vidrio. Las tarjetas de contenido usan papel para no comprometer la lectura.
4. **Radios generosos, sombras largas.** Tarjetas de 24–32px, controles tipo pill y sombras suaves de gran difusión.
5. **Estados con texto, no solo color.** Un chip siempre dice qué pasa: “En cola”, “Listo”, “Rechazado”.
6. **El PNG manda.** Cada decisión visual tiene que poder compararse contra el mockup original.

La referencia visual aporta: fondos cálidos, gradiente naranja, tarjetas flotantes, bordes de luz, blur, avatares e íconos en círculos, chips con borde y CTA oscuros tipo pill.

---

## 2. Design tokens

### Colores

#### Papel y superficies

| Token | Hex | Uso |
|---|---|---|
| `color-bg` | `#F4EEE6` | Fondo de la app y de la página del design system |
| `color-surface` | `#FFFCF7` | Tarjetas, inputs, botones outline |
| `color-surface-soft` | `#FBF6EF` | Superficie secundaria, cajas de nota |
| `color-fill` | `#F1E9DE` | Chips neutros, track de controles, placeholders |
| `color-fill-deep` | `#E6DACB` | Track de progress bar, estados deshabilitados profundos |

#### Tinta

| Token | Hex | Uso |
|---|---|---|
| `color-ink` | `#1B1613` | Texto principal, botón primario, tarjetas de tinta |
| `color-ink-soft` | `#4D443C` | Hover del botón primario, énfasis secundario |
| `color-text-secondary` | `#5F544A` | Subtítulos, metadata, labels |
| `color-text-muted` | `#74685C` | Hints, notas al pie, placeholders |

#### Líneas y vidrio

| Token | Valor | Uso |
|---|---|---|
| `color-border` | `#E4D9CC` | Bordes visibles, divisores fuertes |
| `color-border-soft` | `#EFE6DB` | Bordes de tarjeta, divisores internos |
| `color-glass` | `rgb(255 252 247 / 0.68)` | Fondo de capas de vidrio |
| `color-glass-strong` | `rgb(255 252 247 / 0.86)` | Vidrio sobre superficies claras |
| `color-glass-border` | `rgb(255 255 255 / 0.72)` | Borde de luz sobre gradientes |
| `color-ink-glass` | `rgb(27 22 19 / 0.78)` | Vidrio oscuro sobre foto o mapa |
| `color-overlay` | `rgb(27 22 19 / 0.38)` | Scrim de modales y bottom sheets |

#### Acento naranja

| Token | Hex | Uso |
|---|---|---|
| `color-accent` | `#F06424` | CTA de acción, selección, badge, tabs activos |
| `color-accent-dark` | `#C0450F` | Hover/pressed del acento |
| `color-accent-ink` | `#8F300B` | Texto sobre fondos `accent-soft` |
| `color-accent-soft` | `#FDE8DC` | Fondo de chips, íconos y cajas destacadas |
| `color-accent-border` | `#F6C4A9` | Borde de chips y selección suave |
| `color-sun-1` | `#FFC08E` | Gradiente: luz |
| `color-sun-2` | `#FA8246` | Gradiente: medio |
| `color-sun-3` | `#E8501A` | Gradiente: sombra |

#### Estados

| Token | Hex | Uso |
|---|---|---|
| `color-success` | `#1F7A52` | “Listo”, “Impreso”, “Abierto”, validación OK |
| `color-success-soft` | `#E7F4ED` | Fondo de estados OK |
| `color-success-border` | `#BFE0D0` | Borde de chip OK |
| `color-info` | `#2F6BA8` | “En cola”, tiempos |
| `color-info-soft` | `#E9F1FA` | Fondo de estados informativos |
| `color-info-border` | `#C6DAEE` | Borde de chip informativo |
| `color-warning` | `#A45C08` | Avisos temporales, alta demanda |
| `color-warning-bg` | `#FDF0D8` | Fondo de aviso |
| `color-warning-border` | `#EBCB92` | Borde de aviso |
| `color-danger` | `#B2401E` | Errores de validación (terracota, no rojo puro) |
| `color-danger-soft` | `#FAE7DE` | Fondo de error |
| `color-danger-border` | `#EEBFA9` | Borde de error |
| `color-disabled` | `#B4A89C` | Controles deshabilitados |

> El verde anterior de la v1 queda como `success`. El naranja ocupa el rol de acento. Los errores usan terracota: siguen fuera del rojo de alarma y conviven con la paleta cálida.

### Tipografía

Familia única: **Inter Variable** (`font-sans`). Títulos con tracking negativo; cuerpo con interlineado amplio.

| Token | Valor | Uso |
|---|---|---|
| `font-display` | 800 56px / 0.98 · tracking -0.045em | Título editorial, número gigante |
| `font-hero` | 800 42px / 1.04 · tracking -0.04em | Hero de sección |
| `font-big-number` | 800 40px / 1 · tracking -0.035em | Números de ActionCard |
| `font-h1` | 700 30px / 1.12 · tracking -0.03em | Título de pantalla |
| `font-h2` | 700 23px / 1.22 · tracking -0.018em | Título de tarjeta grande |
| `font-h3` | 600 18px / 1.3 · tracking -0.01em | Título de tarjeta, nombre de local |
| `font-body` | 400 16px / 1.5 | Texto corrido |
| `font-body-strong` | 600 16px / 1.45 | Botones, énfasis |
| `font-small` | 400 14px / 1.45 | Metadata, descripciones |
| `font-caption` | 400 13px / 1.4 | Hints, notas |
| `font-label-caps` | 650 11px / 1.1 · tracking +0.12em | Labels de sección en mayúsculas |

### Radios

| Token | Valor | Uso |
|---|---|---|
| `radius-xs` | 10px | Código inline, detalles chicos |
| `radius-sm` | 14px | Cajas internas |
| `radius-md` | 18px | Inputs, botones de control, mini cards |
| `radius-lg` | 24px | Tarjetas de contenido, modales |
| `radius-xl` | 32px | Heroes, tarjetas grandes de sección |
| `radius-phone` | 44px | Marco de teléfono en mockups |
| `radius-pill` | 999px | Botones, chips, controles |

### Espaciado

Escala base 4px: `0 / 4 / 8 / 12 / 16 / 20 / 24 / 28 / 32 / 36 / 40 / 48 / 56 / 64`.

| Token | Valor | Uso |
|---|---|---|
| `space-gutter` | 20px | Padding lateral de pantalla |
| `space-card` | 20px | Padding interno de tarjetas |
| `space-section` | 40px | Separación entre secciones |
| `space-header` | 64px | Altura del AppHeader |
| `space-cta` | 56px | Altura del CTA fijo |
| `space-field` | 52px | Altura de inputs y botones md |
| `space-control` | 44px | IconButton md, avatar |
| `space-control-sm` | 36px | IconButton sm, tile de ícono |
| `space-logo` | 44px | Logo de imprenta |
| `space-dock` | 76px | Safe area / bottom nav |
| `space-textarea` | 112px | Altura mínima de textarea |

### Sombras, blur y gradientes

| Token | Valor | Uso |
|---|---|---|
| `shadow-soft` | `0 1px 2px … , 0 12px 32px -16px …` | Tarjetas, controles |
| `shadow-float` | `0 2px 6px … , 0 28px 64px -28px …` | Elementos flotantes, botón primario |
| `shadow-glow` | `0 18px 42px -18px rgb(240 100 36 / .55)` | Botón/hero naranja |
| `shadow-dock` | `0 -16px 48px -24px …` | Barra inferior fija |
| `shadow-rim` | `inset 0 1px 0 rgb(255 255 255 / .72)` | Luz interna en track/inputs |
| `blur-glass` | 16px | Backdrop blur de header, chips, controles |
| `blur-orb` | 80px | Manchas decorativas del fondo |
| `bg-sunset` | Gradiente 135° de `sun-1` a `sun-3` | Hero y tarjetas de marca |
| `bg-sunrise` | Gradiente 155° de `surface` a `accent-soft` | Tarjetas de selección y destacados |
| `bg-paper` | Radial cálido de `surface` a `fill` | Fondo de composiciones/mockups |
| `bg-ink-fade` | Gradiente de tinta `#2A231D` a `#1B1613` | Tarjetas oscuras |
| `bg-veil` | Gradiente de vidrio cálido | Overlays suaves |

### Patrones fijos

- **AppHeader**: altura 64px, fondo `glass`, `backdrop-blur-glass`, borde inferior `border-soft`. Izquierda: back circular + título, o logo + título. Derecha: chip neutro con la sección. Título `h3`; back con `IconButton` glass.
- **CTA fijo inferior**: pill de 56px, full-width, pegado abajo con safe area. Variantes: tinta (default), naranja (avance positivo), vidrio (acción secundaria), gris (deshabilitado).
- **Tarjeta base**: `surface`, borde `border-soft`, `radius-lg`, `shadow-soft`, padding 20px.
- **Selección**: ring de 2px `accent` (selección amable: local, tanda, papel) o `ink` (selección fuerte: pago). Fondo `sunrise` en la versión naranja.
- **Vidrio**: solo header, chips, icon buttons y capas flotantes. Borde `border-soft` o `glass-border` si va sobre un gradiente. No se usa vidrio en bloques largos de lectura.
- **Errores**: `danger-soft` + borde `danger-border` + texto `danger`, con ícono ✕. Nunca rojo puro.

---

## 3. Componentes reutilizables

### Núcleo

1. **AppHeader** — título, back circular opcional, logo, chip de sección, divisor inferior, vidrio.
2. **PrimaryButton** (tinta) / **AccentButton** (naranja, texto tinta) / **OutlineButton** (papel) / **GlassButton** (vidrio) / **SoftButton** (naranja suave) / **WarningOutlineButton** (ámbar) — full-width o auto; tamaños md/lg; loading y disabled.
3. **IconButton** — control circular de 36/44/52px. Tonos: glass, surface, ink, accent. Usado en back, filtros, acciones rápidas.
4. **Chip** — pill de estado o etiqueta. Tonos: neutral, accent, success, info, warning, danger, ink, glass. Variantes soft/outline. Tamaños sm/md.
5. **LinkText** — texto subrayado con decoración naranja.
6. **SectionLabel** — small-caps marrón cálido.
7. **Card** — contenedor base. Tonos: surface, glass, ink, sunrise. Selección: ink/accent/success.
8. **Divider** — soft/strong.
9. **TextInput / Select / Textarea** — superficie, borde suave, radio 18px, foco con ring naranja. Error con borde terracota.
10. **Stepper** — pill con `− valor +`, fondo surface y sombra suave.
11. **SegmentedControl** — track beige tipo pill, segmento activo en surface con sombra.
12. **RadioCard** — tarjeta seleccionable con indicador circular. Tono ink o accent; selección accent con fondo sunrise.
13. **ErrorNote** — caja terracota con ✕ y título opcional.

### Datos y feedback

14. **KeyValueRow** — label secundario izquierda, valor en tinta derecha.
15. **SummaryBox** — Card con KeyValueRows y nota opcional.
16. **FileCard** — ícono de archivo en tile naranja, nombre, metadata, estados loading/error/disabled, acciones.
17. **Dropzone** — caja dashed naranja con ícono circular y texto de formatos.
18. **ValidationList / ValidationItem** — filas con check en círculo `success-soft`, aviso terracota o estado pendiente.
19. **IconBox** — caja cuadrada grande con ✓ (success) o ✕ (danger).
20. **ProgressBar** — track `fill-deep`; fill tinta, gradiente `bg-sunset` o `success`.
21. **StatusChip / BadgeOpen / CountBadge** — implementados con Chip: neutral, success outline, accent o ink según contexto.
22. **AvisoBox / AlertBox** — caja ámbar con ⚠ para avisos temporales; caja con “!” para demanda.
23. **EmptyState / InfoCard** — tarjeta con título, descripción y pasos numerados.

### Locales, tandas y colas

24. **ActionCard** — tarjeta grande con ícono + label + número gigante. Variantes: tinta con gradiente `bg-ink-fade`, naranja con `bg-sunset`, outline/glass.
25. **LocalCard** — thumbnail, nombre, tagline, ★ rating, filas de cola presencial/virtual; selección con ring naranja y fondo sunrise.
26. **TandaCard (usuario)** — specs, local, progreso agrupado, espera estimada; tarjeta compatible con borde naranja; no compatible atenuada.
27. **TandaCard (imprenta)** — “Tanda N” + ícono impresora en tile, descripción, stats y PrimaryButton.
28. **OrderRow** — `#37` + persona + nombre + páginas + Chip de estado. `EN COLA` info, `IMPRESO` success, `IMPRIMIENDO` ink, `X MINUTOS` info; pedido propio con `success` outline.
29. **QueueVisualization** — íconos de persona: otros en tinta, vos en naranja, imprimiendo en success, atrás en muted.
30. **OrderStatusStepper** — nodos Recibido / Listo para retirar / Entregado con check success y círculos de tinta.
31. **SegmentedProgress** — Recibido (ink) / En cola (accent) / Listo (success).
32. **ReceiptTicket** — ticket con borde superior en zigzag y fondo surface.
33. **FloatingOrderPill** — pill flotante de vidrio oscuro con tiempo y botón naranja “Mi pedido”.
34. **PrinterTrayIllustration** — bandeja de impresora con contadores, trazo de tinta y acento naranja.

### Perfil de imprenta

35. **ProfileHeader** — foto con BadgeOpen/edición, logo, nombre, tagline, ★ rating.
36. **InfoBaseCard** — filas ícono + label + valor; inputs y AvisoBox en edición.
37. **ConcurrenciaCard** — cola virtual actual, promedio por hora, BarChart.
38. **BarChart** — barras `fill-deep`, barra pico `ink`, valores y horas en caption.
39. **CatalogCard** — chips de papel y acción “Ver todo / Editar catálogo”.
40. **ReviewsCard** — estrellas, RatingBars y carrusel de ReviewCards.
41. **RatingStars / RatingBar** — estrellas en tinta; fill de rating en naranja.
42. **ReviewCard** — estrellas + puntaje, quote, autor.
43. **MapSchematic** — plano isométrico con dot naranja y label “Piso 0”.
44. **FloorStackMap** — planos apilados con dots (ink = locales del piso, muted = otros pisos, accent = seleccionado), números de piso y BottomSheet de locales.

---

## 4. Pantallas por tipo de usuario

### A. USUARIO (estudiante)

| # | Pantalla | Contenido clave |
|---|---|---|
| U1 | **Homepage** | Header “Fadu Print / Inicio”. ActionCard tinta “Imprimir”; grid 2: “Buscar locales” (outline/glass) + “Tandas disponibles” (naranja). Lista “Últimos pedidos” (avatar iniciales + local + Chip de estado). Lista “Tandas hot” (ícono naranja + título + CountBadge). Footer ubicación. |
| U2 | **Nueva impresión — intro** | H1 + subtítulo, InfoCard “Imprimí sin vueltas” + pasos, OutlineButton “Buscar local”, “Tu último pedido / Sin pedidos todavía”, AccentButton fijo “Subir archivo”. |
| U3 | **Subir archivo** | Stepper copias, Dropzone, FileCard cargado, nota, link guía, AccentButton “Verificar”. En flujo tandas el botón “Verificar” es tinta. |
| U4a | **Conversión en curso** | FileCard (.docx), “Procesando archivo 65%” + ProgressBar `bg-sunset`, checklist (✓/…/—), links “Cancelar conversión” + guía, botón gris deshabilitado “Convirtiendo…”. |
| U4b | **Archivo convertido** | IconBox ✓ success, FileCard “Versión convertida”, ValidationList ✓, nota de revalidación, PrimaryButton “Continuar”. |
| U4c | **Archivo óptimo** | Igual a U4b pero con AccentButton naranja “Continuar” y texto “elegí papel y terminación”. |
| U4d | **Archivo rechazado** | IconBox ✕ terracota, ValidationList: ✓ tamaño + errores terracota (formato/resolución/color), explicación, links “Subir un archivo corregido” + guía, PrimaryButton “Convertir”. |
| U5 | **Especificaciones** | Subtítulo con archivo, input “Páginas a imprimir”, selects Tamaño + Gramaje, SegmentedControl B&N/Color, 3 RadioCards de papel (Obra/Ilustración/Reciclado), Textarea observaciones, precio estimado, PrimaryButton “Agregar al carrito”. |
| U6 | **Carrito** | FileCard con specs, “Editar especificaciones” + tacho, OutlineButton “Agregar otro archivo”, SummaryBox de totales, observaciones, PrimaryButton “Ir a imprimir”. |
| U7 | **¿Dónde imprimir? — comparación** | Subtítulo, explicación cola virtual/presencial, RadioCards de locales (nombre, ★, precio, chip “Menor espera” success o link “Ver detalle”, colas), disclaimer, PrimaryButton “Elegir [local]”. |
| U8 | **Detalle del local** | Foto, horario/teléfono, AlertBox demanda, BarChart, links catálogo/servicios, reseñas, mini mapa, PrimaryButton “Imprimir en [local]”. |
| U9 | **Impresión en tandas (match)** | “¡Ahorra tiempo en tandas!”, TandaCard destacada compatible, TandaCard no compatible atenuada, explicación, link “Continuar sin tanda”, PrimaryButton “Unirme a la tanda”. |
| U10 | **Forma de pago** | SummaryBox, 3 RadioCards (MercadoPago / Efectivo / Tarjeta), nota, PrimaryButton “Continuar”. |
| U11 | **Pago con tarjeta** | Inputs (número, titular, vencimiento + código, DNI), SummaryBox, nota, PrimaryButton “Pagar”. |
| U12 | **Pedido confirmado** | “¡Pedido confirmado!”, caja “Pedido #FADU-0248 · Retiro estimado”, OrderStatusStepper con success, SummaryBox, caja de retiro, link “Volver al inicio”, PrimaryButton “Ver mi pedido”. |
| U13 | **Inicio con pedido en curso** | U1 + hamburguesa + FloatingOrderPill inferior. |
| U14 | **Resumen — impresión en cola** | ReceiptTicket: “Tu Pedido #36” gigante, archivo + local + espera, SegmentedProgress, tarjeta “Cola virtual” con QueueVisualization + PrimaryButton “Ver pedidos”, tarjeta “Cola presencial” con QueueVisualization + Chip, PrimaryButton “Volver al inicio”. |
| U14b | **Resumen — Ver pedidos abierto** | Igual a U14 con la cola expandida: OrderRows (#33 IMPRESO … #36 “Vos” success outline … #40), botón “Mostrar menos”. |
| U15 | **Explorar — ¿Dónde imprimir? (mapa)** | FloorStackMap con dots, BottomSheet “Locales · Piso N” con LocalCards. |
| U16 | **Explorar — local seleccionado** | U15 con dot naranja + LocalCard con ring naranja + PrimaryButton “[Local] — Ver servicios”. |
| U17 | **Perfil de imprenta (público)** | ProfileHeader, InfoBaseCard, ConcurrenciaCard con AccentButton “Ver tandas actuales →” + BarChart, CatalogCard, ReviewsCard, MapSchematic. Footer sticky: OutlineButton “VER MÁS LOCALES” + AccentButton “IMPRIMIR”. |
| U18 | **Tandas disponibles (explorar)** | “¡Ahorra tiempo en tandas!”, lista de TandaCards (una destacada), explicación, link “Imprimir sin tanda”, PrimaryButton “Elegir tanda”. |
| U19 | **Tandas — subir archivo** | = U3 (botón “Verificar” tinta). |
| U20 | **Tandas — archivo óptimo** | = U4c con PrimaryButton tinta. Pendiente: versión “archivo rechazado” de este flujo, replicando U4d. |

### B. IMPRENTA (local)

| # | Pantalla | Contenido clave |
|---|---|---|
| I1 | **Panel (inicio)** | Header logo + “El Poli / Panel”. Logo en tarjeta, OutlineButton “Editar perfil” + WarningOutlineButton “Cargar Aviso”. Sección “Ahora”: tarjeta Cola virtual + tarjeta Para retirar, las dos a ancho completo. Sección “Reseñas”: fila “Ver y responder reviews” con chevron. |
| I2 | **Tanda (detalle)** | Header “El Poli / Tanda 1” con volver a la cola. H1 + subtítulo, métricas, PrinterTrayIllustration, OrderRows con los nombres de la tanda, CTA fijo “Imprimir tanda”. |
| I3 | **Cola virtual** | Header “El Poli / Cola”. Pedido o tanda imprimiéndose; la tanda usa tarjeta y botón violetas con la animación de tanda. Lista “En cola” con pedidos individuales y tandas mezcladas, y “Para retirar”. Las tandas abren I2. |
| I4 | **Editar mi perfil** | ProfileHeader en modo edición, InfoBaseCard con inputs + AvisoBox editable, ConcurrenciaCard con BarChart, CatalogCard con “Editar catálogo”, ReviewsCard, MapSchematic. |

### Qué comparten entre pantallas

- **U17 ↔ I4 (perfil de imprenta)**: misma pantalla, dos modos. Comparten ProfileHeader, InfoBaseCard, ConcurrenciaCard+BarChart, CatalogCard, ReviewsCard, MapSchematic. I4 agrega lápices, inputs, AvisoBox editable, “Editar catálogo”; U17 agrega “Ver tandas actuales”, footer de acciones y “Ver todo”.
- **U3/U4 ↔ U19/U20**: el flujo de tandas reutiliza Subir archivo + estados de validación (cambia el color del CTA: naranja vs tinta).
- **U4b/U4c/U4d**: una sola pantalla “Resultado de validación” con estados convertido / óptimo / rechazado + U4a progreso.
- **OrderRow** conecta los roles: la cola que la imprenta gestiona (I3) es la que el usuario ve en su ticket (U14b).
- **QueueVisualization**: cola virtual/presencial en LocalCard (U15), comparación (U7), perfil (U17/I4), ticket (U14) y panel (I1).
- **TandaRow** existe en versión usuario (U9/U18) e imprenta (fila dentro de I3); “Tandas hot” de U1 es la versión compacta.
- **SummaryBox + KeyValueRow**: U6, U10, U11, U12 y especificaciones.
- **Header, CTA fijo, Card, SectionLabel, Chip**: todas las pantallas de ambos roles.

---

## 5. Flujo de navegación

### Usuario — flujo principal (imprimir)

```
U1 Home
 ├─ "Imprimir" → U2 Nueva impresión
 │    ├─ "Subir archivo" → U3 Subir archivo → "Verificar" → U4 Validación
 │    │    ├─ Óptimo (U4c) ──"Continuar"──┐
 │    │    └─ Rechazado (U4d) ──"Convertir"──→ U4a Conversión ──→ U4b Convertido ──"Continuar"──┐
 │    │                                                                                         ▼
 │    │                                              U5 Especificaciones ──"Agregar al carrito"──→ U6 Carrito
 │    │                                                                                         │
 │    │                                                     "Ir a imprimir" ────────────────────┤
 │    ▼                                                                                         ▼
 │    └─ "Buscar local" → U15/U16                              ¿Hay tanda compatible?
 │                                                             ├─ sí → U9 "Unirme a la tanda" ──┐
 │                                                             └─ no → U7 Comparación de locales ┤
 │                                                                          (U7 "Ver detalle" → U8 Detalle del local → "Imprimir en X")
 │                                                                                              ▼
 │                                              U10 Forma de pago ──Tarjeta──→ U11 Tarjeta ──"Pagar"──┐
 │                                              U10 ──Efectivo/MP──"Continuar"───────────────────────┤
 │                                                                                                   ▼
 │                                              U12 Pedido confirmado ──"Ver mi pedido"──→ U14 Ticket en cola (⇄ U14b Ver pedidos)
 │                                                                                                   │
 └────────────────────────────────────────────────── U13 Home con FloatingOrderPill ←────────────────┘
                                                       ("Mi pedido" → U14)
```

### Usuario — flujo explorar locales

```
U1 Home → "Buscar locales" → U15 Mapa ¿Dónde imprimir?
   → tap LocalCard → U16 (selección naranja + CTA "Ver servicios")
   → U17 Perfil de imprenta
        ├─ "IMPRIMIR" → entra al flujo principal (U2/U3 con local preseleccionado)
        ├─ "Ver tandas actuales" → U18 Tandas disponibles
        └─ "VER MÁS LOCALES" → vuelve a U15
```

### Usuario — flujo tandas

```
U1 Home → "Tandas disponibles" (o "Tandas hot") → U18 Lista de tandas
   → "Elegir tanda" → U19 Subir archivo → U20 Validación (óptimo / [rechazado pendiente de diseño])
   → continúa al flujo principal con tanda ya elegida (especificaciones → pago → U12/U14)
   "Imprimir sin tanda" → U7
```

### Imprenta

```
I1 Panel
 ├─ "Cola virtual" → I3 Cola virtual (pedidos individuales + tandas)
 │                    └─ tanda → I2 Tanda (detalle) → "Imprimir tanda" → vuelve a I3
 ├─ "Para retirar" → I3 Cola virtual (sección Para retirar)
 ├─ "Editar perfil" → I4 Editar perfil (guardar → I1)
 ├─ "Cargar Aviso" → edición de aviso (modal o dentro de I4)
 └─ "Ver y responder reviews" → pantalla de reseñas (no diseñada aún)
```

**Conexión entre roles**: el pedido del usuario (U12 #FADU-0248 / ticket #36) aparece en tiempo real en la cola de la imprenta (I3). Cuando la imprenta confirma/avanza la tanda, el OrderRow cambia de estado en U14b (EN COLA → IMPRIMIENDO → IMPRESO) y el SegmentedProgress avanza.

---

## 6. Plan de implementación por etapas

### Etapa 0 — Fundaciones
- Tokens v2 de color, texto, radio, espaciado, sombra, blur y gradiente como variables CSS.
- Fuente Inter Variable, fondo de papel, selección naranja y foco accesible.
- Componentes núcleo: AppHeader glass, botones (6 variantes), IconButton, Chip, LinkText, SectionLabel, Card (4 tonos), Divider, inputs, Stepper, SegmentedControl, RadioCard, ErrorNote.
- Shell mobile, CTA fijo, status bar simulada y router.

### Etapa 1 — Componentes de datos compartidos
- KeyValueRow, SummaryBox, FileCard, Dropzone, ValidationList, IconBox, ProgressBar, Chip de estados, AvisoBox/AlertBox, InfoCard.
- OrderRow, ActionCard.
- BarChart, RatingStars, RatingBar, ReviewCard, CatalogChips, MapSchematic, PrinterTrayIllustration.

### Etapa 2 — Flujo principal de usuario (camino feliz)
- U1 → U2 → U3 → U4c → U5 → U6 → U7 → U10 → U11 → U12 → U14.
- Estado global del pedido (archivo, specs, local, tanda, pago) con datos mock.

### Etapa 3 — Estados de validación y tanda
- U4a Conversión (timer), U4b Convertido, U4d Rechazado; loop Convertir → Conversión → Convertido.
- U9 Impresión en tandas (match), U13 Home con FloatingOrderPill, U14b Ver pedidos expandido.

### Etapa 4 — Exploración de locales
- U15/U16 FloorStackMap + BottomSheet de locales.
- U17 Perfil público de imprenta.
- U18 Tandas disponibles + U19/U20 + diseñar estado “rechazado” faltante replicando U4d.

### Etapa 5 — Rol imprenta
- I1 Panel, I3 Cola virtual (pedidos + tandas), I2 Tanda (detalle).
- I4 Editar perfil reutilizando los componentes de U17 en modo edición + “Cargar Aviso”.

### Etapa 6 — Integración, pulido y comparación
- Simulación de sincronización entre roles.
- Estados vacíos y pantallas no diseñadas mínimas (reviews de imprenta).
- QA visual contra los PNG originales de ambos POVs, contraste AA y navegación por teclado.

---

## 7. Uso de los PNG originales

Los mockups son parte del sistema, no un descarte. Viven en:

- `/pov usuario` — 24 PNG del flujo del estudiante.
- `/pov imprenta` — 4 PNG del panel del local.

Los PNG se usan para:

1. comparar jerarquía y contenido de cada pantalla;
2. validar que la v2 no perdió estados ni acciones;
3. revisar el sistema contra la fuente original antes de tocar un flujo.

El logo del local (`public/logo-elpoli.png`) también se mantiene y se usa en el AppHeader y en la composición del panel de imprenta.
