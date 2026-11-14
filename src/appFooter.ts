// The page footer: one bar of what the app says under its pages (a
// disclaimer, Feedback, its console). Pages append it last, inside the
// scroll area. `maxWidth` (px, gutters included) centres the content on a
// page's column, so its left edge lines up with the sections above it.

import { C, T, S } from './tokens.js';
import { el, barEl } from './dom.js';

/** A list page's frame: bars above and below a list that scrolls by itself,
 *  as on the match page. The app's footer goes last, closing it. */
export function pageFrame(...kids: Node[]): HTMLDivElement {
  return el('div', 'display:flex;flex-direction:column;height:100%;min-height:0', ...kids);
}

/** The flex column a pageFrame()'s list scrolls in. */
export const listHost = (...kids: Node[]): HTMLDivElement =>
  el('div', 'display:flex;flex-direction:column;flex:1 1 auto;min-height:0;min-width:0', ...kids);

/** The footer bar holding `kids`, in the small type. */
export function appFooter(kids: readonly Node[], maxWidth?: number): HTMLElement {
  const f = barEl('footer', 'top');
  f.style.cssText += `;flex:none;font:${T.xs};background:${C.bg}`;
  if (maxWidth === undefined) {
    f.append(...kids);
    f.style.cssText += ';flex-wrap:wrap;row-gap:4px';
    return f;
  }
  // The bar keeps its full-width rule; its content sits on the page column.
  f.style.cssText += ';padding-left:0;padding-right:0';
  f.appendChild(el('div',
    `display:flex;flex-wrap:wrap;align-items:center;column-gap:${S[5]}px;row-gap:${S[2]}px;` +
    `width:100%;max-width:${maxWidth}px;margin:0 auto;padding:0 ${S[6]}px`,
    ...kids));
  return f;
}
