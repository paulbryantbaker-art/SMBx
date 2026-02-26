import { useState, useEffect } from 'react';
import { authHeaders } from '../../hooks/useAuth';
import Button from '../ui/Button';

interface DeliverableViewerProps {
  deliverableId: number;
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
}

export default function DeliverableViewer({ deliverableId, onClose }: DeliverableViewerProps) {
  const [data, setData] = useState<DeliverableData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/deliverables/${deliverableId}`, { headers: authHeaders() });
        if (res.ok) setData(await res.json());
      } catch { /* ignore */ }
      finally { setLoading(false); }
    })();
  }, [deliverableId]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-[rgba(0,0,0,0.5)] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex items-center justify-center p-12">
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="fixed inset-0 z-50 bg-[rgba(0,0,0,0.5)] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-4xl w-full p-8 text-center">
          <p className="text-text-secondary mb-4">Deliverable not found.</p>
          <Button variant="secondary" onClick={onClose}>Close</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-[rgba(0,0,0,0.5)] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-text-primary font-[Georgia,ui-serif,serif] m-0">
              {data.name}
            </h2>
            {data.completed_at && (
              <p className="text-xs text-text-secondary m-0 mt-0.5">
                Generated {new Date(data.completed_at).toLocaleDateString()}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-cream flex items-center justify-center cursor-pointer border-0 bg-transparent"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {data.content ? (
            <DeliverableContent content={data.content} />
          ) : (
            <p className="text-text-secondary text-center py-12">No content available.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function DeliverableContent({ content }: { content: Record<string, any> }) {
  // Handle different content structures
  if (content.sections && Array.isArray(content.sections)) {
    return (
      <div className="space-y-6">
        {content.type && (
          <div className="px-4 py-3 bg-cream rounded-xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary m-0 mb-1">Document Type</p>
            <p className="text-sm font-medium text-text-primary m-0">{content.type.replace(/_/g, ' ')}</p>
          </div>
        )}
        {content.sections.map((section: any, i: number) => (
          <div key={i}>
            <h3 className="text-base font-semibold text-text-primary font-[Georgia,ui-serif,serif] m-0 mb-2">
              {section.title}
            </h3>
            <div className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">
              {section.content}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Handle key-value report format
  if (content.type) {
    return (
      <div className="space-y-4">
        {Object.entries(content).map(([key, value]) => {
          if (key === 'type' || key === 'generated_at') return null;
          return (
            <div key={key} className="border-b border-border pb-3 last:border-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary m-0 mb-1">
                {key.replace(/_/g, ' ')}
              </p>
              <div className="text-sm text-text-primary">
                {renderValue(value)}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Fallback: raw JSON
  return (
    <pre className="text-xs text-text-primary bg-cream rounded-xl p-4 overflow-x-auto whitespace-pre-wrap">
      {JSON.stringify(content, null, 2)}
    </pre>
  );
}

function renderValue(value: any): JSX.Element {
  if (value === null || value === undefined) return <span className="text-text-secondary">—</span>;
  if (typeof value === 'boolean') return <span>{value ? 'Yes' : 'No'}</span>;
  if (typeof value === 'number') return <span>{value.toLocaleString()}</span>;
  if (typeof value === 'string') return <span className="whitespace-pre-wrap">{value}</span>;

  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="text-text-secondary">None</span>;
    if (typeof value[0] === 'string') {
      return (
        <ul className="list-disc pl-5 m-0 space-y-0.5">
          {value.map((item, i) => <li key={i}>{item}</li>)}
        </ul>
      );
    }
    return (
      <div className="space-y-2">
        {value.map((item, i) => (
          <div key={i} className="bg-cream rounded-lg p-3">
            {typeof item === 'object' ? (
              Object.entries(item).map(([k, v]) => (
                <div key={k} className="flex justify-between text-xs py-0.5">
                  <span className="text-text-secondary">{k.replace(/_/g, ' ')}</span>
                  <span className="font-medium">{String(v)}</span>
                </div>
              ))
            ) : (
              <span>{String(item)}</span>
            )}
          </div>
        ))}
      </div>
    );
  }

  if (typeof value === 'object') {
    return (
      <div className="bg-cream rounded-lg p-3 space-y-1">
        {Object.entries(value).map(([k, v]) => (
          <div key={k} className="flex justify-between text-xs py-0.5">
            <span className="text-text-secondary">{k.replace(/_/g, ' ')}</span>
            <span className="font-medium">{typeof v === 'number' ? v.toLocaleString() : String(v)}</span>
          </div>
        ))}
      </div>
    );
  }

  return <span>{String(value)}</span>;
}
