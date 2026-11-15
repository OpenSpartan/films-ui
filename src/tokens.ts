// Design tokens: GitHub Primer dark palette plus the scales the chrome is
// built from. Every hex literal in the web client resolves to one of these.
// Spacing (S), control heights (H), row heights (ROW), icon sizes (ICON) and
// type (T) are the only values chrome may use; row()/col() take numbers from S.

export const C = {
  bg:       '#0d1117',   // page, canvas, table body
  bgAlpha:  '#0d1117e0', // translucent backdrop over the map (hover card, sheet scrim)
  surface:  '#161b22',   // sections, tiles, hovered rows and commands, table header band
  raised:   '#1c2128',   // menus, popovers, tooltip, KV group bands, the selected feed row
  line:     '#21262d',   // hairlines: row rules, column separators, bar edges
  border:   '#30363d',   // control and section borders
  text:     '#e6edf3',   // values, primary text, bright icons
  muted:    '#8b949e',   // labels, secondary text
  faint:    '#7d8590',   // tertiary text, inactive icons (passes AA on bg)
  dim:      '#484f58',   // non-text only: separators, disabled borders, empty tracks
  accent:   '#1f6feb',   // active border, primary button border
  accentBg: '#1f6feb22', // active fill
  link:     '#58a6ff',   // links, focus ring, scrubber
  ok:       '#3fb950',   // success
  err:      '#f85149',   // error, danger
  forge:    '#d29922',   // Forge maps
  warn:     '#d29922',   // warning states (same value as forge, separate meaning)
  rare:     '#a371f7',   // heroic medals
  team0:    '#3b82f6',   // Eagle, in team headers and the score block
  team1:    '#ef4444',   // Cobra; never for death marks
} as const;

/** Each team's own colour, the default of TEAM. */
const TEAM_DEFAULT: readonly string[] = [
  C.team0,   // Eagle, blue
  C.team1,   // Cobra, red
  '#f59e0b', // amber
  '#22c55e', // green
  '#a855f7', // purple
  '#06b6d4', // cyan
  '#ec4899', // pink
  '#a3e635', // lime
];

/** Team colours by team id (`TEAM[id % TEAM.length]`), up to 8 teams on the
 *  dark background: blue, red, amber, green, purple, cyan, pink, lime. The
 *  first two are C.team0 and C.team1 (Eagle, Cobra). Team headers, groups
 *  and the score only; never death marks. A broadcast can give a team
 *  another colour (setTeamColor); everything that draws teams reads TEAM. */
export const TEAM: readonly string[] = [...TEAM_DEFAULT];

/** Give team `team` another colour (a broadcast's picked team colours), or
 *  its own back with null. */
export function setTeamColor(team: number, color: string | null): void {
  if (!Number.isInteger(team) || team < 0 || team >= TEAM_DEFAULT.length) return;
  (TEAM as string[])[team] = color ?? TEAM_DEFAULT[team]!;
}

/** The map's own palette: footprint fills by kind, their outline, and the
 *  spawn and flag rings (same colours as Films' generateGeometrySvg). */
export const MAP = {
  nlv:     '#1a1f2e', terrain: '#1a2e1a',
  floor:   '#2d3748', ramp:    '#2c5282', prim:   '#3d4852',
  // A floor plan's highest band (floor.ts: the bands between mix from floor).
  floorHigh: '#4a6382',
  wall:    '#4a5568', column:  '#718096', cover:  '#553c2e',
  blocker: '#7b2d2d', door:    '#5a4a2a', other:  '#2a2a3a',
  outline: '#000000',
  flag:         '#fbbf24',
  spawnInitial: '#22c55e',
  spawnRespawn: '#2a6a4a',
} as const;

/** `#rrggbb` plus alpha 0..1 as `#rrggbbaa`. Replaces `c + '22'` concatenation.
 *  An 8-digit input has its own alpha replaced. */
export function alpha(hex: string, a: number): string {
  const v = Math.round(Math.min(1, Math.max(0, a)) * 255);
  return hex.slice(0, 7) + v.toString(16).padStart(2, '0');
}

/** Corners. `none` everywhere in chrome; `mark` only on marks of 4px or less
 *  (vitals bars, scrubber ticks). Not `R`: Films' shared/routes.ts exports `R`. */
export const RADIUS = { none: '0', mark: '2px' } as const;

/** Spacing scale, px. Page gutter S[6], bar padding S[3] S[6], section body S[5]. */
export const S = { 0: 0, 1: 2, 2: 4, 3: 6, 4: 8, 5: 12, 6: 16, 7: 24, 8: 32, 9: 48 } as const;

const MONO = 'ui-monospace,SFMono-Regular,Menlo,Consolas,monospace';

/** Type scale. `cap` always goes with CAPS letter-spacing (see dom.ts). */
export const T = {
  cap:  '600 10.5px system-ui', // small caps captions, table headers
  xs:   '11px system-ui',       // tags, ribbon captions, feed timestamps
  sm:   '12px system-ui',       // default chrome text
  md:   '13px system-ui',       // body, table cells, form text
  lg:   '15px system-ui',       // the landing page's search field
  h2:   '600 14px system-ui',   // section titles, match map name
  title: '600 15px/18px system-ui', // the masthead's title
  score: '700 18px system-ui',  // scores in joined cells
  num:  '600 16px system-ui',   // stat values
  hero: '600 28px/34px system-ui', // the landing page's headline
  stat: '600 22px/1 system-ui', // the landing page's figures
  mark: '600 10px/12px system-ui', // names on the map: the World layer's plates, the landing map's scale
  mono: `12px ${MONO}`,         // ids, keys
  badge: '700 9px/11px system-ui', // the count pinned to a ribbon command
} as const;

/** Control heights, px: xs tags, sm ribbon/row actions, md default, lg large,
 *  xl the landing page's search. */
export const H = { xs: 20, sm: 24, md: 28, lg: 36, xl: 48 } as const;
/** Bar heights, px, top to bottom: the app header, a page's masthead, the
 *  match page's ribbon, a panel's tabs and filter strip, a section's head
 *  (BAR.mast), a table's or key-value group's band. */
export const BAR = { app: 44, mast: 48, ribbon: 44, tabs: 36, strip: 40, band: 30, legend: 36, timeline: 44 } as const;
/** Row heights, px. */
export const ROW = { feed: 32, dense: 32, table: 36, compact: 28 } as const;
/** Icon sizes, px, by control size (xs 11, sm 12, md 14, lg 16; empty states xl). */
export const ICON = { xs: 11, sm: 12, md: 14, lg: 16, xl: 24 } as const;

export const FONT    = T.sm;
