import { useState, useEffect, useCallback } from 'react';
import { authHeaders, useAuth } from '../hooks/useAuth';

interface Folder {
  id: number;
  name: string;
  gate: string | null;
  sort_order: number;
}

interface Document {
  id: number;
  folder_id: number;
  name: string;
  type: string;
  status: 'draft' | 'final' | 'archived';
  version: number;
  file_size: number | null;
  deliverable_id: number | null;
  created_at: string;
  updated_at: string;
}

interface DataRoomState {
  folders: Folder[];
  documents: Document[];
}

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-yellow-50 text-yellow-700',
  final: 'bg-green-50 text-green-700',
  archived: 'bg-gray-100 text-gray-500',
};

const FILE_ICONS: Record<string, string> = {
  valuation_report: '\u{1F4CA}',
  cim: '\u{1F4D1}',
  financial_model: '\u{1F4B9}',
  loi: '\u{1F4DD}',
  dd_package: '\u{1F50D}',
  default: '\u{1F4C4}',
};

export default function DataRoom({ dealId }: { dealId: number }) {
  const { user } = useAuth();
  const [data, setData] = useState<DataRoomState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);

  const loadDataRoom = useCallback(async () => {
    try {
      const res = await fetch(`/api/deals/${dealId}/data-room`, {
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error('Failed to load data room');
      const result = await res.json();
      setData(result);
      // Auto-select first folder
      if (!selectedFolder && result.folders.length > 0) {
        setSelectedFolder(result.folders[0].id);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [dealId, selectedFolder]);

  useEffect(() => {
    loadDataRoom();
  }, [loadDataRoom]);

  const handleUpload = async (folderId: number, file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folderId', String(folderId));

      const res = await fetch(`/api/data-room/${dealId}/upload`, {
        method: 'POST',
        headers: authHeaders(),
        body: formData,
      });
      if (res.ok) await loadDataRoom();
    } catch {
      // ignore
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent, folderId: number) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(folderId, file);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-2 border-[#A03050] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-sm text-[#6E6A63]">{error || 'No data room found'}</p>
      </div>
    );
  }

  const folderDocs = selectedFolder
    ? data.documents.filter(d => d.folder_id === selectedFolder)
    : [];

  const selectedFolderName = data.folders.find(f => f.id === selectedFolder)?.name || '';

  return (
    <div className="flex h-full bg-[#FAF9F6]">
      {/* Folder sidebar */}
      <div className="w-56 shrink-0 bg-white border-r border-[#EBE7DF] p-4">
        <h2 className="text-sm font-bold text-[#0D0D0D] mb-4 flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A03050" strokeWidth="2">
            <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
          </svg>
          Data Room
        </h2>
        <nav className="space-y-0.5">
          {data.folders.map(folder => {
            const docCount = data.documents.filter(d => d.folder_id === folder.id).length;
            return (
              <button
                key={folder.id}
                onClick={() => setSelectedFolder(folder.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-[13px] font-medium border-0 cursor-pointer transition-colors flex items-center justify-between ${
                  selectedFolder === folder.id
                    ? 'bg-[#FFF0EB] text-[#A03050]'
                    : 'bg-transparent text-[#3D3B37] hover:bg-[#F5F5F5]'
                }`}
                type="button"
              >
                <span className="truncate">{folder.name}</span>
                {docCount > 0 && (
                  <span className="text-[10px] font-semibold bg-[#EBE7DF] rounded-full px-1.5 py-0.5 shrink-0">
                    {docCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Document grid */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-[#0D0D0D] m-0">{selectedFolderName}</h3>
          {selectedFolder && (
            <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#A03050] text-white cursor-pointer hover:bg-[#802040] transition-colors">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              {uploading ? 'Uploading...' : 'Upload'}
              <input
                type="file"
                className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file && selectedFolder) handleUpload(selectedFolder, file);
                }}
              />
            </label>
          )}
        </div>

        {/* Drop zone */}
        {selectedFolder && (
          <div
            onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
            onDrop={e => handleDrop(e, selectedFolder)}
            className="min-h-[200px]"
          >
            {folderDocs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-[rgba(0,0,0,0.08)] rounded-xl text-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="1.5" className="mb-3">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <p className="text-sm text-[#A9A49C] m-0 mb-1">No documents yet</p>
                <p className="text-xs text-[rgba(0,0,0,0.06)] m-0">Drag files here or click Upload</p>
              </div>
            ) : (
              <div className="space-y-2">
                {folderDocs.map(doc => (
                  <div
                    key={doc.id}
                    className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-[#EBE7DF] hover:border-[#A03050]/30 hover:shadow-sm transition-all cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-lg bg-[#F5F5F5] flex items-center justify-center text-base shrink-0">
                      {FILE_ICONS[doc.type] || FILE_ICONS.default}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[#0D0D0D] m-0 truncate">{doc.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-[#A9A49C]">
                          {new Date(doc.created_at).toLocaleDateString()}
                        </span>
                        {doc.version > 1 && (
                          <span className="text-[10px] text-[#A9A49C]">v{doc.version}</span>
                        )}
                        {doc.file_size && (
                          <span className="text-[10px] text-[#A9A49C]">
                            {doc.file_size < 1024 * 1024
                              ? `${Math.round(doc.file_size / 1024)}KB`
                              : `${(doc.file_size / (1024 * 1024)).toFixed(1)}MB`}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full shrink-0 ${STATUS_COLORS[doc.status] || ''}`}>
                      {doc.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
