import { useRef, useState, type CSSProperties, type FormEvent, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { MobileIcon } from "./icons";

interface ChatStarterPillProps {
  placeholder: string;
  ariaLabel: string;
  onSend: (message: string) => void;
  style?: CSSProperties;
}

export const CHAT_COMPOSER_STYLES: Record<string, CSSProperties> = {
  pill: {
    background: "rgba(255,255,255,0.92)",
    border: "1px solid var(--mb-line-2)",
    borderRadius: 20,
    padding: 6,
    paddingLeft: 14,
    display: "flex",
    alignItems: "flex-end",
    gap: 8,
    boxShadow: "0 6px 20px -6px rgba(0,0,0,0.12)",
    backdropFilter: "blur(10px) saturate(185%) contrast(1.06)",
    WebkitBackdropFilter: "blur(10px) saturate(185%) contrast(1.06)",
  },
  input: {
    flex: 1,
    minWidth: 0,
    border: "none",
    background: "transparent",
    outline: "none",
    resize: "none",
    fontFamily: "var(--mb-font-body)",
    fontSize: 16,
    lineHeight: 1.4,
    color: "var(--mb-ink)",
    padding: "8px 4px",
    maxHeight: 160,
  },
  send: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    background: "var(--mb-action)",
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    flexShrink: 0,
    transition: "opacity 120ms",
  },
};

export function ChatStarterPill({
  placeholder,
  ariaLabel,
  onSend,
  style,
}: ChatStarterPillProps) {
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const canSend = Boolean(draft.trim());

  const submit = () => {
    const message = draft.trim();
    if (!message) return;
    onSend(message);
    setDraft("");
    inputRef.current?.blur();
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    submit();
  };

  const onKeyDown = (event: ReactKeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  };

  return (
    <form onSubmit={onSubmit} style={{ ...CHAT_COMPOSER_STYLES.pill, ...style }}>
      <textarea
        ref={inputRef}
        rows={1}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        aria-label={ariaLabel}
        style={CHAT_COMPOSER_STYLES.input}
      />
      <button
        type="submit"
        aria-label="Send"
        disabled={!canSend}
        style={{
          ...CHAT_COMPOSER_STYLES.send,
          opacity: canSend ? 1 : 0.4,
        }}
      >
        <MobileIcon name="arrowUp" size={16} c="#fff" />
      </button>
    </form>
  );
}
