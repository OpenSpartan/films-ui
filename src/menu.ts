// Menus and floating panels: menu (action, radio or check), dropdown (a
// menu under its trigger, a bottom sheet on phones), select, popover,
// rich tooltip and the bottom sheet itself. Raised panels, sharp corners.

import { C, T, H, ICON, RADIUS, alpha } from './tokens.js';
import { el, btn, ui, UI, CAPS, TRUNCATE } from './dom.js';
import { icons } from './icons.js';
import { buildButton, iconButton, type Size } from './button.js';

export interface MenuItem<T = string> {
  value: T;
  label: string;
  icon?: SVGSVGElement;
  hint?: string;
  checked?: boolean;
  disabled?: boolean;
  /** Items with the same group follow each other under a CAPS label. */
  group?: string;
  /** Tooltip: the longer explanation behind a short label. */
  title?: string;
}

/** Fired (bubbling) by a menu when it wants its container closed: after an
 *  action or radio pick, and on Escape. */
export const MENU_CLOSE = 'menu-close';

/** A floating panel's surface: raised, a control's border, sharp, a shadow. */
export const PANEL =
  `background:${C.raised};border:1px solid ${C.border};border-radius:${RADIUS.none};` +
  `box-shadow:0 8px 24px ${alpha(C.bg, 0.53)};color:${C.text};font:${T.md}`;

const PHONE = '(max-width:639px)';

function checkBox(on: boolean): HTMLSpanElement {
  const box = el('span',
    `display:inline-flex;align-items:center;justify-content:center;width:12px;height:12px;flex:none;` +
    `border:1px solid ${on ? C.accent : C.border};background:${on ? C.accent : 'transparent'};color:${C.text}`);
  if (on) box.appendChild(icons.check(10));
  return box;
}

function checkMark(on: boolean): HTMLSpanElement {
  const m = el('span', `display:inline-flex;width:12px;flex:none;color:${C.link}`);
  if (on) m.appendChild(icons.check(ICON.sm));
  return m;
}

/** The row of buttons that closes a menu ('Show all'). */
export function menuFooter(...kids: Node[]): HTMLDivElement {
  return el('div', `display:flex;gap:6px;padding:8px 12px;border-top:1px solid ${C.line}`, ...kids);
}

/** A menu panel. Arrow keys, Home and End move, Enter and Space pick,
 *  Escape asks the container to close, a letter jumps to the next item
 *  starting with it. Check mode toggles in place; action and radio picks
 *  fire `onPick` then ask to close. `footer` goes in a menuFooter() under the
 *  items. `embedded`: no frame of its own, inside a larger panel. */
