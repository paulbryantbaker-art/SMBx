import { useState, useEffect } from 'react';
import Markdown from 'react-markdown';

interface BizestimatePageProps {
  token: string;
}

export default function BizestimatePage({ token }: BizestimatePageProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [markdown, setMarkdown] = useState('');
  const [businessName, setBusinessName] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/biz/${token}`);
        if (!res.ok) {
          const data = await res.json().catch(() => ({ error: 'Not found' }));
          setError(data.error || 'Bizestimate not found');
          return;
        }
        const data = await res.json();
        setMarkdown(data.markdown);
        setBusinessName(data.businessName || 'Your Business');
      } catch {
        setError('Failed to load Bizestimate');
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#D4714E] border-t-transparent rounded-full" style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-md p-8 max-w-md text-center">
          <p className="text-lg font-semibold text-[#1A1A18] mb-2">Bizestimate Not Found</p>
          <p className="text-sm text-[#6E6A63]">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      {/* Header */}
      <header className="bg-white border-b border-[#EBEBEB] px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[#D4714E] font-bold text-lg">smbX</span>
            <span className="text-xs text-[#6E6A63]">Bizestimate</span>
          </div>
          <a
            href="/"
            className="text-sm font-medium text-[#D4714E] hover:underline no-underline"
          >
            Get yours free
          </a>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-[#EBEBEB] p-6 md:p-10">
          <div className="canvas-md">
            <Markdown>{markdown}</Markdown>
          </div>
        </div>
      </main>
    </div>
  );
}
