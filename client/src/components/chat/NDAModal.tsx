import { useState } from 'react';
import { authHeaders } from '../../hooks/useAuth';

interface NDAModalProps {
  dealId: number;
  dealName?: string;
  inviterName?: string;
  onAccept: () => void;
  onDecline: () => void;
}

export default function NDAModal({ dealId, dealName, inviterName, onAccept, onDecline }: NDAModalProps) {
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleAccept = async () => {
    if (!agreed || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/deals/${dealId}/sign-nda`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
      });
      if (res.ok) {
        onAccept();
        return;
      }
    } catch { /* ignore */ }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,.4)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden" style={{ animation: 'slideUp 0.25s ease' }}>
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#FFF0EB] flex items-center justify-center shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D44A78" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#0D0D0D] m-0">Non-Disclosure Agreement</h2>
              <p className="text-xs text-[#6E6A63] m-0 mt-0.5">Required before accessing deal materials</p>
            </div>
          </div>
        </div>

        {/* NDA Content */}
        <div className="px-6 py-4 bg-[#FAFAF8] mx-6 rounded-lg max-h-[300px] overflow-y-auto text-[12px] leading-relaxed text-[#3D3B37]" style={{ border: '1px solid #EBE7DF' }}>
          <p className="font-semibold text-[#0D0D0D] mb-3">CONFIDENTIALITY AND NON-DISCLOSURE AGREEMENT</p>

          <p className="mb-3">
            By accessing the materials related to {dealName ? `"${dealName}"` : 'this deal'}
            {inviterName ? `, as shared by ${inviterName},` : ','} you agree to the following terms:
          </p>

          <p className="font-semibold text-[#0D0D0D] mb-1">1. Confidential Information</p>
          <p className="mb-3">
            All financial data, business information, customer lists, trade secrets, and other materials
            provided through this data room constitute Confidential Information. This includes any analysis,
            notes, or summaries you create from such information.
          </p>

          <p className="font-semibold text-[#0D0D0D] mb-1">2. Non-Disclosure</p>
          <p className="mb-3">
            You agree not to disclose, publish, or disseminate any Confidential Information to any third party
            without the prior written consent of the disclosing party. You will protect such information with
            the same degree of care you use for your own confidential information.
          </p>

          <p className="font-semibold text-[#0D0D0D] mb-1">3. Permitted Use</p>
          <p className="mb-3">
            You may use the Confidential Information solely for the purpose of evaluating a potential
            transaction involving the business described in the shared materials. Any other use is prohibited.
          </p>

          <p className="font-semibold text-[#0D0D0D] mb-1">4. No Contact</p>
          <p className="mb-3">
            You agree not to contact the business, its employees, customers, or vendors directly without
            prior written authorization from the disclosing party.
          </p>

          <p className="font-semibold text-[#0D0D0D] mb-1">5. Return of Materials</p>
          <p className="mb-3">
            Upon request or upon termination of discussions, you will return or destroy all Confidential Information
            and any copies thereof.
          </p>

          <p className="font-semibold text-[#0D0D0D] mb-1">6. Term</p>
          <p>
            This agreement remains in effect for a period of two (2) years from the date of acceptance.
          </p>
        </div>

        {/* Agreement checkbox + actions */}
        <div className="px-6 py-5">
          <label className="flex items-start gap-3 cursor-pointer mb-4">
            <input
              type="checkbox"
              checked={agreed}
              onChange={e => setAgreed(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded accent-[#D44A78] cursor-pointer"
            />
            <span className="text-[12px] text-[#3D3B37] leading-relaxed">
              I have read and agree to the terms of this Non-Disclosure Agreement. I understand that
              violation of these terms may result in legal action.
            </span>
          </label>

          <div className="flex items-center gap-3">
            <button
              onClick={handleAccept}
              disabled={!agreed || submitting}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#D44A78] border-0 cursor-pointer hover:bg-[#B03860] transition-colors disabled:opacity-40 disabled:cursor-default"
            >
              {submitting ? 'Accepting...' : 'Accept NDA & Continue'}
            </button>
            <button
              onClick={onDecline}
              className="py-2.5 px-5 rounded-lg text-sm font-semibold text-[#6E6A63] bg-[#F5F5F5] border-0 cursor-pointer hover:bg-[#EBE7DF] transition-colors"
            >
              Decline
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
