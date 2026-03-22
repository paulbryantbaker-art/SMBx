import Markdown from 'react-markdown';
import type { AnonMessage } from '../../hooks/useAnonymousChat';

interface Props {
  message: AnonMessage;
}

const PROSE_CLASSES = [
  '[&_p]:m-0 [&_p+p]:mt-2 [&_strong]:font-semibold',
  '[&_code]:bg-[rgba(0,0,0,0.05)] [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[13px]',
  '[&_pre]:bg-[#F5F5F5] [&_pre]:p-3 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_pre]:text-[13px]',
  '[&_ul]:mt-1 [&_ul]:pl-5 [&_ol]:mt-1 [&_ol]:pl-5 [&_li]:mt-0.5',
  '[&_blockquote]:border-l-2 [&_blockquote]:border-[#E0E0E0] [&_blockquote]:pl-3 [&_blockquote]:text-[#555] [&_blockquote]:italic',
  '[&_table]:w-full [&_table]:text-left [&_table]:text-sm',
  '[&_th]:px-2.5 [&_th]:py-1.5 [&_th]:font-bold [&_th]:border-b [&_th]:border-[rgba(0,0,0,0.08)]',
  '[&_td]:px-2.5 [&_td]:py-1.5 [&_td]:border-b [&_td]:border-[rgba(0,0,0,0.04)]',
  '[&_a]:text-[#000] [&_a]:underline [&_a]:underline-offset-2',
].join(' ');

export default function PublicChatMessage({ message }: Props) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{
          maxWidth: '85%',
          background: '#000', color: '#fff',
          padding: '10px 14px',
          borderRadius: '16px 16px 4px 16px',
          fontSize: 14, lineHeight: 1.5, fontWeight: 450,
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        }}>
          <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
        <div style={{
          width: 20, height: 20, borderRadius: '50%',
          background: '#000', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 8, fontWeight: 700,
        }}>
          Y
        </div>
        <span style={{
          fontSize: 12, fontWeight: 700, color: '#000',
          textTransform: 'uppercase', letterSpacing: '0.08em',
        }}>
          Yulia
        </span>
      </div>
      <div
        className={PROSE_CLASSES}
        style={{
          fontSize: 14, lineHeight: 1.65, fontWeight: 400,
          color: '#1A1A1A',
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
          userSelect: 'text',
          WebkitUserSelect: 'text',
          cursor: 'text',
        } as React.CSSProperties}
      >
        <Markdown>{message.content}</Markdown>
      </div>
    </div>
  );
}
