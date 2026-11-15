// The one table, and the key-value grid. Rows are real table rows with a
// stretched link (so modifier clicks and long-press work), hover and card
// layout come from the stylesheet hooks.

import { C, T, H, S, ROW, BAR } from './tokens.js';
import { el, btn, ui, UI, CAPS, NUM, SR_ONLY, TRUNCATE, BTN_RESET, skel } from './dom.js';
import { icons } from './icons.js';
import { iconButton } from './button.js';
import { statusDot, copyWithToast } from './status.js';

export interface Col {
  key?: string;
  label: string;
  w?: string;
  /** Left unless given: every column reads from its left edge. */
  align?: 'left' | 'right' | 'center';
  /** Tabular figures. */
  num?: boolean;
  mono?: boolean;
  hideBelow?: 'sm' | 'md';
  /** The header label is read by screen readers only (icon-only columns). */
  srOnlyLabel?: boolean;
  /** The heading's tooltip. */
  title?: string;
  /** Where the cell goes in card layout (cardsBelow). Unset cells are hidden there. */
  card?: 'title' | 'sub' | 'meta' | 'end' | 'hide';
}

export interface TableOpts {
  /** 32px rows instead of 36. */
  dense?: boolean;
  /** For a panel or card: 28px rows under a 24px head, the small type and
   *  tight columns (the outer edges keep their inset). */
  compact?: boolean;
  /** A hairline between columns. */
  separators?: boolean;
  /** table-layout:fixed. Default true. */
  fixed?: boolean;
  /** Rows become two-line cards below 640px. */
  cardsBelow?: 'sm';
  /** Visually hidden <caption>. */
  caption?: string;
  /** Sticky header. Default true. */
  sticky?: boolean;
  /** The table fills its flex column and scrolls inside it, under its
   *  header, the way the match page's panels do. */
  fill?: boolean;
  /** The table keeps this width, px, and its wrapper scrolls sideways. */
  minWidth?: number;
  /** The column (a Col's `key`) the rows are sorted by, marked in the heads. */
  sortedBy?: string;
  /** Makes the head of every column with a `key` a button. The caller sorts
   *  (`reorder`) and marks it (`setSorted`). */
  onSort?: (key: string) => void;
}

export interface DataTable {
  /** Scroll wrapper (overflow-x:auto) containing the <table>. */
  el: HTMLDivElement;
  table: HTMLTableElement;
  addRow(cells: ReadonlyArray<Node | string>, o?: { href?: string; onClick?: () => void; title?: string }): HTMLTableRowElement;
  /** A full-width band opening a group of rows: its title, then `after`. */
  addBand(title: string, ...after: Node[]): HTMLTableRowElement;
  /** Puts the rows in this order in place, moving only those out of it, so a
   *  table that re-sorts while it plays keeps its cells and scroll. */
  reorder(rows: readonly HTMLTableRowElement[]): void;
  /** Marks the column the rows are sorted by. */
  setSorted(key: string): void;
  clear(): void;
  /** One full-width row of muted text, with an optional action. */
  empty(text: string, action?: HTMLElement): void;
  /** Skeleton rows matching the column widths. */
  loading(rows?: number): void;
}

const INTERACTIVE = `button,a:not([data-ui~=${UI.rowlink}]),[data-ui~=${UI.ctl}]`;

/** A group's band, in a key-value grid and in a table. */
const GROUP_BAND = `background:${C.raised};border-top:1px solid ${C.border};border-bottom:1px solid ${C.line};font:${T.h2};color:${C.text}`;

