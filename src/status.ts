// Status atoms and blocks: square dots, state tags, inline notices, toasts,
// check lists, empty states and the processing panel. State is shown by
// colour and a left rule, never by shape.

import { C, T, ICON, RADIUS, ROW, S } from './tokens.js';
import { el, row, col, CAPS, NUM, type Icon } from './dom.js';
import { icons, spinner } from './icons.js';
import { link } from './button.js';
import { fmtRelative } from './format.js';
import { section } from './section.js';

export type DotTone = 'ok' | 'err' | 'warn' | 'muted' | 'accent';

const DOT: Record<DotTone, string> = {
  ok: C.ok, err: C.err, warn: C.warn, muted: C.faint, accent: C.link,
};

/** 8x8 square in the tone colour. */
export function statusDot(tone: DotTone): HTMLSpanElement {
  const d = el('span',
    `display:inline-block;width:8px;height:8px;flex:none;background:${DOT[tone]};border-radius:${RADIUS.none}`);
  d.setAttribute('aria-hidden', 'true');
  return d;
}

export type RunState = 'pass' | 'fail' | 'warn' | 'skip' | 'running' | 'queued' | 'cancelled' | 'idle';

const STATE: Record<RunState, { tone: DotTone; word: string }> = {
  pass: { tone: 'ok', word: 'Passed' },
  fail: { tone: 'err', word: 'Failed' },
  warn: { tone: 'warn', word: 'Warning' },
  skip: { tone: 'muted', word: 'Not tested' },
  running: { tone: 'accent', word: 'Running' },
  queued: { tone: 'accent', word: 'Queued' },
  cancelled: { tone: 'muted', word: 'Cancelled' },
  idle: { tone: 'muted', word: 'Idle' },
};

/** A dot (a spinner while running) and the state's word in text colour. */
export function stateTag(state: RunState, text?: string): HTMLSpanElement {
  const s = STATE[state];
  const lead = state === 'running' ? spinner(ICON.sm) : statusDot(s.tone);
  if (state === 'running') lead.style.color = C.link;
  return el('span',
    `display:inline-flex;align-items:center;gap:6px;white-space:nowrap;color:${C.text};font:${T.sm}`,
    lead, text ?? s.word);
}

// ── Notice ────────────────────────────────────────────────────────────────

export type NoticeTone = 'ok' | 'err' | 'warn' | 'busy' | 'info';

const NOTICE_COLOR: Record<NoticeTone, string> = {
  ok: C.ok, err: C.err, warn: C.warn, busy: C.link, info: C.link,
};

function noticeIcon(tone: NoticeTone): SVGSVGElement {
  if (tone === 'busy') return spinner(ICON.md);
  const ic = (tone === 'ok' ? icons.check : tone === 'err' ? icons.x : tone === 'warn' ? icons.alert : icons.info)(ICON.md);
  ic.style.color = NOTICE_COLOR[tone];
  return ic;
}

/** Inline status bar: a 3px rule in the tone colour, icon, title, muted
 *  detail and an optional action. Hidden while empty. */
export function notice(): {
  el: HTMLDivElement;
  set(tone: NoticeTone, title: string, detail?: Node | string, action?: HTMLElement): void;
  clear(): void;
} {
  const box = el('div',
    `display:none;align-items:center;flex-wrap:wrap;gap:8px;padding:8px 12px;background:${C.surface};` +
    `border-left:3px solid ${C.border};font:${T.md};color:${C.text}`);
  return {
    el: box,
    set(tone, title, detail, action) {
      box.style.display = 'flex';
      box.style.borderLeftColor = NOTICE_COLOR[tone];
      box.setAttribute('role', tone === 'err' ? 'alert' : 'status');
      const kids: Node[] = [noticeIcon(tone), el('span', 'font-weight:600', title)];
      if (detail !== undefined && detail !== '') {
        kids.push(el('span', `color:${C.muted};min-width:0`, detail));
      }
      if (action) {
        action.style.marginLeft = 'auto';
        kids.push(action);
      }
      box.replaceChildren(...kids);
    },
    clear() {
      box.style.display = 'none';
      box.removeAttribute('role');
      box.replaceChildren();
    },
  };
}

// ── Toast ─────────────────────────────────────────────────────────────────

let toastHost: HTMLDivElement | undefined;
let toastTimer: ReturnType<typeof setTimeout> | undefined;

/** One short message at a time, bottom right (bottom centre on phones),
 *  above the timeline. Announced politely. */
