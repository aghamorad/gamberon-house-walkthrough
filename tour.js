/* Gamberon House — room-by-room walkthrough.
   Plain script, no build step, no dependencies. Images are the Cycles finals.

   Bilingual: every room carries an `en` and a `fa` block, and the chrome strings
   live in UI below. Persian reuses the same markup but flips the document to RTL,
   which the stylesheet keys off `.lang-fa` to reposition the caption and arrows. */

const UI = {
  en: {
    brand: 'Gamberon',
    sub: 'Interior walkthrough',
    notes: 'Notes',
    play: 'Play',
    pause: 'Pause',
    full: 'Full screen',
    save: 'Download',
    hide: 'Hide',
    hint: 'Use ← → or the arrows to walk through the house',
    docTitle: 'Gamberon House — Interior Walkthrough',
    other: 'فارسی'
  },
  fa: {
    brand: 'گمبرون',
    sub: 'قدم‌زدن در خانه',
    notes: 'توضیحات',
    play: 'پخش',
    pause: 'توقف',
    full: 'تمام‌صفحه',
    save: 'دانلود',
    hide: 'مخفی',
    hint: 'با کلیدهای ← → یا فلش‌ها در خانه قدم بزنید',
    docTitle: 'خانهٔ گمبرون — قدم‌زدن در خانه',
    other: 'English'
  }
};

