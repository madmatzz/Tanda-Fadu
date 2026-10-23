import type { DemoFile, FileColor, PaperSize, PrintSpecs, ValidationState } from "./types";
import { humanFileSize } from "./pricing";

export const demoFiles: DemoFile[] = [
  {
    name: "entrega_final.pdf",
    sizeLabel: "4,2 MB",
    pages: 8,
    kind: "pdf",
    state: "pendiente",
    pageSize: "A4",
    ppi: 300,
    color: "gris",
  },
  {
    name: "monografia.docx",
    sizeLabel: "4,2 MB",
    pages: 8,
    kind: "docx",
    state: "pendiente",
    pageSize: "A4",
    ppi: 300,
    color: "rgb",
  },
  {
    name: "foto-baja-res.jpg",
    sizeLabel: "3,1 MB",
    pages: 1,
    kind: "jpg",
    state: "pendiente",
    pageSize: "A4",
    ppi: 150,
    color: "rgb",
  },
];

export function demoFileByName(name: string): DemoFile {
  return structuredClone(demoFiles.find((file) => file.name === name) ?? demoFiles[0]);
}

export function fileFromUpload(file: File): DemoFile {
  const extension = file.name.split(".").pop()?.toLowerCase();
  const kind = extension === "docx" || extension === "doc" ? "docx" : extension === "jpg" || extension === "jpeg" || extension === "png" ? "jpg" : "pdf";
  return {
    name: file.name,
    sizeLabel: humanFileSize(file.size),
    pages: kind === "jpg" ? 1 : 8,
    kind,
    state: "pendiente",
    pageSize: "A4",
    ppi: kind === "jpg" ? 150 : 300,
    color: kind === "pdf" ? "gris" : "rgb",
  };
}

/** Datos leídos del archivo, con valores por defecto para archivos viejos de la demo. */
export function fileInfo(file: DemoFile): { pageSize: PaperSize; ppi: number; color: FileColor } {
  return {
    pageSize: file.pageSize ?? "A4",
    ppi: file.ppi ?? 300,
    color: file.color ?? "gris",
  };
}

export function fileMeta(file: DemoFile): string {
  const info = fileInfo(file);
  return `${file.pages} ${file.pages === 1 ? "página" : "páginas"} · ${info.pageSize} · ${info.ppi} ppp · ${file.sizeLabel}`;
}

/**
 * ok: cumple · ajuste: la app lo corrige sola (conversión) · error: hay que cambiar el archivo.
 */
export type FileCheckStatus = "ok" | "ajuste" | "error";

export interface FileCheck {
  label: string;
  status: FileCheckStatus;
  value: string;
  /** Qué hace la app durante la conversión y cómo queda, solo para `ajuste`. */
  fix?: string;
  done?: string;
}

/** Compara lo que tiene el archivo contra lo que el usuario pidió imprimir. */
export function fileChecks(file: DemoFile, specs: PrintSpecs): FileCheck[] {
  const info = fileInfo(file);
  const checks: FileCheck[] = [];

  checks.push(
    file.kind === "docx"
      ? {
          label: "Formato",
          status: "ajuste",
          value: "Word: se convierte a PDF",
          fix: "Convirtiendo a PDF",
          done: "Convertido a PDF",
        }
      : { label: "Formato", status: "ok", value: file.kind === "pdf" ? "PDF compatible" : "Imagen compatible" },
  );

  checks.push({ label: "Peso", status: "ok", value: `${file.sizeLabel} / máx. 25 MB` });

  checks.push(
    info.ppi >= 300
      ? { label: "Resolución", status: "ok", value: `${info.ppi} ppp` }
      : { label: "Resolución", status: "error", value: `${info.ppi} ppp: el mínimo es 300 ppp` },
  );

  checks.push(
    info.pageSize === specs.size
      ? { label: "Tamaño", status: "ok", value: `${info.pageSize}` }
      : {
          label: "Tamaño",
          status: "ajuste",
          value: `Archivo ${info.pageSize}: se escala a ${specs.size}`,
          fix: `Escalando a ${specs.size}`,
          done: `Escalado a ${specs.size}`,
        },
  );

  if (specs.mode === "bn") {
    checks.push(
      info.color === "rgb"
        ? {
            label: "Color",
            status: "ajuste",
            value: "Archivo a color: se pasa a escala de grises",
            fix: "Pasando a escala de grises",
            done: "Pasado a escala de grises",
          }
        : { label: "Color", status: "ok", value: "Escala de grises" },
    );
  } else {
    checks.push(
      info.color === "rgb"
        ? { label: "Color", status: "ok", value: "Color" }
        : { label: "Color", status: "ok", value: "Archivo en grises: sale sin color" },
    );
  }

  return checks;
}

export function validationOutcome(
  file: DemoFile,
  specs: PrintSpecs,
): Extract<ValidationState, "optimo" | "ajustable" | "rechazado"> {
  const checks = fileChecks(file, specs);
  if (checks.some((check) => check.status === "error")) return "rechazado";
  if (checks.some((check) => check.status === "ajuste")) return "ajustable";
  return "optimo";
}

/** Texto del botón que corrige el archivo según qué haya que ajustar. */
export function fixActionLabel(checks: FileCheck[]): string {
  const fixes = checks.filter((check) => check.status === "ajuste");
  const convertsFormat = fixes.some((check) => check.label === "Formato");
  if (convertsFormat) return fixes.length > 1 ? "Convertir y ajustar" : "Convertir a PDF";
  return "Ajustar archivo";
}

/** Cuenta las páginas de un rango tipo "1-3, 6". Devuelve null si el rango no es válido. */
export function countPages(range: string, max: number): number | null {
  const parts = range.split(",").map((part) => part.trim()).filter(Boolean);
  if (parts.length === 0) return null;
  const pages = new Set<number>();
  for (const part of parts) {
    const match = /^(\d+)\s*(?:-\s*(\d+))?$/.exec(part);
    if (!match) return null;
    const from = Number(match[1]);
    const to = match[2] ? Number(match[2]) : from;
    if (from < 1 || to > max || from > to) return null;
    for (let page = from; page <= to; page += 1) pages.add(page);
  }
  return pages.size;
}

export function fullRange(pages: number): string {
  return pages === 1 ? "1" : `1-${pages}`;
}
