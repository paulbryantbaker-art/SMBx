/**
 * Menu Catalog Service — queries `menu_items` for available deliverables.
 *
 * IT IS A CATALOG, NOT A PRICE LIST (2026-08-15, Paul: "this was when I was
 * selling the app. not relevant any more").
 *
 * This file used to price things. First `base_price_cents × league multiplier`,
 * which meant the same document cost 10× more on a $50M+ deal than on a
 * sub-$500K one — pricing by deal size, the one thing this practice's
 * regulatory position rests on NOT doing. That multiplier went on 2026-08-14
 * with the `platform_fee_schedule` ladder, and the header then claimed
 * "per-deliverable pricing itself is untouched and still live."
 *
 * That claim was wrong in both senses. THE LINE v2 rule 1: **nothing in the app
 * charges money** — it is Paul's private instrument and will never be sold — so
 * there is no model for a price to be a live part of. And nothing read it:
 * every price-bearing export here had zero call sites, the only importer
 * (`chat.ts`) imported `getGateMenuItems` and never called it, and no client
 * code mentioned a price at all. Migration 125 drops `base_price_cents` and
 * `tier`; this file stops pretending.
 *
 * `tier` went for the same reason — analyst/associate/vp answered "which
 * subscription could buy this", which is the same retired question.
 *
 * THE TABLE IS LOAD-BEARING and stays. `menu_items` is joined in 38 places
 * across documentShareService, dealFreshnessService, deliverableProcessor and
 * reviewService for slug, name, journey and gate. Only the money left.
 *
 * ORDERING MOVED TO `name`. Three queries here sorted by `base_price_cents`,
 * which would have thrown `column does not exist` the moment 125 applied — a
 * dropped column is a runtime error in an ORDER BY, not a silent null. Sorting
 * a catalog by price was also never the useful order once nothing is for sale.
 */
import { sql } from '../db.js';

export interface MenuItem {
  id: number;
  slug: string;
  name: string;
  description: string;
  category: string;
  journey: string | null;
  gate: string | null;
  deliverable_type: string;
  active: boolean;
}

/** Get all active menu items */
export async function getAllMenuItems(): Promise<MenuItem[]> {
  const rows = await sql`SELECT * FROM menu_items WHERE active = true ORDER BY journey, gate, name`;
  return rows as unknown as MenuItem[];
}

/** Get menu items available at a specific gate */
export async function getGateMenuItems(gate: string): Promise<MenuItem[]> {
  const rows = await sql`
    SELECT * FROM menu_items
    WHERE active = true AND gate = ${gate}
    ORDER BY name
  `;
  return rows as unknown as MenuItem[];
}

/** Get menu items for a journey */
export async function getJourneyMenuItems(journey: string): Promise<MenuItem[]> {
  const rows = await sql`
    SELECT * FROM menu_items
    WHERE active = true AND (journey = ${journey} OR journey IS NULL)
    ORDER BY gate, name
  `;
  return rows as unknown as MenuItem[];
}

/** Get a single menu item by slug */
export async function getMenuItemBySlug(slug: string): Promise<MenuItem | null> {
  const [row] = await sql`SELECT * FROM menu_items WHERE slug = ${slug} AND active = true`;
  return (row as unknown as MenuItem) || null;
}

/* DELETED with the prices, rather than left returning a constant:
 *   PricedMenuItem · priceMenuItem() · getPricedGateItems() · getFreeGateItems()
 *
 * All four had zero call sites. `getFreeGateItems` is the one worth naming —
 * it selected `base_price_cents = 0`, so post-125 it would have thrown; and
 * "free deliverables at this gate" is a distinction with no opposite now that
 * every deliverable is free. A function that can only ever return everything is
 * worse than no function, because its NAME still implies a filter.
 */
