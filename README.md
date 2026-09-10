# Helix

Playable analog-style synthesizer in the browser.

## Features

- On-screen piano keyboard (2 octaves) with computer-keyboard mapping
- Waveforms: sine, triangle, sawtooth, square
- Filter (cutoff + resonance) and ADSR envelope knobs
- Octave shift, master level, oscilloscope + level meter
- Pressed keys light up
- Audio starts only after a user gesture (Enable audio / first note)

## Controls

| Input | Action |
| --- | --- |
| Z row + Q row | Play notes |
| Arrow up / down | Shift octave |
| Esc | All notes off |
| On-screen keys | Play (touch / mouse) |

## Run locally

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
npm run preview
```

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4
- Web Audio API
- Zustand
