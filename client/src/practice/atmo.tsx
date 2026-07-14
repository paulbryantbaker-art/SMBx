/**
 * Ambient band art (Paul, 2026-07-13: "improve the background gradient —
 * dynamically accent the page text, not take it over; the bands can carry
 * imagery"). Everything here is procedural SVG in the reference language —
 * near-black, coral glow, hairline network — so it ships weightless, scales
 * to any viewport, and never fights the type. All decorative: aria-hidden,
 * pointer-events none, painted below the content wrapper.
 *
 * FootprintMap is honest imagery, not decoration-shaped data: ~50 US metros
 * plotted by real coordinates, with the markets the practice's leadership
 * has actually closed deals in glowing coral (the Wrench footprint, the
 * JPMC decade at New York). The US shape emerges from the node field alone.
 */
import type { ReactNode } from 'react';

type Metro = { k: string; lon: number; lat: number; hot?: boolean };

// hot = a real deal market from the track record (deal sheet, /track-record).
const METROS: Metro[] = [
  { k: 'sea', lon: -122.33, lat: 47.61 },
  { k: 'pdx', lon: -122.68, lat: 45.52 },
  { k: 'boi', lon: -116.2, lat: 43.62 },
  { k: 'sac', lon: -121.49, lat: 38.58 },
  { k: 'sfo', lon: -122.42, lat: 37.77 },
  { k: 'lax', lon: -118.24, lat: 34.05, hot: true },   // NexGen · Service Champions (SoCal)
  { k: 'san', lon: -117.16, lat: 32.72 },
  { k: 'las', lon: -115.14, lat: 36.17 },
  { k: 'slc', lon: -111.89, lat: 40.76 },
  { k: 'phx', lon: -112.07, lat: 33.45, hot: true },   // Parker & Sons · Collins Comfort
  { k: 'abq', lon: -106.65, lat: 35.08 },
  { k: 'elp', lon: -106.49, lat: 31.76 },
  { k: 'den', lon: -104.99, lat: 39.74, hot: true },   // Plumbline
  { k: 'okc', lon: -97.52, lat: 35.47 },
  { k: 'dal', lon: -96.8, lat: 32.78, hot: true },     // Berkeys · Baker Brothers
  { k: 'aus', lon: -97.74, lat: 30.27 },
  { k: 'sat', lon: -98.49, lat: 29.42 },
  { k: 'hou', lon: -95.37, lat: 29.76, hot: true },    // Abacus
  { k: 'mci', lon: -94.58, lat: 39.1 },
  { k: 'oma', lon: -95.93, lat: 41.26 },
  { k: 'msp', lon: -93.27, lat: 44.98, hot: true },    // Lindstrom (MN)
  { k: 'dsm', lon: -93.61, lat: 41.59 },
  { k: 'stl', lon: -90.2, lat: 38.63 },
  { k: 'mem', lon: -90.05, lat: 35.15 },
  { k: 'msy', lon: -90.07, lat: 29.95, hot: true },    // Boothe's (LA)
  { k: 'chi', lon: -87.63, lat: 41.88 },
  { k: 'mke', lon: -87.91, lat: 43.04 },
  { k: 'det', lon: -83.05, lat: 42.33 },
  { k: 'ind', lon: -86.16, lat: 39.77, hot: true },    // Williams Comfort Air
  { k: 'cin', lon: -84.51, lat: 39.1, hot: true },     // Thomas & Galbraith
  { k: 'cmh', lon: -82.99, lat: 39.96 },
  { k: 'cle', lon: -81.69, lat: 41.5 },
  { k: 'pit', lon: -79.99, lat: 40.44 },
  { k: 'sdf', lon: -85.76, lat: 38.25, hot: true },    // Jarboe's
  { k: 'bna', lon: -86.78, lat: 36.16 },
  { k: 'bhm', lon: -86.8, lat: 33.52 },
  { k: 'atl', lon: -84.39, lat: 33.75, hot: true },    // Coolray · Ragsdale
  { k: 'jax', lon: -81.66, lat: 30.33, hot: true },    // Donovan
  { k: 'orl', lon: -81.38, lat: 28.54, hot: true },    // CoolToday orbit
  { k: 'tpa', lon: -82.46, lat: 27.95, hot: true },    // Easy A/C
  { k: 'mia', lon: -80.19, lat: 25.76, hot: true },    // Lindstrom (S. FL)
  { k: 'clt', lon: -80.84, lat: 35.23, hot: true },    // Morris-Jenkins
  { k: 'rdu', lon: -78.64, lat: 35.78 },
  { k: 'ric', lon: -77.44, lat: 37.54 },
  { k: 'dca', lon: -77.04, lat: 38.91, hot: true },    // F.H. Furr (NoVA)
  { k: 'bwi', lon: -76.61, lat: 39.29 },
  { k: 'phl', lon: -75.17, lat: 39.95 },
  { k: 'nyc', lon: -74.01, lat: 40.71, hot: true },    // JPMorgan Chase decade
  { k: 'bdl', lon: -72.68, lat: 41.76 },
  { k: 'bos', lon: -71.06, lat: 42.36 },
  { k: 'buf', lon: -78.88, lat: 42.89 },
];