export function menu<T>(
  items: ReadonlyArray<MenuItem<T>>,
  o: { mode: 'action' | 'radio' | 'check'; onPick(v: T, checked: boolean): void; header?: Node; footer?: Node; embedded?: boolean },
): HTMLDivElement {
  const m = el('div', `${PANEL};display:flex;flex-direction:column;padding:4px 0;min-width:180px;max-height:70vh;overflow:auto` +
    (o.embedded ? ';border:0;box-shadow:none;max-height:none' : ''));
  m.setAttribute('role', 'menu');
  if (o.header) m.appendChild(el('div', `padding:6px 12px 8px;border-bottom:1px solid ${C.line};margin-bottom:4px`, o.header));
  const state = items.map(it => !!it.checked);
  const marks = items.some(it => it.checked !== undefined) || o.mode !== 'action';
  const rows: HTMLButtonElement[] = [];
  let group: string | undefined;
  const role = o.mode === 'check' ? 'menuitemcheckbox' : o.mode === 'radio' ? 'menuitemradio' : 'menuitem';

  const paint = (i: number): void => {
    const r = rows[i];
    if (!r) return;
    const on = state[i] ?? false;
    if (o.mode !== 'action') r.setAttribute('aria-checked', String(on));
    const lead = r.firstElementChild;
    if (marks && lead) lead.replaceWith(o.mode === 'check' ? checkBox(on) : checkMark(on));
  };

  items.forEach((it, i) => {
    if (it.group !== group) {
      if (i > 0) m.appendChild(el('div', `height:1px;background:${C.line};margin:4px 0`));
      if (it.group) m.appendChild(el('div', `${CAPS};padding:6px 12px 2px`, it.group));
      group = it.group;
    }
    const r = btn(
      `display:flex;align-items:center;gap:8px;width:100%;min-height:${H.md}px;padding:0 12px;border:0;` +
      `border-radius:${RADIUS.none};background:none;color:${C.text};font:${T.md};text-align:left;cursor:pointer`);
    ui(r, UI.menuitem);
    r.setAttribute('role', role);
    r.tabIndex = -1;
    r.appendChild(marks ? el('span', 'width:12px;flex:none') : el('span', 'display:none'));
    if (it.icon) {
      it.icon.style.flex = 'none';
      r.appendChild(it.icon);
    }
    r.appendChild(el('span', 'display:flex;align-items:baseline;flex:1;min-width:0',
      el('span', `flex:1;min-width:0;${TRUNCATE}`, it.label),
      ...(it.hint ? [el('span', `font:${T.xs};color:${C.muted};margin-left:12px;white-space:nowrap`, it.hint)] : [])));
    if (it.title) r.title = it.title;
    if (it.disabled) {
      r.disabled = true;
      r.style.opacity = '0.5';
      r.style.cursor = 'default';
    }
    r.addEventListener('click', () => {
      if (o.mode === 'check') {
        state[i] = !state[i];
        paint(i);
        o.onPick(it.value, state[i] ?? false);
        return;
      }
      if (o.mode === 'radio') {
        state.forEach((_, j) => { state[j] = j === i; paint(j); });
      }
      o.onPick(it.value, true);
      m.dispatchEvent(new CustomEvent(MENU_CLOSE, { bubbles: true }));
    });
    rows.push(r);
    m.appendChild(r);
    paint(i);
  });
  if (o.footer) {
    // The panel's own 4px padding is taken back, so the footer's is the one.
    const f = menuFooter(o.footer);
    f.style.margin = '4px 0 -4px';
    m.appendChild(f);
  }

  const enabled = (): HTMLButtonElement[] => rows.filter(r => !r.disabled);
  const move = (d: number | 'first' | 'last'): void => {
    const list = enabled();
    if (!list.length) return;
    const at = list.indexOf(document.activeElement as HTMLButtonElement);
    const next = d === 'first' ? 0 : d === 'last' ? list.length - 1
      : at < 0 ? (d > 0 ? 0 : list.length - 1) : (at + d + list.length) % list.length;
    list[next]?.focus();
  };
  m.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
    else if (e.key === 'Home') { e.preventDefault(); move('first'); }
    else if (e.key === 'End') { e.preventDefault(); move('last'); }
    else if (e.key === 'Escape') { e.preventDefault(); m.dispatchEvent(new CustomEvent(MENU_CLOSE, { bubbles: true })); }
    else if (e.key.length === 1 && /\S/.test(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const list = enabled();
      const at = list.indexOf(document.activeElement as HTMLButtonElement);
      const k = e.key.toLowerCase();
      for (let s = 1; s <= list.length; s++) {
        const r = list[(at + s) % list.length];
        if (r && (r.textContent ?? '').trim().toLowerCase().startsWith(k)) { r.focus(); break; }
      }
    }
  });
  return m;
}

/** Place a fixed panel under (or above) `anchor`, clamped to the viewport. */
function place(panel: HTMLElement, anchor: HTMLElement, align: 'start' | 'end', placement: 'below' | 'above' | 'auto'): void {
  const r = anchor.getBoundingClientRect();
  const pw = panel.offsetWidth, ph = panel.offsetHeight;
  const vw = document.documentElement.clientWidth, vh = window.innerHeight;
  let left = align === 'end' ? r.right - pw : r.left;
  left = Math.max(8, Math.min(left, vw - pw - 8));
  const below = r.bottom + 2, above = r.top - ph - 2;
  const top = placement === 'above' ? above
    : placement === 'below' ? below
    : below + ph > vh - 8 && above >= 8 ? above : below;
  panel.style.left = `${left}px`;
  panel.style.top = `${Math.max(8, Math.min(top, vh - ph - 8))}px`;
}

/** Close `panel` on a pointerdown outside it (and outside `keep`), on
 *  Escape and on a menu's close request. Returns the unbinding function. */
