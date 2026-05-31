export function V6HistoryView() {
  return (
    <div className="wk-content m-fade-up" style={{ maxWidth: 640 }}>
      <div className="mono" style={{ fontSize: 9.5, color: "var(--ink-2)", letterSpacing: "0.14em", fontWeight: 600 }}>COMING SOON</div>
      <h1 style={{
        fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 26,
        letterSpacing: "-0.025em", margin: "6px 0 10px", color: "var(--ink)",
      }}>Conversation history</h1>
      <p style={{ fontSize: 13.5, lineHeight: 1.55, color: "var(--ink-2)", margin: "0 0 18px", maxWidth: 520 }}>
        A searchable log of every conversation with Yulia &mdash; pinned threads, tagged topics, and continuation links so you can pick up where you left off. Shipping next.
      </p>
      <div style={{
        display: "flex", flexDirection: "column", gap: 6,
        padding: 16, borderRadius: 12,
        background: "var(--surface-2)",
        border: "1px solid var(--line)",
        maxWidth: 520,
      }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink)" }}>For now</div>
        <div style={{ fontSize: 12.5, color: "var(--ink-3)", lineHeight: 1.5 }}>
          Your authenticated chats persist across sessions. Open a deal to resume that deal&rsquo;s conversation.
        </div>
      </div>
    </div>
  );
}