const ROOMS = [
  {
    slug: '01-home-overview',
    num: '01',
    en: {
      name: 'The house from above',
      note: 'Two storeys wrapped around a palm courtyard, with the lap pool cut into the corner of the plan.',
      detail: 'Raw cement outside, gypsum plaster within. The plan folds two wings around the courtyard so the main rooms borrow their daylight and their greenery from the middle of the plot rather than from the street.',
      points: [
        'A narrow plot, so the house turns inward and uses the courtyard as its one piece of open ground.',
        'Paving and pool are the same pale stone, which is why the ground plane reads as one surface from the air.',
        'The upper floor is set back over the living wing, giving the terrace below it shade.'
      ]
    },
    fa: {
      name: 'نمای خانه از بالا',
      note: 'دو طبقه که دور یک حیاط با نخل چیده شده‌اند؛ استخر در گوشهٔ پلان جا گرفته است.',
      detail: 'بیرون سیمان خام و درون گچ. پلان دو بال را دور حیاط جمع کرده تا اتاق‌های اصلی نور و سبزی خود را از میانهٔ زمین بگیرند، نه از کوچه.',
      points: [
        'زمین باریک است، پس خانه به درون خود چرخیده و حیاط تنها فضای باز آن است.',
        'کف‌پوش محوطه و استخر از یک سنگ روشن است؛ به همین دلیل از بالا همهٔ زمین یک سطح به نظر می‌رسد.',
        'طبقهٔ بالا روی بال نشیمن عقب نشسته و به تراس زیر خود سایه می‌دهد.'
      ]
    }
  },
  {
    slug: '02-pool-courtyard',
    num: '02',
    en: {
      name: 'The pool courtyard',
      note: 'The lap pool, reached straight out of the living room through the sliding glazing.',
      detail: 'A two-storey cement volume on three sides, a white balustrade over it, and the pool set flush into pale stone paving. The steps are at the near end, away from the house.',
      points: [
        'The cement render was done as one continuous surface, with no expansion joints cutting across the volume.',
        'The wall lights wash the flanking wall instead of lighting the floor, so the courtyard never reads as a car park after dark.',
        'Two mature palms give the height of the courtyard something to measure itself against.'
      ]
    },
    fa: {
      name: 'حیاط استخر',
      note: 'استخر، درست از نشیمن و پشت شیشه‌های کشویی در دسترس.',
      detail: 'حجمی سیمانی در دو طبقه از سه طرف، جان‌پناهی سفید بالای آن، و استخری که هم‌سطح سنگ‌فرش روشن اجرا شده. پله‌ها در انتهای نزدیک‌اند، دور از خانه.',
      points: [
        'نمای سیمانی یکسره اجرا شده و هیچ درز انقباضی روی حجم نیفتاده است.',
        'چراغ‌های دیواری نور را روی دیوار می‌پاشند نه روی زمین، تا حیاط شب‌ها شبیه پارکینگ نشود.',
        'دو نخل قدیمی به بلندی حیاط مقیاس می‌دهند.'
      ]
    }
  },
  {
    slug: '03-roof-terrace',
    num: '03',
    en: {
      name: 'The roof terrace',
      note: 'Above the living room: a paved terrace behind a colonnade, with an outdoor room set into one end.',
      detail: 'The balustrade runs the full length of the terrace and the seating sits against it. The paving is the same as the courtyard, so this reads as the same ground plane lifted a storey.',
      points: [
        'The set-back upper floor gives the terrace shade for most of the afternoon.',
        'The dark inset in the paving is the skylight over the living room, seen from above.',
        'The terrace is the one place in the house you can see the whole plan at once.'
      ]
    },
    fa: {
      name: 'تراس بام',
      note: 'بالای نشیمن: تراسی سنگ‌فرش پشت یک ستون‌بندی، با یک اتاق رو‌باز در یک سر آن.',
      detail: 'جان‌پناه در تمام طول تراس کشیده شده و نشیمن به آن تکیه داده. سنگ‌فرش همان سنگ حیاط است، پس این سطح امتداد همان کف، یک طبقه بالاتر خوانده می‌شود.',
      points: [
        'عقب‌نشینی طبقهٔ بالا بیشترِ بعدازظهر به تراس سایه می‌دهد.',
        'مربع تیره در سنگ‌فرش، نورگیر سقف نشیمن است که از بالا دیده می‌شود.',
        'تراس تنها جایی است که یک‌باره تمام پلان خانه را می‌بینید.'
      ]
    }
  },
  {
    slug: '04-living-room',
    num: '04',
    en: {
      name: 'The living room',
      note: 'One long room, glazed to the courtyard along its whole length, lit again from a skylight over the middle.',
      detail: 'Brick underfoot and plaster on the walls, with the seating kept deliberately low so that the glazing and the courtyard take the height of the room.',
      points: [
        'The ground floor is a single brick surface, unbroken from here through the kitchen and the dining room.',
        'The skylight and the courtyard glazing face each other, so daylight arrives from two directions at once.',
        'The furniture is sparse on purpose: a sofa, a low table, one large urn.'
      ]
    },
    fa: {
      name: 'نشیمن',
      note: 'یک اتاق کشیده، در تمام طول رو به حیاط شیشه‌ای، با نورگیری دیگر بر میانهٔ سقف.',
      detail: 'آجر زیر پا و گچ روی دیوار؛ نشیمن عمداً کوتاه نگه داشته شده تا ارتفاع اتاق به شیشه و حیاط برسد.',
      points: [
        'کف طبقهٔ همکف یک سطح آجری یکسره است، بی‌وقفه از اینجا تا آشپزخانه و غذاخوری.',
        'نورگیر و شیشهٔ حیاط روبه‌روی هم قرار دارند، پس نور از دو سو می‌آید.',
        'مبلمان عمداً کم است: یک کاناپه، یک میز کوتاه و یک کوزهٔ بزرگ.'
      ]
    }
  },
  {
    slug: '05-kitchen',
    num: '05',
    en: {
      name: 'The kitchen',
      note: 'A single working L of walnut cabinetry, with the sink facing the tall windows.',
      detail: 'Honed stone over walnut fronts, running along the back wall and turning the corner onto the short return, where the cooktop and oven sit. There is no island — the room works along its two walls.',
      points: [
        'The tall windows over the counter bring the courtyard in at eye level while you are standing at the sink.',
        'Open shelving instead of wall cabinets, so the plaster wall stays legible.',
        'Lighting comes from the recessed ceiling line and from under the shelves, where hands actually need it.'
      ]
    },
    fa: {
      name: 'آشپزخانه',
      note: 'یک الِ کارِ گردویی، با سینک رو به پنجره‌های بلند.',
      detail: 'سنگ ساییده روی درهای گردویی، در امتداد دیوار پشتی و پیچیدن به دیوار کنار، جایی که اجاق و فر نشسته‌اند. جزیره ندارد — آشپزخانه روی دو دیوار خود کار می‌کند.',
      points: [
        'پنجره‌های بلند بالای پیشخوان، هنگام ایستادن کنار سینک، حیاط را هم‌سطح چشم می‌آورند داخل.',
        'به‌جای کابینت دیواری قفسهٔ باز کار گذاشته شده تا دیوار گچی خوانا بماند.',
        'نور از خط سقف فرورفته و از زیر قفسه‌ها می‌آید، همان‌جا که دست‌ها واقعاً به آن نیاز دارند.'
      ]
    }
  },
  {
    slug: '06-dining-room',
    num: '06',
    en: {
      name: 'The dining room',
      note: 'One long table under the skylight, with the courtyard a sliding panel away.',
      detail: 'The table sits on the same brick as the living room, with a column rising beside it to carry the floor above. The glazing runs the length of the room, so the table can be opened to the courtyard for most of the year.',
      points: [
        'A single long table rather than two: one gesture, with one light source directly over it.',
        'The courtyard is visible from every seat, which is what keeps a long table from feeling like a boardroom.',
        'The column is left expressed rather than boxed in, and reads as part of the room.'
      ]
    },
    fa: {
      name: 'غذاخوری',
      note: 'یک میز بلند زیر نورگیر، با حیاطی که تنها یک لنگه شیشه فاصله دارد.',
      detail: 'میز روی همان آجر نشیمن نشسته و ستونی کنارش بالا می‌رود تا سقف طبقهٔ بالا را نگه دارد. شیشه در تمام طول اتاق کشیده شده، پس میز بیشتر سال می‌تواند به حیاط باز باشد.',
      points: [
        'یک میز بلند به‌جای دو میز: یک حرکت، با یک منبع نور درست بالای آن.',
        'حیاط از هر صندلی دیده می‌شود، و همین میز بلند را از حس اتاق جلسه دور نگه می‌دارد.',
        'ستون لخت رها شده و پوشانده نشده، تا بخشی از اتاق خوانده شود.'
      ]
    }
  },
  {
    slug: '07-master-bedroom',
    num: '07',
    en: {
      name: 'The master bedroom',
      note: 'A timber headboard wall, full-height wardrobes in the same walnut as the kitchen.',
      detail: 'A quiet room: plaster walls, undyed bedding, one framed work over the bed and a bronze reading light on the wall. The wardrobes run along the return wall in the same timber as the kitchen fronts.',
      points: [
        'One species of timber runs through the house, so the bedrooms read as the same building as the kitchen.',
        'The only colour in the room is the artwork and the timber — bedding and rug are both undyed.',
        'The reading light is wall-mounted, which keeps the ceiling clear.'
      ]
    },
    fa: {
      name: 'اتاق خواب اصلی',
      note: 'دیوار پشتِ تخت چوبی، و کمدهای دیواری هم‌جنس گردوی آشپزخانه.',
      detail: 'اتاقی آرام: دیوار گچی، ملافهٔ بی‌رنگ، یک قاب بالای تخت و یک چراغ مطالعهٔ برنزی روی دیوار. کمدها در امتداد دیوار کنار و از همان چوبِ درهای آشپزخانه‌اند.',
      points: [
        'یک گونه چوب در تمام خانه تکرار می‌شود، پس اتاق‌های خواب همان ساختمان آشپزخانه خوانده می‌شوند.',
        'تنها رنگِ اتاق تصویر و چوب است — روتختی و قالیچه هر دو بی‌رنگ‌اند.',
        'چراغ مطالعه روی دیوار است و سقف را خالی نگه می‌دارد.'
      ]
    }
  },
  {
    slug: '08-master-bathroom',
    num: '08',
    en: {
      name: 'The master bathroom',
      note: 'Pale stone and painted plaster, with the vanity shelf cut from the same block as the top.',
      detail: 'A rectangular basin set into a solid stone top, a lit niche above the mirror, and a wall-hung WC keeping the floor clear. The walls are painted rather than tiled.',
      points: [
        'The wet walls are oil-painted plaster, not tile — no grout lines anywhere in the room.',
        'A lit niche over the mirror does the work that a row of downlights would have done.',
        'The shower is flush to the floor, with no threshold to step over.'
      ]
    },
    fa: {
      name: 'حمام اصلی',
      note: 'سنگ روشن و گچ رنگ‌شده، با روشویی‌ای که صفحه‌اش از همان سنگ بریده شده.',
      detail: 'روشویی مستطیلی نشسته در صفحه‌ای از سنگ یکپارچه، طاقچه‌ای روشن بالای آینه، و توالت دیوارکوب که کف را خالی نگه می‌دارد. دیوارها رنگ شده‌اند، نه کاشی.',
      points: [
        'دیوارهای مرطوب گچِ رنگِ روغنی‌اند نه کاشی — هیچ خط درزی در اتاق نیست.',
        'طاقچهٔ روشن بالای آینه همان کاری را می‌کند که یک ردیف چراغ سقفی می‌کرد.',
        'دوش هم‌سطح کف است و هیچ لبه‌ای برای گذر ندارد.'
      ]
    }
  },
  {
    slug: '09-guest-bedroom',
    num: '09',
    en: {
      name: 'The guest bedroom',
      note: 'The quieter of the two upstairs bedrooms — one bed, one pendant, one large vessel.',
      detail: 'Plaster walls and undyed linen, with the artwork and the pot the only things in the room carrying any colour. Light stays at the level of the bed rather than coming down from the ceiling.',
      points: [
        'The door and its frame are the only joinery in the room; everything else is plaster.',
        'The furniture is kept to a bed, a nightstand and one pot, so the floor stays open.',
        'The olive is cut back hard, so it reads as structure rather than foliage.'
      ]
    },
    fa: {
      name: 'اتاق خواب مهمان',
      note: 'آرام‌ترین اتاق خواب طبقهٔ بالا — یک تخت، یک چراغ آویز، یک کوزهٔ بزرگ.',
      detail: 'دیوار گچی و کتان بی‌رنگ، و تنها چیزهای رنگ‌دار اتاق تصویر و کوزه‌اند. نور در ارتفاع تخت می‌ماند و از سقف پایین نمی‌آید.',
      points: [
        'در و چارچوبش تنها نجاریِ اتاق‌اند؛ باقی گچ است.',
        'مبلمان به یک تخت، یک پاتختی و یک کوزه محدود شده تا کف باز بماند.',
        'درخت زیتون را سخت هرس کرده‌اند تا مثل ساختار خوانده شود، نه شاخ و برگ.'
      ]
    }
  }
];

