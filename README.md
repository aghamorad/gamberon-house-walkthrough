# Gamberon House — walkthrough

A photoreal walkthrough of a two-storey family house on the Iranian coast, rendered
in Blender with Cycles on Metal. The house is real, already built: the model is a
faithful record of it, not a design proposal.

Open `index.html`, or the published site.

## Two ways to move through it

**Photographs** — nine rendered views, one per principal space, with a note on what
each room is and what was chosen in it. Arrows, or the chips along the bottom, step
between them.

**360° tour** — fourteen equirectangular panoramas at 4096×2048. Drag to look
around, scroll or pinch to zoom, and use the markers to walk from one room to the
next. On a phone a thumb pad appears in the corner for looking around, and the floor
plan sits in the opposite corner showing where you are and which way you are facing.

The plan's dots are clickable; the markers on the view are the rooms you can reach
from where you are standing. The house can be navigated room by room in either
direction — nothing is a dead end.

## Interface

- **Notes** — opens the longer description of the current room.
- **Full screen** — hides the interface and leaves only the house.
- **Download** — saves the current view: the still at 2000×1250, or in the 360° tour
  the whole 4096×2048 equirectangular panorama, which any panorama player will open.
  Both are the same files the page displays, so nothing extra is fetched.
- **Hide** — clears the interface without going full screen.
- **فا / EN** — switches the interface between English and Persian. The Persian face
  is Vazirmatn, self-hosted, and the layout mirrors properly rather than only
  swapping the words.

## Running it locally

The viewer reads the panoramas with `fetch`/WebGL, so it needs to be served over
HTTP rather than opened from the filesystem:

```
python3 -m http.server 8000
```

## What is in here

```
index.html  styles.css  panorama.css      the two modes and their chrome
tour.js                                   the stills tour
panorama.js                               the 360° viewer and its WebGL renderer
plan.js                                   the floor plan, hotspot bearings, arrival angles
images/                                   the nine stills (2000x1250 JPEG)
panoramas/                                the fourteen panoramas (4096x2048 JPEG)
```

The renderer is self-contained WebGL with no CDN or library dependency, and the
fonts are self-hosted: the site is built to load on a slow or filtered connection
without reaching for anything off-origin.
