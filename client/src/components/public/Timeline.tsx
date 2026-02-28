interface TimelineStep {
  num: number;
  title: string;
  price: string;
  free: boolean;
  desc: string;
  detail?: string;
}

interface Props {
  steps: TimelineStep[];
}

export default function Timeline({ steps }: Props) {
  return (
    <div className="max-w-[720px] mx-auto relative">
      {/* Vertical line */}
      <div className="absolute left-[27px] top-6 bottom-6 w-0.5 bg-[#E8E4DC]" />

      {steps.map((step) => (
        <div key={step.num} className="flex gap-6 py-8 relative group">
          {/* Numbered dot */}
          <div className="w-14 h-14 rounded-full bg-white border-2 border-[#E8E4DC] flex items-center justify-center font-sans text-lg font-black text-[#7A766E] shrink-0 z-10 transition-all duration-300 group-hover:border-[#D4714E] group-hover:text-[#D4714E] group-hover:bg-[#FFF0EB]">
            {step.num}
          </div>

          {/* Content */}
          <div className="pt-2">
            <h3 className="text-lg font-bold text-[#1A1A18] mb-1.5 m-0">{step.title}</h3>
            <span className={`inline-block text-xs font-bold uppercase tracking-[.08em] px-2.5 py-[3px] rounded-full mb-2.5 ${
              step.free
                ? 'bg-[#E8F5E9] text-[#2E7D32]'
                : 'bg-[#FFF0EB] text-[#D4714E]'
            }`}>
              {step.price}
            </span>
            <p className="text-sm text-[#7A766E] leading-[1.6] max-w-[480px] m-0">{step.desc}</p>
            {step.detail && (
              <div className="mt-3 px-[18px] py-[14px] bg-[#F3F0EA] rounded-2xl text-[13px] text-[#4A4843] leading-[1.55]">
                {step.detail}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
