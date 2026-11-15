<h1 align="center">films-ui</h1>

<p align="center">The UI framework shared by OpenSpartan Films and Cartographer.</p>

<p align="center">
  <a href="https://github.com/OpenSpartan/films-ui/actions/workflows/check.yml"><img src="https://github.com/OpenSpartan/films-ui/actions/workflows/check.yml/badge.svg?branch=main" alt="Check"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT license"></a>
</p>

`films-ui` is the look of [OpenSpartan Films](https://films.openspartan.com) as a library: the design
tokens, the one injected stylesheet, the DOM parts every page is built from (buttons, menus, tables,
sections, the masthead, the ribbon), and the map layers that don't care where their data comes from.
Films draws a match from its film; Cartographer draws one live from a LAN server. Both build their pages
from this, so they read as one product.

It is framework-free DOM in strict TypeScript: inline `cssText` built from the tokens, plus one
stylesheet for what inline styles can't express (hover, focus, breakpoints, motion). There is no build
step. The sources are the package.

## Using it

### As a package (OpenSpartan Films)

Add it as a git dependency and import its modules by name:

```json
"dependencies": {
  "films-ui": "github:OpenSpartan/films-ui#main"
}
```

```ts
import { el } from 'films-ui/dom';
import { button } from 'films-ui/button';
// or everything at once
import { el, button } from 'films-ui';
```

The `exports` map points at the `.ts` files themselves, so the app's bundler (Vite) transpiles them with
the app's own code and TypeScript (`moduleResolution` `NodeNext` or `Bundler`) type-checks them with the
app's options.

### Served as TypeScript (Cartographer)

Cartographer runs no Node. Its build strips the types from each file under `src/` with the
[oxc](https://oxc.rs) crate and embeds the result, and its server serves them under `/ui/` as plain ES
modules (in development, stripped on each request from a checkout). Every relative import names its file
with `.js` (`./dom.js` for `dom.ts`), and every file transpiles on its own (`isolatedModules`), so
answering `dom.js` with `dom.ts` stripped of its types is all it takes.

Every import is relative (CI checks it), and films-ui has no runtime dependencies: the icons' shapes
are Lucide's, copied into `icons.ts`. So a page imports any module, `/ui/icons.js` included, with no
import map.

## Contents

Each module is `src/<name>.ts`, imported as `films-ui/<name>`; `films-ui` alone is all of them.

| Module | What |
|---|---|
| `tokens` | The design tokens, the only hex literals: colours `C`, team colours `TEAM` (by team id, and `setTeamColor` for a broadcast's own), the map's palette `MAP`, `alpha()`, spacing `S`, type `T`, heights `H`, `BAR` and `ROW`, icon sizes `ICON`, `RADIUS`, `FONT` |
| `styles` | `mountStyles(...extra)`: the one injected stylesheet (custom properties, focus, hover, disabled, touch sizes, breakpoints, card tables, keyframes, reduced motion), with the app's own rules after it |
| `dom` | `el()`, the atom every part is built from, and `btn`, `row`, `col`, `barEl`, `ui`/`UI` (the stylesheet's hooks), `chip`, `swatch`, `tag`, `countTag`, `codeTag`, `botTag`, `itemChip`, `ago`, `skel`, `setActive`, `setDisabled`, and the cssText constants (`NUM`, `CAPS`, `TRUNCATE`, `SPACER`, `STRIP`, `BTN_RESET`, `SR_ONLY`) |
| `format` | Times, durations, ranges, a user's name and errors as text |
| `icons` | Lucide icons rendered to SVG, one meaning each; `tint`, `spinner`, `mapKind` |
| `button` | The one button factory, `iconButton`, `buttonGroup`, `busy`, `link` |
| `controls` | `toggle`, `iconToggle`, `segmented`, `tabs`, `textInput`, `copyChip`, `copyValue` |
| `menu` | `menu`, `dropdown`, `select`, `popover`, `hoverCard`, `sheet`, `closeOverlays` |
| `cells` | Joined cells, the scoreboard's look, and `teamBand` |
| `section` | `section`, `pageColumn`, `band`, `statStrip` |
| `status` | `notice`, `toast`, `copyWithToast`, `statusList`, `stateTag`, `statusDot`, `emptyState`, `progressPanel`, `infoMark` |
| `table` | `dataTable`, `kvGrid` |
| `masthead` | The bar a page opens with: title, lead and facts on the left, summary cells and actions on the right |
| `ribbon` | The captioned command bar: `ribbon`, `ribbonGroup`, `command`, `splitCommand`, `dropCommand` |
| `appHeader` | `mountAppHeader(parent, {name, beta, right})`, `setBreadcrumb`, `refreshAppHeader`: the brand, the crumbs and a right side the app builds |
| `appFooter` | `appFooter(kids, maxWidth?)`, `pageFrame`, `listHost` |
| `markers` | Map markers: `loadMarkers(url)`, `markerImage(name, h, color)`; `paintIcon` and `loadImage` for any atlas |
| `teamEmblems` | `loadTeamEmblems(url)`, `teamEmblem(team, size, opacity)` |
| `zones` | `drawZones()`: zones and hills from a plain account of each one now |
| `floor` | Floor plans (rings with their heights): `floorBands`, `ringsAt` (an elevation slice), `floorPath`, `floorHeights`, `drawFloor` |

### Zones

`drawZones` knows nothing of films or timelines. The caller says what each zone is doing now, in world
units, and how world units map to the canvas, so a turned map works:

```ts
import { drawZones, type ZoneNow } from 'films-ui/zones';

const zones: ZoneNow[] = [
  { x: 12, y: -40, label: 'A', phase: 'controlled', owner: 0, shape: { cylinder: true, a: 6, b: 6, angle: 0 } },
  { x: 60, y: 8, label: 'B', phase: 'live', capturing: 1, progress: 0.4, inside: [1, 1] },
];
drawZones(ctx, (x, y) => [ox + x * zoom, oy - y * zoom], zoom, zones, { width, height });
```

Two optional arguments follow. The first styles them: `{ text, muted, bg, family }`, each falling back to
Films' look; Cartographer passes its Halo HUD colours and typeface. The second lists boxes on the canvas
(`{ x, y, w, h }`, CSS px) that the badges keep clear of: a badge over one, such as a weapon at the zone's
centre and its timer, is lifted just above it. A badge's footprint is fixed per zone, whatever its phase,
so a badge that moved stays put as the zone changes.

A zone is filled in its owner's colour, hatched with the contested marker while contested, ringed
by the capture's progress in the capturing team's colour, dashed with 'Live in N s' while a hill counts
down, a faint dashed outline while `off`, and carries its letter (or a hill's crown) from the marker
atlas, a pip per player inside, King of the Hill's point bars and a capture's flash. Team colours are
`TEAM`'s.

### Floors

A floor plan is the navigation floor of a level or a baked Forge map: rings of world-space points,
each with the heights it spans (`{ z: [min, max], hole, p: [x0, y0, ...] }`, levelcat's and the
extractor's format). `floorBands` groups the rings into height bands, lowest first; `drawFloor`
fills each band a little brighter than the one under it, with contour edges, so a map's storeys
read at a glance. `ringsAt` slices at an elevation, and `drawFloor` draws the rings it leaves out
faint under the rest:

```ts
import { floorHeights, floorBands, ringsAt, floorPath, drawFloor } from 'films-ui/floor';

const { min, max } = floorHeights(plan.rings)!;
const kept = ringsAt(plan.rings, followedHeight);  // or null for every floor
const bands = floorBands(kept, min, max);
ctx.setTransform(/* world to canvas */);
drawFloor(ctx, bands, null, { low: MAP.floor, high: MAP.floorHigh, edge: MAP.wall, away: MAP.nlv }, { unit: pxPerWorldUnit });
```

## Markers and emblems

`films-ui` ships no images: each app serves its own marker atlas and team emblems and says where, once
per page and the same way for each: `loadMarkers(url)` takes the URL of `markers.json` and
`loadTeamEmblems(url)` that of `teams.json`; the files an index names are fetched from beside it. Each returns a promise of what it loaded (undefined when it's unavailable), and
the first call's URL is the page's. The order doesn't matter: until they load, markers are left out (a
canvas redraws when `loadMarkers` resolves) and emblems stay hidden, then show.

## Checking

```sh
npm install
npm run check   # tsc --noEmit, strict
```

CI runs the same on every push and pull request, and checks that every import is relative. TypeScript
is the only package, pinned to one version, so there is no lockfile.

## License

[MIT](LICENSE). The icon shapes in `icons.ts` are [Lucide](https://lucide.dev)'s (ISC; some from
Feather, MIT), with their licences there.
