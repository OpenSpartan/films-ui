// Toggles, segmented controls, tabs, text inputs and the copy chip. All are
// built on button() geometry; hover lives in the stylesheet.

import { icons, tint } from './icons.js';
import { C, T, H, BAR, RADIUS, ICON } from './tokens.js';
import { el, btn, ui, UI, setActive, type Icon } from './dom.js';
import { buildButton, buttonCss, iconButton, type Size } from './button.js';
import { toast, copyWithToast } from './status.js';

/** A value shown whole (mono by default) with a copy button after it, for
 *  ids: the label is the button's name, not repeated before the value. */
export function copyValue(value: string, name: string, mono = true): HTMLSpanElement {
  const b = iconButton(icons.copy, `Copy the ${name}`, 'xs', 'ghost');
  b.addEventListener('click', e => {
    e.preventDefault();
    void copyWithToast(value);
  });
  return el('span', 'display:inline-flex;align-items:center;gap:4px;min-width:0;max-width:100%',
    el('span', `font:${mono ? T.mono : T.md};color:${C.text};overflow-wrap:anywhere;user-select:all`, value), b);
}

/** Label (text or icon) + truncated ID. Click copies the full value to the
 *  clipboard and briefly swaps the copy icon for a green check (a red X with
 *  a hint when the clipboard refuses). */
export function copyChip(label: string | SVGSVGElement, fullValue: string, short = 8, mono = false): HTMLButtonElement {
  const labelText = typeof label === 'string' ? label : (label.getAttribute('aria-label') ?? 'Value');
  let tag: Node;
  if (typeof label === 'string') {
    tag = el('span', `color:${C.muted}`, label);
  } else {
    label.style.color = C.text;
    tag = label;
  }
  const id = el('span', `color:${C.text}`, fullValue.slice(0, short));
  let ico = icons.copy(11);
  const b = btn(
    `display:inline-flex;align-items:center;gap:4px;padding:2px 4px;border:1px solid transparent;` +
    `border-radius:${RADIUS.none};background:none;color:${C.muted};font:${mono ? T.mono : T.sm};white-space:nowrap`,
    tag, id, ico);
  ui(b, UI.ctl);
  b.dataset.variant = 'ghost';
  const title = `${labelText}: ${fullValue}. Click to copy.`;
  b.title = title;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const show = (next: SVGSVGElement, ms: number): void => {
    b.replaceChild(next, ico);
    ico = next;
    if (timer !== undefined) clearTimeout(timer);
    timer = setTimeout(() => {
      const fresh = icons.copy(11);
      b.replaceChild(fresh, ico);
      ico = fresh;
      b.title = title;
      timer = undefined;
    }, ms);
  };
  b.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(fullValue);
      show(tint(icons.check, 11, C.ok), 1200);
      if (b.closest('[role=menu]')) toast('Copied', 'ok');
    } catch {
      b.title = 'Copy failed. Select the text and copy it.';
      show(tint(icons.x, 11, C.err), 2500);
    }
  });
  return b;
}

/** Make `b` flip on click. The state is read from aria-pressed each time, so
 *  `setPressed()` (button.ts) can change it from outside without firing. */
function armToggle(b: HTMLButtonElement, onChange: (on: boolean) => void): HTMLButtonElement {
  b.dataset.cmd = 'toggle';
  b.addEventListener('click', () => {
    const on = b.getAttribute('aria-pressed') !== 'true';
    setActive(b, on);
    onChange(on);
  });
  return b;
}

/** A toggle button: icon and label, pressed state in accent. Default size sm. */
export function toggle(
  icon: SVGSVGElement,
  label: string,
  initial: boolean,
  onChange: (on: boolean) => void,
  o?: { title?: string; size?: Size; variant?: 'tool' | 'secondary' | 'ghost' },
): HTMLButtonElement {
  return armToggle(buildButton({
    label, title: o?.title, size: o?.size ?? 'sm', variant: o?.variant ?? 'secondary', pressed: initial,
  }, icon) as HTMLButtonElement, onChange);
}

/** An icon-only toggle; `title` is its tooltip and accessible name. Default
 *  size sm, variant tool. */
