/* V3App — the workspace at /.
   Single layout: Sidebar + main column (DocTabs strip + Workspace split).
   Port of dist/source/Home v3.html App component. */
import { useState } from "react";
import { V3Sidebar, V3DocTabs } from "../components/v3/Shell";
import { V3Workspace } from "../components/v3/Workspace";

interface Tab {
  id: string;
  tag: string;
  label: string;
  modified?: boolean;
  closable?: boolean;
}

export default function V3App() {
  const [activeDeal, setActiveDeal] = useState("sample");
  const [tabs, setTabs] = useState<Tab[]>([
    { id: "screen", tag: "DOC", label: "Teaser screen", modified: true },
    { id: "recast", tag: "DOC", label: "Recast" },
    { id: "buyers", tag: "DOC", label: "Buyer list" },
  ]);
  const [activeTab, setActiveTab] = useState("screen");

  const onSlash = (cmd: string) => {
    if (cmd === "/pricing" || cmd === "/how" || cmd === "/about") {
      const id = cmd.slice(1);
      if (!tabs.find((t) => t.id === id)) {
        setTabs([...tabs, { id, tag: "CMD", label: cmd, closable: true }]);
      }
      setActiveTab(id);
    }
  };

  const onClose = (id: string) => {
    setTabs((p) => p.filter((t) => t.id !== id));
    if (activeTab === id) setActiveTab("screen");
  };

  return (
    <div style={{ display: "flex", height: "100vh" }} data-screen-label="01 Workspace">
      <V3Sidebar
        activeDeal={activeDeal}
        onPick={setActiveDeal}
        onSlash={onSlash}
        onCommand={() => {}}
      />
      <main style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <V3DocTabs tabs={tabs} active={activeTab} onPick={setActiveTab} onClose={onClose} />
        <V3Workspace onSlash={onSlash} />
      </main>
    </div>
  );
}
