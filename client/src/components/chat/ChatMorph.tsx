import { useChatContext } from '../../context/ChatContext';
import ChatView from './ChatView';

interface Props {
  children: React.ReactNode;
}

export default function ChatMorph({ children }: Props) {
  const { morphPhase } = useChatContext();

  if (morphPhase === 'chat') {
    return (
      <main className="flex-1 flex flex-col morph-fade-in">
        <ChatView />
      </main>
    );
  }

  return (
    <main className={`flex-1 ${morphPhase === 'morphing' ? 'morph-fade-out pointer-events-none' : ''}`}>
      {children}
    </main>
  );
}