function dismissOn(panel: HTMLElement, keep: HTMLElement | null, close: () => void): () => void {
  const down = (e: PointerEvent): void => {
    const t = e.target as Node | null;
    if (t && (panel.contains(t) || keep?.contains(t))) return;
    close();
  };
  const key = (e: KeyboardEvent): void => { if (e.key === 'Escape') close(); };
  const req = (): void => close();
  document.addEventListener('pointerdown', down, true);
  document.addEventListener('keydown', key);
  panel.addEventListener(MENU_CLOSE, req);
  return () => {
    document.removeEventListener('pointerdown', down, true);
    document.removeEventListener('keydown', key);
    panel.removeEventListener(MENU_CLOSE, req);
  };
}

/** Open what `build()` returns under `trigger` on click (a bottom sheet
 *  below 640px); clicking the trigger again closes it. The trigger gets
 *  aria-haspopup, aria-expanded and a caret icon (unless it already has one,
 *  as a split command's caret does, or `caret` is false). `build` returns its
 *  own surface: a menu(), or a PANEL for anything else. */
export function dropdown<T = unknown>(
  trigger: HTMLButtonElement,
  build: () => HTMLElement,
  o?: { align?: 'start' | 'end'; width?: number; caret?: boolean },
): { open(): void; close(): void; refresh(): void } {
  trigger.setAttribute('aria-haspopup', 'menu');
  trigger.setAttribute('aria-expanded', 'false');
  if (o?.caret !== false && !trigger.querySelector('[data-role=caret]')) {
    const c = icons.caret(10);
    c.dataset.role = 'caret';
    c.style.flex = 'none';
    trigger.appendChild(c);
  }
  let panel: HTMLElement | null = null;
  let sh: ReturnType<typeof sheet> | null = null;
  let unbind: (() => void) | null = null;

  const close = (): void => {
    unbind?.(); unbind = null;
    overlays.delete(close);
    if (sh) { const s = sh; sh = null; s.close(); }
    if (panel) { panel.remove(); panel = null; }
    trigger.setAttribute('aria-expanded', 'false');
  };
  const focusFirst = (root: HTMLElement): void => {
    root.querySelector<HTMLElement>('[role^=menuitem]:not(:disabled)')?.focus();
  };
  const open = (): void => {
    if (panel || sh) return;
    overlays.add(close);
    const content = build();
    trigger.setAttribute('aria-expanded', 'true');
    if (matchMedia(PHONE).matches) {
      const s = sheet({ title: trigger.getAttribute('aria-label') ?? trigger.textContent?.trim() ?? '', content, snap: 'half' });
      sh = s;
      s.el.addEventListener(MENU_CLOSE, close);
      s.onClose(() => { if (sh === s) { sh = null; close(); } });
      s.open('half');
      focusFirst(s.el);
      return;
    }
    const p = el('div', `position:fixed;z-index:50;${o?.width ? `width:${o.width}px` : 'min-width:180px'}`, content);
    panel = p;
    document.body.appendChild(p);
    place(p, trigger, o?.align ?? 'start', 'auto');
    unbind = dismissOn(p, trigger, () => { close(); });
    p.addEventListener(MENU_CLOSE, () => trigger.focus());
    focusFirst(p);
  };
  trigger.addEventListener('click', () => { if (panel || sh) close(); else open(); });
  trigger.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown' && !panel && !sh) { e.preventDefault(); open(); }
  });
  return {
    open,
    close,
    refresh(): void {
      const content = build();
      if (panel) {
        panel.replaceChildren(content);
        place(panel, trigger, o?.align ?? 'start', 'auto');
      } else if (sh) {
        sh.setContent(content);
      }
    },
  };
}

/** A radio dropdown whose trigger shows the current label, optionally after
 *  a muted lead ('Source: Movement'). `set()` changes it without firing. */
