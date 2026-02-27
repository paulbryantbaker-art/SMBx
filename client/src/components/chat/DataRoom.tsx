import { useState, useEffect, useCallback } from 'react';
import { authHeaders } from '../../hooks/useAuth';

interface Folder {
  id: number;
  name: string;
  gate: string | null;
  sort_order: number;
}

interface Document {
  id: number;
  folder_id: number | null;
  name: string;
  file_type: string;
  status: 'draft' | 'review' | 'approved' | 'locked';
  version: number;
  deliverable_id: number | null;
  created_at: string;
  updated_at: string;
  deliverable_status: string | null;
  deliverable_completed_at: string | null;
}

interface UnfiledDeliverable {
  id: number;
  status: string;
  created_at: string;
  completed_at: string | null;
  name: string;
  slug: string;
  tier: string;
  gate: string;
  journey: string;
}

interface DataRoomProps {
  dealId: number | null;
  onViewDeliverable: (id: number) => void;
}

const DOC_STATUS: Record<string, { label: string; color: string }> = {
  draft: { label: 'Draft', color: 'text-yellow-700 bg-yellow-50 border-yellow-200' },
  review: { label: 'Review', color: 'text-blue-700 bg-blue-50 border-blue-200' },
  approved: { label: 'Approved', color: 'text-green-700 bg-green-50 border-green-200' },
  locked: { label: 'Locked', color: 'text-gray-600 bg-gray-100 border-gray-200' },
};

const DELIVERABLE_STATUS: Record<string, { label: string; color: string }> = {
  queued: { label: 'Queued', color: 'text-yellow-600 bg-yellow-50' },
  generating: { label: 'Generating...', color: 'text-blue-600 bg-blue-50' },
  complete: { label: 'Ready', color: 'text-green-700 bg-green-50' },
  failed: { label: 'Failed', color: 'text-red-600 bg-red-50' },
};