export function iconToggle(
  icon: Icon,
  title: string,
  initial: boolean,
  onChange: (on: boolean) => void,
  o?: { size?: Size; variant?: 'tool' | 'secondary' | 'ghost' },
): HTMLButtonElement {
  const size = o?.size ?? 'sm';
  return armToggle(buildButton({ title, size, variant: o?.variant ?? 'tool', pressed: initial }, icon(ICON[size])) as HTMLButtonElement, onChange);
}

/** Segmented control: a joined radio group, exactly one option on, with
 *  roving tabindex and ArrowLeft/ArrowRight. `set()` changes the value
 *  without firing `onChange`. */
export function segmented<T extends string>(
  options: ReadonlyArray<{ value: T; label: string; icon?: SVGSVGElement; title?: string }>,
  initial: T,
  onChange: (v: T) => void,
  o?: { ariaLabel?: string; size?: Size; iconOnly?: boolean },
): HTMLDivElement & { set(v: T): void } {
  const size = o?.size ?? 'sm';
  const wrap = el('div', 'display:inline-flex;align-items:center;flex:none');
  wrap.setAttribute('role', 'radiogroup');
  if (o?.ariaLabel) wrap.setAttribute('aria-label', o.ariaLabel);
  let current = initial;
  const btns: HTMLButtonElement[] = [];
  const sync = (): void => {
    options.forEach((opt, i) => {
      const b = btns[i];
      if (!b) return;
      const on = opt.value === current;
      b.style.background = on ? C.accentBg : C.bg;
      b.style.borderColor = on ? C.accent : C.border;
      b.style.color = on ? C.link : C.muted;
      b.style.position = on ? 'relative' : '';
      b.style.zIndex = on ? '1' : '';
      b.setAttribute('aria-checked', String(on));
      b.tabIndex = on ? 0 : -1;
    });
  };
  const pick = (i: number, focus: boolean): void => {
    const opt = options[i];
    const b = btns[i];
    if (!opt || !b) return;
    if (focus) b.focus();
    if (opt.value === current) return;
    current = opt.value;
    sync();
    onChange(opt.value);
  };
  options.forEach((opt, i) => {
    const iconOnly = !!o?.iconOnly && !!opt.icon;
    const b = btn(buttonCss('secondary', size, iconOnly));
    ui(b, UI.ctl);
    b.dataset.size = size;
    if (opt.icon) b.appendChild(opt.icon);
    if (iconOnly) b.setAttribute('aria-label', opt.label);
    else b.append(opt.label);
    b.title = opt.title ?? opt.label;
    b.setAttribute('role', 'radio');
    if (i > 0) b.style.marginLeft = '-1px';
    b.addEventListener('click', () => pick(i, false));
    b.addEventListener('keydown', e => {
      const n = options.length;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); pick((i + 1) % n, true); }
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); pick((i - 1 + n) % n, true); }
    });
    btns.push(b);
    wrap.appendChild(b);
  });
  sync();
  return Object.assign(wrap, {
    set(v: T): void { current = v; sync(); },
  });
}

let tabSeq = 0;

/** Tabs: a tablist whose tabs show and hide their panels. `el` is the
 *  tablist only; the caller places the panels (anywhere) and tabs() wires
 *  role=tabpanel, aria-controls and hidden. `setCount` updates the muted
 *  number after a label ('Kills 37'). */
