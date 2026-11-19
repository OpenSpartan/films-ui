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

/** Draw on `ctx` at `opacity`: straight onto it when opaque, else on a
 *  canvas of its size with its transform, laid over it at `opacity`, so
 *  what is drawn over what is drawn doesn't show through. */
function layered(ctx: CanvasRenderingContext2D, opacity: number, draw: (c: CanvasRenderingContext2D) => void): void {
  if (opacity >= 1) {
    draw(ctx);
    return;
  }
  const layer = document.createElement('canvas');
  layer.width = ctx.canvas.width;
  layer.height = ctx.canvas.height;
  const c = layer.getContext('2d');
  if (!c) return;
  c.setTransform(ctx.getTransform());
  draw(c);
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = opacity;
  ctx.drawImage(layer, 0, 0);
  ctx.restore();
}

/** Draw a floor's bands, and `outside` (the floors a slice leaves out)
 *  faint under them. `ctx`'s transform maps world units to the canvas;
 *  `unit` is one world unit in CSS px, so edges stay a pixel wide. `glow`
 *  blurs the edges in their colour, CSS px (0, none); `ratio` is the device
 *  pixel ratio the blur is in. `opacity` scales it all (a floor over a scene
 *  or under footprints). Higher bands' edges are stronger.
 *
 *  Two options a hand-drawn minimap's look takes, off by default: `outline`
 *  draws the floor's outer edge (round all the bands, not between them) in
 *  that colour, `outlineWidth` CSS px wide (1.5 by default), and `inner`
 *  scales the edges between bands (1 as strong as without it, 0 none). */
export function drawFloor(
  ctx: CanvasRenderingContext2D, bands: readonly FloorBand[], outside: Path2D | null, style: FloorStyle,
  o: { unit: number; opacity?: number; glow?: number; ratio?: number; outline?: string; outlineWidth?: number; inner?: number },
): void {
  const opacity = o.opacity ?? 1;
  const outline = o.outline;
  if (outline) {
    layered(ctx, opacity, c => drawBands(c, bands, outside, style, { ...o, outline }));
    return;
  }
  const inner = o.inner ?? 1;
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
    ctx.globalAlpha = (0.3 + 0.3 * band.t) * opacity * inner;
    ctx.stroke(band.path);
  }
  ctx.restore();
}

/** drawFloor with an outline, opaque: every band's edge stroked twice as
 *  wide as the outline first, then the bands filled over them, leaves the
 *  outer half of the edges round the whole floor and covers the rest. */
function drawBands(
  ctx: CanvasRenderingContext2D, bands: readonly FloorBand[], outside: Path2D | null, style: FloorStyle,
  o: { unit: number; glow?: number; ratio?: number; outline: string; outlineWidth?: number; inner?: number },
): void {
  ctx.save();
  if (outside) {
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = style.away;
    ctx.fill(outside, 'nonzero');
    ctx.globalAlpha = 1;
  }
  ctx.strokeStyle = o.outline;
  ctx.lineJoin = 'round';
  ctx.lineWidth = (2 * (o.outlineWidth ?? 1.5)) / o.unit;
  for (const band of bands) ctx.stroke(band.path);
  for (const band of bands) {
    ctx.fillStyle = mix(style.low, style.high, band.t);
    ctx.fill(band.path, 'nonzero');
  }
  const inner = o.inner ?? 1;
  if (inner > 0) {
    ctx.lineWidth = 1 / o.unit;
    ctx.strokeStyle = style.edge;
    if (o.glow) {
      ctx.shadowColor = style.edge;
      ctx.shadowBlur = o.glow * (o.ratio ?? 1);
    }
    for (const band of bands) {
      ctx.globalAlpha = (0.3 + 0.3 * band.t) * inner;
      ctx.stroke(band.path);
    }
  }
  ctx.restore();
}

// ── Terrain ─────────────────────────────────────────────────────────────
//
// A map's terrain as a hand-made minimap draws it: shaded by height (higher
// is lighter), lit from the north-west, contour lines on slopes, structures
// as flat shapes with crisp edges, and a bright outer edge. film-assets
// works it out from each map's collision geometry and writes it beside the
// floor plan: `<id>.terrain.png`, the relief in grey (lighter higher, its
// shading baked in) with the map's footprint as alpha, and
// `<id>.terrain.json`, the lines. The relief is tinted here, so a floor
// takes any colour.