export function dataTable(cols: readonly Col[], o?: TableOpts): DataTable {
  const sep = !!o?.separators;
  const sticky = o?.sticky ?? true;
  const compact = !!o?.compact;
  const onSort = o?.onSort;
  const inner = compact ? S[2] : S[5];
  const padding = (i: number): string => `padding:0 ${i === cols.length - 1 ? S[5] : inner}px 0 ${i === 0 ? S[5] : inner}px;`;
  const t = ui(el('table',
    `width:100%;border-collapse:collapse;${o?.fixed ?? true ? 'table-layout:fixed;' : ''}font:${compact ? T.sm : T.md};color:${C.text}${o?.minWidth ? `;min-width:${o.minWidth}px` : ''}`), UI.table);
  if (o?.caption) t.appendChild(el('caption', SR_ONLY, o.caption));
  const hr = t.createTHead().insertRow();
  const sortable = new Map<string, HTMLTableCellElement>();
  cols.forEach((c, i) => {
    const align = c.align ?? 'left';
    const th = el('th',
      `text-align:${align};height:${compact ? H.sm : BAR.band}px;${padding(i)}${CAPS};background:${C.surface};` +
      `border-bottom:1px solid ${C.border};${TRUNCATE};` +
      `${sticky ? 'position:sticky;top:0;z-index:2;' : ''}${c.w ? `width:${c.w};` : ''}` +
      `${sep && i > 0 ? `border-left:1px solid ${C.line}` : ''}`);
    th.scope = 'col';
    const key = c.key;
    if (c.srOnlyLabel) th.appendChild(el('span', SR_ONLY, c.label));
    else if (key !== undefined && onSort) {
      const b = ui(btn(`${BTN_RESET};width:100%;${TRUNCATE}`, c.label), UI.hover_bg);
      b.addEventListener('click', () => onSort(key));
      th.appendChild(b);
    } else th.textContent = c.label;
    if (c.title) th.title = c.title;
    if (c.hideBelow) ui(th, c.hideBelow === 'sm' ? UI.hide_sm : UI.hide_md);
    if (key !== undefined && (onSort || o?.sortedBy !== undefined)) sortable.set(key, th);
    hr.appendChild(th);
  });
  const setSorted = (key: string): void => {
    for (const [k, th] of sortable) {
      th.style.color = k === key ? C.text : C.muted;
      th.setAttribute('aria-sort', k === key ? 'descending' : 'none');
    }
  };
  if (o?.sortedBy !== undefined) setSorted(o.sortedBy);
  const body = t.createTBody();
  const wrap = ui(el('div', `max-width:100%;min-width:0${o?.fill ? ';flex:1 1 auto;min-height:0;overflow:auto' : ''}`, t), UI.scroll_x);
  if (o?.cardsBelow) ui(wrap, UI.cards_sm);
  const height = compact ? ROW.compact : o?.dense ? ROW.dense : ROW.table;

  function cell(c: Col | undefined, i: number, content: Node | string): HTMLTableCellElement {
    const align = c?.align ?? 'left';
    const td = el('td',
      `text-align:${align};height:${height}px;${padding(i)}border-bottom:1px solid ${C.line};` +
      `${TRUNCATE};` +
      `${c?.num ? `${NUM};` : ''}${c?.mono ? `font:${T.mono};` : ''}` +
      `${sep && i > 0 ? `border-left:1px solid ${C.line}` : ''}`);
    if (c?.card) td.dataset.card = c.card;
    if (c?.hideBelow) ui(td, c.hideBelow === 'sm' ? UI.hide_sm : UI.hide_md);
    td.append(content);
    if (content === '') td.setAttribute('aria-label', 'Unknown');
    return td;
  }

  return {
    el: wrap,
    table: t,
    addRow(cells, ro) {
      const tr = ui(el('tr', ''), UI.row);
      if (ro?.title) tr.title = ro.title;
      const titleAt = Math.max(0, cols.findIndex(c => c.card === 'title'));
      let rowlink: HTMLAnchorElement | null = null;
      for (let i = 0; i < cells.length; i++) {
        const content = cells[i] ?? '';
        let inner: Node | string = content;
        if (ro?.href !== undefined && i === titleAt) {
          const a = ui(el('a', 'color:inherit;text-decoration:none', content), UI.rowlink);
          a.href = ro.href;
          rowlink = a;
          inner = a;
        }
        tr.appendChild(cell(cols[i], i, inner));
      }
      // Interactive content sits over the stretched link.
      for (const e of tr.querySelectorAll<HTMLElement>(INTERACTIVE)) ui(e, UI.above);
      const link: HTMLAnchorElement | null = rowlink;
      const go = link ? (): void => link.click() : ro?.onClick;
      if (go) {
        // Also the fallback for browsers that let the overlay escape a <tr>.
        tr.addEventListener('click', e => {
          const target = e.target instanceof Element ? e.target : null;
          if (target?.closest(`a,button,[data-ui~=${UI.ctl}]`)) return;
          if (getSelection()?.toString()) return;
          go();
        });
        if (!link) tr.style.cursor = 'pointer';
      }
      body.appendChild(tr);
      return tr;
    },
    addBand(title, ...after) {
      const td = el('td', `height:${BAR.band}px;padding:0 12px;${GROUP_BAND}`,
        el('div', 'display:flex;align-items:center;gap:8px;min-width:0', el('span', TRUNCATE, title), ...after));
      td.colSpan = cols.length;
      td.dataset.card = 'title';
      const tr = el('tr', '', td);
      body.appendChild(tr);
      return tr;
    },
    reorder(rows) {
      rows.forEach((r, i) => {
        const at = body.children[i] ?? null;
        if (at !== r) body.insertBefore(r, at);
      });
    },
    setSorted,
    clear() {
      body.replaceChildren();
    },
    empty(text, action) {
      body.replaceChildren();
      const td = el('td', `padding:16px;color:${C.muted};font:${T.md};white-space:normal`, text);
      td.colSpan = cols.length;
      td.dataset.card = 'title';
      if (action) {
        action.style.marginLeft = '12px';
        td.appendChild(action);
      }
      body.appendChild(el('tr', '', td));
    },
    loading(rows = 6) {
      body.replaceChildren();
      for (let r = 0; r < rows; r++) {
        const tr = el('tr', '');
        cols.forEach((c, i) => {
          const td = cell(c, i, skel('60%', 10));
          if (i === 0) td.dataset.card = 'title';
          tr.appendChild(td);
        });
        body.appendChild(tr);
      }
    },
  };
}