export function toast(text: string, tone: 'ok' | 'err' | 'info' = 'info', ms = 2500): void {
  if (!toastHost || !toastHost.isConnected) {
    toastHost = el('div', 'position:fixed;z-index:60;bottom:64px;pointer-events:none');
    toastHost.setAttribute('aria-live', 'polite');
    toastHost.setAttribute('role', 'status');
    document.body.appendChild(toastHost);
  }
  const host = toastHost;
  const phone = matchMedia('(max-width:639px)').matches;
  host.style.left = phone ? '16px' : 'auto';
  host.style.right = '16px';
  host.style.display = 'flex';
  host.style.justifyContent = phone ? 'center' : 'flex-end';
  const color = tone === 'ok' ? C.ok : tone === 'err' ? C.err : C.link;
  const box = el('div',
    `background:${C.raised};border:1px solid ${C.border};border-left:3px solid ${color};` +
    `border-radius:${RADIUS.none};padding:8px 12px;font:${T.sm};color:${C.text};` +
    `max-width:min(360px,calc(100vw - 32px));animation:fade-up .15s ease-out`, text);
  box.dataset.anim = 'fade-up';
  host.replaceChildren(box);
  if (toastTimer !== undefined) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { host.replaceChildren(); toastTimer = undefined; }, ms);
}

/** Copy `text`, saying so in a toast: `done` or, when the clipboard refuses,
 *  `failed`. */
export async function copyWithToast(text: string, done = 'Copied', failed = 'Copy failed. Select the text and copy it.'): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    toast(done, 'ok');
  } catch {
    toast(failed, 'err');
  }
}

/** A small info icon whose tooltip says what a value's caption can't. */
export function infoMark(text: string): HTMLSpanElement {
  const ic = icons.info(ICON.sm);
  ic.style.color = C.muted;
  const s = el('span', 'display:inline-flex;cursor:help', ic);
  s.title = text;
  s.setAttribute('aria-label', text);
  return s;
}

// ── Status list ───────────────────────────────────────────────────────────

export interface StatusItem {
  name: string;
  state: 'pass' | 'fail' | 'warn' | 'skip' | 'running';
  result: string;
  detail?: string;
  fix?: string;
  link?: { label: string; href: string };
  /** ISO time, shown relative. */
  at?: string;
}

const ITEM_TONE: Record<StatusItem['state'], DotTone> = {
  pass: 'ok', fail: 'err', warn: 'warn', skip: 'muted', running: 'accent',
};

/** A check list: state, name, result, detail and time per line; failing and
 *  warning items get a fix line under them. Lines wrap to two on phones. */
export function statusList(items: readonly StatusItem[], o?: { summary?: boolean }): HTMLDivElement {
  const list = el('div', `display:flex;flex-direction:column;font:${T.sm};color:${C.text}`);
  if (o?.summary) list.appendChild(summaryLine(items));
  for (const it of items) {
    const lead = it.state === 'running' ? spinner(ICON.sm) : statusDot(ITEM_TONE[it.state]);
    if (it.state === 'running') lead.style.color = C.link;
    const line = el('div',
      `display:flex;flex-wrap:wrap;align-items:center;column-gap:8px;row-gap:2px;` +
      `padding:6px 8px;border-bottom:1px solid ${C.line}`,
      el('span', 'flex:0 0 18px;display:inline-flex;align-items:center', lead),
      el('span', 'flex:0 1 200px;min-width:160px', it.name),
      el('span', `flex:0 0 auto;min-width:110px;color:${C.text};${NUM}`, it.result),
      el('span', `flex:1 1 220px;min-width:0;color:${C.muted}`, it.detail ?? ''),
    );
    line.setAttribute('role', 'listitem');
    if (it.at) {
      const when = el('span', `flex:none;margin-left:auto;color:${C.muted};${NUM}`, fmtRelative(it.at));
      when.title = new Date(it.at).toLocaleString();
      line.appendChild(when);
    }
    list.appendChild(line);
    if (it.fix && (it.state === 'fail' || it.state === 'warn')) {
      const fix = el('div',
        `display:flex;flex-wrap:wrap;align-items:baseline;gap:6px;margin-left:34px;padding:6px 8px;` +
        `background:${C.surface};border-left:3px solid ${it.state === 'fail' ? C.err : C.warn};` +
        `border-bottom:1px solid ${C.line}`,
        el('span', CAPS, 'Fix: '), el('span', `color:${C.text}`, it.fix));
      if (it.link) fix.appendChild(link(it.link.label, it.link.href, { external: true }));
      list.appendChild(fix);
    }
  }
  list.setAttribute('role', 'list');
  return list;
}

