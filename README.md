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

Cartographer runs no Node. Its Rust server serves the files under `src/` transpiled on request with the
[oxc](https://oxc.rs) crate, so the browser loads them as plain ES modules. Every relative import names
its file with `.js` (`./dom.js` for `dom.ts`), and every file transpiles on its own (`isolatedModules`),
so a server that answers `dom.js` with `dom.ts` stripped of its types is all it takes.

The one bare import is `lucide` (in `icons.ts`), the icons' shapes and the only runtime dependency. A
page loaded without a bundler maps it to lucide's ES module build with an import map:

```html
<script type="importmap">{ "imports": { "lucide": "/vendor/lucide/lucide.js" } }</script>
```

## Contents

Each module is `src/<name>.ts`, imported as `films-ui/<name>`; `films-ui` alone is all of them.

| Module | What |
|---|---|
| `tokens` | The design tokens, the only hex literals: colours `C`, team colours `TEAM` (by team id), the map's palette `MAP`, `alpha()`, spacing `S`, type `T`, heights `H`, `BAR` and `ROW`, icon sizes `ICON`, `RADIUS`, `FONT`, `MONO` |
| `styles` | `mountStyles(...extra)`: the one injected stylesheet (custom properties, focus, hover, disabled, touch sizes, breakpoints, card tables, keyframes, reduced motion), with the app's own rules after it |
| `dom` | `el()`, the atom every part is built from, and `btn`, `row`, `col`, `bar`, `barEl`, `ui`/`UI` (the stylesheet's hooks), `chip`, `swatch`, `tag`, `countTag`, `codeTag`, `botTag`, `itemChip`, `ago`, `skel`, `setActive`, `setDisabled`, and the cssText constants (`NUM`, `CAPS`, `TRUNCATE`, `SPACER`, `STRIP`, `BTN_RESET`, `SR_ONLY`) |
| `format` | Times, durations, counts and ranges as text |
| `icons` | Lucide icons rendered to SVG, one meaning each; `tint`, `spinner`, `statusIcon`, `mapKind` |
| `button` | The one button factory, `iconButton`, `buttonGroup`, `busy`, `link` |
| `controls` | `toggle`, `iconToggle`, `segmented`, `tabs`, `textInput`, `copyChip`, `copyValue` |
| `menu` | `menu`, `dropdown`, `select`, `popover`, `tooltip`, `hoverCard`, `sheet`, `closeOverlays` |
| `cells` | Joined cells, the scoreboard's look, and `teamBand` |
| `section` | `section`, `pageColumn`, `band`, `statStrip` |
| `status` | `notice`, `toast`, `copyWithToast`, `statusList`, `stateTag`, `statusDot`, `emptyState`, `progressPanel`, `infoMark` |
| `table` | `dataTable`, `kvGrid` |
| `masthead` | The bar a page opens with: title, lead and facts on the left, summary cells and actions on the right |
| `ribbon` | The captioned command bar: `ribbon`, `ribbonGroup`, `command`, `splitCommand`, `dropCommand` |
| `appHeader` | `mountAppHeader(parent, {name, beta, right})`, `setBreadcrumb`, `refreshAppHeader`: the brand, the crumbs and a right side the app builds |
| `appFooter` | `appFooter(kids, maxWidth?)`, `pageFrame`, `listHost` |
| `markers` | The game's map markers: `loadMarkers(url)`, `markerImage(name, h, color)`; `paintIcon` and `loadImage` for any atlas |
| `teamEmblems` | `setTeamEmblemIndex(url)`, `teamEmblem(team, size, opacity)` |
| `zones` | `drawZones()`: zones and hills from a plain account of each one now |

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

A zone is filled in its owner's colour, hatched with the game's contested marker while contested, ringed
by the capture's progress in the capturing team's colour, dashed with 'Live in N s' while a hill counts
down, a faint dashed outline while `off`, and carries its letter (or a hill's crown) from the marker
atlas, a pip per player inside, King of the Hill's point bars and a capture's flash. Team colours are
`TEAM`'s.

## No game assets

`films-ui` carries no art from the game: no icons, atlases or emblems. Those stay with each app. A part
that draws them is told where they are served: `loadMarkers(url)` takes the URL of `markers.json` (the
atlas it names is fetched from beside it), `setTeamEmblemIndex(url)` that of `teams.json`. Until they
load, markers are left out and emblems hidden.

## Checking

```sh
npm install
npm run check   # tsc --noEmit, strict
```

CI runs the same on every push and pull request.

## License

[MIT](LICENSE).
