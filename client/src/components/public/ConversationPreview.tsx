import YuliaAvatar from './YuliaAvatar';

export default function ConversationPreview() {
  return (
    <div className="bg-white border border-[#E0DCD4] rounded-[20px] overflow-hidden shadow-[0_16px_64px_rgba(0,0,0,0.04)]">
      {/* Header */}
      <div className="flex items-center gap-3 px-7 py-5 border-b border-[#E0DCD4] bg-[#FAF9F7]">
        <YuliaAvatar size={32} />
        <span className="font-semibold text-sm">Yulia &middot; AI Deal Advisor</span>
      </div>

      {/* Messages */}
      <div className="px-7 py-7 flex flex-col gap-5">
        {/* User message */}
        <div className="flex justify-end">
          <div className="max-w-[75%] bg-[#1A1A18] text-white rounded-2xl rounded-br-[4px] px-[18px] py-[14px]">
            <p className="text-sm leading-[1.55] m-0">
              I want to sell my HVAC business in Dallas. Revenue is about $3.2M, I take home around $640K.
            </p>
          </div>
        </div>

        {/* Yulia message with insight */}
        <div className="flex items-start gap-3">
          <YuliaAvatar size={32} className="mt-0.5" />
          <div className="max-w-[75%] bg-[#FAF9F7] border border-[#E0DCD4] rounded-2xl rounded-bl-[4px] px-[18px] py-[14px]">
            <p className="text-sm leading-[1.55] m-0">
              Great &mdash; let me work with those numbers. Based on your revenue and owner compensation, I&apos;m calculating an adjusted EBITDA of approximately <span className="text-[#D4714E] font-semibold">$780K</span> after typical add-backs for owner-operated HVAC businesses.
            </p>
            <div className="mt-2.5 px-3.5 py-2.5 bg-[#FFF0EB] rounded-[10px]">
              <p className="text-[13px] text-[#BE6342] leading-[1.5] m-0">
                &#x1F4CA; HVAC companies in the Dallas-Fort Worth market are currently trading at 4.5&ndash;6&times; EBITDA. Three PE firms are actively consolidating in your region. Your preliminary range: <strong>$3.5M &ndash; $4.7M</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Context line */}
        <p className="text-xs text-[#7A766E] text-center py-1 m-0">
          &mdash; This analysis took 30 seconds. A traditional advisor takes 2&ndash;4 weeks. &mdash;
        </p>

        {/* User reply */}
        <div className="flex justify-end">
          <div className="max-w-[75%] bg-[#1A1A18] text-white rounded-2xl rounded-br-[4px] px-[18px] py-[14px]">
            <p className="text-sm leading-[1.55] m-0">
              That&apos;s way more than I expected. What do we do next?
            </p>
          </div>
        </div>

        {/* Yulia follow-up */}
        <div className="flex items-start gap-3">
          <YuliaAvatar size={32} className="mt-0.5" />
          <div className="max-w-[75%] bg-[#FAF9F7] border border-[#E0DCD4] rounded-2xl rounded-bl-[4px] px-[18px] py-[14px]">
            <p className="text-sm leading-[1.55] m-0">
              Let&apos;s build your financial package and identify your best buyers. I&apos;ll walk you through every step &mdash; or if you&apos;re working with a broker, invite them in and I&apos;ll produce the work product they need to get you to market faster.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
