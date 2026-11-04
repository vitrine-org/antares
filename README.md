# Antares for Vitrine

Widgets for [Vitrine](https://github.com/vitrine-widgets/vitrine) inspired by
[Sargas](https://www.deviantart.com/zren/art/Conky-Sargas-601690886), a Conky theme by zren:
a bold `.Weekday` in Metropolis Black, thin rings, an accent weather tile and the time in words,
drawn straight on your wallpaper.

| Widget | Size | |
|---|---|---|
| **Date**: the weekday with an accent dot, the date below | 3×1 to 8×3 | ![Date](src/date/preview.png) |
| **Weather**: today's conditions from [Open-Meteo](https://open-meteo.com), works offline from cache | 4×1 to 8×2 | ![Weather](src/weather/preview.png) |
| **System**: CPU, RAM, battery and optionally a disk as rings with values | 5×1 to 8×2 | ![System](src/system/preview.png) |
| **Word clock**: “Time is One.Forty Seven” | 3×1 to 8×2 | ![Word clock](src/wordclock/preview.png) |

Every widget has light or dark text, an accent color (or the Windows one), a soft text shadow and
an optional acrylic card for busy wallpapers.

## Install

Download `antares-2.0.0.vitrine` from the [latest release](https://github.com/vitrine-widgets/antares/releases/latest)
and double-click it. Vitrine adds the widgets to its gallery.

The Vitrine 1 theme lives on the [`v1`](https://github.com/vitrine-widgets/antares/tree/v1) branch.

## Build

```sh
npm install
npm run pack      # → antares-2.0.0.vitrine
```

`package.json` points `@vitrine/sdk` at `file:../../vitrine-sdk` for local builds; releases use
`github:vitrine-widgets/sdk#v2.0.0`. Preview a widget with
`vitrine render dist system --cells 5x1 --scale 2 --out system.png`.

## License

MIT. Metropolis and Montserrat are bundled under the SIL Open Font License 1.1 (see `LICENSE`).
