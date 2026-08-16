/**
 * PEOPLE — the flat address book as a directory (CRM_WORKFLOW_SPEC.md,
 * founder-gated nav item, built as the thin list the spec promised).
 *
 * READ-ONLY BY LAW. One edit surface per object: a person is edited on their
 * firm's Board dossier (Clients → Board), never here — a second editor is a
 * second place the truth lives. This screen exists to answer "who do we
 * know", cut by profession, and to say plainly which people are unreachable.
 *
 * Data is `GET /api/crm/contacts` via `useAddressBook` — the same hook the
 * deal-task assignee picker reads, so this directory and that picker can
 * never disagree about who exists. The endpoint carries NO per-person touch
 * history (activity hangs on the ACCOUNT), so the Last-touch column prints
 * "Not available" rather than a fabricated date; the ranking note says where
 * that history actually lives.
 */
import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { T } from "../atlasTokens";
import type { AtlasScreenProps } from "../atlasNav";
import {
  CriteriaBar, ChipRow, ListDetail, GroupHeader, ResultRow, RankingNote,
  InfoBanner, DetailCard, Page, Sheet,
  type Chip,
} from "../kit";
import {
  useAddressBook, ROLE_LABEL, CONTACT_ROLES,
  type AddressBookContact,
} from "../../../../hooks/useDealTasks";
import { touchLabel } from "../../../../lib/crm";

/** Contacts whose role is unset need a bucket — hiding them would make the
 *  book look smaller than it is. */
const NO_ROLE = "none";

export default function PeopleScreen({ user }: AtlasScreenProps) {
  const contacts = useAddressBook(user);
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<string>("all");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return contacts.filter(c => {
      if (role !== "all" && (c.role ?? NO_ROLE) !== role) return false;
      if (!q) return true;
      return [c.name, c.title, c.firm, c.email, c.role]
        .some(v => (v ?? "").toLowerCase().includes(q));
    });
  }, [contacts, query, role]);

  /* Counts come from the UNFILTERED book so a chip's number states what is
     behind it before the search narrows anything. */
  const byRole = useMemo(() => {
    const m = new Map<string, number>();
    for (const c of contacts) {
      const r = c.role ?? NO_ROLE;
      m.set(r, (m.get(r) ?? 0) + 1);
    }
    return m;
  }, [contacts]);

  const chips: Chip[] = [
    { id: "all", label: "Everyone", value: String(contacts.length) },
    ...CONTACT_ROLES
      .filter(r => (byRole.get(r) ?? 0) > 0)
      .map(r => ({ id: r, label: ROLE_LABEL[r] ?? r, value: String(byRole.get(r)) })),
    ...(byRole.get(NO_ROLE)
      ? [{ id: NO_ROLE, label: "No role recorded", value: String(byRole.get(NO_ROLE)) }]
      : []),
  ];

  /* Groups follow the chip vocabulary: role, in the book's own order. Within
     a group the endpoint's order holds — firm A→Z, primary contact first. */
  const groups = useMemo(() => {
    const order: string[] = [...CONTACT_ROLES, NO_ROLE];
    const m = new Map<string, AddressBookContact[]>();
    for (const c of filtered) {
      const r = c.role ?? NO_ROLE;
      if (!m.has(r)) m.set(r, []);
      m.get(r)!.push(c);
    }
    return order.filter(r => m.has(r)).map(r => ({
      role: r,
      title: r === NO_ROLE ? "No role recorded" : (ROLE_LABEL[r] ?? r),
      rows: m.get(r)!,
    }));
  }, [filtered]);

  const selected = contacts.find(c => c.id === selectedId) ?? null;

  const cells = [
    { label: "Looking at", value: "People — the whole address book", grow: 1 },
    {
      label: "Role",
      value: role === "all" ? "Any" : role === NO_ROLE ? "No role recorded" : (ROLE_LABEL[role] ?? role),
      grow: 1,
      onClick: () => {
        // Cycle through the roles that actually have people, same gesture as
        // the Deals criteria bar's "Run for" cell.
        const order = ["all", ...chips.slice(1).map(c => c.id)];
        const i = order.indexOf(role);
        setRole(order[(i + 1) % order.length] ?? "all");
      },
    },
    {
      label: "Search",
      grow: 1.4,
      value: (
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Name, firm or email"
          style={searchInput}
          aria-label="Search people"
        />
      ),
    },
  ];

  return (
    <Page>
      <CriteriaBar cells={cells} />
      <ChipRow chips={chips} activeId={role} onPick={setRole} />

      <div style={{ marginTop: 16 }}>
        <ListDetail
          detailEmpty={
            <>
              Pick a person to see their card — firm, role and how to reach
              them. Editing happens on the firm's Board dossier, not here.
            </>
          }
          detail={selected ? <ContactCard c={selected} /> : null}
          list={
            <div>
              <Sheet>
                {groups.map(g => (
                  <div key={g.role} style={{ marginBottom: 2 }}>
                    <GroupHeader title={g.title} columns={["Firm", "Last touch"]} />
                    {g.rows.map(c => (
                      <ResultRow
                        key={c.id}
                        anchor={c.name}
                        sub={
                          <>
                            {c.title ? `${c.title} · ` : ""}
                            {c.role ? (ROLE_LABEL[c.role] ?? c.role) : "no role recorded"}
                            {" · "}
                            {c.email
                              ? c.email
                              : <span style={{ color: T.amber }}>no email — unreachable</span>}
                          </>
                        }
                        identity={c.unsubscribed_at ? <span style={blockPill}>Unsubscribed</span> : undefined}
                        selected={selectedId === c.id}
                        onClick={() => setSelectedId(c.id)}
                        values={[
                          { text: c.firm },
                          /* Per-PERSON last touch (crm_activity.contact_id —
                             the contacts endpoint selects it now). "never" is
                             the honest state for a person no touch was ever
                             logged against, even at a firm touched yesterday
                             through a colleague. */
                          { text: touchLabel(c.last_touch_at) ?? "never" },
                        ]}
                      />
                    ))}
                  </div>
                ))}
              </Sheet>

              {filtered.length === 0 && (
                <div style={noRows}>
                  {contacts.length === 0
                    ? "The address book is empty. People arrive with the outreach seed, a CSV import, or by adding them on a firm's Board dossier."
                    : `Nothing matches. ${contacts.length} people in the book — widen the search or clear the role chip.`}
                </div>
              )}

              <RankingNote
                ordering="Grouped by role in the book's own order, then firms A–Z with each firm's primary contact first — the order the address book returns. Nothing is re-ranked."
                caveats={[
                  "Last touch is PER PERSON (touches logged against this contact specifically) — a firm touched yesterday through a colleague still shows this person as never. The firm-level history lives on the Clients board.",
                  "A contact with no email cannot be assigned a deal task: the assignment notifies by email, and there is no address to notify.",
                ]}
              />
            </div>
          }
        />
      </div>
    </Page>
  );
}

