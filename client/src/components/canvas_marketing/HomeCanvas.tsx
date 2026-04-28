/**
 * HomeCanvas — Adapter + variant switcher for the Edition home.
 *
 * AppShell mounts <HomeCanvas> at "/" with the V21 prop signature
 * (onSend, onGoJourney(persona?), onGoHow, onFocusChat, onGoLogin, dark).
 * V22 and V23 expect a different shape; this adapter maps AppShell's
 * V21 props → V22/V23's shape so the AppShell call site stays stable.
 *
 * Variant switching (2026-04-27 → V23C promoted to default):
 *   default      → MarketingHomeV23C (Anthropic-restraint adoption — current)
 *   ?v=b         → MarketingHomeV23B (Spread editorial — frozen reference)
 *   ?v=22b       → MarketingHomeV22  (Original Cowork DL editorial — fallback)
 *
 * V23B and V22b are lazy-loaded so the V23C default path keeps its bundle
 * profile minimal. The chat rail (<YuliaWalkthroughV22 />) is rendered
 * at the AppShell level — not here — so all variants share it.
 */

import { lazy, Suspense } from "react";
import MarketingHomeV23C from "./edition/MarketingHomeV23C";

const MarketingHomeV23B = lazy(() => import("./edition/MarketingHomeV23B"));
const MarketingHomeV22 = lazy(() =>
  import("./edition/MarketingHomeV22").then((m) => ({ default: m.MarketingHome }))
);

export type PersonaKey =
  | "searcher" | "advisor" | "broker"
  | "sponsor" | "banker" | "planner";

interface Props {
  onSend: (msg: string) => void;
  onGoJourney: (persona?: PersonaKey) => void;
  onGoHow: () => void;
  onFocusChat: () => void;
  onGoLogin?: () => void;
  /** AppShell signature compat. The Edition is always cream regardless. */
  dark: boolean;
}

type Variant = "c" | "b" | "22b";

function getVariant(): Variant {
  if (typeof window === "undefined") return "c";
  const v = new URL(window.location.href).searchParams.get("v");
  if (v === "b") return "b";
  if (v === "22b") return "22b";
  return "c"; // V23C is the canonical home
}

export default function HomeCanvas({
  onSend,
  onGoJourney,
  onGoHow,
  onFocusChat,
}: Props) {
  const variant = getVariant();

  if (variant === "b") {
    return (
      <Suspense fallback={null}>
        <MarketingHomeV23B
          onSend={onSend}
          onFocusChat={onFocusChat}
          onGoJourney={() => onGoJourney()}
          onGoHowItWorks={onGoHow}
        />
      </Suspense>
    );
  }

  if (variant === "22b") {
    return (
      <Suspense fallback={null}>
        <MarketingHomeV22
          onFocusChat={onFocusChat}
          onGoJourney={() => onGoJourney()}
          onGoHowItWorks={onGoHow}
        />
      </Suspense>
    );
  }

  // Default: V23C (Anthropic restraint).
  return (
    <MarketingHomeV23C
      onSend={onSend}
      onFocusChat={onFocusChat}
      onGoJourney={() => onGoJourney()}
      onGoHowItWorks={onGoHow}
    />
  );
}
