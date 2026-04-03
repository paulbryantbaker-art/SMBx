/**
 * Document Editor — TipTap-based rich text viewer and editor.
 *
 * View mode: read-only, professionally styled (Sora/Inter/terra)
 * Edit mode: full toolbar, Yulia revision bar, save flow
 *
 * Handles all three content formats:
 *   - content.markdown → converted via markdownToTiptap
 *   - content.sections → converted via sectionsToTiptap
 *   - key-value objects → converted via keyValueToTiptap
 */
import { useState, useMemo, useCallback, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { Typography } from '@tiptap/extension-typography';
import { Placeholder } from '@tiptap/extension-placeholder';
import { Highlight } from '@tiptap/extension-highlight';
import { CharacterCount } from '@tiptap/extension-character-count';
import { Link } from '@tiptap/extension-link';
import { Image } from '@tiptap/extension-image';
import type { JSONContent } from '@tiptap/core';

import DocumentToolbar from './DocumentToolbar';
import {
  markdownToTiptap,
  tiptapToMarkdown,
  sectionsToTiptap,
  keyValueToTiptap,
} from './contentConversion';
import { authHeaders } from '../../hooks/useAuth';
import './DocumentStyles.css';

// ─── TipTap Extensions ──────────────────────────────────────────────

const extensions = [
  StarterKit.configure({
    heading: { levels: [1, 2, 3] },
  }),
  Table.configure({ resizable: true }),
  TableRow,
  TableCell,
  TableHeader,
  Typography,
  Placeholder.configure({ placeholder: 'Start writing...' }),
  Highlight.configure({ multicolor: true }),
  CharacterCount,
  Link.configure({ openOnClick: false, autolink: true }),
  Image,
];

// ─── Props ──────────────────────────────────────────────────────────

interface DocumentEditorProps {
  /** Deliverable content (markdown/sections/key-value) */
  content: Record<string, any>;
  /** Pre-converted TipTap JSON (if available from DB) */
  tiptapContent?: Record<string, any> | null;
  /** Deliverable ID for save/revision endpoints */
  deliverableId?: number;
  /** Display name (used as title for sections/kv content) */
  name?: string;
  /** Allow editing */
  editable?: boolean;
  /** Document classification */
  docClass?: string;
  /** Called on save with both TipTap JSON and markdown */
  onSave?: (tiptapJson: JSONContent, markdown: string) => void;
}

// ─── Component ──────────────────────────────────────────────────────

export default function DocumentEditor({
  content,
  tiptapContent,
  deliverableId,
  name = 'Document',
  editable = false,
  docClass,
  onSave,
}: DocumentEditorProps) {
  const [saving, setSaving] = useState(false);
  const [revisionPrompt, setRevisionPrompt] = useState('');
  const [revising, setRevising] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Convert content to TipTap JSON
  const initialContent = useMemo<JSONContent>(() => {
    // 1. Pre-converted TipTap JSON
    if (tiptapContent && typeof tiptapContent === 'object' && tiptapContent.type === 'doc') {
      return tiptapContent as JSONContent;
    }
    // 2. Markdown content
    if (content.markdown && typeof content.markdown === 'string') {
      return markdownToTiptap(content.markdown, extensions);
    }
    // 3. Sections array
    if (content.sections && Array.isArray(content.sections)) {
      return sectionsToTiptap(content.sections, extensions, {
        title: name,
        summary: content.summary,
        disclaimer: content.disclaimer,
      });
    }
    // 4. Key-value fallback
    return keyValueToTiptap(content, name);
  }, [content, tiptapContent, name]);

  const editor = useEditor({
    extensions,
    content: initialContent,
    editable,
    editorProps: {
      attributes: {
        class: 'document-editor-content',
      },
    },
    onUpdate: () => {
      setHasChanges(true);
    },
  });

  // Update editability when prop changes
  useEffect(() => {
    if (editor && editor.isEditable !== editable) {
      editor.setEditable(editable);
    }
  }, [editor, editable]);

  // ─── Save ───────────────────────────────────────────────────────

  const handleSave = useCallback(async () => {
    if (!editor || !deliverableId) return;
    setSaving(true);

    const tiptapJson = editor.getJSON();
    const markdown = tiptapToMarkdown(tiptapJson, extensions);

    try {
      const res = await fetch(`/api/deliverables/${deliverableId}/content`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ markdown, tiptapContent: tiptapJson }),
      });
      if (res.ok) {
        setHasChanges(false);
        onSave?.(tiptapJson, markdown);
      }
    } catch {
      // Silent — user sees save button stay enabled
    }
    setSaving(false);
  }, [editor, deliverableId, onSave]);

  // ─── Yulia Revision ─────────────────────────────────────────────

  const handleRevision = useCallback(async () => {
    if (!editor || !deliverableId || !revisionPrompt.trim() || revising) return;
    setRevising(true);

    // Get current markdown for revision context
    const currentMarkdown = tiptapToMarkdown(editor.getJSON(), extensions);

    try {
      const res = await fetch(`/api/deliverables/${deliverableId}/revise`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ prompt: revisionPrompt, currentContent: currentMarkdown }),
      });
      if (res.ok) {
        const { revised } = await res.json();
        if (revised) {
          // Convert revised markdown back to TipTap JSON and update editor
          const newContent = markdownToTiptap(revised, extensions);
          editor.commands.setContent(newContent);
          setRevisionPrompt('');
          setHasChanges(true);
        }
      }
    } catch {
      // Silent
    }
    setRevising(false);
  }, [editor, deliverableId, revisionPrompt, revising]);

  // ─── Cancel ─────────────────────────────────────────────────────

  const handleCancel = useCallback(() => {
    if (editor) {
      editor.commands.setContent(initialContent);
      setHasChanges(false);
    }
  }, [editor, initialContent]);

  if (!editor) return null;

  return (
    <div className="h-full flex flex-col">
      {/* Edit toolbar */}
      {editable && (
        <>
          {/* Action bar */}
          <div className="shrink-0 flex items-center justify-between px-4 py-2 border-b border-[#EBE7DF] dark:border-[#3A3C3E]">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#D44A78] text-white">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Editing
              </div>
              {hasChanges && (
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
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-transparent text-[#6E6A63] border-0 cursor-pointer hover:bg-[#F5F5F5] dark:hover:bg-[#2A2C2E] transition-colors"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
            {docClass && (
              <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${
                docClass === 'legal' ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
                : docClass === 'marketing' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                : 'bg-gray-50 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
              }`}>
                {docClass}
              </span>
            )}
          </div>

          {/* Formatting toolbar */}
          <DocumentToolbar editor={editor} />

          {/* Yulia revision bar */}
          <div className="shrink-0 flex items-center gap-2 px-4 py-2 border-b border-[#EBE7DF] dark:border-[#3A3C3E] bg-[#FAFAF8] dark:bg-[#222426]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D44A78" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
            </svg>
            <input
              type="text"
              value={revisionPrompt}
              onChange={e => setRevisionPrompt(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleRevision()}
              placeholder="Ask Yulia to revise... (e.g. 'make the financial projections more aggressive')"
              className="flex-1 text-xs text-[#0D0D0D] dark:text-[#E8E6E3] bg-transparent border-0 outline-none placeholder:text-[#A9A49C]"
            />
            <button
              onClick={handleRevision}
              disabled={!revisionPrompt.trim() || revising}
              className="px-3 py-1 rounded-md text-[10px] font-semibold bg-[#D44A78] text-white border-0 cursor-pointer hover:bg-[#B03860] disabled:opacity-40 transition-colors"
            >
              {revising ? 'Revising...' : 'Revise'}
            </button>
          </div>
        </>
      )}

      {/* Document content */}
      <div className="flex-1 overflow-y-auto min-h-0" id={editable ? undefined : 'canvas-print-area'}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
