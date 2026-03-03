export function Suggestion({ text, onClick }: { text: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="bg-white border border-[#EAE6DF] text-[#6E6A63] text-[13px] md:text-sm font-medium px-4 py-2.5 rounded-full hover:border-[#D4714E] hover:text-[#D4714E] hover:shadow-sm transition-all cursor-pointer text-left"
      type="button"
    >
      &ldquo;{text}&rdquo;
    </button>
  );
}

export function Badge({ text }: { text: string }) {
  return (
    <div className="bg-[#F8F6F1] border border-[#EAE6DF] text-[#6E6A63] text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm">
      {text}
    </div>
  );
}

export function OutcomeCard({ tag, title, desc }: { tag: string; title: string; desc: string }) {
  return (
    <div className="bg-[#FDFCFB] border border-[#EAE6DF] p-8 rounded-3xl hover:shadow-md transition-all flex flex-col">
      <div className="text-xs font-black text-[#A9A49C] uppercase tracking-widest mb-4">{tag}</div>
      <h3 className="text-2xl font-bold mb-3">{title}</h3>
      <p className="text-[#6E6A63] leading-relaxed text-[15px] flex-1">{desc}</p>
    </div>
  );
}

export function StepCard({ num, title, desc }: { num: string; title: string; desc: string }) {
  return (
    <div className="flex gap-6 items-start p-6 bg-[#FDFCFB] rounded-2xl border border-[#EAE6DF]">
      <div className="w-12 h-12 rounded-full bg-[#FFF0EB] text-[#D4714E] flex items-center justify-center font-black text-xl shrink-0">
        {num}
      </div>
      <div>
        <h4 className="text-xl font-bold mb-2">{title}</h4>
        <p className="text-[#6E6A63] leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
