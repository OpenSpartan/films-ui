// Low-level DOM helpers. Everything is a thin wrapper over `el()` plus a
// token-derived cssText constant. No behavior: callers wire their own
// event listeners on the returned element. Hover, focus and breakpoints come
// from the injected stylesheet (styles.ts) through `ui()` hooks.

import { C, T, H, S, BAR as BAR_H, RADIUS, alpha } from './tokens.js';
import { relParts, fmtDateTimeFull } from './format.js';

export type Icon = (size?: number) => SVGSVGElement;

/** createElement + style.cssText + append in one call. Strings in `kids`
 *  become text nodes (mirrors native `Element.append`). */
export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K, css: string, ...kids: (Node | string)[]
): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  if (css) e.style.cssText = css;
  if (kids.length) e.append(...kids);
  return e;
}

/** `<button type=button>` with css + children. Does NOT take onClick: half
 *  the handlers in the codebase reference the button itself, so callers wire
 *  `.addEventListener` after. */
export function btn(css: string, ...kids: (Node | string)[]): HTMLButtonElement {
  const b = el('button', css, ...kids);
  b.type = 'button';
  return b;
}

/** Horizontal flex row. `gap` comes from the S scale. Extras (flex-wrap,
 *  margin-left:auto, border-left) go on the returned element. */
export function row(gap: number, ...kids: (Node | string)[]): HTMLDivElement {
  return el('div', `display:flex;align-items:center;gap:${gap}px`, ...kids);
}

/** Vertical flex stack. */
export function col(gap: number, ...kids: (Node | string)[]): HTMLDivElement {
  return el('div', `display:flex;flex-direction:column;gap:${gap}px`, ...kids);
}

const BAR = (edge: 'top' | 'bottom'): string =>
  `display:flex;align-items:center;gap:12px;padding:6px 16px;font:${T.sm};` +
  `border-${edge}:1px solid ${C.line}`;

/** A chrome strip (toolbar, legend, timeline, sub-header) as `tag`: a div
 *  or a landmark (header, footer, nav). `edge` picks the hairline side.
 *  Padding 6px 16px so stacked bars share the page gutter. */
export function barEl<K extends 'header' | 'footer' | 'div' | 'nav'>(
  tag: K, edge: 'top' | 'bottom', ...kids: (Node | string)[]
): HTMLElementTagNameMap[K] {
  return el(tag, BAR(edge), ...kids);
}

// ── Stylesheet hooks ──────────────────────────────────────────────────────

/** Hook names the injected stylesheet styles. Pass them to `ui()`. */
export const UI = {
  ctl: 'ctl',           // a control: disabled look, touch min-height (with data-size)
  cmd: 'cmd',           // flat command: border and fill on hover only
  row: 'row',           // table or list row: hover fill, positions the row link
  rowlink: 'rowlink',   // the anchor that stretches over its row
  above: 'above',       // interactive content lifted over the row link
  hide_sm: 'hide_sm',   // hidden below 640
  hide_md: 'hide_md',   // hidden below 960
  show_sm: 'show_sm',   // shown only below 640
  stack_sm: 'stack_sm', // a flex row that stacks below 640
  side_sm: 'side_sm',   // a side panel that goes under its stage, full width, below 640
  scroll_x: 'scroll_x', // horizontal scroll with a thin scrollbar
  cards_sm: 'cards_sm', // a table wrapper whose rows become cards below 640
  grid2_lg: 'grid2_lg', // two equal columns at 960 and up
  hover_bg: 'hover_bg', // surface fill on hover
  hover_bd: 'hover_bd', // muted border on hover
  kv: 'kv',             // a key-value grid whose keys stack below 640
  table: 'table',       // a data table: its last row draws no bottom rule
  menuitem: 'menuitem', // a menu row: surface fill on hover
  num_sm: 'num_sm',     // a stat value that drops to 15px below 640
} as const;
export type UiHook = typeof UI[keyof typeof UI];

/** Append stylesheet hooks to `data-ui`. Returns `e` for inline composition. */
export function ui<E extends HTMLElement>(e: E, ...hooks: UiHook[]): E {
  const have = new Set((e.dataset.ui ?? '').split(' ').filter(Boolean));
  for (const h of hooks) have.add(h);
  e.dataset.ui = [...have].join(' ');
  return e;
}

