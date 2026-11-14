// Joined cells: the scoreboard's look, a row of cells a hairline apart. A
// team's cell is on a tint of its colour with a 3px rule of it on the left,
// the winner's brighter.

import { C, T, S, RADIUS, alpha } from './tokens.js';
import { el, ui, UI, NUM, CAPS } from './dom.js';

/** The row. `fill`: equal cells across the width (a card's score), else as
 *  wide as their content. `flush`: only a hairline above, for a row closing
 *  a frame that has its own border. */
export function cellRow(o: { height: number; fill?: boolean; flush?: boolean }, ...cells: HTMLElement[]): HTMLDivElement {
  return el('div',
    `${o.fill ? 'display:grid;grid-auto-flow:column;grid-auto-columns:minmax(0,1fr)' : 'display:inline-flex;flex:none'};` +
    `align-items:stretch;gap:1px;height:${o.height}px;background:${C.line};` +
    `${o.flush ? `border-top:1px solid ${C.line}` : `border:1px solid ${C.line}`};border-radius:${RADIUS.none};white-space:nowrap`,
    ...cells);
}

/** A cell on a tint of `color` (a hex colour; anything else, a CSS variable,
 *  rests on the surface), with its 3px rule. `bright` is the winner's. */
export function scoreCell(color: string, bright: boolean, ...kids: HTMLElement[]): HTMLSpanElement {
  const tint = alpha(color, bright ? 0.22 : 0.08);
  const fill = /^#[0-9a-f]{6}$/i.test(color) ? `linear-gradient(${tint},${tint}),${C.bg}` : C.surface;
  return el('span',
    `display:inline-flex;align-items:center;gap:${S[4]}px;min-width:0;padding:0 ${S[5]}px 0 ${S[5]}px;` +
    `background:${fill};box-shadow:inset 3px 0 0 ${color}`, ...kids);
}

/** A name, score and mark centred on one line, whatever their sizes. */
export const cellLine = (...kids: HTMLElement[]): HTMLSpanElement =>
  el('span', `display:inline-flex;align-items:center;gap:${S[4]}px;min-width:0`, ...kids);

/** How a team band is laid out: `height` (else as tall as its content), `py`
 *  its padding above and below, `right` its right padding, `gap` between its
 *  parts. */
export interface TeamBandLayout { height?: number; py?: number; right?: number; gap?: number }

/** A team band's styling, for a band that is another element (a button). */
export function teamBandCss(color: string, o: TeamBandLayout = {}): string {
  const py = o.py ?? 0;
  return `display:flex;align-items:center;gap:${o.gap ?? S[4]}px;min-width:0;` +
    `${o.height ? `height:${o.height}px;` : ''}padding:${py}px ${o.right ?? S[5]}px ${py}px ${S[5]}px;` +
    `background:${C.surface};box-shadow:inset 3px 0 0 ${color};color:${C.text}`;
}

/** A team band's name and optional score centred on one line, taking its room. */
export function teamBandLine(name: HTMLElement, score?: HTMLElement): HTMLSpanElement {
  const line = cellLine(name, ...(score ? [score] : []));
  line.style.flex = '1';
  return line;
}

/** The band that opens a team: a 3px rule in its colour on the surface, its
 *  emblem, name and score, and `end` at the far edge. */
export function teamBand(o: TeamBandLayout & { color: string; emblem?: Node; name: HTMLElement; score?: HTMLElement; end?: Node[] }): HTMLDivElement {
  return el('div', teamBandCss(o.color, o), ...(o.emblem ? [o.emblem] : []), teamBandLine(o.name, o.score), ...(o.end ?? []));
}

/** A score in a cell. */
export const cellValue = (v: number | string, bright: boolean): HTMLSpanElement =>
  el('span', `font:${T.score};${NUM};line-height:1;color:${bright ? C.text : C.muted}`, String(v));

/** A team's or player's name in a cell; hides on phones. */
export const cellName = (text: string, bright: boolean): HTMLSpanElement =>
  ui(el('span', `font:${T.sm};color:${bright ? C.text : C.muted};max-width:120px;overflow:hidden;text-overflow:ellipsis`, text), UI.hide_sm);

/** The winner's mark; hides on phones. */
export const cellWon = (): HTMLSpanElement => ui(el('span', `${CAPS};color:${C.ok}`, 'Won'), UI.hide_sm);
