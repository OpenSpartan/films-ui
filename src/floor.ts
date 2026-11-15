// Floor plans: where players can walk on a level or a baked Forge map, as
// rings of world-space points, each with the height range it spans
// (levelcat's and the extractor's plan format). Drawn as Halo Infinite's
// tactical map draws terrain: in height bands, each a little brighter than
// the one under it, with contour edges, so a map's storeys read at a glance;
// sliced at an elevation, the floors above and below stay faint. Cartographer
// and Films draw their floors with it, each in its own colours.

/** One ring: the heights it spans (world units), whether it is a hole, and
 *  its points, flat: [x0, y0, x1, y1, ...]. */
export interface FloorRing {
  z: readonly [number, number];
  hole: boolean;
  p: readonly number[];
}

/** One height band's rings as a path, and its place: 0 the lowest band, 1
 *  the highest. */
export interface FloorBand {
  path: Path2D;
  t: number;
}

/** The lowest and highest height the rings span, or null with none. */
export function floorHeights(rings: readonly FloorRing[]): { min: number; max: number } | null {
  let min = Infinity, max = -Infinity;
  for (const r of rings) {
    if (r.z[0] < min) min = r.z[0];
    if (r.z[1] > max) max = r.z[1];
  }
  return min <= max ? { min, max } : null;
}

/** The rings an elevation slice keeps: those within `reach` world units of
 *  `height` (8 by default, a storey's slack), or every ring for null. */
export function ringsAt(rings: readonly FloorRing[], height: number | null, reach = 8): FloorRing[] {
  return height === null ? [...rings] : rings.filter(r => r.z[0] <= height + reach && r.z[1] >= height - reach);
}

/** Rings as one world-space path. Filled nonzero, holes cut out and stacked
 *  floors merge. */
export function floorPath(rings: readonly FloorRing[]): Path2D {
  const path = new Path2D();
  for (const r of rings) {
    if (r.p.length < 6) continue;
    path.moveTo(r.p[0], r.p[1]);
    for (let i = 2; i < r.p.length; i += 2) path.lineTo(r.p[i], r.p[i + 1]);
    path.closePath();
  }
  return path;
}

/** Whether (x, y) is inside the ring of flat points `p` (even-odd). */
function ringHas(p: readonly number[], x: number, y: number): boolean {
  let inside = false;
  for (let i = 0, j = p.length - 2; i < p.length; j = i, i += 2) {
    if ((p[i + 1] > y) !== (p[j + 1] > y) && x < ((p[j] - p[i]) * (y - p[i + 1])) / (p[j + 1] - p[i + 1]) + p[i]) inside = !inside;
  }
  return inside;
}

/** A ring's area (shoelace). */
function ringArea(p: readonly number[]): number {
  let a = 0;
  for (let i = 0, j = p.length - 2; i < p.length; j = i, i += 2) a += p[j] * p[i + 1] - p[i] * p[j + 1];
  return Math.abs(a / 2);
}

/** The rings in `n` height bands between `lo` and `hi` (floorHeights),
 *  lowest first, bands with no rings left out. A ring's band is its middle
 *  height's. A hole goes with the smallest ring holding it, so it cuts that
 *  ring whatever its own height. */
export function floorBands(rings: readonly FloorRing[], lo: number, hi: number, n = 4): FloorBand[] {
  const outer = rings.filter(r => !r.hole && r.p.length >= 6);
  const band = (r: FloorRing): number =>
    hi > lo ? Math.min(n - 1, Math.max(0, Math.floor((((r.z[0] + r.z[1]) / 2 - lo) / (hi - lo)) * n))) : 0;
  const groups: FloorRing[][] = Array.from({ length: n }, () => []);
  for (const r of outer) groups[band(r)].push(r);
  for (const h of rings) {
    if (!h.hole || h.p.length < 6) continue;
    let best: FloorRing | null = null, area = Infinity;
    for (const o of outer) {
      if (!ringHas(o.p, h.p[0], h.p[1])) continue;
      const a = ringArea(o.p);
      if (a < area) { best = o; area = a; }
    }
    if (best) groups[band(best)].push(h);
  }
  const bands: FloorBand[] = [];
  groups.forEach((g, i) => { if (g.length) bands.push({ path: floorPath(g), t: n > 1 ? i / (n - 1) : 0 }); });
  return bands;
}

/** A floor's colours: the lowest and highest bands' fills (the bands between
 *  are mixed), the contour edges, and the floors outside a slice. `#rrggbb`. */
export interface FloorStyle {
  low: string;
  high: string;
  edge: string;
  away: string;
}

/** `#rrggbb` `a` to `b` by `f`, 0 to 1. */
function mix(a: string, b: string, f: number): string {
  const ch = (hex: string, i: number): number => parseInt(hex.slice(1 + 2 * i, 3 + 2 * i), 16);
  return `#${[0, 1, 2].map(i => Math.round(ch(a, i) + (ch(b, i) - ch(a, i)) * f).toString(16).padStart(2, '0')).join('')}`;
}

/** Draw a floor's bands, and `outside` (the floors a slice leaves out)
 *  faint under them. `ctx`'s transform maps world units to the canvas;
 *  `unit` is one world unit in CSS px, so edges stay a pixel wide. `glow`
 *  blurs the edges in their colour, CSS px (0, none); `ratio` is the device
 *  pixel ratio the blur is in. `opacity` scales it all (a floor over a scene
 *  or under footprints). Higher bands' edges are stronger. */
export function drawFloor(
  ctx: CanvasRenderingContext2D, bands: readonly FloorBand[], outside: Path2D | null, style: FloorStyle,
  o: { unit: number; opacity?: number; glow?: number; ratio?: number },
): void {
  const opacity = o.opacity ?? 1;
  ctx.save();
  ctx.lineWidth = 1 / o.unit;
  if (outside) {
    ctx.globalAlpha = 0.55 * opacity;
    ctx.fillStyle = style.away;
    ctx.fill(outside, 'nonzero');
  }
  ctx.globalAlpha = opacity;
  for (const band of bands) {
    ctx.fillStyle = mix(style.low, style.high, band.t);
    ctx.fill(band.path, 'nonzero');
  }
  ctx.strokeStyle = style.edge;
  if (o.glow) {
    ctx.shadowColor = style.edge;
    ctx.shadowBlur = o.glow * (o.ratio ?? 1);
  }
  for (const band of bands) {
    ctx.globalAlpha = (0.3 + 0.3 * band.t) * opacity;
    ctx.stroke(band.path);
  }
  ctx.restore();
}