/** Tabular figures for number columns and readouts. */
export const NUM = 'font-variant-numeric:tabular-nums';

/** Small-caps muted caption: group captions, table headers. */
export const CAPS =
  `font:${T.cap};color:${C.muted};text-transform:uppercase;letter-spacing:.06em`;

/** One line, cut with an ellipsis. The element needs a width or min-width:0. */
export const TRUNCATE = 'overflow:hidden;text-overflow:ellipsis;white-space:nowrap';

/** A flex child that takes the free room, pushing what follows to the far edge. */
export const SPACER = 'flex:1';

/** A panel's strip of controls under its tabs (the feed's filters, the Scores
 *  tab's bar). */
export const STRIP = `display:flex;align-items:center;gap:${S[3]}px;height:${BAR_H.strip}px;padding:0 ${S[5]}px;flex:none;border-bottom:1px solid ${C.line}`;

/** Drops everything a <button> brings of its own, for a button that wears the
 *  look of what it wraps (a sort heading, the masthead's score). The element's
 *  own styles go after it. */
export const BTN_RESET =
  'padding:0;border:0;background:none;color:inherit;font:inherit;letter-spacing:inherit;' +
  'text-transform:inherit;text-align:inherit;cursor:pointer';

/** Visually hidden but read by screen readers. */
export const SR_ONLY =
  'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;' +
  'clip:rect(0,0,0,0);white-space:nowrap;border:0';

// ── Atoms ─────────────────────────────────────────────────────────────────

/** Icon+text atom with bright-icon/muted-text contrast baked in. Pass an
 *  `Icon` factory to render at default size with `C.text` applied; pass a
 *  pre-built `Node` (legend swatch, mapKind() output) to use it as-is. */
export function chip(icon: Icon | Node, text: string | number, title?: string): HTMLSpanElement {
  const span = el('span',
    `display:inline-flex;align-items:center;gap:4px;color:${C.muted};white-space:nowrap`);
  if (title) span.title = title;
  let ic: Node;
  if (typeof icon === 'function') {
    ic = icon();
    (ic as SVGSVGElement).style.color = C.text;
  } else {
    // Pre-rendered: apply bright-icon contrast unless caller already tinted it
    // (mapKind, statusIcon). Non-SVG leads (legend swatch) pass through.
    if (icon instanceof SVGSVGElement && !icon.style.color) icon.style.color = C.text;
    ic = icon;
  }
  span.append(ic, document.createTextNode(String(text)));
  return span;
}

/** Square colour sample (player, team, legend). */
export function swatch(color: string, size = 8): HTMLSpanElement {
  return el('span',
    `display:inline-block;width:${size}px;height:${size}px;flex:none;background:${color};border-radius:${RADIUS.none}`);
}

export type TagTone = 'ok' | 'err' | 'warn' | 'info' | 'muted' | 'accent';

/** A count as a state and its value, the tag's frame around a caps label
 *  and the number in the tone: 'SET 16', 'MISSING 0'. A zero reads muted. */
export function countTag(label: string, n: number, tone: TagTone = 'muted'): HTMLSpanElement {
  const c = n === 0 || tone === 'muted' ? C.muted : tone === 'ok' ? C.ok : tone === 'err' ? C.err : tone === 'warn' ? C.warn : C.link;
  const t = el('span',
    `display:inline-flex;align-items:center;gap:6px;height:${H.xs}px;padding:0 6px;` +
    `background:${n && tone !== 'muted' ? alpha(c, 0.12) : C.surface};border:1px solid ${n && tone !== 'muted' ? alpha(c, 0.5) : C.border};` +
    `border-radius:${RADIUS.none};white-space:nowrap;flex:none`,
    el('span', `font:${T.cap};color:${C.muted};text-transform:uppercase;letter-spacing:.06em`, label),
    el('span', `font:600 ${T.xs};color:${n ? (tone === 'muted' ? C.text : c) : C.muted};${NUM}`, String(n)));
  t.title = `${label} ${n}`;
  return t;
}

/** How long ago (or until): the amount in the text colour, 'ago' or 'in'
 *  muted, the full local date and time with the time zone as its tooltip. */
export function ago(iso: string): HTMLSpanElement {
  const r = relParts(iso);
  const s = el('span', `color:${C.muted};white-space:nowrap`);
  if (!r) return s;
  const amount = el('span', `color:${C.text};${NUM}`, r.span);
  s.append(...(r.dir === 'future' ? ['in ', amount] : r.dir === 'past' ? [amount, ' ago'] : [amount]));
  s.title = fmtDateTimeFull(iso);
  return s;
}

