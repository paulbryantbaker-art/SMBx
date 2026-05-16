import { useEffect, useMemo, useState, type CSSProperties } from "react";
import type { User } from "../../../hooks/useAuth";
import { ART_HOUSE_TEXTURES, DESKTOP_TEXTURES, STUDIO_TEXTURES } from "../../../lib/randomTextures";
import { isSuperAdminUser } from "../../../lib/superAdmin";
import type { OpenTab, StudioFormatId, Tab } from "../types";

interface MarketingStudioProps {
  tab: Tab;
  openTab: OpenTab;
  user: User | null;
  onTalkToYulia?: (prompt: string) => void;
}

interface StudioOutput {
  id: StudioFormatId;
  title: string;
  size: string;
  dimensions: string;
  width: number;
  height: number;
  pages: number;
  detail: string;
  prompt: string;
}

interface StudioFormatCard {
  title: string;
  sub: string;
  count: number;
  format: StudioFormatId;
}

interface SavedStudioDraft {
  id: string;
  title: string;
  format: StudioFormatId;
  campaign: string;
  updatedAt: string;
  status?: "draft" | "completed";
  story?: string;
  layout?: StudioLayoutId;
  texture?: StudioTextureId;
  cta?: string;
}

type StudioLayoutId = "liquid-list" | "proof-cards" | "white-brief";
type StudioTextureId = "auto" | "rose" | "blue" | "green" | "navy";

interface StudioStarter {
  title: string;
  detail: string;
  format: StudioFormatId;
  prompt: string;
}

interface StudioCampaign {
  id: string;
  title: string;
  sub: string;
  count: number;
  createdAt: string;
  deal?: string;
}

const DRAFT_STORAGE_KEY = "smbx_marketing_studio_drafts";
const CAMPAIGN_STORAGE_KEY = "smbx_marketing_studio_campaigns";
const WORKING_DRAFTS_KEY = "__smbxMarketingStudioWorkingDrafts";

const OUTPUTS: StudioOutput[] = [
  {
    id: "one-pager",
    title: "LinkedIn one-pager",
    size: "1080 x 1350",
    dimensions: "1080 x 1350",
    width: 1080,
    height: 1350,
    pages: 1,
    detail: "One thesis, one visual argument, LinkedIn portrait-ready.",
    prompt: "Draft a LinkedIn one-pager about smbx.ai as the execution layer for institutional M&A. Use the current product positioning and keep it crisp.",
  },
  {
    id: "carousel",
    title: "Carousel PDF",
    size: "1080 x 1350",
    dimensions: "1080 x 1350",
    width: 1080,
    height: 1350,
    pages: 7,
    detail: "Five to seven editorial cards with a tight narrative arc.",
    prompt: "Create a seven-page LinkedIn carousel outline for smbx.ai. Use the current design language and make each page screenshot-ready.",
  },
  {
    id: "article",
    title: "Blog post",
    size: "Article",
    dimensions: "1200 wide",
    width: 1200,
    height: 828,
    pages: 3,
    detail: "A publishable argument that can become a post, email, or carousel.",
    prompt: "Draft a blog post about why M&A software has to become an execution layer, not a document generator.",
  },
];

const STARTERS: StudioStarter[] = [
  {
    title: "Positioning card",
    detail: "One claim, one proof stack, one CTA. Best for a LinkedIn single image.",
    format: "one-pager",
    prompt: "Turn the campaign into a single positioning card with a sharp thesis, proof, and CTA.",
  },
  {
    title: "Carousel builder",
    detail: "A 5-7 page narrative arc for a PDF carousel.",
    format: "carousel",
    prompt: "Turn the campaign into a tight LinkedIn carousel with a clear page-by-page narrative.",
  },
  {
    title: "Founder note",
    detail: "A founder-led point of view that can become a post or letter.",
    format: "article",
    prompt: "Draft a founder note from the campaign positioning with a human, direct voice.",
  },
  {
    title: "Pricing explainer",
    detail: "A simple explanation of plan logic, use cases, and who each plan is for.",
    format: "one-pager",
    prompt: "Create a pricing explainer card for the selected campaign.",
  },
  {
    title: "Product launch post",
    detail: "A launch-ready post with the product moment, claim, and proof.",
    format: "article",
    prompt: "Draft a product launch post for the selected campaign.",
  },
  {
    title: "Screenshot canvas",
    detail: "A visual frame for turning an app screenshot into collateral.",
    format: "one-pager",
    prompt: "Create a screenshot-led collateral canvas from the selected campaign.",
  },
];

const DEFAULT_CAMPAIGNS: StudioCampaign[] = [
  { id: "campaign-launch", title: "Launch narrative", sub: "Core positioning, founder voice, investor-grade proof points.", count: 6, createdAt: "default" },
  { id: "campaign-yulia-agency", title: "Yulia agency", sub: "Agentic workflow posts, analysis canvases, document lifecycle.", count: 4, createdAt: "default" },
  { id: "campaign-market-intel", title: "Market intelligence", sub: "Why SMBx becomes the go-to M&A strategy source.", count: 3, createdAt: "default" },
];

const DEAL_OPTIONS = [
  "No deal link",
  "Big Fake Deal",
  "Pest Control · FL",
  "HVAC platform · CO",
  "Electrical Contractor · TX",
];

const COLLATERAL_FOLDERS: StudioFormatCard[] = [
  { title: "One-pagers", sub: "Single-image LinkedIn portrait posts and founder notes.", count: 5, format: "one-pager" },
  { title: "Carousels", sub: "Multi-page LinkedIn PDF posts grouped by campaign.", count: 2, format: "carousel" },
  { title: "Articles", sub: "Longer arguments that can become posts, email, or carousel source.", count: 3, format: "article" },
];

const LAYOUTS: { id: StudioLayoutId; label: string; detail: string }[] = [
  { id: "liquid-list", label: "Liquid list", detail: "Textured card with glass action rows." },
  { id: "proof-cards", label: "Proof cards", detail: "Three strong proof blocks and a CTA rail." },
  { id: "white-brief", label: "White brief", detail: "A cleaner memo-style page over art." },
];

const TEXTURES: { id: StudioTextureId; label: string }[] = [
  { id: "auto", label: "Auto mix" },
  { id: "rose", label: "Rose leather" },
  { id: "blue", label: "Blue glass" },
  { id: "green", label: "Sage linen" },
  { id: "navy", label: "Navy desk" },
];

