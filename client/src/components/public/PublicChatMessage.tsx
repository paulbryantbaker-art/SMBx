import Markdown from 'react-markdown';
import YuliaAvatar from './YuliaAvatar';
import type { AnonMessage } from '../../hooks/useAnonymousChat';

interface Props {
  message: AnonMessage;
}

export default function PublicChatMessage({ message }: Props) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div
          className="max-w-[75%] rounded-2xl rounded-br-[4px] px-[18px] py-[14px]"
          style={{ background: '#FFF0EB', border: '1px solid rgba(212,113,78,0.22)', color: '#1A1A18', boxShadow: '0 2px 8px rgba(26,26,24,0.08), 0 0 0 1px rgba(212,113,78,0.06)' }}
        >
          <p className="text-sm font-sans leading-[1.55] m-0 whitespace-pre-wrap">
            {message.content}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3">
      <YuliaAvatar size={32} className="mt-0.5" />
      <div className="max-w-[75%] bg-white px-4 py-3" style={{ borderRadius: '18px 18px 18px 4px', border: '1px solid rgba(224,220,212,0.6)', boxShadow: '0 1px 4px rgba(26,26,24,0.04)' }}>
        <div className="text-sm font-sans text-[#1A1A18] leading-[1.55] [&_p]:m-0 [&_p+p]:mt-2.5 [&_strong]:font-semibold [&_code]:bg-[rgba(0,0,0,0.04)] [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_ul]:mt-2 [&_ul]:pl-5 [&_ol]:mt-2 [&_ol]:pl-5 [&_li]:mt-1">
          <Markdown>{message.content}</Markdown>
        </div>
      </div>
    </div>
  );
}
