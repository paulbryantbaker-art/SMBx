interface PromptChipProps {
  label: string;
  prompt: string;
  onSend?: (prompt: string) => void;
}

export default function PromptChip({ label, prompt, onSend }: PromptChipProps) {
  if (!onSend) return null;
  return (
    <button
      onClick={() => onSend(prompt)}
      className="inline-flex px-4 py-2 rounded-full border border-gray-200 bg-white text-[13px] font-medium text-[#2D3142] hover:border-[#D4714E] hover:bg-[#FFF8F4] hover:text-[#D4714E] transition-all cursor-pointer shadow-sm hover:shadow-md active:scale-[0.97]"
      style={{ fontFamily: 'inherit' }}
      type="button"
    >
      {label}
    </button>
  );
}
