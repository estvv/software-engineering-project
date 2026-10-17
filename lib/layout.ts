// C3 Table Layout: table IDs and grid positions, from data/layout.json.

import layoutData from "@/data/layout.json";
import type { LayoutTable } from "./types";

export function getLayout(): LayoutTable[] {
  return layoutData.tables;
}
