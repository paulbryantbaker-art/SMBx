import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Markdown from 'react-markdown';
import { authHeaders } from '../../hooks/useAuth';
import InteractiveModel from './InteractiveModel';
import CanvasEditor from './CanvasEditor';
import CommentsPanel from './CommentsPanel';

interface CanvasProps {
  /** Fetch deliverable by ID from the API (authenticated mode) */
  deliverableId?: number | null;
  /** Render markdown content directly (anonymous deliverable mode) */
  markdownContent?: string | null;
  /** Title shown in the toolbar */
  title?: string;
  /** Deal ID for "Save to Data Room" (authenticated only) */
  dealId?: number | null;
  onClose: () => void;
}

interface DeliverableData {
  id: number;
  name: string;
  slug: string;
  tier: string;
  status: string;
  content: Record<string, any> | null;
  completed_at: string | null;
  generation_model: string | null;
  generation_time_ms: number | null;
}

const DELIVERABLE_LABELS: Record<string, string> = {
  value_readiness_report: 'Value Readiness Report',
  thesis_document: 'Acquisition Thesis',
  sde_analysis: 'SDE Analysis',
  valuation_report: 'Valuation Report',
  deal_screening_memo: 'Deal Screening Memo',
  sba_financing_model: 'SBA Financing Model',
};

