/**
 * Server-side canvas tab persistence.
 * Mirrors the client's openCanvasTab logic so that when Yulia's tools
 * return a canvas_action, we persist the resulting tab to the database
 * regardless of whether the client is connected to receive the SSE event.
 */
import { sql } from '../db.js';

interface CanvasActionPayload {
  canvas_action: string;
  modelType?: string;
  title?: string;
  initialAssumptions?: Record<string, any>;
  tabId?: string;
  updates?: Record<string, any>;
  deliverableId?: number;
  dealId?: number;
  props?: Record<string, any>;
  content?: string;
}

/**
 * Translate a canvas_action payload into a tab record and upsert it.
 * Returns true if a tab was persisted, false otherwise.
 */
export async function persistCanvasTabFromAction(
  conversationId: number | null,
  action: CanvasActionPayload,
): Promise<boolean> {
  if (!conversationId || !action?.canvas_action) return false;

  let tabId: string | null = null;
  let type: string | null = null;
  let label: string | null = null;
  let props: Record<string, any> = {};

  switch (action.canvas_action) {
    case 'create_model_tab':
      // Model tabs reuse tab id 'model' (matches client panel pattern)
      type = 'model';
      tabId = 'model';
      label = action.title || 'Model';
      props = { modelType: action.modelType, initialAssumptions: action.initialAssumptions };
      break;
    case 'open_sourcing':
      type = 'sourcing'; tabId = 'sourcing'; label = action.title || 'Sourcing'; props = action.props || {};
      break;
    case 'open_buyer_pipeline':
      type = 'buyer-pipeline'; tabId = 'buyer-pipeline'; label = action.title || 'Buyer Pipeline'; props = action.props || {};
      break;
    case 'open_deliverable':
      if (!action.deliverableId) return false;
      type = 'deliverable';
      tabId = `deliverable-${action.deliverableId}`;
      label = action.title || `Document #${action.deliverableId}`;
      props = { deliverableId: action.deliverableId };
      break;
    case 'open_dataroom':
      type = 'dataroom'; tabId = 'dataroom'; label = action.title || 'Data Room'; props = action.props || {};
      break;
    case 'open_pipeline':
      type = 'pipeline'; tabId = 'pipeline'; label = action.title || 'Pipeline'; props = action.props || {};
      break;
    case 'open_seller_dashboard':
      type = 'seller-dashboard'; tabId = 'seller-dashboard'; label = action.title || 'Seller Dashboard'; props = action.props || {};
      break;
    case 'open_deal_messages':
      type = 'deal-messages'; tabId = 'deal-messages'; label = action.title || 'Deal Messages'; props = action.props || {};
      break;
    case 'show_content':
      if (!action.content) return false;
      type = 'markdown';
      tabId = `md-${Date.now()}`;
      label = action.title || 'Analysis';
      props = { content: action.content };
      break;
    case 'update_model':
    case 'read_tab_state':
      // These don't create new tabs
      return false;
    default:
      return false;
  }

  if (!tabId || !type || !label) return false;

  try {
    // Determine next position
    const [cnt] = await sql`SELECT COUNT(*)::int as c FROM canvas_tabs WHERE conversation_id = ${conversationId}`;
    const position = cnt?.c || 0;

    await sql`
      INSERT INTO canvas_tabs (conversation_id, tab_id, type, label, props, position, is_active)
      VALUES (${conversationId}, ${tabId}, ${type}, ${label}, ${sql.json(props)}, ${position}, true)
      ON CONFLICT (conversation_id, tab_id) DO UPDATE SET
        label = EXCLUDED.label,
        props = EXCLUDED.props,
        is_active = true,
        updated_at = NOW()
    `;
    // Mark all other tabs as inactive
    await sql`
      UPDATE canvas_tabs SET is_active = false
      WHERE conversation_id = ${conversationId} AND tab_id != ${tabId}
    `;
    return true;
  } catch (err: any) {
    console.error('[canvasTabPersist] failed to persist:', err.message);
    return false;
  }
}
