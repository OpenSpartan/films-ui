// The match page's command bar: captioned groups of flat tool commands,
// split commands (a toggle plus its options menu) and drop commands (a menu
// with a badge). It picks its own mode from its width and folds the
// rightmost groups into a trailing More menu when they don't fit.

import { C, T, H, ICON } from './tokens.js';
import { el, btn, CAPS, type Icon } from './dom.js';
import { icons } from './icons.js';
import { button, buildButton } from './button.js';
import { toggle } from './controls.js';
import { menu, dropdown, popover, sheet, MENU_CLOSE, type MenuItem } from './menu.js';

export type RibbonMode = 'full' | 'compact' | 'icons' | 'sheet';

/** Menu builders of split and drop commands, and drop badges, by element. */
const menus = new WeakMap<HTMLElement, () => HTMLElement>();
const badges = new WeakMap<HTMLElement, () => string | null>();

/** A ribbon command at H.sm: icon (14), label, long tooltip. With
 *  `onChange` it is a toggle (flip it from outside with setPressed()), else
 *  a plain action. `variant` defaults to tool. `iconOnly` drops the visible
 *  label at every width; the tooltip and accessible name stay. */
export function command(o: {
  icon: Icon; label: string; title: string; pressed?: boolean;
  onChange?: (on: boolean) => void; onClick?: () => void; key: string;
  variant?: 'tool' | 'ghost'; iconOnly?: boolean;
}): HTMLButtonElement {
  const ic = o.icon(ICON.md);
  const variant = o.variant ?? 'tool';
  let b: HTMLButtonElement;
  if (o.onChange) {
    b = toggle(ic, o.label, o.pressed ?? false, o.onChange, { title: o.title, size: 'sm', variant });
  } else {
    b = buildButton({ label: o.label, title: o.title, size: 'sm', variant, pressed: o.pressed }, ic) as HTMLButtonElement;
    b.dataset.cmd = 'action';
    const click = o.onClick;
    if (click) b.addEventListener('click', () => click());
  }
  b.style.padding = '0 6px';
  b.dataset.key = o.key;
  b.setAttribute('aria-label', o.label);
  if (o.iconOnly) b.querySelector('[data-role=label]')?.remove();
  return b;
}

/** A command joined to a 14px caret that opens its options menu. */
export function splitCommand(o: { main: HTMLButtonElement; menu: () => HTMLElement; title: string }): HTMLDivElement {
  const car = icons.caret(10);
  const caret = buildButton({ title: o.title, size: 'sm', variant: 'tool' }, car) as HTMLButtonElement;
  car.dataset.role = 'caret';
  caret.style.width = '14px';
  caret.style.marginLeft = '-1px';
  dropdown(caret, o.menu);
  const w = el('div', 'display:inline-flex;align-items:center;flex:none', o.main, caret);
  w.setAttribute('role', 'group');
  w.dataset.cmd = 'split';
  w.dataset.key = o.main.dataset.key ?? '';
  menus.set(w, o.menu);
  return w;
}

/** A badge pinned to a command's top right corner, out of the flow: it
 *  never changes the command's width, so selecting a filter doesn't shift
 *  the commands after it. Short values (counts) are printed in it; longer
 *  ones (a team name, '30 s') leave a plain marker and go to the tooltip
 *  and the accessible name. The command needs position:relative. */
function badgeSlot(): HTMLSpanElement {
  const s = el('span',
    `position:absolute;top:1px;right:1px;min-width:6px;height:11px;padding:0 2px;box-sizing:border-box;` +
    `display:none;align-items:center;justify-content:center;background:${C.accent};color:${C.bg};` +
    `font:${T.badge};pointer-events:none`);
  s.dataset.role = 'badge';
  s.setAttribute('aria-hidden', 'true');
  return s;
}

function showBadge(slot: HTMLElement, v: string | null): void {
  slot.textContent = v && v.length <= 2 ? v : '';
  slot.style.minWidth = slot.textContent ? '11px' : '6px';
  slot.style.height = slot.textContent ? '11px' : '6px';
  slot.style.display = v ? 'flex' : 'none';
}

function paintBadge(b: HTMLElement): void {
  const f = badges.get(b);
  const slot = b.querySelector<HTMLElement>('[data-role=badge]');
  if (!f || !slot) return;
  const v = f();
  showBadge(slot, v);
  const label = b.dataset.label ?? '';
  const title = b.dataset.title ?? '';
  b.setAttribute('aria-label', v ? `${label}, ${v}` : label);
  b.title = v ? `${title} Now: ${v}.` : title;
}

