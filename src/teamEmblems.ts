// Team emblems: one white-on-transparent PNG per team, named in teams.json by
// team id (Eagle 0, Cobra 1, ...), served by the app wherever it keeps them;
// films-ui carries no art. The app says where with loadTeamEmblems(url), as
// it does for the markers with loadMarkers(url): fetched once per page load,
// before or after the first emblem is made. A team without an emblem, or a
// missing or malformed index, leaves the image hidden.

import { el } from './dom.js';

interface TeamIndex {
  schemaVersion: 1;
  teams: { index: number; name: string | null; file: string }[];
}

/** Each team's emblem URL by team id. */
export type TeamEmblems = ReadonlyMap<number, string>;

let indexPromise: Promise<TeamEmblems | undefined> | undefined;
/** Settles `ready` once loadTeamEmblems() has fetched the index. */
let settle: (emblems: TeamEmblems | undefined) => void = () => {};
/** The index, for the emblems made before it was asked for. */
const ready = new Promise<TeamEmblems | undefined>(resolve => { settle = resolve; });

/** The emblems from the index at `url` (teams.json; the emblems it names are
 *  beside it), fetched once: the first call's URL is the page's. Undefined
 *  when they're unavailable. Emblems made before the call show once it
 *  resolves. */
export const loadTeamEmblems = (url: string): Promise<TeamEmblems | undefined> =>
  indexPromise ??= fetch(url)
    .then(r => r.ok ? r.json() as Promise<TeamIndex> : null)
    .then(ix => {
      if (!ix || ix.schemaVersion !== 1 || !Array.isArray(ix.teams)) return undefined;
      const dir = url.slice(0, url.lastIndexOf('/') + 1);
      return new Map(ix.teams.map(t => [t.index, `${dir}${t.file}`] as [number, string]));
    })
    .catch(() => undefined)
    .then(emblems => { settle(emblems); return emblems; });

/** A team's emblem, `size` px square: hidden until (and unless) it loads.
 *  Decorative: the team's name stands next to it. */
export function teamEmblem(teamId: number, size: number, opacity = 1): HTMLImageElement {
  const img = el('img', `width:${size}px;height:${size}px;flex:none;object-fit:contain;opacity:${opacity}`);
  img.alt = '';
  img.decoding = 'async';
  img.hidden = true;
  void ready.then(emblems => {
    const url = emblems?.get(teamId);
    if (!url) return;
    img.src = url;
    img.hidden = false;
  });
  return img;
}
