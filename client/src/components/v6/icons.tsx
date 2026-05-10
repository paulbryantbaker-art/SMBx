import type { IconName, Mode } from "./types";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarCheck2,
  ChartColumnIncreasing,
  Clock3,
  FileCheck2,
  FileText,
  FolderKanban,
  Layers2,
  Pin,
  Plus,
  ScanSearch,
  Settings2,
  X,
  type LucideIcon,
} from "lucide-react";

export const MODES: Mode[] = [
  { id: "today",    label: "Today",    count: "5",  icon: "today"   },
  { id: "pipeline", label: "Pipeline", count: "6",  icon: "feed"    },
  { id: "search",   label: "Search",   count: "6",  icon: "search"  },
  { id: "files",    label: "Files",    count: "24", icon: "library" },
];

export function V6Icon({ name, size = 14 }: { name: IconName; size?: number }) {
  const icons: Record<IconName, LucideIcon> = {
    today: CalendarCheck2,
    search: ScanSearch,
    doc: FileCheck2,
    chart: ChartColumnIncreasing,
    feed: Layers2,
    library: FolderKanban,
    settings: Settings2,
    history: Clock3,
    plus: Plus,
    close: X,
    pin: Pin,
    back: ArrowLeft,
    deal: BriefcaseBusiness,
  };
  const Icon = icons[name] ?? FileText;
  return <Icon size={size} strokeWidth={2.15} absoluteStrokeWidth aria-hidden="true" />;
}
