// The bar a page opens with, the match page's and every other's: on the left
// two fixed lines from one edge, the title and under it one muted line (the
// lead in the text colour, then the facts, which hide on phones); on the
// right the page's summary cells and actions. Everything on the right stands
// MAST_H tall.

import { C, T, H, BAR, ICON } from './tokens.js';
import { el, barEl, ui, UI, skel, tag, TRUNCATE, type TagTone } from './dom.js';
import { spinner } from './icons.js';

/** The height of what stands in the masthead, CSS px. */
export const MAST_H = H.md + 4;

/** A control or tag at the masthead's height. */
export function atMastHeight<E extends HTMLElement>(e: E, square = false): E {
  e.style.height = `${MAST_H}px`;
  if (square) e.style.width = `${MAST_H}px`;
  return e;
}

/** A status tag at the masthead's height and the buttons' type size. */
export function mastTag(text: string, tone: TagTone, busy = false): HTMLSpanElement {
  const t = atMastHeight(tag(text, tone));
  t.style.padding = '0 8px';
  t.style.font = `500 ${T.sm}`;
  if (busy) t.prepend(spinner(ICON.sm));
  return t;
}

export interface Masthead {
  el: HTMLElement;
  /** The right side: summary cells and actions. */
  right: HTMLDivElement;
  setLead(text: string): void;
  setFacts(...facts: Node[]): void;
}

const LINE = `display:flex;align-items:center;gap:12px;height:16px;min-width:0;overflow:hidden;white-space:nowrap;` +
  `font:${T.xs};line-height:16px;color:${C.muted}`;

export function masthead(o: { title: string; lead?: string; leadIcon?: Node; facts?: Node[]; right?: Node[] }): Masthead {
  const title = el('h1',
    `margin:0;font:${T.title};color:${C.text};min-width:0;${TRUNCATE}`,
    o.title);
  title.title = o.title;
  const lead = el('span', `color:${C.text}`, o.lead ?? '');
  const head = o.leadIcon ? el('span', 'display:inline-flex;align-items:center;gap:4px', o.leadIcon, lead) : lead;
  const facts = ui(el('span', 'display:inline-flex;align-items:center;gap:12px', ...(o.facts ?? [])), UI.hide_sm);
  const left = el('div', 'display:flex;flex-direction:column;justify-content:center;gap:2px;min-width:0;flex:1 1 auto;overflow:hidden',
    title, el('div', LINE, head, facts));
  const right = el('div', 'display:flex;align-items:center;gap:8px;flex:none;margin-left:auto', ...(o.right ?? []));
  const m = barEl('div', 'bottom', left, right);
  m.style.cssText += `;height:${BAR.mast}px;flex:none;flex-wrap:nowrap;overflow:hidden`;
  return {
    el: m,
    right,
    setLead(text) { lead.textContent = text; },
    setFacts(...f) { facts.replaceChildren(...f); },
  };
}

/** The masthead's shape while its page loads. */
export function mastheadSkeleton(): HTMLElement {
  const m = barEl('div', 'bottom',
    el('div', 'display:flex;flex-direction:column;justify-content:center;gap:6px;flex:1 1 auto;min-width:0', skel(160, 14), skel(240, 10)),
    skel(120, MAST_H));
  m.style.cssText += `;height:${BAR.mast}px;flex:none;flex-wrap:nowrap;overflow:hidden`;
  return m;
}
