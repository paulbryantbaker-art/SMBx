/**
 * Menu Catalog Service — Queries menu_items for available deliverables.
 *
 * A deliverable's price is its `base_price_cents`, full stop. It used to be
 * `base_price_cents × getLeagueMultiplier(league)`, and league is derived from
 * the target's SDE/EBITDA — so the same document cost 10× more on a $50M+ deal
 * than on a sub-$500K one. That is pricing by deal size, which is the one thing
 * this practice's regulatory position rests on not doing (removed 2026-08-14,
 * with the platform_fee_schedule ladder in migration 125).
 *
 * Per-deliverable pricing itself is untouched and still live — only the
 * size-scaling factor is gone.
 */
import { sql } from '../db.js';

export interface MenuItem {
  id: number;
  slug: string;
  name: string;
  description: string;
  tier: string;
  base_price_cents: number;
  category: string;
  journey: string | null;
  gate: string | null;
  deliverable_type: string;
  active: boolean;
}

export interface PricedMenuItem extends MenuItem {
  final_price_cents: number;
  final_price_display: string;
}

/** Get all active menu items */
export async function getAllMenuItems(): Promise<MenuItem[]> {
  const rows = await sql`SELECT * FROM menu_items WHERE active = true ORDER BY journey, gate, base_price_cents`;
  return rows as unknown as MenuItem[];
}

/** Get menu items available at a specific gate */
export async function getGateMenuItems(gate: string): Promise<MenuItem[]> {
  const rows = await sql`
    SELECT * FROM menu_items
    WHERE active = true AND gate = ${gate}
    ORDER BY base_price_cents
  `;
  return rows as unknown as MenuItem[];
}

/** Get menu items for a journey */
export async function getJourneyMenuItems(journey: string): Promise<MenuItem[]> {
  const rows = await sql`
    SELECT * FROM menu_items
    WHERE active = true AND (journey = ${journey} OR journey IS NULL)
    ORDER BY gate, base_price_cents
  `;
  return rows as unknown as MenuItem[];
}

/** Get a single menu item by slug */
export async function getMenuItemBySlug(slug: string): Promise<MenuItem | null> {
  const [row] = await sql`SELECT * FROM menu_items WHERE slug = ${slug} AND active = true`;
  return (row as unknown as MenuItem) || null;
}

/** Price a menu item. The price is the base price — see the file header. */
export function priceMenuItem(item: MenuItem): PricedMenuItem {
  const finalCents = item.base_price_cents;
  return {
    ...item,
    final_price_cents: finalCents,
    final_price_display: finalCents === 0 ? 'Free' : `$${(finalCents / 100).toFixed(2)}`,
  };
}

/** Get priced menu items for a gate */
export async function getPricedGateItems(gate: string): Promise<PricedMenuItem[]> {
  const items = await getGateMenuItems(gate);
  return items.map(priceMenuItem);
}

/** Get all free deliverables available at a gate */
export async function getFreeGateItems(gate: string): Promise<MenuItem[]> {
  const rows = await sql`
    SELECT * FROM menu_items
    WHERE active = true AND gate = ${gate} AND base_price_cents = 0
    ORDER BY name
  `;
  return rows as unknown as MenuItem[];
}
