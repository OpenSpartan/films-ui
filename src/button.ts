// The one button factory. Every clickable command in the client is a
// button() (or an iconButton, a link, a buttonGroup of them). Hover and
// disabled looks come from the stylesheet through the `ctl`/`cmd`/`hover_bd`
// hooks and `data-variant`; nothing here wires mouse listeners.

import { C, T, H, ICON, RADIUS } from './tokens.js';
import { el, ui, setActive, setDisabled, UI, type Icon } from './dom.js';
import { icons, spinner } from './icons.js';

/** `inline` sits in a line of text and takes its font, colour and height. */
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'tool' | 'inline';
export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonOpts {
  /** Omitted: icon-only, and then `title` is required. */
  label?: string;
  /** Rendered at ICON[size]. */
  icon?: Icon;
  /** Default 'secondary'. */
  variant?: ButtonVariant;
  /** Default 'md'. */
  size?: Size;
  /** Tooltip, and the aria-label when icon-only. */
  title?: string;
  /** Makes it a toggle button (aria-pressed). The caller flips it with setPressed(). */
  pressed?: boolean;
  onClick?: (e: MouseEvent) => void;
  /** Renders an <a>. No click handler: the app's router routes it. */
  href?: string;
  /** target=_blank rel=noopener, with a trailing external-link icon. */
  external?: boolean;
  /** width:100% */
  full?: boolean;
}

const PAD: Record<Size, string> = { xs: '0 6px', sm: '0 8px', md: '0 12px', lg: '0 16px', xl: '0 24px' };

/** Resting look per variant: [background, border colour, text colour]. */
function rest(v: ButtonVariant): [string, string, string] {
  switch (v) {
    case 'primary': return [C.accentBg, C.accent, C.text];
    case 'ghost': return ['transparent', 'transparent', C.muted];
    case 'danger': return [C.bg, C.err, C.err];
    case 'tool': return ['transparent', 'transparent', C.muted];
    default: return [C.bg, C.border, C.text];
  }
}

/** The cssText for a button of this variant and size. Exported for the few
 *  controls (segments, select triggers) that build their own element. */
export function buttonCss(variant: ButtonVariant = 'secondary', size: Size = 'md', iconOnly = false): string {
  if (variant === 'inline') {
    return `display:inline-flex;align-items:center;gap:4px;flex:none;height:auto;padding:0;border:0;` +
      `background:none;color:inherit;font:inherit;white-space:nowrap;text-decoration:none;transition:color .1s`;
  }
  const [bg, bd, fg] = rest(variant);
  const h = H[size];
  return `display:inline-flex;align-items:center;justify-content:center;gap:6px;flex:none;` +
    `height:${h}px;${iconOnly ? `width:${h}px;padding:0` : `padding:${PAD[size]}`};` +
    `border:1px solid ${bd};border-radius:${RADIUS.none};background:${bg};color:${fg};` +
    `font:${size === 'xs' || size === 'sm' ? T.sm : size === 'xl' ? T.lg : T.md};white-space:nowrap;text-decoration:none;` +
    `transition:background .1s,border-color .1s,color .1s`;
}

/** Hooks and data attributes a control needs for the stylesheet. */
function hookUp(e: HTMLElement, variant: ButtonVariant, size: Size): void {
  ui(e, UI.ctl);
  if (variant === 'tool') ui(e, UI.cmd);
  if (variant === 'secondary') ui(e, UI.hover_bd);
  e.dataset.size = size;
  e.dataset.variant = variant;
}

/** Shared body of button(), toggle() and command(): builds the element with
 *  an optional pre-rendered lead icon. */