// Corridor edges — enough to read as a network, sparse enough to stay quiet.
const EDGES: [string, string][] = [
  ['sea', 'pdx'], ['pdx', 'boi'], ['pdx', 'sac'], ['sac', 'sfo'], ['sfo', 'lax'],
  ['lax', 'san'], ['lax', 'las'], ['san', 'phx'], ['las', 'slc'], ['las', 'phx'],
  ['boi', 'slc'], ['slc', 'den'], ['phx', 'abq'], ['abq', 'den'], ['abq', 'elp'],
  ['elp', 'sat'], ['den', 'mci'], ['den', 'okc'], ['okc', 'dal'], ['okc', 'mci'],
  ['dal', 'hou'], ['dal', 'aus'], ['aus', 'sat'], ['sat', 'hou'], ['hou', 'msy'],
  ['dal', 'mem'], ['mci', 'stl'], ['mci', 'oma'], ['oma', 'dsm'], ['dsm', 'msp'],
  ['dsm', 'chi'], ['msp', 'mke'], ['mke', 'chi'], ['chi', 'det'], ['chi', 'ind'],
  ['chi', 'stl'], ['stl', 'ind'], ['stl', 'mem'], ['mem', 'bna'], ['msy', 'bhm'],
  ['bna', 'sdf'], ['bna', 'atl'], ['bna', 'bhm'], ['bhm', 'atl'], ['atl', 'clt'],
  ['atl', 'jax'], ['jax', 'orl'], ['orl', 'tpa'], ['orl', 'mia'], ['tpa', 'mia'],
  ['clt', 'rdu'], ['rdu', 'ric'], ['ric', 'dca'], ['dca', 'bwi'], ['bwi', 'phl'],
  ['phl', 'nyc'], ['nyc', 'bdl'], ['bdl', 'bos'], ['buf', 'cle'], ['cle', 'pit'],
  ['pit', 'dca'], ['pit', 'cmh'], ['cmh', 'cin'], ['cin', 'ind'], ['cin', 'sdf'],
  ['cmh', 'cle'], ['det', 'cle'], ['ind', 'sdf'], ['buf', 'nyc'],
];

const W = 980;
const H = 610;
const px = (lon: number) => (lon + 125) * (W / 59);
const py = (lat: number) => (49.6 - lat) * (H / 25);

const at = new Map(METROS.map(m => [m.k, m]));

