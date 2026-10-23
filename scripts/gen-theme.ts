import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { tokens } from "../src/theme/tokens.ts";

const outFile = fileURLToPath(new URL("../src/theme/theme.generated.css", import.meta.url));

const px = (n: number): string => `${n}px`;

const lines: string[] = [
  "/* GENERADO por scripts/gen-theme.ts desde src/theme/tokens.ts. No editar a mano. */",
  "@theme {",
  // Tailwind solo expone lo que definimos acá: sin colores, tamaños ni espacios por defecto.
  "  --color-*: initial;",
  "  --font-*: initial;",
  "  --text-*: initial;",
  "  --radius-*: initial;",
  "  --spacing-*: initial;",
  "  --container-*: initial;",
  "  --shadow-*: initial;",
  "  --blur-*: initial;",
  "  --background-image-*: initial;",
];

for (const [name, value] of Object.entries(tokens.color)) {
  lines.push(`  --color-${name}: ${value};`);
}

lines.push(`  --font-sans: ${tokens.font.sans};`);

for (const [name, style] of Object.entries(tokens.text)) {
  lines.push(`  --text-${name}: ${px(style.size)};`);
  lines.push(`  --text-${name}--line-height: ${style.lineHeight};`);
  lines.push(`  --text-${name}--font-weight: ${style.weight};`);
  if ("letterSpacing" in style) {
    lines.push(`  --text-${name}--letter-spacing: ${style.letterSpacing};`);
  }
}

for (const [name, value] of Object.entries(tokens.radius)) {
  lines.push(`  --radius-${name}: ${px(value)};`);
}

for (const [name, value] of Object.entries(tokens.spacing)) {
  lines.push(`  --spacing-${name}: ${px(value)};`);
}

for (const [name, value] of Object.entries(tokens.container)) {
  lines.push(`  --container-${name}: ${px(value)};`);
}

for (const [name, value] of Object.entries(tokens.shadow)) {
  lines.push(`  --shadow-${name}: ${value};`);
}

for (const [name, value] of Object.entries(tokens.blur)) {
  lines.push(`  --blur-${name}: ${px(value)};`);
}

for (const [name, value] of Object.entries(tokens.gradient)) {
  lines.push(`  --background-image-${name}: ${value};`);
}

lines.push("}", "");

writeFileSync(outFile, lines.join("\n"));
console.log(`theme generado: ${outFile}`);
