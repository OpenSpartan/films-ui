// Page frames: the bordered section, its bands and the stat strip. Pages compose these and do not restyle them.

import { C, T, RADIUS, S } from './tokens.js';
import { el, ui, UI, NUM, CAPS, SPACER, TRUNCATE } from './dom.js';

/** A bordered block: a surface head (title, state, meta, actions) over a
 *  page-background body. `flush` drops the body padding for tables and KV
 *  grids that draw their own rules. `fill` is for a section that fills a
 *  dialog or panel: the panel draws the edge, the body scrolls under the head.
 *  Actions wrap under the title on phones. */
export function section(
  o: { title: string; state?: HTMLElement; meta?: (Node | string)[]; actions?: HTMLElement[]; id?: string; flush?: boolean; fill?: boolean },
  ...body: (Node | string)[]
): { el: HTMLElement; body: HTMLDivElement; head: HTMLDivElement } {
  const head = el('div',
    `display:flex;flex-wrap:wrap;align-items:center;column-gap:12px;row-gap:6px;min-height:48px;` +
    `padding:6px 12px;flex:none;background:${C.surface};border-bottom:1px solid ${C.line}`,
    el('h2', `margin:0;font:${T.h2};color:${C.text}`, o.title));
  if (o.state) head.appendChild(o.state);
  if (o.meta?.length) {
    const meta = el('div',
      `display:flex;flex-wrap:wrap;align-items:center;gap:8px;font:${T.sm};color:${C.muted};min-width:0`,
      ...o.meta);
    head.appendChild(meta);
  }
  if (o.actions?.length) {
    head.appendChild(el('div', SPACER));
    // Each action its own button, 8px apart, never joined.
    head.appendChild(el('div', 'display:flex;flex-wrap:wrap;align-items:center;gap:8px', ...o.actions));
  }
  const b = el('div', `padding:${o.flush ? 0 : S[5]}px;min-width:0${o.fill ? ';flex:1 1 auto;min-height:0;overflow-y:auto' : ''}`, ...body);
  const s = el('section',
    `background:${C.bg};border-radius:${RADIUS.none};min-width:0;` +
    (o.fill ? 'display:flex;flex-direction:column;flex:1 1 auto;min-height:0' : `border:1px solid ${C.line}`),
    head, b);
  if (o.id) s.id = o.id;
  return { el: s, body: b, head };
}

/** A page's column of sections under its masthead (Operator, Components):
 *  1200 px at most, centred, the gutter around it. */
export function pageColumn(...kids: Node[]): HTMLDivElement {
  return el('div',
    `display:flex;flex-direction:column;gap:${S[6]}px;max-width:1200px;margin:0 auto;padding:${S[6]}px ${S[6]}px ${S[8]}px;min-width:0`,
    ...kids);
}

/** A band of a panel or card: a caps caption over its content, a hairline
 *  above. The caption can carry a mark after it (`infoMark`). */
export function band(title: string | Array<Node | string>, ...kids: Node[]): HTMLElement {
  const h = el('h3', `display:flex;align-items:center;gap:${S[2]}px;margin:0;${CAPS}`, ...(typeof title === 'string' ? [title] : title));
  return el('section',
    `display:flex;flex-direction:column;gap:${S[4]}px;padding:${S[5]}px;border-top:1px solid ${C.line}`, h, ...kids);
}

/** The frame every card-like block on a page shares: surface fill, a 1px
 *  line border, sharp corners. */
export const FRAME = `background:${C.surface};border:1px solid ${C.line};border-radius:${RADIUS.none}`;

/** One bordered row of equal cells: the value (tabular) over a caps label. */
export function statStrip(cells: ReadonlyArray<{ value: string | Node; label: string; title?: string }>): HTMLDivElement {
  const strip = el('div',
    `display:grid;grid-template-columns:repeat(${Math.max(1, cells.length)},minmax(0,1fr));${FRAME}`);
  cells.forEach((c, i) => {
    const v = ui(el('div', `display:flex;align-items:center;gap:${S[4]}px;font:${T.num};color:${C.text};${NUM};${TRUNCATE}`, c.value), UI.num_sm);
    const cell = el('div',
      `display:flex;flex-direction:column;gap:${S[1]}px;padding:${S[5]}px;min-width:0;${i > 0 ? `border-left:1px solid ${C.line}` : ''}`,
      v, el('div', CAPS, c.label));
    if (c.title) cell.title = c.title;
    strip.appendChild(cell);
  });
  return strip;
}
