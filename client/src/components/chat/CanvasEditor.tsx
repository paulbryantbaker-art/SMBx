/**
 * Canvas Editor — Toggle between markdown view and edit mode.
 *
 * Allows users to edit deliverable content inline, with live preview.
 * Supports Yulia-assisted revision via chat-style prompt.
 */
import { useState, useRef, useEffect, useCallback } from 'react';
import Markdown from 'react-markdown';
import { authHeaders } from '../../hooks/useAuth';

interface CanvasEditorProps {
  deliverableId: number;
  content: string;
  onSave: (newContent: string) => void;
}

export default function CanvasEditor({ deliverableId, content, onSave }: CanvasEditorProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(content);
  const [saving, setSaving] = useState(false);
  const [revisionPrompt, setRevisionPrompt] = useState('');
  const [revising, setRevising] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setDraft(content);
  }, [content]);

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [editing]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/deliverables/${deliverableId}/content`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ markdown: draft }),
      });
      if (res.ok) {
        onSave(draft);
        setEditing(false);
      }
    } catch {
      // silent
    }
    setSaving(false);
  };

  const handleRevision = async () => {
    if (!revisionPrompt.trim() || revising) return;
    setRevising(true);
    try {
      const res = await fetch(`/api/deliverables/${deliverableId}/revise`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ prompt: revisionPrompt, currentContent: draft }),
      });
      if (res.ok) {
        const { revised } = await res.json();
        if (revised) {
          setDraft(revised);
          setRevisionPrompt('');
        }
      }
    } catch {
      // silent
    }
    setRevising(false);
  };

  const handleCancel = () => {
    setDraft(content);
    setEditing(false);
  };

  const hasChanges = draft !== content;

  return (
    <div className="h-full flex flex-col">
      {/* Editor toolbar */}
      <div className="shrink-0 flex items-center justify-between px-4 py-2" style={{ borderBottom: '1px solid #EBE7DF' }}>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditing(!editing)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border-0 cursor-pointer transition-colors ${
              editing
                ? 'bg-[#C96B4F] text-white'
                : 'bg-[#F5F5F5] text-[#3D3B37] hover:bg-[#EBE7DF]'
            }`}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            {editing ? 'Editing' : 'Edit'}
          </button>
          {editing && hasChanges && (
            <>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#22863a] text-white border-0 cursor-pointer hover:bg-[#1a7030] transition-colors disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={handleCancel}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-transparent text-[#6E6A63] border-0 cursor-pointer hover:bg-[#F5F5F5] transition-colors"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {/* AI revision bar */}
      {editing && (
        <div className="shrink-0 flex items-center gap-2 px-4 py-2" style={{ borderBottom: '1px solid #EBE7DF', backgroundColor: '#FAFAF8' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C96B4F" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
          </svg>
          <input
            type="text"
            value={revisionPrompt}
            onChange={e => setRevisionPrompt(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleRevision()}
            placeholder="Ask Yulia to revise... (e.g. 'make the financial projections more aggressive')"
            className="flex-1 text-xs text-[#0D0D0D] bg-transparent border-0 outline-none placeholder:text-[rgba(0,0,0,0.06)]"
          />
          <button
            onClick={handleRevision}
            disabled={!revisionPrompt.trim() || revising}
            className="px-3 py-1 rounded-md text-[10px] font-semibold bg-[#C96B4F] text-white border-0 cursor-pointer hover:bg-[#BE6342] disabled:opacity-40 transition-colors"
          >
            {revising ? 'Revising...' : 'Revise'}
          </button>
        </div>
      )}

      {/* Content area */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {editing ? (
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            className="w-full h-full p-6 text-sm text-[#0D0D0D] bg-white border-0 outline-none resize-none"
            style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', lineHeight: 1.7, tabSize: 2 }}
            spellCheck
          />
        ) : (
          <div id="canvas-print-area" className="px-6 py-5 max-w-[700px] mx-auto canvas-content">
            <div className="canvas-md prose prose-sm max-w-none
              [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-[#0D0D0D] [&_h2]:mt-6 [&_h2]:mb-3
              [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-[#3D3B37] [&_h3]:mt-4 [&_h3]:mb-2
              [&_p]:text-sm [&_p]:text-[#3D3B37] [&_p]:leading-[1.7] [&_p]:mb-3
              [&_table]:w-full [&_table]:text-sm [&_table]:border-collapse [&_table]:my-3
              [&_th]:text-left [&_th]:px-3 [&_th]:py-2 [&_th]:text-xs [&_th]:font-semibold [&_th]:text-[#3D3B37] [&_th]:bg-[#F5F5F5] [&_th]:border [&_th]:border-[rgba(0,0,0,0.08)]
              [&_td]:px-3 [&_td]:py-2 [&_td]:text-[#0D0D0D] [&_td]:border [&_td]:border-[#EBE7DF]
              [&_hr]:border-0 [&_hr]:border-t [&_hr]:border-[#EBE7DF] [&_hr]:my-5
              [&_strong]:font-bold [&_strong]:text-[#0D0D0D]
              [&_ul]:pl-5 [&_ul]:text-sm [&_ul]:text-[#3D3B37]
              [&_ol]:pl-5 [&_ol]:text-sm [&_ol]:text-[#3D3B37]
              [&_li]:mb-1
              [&_em]:text-[#6E6A63]
            ">
              <Markdown>{draft}</Markdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