export default function DataRoom({ dealId, onViewDeliverable }: DataRoomProps) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [unfiledDeliverables, setUnfiledDeliverables] = useState<UnfiledDeliverable[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filingId, setFilingId] = useState<number | null>(null);

  const fetchDataRoom = useCallback(async () => {
    if (!dealId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/deals/${dealId}/data-room`, { headers: authHeaders() });
      if (!res.ok) {
        setError('Failed to load data room');
        return;
      }
      const data = await res.json();
      setFolders(data.folders || []);
      setDocuments(data.documents || []);
      setUnfiledDeliverables(data.unfiledDeliverables || []);
      // Auto-expand all folders on first load
      if (data.folders?.length) {
        setExpandedFolders(prev => {
          if (prev.size === 0) return new Set(data.folders.map((f: Folder) => f.id));
          return prev;
        });
      }
    } catch {
      setError('Network error — please check your connection');
    }
    finally { setLoading(false); }
  }, [dealId]);

  useEffect(() => { fetchDataRoom(); }, [fetchDataRoom]);

  // Poll if any deliverables are generating
  useEffect(() => {
    const hasInProgress = unfiledDeliverables.some(d => d.status === 'queued' || d.status === 'generating');
    if (!hasInProgress) return;
    const interval = setInterval(fetchDataRoom, 5000);
    return () => clearInterval(interval);
  }, [unfiledDeliverables, fetchDataRoom]);

  const toggleFolder = (id: number) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const fileDeliverable = async (deliverableId: number, folderId: number) => {
    if (!dealId) return;
    setFilingId(deliverableId);
    try {
      await fetch(`/api/deals/${dealId}/data-room/file`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ deliverableId, folderId }),
      });
      await fetchDataRoom();
    } catch { /* ignore */ }
    finally { setFilingId(null); }
  };

  const getDocsForFolder = (folderId: number) =>
    documents.filter(d => d.folder_id === folderId);

  if (!dealId) {
    return (
      <div className="p-6 text-center">
        <p className="text-sm text-text-secondary m-0">Start a conversation to see your data room here.</p>
      </div>
    );
  }

  if (loading && folders.length === 0 && documents.length === 0) {
    return (
      <div className="p-4 space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse">
            <div className="flex items-center gap-2 px-3 py-2">
              <div className="w-3 h-3 bg-[#EBE7DF] rounded" />
              <div className="w-3.5 h-3.5 bg-[#EBE7DF] rounded" />
              <div className="h-3 bg-[#EBE7DF] rounded" style={{ width: `${50 + i * 15}%` }} />
            </div>
            <div className="ml-9 space-y-1.5 pl-3" style={{ borderLeft: '1px solid #EBE7DF' }}>
              <div className="flex items-center gap-2 px-3 py-1">
                <div className="w-3 h-3 bg-[#F3F0EA] rounded" />
                <div className="h-2.5 bg-[#F3F0EA] rounded" style={{ width: `${40 + i * 10}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-sm text-red-600 m-0 mb-2">{error}</p>
        <button onClick={fetchDataRoom} className="text-sm font-semibold text-[#D4714E] bg-transparent border-0 cursor-pointer hover:underline">
          Try again
        </button>
      </div>
    );
  }

  const isEmpty = folders.length === 0 && documents.length === 0 && unfiledDeliverables.length === 0;

  if (isEmpty) {
    return (
      <div className="p-6 text-center">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-cream flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7A766E" strokeWidth="1.5">
            <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
          </svg>
        </div>
        <p className="text-sm font-medium text-text-primary m-0 mb-1">No documents yet</p>
        <p className="text-xs text-text-secondary m-0">Documents and deliverables will appear here as you progress through your journey.</p>
      </div>
    );
  }

  return (
    <div className="py-2">
      {/* Folder tree */}
      {folders.map(folder => {
        const folderDocs = getDocsForFolder(folder.id);
        const isExpanded = expandedFolders.has(folder.id);

        return (
          <div key={folder.id}>
            <button
              onClick={() => toggleFolder(folder.id)}
              className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-[#F3F0EA] transition-colors cursor-pointer border-0 bg-transparent"
            >
              <svg
                width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6E6A63" strokeWidth="2"
                className="shrink-0 transition-transform"
                style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
              <svg width="14" height="14" viewBox="0 0 24 24" fill={isExpanded ? '#D4714E' : '#A9A49C'} stroke="none" className="shrink-0">
                <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
              </svg>
              <span className="text-[13px] font-medium text-[#1A1A18] truncate">{folder.name}</span>
              {folderDocs.length > 0 && (
                <span className="text-[10px] text-[#A9A49C] ml-auto shrink-0">{folderDocs.length}</span>
              )}
            </button>

            {isExpanded && (
              <div className="ml-4 pl-3" style={{ borderLeft: '1px solid #EBE7DF' }}>
                {folderDocs.length === 0 ? (
                  <p className="text-[11px] text-[#A9A49C] px-3 py-1.5 m-0">No documents</p>
                ) : (
                  folderDocs.map(doc => {
                    const status = DOC_STATUS[doc.status] || DOC_STATUS.draft;
                    const isClickable = doc.deliverable_id && doc.deliverable_status === 'complete';
                    return (
                      <button
                        key={doc.id}
                        onClick={() => isClickable && doc.deliverable_id && onViewDeliverable(doc.deliverable_id)}
                        disabled={!isClickable}
                        className={`w-full flex items-center gap-2 px-3 py-1.5 text-left transition-colors border-0 bg-transparent rounded-md ${
                          isClickable ? 'hover:bg-[#F3F0EA] cursor-pointer' : 'opacity-70 cursor-default'
                        }`}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#7A766E" strokeWidth="1.5" className="shrink-0">
                          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                          <path d="M14 2v6h6" />
                        </svg>
                        <span className="text-[12px] text-[#3D3B37] truncate flex-1">{doc.name}</span>
                        <span className={`text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded border whitespace-nowrap ${status.color}`}>
                          {status.label}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Unfiled deliverables */}
      {unfiledDeliverables.length > 0 && (
        <div className="mt-3 pt-3" style={{ borderTop: '1px solid #EBE7DF' }}>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#A9A49C] px-3 mb-1">
            Unfiled Deliverables
          </p>
          {unfiledDeliverables.map(d => {
            const status = DELIVERABLE_STATUS[d.status] || DELIVERABLE_STATUS.queued;
            const isReady = d.status === 'complete';
            const isFiling = filingId === d.id;

            return (
              <div key={d.id} className="px-3 py-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => isReady && onViewDeliverable(d.id)}
                    disabled={!isReady}
                    className={`flex-1 flex items-center gap-2 text-left border-0 bg-transparent p-0 min-w-0 ${
                      isReady ? 'cursor-pointer' : 'cursor-default'
                    }`}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={isReady ? '#D4714E' : '#A9A49C'} strokeWidth="1.5" className="shrink-0">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                      <path d="M14 2v6h6" />
                    </svg>
                    <span className={`text-[12px] truncate ${isReady ? 'text-[#3D3B37]' : 'text-[#A9A49C]'}`}>{d.name}</span>
                  </button>
                  <span className={`text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded-full whitespace-nowrap ${status.color}`}>
                    {status.label}
                  </span>
                </div>

                {/* File into folder dropdown */}
                {isReady && folders.length > 0 && (
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <span className="text-[10px] text-[#A9A49C]">File to:</span>
                    {folders.map(f => (
                      <button
                        key={f.id}
                        onClick={() => fileDeliverable(d.id, f.id)}
                        disabled={isFiling}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-[#F3F0EA] text-[#6E6A63] border-0 cursor-pointer hover:bg-[#EBE7DF] hover:text-[#D4714E] transition-colors disabled:opacity-50"
                      >
                        {f.name}
                      </button>
                    ))}
                  </div>
                )}

                {d.status === 'generating' && (
                  <div className="mt-1.5 h-1 bg-blue-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full animate-pulse" style={{ width: '60%' }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
