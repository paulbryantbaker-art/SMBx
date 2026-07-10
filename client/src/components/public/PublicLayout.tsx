import { useEffect } from 'react';
import PublicNav from './PublicNav';
import Footer from './Footer';
import ChatMorph from '../chat/ChatMorph';
import { useChatContext } from '../../context/ChatContext';

interface Props {
  children: React.ReactNode;
  /** Hide nav/footer for auth pages */
  minimal?: boolean;
}

export default function PublicLayout({ children, minimal }: Props) {
  const { morphPhase } = useChatContext();

  // index.css locks html/body scrolling for the desktop app (≥901px). These
  // long-form public pages (Terms/Privacy) scroll the document — release the
  // lock while mounted, exactly like the marketing shells do. Without this
  // the legal pages are scroll-frozen on desktop.
  useEffect(() => {
    const html = document.documentElement.style;
    const body = document.body.style;
    const prevHtml = html.overflow;
    const prevBody = body.overflow;
    html.overflow = 'auto';
    body.overflow = 'auto';
    return () => {
      html.overflow = prevHtml;
      body.overflow = prevBody;
    };
  }, []);

  const isChat = morphPhase === 'chat';
  const isMorphing = morphPhase === 'morphing';

  return (
    <div className={`flex flex-col bg-[#f5f4ed] ${isChat ? 'h-dvh overflow-hidden' : 'min-h-dvh pt-28'}`}>
      {!minimal && <PublicNav chatMode={isChat} />}

      <ChatMorph>{children}</ChatMorph>

      {!minimal && !isChat && (
        <div className={isMorphing ? 'morph-fade-out pointer-events-none' : ''}>
          <Footer />
        </div>
      )}
    </div>
  );
}