export function select<T extends string>(
  options: ReadonlyArray<{ value: T; label: string; title?: string }>,
  value: T,
  onChange: (v: T) => void,
  o?: { size?: Size; label?: string; ariaLabel: string },
): HTMLButtonElement & { set(v: T): void } {
  let current = value;
  const b = buildButton({ size: o?.size ?? 'md', variant: 'secondary', label: ' ' }) as HTMLButtonElement;
  const text = b.querySelector<HTMLElement>('[data-role=label]');
  // Every option's label sits in one grid cell, only the current one
  // visible, so the trigger is always as wide as the longest option and
  // never resizes when the value changes (the ribbon's preset turning
  // Custom would otherwise shift every command after it).
  const cells = options.map(x => {
    const c = el('span', 'grid-area:1/1;visibility:hidden;min-width:0;overflow:hidden;text-overflow:ellipsis', x.label);
    c.setAttribute('aria-hidden', 'true');
    return c;
  });
  const kids: Node[] = [];
  if (o?.label) kids.push(el('span', `color:${C.muted}`, `${o.label}: `));
  kids.push(el('span', 'display:inline-grid;grid-template-columns:minmax(0,auto);min-width:0;max-width:100%;text-align:left;vertical-align:top', ...cells));
  text?.replaceChildren(...kids);
  const paint = (): void => {
    const opt = options.find(x => x.value === current);
    options.forEach((x, i) => { const c = cells[i]; if (c) c.style.visibility = x.value === current ? 'visible' : 'hidden'; });
    b.title = opt?.title ?? '';
    if (o?.ariaLabel) b.setAttribute('aria-label', opt ? `${o.ariaLabel}, ${opt.label}` : o.ariaLabel);
  };
  paint();
  dropdown(b, () => menu(
    options.map(x => ({ value: x.value, label: x.label, checked: x.value === current })),
    {
      mode: 'radio',
      onPick: v => {
        if (v === current) return;
        current = v;
        paint();
        onChange(v);
      },
    }));
  return Object.assign(b, { set(v: T): void { current = v; paint(); } });
}

/** Show `content` in a raised panel next to `anchor`; closes on an outside
 *  pointerdown or Escape. `width` caps it (320 px by default); `flush`
 *  drops the padding, for content laid out in its own bands, and scrolls
 *  it when it's taller than the window. */
export function popover(
  anchor: HTMLElement, content: HTMLElement,
  o?: { placement?: 'below' | 'above' | 'auto'; width?: number; flush?: boolean },
): { close(): void } {
  const p = el('div',
    `${PANEL};position:fixed;z-index:50;padding:${o?.flush ? 0 : 8}px;max-width:min(${o?.width ?? 320}px,calc(100vw - 16px))` +
    (o?.flush ? ';max-height:calc(100vh - 16px);overflow-y:auto' : ''), content);
  p.setAttribute('role', 'dialog');
  document.body.appendChild(p);
  place(p, anchor, 'start', o?.placement ?? 'auto');
  let unbind: (() => void) | null = null;
  const close = (): void => {
    unbind?.(); unbind = null;
    overlays.delete(close);
    p.remove();
  };
  overlays.add(close);
  unbind = dismissOn(p, anchor, close);
  return { close };
}

let tip: HTMLDivElement | undefined;
let tipSeq = 0;

/** A plain string is the native title (free, fine on desktop). A function
 *  is a rich tooltip: a raised box after 400ms of hover or focus, hidden on
 *  leave or blur, never on touch (its content must be reachable by tap). */
export function tooltip(target: HTMLElement, text: string | (() => string | Node)): void {
  if (typeof text === 'string') { target.title = text; return; }
  let timer: ReturnType<typeof setTimeout> | undefined;
  const id = `tip-${++tipSeq}`;
  const hide = (): void => {
    if (timer !== undefined) { clearTimeout(timer); timer = undefined; }
    if (tip && tip.dataset.owner === id) { tip.remove(); tip.dataset.owner = ''; }
    target.removeAttribute('aria-describedby');
  };
  const show = (): void => {
    if (!target.isConnected) return;
    if (!tip) {
      tip = el('div',
        `position:fixed;z-index:70;background:${C.raised};border:1px solid ${C.border};border-radius:${RADIUS.none};` +
        `padding:6px 8px;font:${T.sm};color:${C.text};max-width:280px;pointer-events:none`);
      tip.setAttribute('role', 'tooltip');
    }
    const t = tip;
    t.id = id;
    t.dataset.owner = id;
    const c = text();
    t.replaceChildren(c);
    document.body.appendChild(t);
    place(t, target, 'start', 'auto');
    target.setAttribute('aria-describedby', id);
  };
  const later = (): void => {
    if (timer !== undefined) clearTimeout(timer);
    timer = setTimeout(() => { timer = undefined; show(); }, 400);
  };
  target.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') later(); });
  target.addEventListener('pointerleave', hide);
  target.addEventListener('focus', () => { if (matchMedia('(hover:hover)').matches) later(); });
  target.addEventListener('blur', hide);
  target.addEventListener('pointerdown', hide);
}

