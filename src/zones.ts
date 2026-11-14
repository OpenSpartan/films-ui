// Zones and hills on a map, drawn from a plain account of each one now
// (ZoneNow): where it stands and its shape, its letter, its phase, its
// owner, the capture under way and who is inside. Where that account comes
// from (a film's timeline, a live server) is the caller's business. Drawn as
// the game has them: each zone's own box or cylinder where its object
// stands, with its letter, filled in its owner's colour. A badge at its
// centre carries the letter and the capture's progress as an arc in the
// capturing team's colour; a contested zone is hatched with a marker on its
// badge, and a pip per player inside sits under the badge. Without a shape,
// a ring of fixed size. Positions are world units, mapped by the caller's
// `toScreen`, so a turned map turns its boxes with it.

import { C, FONT, TEAM, alpha } from './tokens.js';
import { markerImage, type IconImage, type MarkerName } from './markers.js';

/** A zone's own shape, world units: a cylinder of radius `a`, or a box `a`
 *  long along `angle` (radians, counter-clockwise from +x) and `b` wide. */
export interface ZoneShape { cylinder: boolean; a: number; b: number; angle: number }

/** What a zone is doing: `off` a hill to come or gone, `on` a zone that is
 *  simply there, `countdown` a hill about to go live, `live` a hill anyone
 *  can take, `controlled` one a team holds. */
export type ZonePhase = 'on' | 'off' | 'countdown' | 'live' | 'controlled';

/** One zone now. Team ids index TEAM; a negative one is no team. */
export interface ZoneNow {
  /** Its centre, world units. */
  x: number; y: number;
  /** Absent: a ring of fixed size. */
  shape?: ZoneShape;
  /** 'A' to 'F' (the game's letter marks), 'H' for a hill (its crown), any
   *  other text as text, or none. */
  label?: string;
  phase: ZonePhase;
  /** The team that holds it. */
  owner?: number;
  /** The team whose capture the progress arc is, in its colour; absent, white. */
  capturing?: number;
  /** The capture's progress, 0 to 1. */
  progress?: number;
  contested?: boolean;
  /** A pip per player inside (the first 8), in their team's colour. */
  inside?: Array<number | undefined>;
  /** While counting down: the seconds until it goes live ('Live in N s'),
   *  and the countdown's share gone, 0 to 1, drawn as the ring. */
  countdownSeconds?: number;
  countdownFraction?: number;
  /** How far through a capture's flash, 0 to 1: the outline flashes
   *  outward and fades. Absent or 1, none. */
  flash?: number;
  /** King of the Hill: the points that win a hill and each team's on this
   *  one, drawn as a bar per team with the seconds of sole control it still
   *  needs. */
  hill?: { toWin: number; teams: Array<{ team: number; points: number }> };
}

/** The fixed ring, world units, and its least, CSS px. */
const RADIUS_WU = 16;
const MIN_PX = 10;
/** The centre badge's radius, CSS px. */
const BADGE = 11;

/** The game's mark for a badge's label: a zone's letter, the crown for a
 *  hill; null when it has none or the atlas hasn't loaded. */
function badgeIcon(label: string): IconImage | null {
  if (label === 'H') return markerImage('hill', 13, C.text);
  return /^[A-F]$/.test(label) ? markerImage(`zone${label}` as MarkerName, 12, C.text) : null;
}

const teamColor = (team: number | undefined): string =>
  team !== undefined && team >= 0 ? TEAM[team % TEAM.length] ?? C.muted : C.muted;

/** World units to CSS px on the canvas. */
export type ToScreen = (x: number, y: number) => [number, number];

/** The zone's outline as a path on `ctx`, in CSS px; (sx, sy) is its centre
 *  on screen, `z` CSS px per world unit. */