const layerA = document.getElementById('layerA');
const layerB = document.getElementById('layerB');
const stage = document.querySelector('.stage');
const tools = document.querySelector('.tools');
const rail = document.getElementById('rail');
const hint = document.getElementById('hint');
const loader = document.getElementById('loader');
const brandMark = document.querySelector('.brand-mark');
const brandSub = document.getElementById('brandSub');
const elNum = document.getElementById('roomNum');
const elName = document.getElementById('roomName');
const elNote = document.getElementById('roomNote');
const elDetail = document.getElementById('roomDetail');
const elPoints = document.getElementById('roomPoints');
const notes = document.getElementById('notes');
const btnInfo = document.getElementById('btnInfo');
const btnFull = document.getElementById('btnFull');
const btnSave = document.getElementById('btnSave');
const btnHide = document.getElementById('btnHide');
const btnLang = document.getElementById('btnLang');
const btnPrev = document.getElementById('btnPrev');
const btnNext = document.getElementById('btnNext');

const LANG_KEY = 'gamberon-lang';

let lang = (function () {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved === 'en' || saved === 'fa') return saved;
  } catch (e) { /* private mode */ }
  return (navigator.language || '').toLowerCase().indexOf('fa') === 0 ? 'fa' : 'en';
})();

let index = 0;
let front = 'B';            // which image layer is currently painted
let firstLoad = true;
let playTimer = null;

