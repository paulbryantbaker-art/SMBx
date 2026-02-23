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

  const isChat = morphPhase === 'chat';
  const isMorphing = morphPhase === 'morphing';

  return (
    <div className={`flex flex-col bg-[#FAF8F4] ${isChat ? 'h-dvh overflow-hidden' : 'min-h-dvh'}`}>
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
