/* Gamberon House — the 360 degree room tour.
   Plain script, no build step, no dependencies, no CDN. Everything here is raw
   WebGL and DOM, because the people this link gets sent to are reading it from
   Iran, where a library pulled off a CDN is one more thing that can fail to
   arrive.

   The panoramas are equirectangular. In those images the middle of the picture
   faces world +Y, and moving right in the image goes east (+X) -- measured from
   the model rather than assumed, see probe_equirect. North is +Y, so the sea,
   which is south of the plot, sits at the left and right edges of every view.

   Each room is a point in the plan with a direction to face on arrival. The map
   beside the view is traced from the model's own floors (see make_plan.py), so
   the dots land where the rooms really are. */

(function () {
  'use strict';

  /* ---------- the rooms ---------- */

  // x, y, z are metres in the model's own coordinates, z being the height the
  // panorama was rendered from. yaw0 is the compass bearing to face on arrival,
  // 0 = north (+Y), positive = east (+X).
  const PANO = [
    { slug: '01-courtyard',        x: 3.00, y:  6.50, z: 1.48, level: 'ground', yaw0:    0, still: '02-pool-courtyard' },
    { slug: '02-entry-hall',       x: 5.25, y: 12.50, z: 1.62, level: 'ground', yaw0:  180, still: null },
    { slug: '03-living-room',      x: 9.25, y:  5.75, z: 1.88, level: 'ground', yaw0:  -90, still: '04-living-room' },
    { slug: '04-dining-room',      x: 8.00, y: 11.50, z: 1.84, level: 'ground', yaw0:  180, still: '06-dining-room' },
    { slug: '05-kitchen',          x: 9.00, y: 16.50, z: 1.84, level: 'ground', yaw0:    0, still: '05-kitchen' },
    { slug: '06-north-atrium',     x: 8.25, y: 20.25, z: 1.83, level: 'ground', yaw0:  180, still: null, from: '08-north-atrium' },
    { slug: '07-guest-bedroom',    x: 2.25, y: 15.00, z: 1.89, level: 'ground', yaw0:    0, still: '09-guest-bedroom', from: '06-guest-bedroom' },
    { slug: '08-guest-bathroom',   x: 2.25, y: 19.00, z: 1.86, level: 'ground', yaw0:    0, still: null, from: '07-guest-bathroom' },
    { slug: '09-stair-landing',    x: 5.25, y: 14.00, z: 5.56, level: 'upper',  yaw0:  135, still: null, from: '14-stair-landing' },
    { slug: '10-roof-terrace',     x: 8.50, y:  7.00, z: 5.58, level: 'upper',  yaw0:  180, still: '03-roof-terrace', from: '09-roof-terrace' },
    { slug: '11-master-bedroom',   x: 9.00, y: 14.50, z: 5.65, level: 'upper',  yaw0:  -90, still: '07-master-bedroom', from: '10-master-bedroom' },
    { slug: '12-master-bathroom',  x: 9.00, y: 18.00, z: 5.61, level: 'upper',  yaw0:    0, still: '08-master-bathroom', from: '11-master-bathroom' },
    { slug: '13-guest-bedroom-up', x: 2.25, y: 14.50, z: 5.65, level: 'upper',  yaw0:  315, still: '09-guest-bedroom', from: '12-guest-bedroom-up' },
    { slug: '14-guest-bathroom-up', x: 2.25, y: 18.25, z: 5.61, level: 'upper', yaw0:    0, still: null, from: '13-guest-bathroom-up' }
  ];

  // The file each room reads, and the rooms reachable on foot from it. Going
  // round the list is the walk; the extras are the shortcuts that exist in the
  // plan -- the living room opens straight onto the courtyard, the terrace onto
  // the master bedroom -- and they are what make the tour feel like the house
  // rather than a slideshow.
  const LINKS = {
    '01-courtyard':        ['02-entry-hall', '03-living-room'],
    '02-entry-hall':       ['09-stair-landing', '07-guest-bedroom'],
    '03-living-room':      ['04-dining-room', '01-courtyard'],
    '04-dining-room':      ['05-kitchen', '03-living-room'],
    '05-kitchen':          ['06-north-atrium', '04-dining-room'],
    '06-north-atrium':     ['05-kitchen', '02-entry-hall'],
    '07-guest-bedroom':    ['08-guest-bathroom', '02-entry-hall'],
    '08-guest-bathroom':   ['07-guest-bedroom'],
    '09-stair-landing':    ['10-roof-terrace', '11-master-bedroom', '13-guest-bedroom-up'],
    '10-roof-terrace':     ['11-master-bedroom', '09-stair-landing'],
    '11-master-bedroom':   ['12-master-bathroom', '09-stair-landing'],
    '12-master-bathroom':  ['11-master-bedroom'],
    '13-guest-bedroom-up': ['14-guest-bathroom-up', '09-stair-landing'],
    '14-guest-bathroom-up': ['13-guest-bedroom-up']
  };

  // Copy for the rooms the stills tour does not already describe. Where a still
  // covers the same room the rest of the text is borrowed from it, so the two
  // modes never disagree about the house.
  const EXTRA = {
    '02-entry-hall': {
      en: { name: 'The entry hall',
            note: 'Arrival between the courtyard and the stair, with glass on both sides so you are outside for one step longer than you expect.' },
      fa: { name: 'ورودی',
            note: 'ورودی میان حیاط و پله؛ دو طرف شیشه است، پس یک قدم بیشتر از آنچه فکر می‌کنید بیرون می‌مانید.' }
    },
    '08-guest-bathroom': {
      en: { name: 'The guest bathroom',
            note: 'The same painted plaster and pale stone as the bathrooms upstairs, on the quiet side of the house.' },
      fa: { name: 'حمام مهمان',
            note: 'همان گچ رنگ‌شده و سنگ روشنِ حمام‌های طبقهٔ بالا، در سوی آرام خانه.' }
    },
    '14-guest-bathroom-up': {
      en: { name: 'The upstairs guest bathroom',
            note: 'Wall-hung fittings and painted walls, with the floor left clear.' },
      fa: { name: 'حمام مهمان طبقهٔ بالا',
            note: 'تجهیزات دیوارکوب و دیوارهای رنگ‌شده، با کفی که خالی مانده است.' }
    },
    '06-north-atrium': {
      en: { name: 'The planted atrium',
            note: 'The north end of the plan, lit from a rooflight and planted with three trees. Glass on both sides borrows the garden for the kitchen and the hall.' },
      fa: { name: 'حیاط سرپوشیده',
            note: 'انتهای شمالی پلان، روشن از یک نورگیر و کاشته با سه درخت. شیشهٔ دو طرف، باغچه را به آشپزخانه و راهرو قرض می‌دهد.' }
    },
    '07-guest-bedroom': {
      en: { name: 'The ground-floor guest bedroom',
            note: 'The guest room on the quiet west side, reached off the entry hall, with its bathroom next door. One bed, one picture above it, and the floor left open.' },
      fa: { name: 'اتاق خواب مهمان در طبقهٔ همکف',
            note: 'اتاق مهمان در سوی آرام غرب، از راهرو وارد می‌شود و حمامش در کنار است. یک تخت، یک تصویر بالای آن، و کفی که باز مانده.' }
    },
    '09-stair-landing': {
      en: { name: 'The stair landing',
            note: 'Where the two wings meet: the bedrooms to the west, the terrace to the south, the stair down to the hall.' },
      fa: { name: 'پاگرد',
            note: 'جایی که دو بال به هم می‌رسند: اتاق‌های خواب در غرب، تراس در جنوب، و پله رو به پایین به راهرو.' }
    }
  };

  const STR = {
    en: {
      toStills: 'Photographs',
      toTour: '360° tour',
      title: 'Switch between the photographs and the walkable 360° tour',
      hint: 'Drag to look around · step into a room by clicking its marker · scroll to zoom',
      hintTouch: 'Drag the picture to look around · pinch to zoom · tap a room marker to step into it',
      ground: 'Ground floor',
      upper: 'Upper floor',
      loading: 'Loading the room…',
      unsupported: 'This browser cannot show the 360° tour. The photographs are still here.'
    },
    fa: {
      toStills: 'عکس‌ها',
      toTour: 'تور ۳۶۰ درجه',
      title: 'جابه‌جایی میان عکس‌ها و تور ۳۶۰ درجه',
      hint: 'برای نگاه کردن بکشید · با کلیک روی نشان هر اتاق وارد آن شوید · برای بزرگ‌نمایی اسکرول کنید',
      hintTouch: 'برای نگاه کردن تصویر را بکشید · برای بزرگ‌نمایی دو انگشت بگذارید · برای ورود به اتاق روی نشان آن بزنید',
      ground: 'طبقهٔ همکف',
      upper: 'طبقهٔ بالا',
      loading: 'اتاق در حال بارگذاری…',
      unsupported: 'این مرورگر تور ۳۶۰ درجه را نشان نمی‌دهد. عکس‌ها همچنان در دسترس‌اند.'
    }
  };

  /* ---------- element handles ---------- */

  const stage = document.querySelector('.stage');
  const rail = document.getElementById('rail');
  const hint = document.getElementById('hint');
  const loader = document.getElementById('loader');
  const elNum = document.getElementById('roomNum');
  const elName = document.getElementById('roomName');
  const elNote = document.getElementById('roomNote');
  const elDetail = document.getElementById('roomDetail');
  const elPoints = document.getElementById('roomPoints');
  const btnSave = document.getElementById('btnSave');

  const canvas = document.createElement('canvas');
  canvas.id = 'pano';
  canvas.setAttribute('aria-label', 'Panoramic view of the room');
  document.body.insertBefore(canvas, document.querySelector('.bar-top'));

  const overlay = document.createElement('div');
  overlay.className = 'pano-overlay';
  document.body.appendChild(overlay);

  const mapWrap = document.createElement('div');
  mapWrap.className = 'minimap';
  mapWrap.innerHTML = '<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Floor plan"></svg>';
  document.body.appendChild(mapWrap);

  const mapSvg = mapWrap.querySelector('svg');

  const busy = document.createElement('div');
  busy.className = 'pano-busy';
  document.body.appendChild(busy);

  /* ---------- state ---------- */

  let lang = 'en';
  let open = false;
  let cur = -1;
  let yaw = 0;
  let pitch = 0;
  // Vertical field of view in radians, and the zoom limits either side of
  // it. 1.0 rad is 57 degrees up and 86 across on a laptop-shaped window,
  // which is about a 21 mm lens -- wide enough to read a room, not so wide
  // that the walls bend the way a fisheye does.
  const FOV_ARRIVE = 1.0;
  let fov = FOV_ARRIVE;
  let wantYaw = 0;
  let wantPitch = 0;
  let texture = null;
  let pending = 0;         // token, so a slow load cannot overwrite a fast one
  let dragFrom = null;
  let pinching = null;
  let needsDraw = true;
  const warmers = [];      // held so the browser actually finishes loading them

  /* ---------- WebGL ---------- */

  const gl = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false });

  const VS = 'attribute vec2 aPos; varying vec2 vNdc;' +
    'void main(){ vNdc = aPos; gl_Position = vec4(aPos, 0.0, 1.0); }';

  /* The ray is built from an explicit basis rather than by composing rotations:
     the camera looks down -Z, so a yaw about Z would spin the picture around its
     own centre instead of turning the view. Basis is east, north, up. Yaw 0
     faces north and increasing yaw turns east, which is what the rendered
     equirects were measured to do. */
  const FS =
    'precision highp float;\n' +
    'varying vec2 vNdc;\n' +
    'uniform sampler2D uTex;\n' +
    'uniform float uYaw, uPitch, uTan, uAspect;\n' +
    'const float PI = 3.141592653589793;\n' +
    'void main(){\n' +
    '  vec3 r = vec3(vNdc.x * uTan * uAspect, vNdc.y * uTan, -1.0);\n' +
    '  float cp = cos(uPitch), sp = sin(uPitch);\n' +
    '  float across = r.x;\n' +
    '  float up = r.y * cp - r.z * sp;\n' +
    '  float fwd = -r.z * cp - r.y * sp;\n' +
    '  float cy = cos(uYaw), sy = sin(uYaw);\n' +
    '  vec3 w = across * vec3(cy, -sy, 0.0)\n' +
    '         + up * vec3(0.0, 0.0, 1.0)\n' +
    '         + fwd * vec3(sy, cy, 0.0);\n' +
    '  w = normalize(w);\n' +
    '  float lon = atan(w.x, w.y);\n' +
    '  float lat = asin(clamp(w.z, -1.0, 1.0));\n' +
    '  vec2 uv = vec2(0.5 + lon / (2.0 * PI), 0.5 - lat / PI);\n' +
    '  gl_FragColor = vec4(texture2D(uTex, uv).rgb, 1.0);\n' +
    '}';

  let prog = null;
  let uniforms = null;

  function compile() {
    const vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vs, VS);
    gl.compileShader(vs);
    const fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fs, FS);
    gl.compileShader(fs);
    if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(fs));
    }
    const p = gl.createProgram();
    gl.attachShader(p, vs);
    gl.attachShader(p, fs);
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(p));
    }
    gl.useProgram(p);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1, 1, -1, -1, 1,
      -1, 1, 1, -1, 1, 1
    ]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(p, 'aPos');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    uniforms = {
      tex: gl.getUniformLocation(p, 'uTex'),
      yaw: gl.getUniformLocation(p, 'uYaw'),
      pitch: gl.getUniformLocation(p, 'uPitch'),
      tan: gl.getUniformLocation(p, 'uTan'),
      aspect: gl.getUniformLocation(p, 'uAspect')
    };
    prog = p;
  }

  function upload(image) {
    const max = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    let src = image;
    if (image.width > max || image.height > max) {
      const w = Math.min(image.width, max);
      const h = Math.round(image.height * w / image.width);
      const c = document.createElement('canvas');
      c.width = w;
      c.height = h;
      c.getContext('2d').drawImage(image, 0, 0, w, h);
      src = c;
    }
    if (texture) gl.deleteTexture(texture);
    texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    // S repeats so the two edges of the equirect meet without a seam; T clamps
    // so the poles do not bleed into each other.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, src);
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
    const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      needsDraw = true;
    }
  }

  function draw() {
    if (!prog || !texture) return;
    resize();
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.useProgram(prog);
    gl.uniform1i(uniforms.tex, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1f(uniforms.yaw, yaw);
    gl.uniform1f(uniforms.pitch, pitch);
    gl.uniform1f(uniforms.tan, Math.tan(fov / 2));
    gl.uniform1f(uniforms.aspect, canvas.clientWidth / Math.max(1, canvas.clientHeight));
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    placeHotspots();
  }

  /* ---------- looking around ---------- */

  const MAX_PITCH = 1.45;

  function clampPitch() {
    if (pitch > MAX_PITCH) pitch = MAX_PITCH;
    if (pitch < -MAX_PITCH) pitch = -MAX_PITCH;
    // The target is clamped too. Otherwise a drag past the stop leaves the
    // target far beyond it and the view sits still through the whole drag back.
    if (wantPitch > MAX_PITCH) wantPitch = MAX_PITCH;
    if (wantPitch < -MAX_PITCH) wantPitch = -MAX_PITCH;
  }

  // A drag of one pixel should move the picture one pixel, which is not a fixed
  // number of radians: it depends on how wide the window is and how far in the
  // viewer has zoomed.
  function perPixel() {
    const h = Math.max(1, canvas.clientHeight);
    const w = Math.max(1, canvas.clientWidth);
    const fovH = 2 * Math.atan(Math.tan(fov / 2) * (w / h));
    return { x: fovH / w, y: fov / h };
  }

  canvas.addEventListener('pointerdown', e => {
    if (e.pointerType === 'touch' && e.isPrimary === false) return;
    canvas.setPointerCapture(e.pointerId);
    dragFrom = { x: e.clientX, y: e.clientY };
    canvas.classList.add('grabbing');
  });

  canvas.addEventListener('pointermove', e => {
    if (!dragFrom) return;
    const k = perPixel();
    wantYaw += (e.clientX - dragFrom.x) * k.x;
    wantPitch += (e.clientY - dragFrom.y) * k.y;
    dragFrom = { x: e.clientX, y: e.clientY };
  });

  function endDrag(e) {
    if (!dragFrom) return;
    dragFrom = null;
    canvas.classList.remove('grabbing');
    if (e && e.pointerId !== undefined && canvas.hasPointerCapture(e.pointerId)) {
      canvas.releasePointerCapture(e.pointerId);
    }
  }
  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);

  canvas.addEventListener('wheel', e => {
    e.preventDefault();
    fov = Math.max(0.62, Math.min(1.85, fov * Math.exp(e.deltaY * 0.0012)));
    needsDraw = true;
  }, { passive: false });

  // Two fingers to zoom, matching the wheel.
  const touches = new Map();
  canvas.addEventListener('touchstart', e => {
    for (const t of e.changedTouches) touches.set(t.identifier, { x: t.clientX, y: t.clientY });
    if (touches.size === 2) {
      const [a, b] = [...touches.values()];
      pinching = { d: Math.hypot(a.x - b.x, a.y - b.y), fov: fov };
    }
  }, { passive: true });

  canvas.addEventListener('touchmove', e => {
    for (const t of e.changedTouches) touches.set(t.identifier, { x: t.clientX, y: t.clientY });
    if (pinching && touches.size === 2) {
      const [a, b] = [...touches.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      fov = Math.max(0.62, Math.min(1.85, pinching.fov * pinching.d / Math.max(1, d)));
      needsDraw = true;
    }
  }, { passive: true });

  canvas.addEventListener('touchend', e => {
    for (const t of e.changedTouches) touches.delete(t.identifier);
    if (touches.size < 2) pinching = null;
  }, { passive: true });

  /* ---------- the thumb pad ---------- */

  // A touchscreen has no keyboard and no wheel, so turning has to live somewhere
  // on the glass. Dragging the picture does work, but nothing says so, and
  // somebody handed the link should not have to discover it. The pad is that
  // half made visible. It exists in the DOM everywhere and the stylesheet only
  // reveals it where there is a finger to press it with.
  //
  // It pans for as long as it is held rather than stepping once per press: a
  // tour is looked around in, not paged through.

  const coarse = window.matchMedia('(hover: none), (pointer: coarse)');
  const PAD_RATE = 560;          // pixels per second at full deflection
  let padVec = null;
  let padAt = null;

  function buildPad() {
    const CHEV = {
      left:  'M15 4 7 12l8 8',
      right: 'M9 4l8 8-8 8',
      up:    'M4 15l8-8 8 8',
      down:  'M4 9l8 8 8-8'
    };
    const pad = document.createElement('div');
    pad.className = 'pano-pad';
    pad.setAttribute('role', 'group');
    pad.setAttribute('aria-label', 'Look around');

    // Screen directions, not world ones: up is up in the picture.
    for (const [dir, dx, dy] of [['left', -1, 0], ['right', 1, 0], ['up', 0, -1], ['down', 0, 1]]) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'pad-key pad-' + dir;
      b.setAttribute('aria-label', dir);
      b.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' +
                    CHEV[dir] + '"/></svg>';
      hold(b, dx, dy);
      pad.appendChild(b);
    }
    document.body.appendChild(pad);
  }

  function hold(btn, dx, dy) {
    const press = e => {
      e.preventDefault();
      if (btn.setPointerCapture) {
        try { btn.setPointerCapture(e.pointerId); } catch (err) { /* not capturable */ }
      }
      padVec = { x: dx, y: dy };
      btn.classList.add('on');
      needsDraw = true;
    };
    // Capture means the finger can slide off the key and keep turning, so the
    // release is what ends it — not leaving the button.
    const release = () => {
      if (padVec && padVec.x === dx && padVec.y === dy) padVec = null;
      btn.classList.remove('on');
    };
    btn.addEventListener('pointerdown', press);
    btn.addEventListener('pointerup', release);
    btn.addEventListener('pointercancel', release);
    btn.addEventListener('contextmenu', e => e.preventDefault());
  }

  /* ---------- stepping between rooms ---------- */

  const bySlug = slug => PANO.findIndex(p => p.slug === slug);

  function step(delta) {
    if (!PANO.length) return;
    let next;
    if (cur < 0) next = 0;
    else next = (cur + delta + PANO.length) % PANO.length;
    show(next);
  }

  // Which room a bearing falls in. Used by the arrows and the rail, so arriving
  // from anywhere turns to face something rather than landing mid-wall.
  function show(i, faceBearing) {
    const room = PANO[i];
    if (!room) return;
    cur = i;
    yaw = wantYaw = ((faceBearing === undefined ? room.yaw0 : faceBearing) * Math.PI) / 180;
    pitch = wantPitch = 0;
    fov = FOV_ARRIVE;
    needsDraw = true;

    paint(room);
    buildRail();
    load(room);
    placeHotspots();
  }

  function load(room) {
    const token = ++pending;
    const url = 'panoramas/' + (room.from || room.slug) + '.jpg';
    busy.classList.add('on');

    const img = new Image();
    img.onload = () => {
      if (token !== pending) return;
      try {
        upload(img);
      } catch (err) {
        busy.classList.remove('on');
        return;
      }
      busy.classList.remove('on');
      needsDraw = true;
      if (loader && !loader.classList.contains('gone')) {
        loader.classList.add('gone');
        setTimeout(() => loader.remove(), 600);
      }
      if (hint) setTimeout(() => hint.classList.add('gone'), 6000);
    };
    img.onerror = () => {
      if (token !== pending) return;
      busy.classList.remove('on');
    };
    img.src = url;

    // The room next along is the one most likely to be asked for next. Held in
    // an array because an Image with no reference can be collected before it
    // has finished loading, which is the whole point of loading it.
    const ahead = PANO[(cur + 1) % PANO.length];
    if (ahead && ahead !== room) {
      const warm = new Image();
      warm.src = 'panoramas/' + (ahead.from || ahead.slug) + '.jpg';
      warmers.push(warm);
      if (warmers.length > 3) warmers.shift();
    }
  }

  /* ---------- the caption ---------- */

  function copyFor(room) {
    const still = room.still && typeof ROOMS !== 'undefined'
      ? ROOMS.find(r => r.slug === room.still)
      : null;
    const extra = EXTRA[room.slug] || {};
    const out = {};
    for (const code of ['en', 'fa']) {
      const a = extra[code] || {};
      const b = (still && still[code]) || {};
      out[code] = {
        name: a.name || b.name || '',
        note: a.note || b.note || '',
        detail: a.detail || b.detail || '',
        points: a.points || b.points || []
      };
    }
    return out;
  }

  function paint(room) {
    const copy = copyFor(room)[lang];
    elNum.textContent = String(cur + 1).padStart(2, '0');
    elName.textContent = copy.name;
    elNote.textContent = copy.note;
    elDetail.textContent = copy.detail;
    elPoints.innerHTML = '';
    copy.points.forEach(p => {
      const li = document.createElement('li');
      li.textContent = p;
      elPoints.appendChild(li);
    });
    btnSave.href = 'panoramas/' + (room.from || room.slug) + '.jpg';
    btnSave.setAttribute('download', room.slug + '.jpg');
    document.title = (lang === 'fa' ? 'خانهٔ گمبرون' : 'Gamberon House') + ' · ' + copy.name;
    drawMap();
  }

  function buildRail() {
    rail.innerHTML = '';
    PANO.forEach((room, i) => {
      const chip = document.createElement('button');
      chip.className = 'chip';
      chip.type = 'button';
      chip.textContent = String(i + 1).padStart(2, '0') + '  ' + copyFor(room)[lang].name;
      chip.setAttribute('aria-current', i === cur ? 'true' : 'false');
      chip.addEventListener('click', () => show(i));
      rail.appendChild(chip);
    });
    const active = rail.children[cur];
    if (active && active.scrollIntoView) {
      active.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
    }
  }

  /* ---------- markers for the rooms next door ---------- */

  /* The same projection the shader runs, on the CPU, so a marker lands on the
     doorway it belongs to. World is east, north, up; yaw 0 faces north and
     increasing yaw turns east. Keep this and the fragment shader in step or the
     markers drift off their rooms. */
  function project(px, py, pz) {
    const room = PANO[cur];
    const vx = px - room.x;
    const vy = py - room.y;
    const vz = pz - room.z;

    const cy = Math.cos(yaw), sy = Math.sin(yaw);
    const cp = Math.cos(pitch), sp = Math.sin(pitch);
    const along = vx * sy + vy * cy;
    const across = vx * cy - vy * sy;
    const up = vz * cp + along * sp;
    const fwd = along * cp - vz * sp;

    const tan = Math.tan(fov / 2);
    // How far towards the edge a marker may sit before it is pinned there.
    const EDGE = 0.88;

    // Behind you there is no honest screen position to project to, and dropping
    // the marker would leave a room whose only way on is over your shoulder
    // invisible. So it is pinned to whichever edge the shorter turn brings it in
    // from: across is the frame's lateral axis, so its sign is that side. Dead
    // astern it picks an edge arbitrarily, and the first drag corrects it.
    if (fwd <= 0.05) {
      const side = across >= 0 ? 1 : -1;
      const horiz = Math.hypot(vx, vy) || 1e-6;
      let ny = Math.tan(Math.atan2(vz, horiz) - pitch) / tan;
      ny = Math.max(-EDGE, Math.min(EDGE, ny));
      return { x: side > 0 ? (1 + EDGE) * 50 : (1 - EDGE) * 50,
               y: (1 - ny) * 50, off: true };
    }

    const h = Math.max(1, canvas.clientHeight);
    const w = Math.max(1, canvas.clientWidth);
    let ndcX = (across / fwd) / (tan * (w / h));
    let ndcY = (up / fwd) / tan;

    // In front but off the side of the frame: pushed out to the same edge rather
    // than dropped, so the reader gets "it is over there" instead of an empty
    // view with no way on.
    const m = Math.max(Math.abs(ndcX), Math.abs(ndcY));
    const off = m > EDGE;
    if (off) {
      ndcX = (ndcX / m) * EDGE;
      ndcY = (ndcY / m) * EDGE;
    }
    return { x: (ndcX + 1) * 50, y: (1 - ndcY) * 50, off: off };
  }

  function placeHotspots() {
    if (!open) return;
    const room = PANO[cur];
    const links = LINKS[room.slug] || [];
    const seen = new Set();
    let used = 0;

    links.forEach(slug => {
      const i = bySlug(slug);
      if (i < 0 || seen.has(slug) || i === cur) return;
      seen.add(slug);
      const target = PANO[i];
      const at = project(target.x, target.y, target.z);
      let el = overlay.querySelector('[data-slug="' + slug + '"]');
      if (!at) {
        if (el) el.remove();
        return;
      }
      if (!el) {
        el = document.createElement('button');
        el.className = 'hotspot';
        el.type = 'button';
        el.dataset.slug = slug;
        el.addEventListener('click', () => show(bySlug(slug)));
        overlay.appendChild(el);
      }
      const label = copyFor(target)[lang].name;
      el.textContent = '';
      const dot = document.createElement('span');
      dot.className = 'hotspot-dot';
      const text = document.createElement('span');
      text.className = 'hotspot-label';
      text.textContent = label;
      el.appendChild(dot);
      el.appendChild(text);
      el.style.left = at.x + '%';
      el.style.top = at.y + '%';
      // Pinned to the edge means the room is off screen behind you; the label
      // is dimmed so it reads as a direction rather than as something in view.
      el.classList.toggle('off', !!at.off);
      used++;
    });

    overlay.querySelectorAll('.hotspot').forEach(el => {
      if (!seen.has(el.dataset.slug)) el.remove();
    });
    overlay.classList.toggle('has-any', used > 0);
  }

  /* ---------- the plan ---------- */

  function drawMap() {
    if (typeof PLAN === 'undefined') return;
    const room = PANO[cur];
    const level = room.level === 'upper' ? 'upper' : 'ground';
    const [x0, x1, y0, y1] = PLAN.extent;
    const pad = 1.0;
    mapSvg.setAttribute('viewBox',
      (x0 - pad) + ' ' + (y0 - pad) + ' ' + (x1 - x0 + 2 * pad) + ' ' + (y1 - y0 + 2 * pad));
    // SVG y runs down the screen and the plan's y runs north, so the whole map
    // is flipped once here rather than at every use.
    const flip = 'translate(0,' + (y0 + y1) + ') scale(1,-1)';
    mapSvg.innerHTML = '';

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    (PLAN[level] || []).forEach(r => {
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', r[0]);
      rect.setAttribute('y', r[1]);
      rect.setAttribute('width', r[2]);
      rect.setAttribute('height', r[3]);
      g.appendChild(rect);
    });
    g.setAttribute('transform', flip);
    g.setAttribute('class', 'map-floor');
    mapSvg.appendChild(g);

    const marks = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    marks.setAttribute('class', 'map-marks');
    PANO.forEach((p, i) => {
      const on = p.level === level;
      const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      dot.setAttribute('cx', p.x);
      dot.setAttribute('cy', p.y);
      dot.setAttribute('r', i === cur ? 0.42 : 0.28);
      dot.setAttribute('class', 'map-dot' + (i === cur ? ' current' : on ? '' : ' other-level'));
      if (on) {
        dot.setAttribute('tabindex', '0');
        dot.setAttribute('role', 'button');
        dot.addEventListener('click', () => show(i));
      }
      marks.appendChild(dot);
    });

    // A wedge showing which way the viewer is facing. These are the plan's own
    // coordinates -- east and north -- and the group's flip handles the screen,
    // so a bearing is just (sin yaw, cos yaw) here.
    const p = PANO[cur];
    const cone = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const r = 2.3;
    const spread = 0.5;
    const dx = Math.sin(yaw), dy = Math.cos(yaw);
    const cs = Math.cos(spread), sn = Math.sin(spread);
    cone.setAttribute('d', [
      'M', p.x, p.y,
      'L', p.x + r * (dx * cs - dy * sn), p.y + r * (dx * sn + dy * cs),
      'L', p.x + r * (dx * cs + dy * sn), p.y + r * (-dx * sn + dy * cs),
      'Z'
    ].join(' '));
    cone.setAttribute('class', 'map-cone');
    marks.appendChild(cone);
    marks.setAttribute('transform', flip);
    mapSvg.appendChild(marks);
  }

  /* ---------- open and close ---------- */

  function setOpen(on) {
    if (on === open) return;
    open = on;
    document.body.classList.toggle('pano-open', open);
    if (open) {
      if (cur < 0) {
        // Arrive at whichever room the photograph on screen is of.
        const showing = typeof ROOMS !== 'undefined' ? ROOMS[0] : null;
        const match = showing ? PANO.findIndex(p => p.still === showing.slug) : -1;
        cur = match >= 0 ? match - 1 : 0;
      }
      const i = cur < 0 ? 0 : cur;
      cur = -1;
      show(i);
      needsDraw = true;
    } else {
      overlay.innerHTML = '';
      hint.classList.remove('gone');
    }
    setLang(lang);
  }

  function setLang(code) {
    lang = code === 'fa' ? 'fa' : 'en';
    const t = STR[lang];
    if (modeBtn) {
      modeBtn.textContent = open ? t.toStills : t.toTour;
      modeBtn.title = t.title;
      modeBtn.lang = lang === 'fa' ? 'fa' : 'en';
    }
    mapWrap.setAttribute('aria-label', lang === 'fa' ? 'پلان طبقه' : 'Floor plan');
    if (open) {
      hint.textContent = coarse.matches ? t.hintTouch : t.hint;
      const room = PANO[cur];
      if (room) paint(room);
      buildRail();
      placeHotspots();
    }
  }

  let modeBtn = null;

  function mount() {
    modeBtn = document.createElement('button');
    modeBtn.className = 'tool';
    modeBtn.type = 'button';
    modeBtn.id = 'btnMode';
    modeBtn.setAttribute('aria-pressed', 'false');
    modeBtn.addEventListener('click', () => setOpen(!open));
    const tools = document.querySelector('.tools');
    tools.insertBefore(modeBtn, tools.firstChild);
    buildPad();
    setLang(document.documentElement.lang === 'fa' ? 'fa' : 'en');
  }

  /* ---------- the loop ---------- */

  // Only redraw when something has actually moved: a still panorama costs
  // nothing on a phone.
  function frame(now) {
    // A held pad key turns at a rate rather than by a step, so it needs to know
    // how long the last frame took. Capped: a tab that was in the background
    // comes back with a huge gap and would otherwise throw the view across the
    // room.
    const dt = padAt ? Math.min(0.05, (now - padAt) / 1000) : 0;
    padAt = now;

    if (open && padVec) {
      const k = perPixel();
      wantYaw += padVec.x * PAD_RATE * k.x * dt;
      wantPitch += padVec.y * PAD_RATE * k.y * dt;
      needsDraw = true;
    }

    const dy = wantYaw - yaw;
    const dp = wantPitch - pitch;
    if (open && (Math.abs(dy) > 1e-4 || Math.abs(dp) > 1e-4)) {
      yaw += dy * 0.24;
      pitch += dp * 0.24;
      clampPitch();
      needsDraw = true;
    }
    if (needsDraw) {
      needsDraw = false;
      draw();
    }
    requestAnimationFrame(frame);
  }

  /* ---------- keys, scoped to this mode ---------- */

  document.addEventListener('keydown', e => {
    if (!open) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const k = perPixel();
    let handled = true;
    switch (e.key) {
      case 'ArrowLeft':  wantYaw -= 40 * k.x; break;
      case 'ArrowRight': wantYaw += 40 * k.x; break;
      case 'ArrowUp':    wantPitch -= 40 * k.y; break;
      case 'ArrowDown':  wantPitch += 40 * k.y; break;
      case 'PageUp':     step(-1); break;
      case 'PageDown':   step(1); break;
      case ',':          step(-1); break;
      case '.':          step(1); break;
      default:           handled = false;
    }
    if (handled) {
      e.preventDefault();
      e.stopPropagation();
      needsDraw = true;
    }
  }, true);

  window.addEventListener('resize', () => { needsDraw = true; });

  /* ---------- start ---------- */

  function boot() {
    if (!gl) {
      // No WebGL: leave the photographs as the only mode rather than an empty
      // black rectangle.
      return;
    }
    try {
      compile();
    } catch (err) {
      return;
    }
    gl.clearColor(0.05, 0.05, 0.06, 1);
    mount();
    requestAnimationFrame(frame);
  }

  window.PANORAMA = {
    init: boot,
    open: () => setOpen(true),
    close: () => setOpen(false),
    isOpen: () => open,
    step: step,
    setLang: setLang,
    supported: () => !!gl
  };
}());
