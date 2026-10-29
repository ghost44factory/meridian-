// Sea lanes as lon/lat waypoint chains that follow real shipping corridors —
// Malacca, Suez, Gibraltar, Dover, Luzon Strait — so routes never cross land.
// Longitudes may run beyond ±180 (unwrapped) for transpacific routes; drawing
// helpers wrap them back onto the map and split polylines at the date line.
import { MAP_W, project } from "./world-path";

export type LonLat = [number, number];

// ---- shared corridor segments (ordered toward Europe / destination) ----

// Singapore -> Rotterdam via Malacca, Suez, Gibraltar, Dover
const SUEZ_TO_ROTTERDAM: LonLat[] = [
  [104.2, 1.2], [100.6, 2.9], [97.4, 5.6], [94.0, 6.4], [87.0, 6.2], [80.6, 5.9],
  [73.0, 8.5], [66.0, 12.0], [57.0, 13.5], [51.5, 12.8], [44.8, 12.1], [43.3, 12.7],
  [41.2, 15.5], [38.6, 20.6], [35.6, 25.0], [33.8, 27.8], [32.6, 29.9], [32.3, 31.4],
  [29.5, 32.6], [24.5, 34.2], [18.5, 35.6], [14.2, 36.9], [11.5, 37.4], [8.0, 37.7],
  [4.0, 37.3], [0.0, 36.6], [-3.2, 36.1], [-5.6, 35.95], [-7.8, 36.3], [-9.6, 38.4],
  [-9.9, 43.3], [-7.8, 45.6], [-5.6, 48.0], [-5.0, 48.7], [-2.6, 49.7], [-0.2, 50.2],
  [1.5, 50.9], [2.8, 51.4], [4.0, 51.95],
];

// English Channel approach (from Ushant) -> Rotterdam, reused by Atlantic routes
const CHANNEL_TO_ROTTERDAM: LonLat[] = [
  [-5.0, 48.7], [-2.6, 49.7], [-0.2, 50.2], [1.5, 50.9], [2.8, 51.4], [4.0, 51.95],
];

// Shanghai -> Singapore via Taiwan Strait and South China Sea
const SHANGHAI_TO_SINGAPORE: LonLat[] = [
  [122.1, 31.0], [122.8, 28.6], [121.0, 26.3], [119.6, 24.8], [117.8, 22.8],
  [114.0, 18.5], [111.5, 13.5], [108.8, 8.0], [105.8, 4.2], [104.6, 1.8], [104.2, 1.2],
];

// Shanghai -> open Pacific -> Los Angeles (unwrapped lon past 180)
const TRANSPACIFIC: LonLat[] = [
  [122.1, 31.0], [125.5, 30.6], [129.0, 31.0], [133.5, 32.6], [137.5, 33.8],
  [141.5, 35.2], [150.0, 39.5], [160.0, 43.5], [170.0, 46.5], [180.0, 48.2],
  [190.0, 49.6], [200.0, 49.8], [210.0, 47.8], [220.0, 43.8], [228.0, 39.8],
  [233.5, 36.2], [238.0, 34.0], [241.8, 33.75],
];

// Sydney -> Shanghai east of PNG and the Philippines, in via Luzon Strait
const AUS_TO_SHANGHAI: LonLat[] = [
  [151.4, -34.0], [154.8, -30.0], [157.2, -23.0], [157.6, -15.0], [155.6, -8.5],
  [153.8, -4.2], [150.5, -0.8], [145.5, 1.8], [138.5, 2.8], [131.5, 4.2],
  [128.0, 6.5], [127.0, 9.5], [126.0, 13.5], [123.8, 18.5], [121.6, 20.9],
  [120.3, 23.8], [119.9, 25.3], [121.2, 26.8], [122.8, 28.6], [122.1, 31.0],
];

// Santos -> Rotterdam along the Atlantic
const BRAZIL_TO_ROTTERDAM: LonLat[] = [
  [-46.3, -24.3], [-41.5, -23.8], [-37.0, -19.0], [-33.8, -10.0], [-31.0, -2.0],
  [-27.5, 8.0], [-22.0, 17.0], [-17.0, 25.0], [-13.0, 32.0], [-10.2, 36.8],
  [-9.6, 38.4], [-9.9, 43.3], [-7.8, 45.6], [-5.6, 48.0], ...CHANNEL_TO_ROTTERDAM.slice(0),
];

// New York -> Rotterdam
const NY_TO_ROTTERDAM: LonLat[] = [
  [-73.9, 40.4], [-69.8, 40.8], [-64.5, 42.2], [-55.0, 44.8], [-40.0, 47.2],
  [-25.0, 48.6], [-12.0, 48.9], ...CHANNEL_TO_ROTTERDAM.slice(0),
];

