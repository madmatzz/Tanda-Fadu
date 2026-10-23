// Única fuente de verdad del sistema gráfico. Derivado de DESIGN.md §1.
// Dirección v2 · Papel & mandarina: papel cálido, tinta de riso, capas de vidrio.
// Después de editar este archivo: `npm run gen:theme` (lo corren predev/prebuild).
// Los componentes NO pueden escribir hex, px ni fuentes: solo clases que salen de acá.

export const tokens = {
  color: {
    // Papel y superficies
    bg: "#F4EEE6",
    surface: "#FFFCF7",
    "surface-soft": "#FBF6EF",
    fill: "#F1E9DE",
    "fill-deep": "#E6DACB",

    // Tinta
    ink: "#1B1613",
    "ink-soft": "#4D443C",
    "text-secondary": "#5F544A",
    "text-muted": "#74685C",

    // Líneas y capas de vidrio
    border: "#E4D9CC",
    "border-soft": "#EFE6DB",
    glass: "rgb(255 252 247 / 0.68)",
    "glass-strong": "rgb(255 252 247 / 0.86)",
    "glass-border": "rgb(255 255 255 / 0.72)",
    "ink-glass": "rgb(27 22 19 / 0.78)",
    overlay: "rgb(27 22 19 / 0.38)",

    // Acento mandarina (riso)
    accent: "#F06424",
    "accent-dark": "#C0450F",
    "accent-ink": "#8F300B",
    "accent-soft": "#FDE8DC",
    "accent-border": "#F6C4A9",
    "sun-1": "#FFC08E",
    "sun-2": "#FA8246",
    "sun-3": "#E8501A",

    // Estados
    success: "#1F7A52",
    "success-soft": "#E7F4ED",
    "success-border": "#BFE0D0",
    info: "#2F6BA8",
    "info-soft": "#E9F1FA",
    "info-border": "#C6DAEE",
    warning: "#A45C08",
    "warning-bg": "#FDF0D8",
    "warning-border": "#EBCB92",
    danger: "#B2401E",
    "danger-soft": "#FAE7DE",
    "danger-border": "#EEBFA9",
    disabled: "#B4A89C",
  },

  font: {
    sans: '"Inter Variable", "Inter", -apple-system, "Helvetica Neue", sans-serif',
  },

  text: {
    display: { size: 56, lineHeight: 0.98, weight: 800, letterSpacing: "-0.045em" },
    hero: { size: 42, lineHeight: 1.04, weight: 800, letterSpacing: "-0.04em" },
    "big-number": { size: 40, lineHeight: 1, weight: 800, letterSpacing: "-0.035em" },
    h1: { size: 30, lineHeight: 1.12, weight: 700, letterSpacing: "-0.03em" },
    h2: { size: 23, lineHeight: 1.22, weight: 700, letterSpacing: "-0.018em" },
    h3: { size: 18, lineHeight: 1.3, weight: 600, letterSpacing: "-0.01em" },
    body: { size: 16, lineHeight: 1.5, weight: 400 },
    "body-strong": { size: 16, lineHeight: 1.45, weight: 600 },
    small: { size: 14, lineHeight: 1.45, weight: 400 },
    caption: { size: 13, lineHeight: 1.4, weight: 400 },
    "label-caps": { size: 11, lineHeight: 1.1, weight: 650, letterSpacing: "0.12em" },
  },

  radius: {
    xs: 10,
    sm: 14,
    md: 18,
    lg: 24,
    xl: 32,
    phone: 44,
    device: 54,
    pill: 999,
  },

  // Escala base 4px. Los nombres semánticos son alias de la escala o medidas fijas.
  spacing: {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    7: 28,
    8: 32,
    9: 36,
    10: 40,
    12: 48,
    14: 56,
    16: 64,
    gutter: 20,
    card: 20,
    section: 40,
    header: 64,
    cta: 56,
    field: 52,
    textarea: 112,
    icon: 20,
    "icon-lg": 24,
    logo: 44,
    control: 44,
    "control-sm": 36,
    thumb: 56,
    dock: 76,
    orb: 320,
    "island-w": 126,
    "island-h": 37,
    "safe-top": 62,
    "safe-bottom": 34,
  },

  container: {
    phone: 390,
    device: 402,
    "device-h": 874,
    prose: 640,
    doc: 1120,
  },

  shadow: {
    soft: "0 1px 2px rgb(40 28 18 / 0.04), 0 12px 32px -16px rgb(40 28 18 / 0.16)",
    float: "0 2px 6px rgb(40 28 18 / 0.05), 0 28px 64px -28px rgb(40 28 18 / 0.34)",
    glow: "0 18px 42px -18px rgb(240 100 36 / 0.55)",
    dock: "0 -16px 48px -24px rgb(40 28 18 / 0.25)",
    rim: "inset 0 1px 0 rgb(255 255 255 / 0.72)",
    device: "0 40px 120px -36px rgb(40 28 18 / 0.48), 0 8px 24px -12px rgb(40 28 18 / 0.22)",
  },

  blur: {
    glass: 16,
    orb: 80,
  },

  gradient: {
    sunset:
      "linear-gradient(135deg, #FFC08E 0%, #FA8246 40%, #F06424 68%, #D94812 100%)",
    sunrise: "linear-gradient(155deg, #FFF7EF 0%, #FDE8DC 52%, #F9D4BE 100%)",
    paper: "radial-gradient(120% 110% at 12% 0%, #FFFCF7 0%, #F6F0E7 48%, #EDE3D5 100%)",
    "ink-fade": "linear-gradient(165deg, #2A231D 0%, #1B1613 100%)",
    veil: "linear-gradient(180deg, rgb(255 252 247 / 0.82) 0%, rgb(255 252 247 / 0.52) 100%)",
  },
} as const;

export type ColorToken = keyof typeof tokens.color;
export type TextToken = keyof typeof tokens.text;
export type RadiusToken = keyof typeof tokens.radius;
export type SpacingToken = keyof typeof tokens.spacing;
export type ShadowToken = keyof typeof tokens.shadow;
export type BlurToken = keyof typeof tokens.blur;
export type GradientToken = keyof typeof tokens.gradient;
