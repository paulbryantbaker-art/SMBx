import { useState, useEffect } from 'react';

interface SharedDocumentProps {
  token: string;
}

export default function SharedDocument({ token }: SharedDocumentProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState<any>(null);
  const [accessLevel, setAccessLevel] = useState<string>('');
  const [requiresNda, setRequiresNda] = useState(false);

  // NDA form
  const [ndaEmail, setNdaEmail] = useState('');
  const [ndaName, setNdaName] = useState('');
  const [signingNda, setSigningNda] = useState(false);

  const fetchDocument = async (email?: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = email ? `?email=${encodeURIComponent(email)}` : '';
      const res = await fetch(`/api/shared/${token}${params}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Not found' }));
        setError(data.error || 'Document not available');
        return;
      }
      const data = await res.json();
      if (data.requiresNda) {
        setRequiresNda(true);
        setAccessLevel(data.accessLevel);
      } else {
        setContent(data.content);
        setAccessLevel(data.accessLevel);
        setRequiresNda(false);
      }
    } catch {
      setError('Failed to load document');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDocument(); }, [token]);

  const signNda = async () => {
    if (!ndaEmail.trim() || !ndaName.trim()) return;
    setSigningNda(true);
    try {
      const res = await fetch(`/api/shared/${token}/sign-nda`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: ndaEmail, fullName: ndaName }),
      });
      if (res.ok) {
        // Re-fetch with email to get full content
        await fetchDocument(ndaEmail);
      } else {
        const data = await res.json().catch(() => ({ error: 'Failed' }));
        setError(data.error || 'Failed to sign NDA');
      }
    } catch {
      setError('Failed to sign NDA');
    } finally {
      setSigningNda(false);
    }
  };

  const renderContent = (data: any) => {
    if (!data) return null;

    // Markdown content
    if (data.markdown) {
      return (
        <div className="prose prose-sm max-w-none">
          <div className="whitespace-pre-wrap text-sm text-[#3D3B37] leading-relaxed">{data.markdown}</div>
          {data.teaser && (
            <div className="mt-6 p-4 bg-[#FAF9F7] rounded-xl border border-border text-center">
              <p className="text-sm font-semibold text-[#1A1A18] m-0 mb-1">This is a teaser preview</p>
              <p className="text-xs text-[#6E6A63] m-0">{data.fullSectionsCount ? `${data.fullSectionsCount} sections available in the full document` : 'Full details available upon request'}</p>
            </div>
          )}
        </div>
      );
    }

    // Sections-based content
    if (data.sections && Array.isArray(data.sections)) {
      return (
        <div className="space-y-6">
          {data.summary && (
            <div className="p-4 bg-[#FAF9F7] rounded-xl border border-border">
              <p className="text-sm text-[#3D3B37] m-0">{data.summary}</p>
            </div>
          )}
          {data.sections.map((section: any, i: number) => (
            <div key={i}>
              <h3 className="text-base font-semibold text-[#1A1A18] m-0 mb-2">{section.title || `Section ${i + 1}`}</h3>
              <div className="text-sm text-[#3D3B37] whitespace-pre-wrap leading-relaxed">
                {typeof section.content === 'string' ? section.content : JSON.stringify(section.content, null, 2)}
              </div>
            </div>
          ))}
          {data.teaser && data.fullSectionsCount && (
            <div className="p-4 bg-[#FAF9F7] rounded-xl border border-border text-center">
              <p className="text-sm font-semibold text-[#1A1A18] m-0 mb-1">Teaser Preview</p>
              <p className="text-xs text-[#6E6A63] m-0">Showing 2 of {data.fullSectionsCount} sections. Request full access for the complete document.</p>
            </div>
          )}
        </div>
      );
    }

    // Fallback: JSON display
    return (
      <pre className="text-xs text-[#3D3B37] bg-[#FAF9F7] p-4 rounded-xl overflow-auto">
        {JSON.stringify(data, null, 2)}
      </pre>
    );
  };

  const ACCESS_LABELS: Record<string, string> = {
    blind: 'Blind Preview',
    teaser: 'Teaser',
    full: 'Full Access',
  };

  return (
    <div className="min-h-dvh bg-[#FAF9F7]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white" style={{ borderBottom: '1px solid #DDD9D1' }}>
        <div className="text-[22px] font-extrabold tracking-[-0.03em] text-[#1A1A18]" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
          smb<span className="text-[#D4714E]">x</span>.ai
        </div>
        {accessLevel && (
          <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${
            accessLevel === 'full' ? 'bg-green-100 text-green-700' :
            accessLevel === 'teaser' ? 'bg-blue-100 text-blue-700' :
            'bg-gray-100 text-gray-600'
          }`}>
            {ACCESS_LABELS[accessLevel] || accessLevel}
          </span>
        )}
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Loading */}
        {loading && (
          <div className="text-center py-16">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#EBE7DF] animate-pulse" />
            <p className="text-sm text-[#6E6A63] m-0">Loading document...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" />
              </svg>
            </div>
            <p className="text-lg font-semibold text-[#1A1A18] m-0 mb-1">Document Unavailable</p>
            <p className="text-sm text-[#6E6A63] m-0">{error}</p>
          </div>
        )}

        {/* NDA Required */}
        {requiresNda && !loading && !error && (
          <div className="max-w-md mx-auto text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-50 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <h2 className="text-xl font-extrabold text-[#1A1A18] m-0 mb-2" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
              Non-Disclosure Agreement Required
            </h2>
            <p className="text-sm text-[#6E6A63] m-0 mb-6">
              This document requires you to sign a non-disclosure agreement before viewing.
            </p>

            <div className="bg-white rounded-2xl border border-border p-5 text-left">
              <div className="mb-4 p-3 bg-[#FAF9F7] rounded-lg text-xs text-[#6E6A63] leading-relaxed">
                By signing below, I agree that all information contained in this document is confidential
                and proprietary. I will not disclose, distribute, or use any information for purposes
                other than evaluating this potential transaction.
              </div>
              <div className="space-y-3 mb-4">
                <div>
                  <label className="block text-xs font-medium text-[#6E6A63] mb-1">Full Name</label>
                  <input
                    type="text"
                    value={ndaName}
                    onChange={e => setNdaName(e.target.value)}
                    placeholder="John Smith"
                    className="w-full px-3 py-2 rounded-lg border border-border text-sm bg-[#FAF9F7] text-[#1A1A18] outline-none focus:border-[#D4714E]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#6E6A63] mb-1">Email Address</label>
                  <input
                    type="email"
                    value={ndaEmail}
                    onChange={e => setNdaEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="w-full px-3 py-2 rounded-lg border border-border text-sm bg-[#FAF9F7] text-[#1A1A18] outline-none focus:border-[#D4714E]"
                  />
                </div>
              </div>
              <button
                onClick={signNda}
                disabled={signingNda || !ndaEmail.trim() || !ndaName.trim()}
                className="w-full py-2.5 rounded-xl text-sm font-semibold bg-[#D4714E] text-white border-0 cursor-pointer hover:bg-[#BE6342] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {signingNda ? 'Signing...' : 'Sign NDA & View Document'}
              </button>
            </div>
          </div>
        )}

        {/* Document Content */}
        {content && !loading && !error && !requiresNda && (
          <div className="bg-white rounded-2xl border border-border p-6 sm:p-8">
            {renderContent(content)}
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-[#A9A49C] m-0">
            Shared via{' '}
            <a href="/" className="text-[#D4714E] hover:underline">smbx.ai</a>
            {' '}— AI-powered M&A platform
          </p>
        </div>
      </div>
    </div>
  );
}