/* ── the read-only card ────────────────────────────────────────────────── */

function ContactCard({ c }: { c: AddressBookContact }) {
  return (
    <div>
      <DetailCard title={c.name}>
        <Field label="Title" value={c.title} />
        <Field label="Firm" value={c.firm} />
        <Field label="Role" value={c.role ? (ROLE_LABEL[c.role] ?? c.role) : null} />
        <div style={fieldRow}>
          <span style={fieldLabel}>Email</span>
          {c.email ? (
            <a href={`mailto:${c.email}`} style={{ color: T.blue, fontWeight: 600, fontSize: 13 }}>
              {c.email}
            </a>
          ) : (
            <span style={{ fontSize: 13, color: T.amber }}>
              No email — unreachable, and cannot be assigned a deal task.
            </span>
          )}
        </div>
        {c.is_primary && <Field label="Standing" value="Primary contact at the firm" />}
        {c.unsubscribed_at && (
          <div style={{ marginTop: 10 }}>
            <InfoBanner tone="caution">
              <b>Unsubscribed.</b> This person opted out — the outreach machine
              excludes them at queue-build and again at send. Permanent; an
              import never clears it.
            </InfoBanner>
          </div>
        )}
      </DetailCard>

      <div style={{ marginTop: 12 }}>
        <InfoBanner>
          Editing people happens on the firm's Board dossier — one edit surface
          per object. This directory only reads.
        </InfoBanner>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div style={fieldRow}>
      <span style={fieldLabel}>{label}</span>
      {value
        ? <span style={{ fontSize: 13, color: T.ink }}>{value}</span>
        : <span style={{ fontSize: 13, color: T.muted2 }}>Not available</span>}
    </div>
  );
}

/* ── styles ────────────────────────────────────────────────────────────── */

const searchInput: CSSProperties = {
  font: "inherit", fontSize: 14, fontWeight: 700, color: T.ink,
  background: "transparent", border: "none", outline: "none",
  padding: 0, width: "100%", minWidth: 0,
};

const fieldRow: CSSProperties = {
  display: "flex", alignItems: "baseline", gap: 10, padding: "6px 0",
  borderBottom: `1px solid ${T.border}`,
};
const fieldLabel: CSSProperties = { fontSize: 12, color: T.muted, width: 76, flex: "none" };

/* The amber identity pill — same treatment as ClientsList's "Do not pitch". */
const blockPill: CSSProperties = {
  fontSize: 9.5, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase",
  background: T.amberBg, color: T.amber, padding: "2px 6px", whiteSpace: "nowrap",
};

const noRows: CSSProperties = {
  padding: "26px 16px", border: `1px solid ${T.border}`, borderRadius: 8, background: T.white,
  fontSize: 12.5, color: T.muted, lineHeight: 1.6,
};