/** Small status label: 20px, sharp, a tinted fill with a half-alpha border.
 *  Sentence case (only the Beta tag is uppercase, by its text). `small` is
 *  16px with tabular figures, a muted one only outlined, for a number after a
 *  name. `color` overrides the text colour (a feed row's fade, var(--fg2)). */
export function tag(text: string, tone: TagTone = 'muted', icon?: Icon, o?: { small?: boolean; color?: string }): HTMLSpanElement {
  const small = !!o?.small;
  let fg: string, bg: string, bd: string;
  if (tone === 'muted') { fg = C.muted; bg = small ? 'transparent' : C.surface; bd = small ? C.line : C.border; } else {
    const c = tone === 'ok' ? C.ok : tone === 'err' ? C.err : tone === 'warn' ? C.warn
      : tone === 'accent' ? C.accent : C.link;
    fg = tone === 'accent' ? C.link : c;
    bg = alpha(c, 0.12);
    bd = alpha(c, 0.5);
  }
  const t = el('span',
    `display:inline-flex;align-items:center;gap:4px;height:${small ? 16 : H.xs}px;padding:0 ${small ? 4 : 6}px;` +
    `font:${small ? `${T.xs};${NUM}` : `500 ${T.xs}`};color:${o?.color ?? fg};background:${bg};border:1px solid ${bd};` +
    `border-radius:${RADIUS.none};white-space:nowrap;flex:none`);
  if (icon) t.appendChild(icon(11));
  t.append(text);
  return t;
}

/** An error code or other opaque identifier in a tag, mono. */
export function codeTag(code: string): HTMLElement {
  const t = tag(code, 'err');
  t.style.font = T.mono;
  return t;
}

/** The mark after a bot's name. */
export const botTag = (): HTMLSpanElement => el('span', `font:${T.xs};color:${C.muted};flex:none`, 'Bot');

/** One thing used or earned: its icon, its name and how many. */
export function itemChip(icon: Node, name: string, n: number): HTMLElement {
  const box = el('span',
    `display:inline-flex;align-items:center;gap:6px;height:${H.sm}px;max-width:100%;padding:0 8px;` +
    `border:1px solid ${C.line};background:${C.bg};white-space:nowrap`,
    icon, el('span', `color:${C.text}`, name), el('span', `color:${C.muted};${NUM}`, n.toLocaleString()));
  box.title = `${name}, ${n.toLocaleString()}`;
  return box;
}

/** Loading-skeleton block sized to the content it stands in for, so the
 *  swap-in is layout-stable. `w` is px or any CSS length ('60%'). */
export const skel = (w: number | string, h = 12): HTMLDivElement => {
  const s = el('div',
    `width:${typeof w === 'number' ? `${w}px` : w};height:${h}px;max-width:100%;background:${C.surface};` +
    `border-radius:${RADIUS.none};animation:pulse 1.1s ease-in-out infinite alternate`);
  s.dataset.anim = 'pulse';
  s.setAttribute('aria-hidden', 'true');
  return s;
};

/** Accent-on / neutral-off state for toggles, plus `aria-pressed`. Buttons
 *  made by button() with the tool or ghost variant rest transparent;
 *  everything else rests on the page background. */
export function setActive(e: HTMLElement, on: boolean): void {
  const flat = e.dataset.variant === 'tool' || e.dataset.variant === 'ghost';
  e.style.background = on ? C.accentBg : flat ? 'transparent' : C.bg;
  e.style.borderColor = on ? C.accent : flat ? 'transparent' : C.border;
  e.style.color = on ? C.text : C.muted;
  e.setAttribute('aria-pressed', String(on));
}

/** Disable a button. Controls with the `ctl` hook get their look from the
 *  stylesheet; older skinned buttons (inline cursor) get it inline. */
export function setDisabled(b: HTMLButtonElement, on: boolean): void {
  b.disabled = on;
  if (on) b.setAttribute('aria-disabled', 'true'); else b.removeAttribute('aria-disabled');
  if ((b.dataset.ui ?? '').split(' ').includes(UI.ctl)) return;
  b.style.opacity = on ? '0.5' : '';
  b.style.cursor = on ? 'default' : '';
}
