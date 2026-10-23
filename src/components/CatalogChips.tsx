import type { Local } from "../demo/types";
import { paperNames, stockTone } from "../demo/pricing";
import { Chip } from "./Chip";

export function CatalogChips({ local }: { local: Local }) {
  return (
    <div className="flex flex-wrap gap-2">
      {local.papers.map((paper) => (
        <Chip key={paper} tone={stockTone(local.stock[paper])}>
          {paperNames[paper]}
        </Chip>
      ))}
    </div>
  );
}
