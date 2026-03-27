/**
 * ChatMorph — Legacy wrapper. Now a simple passthrough.
 * Original morph/sidebar logic moved to AppShell.
 */
interface Props {
  children: React.ReactNode;
}

export default function ChatMorph({ children }: Props) {
  return <>{children}</>;
}