let card: HTMLDivElement | undefined;

/** A raised panel of details beside `target` after the pointer rests on it
 *  for `delay` ms: a richer tooltip, built when shown. It opens to the
 *  target's left when there is room (the sidebar's rows sit at the right
 *  edge), else under it; it ignores the pointer, and closes when the pointer
 *  leaves, presses or scrolls. Never on touch. */
export function hoverCard(target: HTMLElement, build: () => HTMLElement, delay = 400): void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const id = `card-${++tipSeq}`;
  const hide = (): void => {
    if (timer !== undefined) { clearTimeout(timer); timer = undefined; }
    if (card && card.dataset.owner === id) { card.remove(); card.dataset.owner = ''; }
    target.removeAttribute('aria-describedby');
    window.removeEventListener('wheel', hide, true);
  };
  const show = (): void => {
    if (!target.isConnected) return;
    card ??= el('div', `position:fixed;z-index:70;pointer-events:none;width:min(320px,calc(100vw - 16px))`);
    const c = card;
    c.setAttribute('role', 'tooltip');
    c.id = id;
    c.dataset.owner = id;
    c.replaceChildren(build());
    document.body.appendChild(c);
    const r = target.getBoundingClientRect();
    const pw = c.offsetWidth, ph = c.offsetHeight, vh = window.innerHeight;
    if (r.left - pw - 8 >= 8) {
      c.style.left = `${r.left - pw - 8}px`;
      c.style.top = `${Math.max(8, Math.min(r.top, vh - ph - 8))}px`;
    } else place(c, target, 'end', 'auto');
    target.setAttribute('aria-describedby', id);
    window.addEventListener('wheel', hide, true);
  };
  const later = (): void => {
    if (timer !== undefined) clearTimeout(timer);
    timer = setTimeout(() => { timer = undefined; show(); }, delay);
  };
  target.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') later(); });
  target.addEventListener('pointerleave', hide);
  target.addEventListener('focus', () => { if (matchMedia('(hover:hover)').matches) later(); });
  target.addEventListener('blur', hide);
  target.addEventListener('pointerdown', hide);
}

export type SheetSize = 'peek' | 'half' | 'full';

/** Every open overlay's close: what a navigation dismisses. */
const overlays = new Set<() => void>();
/** The open modal sheet: only one at a time. */
let modalSheet: (() => void) | null = null;

/** Close every sheet, menu, popover and tooltip. Overlays attach to the body,
 *  outside any page, so the router calls this on each navigation. */
export function closeOverlays(): void {
  for (const close of [...overlays]) close();
}

/** A bottom sheet: fixed, full width, raised, with a handle strip that
 *  cycles peek, half and full on tap and snaps to the nearest on drag.
 *  `open()` attaches it to the body. `peek` is what the peek state shows
 *  (else the title).
 *
 *  A modal sheet (the default) has a Close button and a scrim, so a tap away
 *  closes it and never reaches the page; opening one closes the last. With
 *  `persistent` it stays docked: Close and the scrim go, a tap away only
 *  collapses it to its peek, and the page owns closing it. */