function outline(ctx: CanvasRenderingContext2D, p: ZoneNow, toScreen: ToScreen, sx: number, sy: number, z: number): void {
  ctx.beginPath();
  const sh = p.shape;
  if (!sh) { ctx.arc(sx, sy, Math.max(MIN_PX, RADIUS_WU * z), 0, 2 * Math.PI); return; }
  if (sh.cylinder) { ctx.arc(sx, sy, sh.a * z, 0, 2 * Math.PI); return; }
  // The box: forward (cos, sin) by half its length, right by half its width,
  // in the world; its corners go through toScreen.
  const fx = Math.cos(sh.angle), fy = Math.sin(sh.angle);
  const rx = fy, ry = -fx;
  const ha = sh.a / 2, hb = sh.b / 2;
  const corners: Array<[number, number]> = [[ha, hb], [ha, -hb], [-ha, -hb], [-ha, hb]];
  corners.forEach(([u, w], i) => {
    const [x, y] = toScreen(p.x + fx * u + rx * w, p.y + fy * u + ry * w);
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.closePath();
}

/** Draw `zones` on `ctx`. `toScreen` maps world units to CSS px on the
 *  canvas, `scale` is CSS px per world unit, `view` the canvas's size in CSS
 *  px (zones out of it are skipped). */
export function drawZones(
  ctx: CanvasRenderingContext2D, toScreen: ToScreen, scale: number,
  zones: readonly ZoneNow[], view: { width: number; height: number },
): void {
  const z = scale;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (const p of zones) {
    const [sx, sy] = toScreen(p.x, p.y);
    const reach = p.shape ? Math.max(p.shape.a, p.shape.b) * z : RADIUS_WU * z;
    if (sx < -reach - 40 || sx > view.width + reach + 40 || sy < -reach - 40 || sy > view.height + reach + 40) continue;
    if (p.phase === 'off') {
      // A hill to come or gone: a faint dashed outline.
      ctx.globalAlpha = 0.35;
      ctx.strokeStyle = C.muted;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      outline(ctx, p, toScreen, sx, sy, z);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
      continue;
    }
    const owned = p.owner !== undefined && p.owner >= 0;
    const color = owned ? teamColor(p.owner) : p.phase === 'live' ? C.text : C.muted;
    outline(ctx, p, toScreen, sx, sy, z);
    ctx.fillStyle = alpha(owned ? color : C.text, owned ? 0.2 : 0.07);
    ctx.fill();
    if (p.contested) {
      // Contested: white hatching inside the outline.
      ctx.save();
      ctx.clip();
      ctx.strokeStyle = alpha(C.text, 0.35);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let d = -reach * 2; d < reach * 2; d += 8) { ctx.moveTo(sx + d - reach, sy + reach); ctx.lineTo(sx + d + reach, sy - reach); }
      ctx.stroke();
      ctx.restore();
      outline(ctx, p, toScreen, sx, sy, z);
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    if (p.phase === 'countdown') ctx.setLineDash([4, 3]);
    ctx.stroke();
    ctx.setLineDash([]);
    if (p.flash !== undefined && p.flash >= 0 && p.flash < 1) {
      // A capture: the outline flashes outward and fades.
      const f = p.flash;
      ctx.save();
      ctx.globalAlpha = 1 - f;
      ctx.translate(sx, sy); ctx.scale(1 + 0.25 * f, 1 + 0.25 * f); ctx.translate(-sx, -sy);
      outline(ctx, p, toScreen, sx, sy, z);
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();
    }
    // The badge: the letter (or Hill) in a dark disc, ringed by the progress.
    ctx.beginPath(); ctx.arc(sx, sy, BADGE, 0, 2 * Math.PI);
    ctx.fillStyle = C.bg;
    ctx.fill();
    ctx.strokeStyle = alpha(color, 0.9);
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // While a hill counts down the ring is the countdown (its navpoint's
    // progress isn't a capture's).
    const progress = p.phase === 'countdown' ? p.countdownFraction ?? 0 : p.progress ?? 0;
    if (progress > 0) {
      ctx.strokeStyle = p.capturing !== undefined ? teamColor(p.capturing) : C.text;
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(sx, sy, BADGE + 3, -Math.PI / 2, -Math.PI / 2 + progress * 2 * Math.PI); ctx.stroke();
    }
    const label = p.label ?? '';
    const icon = label ? badgeIcon(label) : null;
    if (icon) {
      ctx.drawImage(icon.canvas, sx - icon.w / 2, sy - icon.h / 2, icon.w, icon.h);
    } else if (label) {
      ctx.fillStyle = C.text;
      ctx.font = '700 12px system-ui';
      ctx.fillText(label, sx, sy + 0.5);
    }
    // A pip per player inside, in their team's colour, under the badge.
    const inside = p.inside ?? [];
    inside.slice(0, 8).forEach((team, k) => {
      const n = Math.min(8, inside.length);
      ctx.fillStyle = teamColor(team);
      ctx.fillRect(sx - (n * 6 - 2) / 2 + k * 6, sy + BADGE + 6, 4, 4);
    });
    let below = sy + BADGE + 16;
    // Contested: its marker at the badge's corner, so nothing under the
    // badge moves when the state changes.
    if (p.contested) drawContested(ctx, sx + BADGE, sy - BADGE);
    // The countdown to a hill going live, in seconds.
    if (p.phase === 'countdown' && p.countdownSeconds !== undefined) {
      ctx.font = `600 11px system-ui`;
      ctx.fillStyle = C.text;
      ctx.fillText(`Live in ${Math.max(0, Math.ceil(p.countdownSeconds))} s`, sx, below + 5);
    }
    // King of the Hill: each team's points on the live hill as a bar in its
    // colour, and the seconds of sole control it still needs (a point a
    // second, so the least time to win).
    if (p.hill) {
      const W = 56, H = 5;
      ctx.font = `600 10px system-ui`;
      ctx.textAlign = 'left';
      for (const tm of p.hill.teams) {
        const pts = tm.points;
        const f = Math.min(1, pts / p.hill.toWin);
        const x0 = sx - W / 2 - 14;
        ctx.fillStyle = alpha(C.bg, 0.85);
        ctx.fillRect(x0 - 2, below - 2, W + 36, H + 4);
        ctx.fillStyle = alpha(teamColor(tm.team), 0.3);
        ctx.fillRect(x0, below, W, H);
        ctx.fillStyle = teamColor(tm.team);
        ctx.fillRect(x0, below, W * f, H);
        ctx.fillStyle = C.text;
        ctx.fillText(`${Math.max(0, p.hill.toWin - pts)} s`, x0 + W + 4, below + H / 2 + 0.5);
        below += H + 6;
      }
      ctx.textAlign = 'center';
    }
  }
  ctx.font = FONT;
}

/** The contested marker in a dark disc centred at (x, y). */
function drawContested(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  const img = markerImage('contested', 13, C.text);
  ctx.beginPath(); ctx.arc(x, y, 10, 0, 2 * Math.PI);
  ctx.fillStyle = C.bg;
  ctx.fill();
  ctx.strokeStyle = C.text;
  ctx.lineWidth = 1;
  ctx.stroke();
  if (img) ctx.drawImage(img.canvas, x - img.w / 2, y - img.h / 2, img.w, img.h);
}