export function buildButton(o: ButtonOpts, lead?: SVGSVGElement): HTMLButtonElement | HTMLAnchorElement {
  const variant = o.variant ?? 'secondary';
  const size = o.size ?? 'md';
  const iconOnly = !o.label;
  const b: HTMLButtonElement | HTMLAnchorElement = o.href !== undefined ? el('a', '') : el('button', '');
  b.style.cssText = buttonCss(variant, size, iconOnly) + (o.full ? ';width:100%' : '');
  hookUp(b, variant, size);
  const ic = lead ?? o.icon?.(ICON[size]);
  if (ic) {
    ic.dataset.role = 'icon';
    if (variant === 'tool') ic.style.color = C.text;
    b.appendChild(ic);
  }
  if (o.label) {
    const l = el('span', 'min-width:0;overflow:hidden;text-overflow:ellipsis', o.label);
    l.dataset.role = 'label';
    b.appendChild(l);
  }
  if (o.title) {
    b.title = o.title;
    if (iconOnly) b.setAttribute('aria-label', o.title);
  }
  if (b instanceof HTMLAnchorElement) {
    b.href = o.href ?? '';
    if (o.external) {
      b.target = '_blank';
      b.rel = 'noopener';
      const x = icons.external(ICON[size] - 2);
      x.style.color = 'inherit';
      b.appendChild(x);
    }
  } else {
    b.type = 'button';
    if (o.onClick) b.addEventListener('click', o.onClick);
  }
  if (o.pressed !== undefined) setActive(b, o.pressed);
  return b;
}

export function button(o: ButtonOpts & { href?: undefined }): HTMLButtonElement;
export function button(o: ButtonOpts & { href: string }): HTMLAnchorElement;
export function button(o: ButtonOpts): HTMLButtonElement | HTMLAnchorElement {
  return buildButton(o);
}

/** Square icon-only button; `title` is its tooltip and accessible name. */
export function iconButton(icon: Icon, title: string, size: Size = 'md', variant: ButtonVariant = 'secondary'): HTMLButtonElement {
  return button({ icon, title, size, variant });
}

/** Set a toggle button's pressed look and aria-pressed (alias of setActive). */
export function setPressed(b: HTMLElement, on: boolean): void {
  setActive(b, on);
}

/** Joined row of buttons: borders collapse, the hovered or focused one is
 *  drawn on top (stylesheet). The caller sets `aria-label`. */
export function buttonGroup(...btns: HTMLElement[]): HTMLDivElement {
  const g = el('div', 'display:inline-flex;align-items:center;flex:none');
  g.setAttribute('role', 'group');
  btns.forEach((b, i) => {
    if (i > 0) b.style.marginLeft = '-1px';
    g.appendChild(b);
  });
  return g;
}

/** Run `work` with the button busy: its icon becomes a spinner, the label
 *  optionally `busyLabel` (no ellipsis), disabled, width locked so nothing
 *  moves. Everything is restored in `finally`. */
export async function busy(b: HTMLButtonElement, work: () => Promise<void>, busyLabel?: string): Promise<void> {
  const minWidth = b.style.minWidth;
  b.style.minWidth = `${b.offsetWidth}px`;
  const ds = b.dataset.size;
  const size = ds === 'xs' || ds === 'sm' || ds === 'md' || ds === 'lg' ? ICON[ds] : ICON.md;
  const ic = b.querySelector<SVGSVGElement>('svg[data-role=icon]') ?? b.querySelector<SVGSVGElement>('svg');
  const spin = spinner(ic ? Number(ic.getAttribute('width')) || size : size);
  if (ic) ic.replaceWith(spin); else b.prepend(spin);
  const lbl = b.querySelector<HTMLElement>('[data-role=label]');
  const text = lbl?.textContent ?? null;
  if (lbl && busyLabel) lbl.textContent = busyLabel;
  const wasDisabled = b.disabled;
  setDisabled(b, true);
  b.setAttribute('aria-busy', 'true');
  try {
    await work();
  } finally {
    if (ic) spin.replaceWith(ic); else spin.remove();
    if (lbl && text !== null) lbl.textContent = text;
    setDisabled(b, wasDisabled);
    b.removeAttribute('aria-busy');
    b.style.minWidth = minWidth;
  }
}

/** A correct <a>: link-coloured (or muted), external ones open a new tab and
 *  carry the external-link icon. No click handler: in-app links are routed
 *  by the app's router on document.body. */
export function link(text: string, href: string, o?: { external?: boolean; tone?: 'link' | 'muted'; mono?: boolean }): HTMLAnchorElement {
  const a = el('a',
    `display:inline-flex;align-items:center;gap:4px;text-decoration:none;` +
    `color:${o?.tone === 'muted' ? C.muted : C.link};${o?.mono ? `font:${T.mono}` : ''}`,
    text);
  a.href = href;
  if (o?.external) {
    a.target = '_blank';
    a.rel = 'noopener';
    a.appendChild(icons.external(11));
  }
  return a;
}
