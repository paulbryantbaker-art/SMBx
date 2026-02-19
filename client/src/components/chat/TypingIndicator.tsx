export default function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-cream rounded-2xl px-4 py-3 max-w-[80%]">
        <div className="flex gap-1.5 items-center h-5">
          <span className="w-2 h-2 rounded-full bg-text-tertiary animate-[dotPulse_1s_ease-in-out_infinite]" />
          <span className="w-2 h-2 rounded-full bg-text-tertiary animate-[dotPulse_1s_ease-in-out_infinite_150ms]" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 rounded-full bg-text-tertiary animate-[dotPulse_1s_ease-in-out_infinite_300ms]" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