/** A command that opens a menu, with an optional accent badge ('Players 3')
 *  while a filter is active. Call the ribbon's refresh() after the state
 *  behind a badge changes. */
export function dropCommand(o: {
  icon: Icon; label: string; title: string; menu: () => HTMLElement; badge?: () => string | null; key: string;
}): HTMLButtonElement {
  const b = buildButton({ label: o.label, title: o.title, size: 'sm', variant: 'tool' }, o.icon(ICON.md)) as HTMLButtonElement;
  b.style.padding = '0 6px';
  b.style.position = 'relative';
  b.dataset.key = o.key;
  b.dataset.cmd = 'drop';
  b.dataset.label = o.label;
  b.dataset.title = o.title;
  b.setAttribute('aria-label', o.label);
  b.appendChild(badgeSlot());
  menus.set(b, o.menu);
  if (o.badge) {
    badges.set(b, o.badge);
    paintBadge(b);
  }
  dropdown(b, o.menu);
  b.addEventListener('click', () => paintBadge(b));
  return b;
}

/** A captioned group of commands: a full-height column whose right edge is
 *  the separator, so every visible group, the last one too, is closed by a
 *  hairline from the ribbon's top edge to its bottom edge. `data-key` is the
 *  caption in lower case ('view', 'filter', ...). To hide a whole group, set
 *  its style.display to 'none'; the overflow rule leaves such groups alone. */
export function ribbonGroup(caption: string, ...cmds: HTMLElement[]): HTMLDivElement {
  const row = el('div', 'display:flex;align-items:center;gap:2px', ...cmds);
  row.dataset.role = 'cmds';
  const cap = el('div',
    `font:${T.xs};text-transform:uppercase;letter-spacing:.06em;color:${C.faint};height:12px;line-height:12px;white-space:nowrap`,
    caption);
  cap.dataset.role = 'caption';
  const g = el('div',
    'position:relative;display:inline-flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;' +
    `align-self:stretch;padding:3px 8px;flex:none;border-right:1px solid ${C.line}`,
    row, cap);
  g.dataset.key = caption.toLowerCase();
  g.dataset.caption = caption;
  g.setAttribute('role', 'group');
  g.setAttribute('aria-label', caption);
  return g;
}

/** The commands of a group, in order. */
function commandsOf(g: HTMLElement): HTMLElement[] {
  const r = g.querySelector<HTMLElement>('[data-role=cmds]');
  return r ? [...r.children].filter((c): c is HTMLElement => c instanceof HTMLElement && !!c.dataset.cmd) : [];
}

function mainOf(c: HTMLElement): HTMLElement {
  return c.dataset.cmd === 'split' ? (c.firstElementChild as HTMLElement | null) ?? c : c;
}

function labelOf(c: HTMLElement): string {
  const m = mainOf(c);
  return m.getAttribute('aria-label') ?? m.querySelector('[data-role=label]')?.textContent ?? '';
}

function iconOf(c: HTMLElement): SVGSVGElement | undefined {
  const s = mainOf(c).querySelector('svg[data-role=icon]');
  return s instanceof SVGSVGElement ? s.cloneNode(true) as SVGSVGElement : undefined;
}

/** The bar. Modes by its own width: full (captions) at 1180 and up, compact
 *  at 900, icons (toggles icon-only) at 640, and below that sheet: the
 *  groups give way to [Layers] [Filter] and `sheetSlot`, where the caller
 *  puts the preset select. `end` is the right-pinned slot holding the
 *  overflow More command. */
