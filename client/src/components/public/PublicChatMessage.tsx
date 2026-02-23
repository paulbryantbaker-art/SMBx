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
        <div className="max-w-[75%] bg-[#1A1A18] text-white rounded-2xl rounded-br-[4px] px-[18px] py-[14px]">
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
      <div className="max-w-[75%] bg-[#FAF8F4] border border-[#E0DCD4] rounded-2xl rounded-bl-[4px] px-[18px] py-[14px]">
        <div className="text-sm font-sans text-[#1A1A18] leading-[1.55] [&_p]:m-0 [&_p+p]:mt-2.5 [&_strong]:font-semibold [&_code]:bg-[rgba(0,0,0,0.04)] [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_ul]:mt-2 [&_ul]:pl-5 [&_ol]:mt-2 [&_ol]:pl-5 [&_li]:mt-1">
          <Markdown>{message.content}</Markdown>
        </div>
      </div>
    </div>
  );
}