// Gulf / Indian subcontinent joins onto the Suez corridor at the Gulf of Aden
const ADEN_INDEX = SUEZ_TO_ROTTERDAM.findIndex(([lon]) => lon === 51.5);
const ADEN_TO_ROTTERDAM = SUEZ_TO_ROTTERDAM.slice(ADEN_INDEX);

const JEBEL_ALI_TO_ROTTERDAM: LonLat[] = [
  [55.1, 25.1], [56.2, 26.4], [57.5, 25.4], [60.0, 23.8], [58.5, 19.0],
  [55.0, 14.5], ...ADEN_TO_ROTTERDAM,
];

const KARACHI_TO_ROTTERDAM: LonLat[] = [
  [66.9, 24.6], [64.5, 22.5], [60.0, 18.0], [55.0, 14.5], ...ADEN_TO_ROTTERDAM,
];

// ---- public lane sets ----

export const LANES: Record<string, LonLat[]> = {
  transpacific: TRANSPACIFIC,
  asiaEurope: [...SHANGHAI_TO_SINGAPORE, ...SUEZ_TO_ROTTERDAM.slice(1)],
  transatlantic: NY_TO_ROTTERDAM,
  brazilEurope: BRAZIL_TO_ROTTERDAM,
  australiaAsia: AUS_TO_SHANGHAI,
  jebelAliEurope: JEBEL_ALI_TO_ROTTERDAM,
  karachiEurope: KARACHI_TO_ROTTERDAM,
  pacificWestbound: [...TRANSPACIFIC].reverse(),
};

// ---- geometry helpers ----

export type Lane = {
  pts: [number, number][]; // projected, unwrapped x
  cum: number[]; // cumulative length
  total: number;
};

function projectUnwrapped(lon: number, lat: number): [number, number] {
  const [x0, y] = project(((lon + 540) % 360) - 180, lat); // wrapped x
  const k = Math.floor((lon + 180) / 360); // how many worlds east
  return [x0 + k * MAP_W, y];
}

export function makeLane(waypoints: LonLat[]): Lane {
  const pts = waypoints.map(([lon, lat]) => projectUnwrapped(lon, lat));
  const cum = [0];
  for (let i = 1; i < pts.length; i++) {
    const dx = pts[i][0] - pts[i - 1][0];
    const dy = pts[i][1] - pts[i - 1][1];
    cum.push(cum[i - 1] + Math.hypot(dx, dy));
  }
  return { pts, cum, total: cum[cum.length - 1] };
}

/** Position + heading at fraction t (0..1) of the lane, arc-length accurate, x wrapped onto the map. */
export function pointAlong(lane: Lane, t: number) {
  const target = Math.min(0.9999, Math.max(0, t)) * lane.total;
  let i = 1;
  while (i < lane.cum.length - 1 && lane.cum[i] < target) i++;
  const segLen = lane.cum[i] - lane.cum[i - 1] || 1;
  const local = (target - lane.cum[i - 1]) / segLen;
  const [x1, y1] = lane.pts[i - 1];
  const [x2, y2] = lane.pts[i];
  const x = x1 + (x2 - x1) * local;
  return {
    x: ((x % MAP_W) + MAP_W) % MAP_W,
    y: y1 + (y2 - y1) * local,
    angle: (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI,
  };
}

/** Lane as one or more on-map polylines, split where it crosses the date line. */
export function lanePolylines(lane: Lane): string[] {
  const out: string[] = [];
  let cur: string[] = [];
  const wrapK = (x: number) => Math.floor(x / MAP_W);
  for (let i = 0; i < lane.pts.length; i++) {
    const [x, y] = lane.pts[i];
    const k = wrapK(x);
    if (i > 0) {
      const [px0, py0] = lane.pts[i - 1];
      const pk = wrapK(px0);
      if (pk !== k) {
        // split at the boundary between world copies
        const boundary = Math.max(pk, k) * MAP_W;
        const f = (boundary - px0) / (x - px0 || 1);
        const yb = py0 + (y - py0) * f;
        cur.push(`${(boundary - pk * MAP_W).toFixed(1)},${yb.toFixed(1)}`);
        out.push(cur.join(" "));
        cur = [`${(boundary - k * MAP_W).toFixed(1)},${yb.toFixed(1)}`];
      }
    }
    cur.push(`${(x - k * MAP_W).toFixed(1)},${y.toFixed(1)}`);
  }
  if (cur.length > 1) out.push(cur.join(" "));
  return out;
}
