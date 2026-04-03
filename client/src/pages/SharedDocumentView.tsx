/**
 * SharedDocumentView — public page for viewing shared documents.
 *
 * Renders at /shared/doc/:token — no auth required (token-based access).
 * Shows the document in TipTap (read-only) with professional styling.
 * Handles NDA gates, watermarks, and access controls.
 */
import { useState, useEffect } from 'react';
import DocumentEditor from '../components/documents/DocumentEditor';

interface SharedDoc {
  accessLevel: string;
  authRequired: string;
  downloadEnabled: boolean;
  watermark: string | null;
  dealName: string;
  recipientName: string | null;
  docName: string;
  docClass: string | null;
  content: Record<string, any> | null;
  tiptapContent: Record<string, any> | null;
  fileType: string | null;
  slug: string | null;
}

export default function SharedDocumentView({ token }: { token: string }) {
  const [doc, setDoc] = useState<SharedDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/shared/doc/${token}`)
      .then(async res => {
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to load document');
        }
        return res.json();
      })
      .then(setDoc)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F9FC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-[#D44A78] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[#6E6A63]">Loading document...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F9F9FC] flex items-center justify-center">
        <div className="max-w-md text-center px-6">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-[#0D0D0D] mb-2" style={{ fontFamily: "'Sora', system-ui, sans-serif" }}>
            {error.includes('expired') ? 'Link Expired' : error.includes('Maximum') ? 'View Limit Reached' : 'Document Unavailable'}
          </h2>
          <p className="text-sm text-[#6E6A63] leading-relaxed">{error}</p>
          <a
            href="/"
            className="inline-block mt-6 px-6 py-2.5 rounded-full text-sm font-semibold text-white no-underline"
            style={{ background: '#D44A78' }}
          >
            Go to smbx.ai
          </a>
        </div>
      </div>
    );
  }

  if (!doc || !doc.content) {
    return (
      <div className="min-h-screen bg-[#F9F9FC] flex items-center justify-center">
        <p className="text-sm text-[#6E6A63]">Document not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F9FC]">
      {/* Header bar */}
      <header
        className="sticky top-0 z-10 flex items-center justify-between px-6 py-3"
        style={{
          background: 'rgba(249,249,252,0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
        }}
      >
        <div className="flex items-center gap-3">
          <a href="/" className="no-underline">
            <span style={{ fontFamily: "'Sora', system-ui, sans-serif", fontWeight: 700, fontSize: 16, color: '#0D0D0D' }}>
              smbx.ai
            </span>
          </a>
          <span className="text-[#EBE7DF]">|</span>
          <span className="text-sm text-[#6E6A63]">{doc.docName}</span>
          {doc.docClass && (
            <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
              doc.docClass === 'legal' ? 'bg-purple-50 text-purple-600'
              : doc.docClass === 'marketing' ? 'bg-blue-50 text-blue-600'
              : 'bg-gray-50 text-gray-500'
            }`}>
              {doc.docClass}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {doc.watermark && (
            <span className="text-[10px] text-[#A9A49C]">Watermarked</span>
          )}
          {!doc.downloadEnabled && (
            <span className="text-[10px] text-[#A9A49C]">View only</span>
          )}
        </div>
      </header>

      {/* Watermark overlay */}
      {doc.watermark && (
        <div
          className="fixed inset-0 pointer-events-none z-[5] flex items-center justify-center"
          style={{ opacity: 0.04 }}
        >
          <span
            style={{
              fontFamily: "'Sora', system-ui, sans-serif",
              fontSize: 72,
              fontWeight: 700,
              color: '#0D0D0D',
              transform: 'rotate(-30deg)',
              whiteSpace: 'nowrap',
              userSelect: 'none',
            }}
          >
            {doc.watermark === 'recipient' ? doc.recipientName || 'CONFIDENTIAL' : doc.watermark}
          </span>
        </div>
      )}

      {/* Document content */}
      <main className="max-w-[800px] mx-auto px-6 py-8">
        <DocumentEditor
          content={doc.content}
          tiptapContent={doc.tiptapContent}
          name={doc.docName}
          editable={false}
          docClass={doc.docClass || undefined}
        />
      </main>

      {/* Footer */}
      <footer className="text-center py-8 border-t border-[#EBE7DF]">
        <p className="text-[11px] text-[#A9A49C]">
          Shared via <a href="/" className="text-[#D44A78] no-underline font-semibold">smbx.ai</a> — AI-powered deal intelligence
        </p>
        <p className="text-[10px] text-[#C8C4BC] mt-1">
          This document is confidential. Unauthorized distribution is prohibited.
        </p>
      </footer>
    </div>
  );
}
