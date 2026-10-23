import type { DemoFile } from "./types";
import { humanFileSize } from "./pricing";

export const demoFiles: DemoFile[] = [
  {
    name: "entrega_final.pdf",
    sizeLabel: "4,2 MB",
    pages: 8,
    kind: "pdf",
    state: "optimo",
  },
  {
    name: "monografia.docx",
    sizeLabel: "4,2 MB",
    pages: 8,
    kind: "docx",
    state: "conversion",
    progress: 65,
  },
  {
    name: "foto-baja-res.jpg",
    sizeLabel: "3,1 MB",
    pages: 1,
    kind: "jpg",
    state: "rechazado",
  },
];

export function demoFileByName(name: string): DemoFile {
  return structuredClone(demoFiles.find((file) => file.name === name) ?? demoFiles[0]);
}

export function fileFromUpload(file: File): DemoFile {
  const extension = file.name.split(".").pop()?.toLowerCase();
  const kind = extension === "docx" || extension === "doc" ? "docx" : extension === "jpg" || extension === "jpeg" || extension === "png" ? "jpg" : "pdf";
  const pages = kind === "jpg" ? 1 : 8;
  const state = kind === "docx" ? "conversion" : kind === "jpg" ? "rechazado" : "optimo";
  return {
    name: file.name,
    sizeLabel: humanFileSize(file.size),
    pages,
    kind,
    state,
    progress: kind === "docx" ? 65 : undefined,
  };
}