export function tabs<T extends string>(
  items: ReadonlyArray<{ value: T; label: string; icon?: SVGSVGElement; count?: number; panel: HTMLElement }>,
  initial: T,
  onChange?: (v: T) => void,
  o: { compact?: boolean } = {},
): { el: HTMLDivElement; set(v: T): void; setCount(v: T, n: number): void } {
  const seq = ++tabSeq;
  const list = el('div', `display:flex;align-items:stretch;border-bottom:1px solid ${C.line};flex:none`);
  list.setAttribute('role', 'tablist');
  let current = initial;
  const tabsEls: HTMLButtonElement[] = [];
  const counts: HTMLSpanElement[] = [];
  const labels: HTMLSpanElement[] = [];
  /** The tab's accessible name and tooltip: the label and the count. */
  const name = (i: number): string => {
    const it = items[i], c = counts[i]?.textContent;
    return it ? (c ? `${it.label}, ${c}` : it.label) : '';
  };
  const sync = (): void => {
    items.forEach((it, i) => {
      const t = tabsEls[i];
      if (!t) return;
      const on = it.value === current;
      if (o.compact) {
        // Compact: the selected tab takes the room it needs and shows its
        // label; the others are their icon and count.
        const l = labels[i];
        if (l) l.style.display = on ? '' : 'none';
        t.style.flex = on ? '1 0 auto' : '0 1 auto';
        t.title = on ? '' : name(i);
        t.setAttribute('aria-label', name(i));
      }
      t.style.color = on ? C.text : C.muted;
      t.style.borderBottomColor = on ? C.link : 'transparent';
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      it.panel.hidden = !on;
    });
  };
  const select = (i: number, focus: boolean): void => {
    const it = items[i];
    const t = tabsEls[i];
    if (!it || !t) return;
    if (focus) t.focus();
    if (it.value === current) return;
    current = it.value;
    sync();
    onChange?.(it.value);
  };
  items.forEach((it, i) => {
    const id = `tab-${seq}-${i}`;
    const t = btn(
      `flex:1 1 0;display:inline-flex;align-items:center;justify-content:center;gap:6px;height:${o.compact ? BAR.tabs : H.md}px;` +
      `min-width:0;padding:0 ${o.compact ? 10 : 12}px;margin-bottom:-1px;border:0;border-bottom:2px solid transparent;border-radius:${RADIUS.none};` +
      `background:none;font:${T.sm};white-space:nowrap;cursor:pointer`);
    t.id = id;
    t.setAttribute('role', 'tab');
    if (it.icon) { it.icon.style.flex = 'none'; t.appendChild(it.icon); }
    const l = el('span', 'overflow:hidden;text-overflow:ellipsis', it.label);
    t.appendChild(l);
    labels.push(l);
    const c = el('span', `font:${T.xs};color:${C.faint};font-variant-numeric:tabular-nums`);
    if (it.count !== undefined) c.textContent = String(it.count);
    t.appendChild(c);
    counts.push(c);
    const pid = `${id}-panel`;
    if (!it.panel.id) it.panel.id = pid;
    t.setAttribute('aria-controls', it.panel.id);
    it.panel.setAttribute('role', 'tabpanel');
    it.panel.setAttribute('aria-labelledby', id);
    t.addEventListener('click', () => select(i, false));
    t.addEventListener('keydown', e => {
      const n = items.length;
      if (e.key === 'ArrowRight') { e.preventDefault(); select((i + 1) % n, true); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); select((i - 1 + n) % n, true); }
      else if (e.key === 'Home') { e.preventDefault(); select(0, true); }
      else if (e.key === 'End') { e.preventDefault(); select(n - 1, true); }
    });
    tabsEls.push(t);
    list.appendChild(t);
  });
  sync();
  return {
    el: list,
    set(v: T): void { current = v; sync(); },
    setCount(v: T, n: number): void {
      const i = items.findIndex(it => it.value === v);
      const c = counts[i];
      if (c) c.textContent = String(n);
      sync();
    },
  };
}

/** Text field: H[size] tall, sharp, page background. Search fields get the
 *  search keyboard hint. Mobile keyboards don't capitalise or correct. */
export function textInput(o: { size?: Size; placeholder?: string; type?: 'text' | 'search'; ariaLabel: string; mono?: boolean }): HTMLInputElement {
  const size = o.size ?? 'md';
  const i = el('input',
    `height:${H[size]}px;padding:0 12px;min-width:0;border:1px solid ${C.border};border-radius:${RADIUS.none};` +
    `background:${C.bg};color:${C.text};cursor:text;font:${o.mono ? T.mono : size === 'xl' ? T.lg : T.md}`);
  ui(i, UI.ctl);
  i.dataset.size = size;
  i.type = o.type ?? 'text';
  if (o.placeholder) i.placeholder = o.placeholder;
  i.setAttribute('aria-label', o.ariaLabel);
  i.setAttribute('autocapitalize', 'off');
  i.setAttribute('autocorrect', 'off');
  i.spellcheck = false;
  if (o.type === 'search') i.setAttribute('enterkeyhint', 'search');
  return i;
}
