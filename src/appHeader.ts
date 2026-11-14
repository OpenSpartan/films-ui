// The app header: brand, Beta tag, breadcrumbs and, on the right, what the
// app puts there (its account, Feedback, its console). One 44px row that
// never wraps. The app names the brand and builds the right side; the
// header lays them out.

import { icons } from './icons.js';
import { C, T, ICON, BAR } from './tokens.js';
import { el, barEl, tag, ui, UI, TRUNCATE, type Icon } from './dom.js';
import { link } from './button.js';

export interface Crumb { label: string; href?: string; }

export interface AppHeaderOptions {
  /** The brand's name, never shortened. */
  name: string;
  /** Where the brand links. Default '/'. */
  href?: string;
  /** The brand link's accessible name. Default `${name} home`. */
  label?: string;
  /** The brand's icon. Default the film icon. */
  icon?: Icon;
  /** A Beta tag after the brand; it goes below 640. */
  beta?: boolean;
  /** The right side, built on mount, on setBreadcrumb() and on
   *  refreshAppHeader(). */
  right?: () => Node[];
}

let crumbHost: HTMLElement | undefined;
let rightHost: HTMLElement | undefined;
let rightSide: (() => Node[]) | undefined;

export function mountAppHeader(parent: HTMLElement, o: AppHeaderOptions): void {
  const hdr = barEl('header', 'bottom');
  hdr.style.cssText +=
    `;flex:none;height:${BAR.app}px;padding-top:0;padding-bottom:0;flex-wrap:nowrap;` +
    `white-space:nowrap;overflow:hidden;background:${C.bg}`;

  // The brand is never shortened. Below 640 the Beta tag goes.
  const brand = el('a',
    `display:inline-flex;align-items:center;gap:8px;flex:none;font:${T.h2};color:${C.text};text-decoration:none`,
    (o.icon ?? icons.film)(ICON.lg),
    el('span', '', o.name));
  brand.href = o.href ?? '/';
  brand.setAttribute('aria-label', o.label ?? `${o.name} home`);

  const kids: Node[] = [brand];
  if (o.beta) {
    const beta = ui(tag('Beta', 'accent'), UI.hide_sm);
    beta.style.textTransform = 'uppercase';
    kids.push(beta);
  }

  // The crumbs, their separators and the brand share one line box and one
  // gap (the header's 12px), so every '/' sits halfway between its neighbours.
  crumbHost = el('nav',
    `display:flex;align-items:center;gap:12px;flex:1 1 auto;min-width:0;overflow:hidden;` +
    `font:${T.sm};line-height:${LINE}px;color:${C.muted}`);
  crumbHost.setAttribute('aria-label', 'Breadcrumb');

  rightHost = el('div',
    `display:inline-flex;align-items:center;gap:12px;flex:none;margin-left:auto;font:${T.sm};color:${C.muted}`);
  rightSide = o.right;

  hdr.append(...kids, crumbHost, rightHost);
  parent.appendChild(hdr);
  refreshAppHeader();
}

/** Build the right side again, after what it shows has changed (a sign-in). */
export function refreshAppHeader(): void {
  const host = rightHost;
  if (!host) return;
  host.replaceChildren(...(rightSide?.() ?? []));
}

/** The crumbs' line height, CSS px. */
const LINE = 20;

/** Crumbs after the brand, each preceded by a '/', 12px either side. A trail
 *  shows only when it leads somewhere: a page with no parent to go back to
 *  passes none, and its own title is in the page. The last crumb takes the
 *  remaining width and ellipsizes. Below 640 the first is dropped when there
 *  is more than one. Pages call this on every route, so it also refreshes
 *  the right side. */
export function setBreadcrumb(crumbs: Crumb[]): void {
  refreshAppHeader();
  const host = crumbHost;
  if (!host) return;
  host.replaceChildren();
  crumbs.forEach((c, i) => {
    const last = i === crumbs.length - 1;
    const box = `font:${T.sm};line-height:${LINE}px;height:${LINE}px`;
    const sep = el('span', `${box};flex:none;color:${C.dim}`, '/');
    sep.setAttribute('aria-hidden', 'true');
    const body: HTMLElement = c.href
      ? link(c.label, c.href, { tone: 'muted' })
      : el('span', `color:${last ? C.text : C.muted}`, c.label);
    body.style.cssText += `;${box};` + (last
      ? `flex:1 1 auto;min-width:0;${TRUNCATE};display:block`
      : 'white-space:nowrap;flex:none;display:inline-flex;align-items:center');
    if (last) body.setAttribute('aria-current', 'page');
    if (i === 0 && crumbs.length > 1) {
      ui(sep, UI.hide_sm);
      ui(body, UI.hide_sm);
    }
    host.append(sep, body);
  });
}
