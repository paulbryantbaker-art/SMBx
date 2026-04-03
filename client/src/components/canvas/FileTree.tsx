/**
 * FileTree — hierarchical file manager for deal documents.
 *
 * Tree structure with folders, deliverables, and uploaded files.
 * CRUD: create folder, rename, delete, upload, move.
 * Design: Inter 12-13px, terra accents, warm grays, expand/collapse.
 */
import { useState, useEffect, useCallback } from 'react';
import { authHeaders } from '../../hooks/useAuth';

interface Folder {
  id: number;
  name: string;
  gate_unlock?: string;
}

interface Document {
  id: number;
  folder_id: number | null;
  name: string;
  file_type: string;
  status: string;
  doc_class?: string;
  deliverable_id?: number;
  file_size?: number;
  created_at: string;
}

interface FileTreeProps {
  dealId: number | null;
  onOpenDocument: (doc: Document) => void;
  onUpload?: () => void;
  dark?: boolean;
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  draft: { bg: 'rgba(107,114,128,0.1)', text: '#6B7280' },
  review: { bg: 'rgba(212,74,120,0.1)', text: '#D44A78' },
  approved: { bg: 'rgba(5,150,105,0.1)', text: '#059669' },
  agreed: { bg: 'rgba(37,99,235,0.1)', text: '#2563EB' },
  executed: { bg: 'rgba(124,58,237,0.1)', text: '#7C3AED' },
  locked: { bg: 'rgba(107,114,128,0.1)', text: '#6B7280' },
  complete: { bg: 'rgba(5,150,105,0.1)', text: '#059669' },
  generating: { bg: 'rgba(217,119,6,0.1)', text: '#D97706' },
};

const DOC_CLASS_ICONS: Record<string, string> = {
  legal: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  marketing: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z',
  evidence: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  working: 'M9 7h6m0 10v-3m-3 3v-6m-3 6v-2M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z',
};

function FileIcon({ fileType, docClass }: { fileType?: string; docClass?: string }) {
  const path = docClass ? DOC_CLASS_ICONS[docClass] : DOC_CLASS_ICONS.working;
  const color = docClass === 'legal' ? '#7C3AED'
    : docClass === 'marketing' ? '#2563EB'
    : docClass === 'evidence' ? '#059669'
    : '#6E6A63';
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d={path || DOC_CLASS_ICONS.working} />
    </svg>
  );
}

