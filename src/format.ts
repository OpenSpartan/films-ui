/** What an empty value renders as: nothing. Tables mark such cells
 *  `aria-label="Unknown"`; where a word is needed, write 'None' or 'Unknown'. */
export const EMPTY = '';

/** `m:ss` with zero-padded seconds. Floors both, never shows 60. */
export function mmss(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function fmtDuration(sec?: number): string {
  if (sec == null) return EMPTY;
  const m = Math.floor(sec / 60), s = Math.round(sec % 60);
  return m > 0 ? `${m}:${String(s).padStart(2, '0')}` : `${s}s`;
}

/** Local-timezone "Apr 17, 10:32 PM": Intl with no `timeZone` = browser local. */
export function fmtDate(iso?: string): string {
  if (!iso) return EMPTY;
  return new Intl.DateTimeFormat(undefined, {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  }).format(new Date(iso));
}

export function fmtCount(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

/** Relative to now: 'just now', '5 min ago', '3 h ago', '2 d ago', or
 *  'in 3 h' for a future time. Empty for a missing or unparseable time. */
export function fmtRelative(iso: string): string {
  const r = relParts(iso);
  if (!r) return EMPTY;
  return r.dir === 'future' ? `in ${r.span}` : r.dir === 'past' ? `${r.span} ago` : r.span;
}

/** fmtRelative in parts, for marking the amount apart from 'ago': the span
 *  ('26 min', '301 d', or 'just now') and which side of now it's on. */
export function relParts(iso: string): { span: string; dir: 'past' | 'future' | 'now' } | null {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return null;
  const d = (t - Date.now()) / 1000;
  const s = Math.abs(d);
  if (s < 45) return { span: 'just now', dir: 'now' };
  const span = s < 3600 ? `${Math.max(1, Math.round(s / 60))} min`
    : s < 86400 ? `${Math.round(s / 3600)} h`
    : `${Math.round(s / 86400)} d`;
  return { span, dir: d > 0 ? 'future' : 'past' };
}

/** The full local date and time with the time zone: 'Saturday, November 7,
 *  2026 at 5:33:18 PM PST' in the browser's locale. */
export function fmtDateTimeFull(iso: string): string {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return EMPTY;
  return new Date(t).toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'long' });
}

/** Past times: like fmtRelative, but a clock skew into the future reads 'just now'. */
export function fmtAgo(iso: string): string {
  const t = Date.parse(iso);
  if (Number.isFinite(t) && t > Date.now()) return 'just now';
  return fmtRelative(iso);
}

/** 'Name (email)', or the email alone when the name is missing or the same. */
export function who(me: { name?: string | null; email: string }): string {
  const n = me.name?.trim();
  return n && n !== me.email ? `${n} (${me.email})` : me.email;
}

/** '1 to 20 of 300', with grouped digits. */
export function range(a: number, b: number, total: number): string {
  return `${a.toLocaleString()} to ${b.toLocaleString()} of ${total.toLocaleString()}`;
}

/** Normalize a caught value to a string for display. */
export function errMsg(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}
