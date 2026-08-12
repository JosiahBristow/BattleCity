# AGENTS.md

Browser-based Battle City (NES) clone in plain ES5 JavaScript. No build system, package manager, lint, typecheck, or task runner — there is no `package.json`. Everything runs in the browser via `<script>` tags.

## Run the game
Open `index.html` in a browser (a static file server also works). The game loop is a `setInterval` at 50 FPS that fires keyboard events, then `sceneManager.update()` + `sceneManager.draw(ctx)`.

## Tests
- Jasmine 1.2.0 (`lib/jasmine-1.2.0/`), specs in `spec/`, one file per source file (`src/Sprite.js` ↔ `spec/SpriteSpec.js`).
- A `SpecRunner.html` is provided that loads the three lib/jasmine assets, then every `src/*.js` in the exact `<script>` order of `index.html` (dependency order matters), then every `spec/*Spec.js`. Open it in a browser to run the specs.
- Specs assume the full global namespace; omitting any src file makes unrelated specs fail.

## Code conventions
- No modules: each `src/*.js` defines a global constructor function (e.g. `function Sprite(eventManager)`).
- New source files must be appended as `<script>` tags in `index.html` after their dependencies. `Utils.js` must always load first — it defines `Function.prototype.subclass` and `Object.size`.
- Fork-style inheritance: subclass with `X.subclass(Base)` and initialize the base with `Base.call(this)` in the constructor (see `src/Sprite.js:1-20`).
- Code style: 2-space indent, no semicolonless style, tests use Jasmine spies like `spyOn(sprite, 'doMove')`.

## Architecture
- `EventManager` (`src/EventManager.js`) is a pub/sub hub; objects subscribe and fire named string events (`Sprite.Event.MOVED` etc.). Unique event names are string constants on classes, e.g. `Sprite.Event.MOVED = 'Sprite.Event.MOVED'`.
- Game actors pair a `Sprite` (position, speed, direction, drawing via `Rect` inheritance) with a controller (`SpriteController`, `TankController`, etc.) that subscribes to keyboard events. `Updater`/`Painter` iterate sprites; `SceneManager` owns scenes and drives `update()`/`draw(ctx)` each tick.

## Assets
- Canvas is 16x14 tiles; world coordinates are in pixels (`Globals.UNIT_SIZE = 32`, `TILE_SIZE = 16`, `src/Globals.js`).
- `images/` PNGs are preloaded and looked up by name from the `images` map in `src/ImageManager.js` (`images/<name>.png`). Adding a new sprite requires both a new PNG and a map entry; a missing map entry silently breaks rendering.
- Sounds are `.ogg` in `sound/`; the pixel font is `fonts/prstart.ttf`.