/** A map's terrain, film-assets' `<id>.terrain.json`: its relief image's
 *  top-left corner (`x`, `y`, world units), world units a pixel (`res`),
 *  its size in pixels (`w`, `h`), the heights its grey spans (`z`), and
 *  its lines: the footprint's rings (`outline`), where the height steps
 *  (`edges`: round structures and along ledges), the contour lines on
 *  sloped ground (`contours`) and, in newer map data, the risers of stairs
 *  (`treads`) and the walls of floor that runs under the floor in view
 *  (`under`: a tunnel under the map, a passage under a bridge). A line is
 *  flat [x0, y0, dx1, dy1, ...] in whole tenths of a world unit, each point
 *  after the first given from the one before it. */
export interface TerrainData {
  x: number;
  y: number;
  res: number;
  w: number;
  h: number;
  z: readonly [number, number];
  outline: readonly (readonly number[])[];
  edges: readonly (readonly number[])[];
  contours: readonly (readonly number[])[];
  treads?: readonly (readonly number[])[];
  under?: readonly (readonly number[])[];
}

/** A terrain ready to draw (terrainOf): its relief image (grey and alpha)
 *  and its lines as paths, built once. */
export interface Terrain {
  data: TerrainData;
  relief: CanvasImageSource;
  outline: Path2D;
  edges: Path2D;
  contours: Path2D;
  treads?: Path2D;
  under?: Path2D;
  tinted: { key: string; canvas: HTMLCanvasElement } | null;
}

/** A terrain's lines (TerrainData) as one path in world units, closed
 *  when `closed`. */
function linesPath(lines: readonly (readonly number[])[], closed: boolean): Path2D {
  const path = new Path2D();
  for (const l of lines) {
    if (l.length < 4) continue;
    let x = l[0], y = l[1];
    path.moveTo(x / 10, y / 10);
    for (let i = 2; i < l.length; i += 2) {
      x += l[i];
      y += l[i + 1];
      path.lineTo(x / 10, y / 10);
    }
    if (closed) path.closePath();
  }
  return path;
}

/** A terrain from its data and its decoded relief image. */
export function terrainOf(data: TerrainData, relief: CanvasImageSource): Terrain {
  return {
    data,
    relief,
    outline: linesPath(data.outline, true),
    edges: linesPath(data.edges, false),
    contours: linesPath(data.contours, false),
    treads: linesPath(data.treads ?? [], false),
    under: linesPath(data.under ?? [], false),
    tinted: null,
  };
}

/** A terrain's colours, `#rrggbb`: the relief's ramp (its grey maps 0 to
 *  `low`, the middle to `mid` and 255 to `high`), the edges where the
 *  height steps, the contour lines, and the outer edge. */
export interface TerrainStyle {
  low: string;
  mid: string;
  high: string;
  edge: string;
  contour: string;
  outline: string;
}

/** A terrain style from one base colour, `#rrggbb`: the floors a deep
 *  shade of it, higher ground lighter, lighter lines, a white outer edge. */
export function terrainStyle(base: string): TerrainStyle {
  return {
    low: mix('#000000', base, 0.3),
    mid: mix('#000000', base, 0.78),
    high: mix(base, '#ffffff', 0.3),
    edge: mix(base, '#ffffff', 0.65),
    contour: mix(base, '#ffffff', 0.45),
    outline: '#ffffff',
  };
}

/** The relief tinted in a style's ramp, kept until the ramp changes. */
function tinted(t: Terrain, style: TerrainStyle): HTMLCanvasElement | null {
  const key = `${style.low}|${style.mid}|${style.high}`;
  if (t.tinted?.key === key) return t.tinted.canvas;
  const { w, h } = t.data;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const c = canvas.getContext('2d', { willReadFrequently: true });
  if (!c) return null;
  c.drawImage(t.relief, 0, 0, w, h);
  const img = c.getImageData(0, 0, w, h);
  const ch = (hex: string, i: number): number => parseInt(hex.slice(1 + 2 * i, 3 + 2 * i), 16);
  const lut = new Uint8ClampedArray(256 * 3);
  for (let g = 0; g < 256; g++) {
    const f = g / 255;
    const a = f < 0.5 ? style.low : style.mid;
    const b = f < 0.5 ? style.mid : style.high;
    const k = f < 0.5 ? f * 2 : f * 2 - 1;
    for (let i = 0; i < 3; i++) lut[g * 3 + i] = ch(a, i) + (ch(b, i) - ch(a, i)) * k;
  }
  const px = img.data;
  for (let p = 0; p < px.length; p += 4) {
    const g = px[p] * 3;
    px[p] = lut[g];
    px[p + 1] = lut[g + 1];
    px[p + 2] = lut[g + 2];
  }
  c.putImageData(img, 0, 0);
  t.tinted = { key, canvas };
  return canvas;
}