function summaryLine(items: readonly StatusItem[]): HTMLDivElement {
  let p = 0, f = 0, w = 0, s = 0;
  for (const it of items) {
    if (it.state === 'pass') p++;
    else if (it.state === 'fail') f++;
    else if (it.state === 'warn') w++;
    else if (it.state === 'skip') s++;
  }
  const part = (text: string, color: string): HTMLSpanElement => el('span', `color:${color}`, text);
  const kids: Node[] = [part(`Passed ${p} of ${items.length}.`, p === items.length ? C.ok : C.text)];
  if (f) kids.push(part(`${f} failed.`, C.err));
  if (w) kids.push(part(w === 1 ? '1 warning.' : `${w} warnings.`, C.warn));
  if (s) kids.push(part(`${s} not tested.`, C.muted));
  const r = row(S[3], ...kids);
  r.style.cssText += `;flex-wrap:wrap;font:${T.sm};margin-bottom:8px;${NUM}`;
  return r;
}

// ── Empty state, progress panel ───────────────────────────────────────────

/** Centred placeholder: a faint 24px icon, a title, muted body, an action. */
export function emptyState(o: { icon: Icon; title: string; body?: string; action?: HTMLElement }): HTMLDivElement {
  const ic = o.icon(ICON.xl);
  ic.style.color = C.faint;
  const c = col(S[3], ic, el('div', `font:${T.h2};color:${C.text}`, o.title));
  c.style.cssText += `;align-items:center;text-align:center;padding:32px 16px`;
  if (o.body) c.appendChild(el('div', `font:${T.md};color:${C.muted};max-width:360px`, o.body));
  if (o.action) {
    o.action.style.marginTop = '6px';
    c.appendChild(o.action);
  }
  return c;
}

/** A run in steps, framed like `section()`: the title (and an optional
 *  external link, the run log) over one row per step. Steps before `at` are
 *  done, `at` is running (or failed, with the error as its detail), the rest
 *  wait. `note` is one muted line under the steps. */
export function progressPanel(o: { title: string; steps: readonly string[] }): {
  el: HTMLElement;
  set(s: { at?: number; failed?: boolean; detail?: string; note?: string; link?: { label: string; href: string } }): void;
} {
  const linkSlot = el('div', 'display:flex;align-items:center');
  const rows = o.steps.map(name => {
    const lead = el('span', 'flex:0 0 16px;display:inline-flex;align-items:center;justify-content:center');
    const label = el('span', 'flex:1 1 auto;min-width:0', name);
    const detail = el('span', `flex:0 1 auto;min-width:0;color:${C.muted};text-align:right;${NUM}`);
    const r = el('div',
      `display:flex;align-items:center;gap:8px;min-height:${ROW.table}px;padding:6px 12px;border-bottom:1px solid ${C.line}`,
      lead, label, detail);
    r.setAttribute('role', 'listitem');
    return { r, lead, label, detail };
  });
  const list = el('div', `display:flex;flex-direction:column;font:${T.md}`, ...rows.map(x => x.r));
  list.setAttribute('role', 'list');
  const note = el('div', `padding:8px 12px;font:${T.sm};color:${C.muted}`);
  note.hidden = true;
  const box = section({ title: o.title, actions: [linkSlot], flush: true }, list, note).el;
  box.setAttribute('role', 'status');
  box.setAttribute('aria-live', 'polite');

  let at = 0, failed = false;
  const paint = (): void => {
    rows.forEach((x, i) => {
      const state = i < at ? 'done' : i > at ? 'wait' : failed ? 'fail' : 'run';
      if (x.r.dataset.state === state) return;
      x.r.dataset.state = state;
      const ic = state === 'run' ? spinner(ICON.sm)
        : state === 'done' ? icons.check(ICON.sm)
        : state === 'fail' ? icons.x(ICON.sm) : statusDot('muted');
      ic.style.color = state === 'run' ? C.link : state === 'done' ? C.ok : state === 'fail' ? C.err : '';
      x.lead.replaceChildren(ic);
      x.label.style.color = state === 'wait' ? C.faint : C.text;
      x.r.style.background = state === 'run' || state === 'fail' ? C.surface : '';
      x.r.style.boxShadow = state === 'run' ? `inset 3px 0 ${C.link}` : state === 'fail' ? `inset 3px 0 ${C.err}` : '';
      if (state !== 'run' && state !== 'fail') x.detail.textContent = '';
    });
  };
  paint();
  return {
    el: box,
    set(s) {
      if (s.at !== undefined) at = Math.max(0, Math.min(s.at, rows.length));
      if (s.failed !== undefined) failed = s.failed;
      paint();
      const cur = rows[Math.min(at, rows.length - 1)];
      if (s.detail !== undefined && cur) cur.detail.textContent = s.detail;
      if (s.note !== undefined) {
        note.textContent = s.note;
        note.hidden = !s.note;
      }
      if (s.link) linkSlot.replaceChildren(link(s.link.label, s.link.href, { external: true }));
      box.setAttribute('role', failed ? 'alert' : 'status');
    },
  };
}
