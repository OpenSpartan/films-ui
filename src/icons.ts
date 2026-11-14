// Lucide icons via the framework-agnostic `lucide` package — tree-shaken,
// each icon is just an array of [tag, attrs] tuples we render to SVG.

import {
  Users, Clock, Skull, Film, Calendar, Hammer, Signpost,
  Play, Pause, SkipBack, SkipForward,
  Layers, Flame, Waypoints, ScatterChart, Grid3x3,
  Copy, Check, ChevronDown, User, RefreshCw,
  MessageSquarePlus, X, Landmark, Award,
  Maximize, Heart, Zap, Activity, Flag, Bomb, Package, Hand, Footprints, MapPin,
  TriangleAlert, Info, ExternalLink, Link, ImageDown, Ellipsis, Filter, Search, Target,
  Eye, EyeOff, ZoomIn, ZoomOut, LogOut, Send, Trophy,
  Swords, RotateCcw, ChevronsRight, Anchor, Ghost, Crosshair, LogIn, ChevronsUp, Wind, Volume2, ScrollText, MessagesSquare,
  LocateFixed,
  Shapes,
  type IconNode,
} from 'lucide';
import { C } from './tokens.js';
import type { Icon } from './dom.js';

function render(node: IconNode, size = 14): SVGSVGElement {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', String(size));
  svg.setAttribute('height', String(size));
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '2');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.style.pointerEvents = 'none';
  svg.setAttribute('aria-hidden', 'true');
  for (const [tag, attrs] of node) {
    const el = document.createElementNS(ns, tag);
    for (const [k, v] of Object.entries(attrs)) if (v != null) el.setAttribute(k, String(v));
    svg.appendChild(el);
  }
  return svg;
}

export const icons = {
  players:  (s?: number) => render(Users, s),
  clock:    (s?: number) => render(Clock, s),
  skull:    (s?: number) => render(Skull, s),
  film:     (s?: number) => render(Film, s),
  calendar: (s?: number) => render(Calendar, s),
  forge:    (s?: number) => render(Hammer, s),
  play:     (s?: number) => render(Play, s),
  pause:    (s?: number) => render(Pause, s),
  prev:     (s?: number) => render(SkipBack, s),
  next:     (s?: number) => render(SkipForward, s),
  // layer toggles (Films' viewer indexes these by layer key)
  geometry: (s?: number) => render(Layers, s),
  heatmap:  (s?: number) => render(Flame, s),
  paths:    (s?: number) => render(Waypoints, s),
  deaths:   (s?: number) => render(X, s),
  shots:    (s?: number) => render(Zap, s),
  ground:   (s?: number) => render(Package, s),
  world:    (s?: number) => render(MapPin, s),
  places:   (s?: number) => render(Signpost, s),
  devices:  (s?: number) => render(Shapes, s),
  carried:  (s?: number) => render(Hand, s),
  hits:     (s?: number) => render(Activity, s),
  throws:   (s?: number) => render(Bomb, s),
  objectives: (s?: number) => render(Flag, s),
  actions:  (s?: number) => render(Footprints, s),
  vitals:   (s?: number) => render(Heart, s),
  scatter:  (s?: number) => render(ScatterChart, s),
  density:  (s?: number) => render(Grid3x3, s),
  layers:   (s?: number) => render(Layers, s),
  headshot: (s?: number) => render(Target, s),
  // chrome
  copy:     (s?: number) => render(Copy, s),
  check:    (s?: number) => render(Check, s),
  x:        (s?: number) => render(X, s),
  alert:    (s?: number) => render(TriangleAlert, s),
  info:     (s?: number) => render(Info, s),
  external: (s?: number) => render(ExternalLink, s),
  caret:    (s?: number) => render(ChevronDown, s),
  link:     (s?: number) => render(Link, s),
  image:    (s?: number) => render(ImageDown, s),
  more:     (s?: number) => render(Ellipsis, s),
  filter:   (s?: number) => render(Filter, s),
  search:   (s?: number) => render(Search, s),
  eye:      (s?: number) => render(Eye, s),
  eyeOff:   (s?: number) => render(EyeOff, s),
  zoomIn:   (s?: number) => render(ZoomIn, s),
  zoomOut:  (s?: number) => render(ZoomOut, s),
  logOut:   (s?: number) => render(LogOut, s),
  send:     (s?: number) => render(Send, s),
  user:     (s?: number) => render(User, s),
  sync:     (s?: number) => render(RefreshCw, s),
  feedback: (s?: number) => render(MessageSquarePlus, s),
  builtin:  (s?: number) => render(Landmark, s),
  medal:    (s?: number) => render(Award, s),
  fit:      (s?: number) => render(Maximize, s),
  scores:   (s?: number) => render(Trophy, s),
  // The Events tab and its announcer lines.
  events:   (s?: number) => render(ScrollText, s),
  voice:    (s?: number) => render(Volume2, s),
  chatter:  (s?: number) => render(MessagesSquare, s),
  spawn:    (s?: number) => render(LocateFixed, s),
  // Player actions (pipeline 12), in the player card.
  melee:    (s?: number) => render(Swords, s),
  reload:   (s?: number) => render(RotateCcw, s),
  thrust:   (s?: number) => render(ChevronsRight, s),
  grapple:  (s?: number) => render(Anchor, s),
  camo:     (s?: number) => render(Ghost, s),
  zoom:     (s?: number) => render(Crosshair, s),
  sprint:   (s?: number) => render(Wind, s),
  jump:     (s?: number) => render(ChevronsUp, s),
  // A player entering and leaving a zone.
  zoneIn:   (s?: number) => render(LogIn, s),
  zoneOut:  (s?: number) => render(LogOut, s),
} as const;

/** Tint an icon and attach an explanatory tooltip. Standalone status icons are
 *  informative (not decorative), so undo render()'s `pointer-events:none` /
 *  `aria-hidden` and expose as a named image. */
export function statusIcon(ic: SVGSVGElement, color: string, title: string): SVGSVGElement {
  ic.style.color = color;
  ic.style.pointerEvents = 'auto';
  ic.removeAttribute('aria-hidden');
  ic.setAttribute('role', 'img');
  ic.setAttribute('aria-label', title);
  // An SVG's tooltip comes from a <title> child, not a title attribute.
  const tip = document.createElementNS('http://www.w3.org/2000/svg', 'title');
  tip.textContent = title;
  ic.prepend(tip);
  return ic;
}

/** Forge vs Built-in indicator — pre-colored, pre-titled. Films' home page
 *  appends the bare SVG after the map name; its viewer wraps it in
 *  `chip(mapKind(f), …)`. */
export function mapKind(isForge: boolean | undefined, size = 12): SVGSVGElement {
  return isForge
    ? statusIcon(icons.forge(size), C.forge, 'Forge map')
    : statusIcon(icons.builtin(size), C.faint, 'Built-in map');
}

/** Render an icon at `size` and tint it. The inline-expression form of the
 *  ubiquitous `const ic = icons.X(n); ic.style.color = C.y;` two-liner. */
export const tint = (ic: Icon, size: number, color: string): SVGSVGElement => {
  const s = ic(size); s.style.color = color; return s;
};

export const SPIN = 'spin .9s linear infinite';

/** A `sync` icon already spinning — every "in progress" affordance in the app. */
export const spinner = (size = 14): SVGSVGElement => {
  const s = icons.sync(size); s.style.animation = SPIN; return s;
};