export function sheet(o: { title: string; content: HTMLElement; snap?: SheetSize; peek?: HTMLElement; persistent?: boolean }): {
  el: HTMLDivElement;
  open(s?: SheetSize): void;
  close(): void;
  /** Replace the scrolling content. */
  setContent(c: HTMLElement): void;
  /** Called after the sheet closes (Escape, scrim, or close()). */
  onClose(fn: () => void): void;
} {
  const ORDER: SheetSize[] = ['peek', 'half', 'full'];
  const PEEK = 44;
  let size: SheetSize = o.snap ?? 'half';
  const closers: (() => void)[] = [];

  const bar = el('span', `display:block;width:32px;height:4px;background:${C.dim}`);
  const handle = btn(
    `display:flex;align-items:center;justify-content:center;width:100%;height:20px;padding:0;border:0;` +
    `background:none;cursor:grab;touch-action:none;flex:none`, bar);
  handle.setAttribute('aria-label', `${o.title}. Resize`);
  const headText = el('div', 'flex:1;min-width:0', o.peek ?? o.title);
  const head = el('div',
    `display:flex;align-items:center;gap:8px;min-height:24px;padding:0 12px 4px;font:${T.h2};color:${C.text};flex:none`,
    headText);
  if (!o.persistent) {
    const x = iconButton(icons.x, 'Close', 'sm', 'ghost');
    x.addEventListener('click', () => close());
    head.appendChild(x);
  }
  const body = el('div', 'flex:1;min-height:0;overflow:auto;overscroll-behavior:contain', o.content);
  const panel = el('div',
    `position:fixed;left:0;right:0;bottom:0;z-index:${o.persistent ? 40 : 42};display:flex;flex-direction:column;` +
    `background:${C.raised};border-top:1px solid ${C.border};border-radius:${RADIUS.none};` +
    `padding-bottom:env(safe-area-inset-bottom);transition:height .18s ease-out`,
    handle, head, body);
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', o.title);
  const scrim = el('div', `position:fixed;inset:0;z-index:${o.persistent ? 39 : 41};background:${C.bgAlpha}`);
  scrim.addEventListener('click', () => { if (o.persistent) apply('peek'); else close(); });

  const px = (s: SheetSize): number =>
    s === 'peek' ? PEEK : s === 'half' ? window.innerHeight * 0.5 : window.innerHeight - 56;
  const apply = (s: SheetSize): void => {
    size = s;
    panel.style.height = s === 'peek' ? `${PEEK}px` : s === 'half' ? '50vh' : 'calc(100vh - 56px)';
    panel.style.height = s === 'peek' ? `${PEEK}px` : s === 'half' ? '50dvh' : 'calc(100dvh - 56px)';
    body.style.display = s === 'peek' ? 'none' : '';
    headText.replaceChildren(s === 'peek' && o.peek ? o.peek : o.title);
    if (s !== 'peek') { if (!scrim.isConnected) panel.before(scrim); } else scrim.remove();
  };
  const key = (e: KeyboardEvent): void => { if (e.key === 'Escape') close(); };

  // Tap cycles; a drag of more than 4px snaps to the nearest size.
  let startY = 0, startH = 0, dragging = false, moved = false;
  handle.addEventListener('pointerdown', e => {
    dragging = true; moved = false;
    startY = e.clientY; startH = panel.offsetHeight;
    handle.setPointerCapture(e.pointerId);
    panel.style.transition = 'none';
  });
  handle.addEventListener('pointermove', e => {
    if (!dragging) return;
    const dy = e.clientY - startY;
    if (Math.abs(dy) > 4) moved = true;
    if (moved) panel.style.height = `${Math.max(PEEK, Math.min(window.innerHeight - 56, startH - dy))}px`;
  });
  const end = (): void => {
    if (!dragging) return;
    dragging = false;
    panel.style.transition = 'height .18s ease-out';
    if (!moved) {
      apply(ORDER[(ORDER.indexOf(size) + 1) % ORDER.length] ?? 'half');
      return;
    }
    const h = panel.offsetHeight;
    let best: SheetSize = 'peek';
    for (const s of ORDER) if (Math.abs(px(s) - h) < Math.abs(px(best) - h)) best = s;
    apply(best);
  };
  handle.addEventListener('pointerup', end);
  handle.addEventListener('pointercancel', end);

  function close(): void {
    if (!panel.isConnected) return;
    panel.remove();
    scrim.remove();
    document.removeEventListener('keydown', key);
    overlays.delete(close);
    if (modalSheet === close) modalSheet = null;
    for (const f of closers) f();
  }

  return {
    el: panel,
    open(s?: SheetSize): void {
      if (!panel.isConnected) {
        if (!o.persistent) {
          modalSheet?.();
          modalSheet = close;
          overlays.add(close);
        }
        document.body.appendChild(panel);
        document.addEventListener('keydown', key);
      }
      apply(s ?? size);
    },
    close,
    setContent(c: HTMLElement): void { body.replaceChildren(c); },
    onClose(fn: () => void): void { closers.push(fn); },
  };
}