/* ---------- language ---------- */

function applyLang() {
  const t = UI[lang];
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
  document.body.classList.toggle('lang-fa', lang === 'fa');

  brandMark.textContent = t.brand;
  brandSub.textContent = t.sub;
  btnInfo.textContent = t.notes;
  btnFull.textContent = t.full;
  btnSave.textContent = t.save;
  btnHide.textContent = t.hide;
  hint.textContent = t.hint;
  btnLang.textContent = t.other;
  btnLang.lang = lang === 'fa' ? 'en' : 'fa';
  btnPlay.textContent = playTimer ? t.pause : t.play;

  // The 360 tour borrows the caption and the rail, so it repaints them itself.
  // Letting the stills' paint run on top would leave the wrong room described
  // behind the panorama.
  if (window.PANORAMA) {
    PANORAMA.setLang(lang);
    if (PANORAMA.isOpen()) return;
  }

  buildRail();
  paint(ROOMS[index]);
}

btnLang.addEventListener('click', () => {
  lang = lang === 'fa' ? 'en' : 'fa';
  try { localStorage.setItem(LANG_KEY, lang); } catch (e) { /* ignore */ }
  applyLang();
});

/* ---------- room rail ---------- */

function buildRail() {
  rail.innerHTML = '';
  ROOMS.forEach((room, i) => {
    const chip = document.createElement('button');
    chip.className = 'chip';
    chip.type = 'button';
    chip.textContent = room.num + '  ' + room[lang].name;
    chip.addEventListener('click', () => go(i));
    rail.appendChild(chip);
  });
}

