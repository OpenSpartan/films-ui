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

## No game assets

`films-ui` carries no art from the game: no icons, atlases or emblems. Those stay with each app. A part
that draws them is told where they are served, or is handed the loaded image.

## Checking

```sh
npm install
npm run check   # tsc --noEmit, strict
```

CI runs the same on every push and pull request.

## License

[MIT](LICENSE).