export default function Canvas({ deliverableId, markdownContent, title, dealId, onClose }: CanvasProps) {
  const [data, setData] = useState<DeliverableData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filing, setFiling] = useState(false);
  const [filed, setFiled] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // Determine mode
  const isMarkdownMode = !!markdownContent;
  const displayTitle = title || data?.name || 'Document';

  const fetchData = useCallback(async () => {
    if (!deliverableId || isMarkdownMode) return;
    try {
      const res = await fetch(`/api/deliverables/${deliverableId}`, { headers: authHeaders() });
      if (!res.ok) {
        setError(res.status === 404 ? 'Deliverable not found' : 'Failed to load deliverable');
        setLoading(false);
        return;
      }
      const d = await res.json();
      setData(d);
      setError(null);
      // Keep polling if still generating
      if (d.status === 'queued' || d.status === 'generating') {
        setTimeout(fetchData, 3000);
      }
    } catch {
      setError('Network error — please check your connection');
    }
    finally { setLoading(false); }
  }, [deliverableId, isMarkdownMode]);

  useEffect(() => {
    if (isMarkdownMode) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setData(null);
    setError(null);
    fetchData();
  }, [fetchData, isMarkdownMode]);

  const handleSaveToDataRoom = async () => {
    if (!dealId || !deliverableId || filing || filed) return;
    setFiling(true);
    try {
      const res = await fetch(`/api/deals/${dealId}/data-room/file`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ deliverableId }),
      });
      if (res.ok) setFiled(true);
    } catch { /* ignore */ }
    finally { setFiling(false); }
  };

  const [exportOpen, setExportOpen] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!exportOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) setExportOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [exportOpen]);

  const handleExport = async (format: 'pdf' | 'docx' | 'xlsx') => {
    setExportOpen(false);

    // Server-side export for authenticated deliverables
    if (deliverableId && !isMarkdownMode) {
      setExporting(format);
      try {
        const res = await fetch(`/api/deliverables/${deliverableId}/export/${format}`, {
          method: 'POST',
          headers: authHeaders(),
        });
        if (!res.ok) {
          console.error('Export failed:', res.status);
          setExporting(null);
          return;
        }
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${displayTitle.replace(/[^a-zA-Z0-9_\- ]/g, '').replace(/\s+/g, '_').substring(0, 60)}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (err) {
        console.error('Export error:', err);
      }
      setExporting(null);
      return;
    }

    // Fallback: browser print for anonymous/markdown mode
    const printArea = document.getElementById('canvas-print-area');
    if (!printArea) return;
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`
      <html><head><title>${displayTitle}</title>
      <style>
        body { font-family: 'Inter', system-ui, sans-serif; color: #1A1A18; padding: 40px; max-width: 800px; margin: 0 auto; line-height: 1.6; }
        h1, h2, h3 { font-weight: 700; margin-top: 1.5em; }
        h1 { font-size: 24px; border-bottom: 2px solid #C96B4F; padding-bottom: 8px; }
        h2 { font-size: 18px; color: #3D3B37; }
        h3 { font-size: 15px; color: #6E6A63; }
        table { border-collapse: collapse; width: 100%; margin: 16px 0; }
        th, td { border: 1px solid #DDD9D1; padding: 8px 12px; text-align: left; font-size: 13px; }
        th { background: #F3F0EA; font-weight: 600; }
        ul, ol { padding-left: 24px; }
        .meta { color: #6E6A63; font-size: 12px; margin-bottom: 24px; }
        hr { border: none; border-top: 1px solid #DDD9D1; margin: 24px 0; }
        strong { font-weight: 700; }
      </style></head><body>
      <div class="meta">Generated by smbx.ai${data?.completed_at ? ` on ${new Date(data.completed_at).toLocaleDateString()}` : ` on ${new Date().toLocaleDateString()}`}</div>
      ${printArea.innerHTML}
      </body></html>
    `);
    w.document.close();
    w.print();
  };

  if (!deliverableId && !markdownContent) return null;

  const showContent = isMarkdownMode || (!loading && data?.status === 'complete' && data.content);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Toolbar */}
      <div className="shrink-0 flex items-center justify-between px-4 py-2.5" style={{ borderBottom: '1px solid #DDD9D1' }}>
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded bg-[#C96B4F] text-white flex items-center justify-center shrink-0">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-[#1A1A18] truncate">{displayTitle}</span>
          {!isMarkdownMode && data?.status && data.status !== 'complete' && (
            <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full shrink-0 ${
              data.status === 'generating' ? 'text-blue-600 bg-blue-50' : data.status === 'queued' ? 'text-yellow-600 bg-yellow-50' : 'text-red-600 bg-red-50'
            }`}>{data.status}</span>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {showContent && dealId && deliverableId && !isMarkdownMode && (
            <button
              onClick={handleSaveToDataRoom}
              disabled={filing || filed}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border-0 cursor-pointer transition-colors ${
                filed
                  ? 'bg-green-50 text-green-700'
                  : 'bg-[#C96B4F] text-white hover:bg-[#BE6342]'
              } disabled:opacity-60`}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
              </svg>
              {filed ? 'Saved' : filing ? 'Saving...' : 'Save to Data Room'}
            </button>
          )}
          {showContent && !isMarkdownMode && data?.content?.markdown && deliverableId && (
            <button
              onClick={() => setEditMode(!editMode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border-0 cursor-pointer transition-colors ${
                editMode ? 'bg-[#C96B4F] text-white' : 'bg-[#F3F0EA] text-[#3D3B37] hover:bg-[#EBE7DF]'
              }`}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              {editMode ? 'View' : 'Edit'}
            </button>
          )}
          {showContent && deliverableId && !isMarkdownMode && (
            <button
              onClick={() => setCommentsOpen(!commentsOpen)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border-0 cursor-pointer transition-colors ${
                commentsOpen ? 'bg-[#C96B4F] text-white' : 'bg-[#F3F0EA] text-[#3D3B37] hover:bg-[#EBE7DF]'
              }`}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
              Comments
            </button>
          )}
          {showContent && (
            <div className="relative" ref={exportRef}>
              <button
                onClick={() => deliverableId && !isMarkdownMode ? setExportOpen(!exportOpen) : handleExport('pdf')}
                disabled={!!exporting}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#F3F0EA] text-[#3D3B37] border-0 cursor-pointer hover:bg-[#EBE7DF] transition-colors disabled:opacity-60"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                {exporting ? `Exporting ${exporting.toUpperCase()}...` : 'Export'}
                {deliverableId && !isMarkdownMode && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6" /></svg>
                )}
              </button>
              {exportOpen && (
                <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg py-1 z-50 min-w-[120px]" style={{ border: '1px solid #DDD9D1' }}>
                  {(['pdf', 'docx', 'xlsx'] as const).map(fmt => (
                    <button
                      key={fmt}
                      onClick={() => handleExport(fmt)}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-[#3D3B37] bg-transparent border-0 cursor-pointer hover:bg-[#F3F0EA] transition-colors"
                    >
                      {fmt.toUpperCase()}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg hover:bg-[#F3F0EA] flex items-center justify-center cursor-pointer border-0 bg-transparent transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex min-h-0">
      <div className="flex-1 overflow-y-auto min-h-0">
        {/* Markdown mode — direct render with section navigation */}
        {isMarkdownMode && (
          <MarkdownCanvas content={markdownContent!} />
        )}

        {/* API mode — loading states */}
        {!isMarkdownMode && loading && (
          <div className="flex items-center justify-center p-12">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-[#C96B4F] border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-[#6E6A63]">Loading deliverable...</p>
            </div>
          </div>
        )}

        {!isMarkdownMode && !loading && data?.status === 'generating' && (
          <div className="flex items-center justify-center p-12">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="w-12 h-12 border-2 border-[#C96B4F] border-t-transparent rounded-full animate-spin" />
              <p className="text-base font-semibold text-[#1A1A18]">Generating your {data.name}...</p>
              <p className="text-sm text-[#6E6A63] max-w-xs">This typically takes 30-60 seconds. The document will appear here when ready.</p>
            </div>
          </div>
        )}

        {!isMarkdownMode && !loading && data?.status === 'queued' && (
          <div className="flex items-center justify-center p-12">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ca8a04" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
              </div>
              <p className="text-base font-semibold text-[#1A1A18]">In queue</p>
              <p className="text-sm text-[#6E6A63]">Your {data.name} will begin generating shortly.</p>
            </div>
          </div>
        )}

        {!isMarkdownMode && !loading && data?.status === 'complete' && data.content && (
          data.content.markdown && deliverableId && editMode ? (
            <CanvasEditor
              deliverableId={deliverableId}
              content={data.content.markdown}
              onSave={(newMd) => {
                setData(prev => prev ? { ...prev, content: { ...prev.content!, markdown: newMd } } : prev);
                setEditMode(false);
              }}
            />
          ) : (
            <div id="canvas-print-area" className="px-6 py-5 max-w-[700px] mx-auto canvas-content">
              <CanvasContent content={data.content} name={data.name} />
            </div>
          )
        )}

        {!isMarkdownMode && !loading && data?.status === 'failed' && (
          <div className="flex items-center justify-center p-12">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
              </div>
              <p className="text-base font-semibold text-[#1A1A18]">Generation failed</p>
              <p className="text-sm text-[#6E6A63]">Something went wrong. Please try again or contact support.</p>
            </div>
          </div>
        )}

        {!isMarkdownMode && !loading && (error || !data) && (
          <div className="flex items-center justify-center p-12">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
              </div>
              <p className="text-sm text-[#6E6A63]">{error || 'Deliverable not found.'}</p>
              <button onClick={fetchData} className="text-sm font-semibold text-[#C96B4F] bg-transparent border-0 cursor-pointer hover:underline">
                Try again
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Comments panel */}
      {commentsOpen && deliverableId && !isMarkdownMode && (
        <CommentsPanel deliverableId={deliverableId} onClose={() => setCommentsOpen(false)} />
      )}
      </div>
    </div>
  );
}

export { DELIVERABLE_LABELS };

function CanvasContent({ content, name }: { content: Record<string, any>; name: string }) {
  // Interactive financial model
  if (content.type === 'financial_model' && content.base_case && content.assumptions) {
    return <InteractiveModel content={content as any} />;
  }

  // If content has markdown field, render as markdown
  if (content.markdown) {
    return (
      <div className="canvas-md">
        <Markdown>{content.markdown}</Markdown>
      </div>
    );
  }

  // If content has sections array
  if (content.sections && Array.isArray(content.sections)) {
    return (
      <div className="space-y-6">
        <h1 className="text-xl font-bold text-[#1A1A18] m-0 pb-2" style={{ borderBottom: '2px solid #C96B4F' }}>
          {name}
        </h1>
        {content.summary && (
          <div className="bg-[#FFF8F5] rounded-xl px-5 py-4" style={{ border: '1px solid rgba(212,113,78,.15)' }}>
            <p className="text-sm font-semibold text-[#C96B4F] m-0 mb-1">Summary</p>
            <p className="text-sm text-[#3D3B37] leading-relaxed m-0">{content.summary}</p>
          </div>
        )}
        {content.sections.map((section: any, i: number) => (
          <div key={i}>
            <h2 className="text-base font-bold text-[#1A1A18] m-0 mb-2">{section.title}</h2>
            {typeof section.content === 'string' ? (
              <div className="text-sm text-[#3D3B37] leading-[1.7] whitespace-pre-wrap">{section.content}</div>
            ) : section.table ? (
              <CanvasTable data={section.table} />
            ) : section.items ? (
              <ul className="text-sm text-[#3D3B37] leading-[1.7] pl-5 m-0 space-y-1">
                {section.items.map((item: string, j: number) => <li key={j}>{item}</li>)}
              </ul>
            ) : (
              <div className="text-sm text-[#3D3B37] leading-[1.7]">
                <Markdown>{String(section.content || '')}</Markdown>
              </div>
            )}
          </div>
        ))}
        {content.disclaimer && (
          <div className="text-xs text-[#A9A49C] pt-4 mt-4" style={{ borderTop: '1px solid #EBE7DF' }}>
            {content.disclaimer}
          </div>
        )}
      </div>
    );
  }

  // Key-value format
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-[#1A1A18] m-0 pb-2" style={{ borderBottom: '2px solid #C96B4F' }}>
        {name}
      </h1>
      {Object.entries(content).map(([key, value]) => {
        if (key === 'type' || key === 'generated_at') return null;
        return (
          <div key={key} className="pb-3" style={{ borderBottom: '1px solid #EBE7DF' }}>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#6E6A63] m-0 mb-1">
              {key.replace(/_/g, ' ')}
            </p>
            <div className="text-sm text-[#1A1A18]">
              {typeof value === 'string' ? (
                <span className="whitespace-pre-wrap">{value}</span>
              ) : typeof value === 'number' ? (
                <span className="font-semibold">{value.toLocaleString()}</span>
              ) : Array.isArray(value) ? (
                <ul className="pl-5 m-0 space-y-0.5">
                  {value.map((item, i) => <li key={i}>{typeof item === 'object' ? JSON.stringify(item) : String(item)}</li>)}
                </ul>
              ) : typeof value === 'object' && value !== null ? (
                <CanvasTable data={value} />
              ) : (
                <span>{String(value)}</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MarkdownCanvas({ content }: { content: string }) {
  // Extract section headings for navigation
  const sections = useMemo(() => {
    const headings: { level: number; text: string; id: string }[] = [];
    const lines = content.split('\n');
    for (const line of lines) {
      const match = line.match(/^(#{2,3})\s+(.+)/);
      if (match) {
        const text = match[2].replace(/\*\*/g, '').trim();
        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        headings.push({ level: match[1].length, text, id });
      }
    }
    return headings;
  }, [content]);

  const showToc = sections.length >= 4;

  const scrollToSection = (id: string) => {
    const el = document.getElementById(`section-${id}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Inject IDs into headings for scroll targeting
  const processedContent = useMemo(() => {
    if (!showToc) return content;
    return content.replace(/^(#{2,3})\s+(.+)/gm, (match, hashes, text) => {
      const cleanText = text.replace(/\*\*/g, '').trim();
      const id = cleanText.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      return `${hashes} <span id="section-${id}"></span>${text}`;
    });
  }, [content, showToc]);

  return (
    <div className="flex">
      {/* Table of Contents sidebar */}
      {showToc && (
        <div className="hidden md:block w-48 shrink-0 p-4 pt-6 sticky top-0 self-start" style={{ borderRight: '1px solid #EBE7DF' }}>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#A9A49C] m-0 mb-3">Contents</p>
          <nav className="space-y-1">
            {sections.map((s, i) => (
              <button
                key={i}
                onClick={() => scrollToSection(s.id)}
                className={`block w-full text-left text-[12px] leading-tight bg-transparent border-0 cursor-pointer hover:text-[#C96B4F] transition-colors p-0 ${
                  s.level === 3 ? 'pl-3 text-[#A9A49C]' : 'text-[#6E6A63] font-medium'
                }`}
                style={{ marginBottom: '6px' }}
                type="button"
              >
                {s.text}
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* Main content */}
      <div id="canvas-print-area" className="flex-1 px-6 py-5 max-w-[700px] mx-auto canvas-content">
        <div className="canvas-md prose prose-sm max-w-none
          [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-[#1A1A18] [&_h2]:mt-6 [&_h2]:mb-3
          [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-[#3D3B37] [&_h3]:mt-4 [&_h3]:mb-2
          [&_p]:text-sm [&_p]:text-[#3D3B37] [&_p]:leading-[1.7] [&_p]:mb-3
          [&_table]:w-full [&_table]:text-sm [&_table]:border-collapse [&_table]:my-3
          [&_th]:text-left [&_th]:px-3 [&_th]:py-2 [&_th]:text-xs [&_th]:font-semibold [&_th]:text-[#3D3B37] [&_th]:bg-[#F3F0EA] [&_th]:border [&_th]:border-[#DDD9D1]
          [&_td]:px-3 [&_td]:py-2 [&_td]:text-[#1A1A18] [&_td]:border [&_td]:border-[#EBE7DF]
          [&_hr]:border-0 [&_hr]:border-t [&_hr]:border-[#EBE7DF] [&_hr]:my-5
          [&_strong]:font-bold [&_strong]:text-[#1A1A18]
          [&_ul]:pl-5 [&_ul]:text-sm [&_ul]:text-[#3D3B37]
          [&_ol]:pl-5 [&_ol]:text-sm [&_ol]:text-[#3D3B37]
          [&_li]:mb-1
          [&_em]:text-[#6E6A63]
        ">
          <Markdown>{processedContent}</Markdown>
        </div>
      </div>
    </div>
  );
}

function CanvasTable({ data }: { data: any }) {
  if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object') {
    const headers = Object.keys(data[0]);
    return (
      <div className="overflow-x-auto rounded-lg" style={{ border: '1px solid #DDD9D1' }}>
        <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr className="bg-[#F3F0EA]">
              {headers.map(h => (
                <th key={h} className="text-left px-3 py-2 text-xs font-semibold text-[#3D3B37] uppercase tracking-wide" style={{ borderBottom: '1px solid #DDD9D1' }}>
                  {h.replace(/_/g, ' ')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row: any, i: number) => (
              <tr key={i} className={i % 2 ? 'bg-[#FAFAF8]' : ''}>
                {headers.map(h => (
                  <td key={h} className="px-3 py-2 text-[#1A1A18]" style={{ borderBottom: '1px solid #EBE7DF' }}>
                    {typeof row[h] === 'number' ? row[h].toLocaleString() : String(row[h] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Object as key-value table
  if (typeof data === 'object' && !Array.isArray(data)) {
    return (
      <div className="overflow-x-auto rounded-lg" style={{ border: '1px solid #DDD9D1' }}>
        <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
          <tbody>
            {Object.entries(data).map(([k, v], i) => (
              <tr key={k} className={i % 2 ? 'bg-[#FAFAF8]' : ''}>
                <td className="px-3 py-2 text-xs font-semibold text-[#6E6A63] w-1/3" style={{ borderBottom: '1px solid #EBE7DF' }}>
                  {k.replace(/_/g, ' ')}
                </td>
                <td className="px-3 py-2 text-[#1A1A18]" style={{ borderBottom: '1px solid #EBE7DF' }}>
                  {typeof v === 'number' ? v.toLocaleString() : String(v ?? '')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return null;
}
