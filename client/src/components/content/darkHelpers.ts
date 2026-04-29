/** Shared dark-mode class helpers for all Below pages */
export function darkClasses(dark: boolean) {
  return {
    card: dark ? 'bg-[#1f1e1d] border border-zinc-800' : 'bg-white border border-[#e8e6dc]',
    muted: dark ? 'text-[#dadadc]/80' : 'text-[#5e5d59]',
    emphasis: dark ? 'text-[#faf9f5]' : 'text-[#1a1918]',
    subtleBg: dark ? 'bg-[#1f1e1d]' : 'bg-[#f0eee6]',
    darkPanel: dark ? 'bg-[#0f1012]' : 'bg-[#1a1918]',
    borderColor: dark ? 'border-zinc-800' : 'border-[#e8e6dc]',
  };
}
