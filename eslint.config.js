import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

// Regla del sistema gráfico: ningún valor de diseño suelto fuera de src/theme.
const RAW_VALUE_CHECKS = [
  { pattern: /#[0-9a-fA-F]{3,8}\b/, message: "Hex suelto: usá un token de src/theme/tokens.ts" },
  { pattern: /\b\d*\.?\d+px\b/, message: "px suelto: usá un token de espaciado, radio, texto o contenedor" },
  { pattern: /\b(Inter|Helvetica|Arial|Times)\b/, message: "Fuente suelta: usá font-sans" },
  { pattern: /-\[[^\]]*\]/, message: "Valor arbitrario de Tailwind: usá un token" },
];

const noRawDesignValues = {
  meta: { type: "problem", schema: [] },
  create(context) {
    function check(node, text) {
      for (const { pattern, message } of RAW_VALUE_CHECKS) {
        if (pattern.test(text)) {
          context.report({ node, message });
          return;
        }
      }
    }
    return {
      Literal(node) {
        if (typeof node.value === "string") check(node, node.value);
      },
      TemplateElement(node) {
        const text = node.value.cooked ?? "";
        check(node, text);
        if (/^px\b/.test(text)) {
          context.report({ node, message: "px suelto construido con template: usá un token o src/theme/format" });
        }
      },
      JSXAttribute(node) {
        if (node.name.name === "style") {
          context.report({ node, message: "style inline prohibido: usá clases de tokens" });
        }
      },
    };
  },
};

export default tseslint.config(
  { ignores: ["dist", "node_modules", "src/theme/**", "scripts/**"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: { globals: globals.browser },
    plugins: {
      "react-hooks": reactHooks,
      tokens: { rules: { "no-raw-design-values": noRawDesignValues } },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "tokens/no-raw-design-values": "error",
    },
  },
);
