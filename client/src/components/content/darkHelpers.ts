/** Shared dark-mode class helpers for all Below pages */
export function darkClasses(dark: boolean) {
  return {
    card: dark ? 'bg-[#2f3133] border border-zinc-800' : 'bg-white border border-[#eeeef0]',
    muted: dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]',
    emphasis: dark ? 'text-[#f9f9fc]' : 'text-[#1a1c1e]',
    subtleBg: dark ? 'bg-[#2f3133]' : 'bg-[#f3f3f6]',
    darkPanel: dark ? 'bg-[#0f1012]' : 'bg-[#1a1c1e]',
    borderColor: dark ? 'border-zinc-800' : 'border-[#eeeef0]',
  };
}
