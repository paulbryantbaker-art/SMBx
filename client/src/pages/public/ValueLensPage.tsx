import { useState, useEffect } from 'react';
import Markdown from 'react-markdown';

interface ValueLensPageProps {
  token: string;
}

export default function ValueLensPage({ token }: ValueLensPageProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [markdown, setMarkdown] = useState('');
  const [businessName, setBusinessName] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/valuelens/${token}`);
        if (!res.ok) {
          const data = await res.json().catch(() => ({ error: 'Not found' }));
          setError(data.error || 'ValueLens not found');
          return;
        }
        const data = await res.json();
        setMarkdown(data.markdown);
        setBusinessName(data.businessName || 'Your Business');
      } catch {
        setError('Failed to load ValueLens');
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-dvh bg-[#FFFFFF] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#C25572] border-t-transparent rounded-full" style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-dvh bg-[#FFFFFF] flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-md p-8 max-w-md text-center">
          <p className="text-lg font-semibold text-[#0D0D0D] mb-2">ValueLens Not Found</p>
          <p className="text-sm text-[#6E6A63]">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[#FFFFFF]">
      {/* Header */}
      <header className="bg-white border-b border-[#EBEBEB] px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg text-[#0D0D0D]">smbx<span className="text-[#C25572]">.</span>ai</span>
            <span className="text-xs text-[#6E6A63]">ValueLens</span>
          </div>
          <a
            href="/"
            className="text-sm font-medium text-[#C25572] hover:underline no-underline"
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
