// Map markers: one white-on-transparent atlas (markers.<hash>.png)
// and its index (markers.json: the atlas's file and each marker's cell by
// name), served by the app wherever it keeps them; films-ui ships no images.
// loadMarkers() fetches them once per page load; a missing or malformed
// index resolves to "no markers", and every caller then draws without them.
// Icons are tinted by drawing the cell into a canvas and filling over it
// with `source-in`, so the alpha keeps the shape and the colour is ours.

import { el } from './dom.js';

/** A rectangle of an atlas, image px. */
export interface IconCell { x: number; y: number; w: number; h: number; }

/** A tinted icon: a canvas at device resolution, `w`×`h` CSS px. */
export interface IconImage { canvas: HTMLCanvasElement; w: number; h: number; }

/** An image, or null when it fails to load. */
export const loadImage = (src: string): Promise<HTMLImageElement | null> => new Promise(resolve => {
  const image = new Image();
  image.onload = () => resolve(image);
  image.onerror = () => resolve(null);
  image.src = src;
});

/** `cell` of `image`, `h` CSS px tall, in `color`. */
export function paintIcon({ image, cell }: { image: HTMLImageElement; cell: IconCell }, h: number, color: string): IconImage {
  const dpr = window.devicePixelRatio || 1;
  const w = h * cell.w / cell.h;
  const canvas = el('canvas', `display:block;width:${w}px;height:${h}px`);
  canvas.width = Math.max(1, Math.round(w * dpr));
  canvas.height = Math.max(1, Math.round(h * dpr));
  const g = canvas.getContext('2d');
  if (g) {
    g.drawImage(image, cell.x, cell.y, cell.w, cell.h, 0, 0, canvas.width, canvas.height);
    g.globalCompositeOperation = 'source-in';
    g.fillStyle = color;
    g.fillRect(0, 0, canvas.width, canvas.height);
  }
  return { canvas, w, h };
}

/** The map markers, by name in markers.json. */
export type MarkerName =
  | 'zoneA' | 'zoneB' | 'zoneC' | 'zoneD' | 'zoneE' | 'zoneF'
  | 'flag' | 'hill' | 'skull' | 'facing' | 'selected' | 'followed' | 'contested';

interface MarkerIndex {
  schemaVersion: 1;
  atlas: string;
  icons: Record<string, IconCell>;
}

/** The loaded markers: the atlas and each marker's cell by name. */
export interface MarkerAtlas { image: HTMLImageElement; cells: Record<string, IconCell> }

let atlasPromise: Promise<MarkerAtlas | undefined> | undefined;
/** Set once the atlas has loaded, for synchronous canvas draws. */
let loaded: MarkerAtlas | undefined;

/** The markers from the index at `url` (markers.json; the atlas it names is
 *  beside it), fetched once: the first call's URL is the page's. Undefined
 *  when they're unavailable. Callers redraw once it resolves. */
export const loadMarkers = (url: string): Promise<MarkerAtlas | undefined> =>
  atlasPromise ??= fetch(url)
    .then(r => r.ok ? r.json() as Promise<MarkerIndex> : null)
    .then(async ix => {
      if (!ix || ix.schemaVersion !== 1 || !ix.icons || typeof ix.atlas !== 'string') return undefined;
      const image = await loadImage(`${url.slice(0, url.lastIndexOf('/') + 1)}${ix.atlas}`);
      return image ? loaded = { image, cells: ix.icons } : undefined;
    })
    .catch(() => undefined);

const markerCache = new Map<string, IconImage | null>();

/** The map marker `h` CSS px tall in `color`, or null until the atlas has
 *  loaded. Cached per marker, height and colour. */
export function markerImage(name: MarkerName, h: number, color: string): IconImage | null {
  const m = loaded;
  if (!m) return null;
  const key = `${name}|${h}|${color}|${window.devicePixelRatio || 1}`;
  let v = markerCache.get(key);
  if (v === undefined) {
    const cell = m.cells[name];
    v = cell ? paintIcon({ image: m.image, cell }, h, color) : null;
    markerCache.set(key, v);
  }
  return v;
}
