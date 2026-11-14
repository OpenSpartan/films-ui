// Team emblems: one white-on-transparent PNG per team, named in teams.json by
// team id (Eagle 0, Cobra 1, ...), served by the app wherever it keeps them;
// films-ui carries no art. The app says where with setTeamEmblemIndex(); the
// index is fetched once per page load, on the first emblem. A team without
// an emblem, or a missing index, leaves the image hidden.

import { el } from './dom.js';

interface TeamIndex {
  schemaVersion: 1;
  teams: { index: number; name: string | null; file: string }[];
}

let indexUrl: string | undefined;
let indexPromise: Promise<Map<number, string>> | undefined;

/** Where teams.json is served; the emblems it names are beside it. Call it
 *  before the first teamEmblem(): until then emblems stay hidden. */
export function setTeamEmblemIndex(url: string): void {
  indexUrl = url;
  indexPromise = undefined;
}

/** Team id to the emblem's URL, fetched once; empty when unavailable. */
const loadTeamEmblems = (): Promise<Map<number, string>> => {
  const url = indexUrl;
  if (url === undefined) return Promise.resolve(new Map<number, string>());
  const dir = url.slice(0, url.lastIndexOf('/') + 1);
  return indexPromise ??= fetch(url)
    .then(r => r.ok ? r.json() as Promise<TeamIndex> : null)
    .then(ix => new Map((ix?.teams ?? []).map(t => [t.index, `${dir}${t.file}`] as [number, string])))
    .catch(() => new Map<number, string>());
};

/** A team's emblem, `size` px square: hidden until (and unless) it loads.
 *  Decorative: the team's name stands next to it. */
export function teamEmblem(teamId: number, size: number, opacity = 1): HTMLImageElement {
  const img = el('img', `width:${size}px;height:${size}px;flex:none;object-fit:contain;opacity:${opacity}`);
  img.alt = '';
  img.decoding = 'async';
  img.hidden = true;
  void loadTeamEmblems().then(m => {
    const url = m.get(teamId);
    if (!url) return;
    img.src = url;
    img.hidden = false;
  });
  return img;
}