/* ---------- showing a room ---------- */

function imagePath(room) {
  return 'images/' + room.slug + '.jpg';
}

function loadInto(el, src) {
  return new Promise(resolve => {
    if (el.getAttribute('src') === src && el.complete && el.naturalWidth) {
      resolve();
      return;
    }
    el.onload = () => resolve();
    el.onerror = () => resolve();
    el.src = src;
  });
}

function preload(i) {
  const room = ROOMS[(i + ROOMS.length) % ROOMS.length];
  if (room) new Image().src = imagePath(room);
}

async function go(i) {
  const target = ROOMS[(i + ROOMS.length) % ROOMS.length];
  const top = front === 'A' ? layerB : layerA;
  const under = front === 'A' ? layerA : layerB;

  await loadInto(top, imagePath(target));
  top.classList.add('on');
  under.classList.remove('on');

  front = front === 'A' ? 'B' : 'A';
  index = (i + ROOMS.length) % ROOMS.length;
  paint(target);
  preload(index + 1);
  preload(index - 1);

  if (firstLoad) {
    firstLoad = false;
    loader.classList.add('gone');
    setTimeout(() => loader.remove(), 600);
    setTimeout(() => hint.classList.add('gone'), 5200);
  }
}

function paint(room) {
  const copy = room[lang];
  elNum.textContent = room.num;
  elName.textContent = copy.name;
  elNote.textContent = copy.note;
  elDetail.textContent = copy.detail;
  elPoints.innerHTML = '';
  copy.points.forEach(p => {
    const li = document.createElement('li');
    li.textContent = p;
    elPoints.appendChild(li);
  });

  Array.from(rail.children).forEach((chip, i) => {
    chip.setAttribute('aria-current', i === index ? 'true' : 'false');
  });

  const active = rail.children[index];
  if (active && active.scrollIntoView) {
    active.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  }

  btnSave.href = 'interiors/' + room.slug + '.png';
  btnSave.setAttribute('download', room.slug + '.png');
  document.title = UI[lang].docTitle + ' · ' + copy.name;

  if (history.replaceState) {
    history.replaceState(null, '', '#' + room.slug);
  }
}

