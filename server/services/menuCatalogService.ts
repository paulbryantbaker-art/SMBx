/**
 * Menu Catalog Service — Queries menu_items for available deliverables.
 * Handles pricing with league multipliers.
 */
import { sql } from '../db.js';
import { getLeagueMultiplier } from './leagueClassifier.js';

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
  league_multiplier: number;
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

/** Price a menu item with league multiplier */
export function priceMenuItem(item: MenuItem, league: string): PricedMenuItem {
  const multiplier = getLeagueMultiplier(league);
  const finalCents = Math.round(item.base_price_cents * multiplier);
  return {
    ...item,
    final_price_cents: finalCents,
    final_price_display: finalCents === 0 ? 'Free' : `$${(finalCents / 100).toFixed(2)}`,
    league_multiplier: multiplier,
  };
}

/** Get priced menu items for a gate + league */
export async function getPricedGateItems(gate: string, league: string): Promise<PricedMenuItem[]> {
  const items = await getGateMenuItems(gate);
  return items.map(item => priceMenuItem(item, league));
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