/** A wall of the floor under the floor (drawTerrain), CSS px: its dash and
 *  the gap after it, the dashes' width and the width of the dark casing
 *  under them, which keeps them clear on low and high floor alike. */
const UNDER_DASH: readonly [number, number] = [6, 4];
const UNDER_WIDTH = 2;
const UNDER_CASING = 4;

/** Draw a terrain: its relief tinted in `style`, then its contour lines,
 *  the treads of its stairs, its edges and the walls of the floor under the
 *  floor, then its outer edge. `ctx`'s transform maps world units to the
 *  canvas, and `unit` is one world unit in CSS px, so lines keep their
 *  weight at any zoom. `opacity` scales it all. `clip` (world units,
 *  nonzero) keeps it to the area players can be in, and the outer edge then
 *  runs round what is left. `contours`, `treads`, `edges` and `under` are
 *  the lines' strengths, 0 to 1 (0.35, 0.5, 0.7 and as strong as the edges
 *  by default), and `outline` the outer edge's width, CSS px (1.6 by
 *  default, 0 none). */
export function drawTerrain(
  ctx: CanvasRenderingContext2D, t: Terrain, style: TerrainStyle,
  o: { unit: number; opacity?: number; clip?: Path2D | null; contours?: number; treads?: number; edges?: number; under?: number; outline?: number },
): void {
  const relief = tinted(t, style);
  layered(ctx, o.opacity ?? 1, c => {
    const { x, y, res, w, h } = t.data;
    c.save();
    if (o.clip) c.clip(o.clip, 'nonzero');
    if (relief) {
      c.save();
      c.imageSmoothingEnabled = true;
      c.imageSmoothingQuality = 'high';
      c.transform(res, 0, 0, -res, x, y);
      c.drawImage(relief, 0, 0, w, h);
      c.restore();
    }
    c.lineJoin = 'round';
    c.lineCap = 'round';
    const contours = o.contours ?? 0.35;
    if (contours > 0) {
      c.globalAlpha = contours;
      c.strokeStyle = style.contour;
      c.lineWidth = 0.75 / o.unit;
      c.stroke(t.contours);
    }
    // A riser of stairs as a fine crisp line across the flight, its ends
    // square so the flight's sides stay straight.
    const treads = o.treads ?? 0.5;
    if (treads > 0 && t.treads) {
      c.save();
      c.globalAlpha = treads;
      c.strokeStyle = style.edge;
      c.lineCap = 'butt';
      c.lineWidth = 0.75 / o.unit;
      c.stroke(t.treads);
      c.restore();
    }
    const edges = o.edges ?? 0.7;
    if (edges > 0) {
      c.globalAlpha = edges;
      c.strokeStyle = style.edge;
      c.lineWidth = 1 / o.unit;
      c.stroke(t.edges);
    }
    // A wall of the floor under the floor (a tunnel under the map, a
    // passage under a bridge) dashed over the rest, as a map draws what is
    // below: heavy dashes in the edges' colour, square, on a solid casing a
    // deep shade of the low floor.
    const under = o.under ?? edges;
    if (under > 0 && t.under) {
      c.save();
      c.lineCap = 'butt';
      c.globalAlpha = under * 0.85;
      c.strokeStyle = mix('#000000', style.low, 0.4);
      c.lineWidth = UNDER_CASING / o.unit;
      c.stroke(t.under);
      c.globalAlpha = under;
      c.strokeStyle = style.edge;
      c.lineWidth = UNDER_WIDTH / o.unit;
      c.setLineDash([UNDER_DASH[0] / o.unit, UNDER_DASH[1] / o.unit]);
      c.stroke(t.under);
      c.restore();
    }
    c.restore();
    const width = o.outline ?? 1.6;
    if (width > 0) {
      c.save();
      c.strokeStyle = style.outline;
      c.lineJoin = 'round';
      c.lineWidth = width / o.unit;
      if (o.clip) {
        // Round what is left: the footprint's edge inside the clip, and the
        // clip's edge inside the footprint.
        c.save();
        c.clip(o.clip, 'nonzero');
        c.stroke(t.outline);
        c.restore();
        c.clip(t.outline, 'evenodd');
        c.stroke(o.clip);
      } else {
        c.stroke(t.outline);
      }
      c.restore();
    }
  });
}