export function V6MarketingStudioView({ tab, openTab, user, onTalkToYulia }: MarketingStudioProps) {
  const [campaigns, setCampaigns] = useState<StudioCampaign[]>(() => readStudioCampaigns());
  const [savedDrafts, setSavedDrafts] = useState<SavedStudioDraft[]>(() => readSavedStudioDrafts());
  const [activeCampaignId, setActiveCampaignId] = useState(campaigns[0]?.id ?? DEFAULT_CAMPAIGNS[0].id);
  const [newCampaignTitle, setNewCampaignTitle] = useState("");
  const [newCampaignSub, setNewCampaignSub] = useState("");
  const [newCampaignDeal, setNewCampaignDeal] = useState(DEAL_OPTIONS[0]);

  if (!isSuperAdminUser(user)) {
    return (
      <main style={S.lockedWrap}>
        <div className="m-card" style={S.lockedCard}>
          <div className="mono" style={S.eyebrow}>PRIVATE</div>
          <h1 style={S.lockedTitle}>Marketing Studio is restricted.</h1>
          <p style={S.lockedCopy}>
            This workspace is visible only to the smbx.ai superadmin account while the publishing system is being designed.
          </p>
        </div>
      </main>
    );
  }

  const askYulia = (prompt: string) => onTalkToYulia?.(prompt);
  const activeCampaign = campaigns.find(campaign => campaign.id === activeCampaignId) ?? campaigns[0] ?? DEFAULT_CAMPAIGNS[0];
  const activeOutput = tab.studioView === "canvas"
    ? OUTPUTS.find(output => output.id === tab.studioFormat) ?? OUTPUTS[0]
    : null;

  const refreshDrafts = () => setSavedDrafts(readSavedStudioDrafts());

  const createCampaign = () => {
    const title = newCampaignTitle.trim();
    if (!title) return;
    const nextCampaign: StudioCampaign = {
      id: `campaign-${slugify(title)}-${Date.now().toString(36)}`,
      title,
      sub: newCampaignSub.trim() || "Custom campaign.",
      count: 0,
      createdAt: new Date().toISOString(),
      deal: newCampaignDeal === DEAL_OPTIONS[0] ? undefined : newCampaignDeal,
    };
    const next = [nextCampaign, ...campaigns];
    setCampaigns(next);
    writeStudioCampaigns(next);
    setActiveCampaignId(nextCampaign.id);
    setNewCampaignTitle("");
    setNewCampaignSub("");
    setNewCampaignDeal(DEAL_OPTIONS[0]);
    openStudioCollection(nextCampaign.title, nextCampaign.sub);
  };

  const deleteCampaign = (campaignId: string) => {
    const campaign = campaigns.find(item => item.id === campaignId);
    if (!campaign) return;
    const confirmed = window.confirm(`Delete the "${campaign.title}" campaign folder?\n\nSaved collateral will stay in Local assets, but it will no longer have a campaign folder.`);
    if (!confirmed) return;
    const next = campaigns.filter(item => item.id !== campaignId);
    setCampaigns(next);
    writeStudioCampaigns(next);
    if (activeCampaignId === campaignId) {
      setActiveCampaignId(next[0]?.id ?? DEFAULT_CAMPAIGNS[0].id);
    }
  };

  const deleteDraft = (draftId: string) => {
    const draft = savedDrafts.find(item => item.id === draftId);
    if (!draft) return;
    const confirmed = window.confirm(`Delete "${draft.title}"?\n\nThis removes the local Studio asset from this browser.`);
    if (!confirmed) return;
    deleteStudioDraft(draftId);
    refreshDrafts();
  };

  const openSavedDraft = (draft: SavedStudioDraft) => {
    const output = OUTPUTS.find(item => item.id === draft.format) ?? OUTPUTS[0];
    openTab({
      id: draft.id,
      kind: "marketing-studio",
      title: draft.title,
      studioView: "canvas",
      studioFormat: output.id,
      studioDraftId: draft.id,
      studioCampaign: draft.campaign,
      studioDirty: true,
    });
  };

  const openStudioOutput = (output: StudioOutput, tool?: string, campaign = activeCampaign.title) => {
    const draftId = `studio-${output.id}-${Date.now().toString(36)}`;
    openTab({
      id: draftId,
      kind: "marketing-studio",
      title: `Studio · ${output.title}`,
      studioView: "canvas",
      studioFormat: output.id,
      studioDraftId: draftId,
      studioCampaign: campaign,
      studioDirty: true,
    });
    askYulia(tool
      ? `Use the ${tool} starter in the Marketing Studio for the "${campaign}" campaign. I will give you the story; turn it into screenshot-ready sections in the open ${output.title} canvas.`
      : `Open a ${output.title} draft in Marketing Studio for the "${campaign}" campaign. I will give you the story; turn it into screenshot-ready sections using the app design language.`);
  };

  const openStudioCollection = (title: string, sub: string) => {
    openTab({
      id: `studio-campaign-${slugify(title)}`,
      kind: "marketing-studio",
      title: `Campaign · ${title}`,
      studioView: "collection",
      studioCampaign: title,
      studioCollectionSub: sub,
    });
    askYulia(`Open the "${title}" marketing campaign workspace. Context: ${sub}. Help me decide whether this should become a one-pager, carousel, or article, then ask for the story inputs.`);
  };

  if (activeOutput) {
    return (
      <StudioCanvas
        output={activeOutput}
        campaign={tab.studioCampaign ?? "Launch narrative"}
        draftId={tab.studioDraftId ?? tab.id}
        draftTitle={tab.title}
        onAskYulia={askYulia}
      />
    );
  }

  if (tab.studioView === "collection") {
    return (
      <StudioCollection
        title={tab.studioCampaign ?? "Campaign"}
        sub={tab.studioCollectionSub ?? "Create collateral inside this campaign."}
        drafts={savedDrafts.filter(draft => draft.campaign === tab.studioCampaign)}
        onStart={(output) => openStudioOutput(output, undefined, tab.studioCampaign ?? "Campaign")}
        onOpenDraft={openSavedDraft}
        onDeleteDraft={deleteDraft}
        onAskYulia={askYulia}
      />
    );
  }

  return (
    <main className="m-fade-up" style={S.page}>
      <section style={S.hero}>
        <div style={S.heroWash} />
        <div style={S.heroInner}>
          <div className="mono" style={S.heroEyebrow}>SUPERADMIN STUDIO</div>
          <h1 style={S.heroTitle}>Make the marketing look like the product.</h1>
          <p style={S.heroCopy}>
            Build LinkedIn one-pagers, carousel PDFs, blog posts, and screenshot-ready launch material from the same visual system as the app.
          </p>
          <div style={S.heroActions}>
            <button
              type="button"
              className="m-btn"
              style={S.heroPrimary}
              onClick={() => askYulia(OUTPUTS[0].prompt)}
            >
              Draft with Yulia
            </button>
            <button
              type="button"
              className="m-btn"
              style={S.heroGlass}
              onClick={() => askYulia("Help me choose the strongest marketing format for today: one-pager, carousel, or blog post.")}
            >
              Pick the format
            </button>
          </div>
        </div>
      </section>

      <section style={S.contentGrid}>
        <div className="m-card" style={S.panel}>
          <div className="mono" style={S.eyebrow}>OUTPUTS</div>
          <h2 style={S.sectionTitle}>Start with the channel.</h2>
          <label style={S.activeCampaignField}>
            <span className="mono" style={S.fieldLabel}>CAMPAIGN REQUIRED</span>
            <select
              value={activeCampaign.id}
              onChange={(event) => setActiveCampaignId(event.target.value)}
              style={S.selectInput}
            >
              {campaigns.map(campaign => (
                <option key={campaign.id} value={campaign.id}>{campaign.title}</option>
              ))}
            </select>
          </label>
          <div style={S.outputStack}>
            {OUTPUTS.map((output) => (
              <button
              key={output.title}
              type="button"
                className="m-state"
                style={S.outputRow}
                onClick={() => openStudioOutput(output, undefined, activeCampaign.title)}
              >
                <span style={{ minWidth: 0 }}>
                  <strong style={S.rowTitle}>{output.title}</strong>
                  <span style={S.rowDetail}>{output.detail}</span>
                </span>
                <span className="mono" style={S.sizePill}>{output.size}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="m-card" style={S.previewShell}>
          <div style={S.previewCard}>
            <div className="mono" style={S.previewEyebrow}>POSITIONING CARD</div>
            <h2 style={S.previewTitle}>Better decisions. Less friction. Faster execution.</h2>
            <p style={S.previewCopy}>
              Connect sourcing, diligence, execution, and value creation in one workflow.
            </p>
          </div>
          <div style={S.previewFoot}>
            <span>Screenshot-ready composition</span>
            <span>1080 x 1350</span>
          </div>
        </div>
      </section>

      <section style={S.managementGrid}>
        <div className="m-card" style={S.managementPanel}>
          <div className="mono" style={S.eyebrow}>CAMPAIGNS</div>
          <h2 style={S.sectionTitle}>Campaign folders</h2>
          <div style={S.campaignCreate}>
            <input
              value={newCampaignTitle}
              onChange={(event) => setNewCampaignTitle(event.target.value)}
              placeholder="Name a campaign"
              style={S.inlineInput}
            />
            <input
              value={newCampaignSub}
              onChange={(event) => setNewCampaignSub(event.target.value)}
              placeholder="What is this campaign for?"
              style={S.inlineInput}
            />
            <div style={S.createFooter}>
              <select
                value={newCampaignDeal}
                onChange={(event) => setNewCampaignDeal(event.target.value)}
                style={{ ...S.selectInput, minHeight: 40 }}
              >
                {DEAL_OPTIONS.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <button
                type="button"
                className="m-btn filled"
                style={S.createButton}
                onClick={createCampaign}
                disabled={!newCampaignTitle.trim()}
              >
                Create
              </button>
            </div>
          </div>
          <div style={S.folderStack}>
            {campaigns.map((campaign) => (
              <div
                key={campaign.title}
                style={S.folderRow}
              >
                <button
                  type="button"
                  className="m-state"
                  style={S.rowOpenArea}
                  onClick={() => openStudioCollection(campaign.title, campaign.sub)}
                >
                  <span>
                    <strong style={S.rowTitle}>{campaign.title}</strong>
                    <span style={S.rowDetail}>{campaign.deal ? `${campaign.deal} · ${campaign.sub}` : campaign.sub}</span>
                  </span>
                </button>
                <span style={S.rowActions}>
                  <span className="mono" style={S.sizePill}>{campaign.count}</span>
                  <button
                    type="button"
                    className="m-state"
                    style={S.deleteButton}
                    onClick={() => deleteCampaign(campaign.id)}
                  >
                    Delete
                  </button>
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="m-card" style={S.managementPanel}>
          <div className="mono" style={S.eyebrow}>FORMATS</div>
          <h2 style={S.sectionTitle}>Collateral types</h2>
          <div style={S.folderStack}>
            {COLLATERAL_FOLDERS.map((folder) => (
              <button
                key={folder.title}
                type="button"
                className="m-state"
                style={S.folderRow}
                onClick={() => openStudioOutput(OUTPUTS.find(output => output.id === folder.format) ?? OUTPUTS[0], undefined, activeCampaign.title)}
              >
                <span>
                  <strong style={S.rowTitle}>{folder.title}</strong>
                  <span style={S.rowDetail}>{folder.sub}</span>
                </span>
                <span className="mono" style={S.sizePill}>{folder.count}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="m-card" style={S.managementPanel}>
          <div className="mono" style={S.eyebrow}>DRAFTS</div>
          <h2 style={S.sectionTitle}>Local assets</h2>
          <div style={S.folderStack}>
            {(savedDrafts.length ? savedDrafts.slice(0, 3) : [
              { id: "empty", title: "No saved local drafts yet", format: "one-pager" as const, campaign: "Close a Studio draft tab and choose save.", updatedAt: "" },
            ]).map((draft) => (
              <div
                key={draft.id}
                style={S.folderRow}
              >
                <button
                  type="button"
                  className="m-state"
                  style={S.rowOpenArea}
                  onClick={() => draft.id !== "empty" && openSavedDraft(draft)}
                >
                  <span>
                    <strong style={S.rowTitle}>{draft.title}</strong>
                    <span style={S.rowDetail}>{draft.campaign || "Marketing Studio"}</span>
                  </span>
                </button>
                <span style={S.rowActions}>
                  <span className="mono" style={S.sizePill}>{draft.format}</span>
                  {draft.id !== "empty" && (
                    <button
                      type="button"
                      className="m-state"
                      style={S.deleteButton}
                      onClick={() => deleteDraft(draft.id)}
                    >
                      Delete
                    </button>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="m-card" style={S.toolPanel}>
        <div>
          <div className="mono" style={S.eyebrow}>STARTERS</div>
          <h2 style={S.sectionTitle}>Start from a brief.</h2>
          <p style={S.sectionCopy}>
            These are not folders. They pre-load Yulia with a focused collateral shape inside the active campaign.
          </p>
        </div>
        <div style={S.toolGrid}>
          {STARTERS.map((starter) => {
            const output = OUTPUTS.find(item => item.id === starter.format) ?? OUTPUTS[0];
            return (
            <button
              key={starter.title}
              type="button"
              className="m-state"
              style={S.toolCard}
              onClick={() => {
                openStudioOutput(output, starter.title, activeCampaign.title);
              }}
            >
              <span style={S.toolTitle}>{starter.title}</span>
              <span style={S.toolDetail}>{starter.detail}</span>
              <span className="mono" style={S.toolMeta}>{output.size}</span>
            </button>
            );
          })}
        </div>
      </section>
    </main>
  );
}

function StudioCanvas({ output, campaign, draftId, draftTitle, onAskYulia }: {
  output: StudioOutput;
  campaign: string;
  draftId: string;
  draftTitle: string;
  onAskYulia: (prompt: string) => void;
}) {
  const savedDraft = useMemo(() => readStudioDraft(draftId), [draftId]);
  const [story, setStory] = useState(savedDraft?.story ?? "");
  const [layout, setLayout] = useState<StudioLayoutId>(savedDraft?.layout ?? "liquid-list");
  const [texture, setTexture] = useState<StudioTextureId>(savedDraft?.texture ?? "auto");
  const [cta, setCta] = useState(savedDraft?.cta ?? "Start with Yulia");
  const pages = useMemo(() => studioPages(output), [output.id]);
  const isArticle = output.id === "article";
  const textureLabel = TEXTURES.find(item => item.id === texture)?.label ?? "Auto";

  useEffect(() => {
    writeStudioDraft({
      id: draftId,
      title: draftTitle,
      format: output.id,
      campaign,
      updatedAt: new Date().toISOString(),
      story,
      layout,
      texture,
      cta,
    });
  }, [campaign, cta, draftId, draftTitle, layout, output.id, story, texture]);

  return (
    <main style={S.canvasPage}>
      <header style={S.canvasHeader}>
        <div>
          <div className="mono" style={S.canvasEyebrow}>SCREENSHOT STUDIO</div>
          <h1 style={S.canvasTitle}>{output.title}</h1>
          <p style={S.canvasSub}>
            A screenshot-ready mini-site inside the canvas. Yulia can rewrite the story; you can steer the layout, texture, and CTA.
          </p>
        </div>
        <div style={S.canvasActions}>
          <span className="mono" style={S.canvasSize}>{campaign}</span>
          <span className="mono" style={S.canvasSize}>{output.dimensions}</span>
          <button
            type="button"
            className="m-btn filled"
            style={S.askButton}
            onClick={() => onAskYulia(`${output.prompt} Use this brief: "${story || "I will provide the story next."}" Layout direction: ${layout}. Texture direction: ${textureLabel}. CTA: "${cta}". Fill the open Marketing Studio canvas with section-by-section copy. Keep each section screenshot-ready and do not make the page scroll internally.`)}
          >
            Brief Yulia
          </button>
        </div>
      </header>

      <div className="studio-workspace" style={S.studioWorkspace}>
        <aside className="studio-rail" style={S.studioRail}>
          <section style={S.studioControls}>
            <div>
              <div className="mono" style={S.eyebrow}>CONTENT BRIEF</div>
              <strong style={S.briefTitle}>Give Yulia the story; steer the artifact here.</strong>
              <p style={S.briefCopy}>
                Best inputs: audience, claim, proof points, CTA, and whether the tone should feel like a founder note, institutional memo, product launch, or market insight.
              </p>
            </div>
            <label style={S.briefField}>
              <span className="mono" style={S.fieldLabel}>STORY / CONTEXT</span>
              <textarea
                value={story}
                onChange={(event) => setStory(event.target.value)}
                placeholder="Paste the argument, post idea, rough notes, or customer story here..."
                style={S.storyInput}
              />
            </label>
            <div style={S.controlGrid}>
              <div>
                <div className="mono" style={S.fieldLabel}>LAYOUT</div>
                <div style={S.optionGrid}>
                  {LAYOUTS.map(item => (
                    <button
                      key={item.id}
                      type="button"
                      className="m-state"
                      style={{ ...S.optionButton, ...(layout === item.id ? S.optionButtonActive : null) }}
                      onClick={() => setLayout(item.id)}
                    >
                      <strong>{item.label}</strong>
                      <span>{item.detail}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="mono" style={S.fieldLabel}>TEXTURE</div>
                <div style={S.textureRow}>
                  {TEXTURES.map(item => (
                    <button
                      key={item.id}
                      type="button"
                      className="m-state"
                      style={{
                        ...S.textureButton,
                        ...textureChipStyle(item.id, texture === item.id),
                      }}
                      onClick={() => setTexture(item.id)}
                    >
                      <span aria-hidden="true" style={textureSwatchStyle(item.id)} />
                      {item.label}
                    </button>
                  ))}
                </div>
                <label style={{ ...S.briefField, marginTop: 12 }}>
                  <span className="mono" style={S.fieldLabel}>CTA</span>
                  <input
                    value={cta}
                    onChange={(event) => setCta(event.target.value)}
                    placeholder="Start with Yulia"
                    style={S.ctaInput}
                  />
                </label>
              </div>
            </div>
            <button
              type="button"
              className="m-btn tonal"
              style={S.structureButton}
              onClick={() => onAskYulia(`I want to make a ${output.title}. Ask me for the missing story inputs, then write the section copy for this canvas page by page. Layout: ${layout}. Texture: ${textureLabel}. CTA: ${cta}.`)}
            >
              Ask for structure
            </button>
          </section>
        </aside>

        <div style={S.artboardStack}>
          {pages.map((page, index) => (
            <article
              key={`${output.id}-${index}`}
              style={{
                ...S.artboard,
                ...(isArticle ? S.articleBoard : null),
                aspectRatio: `${output.width} / ${output.height}`,
                backgroundImage: studioTextureBackground(texture, page.background),
              }}
            >
              <div style={S.artboardShade} />
              <div style={S.artboardContent}>
                <div style={S.artboardTop}>
                  <span className="mono" style={S.artboardEyebrow}>{page.eyebrow}</span>
                  <span className="mono" style={S.pageCount}>{String(index + 1).padStart(2, "0")} / {String(pages.length).padStart(2, "0")}</span>
                </div>
                <div style={S.artboardMain}>
                  <h2 style={S.artboardTitle}>{page.title}</h2>
                  <p style={S.artboardText}>{page.text}</p>
                </div>
                {renderStudioPageBody(page.points, layout)}
                {(index === pages.length - 1 || output.id === "one-pager") && (
                  <div style={S.artboardCta}>
                    <span style={S.ctaBadge}>Y</span>
                    <span>
                      <strong>{cta}</strong>
                      <small>Yulia turns the story into the next asset.</small>
                    </span>
                    <span style={S.ctaButton}>Open</span>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}

function StudioCollection({
  title,
  sub,
  drafts,
  onStart,
  onOpenDraft,
  onDeleteDraft,
  onAskYulia,
}: {
  title: string;
  sub: string;
  drafts: SavedStudioDraft[];
  onStart: (output: StudioOutput) => void;
  onOpenDraft: (draft: SavedStudioDraft) => void;
  onDeleteDraft: (draftId: string) => void;
  onAskYulia: (prompt: string) => void;
}) {
  return (
    <main className="m-fade-up" style={S.collectionPage}>
      <section style={S.collectionHero}>
        <div style={S.collectionWash} />
        <div style={S.collectionHeroInner}>
          <div className="mono" style={S.heroEyebrow}>CAMPAIGN WORKSPACE</div>
          <h1 style={S.collectionTitle}>{title}</h1>
          <p style={S.collectionCopy}>{sub}</p>
          <button
            type="button"
            className="m-btn"
            style={S.heroPrimary}
            onClick={() => onAskYulia(`For the "${title}" campaign, help me choose the strongest marketing asset format. Ask for the audience, claim, proof, and CTA before drafting.`)}
          >
            Plan with Yulia
          </button>
        </div>
      </section>

      <section style={S.collectionGrid}>
        <div className="m-card" style={S.collectionPanel}>
          <div className="mono" style={S.eyebrow}>CREATE</div>
          <h2 style={S.sectionTitle}>Start an asset</h2>
          <div style={S.outputStack}>
            {OUTPUTS.map(output => (
              <button
                key={output.id}
                type="button"
                className="m-state"
                style={S.outputRow}
                onClick={() => onStart(output)}
              >
                <span style={{ minWidth: 0 }}>
                  <strong style={S.rowTitle}>{output.title}</strong>
                  <span style={S.rowDetail}>{output.detail}</span>
                </span>
                <span className="mono" style={S.sizePill}>{output.size}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="m-card" style={S.collectionPanel}>
          <div className="mono" style={S.eyebrow}>DRAFTS</div>
          <h2 style={S.sectionTitle}>In this campaign</h2>
          <div style={S.folderStack}>
            {(drafts.length ? drafts : [
              { id: "empty", title: "No saved assets in this campaign yet", format: "one-pager" as const, campaign: "Start an asset, then save the tab.", updatedAt: "" },
            ]).map(draft => (
              <div key={draft.id} style={S.folderRow}>
                <button
                  type="button"
                  className="m-state"
                  style={S.rowOpenArea}
                  onClick={() => draft.id !== "empty" && onOpenDraft(draft)}
                >
                  <span>
                    <strong style={S.rowTitle}>{draft.title}</strong>
                    <span style={S.rowDetail}>{draft.campaign}</span>
                  </span>
                </button>
                <span style={S.rowActions}>
                  <span className="mono" style={S.sizePill}>{draft.format}</span>
                  {draft.id !== "empty" && (
                    <button
                      type="button"
                      className="m-state"
                      style={S.deleteButton}
                      onClick={() => onDeleteDraft(draft.id)}
                    >
                      Delete
                    </button>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function renderStudioPageBody(points: string[], layout: StudioLayoutId) {
  if (layout === "proof-cards") {
    return (
      <div style={S.proofGrid}>
        {points.map((point, pointIndex) => (
          <div key={point} style={S.proofCard}>
            <span className="mono" style={S.proofNumber}>{String(pointIndex + 1).padStart(2, "0")}</span>
            <strong>{point}</strong>
          </div>
        ))}
      </div>
    );
  }

  if (layout === "white-brief") {
    return (
      <div style={S.whiteBrief}>
        {points.map((point, pointIndex) => (
          <div key={point} style={S.whiteBriefLine}>
            <span style={S.whiteBriefNumber}>{pointIndex + 1}</span>
            <strong>{point}</strong>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={S.artboardGlass}>
      {points.map((point, pointIndex) => (
        <div key={point} style={S.glassLine}>
          <span style={S.glassNumber}>{pointIndex + 1}</span>
          <strong>{point}</strong>
        </div>
      ))}
    </div>
  );
}

function studioTextureBackground(texture: StudioTextureId, fallback: string): string {
  const wash = "linear-gradient(135deg, rgba(10,17,29,0.34), rgba(10,17,29,0.08) 46%, rgba(10,17,29,0.54))";
  const map: Record<Exclude<StudioTextureId, "auto">, string> = {
    rose: `${wash}, url('${STUDIO_TEXTURES.rose}')`,
    blue: `${wash}, url('${STUDIO_TEXTURES.blue}')`,
    green: `${wash}, url('${STUDIO_TEXTURES.green}')`,
    navy: `${wash}, url('${STUDIO_TEXTURES.navy}')`,
  };
  return texture === "auto" ? fallback : map[texture];
}

function texturePreviewBackground(texture: StudioTextureId): string {
  const wash = "linear-gradient(90deg, rgba(12,18,31,0.20), rgba(12,18,31,0.03) 48%, rgba(12,18,31,0.30))";
  const map: Record<StudioTextureId, string> = {
    auto: `linear-gradient(135deg, rgba(214,163,92,0.42), rgba(106,155,204,0.26) 46%, rgba(74,140,111,0.34)), url('${DESKTOP_TEXTURES.todaySecondary}')`,
    rose: `${wash}, url('${STUDIO_TEXTURES.rose}')`,
    blue: `${wash}, url('${STUDIO_TEXTURES.blue}')`,
    green: `${wash}, url('${STUDIO_TEXTURES.green}')`,
    navy: `${wash}, url('${STUDIO_TEXTURES.navy}')`,
  };
  return map[texture];
}

function textureChipStyle(texture: StudioTextureId, active: boolean): CSSProperties {
  return {
    backgroundImage: texturePreviewBackground(texture),
    backgroundSize: "cover",
    backgroundPosition: "center",
    color: "#FFFFFF",
    borderColor: active ? "rgba(255,255,255,0.80)" : "rgba(255,255,255,0.34)",
    boxShadow: active
      ? "0 16px 36px rgba(35,55,78,0.22), inset 0 1px 0 rgba(255,255,255,0.48)"
      : "0 10px 22px rgba(35,55,78,0.10), inset 0 1px 0 rgba(255,255,255,0.24)",
    opacity: active ? 1 : 0.94,
  };
}

function textureSwatchStyle(texture: StudioTextureId): CSSProperties {
  return {
    width: 18,
    height: 18,
    borderRadius: 7,
    flexShrink: 0,
    backgroundImage: texturePreviewBackground(texture),
    backgroundSize: "cover",
    backgroundPosition: "center",
    border: "1px solid rgba(255,255,255,0.46)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.36)",
  };
}

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "draft";
}

function isStudioLayout(value: unknown): value is StudioLayoutId {
  return value === "liquid-list" || value === "proof-cards" || value === "white-brief";
}

function isStudioTexture(value: unknown): value is StudioTextureId {
  return value === "auto" || value === "rose" || value === "blue" || value === "green" || value === "navy";
}

function isStudioFormat(value: unknown): value is StudioFormatId {
  return value === "one-pager" || value === "carousel" || value === "article";
}

function studioPages(output: StudioOutput) {
  const onePager = [
    {
      eyebrow: "SMBX.AI POSITIONING",
      title: "Better decisions. Less friction. Faster execution.",
      text: "Connect sourcing, diligence, execution, and value creation in one workflow.",
      points: ["Institutional deal intelligence", "Workflow execution", "Continuous transaction context"],
      background: `linear-gradient(135deg, rgba(30,43,64,0.48), rgba(85,60,64,0.28)), url('${DESKTOP_TEXTURES.todayHeroSample}')`,
    },
  ];

  const carousel = [
    {
      eyebrow: "THE PROBLEM",
      title: "M&A work breaks when context lives in too many places.",
      text: "The chat knows one thing, the file room another, and the memo is already stale.",
      points: ["Sourcing notes drift", "Diligence findings disappear", "Execution loses the thread"],
      background: `linear-gradient(135deg, rgba(16,38,54,0.46), rgba(8,20,34,0.28)), url('${DESKTOP_TEXTURES.searchHero}')`,
    },
    {
      eyebrow: "THE SHIFT",
      title: "The interface should follow the deal, not the software menu.",
      text: "Yulia turns the conversation into surfaces only when the work requires it.",
      points: ["Chat first", "Canvas when needed", "Files when evidence matters"],
      background: `linear-gradient(135deg, rgba(21,40,54,0.58), rgba(10,20,34,0.38)), url('${ART_HOUSE_TEXTURES.studioCollection}')`,
    },
    {
      eyebrow: "THE WORKFLOW",
      title: "Sourcing, diligence, execution, and value creation stay connected.",
      text: "The same transaction context moves from first thesis to post-close work.",
      points: ["Market intelligence", "Deal analysis", "Action contracts"],
      background: `linear-gradient(135deg, rgba(53,42,77,0.38), rgba(15,28,48,0.34)), url('${DESKTOP_TEXTURES.pipelineHero}')`,
    },
    {
      eyebrow: "THE PROOF",
      title: "Every recommendation should come from Yulia's read.",
      text: "Not a static card. Not placeholder advice. A sourced deal or portfolio judgment.",
      points: ["Evidence trail", "Methodology guardrails", "Human sign-off"],
      background: `linear-gradient(135deg, rgba(42,65,58,0.44), rgba(88,70,35,0.24)), url('${DESKTOP_TEXTURES.todayMarket}')`,
    },
    {
      eyebrow: "THE OUTPUT",
      title: "Documents become living artifacts, not one-off downloads.",
      text: "Drafts, analyses, files, and executed records remain tied to the deal.",
      points: ["Draft", "Review", "Data room", "Executed"],
      background: `linear-gradient(135deg, rgba(20,31,50,0.58), rgba(31,49,62,0.32)), url('${ART_HOUSE_TEXTURES.studioCampaign}')`,
    },
    {
      eyebrow: "THE POSITION",
      title: "smbX.ai is the execution layer for institutional M&A.",
      text: "A deal desk where Yulia carries context, analysis, and action forward.",
      points: ["Fewer handoffs", "Cleaner decisions", "Faster execution"],
      background: `linear-gradient(135deg, rgba(27,52,78,0.38), rgba(52,74,67,0.30)), url('${DESKTOP_TEXTURES.filesDeals}')`,
    },
    {
      eyebrow: "THE ASK",
      title: "Bring the deal. Yulia will build the workflow around it.",
      text: "From a sentence, a file, or a source list, the system creates the right next surface.",
      points: ["Start with chat", "Open the canvas", "Move the deal"],
      background: `linear-gradient(135deg, rgba(58,42,34,0.42), rgba(22,31,48,0.36)), url('${ART_HOUSE_TEXTURES.studioCollateral}')`,
    },
  ];

  const article = [
    {
      eyebrow: "ARTICLE COVER",
      title: "Why M&A software has to become an execution layer.",
      text: "The next useful product is not a prettier dashboard. It is a system that remembers the deal and moves work forward.",
      points: ["Context", "Evidence", "Execution"],
      background: `linear-gradient(135deg, rgba(18,35,52,0.46), rgba(50,72,68,0.28)), url('${DESKTOP_TEXTURES.learnHero}')`,
    },
    {
      eyebrow: "ARGUMENT",
      title: "The memo, model, and data room should not be separate planets.",
      text: "Yulia should know what changed in the model, what evidence supports it, and which document or action it affects.",
      points: ["Live analysis", "Scenario versions", "Document lifecycle"],
      background: `linear-gradient(135deg, rgba(32,45,64,0.54), rgba(22,31,48,0.34)), url('${ART_HOUSE_TEXTURES.studioCollection}')`,
    },
    {
      eyebrow: "CLOSE",
      title: "The best M&A tool feels less like software and more like process ownership.",
      text: "The user understands the deal. Yulia handles the software, analysis, generation, and next-action coordination.",
      points: ["Advisor-like process", "User-owned decisions", "Institutional quality"],
      background: `linear-gradient(135deg, rgba(28,45,56,0.56), rgba(42,40,68,0.34)), url('${ART_HOUSE_TEXTURES.studioCollateral}')`,
    },
  ];

  if (output.id === "carousel") return carousel;
  if (output.id === "article") return article;
  return onePager;
}

function readSavedStudioDrafts(): SavedStudioDraft[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(DRAFT_STORAGE_KEY) || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((draft): draft is Record<string, unknown> => Boolean(draft && typeof draft === "object"))
      .map((draft) => {
        const format: StudioFormatId = isStudioFormat(draft.format) ? draft.format : "one-pager";
        return {
          id: typeof draft.id === "string" ? draft.id : `studio-draft-${Date.now().toString(36)}`,
          title: typeof draft.title === "string" ? draft.title : "Untitled Studio draft",
          format,
          campaign: typeof draft.campaign === "string" ? draft.campaign : "General",
          updatedAt: typeof draft.updatedAt === "string" ? draft.updatedAt : "",
          status: (draft.status === "completed" ? "completed" : "draft") as "draft" | "completed",
          story: typeof draft.story === "string" ? draft.story : undefined,
          layout: isStudioLayout(draft.layout) ? draft.layout : undefined,
          texture: isStudioTexture(draft.texture) ? draft.texture : undefined,
          cta: typeof draft.cta === "string" ? draft.cta : undefined,
        };
      })
      .slice(0, 24);
  } catch {
    return [];
  }
}

function readStudioDraft(id: string): SavedStudioDraft | undefined {
  const working = readWorkingStudioDrafts()[id];
  if (working) return working;
  return readSavedStudioDrafts().find(draft => draft.id === id);
}

function writeStudioDraft(draft: SavedStudioDraft) {
  try {
    const store = readWorkingStudioDrafts();
    store[draft.id] = draft;
    (window as unknown as Record<string, Record<string, SavedStudioDraft>>)[WORKING_DRAFTS_KEY] = store;
  } catch {
    // Session draft caching is best effort; the canvas still remains editable.
  }
}

function deleteStudioDraft(id: string) {
  try {
    const drafts = readSavedStudioDrafts();
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(drafts.filter(draft => draft.id !== id)));
    const working = readWorkingStudioDrafts();
    delete working[id];
    (window as unknown as Record<string, Record<string, SavedStudioDraft>>)[WORKING_DRAFTS_KEY] = working;
  } catch {
    // Best-effort local cleanup.
  }
}

function readWorkingStudioDrafts(): Record<string, SavedStudioDraft> {
  const win = window as unknown as Record<string, Record<string, SavedStudioDraft> | undefined>;
  const store = win[WORKING_DRAFTS_KEY];
  if (store && typeof store === "object") return store;
  win[WORKING_DRAFTS_KEY] = {};
  return win[WORKING_DRAFTS_KEY] ?? {};
}

function readStudioCampaigns(): StudioCampaign[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(CAMPAIGN_STORAGE_KEY) || "[]");
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_CAMPAIGNS;
    const campaigns = parsed
      .filter((campaign): campaign is Record<string, unknown> => Boolean(campaign && typeof campaign === "object"))
      .map((campaign) => ({
        id: typeof campaign.id === "string" ? campaign.id : `campaign-${Date.now().toString(36)}`,
        title: typeof campaign.title === "string" ? campaign.title : "Untitled campaign",
        sub: typeof campaign.sub === "string" ? campaign.sub : "Campaign workspace.",
        count: typeof campaign.count === "number" ? campaign.count : 0,
        createdAt: typeof campaign.createdAt === "string" ? campaign.createdAt : new Date().toISOString(),
        deal: typeof campaign.deal === "string" ? campaign.deal : undefined,
      }));
    return campaigns.length ? campaigns : DEFAULT_CAMPAIGNS;
  } catch {
    return DEFAULT_CAMPAIGNS;
  }
}

function writeStudioCampaigns(campaigns: StudioCampaign[]) {
  try {
    localStorage.setItem(CAMPAIGN_STORAGE_KEY, JSON.stringify(campaigns));
  } catch {
    // Local campaign storage is best effort until Studio has a backend table.
  }
}

const S: Record<string, CSSProperties> = {
  page: {
    maxWidth: 1380,
    margin: "0 auto",
    paddingBottom: 72,
  },
  collectionPage: {
    maxWidth: 1380,
    margin: "0 auto",
    paddingBottom: 72,
  },
  collectionHero: {
    position: "relative",
    minHeight: 360,
    overflow: "hidden",
    borderRadius: 30,
    border: "1px solid rgba(255,255,255,0.54)",
    backgroundImage: `url('${DESKTOP_TEXTURES.searchHero}')`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    boxShadow: "0 34px 88px rgba(35,55,78,0.22), 0 12px 26px rgba(35,55,78,0.12)",
    color: "rgba(255,255,255,0.98)",
  },
  collectionWash: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(115deg, rgba(12,22,38,0.60) 0%, rgba(37,76,88,0.24) 50%, rgba(11,18,31,0.56) 100%)",
  },
  collectionHeroInner: {
    position: "relative",
    zIndex: 1,
    maxWidth: 780,
    padding: "50px 56px",
  },
  collectionTitle: {
    margin: "16px 0 14px",
    fontFamily: "var(--font-display)",
    fontSize: "clamp(54px, 5.8vw, 84px)",
    lineHeight: 0.92,
    letterSpacing: "-0.055em",
    color: "rgba(255,255,255,0.98)",
    textWrap: "balance",
  },
  collectionCopy: {
    margin: "0 0 28px",
    maxWidth: 680,
    fontSize: 18,
    lineHeight: 1.45,
    color: "rgba(255,255,255,0.86)",
  },
  collectionGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 22,
    marginTop: 26,
  },
  collectionPanel: {
    padding: 28,
    minHeight: 330,
  },
  lockedWrap: {
    minHeight: "58vh",
    display: "grid",
    placeItems: "center",
  },
  lockedCard: {
    maxWidth: 520,
    padding: 30,
  },
  lockedTitle: {
    margin: "8px 0 10px",
    fontFamily: "var(--font-display)",
    fontSize: 34,
    lineHeight: 1,
    letterSpacing: "-0.035em",
    color: "var(--m-on-surface)",
  },
  lockedCopy: {
    margin: 0,
    color: "var(--m-on-surface-mid)",
    fontSize: 14,
    lineHeight: 1.55,
  },
  hero: {
    position: "relative",
    minHeight: 430,
    overflow: "hidden",
    borderRadius: 30,
    border: "1px solid rgba(255,255,255,0.54)",
    backgroundImage: `url('${DESKTOP_TEXTURES.todayHeroSample}')`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    boxShadow: "0 36px 96px rgba(35,55,78,0.24), 0 12px 28px rgba(35,55,78,0.14)",
    color: "rgba(255,255,255,0.98)",
  },
  heroWash: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(115deg, rgba(26,34,51,0.46) 0%, rgba(114,67,70,0.18) 48%, rgba(13,21,36,0.46) 100%)",
  },
  heroInner: {
    position: "relative",
    zIndex: 1,
    maxWidth: 760,
    padding: "54px 58px",
  },
  heroEyebrow: {
    fontSize: 10,
    letterSpacing: "0.22em",
    fontWeight: 700,
    color: "rgba(255,255,255,0.82)",
  },
  heroTitle: {
    margin: "18px 0 18px",
    fontFamily: "var(--font-display)",
    fontSize: "clamp(56px, 6vw, 88px)",
    lineHeight: 0.9,
    letterSpacing: "-0.05em",
    color: "rgba(255,255,255,0.98)",
    textWrap: "balance",
  },
  heroCopy: {
    margin: 0,
    maxWidth: 650,
    fontSize: 18,
    lineHeight: 1.45,
    color: "rgba(255,255,255,0.86)",
  },
  heroActions: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    marginTop: 34,
  },
  heroPrimary: {
    minHeight: 42,
    padding: "0 18px",
    color: "#1A2233",
    background: "rgba(255,255,255,0.86)",
    borderColor: "rgba(255,255,255,0.56)",
  },
  heroGlass: {
    minHeight: 42,
    padding: "0 18px",
    color: "rgba(255,255,255,0.96)",
    background: "rgba(255,255,255,0.14)",
    borderColor: "rgba(255,255,255,0.32)",
    backdropFilter: "blur(18px) saturate(1.25)",
  },
  contentGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 0.95fr) minmax(420px, 1.05fr)",
    gap: 22,
    marginTop: 26,
  },
  panel: {
    padding: 28,
    minHeight: 330,
  },
  eyebrow: {
    fontSize: 10,
    letterSpacing: "0.18em",
    fontWeight: 700,
    color: "var(--m-primary)",
  },
  sectionTitle: {
    margin: "8px 0 20px",
    fontFamily: "var(--font-display)",
    fontSize: 32,
    lineHeight: 1,
    letterSpacing: "-0.035em",
    color: "var(--m-on-surface)",
  },
  sectionCopy: {
    margin: "-10px 0 22px",
    maxWidth: 720,
    color: "var(--m-on-surface-mid)",
    fontSize: 14,
    lineHeight: 1.5,
  },
  activeCampaignField: {
    display: "grid",
    gap: 8,
    marginBottom: 14,
  },
  selectInput: {
    width: "100%",
    minHeight: 44,
    borderRadius: 16,
    border: "1px solid rgba(207,221,236,0.92)",
    background: "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(248,251,255,0.92))",
    color: "var(--m-on-surface)",
    padding: "0 12px",
    font: "inherit",
    fontSize: 13,
    fontWeight: 750,
    outline: "none",
  },
  outputStack: {
    display: "grid",
    gap: 10,
  },
  outputRow: {
    width: "100%",
    border: "1px solid var(--m-outline-var)",
    borderRadius: 18,
    padding: "16px 18px",
    background: "rgba(250,252,254,0.88)",
    display: "flex",
    gap: 16,
    justifyContent: "space-between",
    alignItems: "center",
    textAlign: "left",
    cursor: "pointer",
  },
  rowTitle: {
    display: "block",
    color: "var(--m-on-surface)",
    fontSize: 15,
  },
  rowDetail: {
    display: "block",
    marginTop: 3,
    color: "var(--m-on-surface-mid)",
    fontSize: 12.5,
    lineHeight: 1.45,
  },
  sizePill: {
    color: "var(--m-on-surface-var)",
    background: "var(--m-surface-2)",
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 10,
    whiteSpace: "nowrap",
  },
  previewShell: {
    padding: 0,
    overflow: "hidden",
  },
  previewCard: {
    minHeight: 318,
    padding: 30,
    backgroundImage: `linear-gradient(135deg, rgba(17,33,54,0.36), rgba(18,31,50,0.72)), url('${ART_HOUSE_TEXTURES.studio}')`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    color: "white",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
  },
  previewEyebrow: {
    fontSize: 10,
    letterSpacing: "0.2em",
    color: "rgba(255,255,255,0.72)",
    fontWeight: 700,
  },
  previewTitle: {
    margin: "12px 0",
    maxWidth: 560,
    fontFamily: "var(--font-display)",
    fontSize: 46,
    lineHeight: 0.95,
    letterSpacing: "-0.045em",
    color: "rgba(255,255,255,0.98)",
  },
  previewCopy: {
    margin: 0,
    maxWidth: 520,
    fontSize: 16,
    lineHeight: 1.45,
    color: "rgba(255,255,255,0.82)",
  },
  previewFoot: {
    display: "flex",
    justifyContent: "space-between",
    gap: 18,
    padding: "14px 18px",
    color: "var(--m-on-surface-mid)",
    fontSize: 12,
    borderTop: "1px solid var(--m-outline-var)",
  },
  toolPanel: {
    marginTop: 22,
    padding: 28,
  },
  managementGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 22,
    marginTop: 22,
  },
  managementPanel: {
    padding: 24,
    minHeight: 318,
    background: "linear-gradient(145deg, rgba(255,255,255,0.96), rgba(245,249,253,0.88))",
  },
  campaignCreate: {
    display: "grid",
    gap: 10,
    margin: "0 0 14px",
    padding: 12,
    borderRadius: 20,
    border: "1px solid rgba(207,221,236,0.72)",
    background: "linear-gradient(145deg, rgba(234,243,251,0.76), rgba(255,255,255,0.82))",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.76)",
  },
  inlineInput: {
    width: "100%",
    minHeight: 40,
    borderRadius: 14,
    border: "1px solid rgba(207,221,236,0.92)",
    background: "rgba(255,255,255,0.88)",
    color: "var(--m-on-surface)",
    padding: "0 12px",
    font: "inherit",
    fontSize: 13,
    outline: "none",
    boxSizing: "border-box",
  },
  createFooter: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) auto",
    gap: 8,
    alignItems: "center",
  },
  createButton: {
    minHeight: 40,
    padding: "0 14px",
    opacity: 1,
  },
  folderStack: {
    display: "grid",
    gap: 10,
  },
  folderRow: {
    width: "100%",
    minHeight: 74,
    border: "1px solid var(--m-outline-var)",
    borderRadius: 18,
    padding: "14px 16px",
    background: "rgba(255,255,255,0.72)",
    display: "flex",
    gap: 14,
    justifyContent: "space-between",
    alignItems: "center",
    textAlign: "left",
    cursor: "pointer",
    boxShadow: "0 10px 24px rgba(35,55,78,0.05)",
  },
  rowOpenArea: {
    flex: 1,
    minWidth: 0,
    border: 0,
    padding: 0,
    background: "transparent",
    color: "inherit",
    textAlign: "left",
    cursor: "pointer",
  },
  rowActions: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    flexShrink: 0,
  },
  deleteButton: {
    minHeight: 30,
    borderRadius: 999,
    border: "1px solid rgba(207,221,236,0.86)",
    background: "rgba(255,255,255,0.68)",
    color: "var(--m-on-surface-mid)",
    padding: "0 10px",
    fontSize: 11,
    fontWeight: 800,
    cursor: "pointer",
  },
  toolGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 12,
  },
  toolCard: {
    minHeight: 118,
    border: "1px solid var(--m-outline-var)",
    borderRadius: 20,
    padding: 18,
    background: "linear-gradient(145deg, rgba(255,255,255,0.98), rgba(244,248,252,0.92))",
    color: "var(--m-on-surface)",
    fontSize: 15,
    lineHeight: 1.4,
    fontWeight: 650,
    textAlign: "left",
    cursor: "pointer",
    display: "grid",
    alignContent: "start",
    gap: 8,
  },
  toolTitle: {
    display: "block",
    color: "var(--m-on-surface)",
    fontSize: 15.5,
    lineHeight: 1.15,
    fontWeight: 800,
  },
  toolDetail: {
    display: "block",
    color: "var(--m-on-surface-mid)",
    fontSize: 12.5,
    lineHeight: 1.4,
    fontWeight: 550,
  },
  toolMeta: {
    display: "inline-flex",
    width: "fit-content",
    marginTop: 4,
    padding: "5px 8px",
    borderRadius: 999,
    color: "var(--m-on-surface-var)",
    background: "var(--m-surface-2)",
    fontSize: 9,
    fontWeight: 850,
  },
  canvasPage: {
    width: "min(1380px, 100%)",
    margin: "0 auto",
    paddingBottom: 72,
  },
  canvasHeader: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 24,
    marginBottom: 22,
  },
  canvasEyebrow: {
    fontSize: 10,
    letterSpacing: "0.18em",
    fontWeight: 800,
    color: "var(--m-primary)",
  },
  canvasTitle: {
    margin: "8px 0 8px",
    fontFamily: "var(--font-display)",
    fontSize: "clamp(42px, 4.6vw, 68px)",
    lineHeight: 0.92,
    letterSpacing: "-0.055em",
    color: "var(--m-on-surface)",
  },
  canvasSub: {
    margin: 0,
    maxWidth: 720,
    color: "var(--m-on-surface-var)",
    fontSize: 16,
    lineHeight: 1.48,
  },
  canvasActions: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },
  canvasSize: {
    padding: "9px 12px",
    borderRadius: 999,
    background: "var(--m-surface-2)",
    color: "var(--m-on-surface-var)",
    fontSize: 10,
    fontWeight: 800,
  },
  askButton: {
    minHeight: 42,
    padding: "0 18px",
  },
  studioWorkspace: {
    display: "grid",
    gap: 26,
    alignItems: "start",
  },
  studioRail: {
    position: "sticky",
    top: 18,
    alignSelf: "start",
    zIndex: 2,
  },
  studioControls: {
    display: "grid",
    gap: 16,
    padding: 18,
    borderRadius: 24,
    background: "linear-gradient(150deg, rgba(255,255,255,0.92), rgba(244,249,254,0.82))",
    border: "1px solid var(--m-outline-var)",
    boxShadow: "0 22px 58px rgba(35,55,78,0.13), inset 0 1px 0 rgba(255,255,255,0.86)",
    backdropFilter: "blur(18px) saturate(1.14)",
  },
  briefField: {
    display: "grid",
    gap: 8,
  },
  fieldLabel: {
    color: "var(--m-on-surface-mid)",
    fontSize: 9.5,
    letterSpacing: "0.16em",
    fontWeight: 850,
  },
  storyInput: {
    width: "100%",
    minHeight: 154,
    resize: "vertical",
    borderRadius: 18,
    padding: "15px 16px",
    border: "1px solid rgba(207,221,236,0.92)",
    background: "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(248,251,255,0.92))",
    color: "var(--m-on-surface)",
    font: "inherit",
    fontSize: 13.5,
    lineHeight: 1.48,
    outline: "none",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.92)",
  },
  controlGrid: {
    display: "grid",
    gap: 16,
    alignItems: "start",
  },
  optionGrid: {
    display: "grid",
    gap: 10,
    marginTop: 8,
  },
  optionButton: {
    minHeight: 76,
    borderRadius: 18,
    border: "1px solid rgba(207,221,236,0.92)",
    padding: "13px 14px",
    background: "rgba(255,255,255,0.70)",
    color: "var(--m-on-surface)",
    display: "grid",
    gap: 5,
    textAlign: "left",
    cursor: "pointer",
    boxShadow: "0 10px 24px rgba(35,55,78,0.05)",
  },
  optionButtonActive: {
    color: "#FFFFFF",
    background: "linear-gradient(135deg, rgba(31,44,69,0.96), rgba(67,85,112,0.92))",
    borderColor: "rgba(255,255,255,0.34)",
    boxShadow: "0 18px 42px rgba(31,44,69,0.18), inset 0 1px 0 rgba(255,255,255,0.16)",
  },
  textureRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  textureButton: {
    borderRadius: 999,
    minHeight: 38,
    padding: "0 12px 0 9px",
    border: "1px solid rgba(255,255,255,0.34)",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    fontWeight: 850,
    textShadow: "0 1px 2px rgba(10,17,29,0.32)",
    cursor: "pointer",
  },
  ctaInput: {
    minHeight: 40,
    borderRadius: 14,
    border: "1px solid rgba(207,221,236,0.92)",
    padding: "0 13px",
    background: "rgba(255,255,255,0.86)",
    color: "var(--m-on-surface)",
    font: "inherit",
    fontSize: 13.5,
    outline: "none",
  },
  briefTitle: {
    display: "block",
    marginTop: 6,
    color: "var(--m-on-surface)",
    fontSize: 17,
    letterSpacing: "-0.02em",
  },
  briefCopy: {
    margin: "6px 0 0",
    color: "var(--m-on-surface-mid)",
    fontSize: 13.5,
    lineHeight: 1.5,
  },
  structureButton: {
    width: "100%",
    minHeight: 42,
  },
  artboardStack: {
    display: "grid",
    gap: 26,
    justifyItems: "center",
    minWidth: 0,
  },
  artboard: {
    position: "relative",
    width: "min(860px, 100%)",
    aspectRatio: "4 / 5",
    margin: "0 auto",
    overflow: "hidden",
    borderRadius: 28,
    backgroundSize: "cover, cover",
    backgroundPosition: "center, center",
    border: "1px solid rgba(255,255,255,0.50)",
    boxShadow: "0 40px 108px rgba(35,55,78,0.26), 0 14px 32px rgba(35,55,78,0.13)",
    color: "rgba(255,255,255,0.98)",
  },
  articleBoard: {
    aspectRatio: "1.45 / 1",
    width: "min(1020px, 100%)",
  },
  artboardShade: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(135deg, rgba(9,15,27,0.34), rgba(9,15,27,0.04) 42%, rgba(9,15,27,0.48))",
  },
  artboardContent: {
    position: "relative",
    zIndex: 1,
    height: "100%",
    padding: "clamp(34px, 5.2vw, 58px)",
    display: "flex",
    flexDirection: "column",
  },
  artboardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 18,
  },
  artboardEyebrow: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 10,
    letterSpacing: "0.22em",
    fontWeight: 800,
  },
  pageCount: {
    color: "rgba(255,255,255,0.76)",
    fontSize: 10,
    letterSpacing: "0.16em",
    fontWeight: 800,
  },
  artboardMain: {
    marginTop: "auto",
    maxWidth: 720,
  },
  artboardTitle: {
    margin: 0,
    fontFamily: "var(--font-display)",
    fontSize: "clamp(48px, 7vw, 82px)",
    lineHeight: 0.9,
    letterSpacing: "-0.058em",
    color: "rgba(255,255,255,0.99)",
    textWrap: "balance",
  },
  artboardText: {
    margin: "20px 0 0",
    maxWidth: 690,
    fontSize: "clamp(17px, 2vw, 24px)",
    lineHeight: 1.35,
    color: "rgba(255,255,255,0.86)",
  },
  artboardGlass: {
    marginTop: 28,
    borderRadius: 24,
    overflow: "hidden",
    background: "linear-gradient(135deg, rgba(255,255,255,0.22), rgba(255,255,255,0.08))",
    border: "1px solid rgba(255,255,255,0.34)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.34), 0 16px 42px rgba(0,0,0,0.20)",
    backdropFilter: "blur(8px) saturate(1.35)",
  },
  proofGrid: {
    marginTop: 28,
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 12,
  },
  proofCard: {
    minHeight: 132,
    padding: "18px 18px",
    borderRadius: 22,
    color: "rgba(255,255,255,0.96)",
    background: "linear-gradient(135deg, rgba(255,255,255,0.22), rgba(255,255,255,0.08))",
    border: "1px solid rgba(255,255,255,0.34)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.34), 0 16px 42px rgba(0,0,0,0.16)",
    backdropFilter: "blur(8px) saturate(1.35)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    gap: 16,
  },
  proofNumber: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 10,
    letterSpacing: "0.16em",
    fontWeight: 850,
  },
  whiteBrief: {
    marginTop: 28,
    borderRadius: 24,
    overflow: "hidden",
    background: "rgba(252,253,255,0.88)",
    border: "1px solid rgba(255,255,255,0.76)",
    boxShadow: "0 18px 44px rgba(0,0,0,0.16), inset 0 1px 0 rgba(255,255,255,0.78)",
    backdropFilter: "blur(10px) saturate(1.22)",
  },
  whiteBriefLine: {
    minHeight: 72,
    padding: "18px 22px",
    display: "flex",
    alignItems: "center",
    gap: 16,
    color: "#1A2233",
    fontSize: 17,
    borderBottom: "1px solid rgba(206,218,232,0.74)",
  },
  whiteBriefNumber: {
    width: 34,
    height: 34,
    borderRadius: 12,
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
    background: "rgba(106,155,204,0.14)",
    color: "#355F89",
    fontWeight: 850,
  },
  glassLine: {
    minHeight: 70,
    padding: "18px 22px",
    display: "flex",
    alignItems: "center",
    gap: 16,
    color: "rgba(255,255,255,0.94)",
    fontSize: 17,
    borderBottom: "1px solid rgba(255,255,255,0.16)",
  },
  glassNumber: {
    width: 34,
    height: 34,
    borderRadius: 12,
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
    background: "rgba(255,255,255,0.18)",
    color: "rgba(255,255,255,0.94)",
    fontWeight: 800,
  },
  artboardCta: {
    marginTop: 18,
    minHeight: 72,
    padding: "10px 12px",
    borderRadius: 22,
    display: "grid",
    gridTemplateColumns: "54px minmax(0, 1fr) auto",
    gap: 14,
    alignItems: "center",
    color: "rgba(255,255,255,0.96)",
    background: "linear-gradient(135deg, rgba(255,255,255,0.24), rgba(255,255,255,0.10))",
    border: "1px solid rgba(255,255,255,0.38)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.36), 0 18px 46px rgba(0,0,0,0.18)",
    backdropFilter: "blur(9px) saturate(1.35)",
  },
  ctaBadge: {
    width: 50,
    height: 50,
    borderRadius: 14,
    display: "grid",
    placeItems: "center",
    background: "linear-gradient(145deg, #9BC7AB, #6EAD89)",
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: 900,
    boxShadow: "0 12px 26px rgba(15,38,27,0.18), inset 0 1px 0 rgba(255,255,255,0.42)",
  },
  ctaButton: {
    minHeight: 38,
    padding: "0 18px",
    borderRadius: 999,
    display: "grid",
    placeItems: "center",
    background: "rgba(255,255,255,0.18)",
    color: "#FFFFFF",
    fontWeight: 850,
  },
};