export function FootprintMap() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="pd-mapart" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="pdm-halo">
          <stop offset="0%" stopColor="#FF5C77" stopOpacity="0.5" />
          <stop offset="45%" stopColor="#FF5C77" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#FF5C77" stopOpacity="0" />
        </radialGradient>
      </defs>
      {EDGES.map(([a, b]) => {
        const A = at.get(a)!;
        const B = at.get(b)!;
        const hot = A.hot && B.hot;
        return (
          <line
            key={`${a}-${b}`}
            x1={px(A.lon)} y1={py(A.lat)} x2={px(B.lon)} y2={py(B.lat)}
            stroke={hot ? 'rgba(255, 122, 143, 0.38)' : 'rgba(255, 255, 255, 0.10)'}
            strokeWidth={hot ? 1.1 : 0.7}
          />
        );
      })}
      {METROS.map(m => {
        const x = px(m.lon);
        const y = py(m.lat);
        return m.hot ? (
          <g key={m.k}>
            <circle cx={x} cy={y} r={17} fill="url(#pdm-halo)" />
            <circle cx={x} cy={y} r={3.4} fill="#FFB3BF" />
          </g>
        ) : (
          <circle key={m.k} cx={x} cy={y} r={2} fill="rgba(255, 255, 255, 0.30)" />
        );
      })}
    </svg>
  );
}

/** A quiet constellation mesh — the reference renders' network fragment,
 *  hand-plotted so it stays identical between builds. */
const MESH_PTS: [number, number, boolean?][] = [
  [30, 168, true], [96, 60], [150, 210], [208, 118], [286, 40], [300, 208, true],
  [368, 130], [430, 34], [452, 232], [520, 120, true], [590, 40], [612, 196],
  [668, 96], [730, 190], [760, 60],
];
const MESH_EDGES: [number, number][] = [
  [0, 1], [0, 2], [1, 3], [2, 3], [2, 5], [3, 4], [3, 6], [4, 6], [5, 6], [5, 8],
  [6, 7], [6, 9], [7, 10], [8, 9], [9, 10], [9, 11], [10, 12], [11, 12], [11, 13],
  [12, 14], [13, 14], [4, 7], [8, 11],
];

export function Mesh() {
  return (
    <svg viewBox="0 0 790 260" className="pd-meshart" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="pdm-halo2">
          <stop offset="0%" stopColor="#FF5C77" stopOpacity="0.45" />
          <stop offset="50%" stopColor="#FF5C77" stopOpacity="0.14" />
          <stop offset="100%" stopColor="#FF5C77" stopOpacity="0" />
        </radialGradient>
      </defs>
      {MESH_EDGES.map(([a, b]) => (
        <line
          key={`${a}-${b}`}
          x1={MESH_PTS[a][0]} y1={MESH_PTS[a][1]} x2={MESH_PTS[b][0]} y2={MESH_PTS[b][1]}
          stroke={MESH_PTS[a][2] || MESH_PTS[b][2] ? 'rgba(255, 122, 143, 0.26)' : 'rgba(255, 255, 255, 0.09)'}
          strokeWidth={0.8}
        />
      ))}
      {MESH_PTS.map(([x, y, hot], i) =>
        hot ? (
          <g key={i}>
            <circle cx={x} cy={y} r={14} fill="url(#pdm-halo2)" />
            <circle cx={x} cy={y} r={2.6} fill="#FFB3BF" />
          </g>
        ) : (
          <circle key={i} cx={x} cy={y} r={1.7} fill="rgba(255, 255, 255, 0.28)" />
        ),
      )}
    </svg>
  );
}

/** Absolute full-bleed slot inside a band for the SVG art; painted below the
 *  band's .pd-wrap (which is position: relative). */
export function BandArt({ children }: { children: ReactNode }) {
  return <div className="pd-bandart" aria-hidden="true">{children}</div>;
}

/** Curved bleed dividers into/out of a dark band (Slack signature). `dir` "in"
 *  enters a band (place it before the band); "up" exits one (place it after).
 *  The curve is a stretched SVG mask in CSS and the box carries the same
 *  coral-black band texture, so the texture flows over the divider; the light
 *  side of the box is masked away so it bleeds into the ambient wash cleanly. */
export function Swoosh({ dir = 'in' }: { dir?: 'in' | 'up' }) {
  return <div className={dir === 'in' ? 'pd-swoosh' : 'pd-swoosh-up'} aria-hidden="true" />;
}
