/* ============================================================================
   NDYuliaChat — the REAL agent rendered in the agent-first design language.
   Consumes the V6 ChatBridge (the live useAuthChat loop) and renders it with
   the nd chrome: thread → YuliaMsg/UserMsg, toolTrace → Task checklist,
   stagedAction → StagedConfirm (THE LINE), streamingText → in-progress turn,
   Composer → chat.send. No new chat plumbing — this is a faithful skin over the
   agentic loop the app already runs.
   ============================================================================ */
import { useEffect, useRef, useState } from "react";
import type { ChatBridge } from "../v6/V6App";
import { YuliaMark } from "./primitives";
import { YuliaMsg, UserMsg, Task, Composer, StagedConfirm } from "./chrome";

const LAW_LINE = "Yulia shows analysis & implications — and asks before anything irreversible.";

export function NDYuliaChat({ chat, scope = "Workspace", placeholder }: { chat: ChatBridge; scope?: string; placeholder?: string }) {
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // keep the thread pinned to the latest turn
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [chat.thread.length, chat.streamingText, chat.sending]);

  const submit = (text: string) => {
    const t = text.trim();
    if (!t || chat.sending) return;
    chat.send(t);
    setDraft("");
  };

  const empty = chat.thread.length === 0 && !chat.sending;

  return (
    <div className="mck-col" style={{ height: "100%", minHeight: 0 }}>
      <div ref={scrollRef} className="mck-grow mck-scrollfade" style={{ overflowY: "auto", padding: "20px 18px", display: "flex", flexDirection: "column", gap: 22 }}>
        {empty && (
          <YuliaMsg time="">
            <div className="mck-prose">Hi, I'm Yulia, your deal desk. Ask me to source, value, diligence, draft, or close — I'll run it and report back.</div>
          </YuliaMsg>
        )}

        {chat.thread.map((m, i) => (
          m.who === "u" ? (
            <UserMsg key={i}>{m.text}</UserMsg>
          ) : (
            <YuliaMsg key={i}>
              {m.text && <div className="mck-prose" style={{ marginBottom: m.stagedAction ? 12 : 0 }}>{m.text}</div>}
              {m.stagedAction && (
                <StagedConfirm
                  title={m.stagedAction.label || "Yulia needs your go-ahead"}
                  kv={[
                    { k: "Action", v: m.stagedAction.summary },
                    ...(m.stagedAction.writeScope ? [{ k: "Scope", v: m.stagedAction.writeScope }] : []),
                  ]}
                  note={LAW_LINE}
                  status="open"
                  confirmLabel="Confirm"
                  onConfirm={() => m.stagedAction?.id != null && chat.confirmStagedAction?.(m.stagedAction.id)}
                  onCancel={() => m.stagedAction?.id != null && chat.cancelStagedAction?.(m.stagedAction.id)}
                />
              )}
            </YuliaMsg>
          )
        ))}

        {/* in-flight turn: the work checklist (real tool trace) + streaming prose */}
        {chat.sending && (
          <YuliaMsg time="">
            {(chat.toolTrace ?? []).length > 0 && (
              <div style={{ marginBottom: chat.streamingText ? 12 : 0 }}>
                {(chat.toolTrace ?? []).map((t) => (
                  <Task key={t.id} state={t.status === "done" ? "done" : "run"} label={t.label || t.tool} tag={t.status === "done" && t.ms ? `${Math.round(t.ms)}ms` : undefined} />
                ))}
              </div>
            )}
            {chat.streamingText
              ? <div className="mck-prose">{chat.streamingText}</div>
              : (chat.toolTrace ?? []).length === 0 && <div className="mck-prose" style={{ color: "var(--ink-3)" }}>Yulia is thinking…</div>}
          </YuliaMsg>
        )}

        {chat.error && (
          <div className="mck-pill mck-pill-risk" style={{ alignSelf: "flex-start" }}>{chat.error}</div>
        )}
      </div>

      <div style={{ padding: "0 18px 16px" }}>
        <Composer
          value={draft}
          onChange={setDraft}
          onSend={submit}
          placeholder={placeholder || `Ask Yulia about ${scope}…`}
          scope={scope}
          lawLine
          busy={chat.sending}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 7, justifyContent: "center", marginTop: 9, fontSize: 10.5, color: "var(--ink-4)" }}>
          <YuliaMark size={13} radius={4} />{LAW_LINE}
        </div>
      </div>
    </div>
  );
}