// ── Key-value grid ────────────────────────────────────────────────────────

export interface KvRow {
  key: string;
  value: Node | string;
  state?: 'ok' | 'err' | 'warn' | 'muted';
  note?: string;
  /** Mono key (env var names). */
  mono?: boolean;
  /** Adds a copy button for this text. */
  copy?: string;
}
export interface KvGroup { title: string; summary?: Node | string; rows: readonly KvRow[] }

/** Tables one under another, each with what opens it (a team's band): a
 *  gap between them and nothing after the last. A table ends at its last
 *  row's separator; padding under it leaves an empty band that reads as half
 *  a row, so a stack never pads, and nothing pads below a table. */
export function tableStack(...items: Array<Node | null | undefined | false>): HTMLDivElement {
  return el('div', `display:flex;flex-direction:column;gap:${S[5]}px;min-width:0`,
    ...items.filter((x): x is Node => Boolean(x)));
}

/** Groups of key-value pairs: each group an <h3> band over a <dl> grid of
 *  <dt>/<dd> pairs. `columns:2` sets groups side by side at 960 and up;
 *  below 640 keys stack over their values. `compact` is for a panel or card:
 *  28px rows, the small type, and keys that stay beside their values. */
export function kvGrid(groups: readonly KvGroup[], o?: { keyWidth?: number; columns?: 1 | 2; compact?: boolean }): HTMLDivElement {
  const compact = !!o?.compact;
  const box = compact ? `min-height:${ROW.compact}px;padding:${S[1]}px ${S[5]}px` : `min-height:${BAR.band}px;padding:${S[3]}px ${S[5]}px`;
  const wrap = el('div', 'min-width:0');
  if (!compact) ui(wrap, UI.kv);
  if (o?.columns === 2) ui(wrap, UI.grid2_lg);
  for (const g of groups) {
    const s = el('section', 'min-width:0');
    if (g.title) {
      const h = el('h3',
        `display:flex;align-items:center;gap:12px;height:${BAR.band}px;margin:0;padding:0 12px;${GROUP_BAND}`,
        el('span', `min-width:0;${TRUNCATE}`, g.title));
      if (g.summary !== undefined) {
        h.appendChild(el('span', `margin-left:auto;font:${T.sm};color:${C.muted};white-space:nowrap`, g.summary));
      }
      s.appendChild(h);
    }
    const dl = el('dl',
      `display:grid;grid-template-columns:${o?.keyWidth ?? 200}px minmax(0,1fr);margin:0`);
    for (const r of g.rows) {
      const dt = el('dt',
        `display:flex;align-items:center;${box};margin:0;` +
        `border-bottom:1px solid ${C.line};border-right:1px solid ${C.line};color:${C.muted};` +
        `font:${r.mono ? T.mono : T.sm};overflow-wrap:anywhere`, r.key);
      const dd = el('dd',
        `display:flex;flex-wrap:wrap;align-items:center;gap:8px;${box};margin:0;` +
        `border-bottom:1px solid ${C.line};color:${C.text};font:${compact ? T.sm : T.md};min-width:0;overflow-wrap:anywhere`);
      if (r.state) dd.appendChild(statusDot(r.state));
      dd.append(r.value);
      if (r.value === '') dd.setAttribute('aria-label', 'Unknown');
      if (r.note) dd.appendChild(el('span', `font:${T.sm};color:${C.muted}`, r.note));
      const copyText = r.copy;
      if (copyText !== undefined) {
        const b = iconButton(icons.copy, `Copy ${r.key}`, 'xs', 'ghost');
        b.addEventListener('click', () => { void copyWithToast(copyText); });
        dd.appendChild(b);
      }
      dl.append(dt, dd);
    }
    // The group's last row draws no rule: the frame or the next group's band
    // closes it.
    const lastDt = dl.lastElementChild?.previousElementSibling as HTMLElement | null | undefined;
    const lastDd = dl.lastElementChild as HTMLElement | null;
    if (lastDt) lastDt.style.borderBottom = '0';
    if (lastDd) lastDd.style.borderBottom = '0';
    s.appendChild(dl);
    wrap.appendChild(s);
  }
  return wrap;
}
