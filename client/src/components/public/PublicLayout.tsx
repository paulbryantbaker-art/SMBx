import PublicNav from './PublicNav';
import Footer from './Footer';
import MorphChatView from './MorphChatView';
import { useChatContext } from '../../contexts/ChatContext';

interface Props {
  children: React.ReactNode;
  /** Hide nav/footer for auth pages */
  minimal?: boolean;
}

export default function PublicLayout({ children, minimal }: Props) {
  const { morphPhase } = useChatContext();

  const isMorphing = morphPhase === 'morphing';
  const isChat = morphPhase === 'chat';

  return (
    <div className="min-h-dvh flex flex-col bg-[#FAF8F4]">
      {!minimal && <PublicNav chatMode={isChat} />}

      {isChat ? (
        <main className="flex-1 flex flex-col morph-fade-in">
          <MorphChatView />
        </main>
      ) : (
        <>
          <main className={`flex-1 ${isMorphing ? 'morph-fade-out' : ''}`}>
            {children}
          </main>
          {!minimal && (
            <div className={isMorphing ? 'morph-fade-out' : ''}>
              <Footer />
            </div>
          )}
        </>
      )}
    </div>
  );
}