export function ribbon(...groups: HTMLElement[]): {
  el: HTMLDivElement;
  setMode(m: RibbonMode): void;
  end: HTMLDivElement;
  /** Fills the rest of the sheet-mode bar (the preset select). */
  sheetSlot: HTMLDivElement;
  /** Repaint badges and pressed states after outside changes. */
  refresh(): void;
} {
  // No vertical padding anywhere on the way down to the groups: their
  // border-right separators run the bar's full height.
  const wrap = el('div', 'display:flex;align-items:stretch;align-self:stretch;flex:1 1 auto;min-width:0;overflow:hidden;padding-left:8px');
  for (const g of groups) wrap.appendChild(g);

  // More: the label and a trailing caret, like any menu button. It stands in
  // a column built like a group (commands row over a caption-high spacer in
  // full mode), so it sits on the same line as the commands beside it.
  const more = button({ label: 'More', title: 'Commands that do not fit.', size: 'sm', variant: 'tool' });
  more.style.padding = '0 6px';
  // dropdown() adds the caret.
  dropdown(more, () => moreMenu());
  more.style.display = 'none';
  const moreSpacer = el('div', 'height:12px');
  const end = el('div',
    `display:none;flex-direction:column;align-items:center;justify-content:center;gap:2px;margin-left:auto;flex:none;` +
    `align-self:stretch;padding:3px 8px;border-left:1px solid ${C.line}`,
    el('div', 'display:flex;align-items:center', more), moreSpacer);

  const sheetSlot = el('div',
    `display:flex;align-items:center;flex:none;min-width:0;padding:3px 8px;border-right:1px solid ${C.line}`);
  const layersBtn = button({ icon: icons.layers, label: 'Layers', size: 'sm' });
  const filterBtn = button({ icon: icons.filter, label: 'Filter', size: 'sm' });
  const filterBadge = badgeSlot();
  filterBtn.style.position = 'relative';
  filterBtn.appendChild(filterBadge);
  const filterGroups = (): HTMLElement[] => groups.filter(g => g.dataset.key === 'filter' && g.style.display !== 'none');
  const layerGroups = (): HTMLElement[] => groups.filter(g => g.dataset.key !== 'filter' && g.style.display !== 'none');
  layersBtn.addEventListener('click', () => openList('Layers', layerGroups()));
  filterBtn.addEventListener('click', () => openList('Filter', filterGroups()));
  // Phone mode: [Layers] [Filter] | preset |, each closed by a full-height
  // hairline like the groups.
  const sheetCmds = el('div',
    `display:flex;align-items:center;gap:4px;flex:none;padding:3px 8px 3px 16px;border-right:1px solid ${C.line}`,
    layersBtn, filterBtn);
  const sheetBar = el('div', 'display:none;align-items:stretch;align-self:stretch;flex:1;min-width:0', sheetCmds, sheetSlot);

  const bar = el('div',
    `display:flex;align-items:stretch;min-height:${H.sm + 6}px;padding:0;background:${C.bg};` +
    `border-bottom:1px solid ${C.line};min-width:0;overflow:hidden;flex:none`,
    wrap, sheetBar, end);
  bar.setAttribute('role', 'toolbar');

  let mode: RibbonMode | null = null;

  const overflowing = (): boolean => wrap.scrollWidth > wrap.clientWidth + 1;
  const hiddenGroups = (): HTMLElement[] => groups.filter(g => g.dataset.overflow === '1');

  /** The overflow rule: hide the rightmost visible group (never VIEW) while
   *  the groups overflow, into More. Recomputed from scratch, so groups come
   *  back left to right as space returns. */
  function layout(): void {
    for (const g of hiddenGroups()) { delete g.dataset.overflow; g.style.display = 'inline-flex'; }
    more.style.display = 'none';
    end.style.display = 'none';
    if (mode === 'sheet' || !overflowing()) return;
    more.style.display = 'inline-flex';
    end.style.display = 'flex';
    for (let i = groups.length - 1; i > 0 && overflowing(); i--) {
      const g = groups[i];
      if (!g || g.dataset.key === 'view' || g.style.display === 'none') continue;
      g.dataset.overflow = '1';
      g.style.display = 'none';
    }
  }

  function applyMode(m: RibbonMode): void {
    mode = m;
    const sheetMode = m === 'sheet';
    wrap.style.display = sheetMode ? 'none' : 'flex';
    sheetBar.style.display = sheetMode ? 'flex' : 'none';
    sheetSlot.style.display = sheetSlot.childElementCount ? 'flex' : 'none';
    filterBtn.style.display = filterGroups().length ? '' : 'none';
    for (const g of groups) {
      const cap = g.querySelector<HTMLElement>('[data-role=caption]');
      if (cap) cap.style.display = m === 'full' ? '' : 'none';
      moreSpacer.style.display = m === 'full' ? '' : 'none';
      for (const c of commandsOf(g)) {
        const m0 = mainOf(c);
        const lbl = m0.querySelector<HTMLElement>('[data-role=label]');
        const iconOnly = m === 'icons' && (m0.dataset.cmd === 'toggle' || m0.dataset.cmd === 'action');
        if (lbl) lbl.style.display = iconOnly ? 'none' : '';
      }
    }
    refresh();
    layout();
  }

  function refresh(): void {
    let active = 0;
    for (const g of groups) for (const c of commandsOf(g)) {
      if (c.dataset.cmd === 'drop') {
        paintBadge(c);
        if (g.dataset.key === 'filter' && badges.get(c)?.()) active++;
      }
    }
    showBadge(filterBadge, active ? String(active) : null);
    filterBtn.setAttribute('aria-label', active ? `Filter, ${active} active` : 'Filter');
  }

  /** More: the hidden groups' commands, grouped by caption, pressed as a check. */
  function moreMenu(): HTMLElement {
    const targets: { c: HTMLElement; options: boolean }[] = [];
    const items: MenuItem<number>[] = [];
    for (const g of hiddenGroups()) {
      const caption = g.dataset.caption ?? '';
      for (const c of commandsOf(g)) {
        const m0 = mainOf(c);
        const pressed = m0.getAttribute('aria-pressed');
        items.push({
          value: targets.length, label: labelOf(c), icon: iconOf(c), group: caption,
          checked: pressed === null ? undefined : pressed === 'true',
        });
        targets.push({ c, options: false });
        if (c.dataset.cmd === 'split') {
          items.push({ value: targets.length, label: `${labelOf(c)} options`, group: caption });
          targets.push({ c, options: true });
        }
      }
    }
    return menu(items, {
      mode: 'action',
      onPick: i => {
        const t = targets[i];
        if (!t) return;
        const build = menus.get(t.c);
        if ((t.c.dataset.cmd === 'drop' || t.options) && build) {
          popover(more, build());
        } else {
          mainOf(t.c).click();
        }
      },
    });
  }

  /** Phone mode: every command of `gs` as a 44px row with its description. */
  function openList(title: string, gs: HTMLElement[]): void {
    const list = el('div', 'display:flex;flex-direction:column;padding:0 0 12px');
    const s = sheet({ title, content: list, snap: 'half' });
    for (const g of gs) {
      list.appendChild(el('div', `${CAPS};padding:10px 16px 4px`, g.dataset.caption ?? ''));
      for (const c of commandsOf(g)) {
        const m0 = mainOf(c);
        const r = btn(
          `display:flex;align-items:center;gap:12px;width:100%;min-height:44px;padding:4px 16px;border:0;` +
          `border-left:3px solid transparent;background:none;color:${C.text};font:${T.md};text-align:left;cursor:pointer`);
        const ic = iconOf(c);
        if (ic) { ic.setAttribute('width', String(ICON.lg)); ic.setAttribute('height', String(ICON.lg)); r.appendChild(ic); }
        r.appendChild(el('span', 'display:flex;flex-direction:column;gap:2px;min-width:0;flex:1',
          el('span', '', labelOf(c)),
          el('span', `font:${T.xs};color:${C.muted}`, m0.title)));
        const paint = (): void => {
          const p = m0.getAttribute('aria-pressed');
          if (p === null) return;
          r.setAttribute('aria-pressed', p);
          r.style.borderLeftColor = p === 'true' ? C.accent : 'transparent';
          r.style.background = p === 'true' ? C.accentBg : 'none';
        };
        paint();
        r.addEventListener('click', () => {
          if (c.dataset.cmd === 'drop') { s.close(); m0.click(); return; }
          m0.click();
          paint();
        });
        const row = el('div', `display:flex;align-items:stretch;border-bottom:1px solid ${C.line}`, r);
        const build = menus.get(c);
        if (c.dataset.cmd === 'split' && build) {
          const opt = button({ icon: icons.caret, title: `${labelOf(c)} options`, size: 'md', variant: 'ghost' });
          opt.style.height = 'auto';
          opt.style.width = `${H.lg}px`;
          // The options open in a sheet of their own: this row's sheet closes,
          // so it can't anchor a popover.
          opt.addEventListener('click', () => {
            s.close();
            const o = sheet({ title: `${labelOf(c)} options`, content: build(), snap: 'half' });
            o.el.addEventListener(MENU_CLOSE, () => o.close());
            o.open('half');
          });
          row.appendChild(opt);
        }
        list.appendChild(row);
      }
    }
    s.open('half');
  }

  const modeFor = (w: number): RibbonMode => w >= 1180 ? 'full' : w >= 900 ? 'compact' : w >= 640 ? 'icons' : 'sheet';
  if (typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(() => {
      const m = modeFor(bar.clientWidth);
      if (m !== mode) applyMode(m); else layout();
    }).observe(bar);
  } else {
    applyMode('compact');
  }

  return { el: bar, setMode: applyMode, end, sheetSlot, refresh };
}