function formatSize(bytes: number | undefined): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function FileTree({ dealId, onOpenDocument, onUpload, dark }: FileTreeProps) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; doc?: Document; folder?: Folder } | null>(null);

  const fetchData = useCallback(async () => {
    if (!dealId) return;
    try {
      const res = await fetch(`/api/deals/${dealId}/data-room`, { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        setFolders(data.folders || []);
        setDocuments(data.documents || []);
        // Auto-expand folders with documents
        const withDocs = new Set((data.documents || []).map((d: any) => d.folder_id).filter(Boolean));
        setExpanded(withDocs);
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, [dealId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const toggleFolder = (folderId: number) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(folderId)) next.delete(folderId);
      else next.add(folderId);
      return next;
    });
  };

  const getDocsForFolder = (folderId: number) =>
    documents.filter(d => d.folder_id === folderId);

  const unfiledDocs = documents.filter(d => !d.folder_id);

  const filteredFolders = search
    ? folders.filter(f =>
        f.name.toLowerCase().includes(search.toLowerCase()) ||
        getDocsForFolder(f.id).some(d => d.name.toLowerCase().includes(search.toLowerCase()))
      )
    : folders;

  const handleContextMenu = (e: React.MouseEvent, doc?: Document, folder?: Folder) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, doc, folder });
  };

  const handleDelete = async (docId: number) => {
    try {
      await fetch(`/api/data-room/documents/${docId}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      fetchData();
    } catch { /* ignore */ }
    setContextMenu(null);
  };

  const handleRename = async (docId: number) => {
    const newName = window.prompt('New name:');
    if (!newName) return;
    try {
      await fetch(`/api/data-room/documents/${docId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ name: newName }),
      });
      fetchData();
    } catch { /* ignore */ }
    setContextMenu(null);
  };

  if (!dealId) {
    return (
      <div className="p-6 text-center">
        <p className={`text-sm ${dark ? 'text-[#6E6A63]' : 'text-[#A9A49C]'}`}>
          Select a deal to view documents
        </p>
      </div>
    );
  }

  return (
    <div
      className="h-full flex flex-col"
      onClick={() => setContextMenu(null)}
    >
      {/* Header */}
      <div className="shrink-0 px-3 py-2.5 flex items-center justify-between"
        style={{ borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}>
        <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: dark ? '#6E6A63' : '#A9A49C' }}>
          Files
        </span>
        {onUpload && (
          <button
            onClick={onUpload}
            className="w-6 h-6 rounded flex items-center justify-center border-0 cursor-pointer transition-colors"
            style={{ background: 'transparent', color: dark ? '#6E6A63' : '#A9A49C' }}
            title="Upload file"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        )}
      </div>

      {/* Search */}
      <div className="shrink-0 px-3 py-2">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search files..."
          className="w-full text-xs px-2.5 py-1.5 rounded-md border-0 outline-none"
          style={{
            background: dark ? '#2A2C2E' : '#F5F5F3',
            color: dark ? '#E8E6E3' : '#0D0D0D',
          }}
        />
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto px-1 py-1">
        {loading ? (
          <div className="p-4 text-center">
            <div className="w-5 h-5 border-2 border-[#D44A78] border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : (
          <>
            {filteredFolders.map(folder => {
              const folderDocs = getDocsForFolder(folder.id);
              const isExpanded = expanded.has(folder.id);
              const hasMatchingDocs = search && folderDocs.some(d =>
                d.name.toLowerCase().includes(search.toLowerCase()));

              return (
                <div key={folder.id}>
                  {/* Folder row */}
                  <button
                    onClick={() => toggleFolder(folder.id)}
                    onContextMenu={e => handleContextMenu(e, undefined, folder)}
                    className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-md border-0 cursor-pointer transition-colors text-left"
                    style={{
                      background: 'transparent',
                      fontFamily: "'Inter', system-ui, sans-serif",
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                  >
                    {/* Chevron */}
                    <svg
                      width="10" height="10" viewBox="0 0 24 24" fill="none"
                      stroke={dark ? '#6E6A63' : '#A9A49C'} strokeWidth="2"
                      style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform 0.15s ease', flexShrink: 0 }}
                    >
                      <path d="M9 18l6-6-6-6" />
                    </svg>

                    {/* Folder icon */}
                    <svg width="14" height="14" viewBox="0 0 24 24"
                      fill={isExpanded ? (dark ? '#E8709A' : '#D44A78') : 'none'}
                      stroke={isExpanded ? (dark ? '#E8709A' : '#D44A78') : (dark ? '#6E6A63' : '#A9A49C')}
                      strokeWidth="1.5"
                    >
                      <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>

                    {/* Name */}
                    <span className="flex-1 truncate text-[12px] font-medium"
                      style={{ color: dark ? '#C8C4BC' : '#3D3B37' }}>
                      {folder.name}
                    </span>

                    {/* Count */}
                    {folderDocs.length > 0 && (
                      <span className="text-[10px] tabular-nums" style={{ color: dark ? '#6E6A63' : '#A9A49C' }}>
                        {folderDocs.length}
                      </span>
                    )}
                  </button>

                  {/* Documents */}
                  {(isExpanded || hasMatchingDocs) && folderDocs.length > 0 && (
                    <div className="ml-3 pl-2.5" style={{ borderLeft: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : '#EBE7DF'}` }}>
                      {folderDocs
                        .filter(d => !search || d.name.toLowerCase().includes(search.toLowerCase()))
                        .map(doc => (
                          <button
                            key={doc.id}
                            onClick={() => onOpenDocument(doc)}
                            onContextMenu={e => handleContextMenu(e, doc)}
                            className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-md border-0 cursor-pointer transition-colors text-left"
                            style={{ background: 'transparent', fontFamily: "'Inter', system-ui, sans-serif" }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                          >
                            <FileIcon fileType={doc.file_type} docClass={doc.doc_class} />
                            <span className="flex-1 truncate text-[12px]" style={{ color: dark ? '#E8E6E3' : '#0D0D0D' }}>
                              {doc.name}
                            </span>
                            {doc.status && doc.status !== 'complete' && (
                              <span
                                className="text-[9px] font-semibold uppercase px-1 py-0.5 rounded"
                                style={STATUS_COLORS[doc.status] || STATUS_COLORS.draft}
                              >
                                {doc.status}
                              </span>
                            )}
                            <span className="text-[10px] tabular-nums shrink-0" style={{ color: dark ? '#6E6A63' : '#A9A49C' }}>
                              {timeAgo(doc.created_at)}
                            </span>
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Unfiled documents */}
            {unfiledDocs.length > 0 && (
              <div className="mt-2 pt-2" style={{ borderTop: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : '#EBE7DF'}` }}>
                <span className="px-2 text-[10px] font-bold uppercase tracking-wider" style={{ color: dark ? '#6E6A63' : '#A9A49C' }}>
                  Unfiled
                </span>
                <div className="mt-1">
                  {unfiledDocs.map(doc => (
                    <button
                      key={doc.id}
                      onClick={() => onOpenDocument(doc)}
                      onContextMenu={e => handleContextMenu(e, doc)}
                      className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-md border-0 cursor-pointer transition-colors text-left"
                      style={{ background: 'transparent', fontFamily: "'Inter', system-ui, sans-serif" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                    >
                      <FileIcon fileType={doc.file_type} docClass={doc.doc_class} />
                      <span className="flex-1 truncate text-[12px]" style={{ color: dark ? '#E8E6E3' : '#0D0D0D' }}>
                        {doc.name}
                      </span>
                      <span className="text-[10px] tabular-nums" style={{ color: dark ? '#6E6A63' : '#A9A49C' }}>
                        {formatSize(doc.file_size)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Empty state */}
            {folders.length === 0 && documents.length === 0 && (
              <div className="p-6 text-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={dark ? '#3A3C3E' : '#EBE7DF'} strokeWidth="1.5" className="mx-auto mb-3">
                  <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                <p className="text-xs" style={{ color: dark ? '#6E6A63' : '#A9A49C' }}>
                  No documents yet
                </p>
                <p className="text-[10px] mt-1" style={{ color: dark ? '#4A4A4A' : '#C8C4BC' }}>
                  Generate a deliverable or upload a file
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed z-50 rounded-lg shadow-lg py-1 min-w-[140px]"
          style={{
            left: contextMenu.x,
            top: contextMenu.y,
            background: dark ? '#2A2C2E' : '#FFFFFF',
            border: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
          }}
        >
          {contextMenu.doc && (
            <>
              <button
                onClick={() => { onOpenDocument(contextMenu.doc!); setContextMenu(null); }}
                className="w-full text-left px-3 py-1.5 text-[12px] border-0 cursor-pointer transition-colors"
                style={{ background: 'transparent', color: dark ? '#E8E6E3' : '#0D0D0D', fontFamily: "'Inter', system-ui, sans-serif" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                Open
              </button>
              <button
                onClick={() => handleRename(contextMenu.doc!.id)}
                className="w-full text-left px-3 py-1.5 text-[12px] border-0 cursor-pointer transition-colors"
                style={{ background: 'transparent', color: dark ? '#E8E6E3' : '#0D0D0D', fontFamily: "'Inter', system-ui, sans-serif" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                Rename
              </button>
              <div style={{ borderTop: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`, margin: '2px 0' }} />
              <button
                onClick={() => handleDelete(contextMenu.doc!.id)}
                className="w-full text-left px-3 py-1.5 text-[12px] border-0 cursor-pointer transition-colors"
                style={{ background: 'transparent', color: '#DC2626', fontFamily: "'Inter', system-ui, sans-serif" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                Delete
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
