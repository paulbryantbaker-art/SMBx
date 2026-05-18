import type { IconName, Mode } from "./types";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  ChartColumnIncreasing,
  ChartNoAxesCombined,
  Clock4,
  FileCheck2,
  FileText,
  FolderClosed,
  Images,
  Pin,
  Plus,
  Search,
  SlidersHorizontal,
  X,
  type LucideIcon,
} from "lucide-react";

export const MODES: Mode[] = [
  { id: "today",    label: "Today",    count: "5",  icon: "today"   },
  { id: "pipeline", label: "Pipeline", count: "6",  icon: "feed"    },
  { id: "search",   label: "Search",   count: "6",  icon: "search"  },
  { id: "studio",   label: "Studio",   count: "7",  icon: "studio"  },
  { id: "files",    label: "Files",    count: "24", icon: "library" },
];

export function V6Icon({ name, size = 14 }: { name: IconName; size?: number }) {
  const icons: Record<IconName, LucideIcon> = {
    today: CalendarDays,
    search: Search,
    doc: FileCheck2,
    chart: ChartColumnIncreasing,
    feed: ChartNoAxesCombined,
    library: FolderClosed,
    settings: SlidersHorizontal,
    history: Clock4,
    plus: Plus,
    close: X,
    pin: Pin,
    back: ArrowLeft,
    deal: BriefcaseBusiness,
    studio: Images,
  };
  const Icon = icons[name] ?? FileText;
  return <Icon size={size} strokeWidth={2.15} absoluteStrokeWidth aria-hidden="true" />;
}