// The arrows belong to the house rather than to either mode: in the 360 tour
// they step between rooms there, where the stills' index means nothing.
const next = () => (window.PANORAMA && PANORAMA.isOpen() ? PANORAMA.step(1) : go(index + 1));
const prev = () => (window.PANORAMA && PANORAMA.isOpen() ? PANORAMA.step(-1) : go(index - 1));

/* ---------- controls ---------- */

btnNext.addEventListener('click', next);
btnPrev.addEventListener('click', prev);

stage.addEventListener('click', event => {
  if (event.target.closest('.arrow')) return;
  const forward = lang === 'fa'
    ? event.clientX / window.innerWidth < 0.5
    : event.clientX / window.innerWidth > 0.5;
  if (forward) next();
  else prev();
});

btnInfo.addEventListener('click', () => {
  const open = notes.classList.toggle('open');
  btnInfo.setAttribute('aria-pressed', open ? 'true' : 'false');
});

btnHide.addEventListener('click', () => {
  document.body.classList.toggle('bare');
});

function stopPlay() {
  if (!playTimer) return;
  clearInterval(playTimer);
  playTimer = null;
  btnPlay.setAttribute('aria-pressed', 'false');
  btnPlay.textContent = UI[lang].play;
}

function togglePlay() {
  if (playTimer) {
    stopPlay();
    return;
  }
  playTimer = setInterval(next, 9000);
  btnPlay.setAttribute('aria-pressed', 'true');
  btnPlay.textContent = UI[lang].pause;
}

const btnPlay = document.createElement('button');
btnPlay.className = 'tool';
btnPlay.type = 'button';
btnPlay.title = 'Advance through the house automatically';
btnPlay.setAttribute('aria-pressed', 'false');
btnPlay.addEventListener('click', togglePlay);
tools.insertBefore(btnPlay, btnInfo);

btnFull.addEventListener('click', () => {
  if (document.fullscreenElement) document.exitFullscreen();
  else document.documentElement.requestFullscreen();
});

document.addEventListener('keydown', event => {
  if (event.metaKey || event.ctrlKey || event.altKey) return;
  if (event.key === 'ArrowRight' || event.key === 'PageDown' || event.key === ' ') {
    event.preventDefault();
    stopPlay();
    next();
  } else if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
    event.preventDefault();
    prev();
  } else if (event.key === 'Home' || event.key === 'End') {
    if (window.PANORAMA && PANORAMA.isOpen()) return;
    go(event.key === 'Home' ? 0 : ROOMS.length - 1);
  } else if (event.key === 'i' || event.key === 'I') {
    btnInfo.click();
  } else if (event.key === 'h' || event.key === 'H') {
    btnHide.click();
  } else if (event.key === 'f' || event.key === 'F') {
    btnFull.click();
  }
});

let touchX = null;
document.addEventListener('touchstart', e => { touchX = e.changedTouches[0].clientX; }, { passive: true });
document.addEventListener('touchend', e => {
  if (touchX === null) return;
  // A drag across the panorama is a look, not a swipe between rooms.
  if (window.PANORAMA && PANORAMA.isOpen()) { touchX = null; return; }
  const dx = e.changedTouches[0].clientX - touchX;
  if (Math.abs(dx) > 48) {
    const forward = lang === 'fa' ? dx > 0 : dx < 0;
    if (forward) next();
    else prev();
  }
  touchX = null;
}, { passive: true });

/* ---------- open on the room in the URL ---------- */

const wanted = decodeURIComponent(location.hash.replace('#', ''));
const startAt = Math.max(0, ROOMS.findIndex(r => r.slug === wanted));

// The 360 tour exists before the first applyLang, since that call is what hands
// it the language the reader is already reading in.
if (window.PANORAMA) PANORAMA.init();
applyLang();
go(startAt);
