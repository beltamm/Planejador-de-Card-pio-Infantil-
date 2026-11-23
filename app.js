/* =========================================================
   CARDÁPIO KIDS • LÓGICA DO APP
   Cardápio, receitas, mercado, compras, estrelas, conquistas,
   quiz, passaporte, sons e confete.
   ========================================================= */
'use strict';

const STORAGE_KEY = 'cardapio_kids_v2';
const OLD_STORAGE_KEY = 'cardapio_kids_pro_v1';
const DAY_NAMES = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
const DAY_SHORT = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
const KEYCAPS = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'];
const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- Helpers ----------
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const shuffle = arr => arr.map(v => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map(x => x[1]);
const todayIdx = () => (new Date().getDay() + 6) % 7;
const slotKey = (day, meal) => `${day}-${meal}`;

// ---------- Catálogo unificado ----------
const CATALOG = new Map();
RECIPES_CATALOG.forEach(r => CATALOG.set(r.id, { id: r.id, name: r.title, type: 'recipe', icon: r.emoji || '🍳', raw: r }));
FRUITS_CATALOG.forEach(f => CATALOG.set(f.id, { id: f.id, name: f.name, type: 'fruit', icon: f.icon, raw: f }));
DRINKS_CATALOG.forEach(d => CATALOG.set(d.id, { id: d.id, name: d.name, type: 'drink', icon: d.icon, raw: d }));
MARKET_CATALOG.forEach(m => CATALOG.set(m.id, { id: m.id, name: m.name, type: 'market', icon: m.icon || '🛒', raw: m }));
const resolveItem = id => CATALOG.get(id) || { id, name: id, type: 'custom', icon: '✨', raw: null };
const catInfo = name => RECIPE_CATEGORIES.find(c => c.name === name) || { icon: '🍳', tone: 'sun' };

// =========================================================
// ESTADO
// =========================================================
function emptyDay() { return { cafe: [], escola: [], almoco: [], tarde: [], jantar: [] }; }

function createInitialPlan(count = 14) {
  return Array.from({ length: count }, (_, i) => {
    const t = DEFAULT_WEEK_TEMPLATE[i % DEFAULT_WEEK_TEMPLATE.length];
    const d = emptyDay();
    MEAL_SLOTS.forEach(s => { d[s.key] = [...(t[s.key] || [])]; });
    return d;
  });
}

function defaults() {
  return {
    v: 2,
    profile: { name: '', avatar: '🦊', gender: 'f' },
    sound: true,
    daysCount: 7,
    plan: createInitialPlan(14),
    eaten: {},
    banked: 0,
    tasted: {},
    quizCorrect: [],
    cooked: [],
    favorites: [],
    shopChecked: {},
    unlocked: [],
    lastLevel: null
  };
}

function normalizeState(raw) {
  const d = defaults();
  const s = Object.assign(d, raw || {});
  s.profile = Object.assign(defaults().profile, (raw && raw.profile) || {});
  s.daysCount = s.daysCount === 14 ? 14 : 7;
  const plan = Array.isArray(s.plan) ? s.plan : [];
  s.plan = Array.from({ length: 14 }, (_, i) => {
    const day = emptyDay();
    const src = plan[i] || {};
    MEAL_SLOTS.forEach(slot => {
      day[slot.key] = Array.isArray(src[slot.key]) ? src[slot.key].filter(id => CATALOG.has(id)) : [];
    });
    return day;
  });
  ['quizCorrect', 'cooked', 'favorites', 'unlocked'].forEach(k => { if (!Array.isArray(s[k])) s[k] = []; });
  ['eaten', 'tasted', 'shopChecked'].forEach(k => { if (!s[k] || typeof s[k] !== 'object') s[k] = {}; });
  s.banked = Number(s.banked) || 0;
  return s;
}

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return normalizeState(JSON.parse(saved));
    // Migração da versão anterior (mantém o cardápio montado)
    const old = localStorage.getItem(OLD_STORAGE_KEY);
    if (old) {
      const p = JSON.parse(old);
      return normalizeState({ plan: p.plan, daysCount: p.daysCount });
    }
  } catch (e) {
    console.warn('Não foi possível ler os dados salvos:', e);
  }
  return defaults();
}

let S = loadState();

function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(S)); }
  catch (e) { console.warn('Não foi possível salvar:', e); }
}

const ui = {
  tab: 'planner',
  recipeCat: 'Todas', recipeSearch: '',
  marketCat: 'Todos', marketSearch: '',
  editing: null, temp: [], picker: 'recipes', pickerSearch: '',
  assignId: null, assignDay: 0, assignMeal: 'cafe',
  recipeId: null, cookId: null, cookStep: 0,
  quiz: null, tipIdx: -1,
  modal: null, lastFocus: null,
  draft: null,
  prevTotal: null,
  plannerAnimated: false
};

const g = (f, m) => (S.profile.gender === 'm' ? m : f);

// =========================================================
// SOM, VIBRAÇÃO, CONFETE E EFEITOS
// =========================================================
const Sound = {
  ctx: null,
  unlocked: false,
  get() {
    if (!this.unlocked) return null;
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      this.ctx = new AC();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  },
  tone(freq, dur = 0.12, type = 'sine', when = 0, vol = 0.15, slide = 0) {
    const c = this.ctx;
    const t = c.currentTime + when;
    const o = c.createOscillator();
    const gn = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), t + dur);
    gn.gain.setValueAtTime(0.0001, t);
    gn.gain.exponentialRampToValueAtTime(vol, t + 0.012);
    gn.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(gn).connect(c.destination);
    o.start(t);
    o.stop(t + dur + 0.02);
  },
  play(name) {
    if (!S.sound) return;
    try {
      if (!this.get()) return;
      switch (name) {
        case 'pop': this.tone(480, 0.09, 'triangle', 0, 0.2, 500); break;
        case 'unpop': this.tone(700, 0.09, 'triangle', 0, 0.15, -350); break;
        case 'coin': this.tone(988, 0.08, 'square', 0, 0.06); this.tone(1319, 0.22, 'square', 0.08, 0.06); break;
        case 'wrong': this.tone(260, 0.16, 'sawtooth', 0, 0.06, -60); this.tone(190, 0.26, 'sawtooth', 0.14, 0.06, -40); break;
        case 'stamp': this.tone(130, 0.14, 'square', 0, 0.1, -50); this.tone(880, 0.1, 'triangle', 0.09, 0.15); this.tone(1175, 0.18, 'triangle', 0.16, 0.13); break;
        case 'whoosh': this.tone(260, 0.3, 'sine', 0, 0.12, 1000); break;
        case 'tick': this.tone(900, 0.035, 'square', 0, 0.04); break;
        case 'fanfare':
          [523, 659, 784].forEach((f, i) => this.tone(f, 0.16, 'triangle', i * 0.1, 0.18));
          this.tone(1047, 0.5, 'triangle', 0.3, 0.2);
          this.tone(1319, 0.5, 'sine', 0.3, 0.08);
          break;
      }
    } catch (e) { /* som é opcional */ }
  }
};
const buzz = (ms = 12) => { if (S.sound && navigator.vibrate) { try { navigator.vibrate(ms); } catch (e) {} } };

const Confetti = {
  cv: null, ctx: null, parts: [], running: false,
  colors: ['#FF8904', '#FFD43B', '#22C997', '#4CB8FF', '#9B7BFF', '#FF5FA2', '#7CC81F'],
  init() {
    this.cv = $('#confetti');
    this.ctx = this.cv.getContext('2d');
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.cv.width = innerWidth * dpr;
      this.cv.height = innerHeight * dpr;
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    addEventListener('resize', resize);
  },
  burst(x, y, n = 40, power = 9) {
    if (REDUCED_MOTION) return;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const v = Math.random() * power + 2;
      this.parts.push({
        x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - power * 0.5,
        size: 6 + Math.random() * 7, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4,
        color: pick(this.colors), shape: Math.random() < 0.35 ? 'c' : 'r', life: 1, decay: 0.008 + Math.random() * 0.01
      });
    }
    this.start();
  },
  rain(n = 150) {
    if (REDUCED_MOTION) return;
    for (let i = 0; i < n; i++) {
      this.parts.push({
        x: Math.random() * innerWidth, y: -20 - Math.random() * innerHeight * 0.5,
        vx: (Math.random() - 0.5) * 3, vy: 2 + Math.random() * 3,
        size: 7 + Math.random() * 8, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3,
        color: pick(this.colors), shape: Math.random() < 0.3 ? 'c' : 'r', life: 1, decay: 0.004
      });
    }
    this.start();
  },
  start() {
    if (this.running) return;
    this.running = true;
    requestAnimationFrame(() => this.loop());
  },
  loop() {
    const c = this.ctx;
    c.clearRect(0, 0, innerWidth, innerHeight);
    this.parts.forEach(p => {
      p.vy += 0.22; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life -= p.decay;
      c.save();
      c.globalAlpha = Math.max(0, Math.min(1, p.life * 1.5));
      c.translate(p.x, p.y); c.rotate(p.rot);
      c.fillStyle = p.color;
      if (p.shape === 'c') { c.beginPath(); c.arc(0, 0, p.size / 2, 0, Math.PI * 2); c.fill(); }
      else c.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      c.restore();
    });
    this.parts = this.parts.filter(p => p.life > 0 && p.y < innerHeight + 40);
    if (this.parts.length) requestAnimationFrame(() => this.loop());
    else { this.running = false; c.clearRect(0, 0, innerWidth, innerHeight); }
  }
};

function centerOf(el) {
  if (!el) return { x: innerWidth / 2, y: innerHeight / 2 };
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

function floatPlus(el, text) {
  const { x, y } = centerOf(el);
  const d = document.createElement('div');
  d.className = 'float-plus';
  d.textContent = text;
  d.style.left = x + 'px';
  d.style.top = (y - 10) + 'px';
  document.body.appendChild(d);
  setTimeout(() => d.remove(), 1000);
}

function toast(msg, type = '') {
  const box = $('#toasts');
  while (box.children.length >= 3) box.firstChild.remove();
  const t = document.createElement('div');
  t.className = 'toast' + (type ? ' toast--' + type : '');
  t.textContent = msg;
  box.appendChild(t);
  setTimeout(() => { t.classList.add('is-out'); setTimeout(() => t.remove(), 300); }, 2800);
}

// =========================================================
// MASCOTE (SVG original: a tangerina "Tangi")
// =========================================================
const MASCOT_SVG = `
<svg class="mascot" viewBox="0 0 120 120" aria-hidden="true">
  <ellipse cx="60" cy="112" rx="30" ry="5" fill="#2B2140" opacity=".15"/>
  <g class="m-leaf">
    <path d="M60 30 C 60 22, 62 16, 64 12" stroke="#2B2140" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M63 22 C 72 8, 92 10, 96 16 C 88 28, 70 30, 63 22 Z" fill="#7CC81F" stroke="#2B2140" stroke-width="3.5" stroke-linejoin="round"/>
    <path d="M70 21 C 78 18, 86 17, 92 17" stroke="#2B2140" stroke-width="2" fill="none" stroke-linecap="round" opacity=".5"/>
  </g>
  <circle cx="60" cy="68" r="40" fill="#FF8904" stroke="#2B2140" stroke-width="4"/>
  <path d="M34 50 C 40 38, 52 33, 62 33" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".55"/>
  <circle cx="80" cy="88" r="2" fill="#2B2140" opacity=".2"/><circle cx="40" cy="92" r="2" fill="#2B2140" opacity=".2"/><circle cx="88" cy="70" r="1.8" fill="#2B2140" opacity=".2"/>
  <g class="m-eyes">
    <ellipse cx="47" cy="62" rx="6.5" ry="8" fill="#2B2140"/>
    <ellipse cx="73" cy="62" rx="6.5" ry="8" fill="#2B2140"/>
    <circle cx="49.5" cy="58.5" r="2.6" fill="#fff"/><circle cx="75.5" cy="58.5" r="2.6" fill="#fff"/>
  </g>
  <ellipse cx="38" cy="76" rx="6" ry="4" fill="#FF5FA2" opacity=".55"/>
  <ellipse cx="82" cy="76" rx="6" ry="4" fill="#FF5FA2" opacity=".55"/>
  <path d="M50 76 Q 60 87, 70 76" stroke="#2B2140" stroke-width="4" fill="#fff" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

function mountMascots() {
  $$('[data-mascot]').forEach(el => { el.innerHTML = MASCOT_SVG; });
}

// =========================================================
// PROGRESSO: ESTRELAS, NÍVEIS E CONQUISTAS
// =========================================================
// Frutas já no cardápio (usado para sugerir variedade)
function planFruits() {
  const set = new Set();
  for (let i = 0; i < S.daysCount; i++) {
    MEAL_SLOTS.forEach(s => (S.plan[i][s.key] || []).forEach(id => { if (id.startsWith('f-')) set.add(id); }));
  }
  return set;
}

// Missão arco-íris: frutas diferentes que a criança COMEU (marcou "Comi!")
function rainbowInfo() {
  const set = new Set();
  for (let i = 0; i < S.daysCount; i++) {
    MEAL_SLOTS.forEach(s => {
      if (!S.eaten[slotKey(i, s.key)]) return;
      (S.plan[i][s.key] || []).forEach(id => { if (id.startsWith('f-')) set.add(id); });
    });
  }
  const target = S.daysCount === 14 ? 12 : 8;
  return { set, count: set.size, target, done: set.size >= target };
}

function isPerfect(day) {
  return MEAL_SLOTS.every(s => S.eaten[slotKey(day, s.key)] && S.plan[day][s.key].length);
}

function computeProgress() {
  const eatenCount = Object.keys(S.eaten).filter(k => S.eaten[k]).length;
  let perfectDays = 0;
  for (let i = 0; i < 14; i++) if (isPerfect(i)) perfectDays++;
  const tasted = Object.keys(S.tasted).length;
  const p = {
    eatenCount, perfectDays, tasted,
    quiz: S.quizCorrect.length,
    cooked: S.cooked.length,
    favs: S.favorites.length,
    rainbowDone: rainbowInfo().done
  };
  p.base = S.banked + eatenCount + tasted * 2 + p.quiz + p.cooked * 3;
  return p;
}

function totalStars() {
  return computeProgress().base + S.unlocked.length * 5;
}

function levelFor(total) {
  let idx = 0;
  LEVELS.forEach((l, i) => { if (total >= l.min) idx = i; });
  return idx;
}

// Chamado depois de qualquer ação que possa dar estrelas
function checkProgress() {
  const p = computeProgress();
  const fresh = ACHIEVEMENTS.filter(a => !S.unlocked.includes(a.id) && a.check(p));
  fresh.forEach((a, i) => {
    S.unlocked.push(a.id);
    setTimeout(() => {
      toast(`🏅 Conquista: ${a.icon} ${a.title}! +5 ⭐`, 'gold');
      Sound.play('coin');
      Confetti.burst(innerWidth / 2, innerHeight * 0.35, 60, 10);
    }, 400 + i * 900);
  });

  const total = p.base + S.unlocked.length * 5;
  const lvl = levelFor(total);
  if (S.lastLevel === null || S.lastLevel === undefined) S.lastLevel = lvl;
  if (lvl > S.lastLevel) {
    S.lastLevel = lvl;
    setTimeout(() => showLevelUp(lvl), 500 + fresh.length * 900);
  }
  save();
  renderStatus();
  if (ui.tab === 'fun') renderBadges();
}

function showLevelUp(lvl) {
  const L = LEVELS[lvl];
  $('#lvl-icon').textContent = L.icon;
  $('#lvl-title').textContent = g(L.f, L.m);
  $('#lvl-sub').textContent = `${S.profile.name ? S.profile.name + ', você' : 'Você'} chegou ao nível ${lvl + 1}! Continue explorando sabores. 🌈`;
  openModal('level-modal');
  Sound.play('fanfare');
  buzz([30, 40, 30]);
  Confetti.rain(180);
}

// =========================================================
// RENDER: TOPO + HERÓI
// =========================================================
function renderStatus() {
  const total = totalStars();
  const pill = $('.star-pill');
  $('#star-total').textContent = total;
  if (ui.prevTotal !== null && total !== ui.prevTotal) {
    pill.classList.remove('is-bump'); void pill.offsetWidth; pill.classList.add('is-bump');
  }
  ui.prevTotal = total;

  const lvl = levelFor(total);
  const L = LEVELS[lvl];
  const next = LEVELS[lvl + 1];
  $('#level-icon').textContent = L.icon;
  $('#level-name').textContent = `Nível ${lvl + 1} • ${g(L.f, L.m)}`;
  if (next) {
    const pct = Math.round(((total - L.min) / (next.min - L.min)) * 100);
    $('#level-bar').style.width = Math.max(4, pct) + '%';
    $('#level-next').textContent = `faltam ${next.min - total} ⭐ para ${next.icon}`;
  } else {
    $('#level-bar').style.width = '100%';
    $('#level-next').textContent = 'nível máximo! 🦄';
  }

  const name = S.profile.name.trim();
  $('#hello').textContent = `Olá, ${name || g('chef mirim', 'chef mirim')}! ${S.profile.avatar}`;
  $('#print-name').textContent = name || 'Família';
  updateShoppingBadge();
}

function renderRainbow() {
  const r = rainbowInfo();
  $('#rainbow-counter').textContent = `${r.count} / ${r.target}`;
  $('#rainbow-progress').style.width = Math.min(100, Math.round((r.count / r.target) * 100)) + '%';
  $('#rainbow-dots').innerHTML = FRUITS_CATALOG
    .map(f => `<span class="fruit-dot${r.set.has(f.id) ? ' is-on' : ''}" title="${esc(f.short)}">${f.icon}</span>`)
    .join('');
}

function sayTip(text) {
  const b = $('#mascot-bubble');
  b.textContent = text;
  b.classList.remove('is-pop'); void b.offsetWidth; b.classList.add('is-pop');
}

// =========================================================
// RENDER: CARDÁPIO
// =========================================================
function dayCardHTML(i) {
  const day = S.plan[i];
  const week = i >= 7 ? 2 : 1;
  const isToday = i === todayIdx() && week === 1;
  const perfect = isPerfect(i);
  const eatenCount = MEAL_SLOTS.filter(s => S.eaten[slotKey(i, s.key)] && day[s.key].length).length;

  const fruitColors = [];
  MEAL_SLOTS.forEach(s => day[s.key].forEach(id => {
    const it = resolveItem(id);
    if (it.type === 'fruit') fruitColors.push(FRUIT_COLORS[it.raw.color]);
  }));

  const slots = MEAL_SLOTS.map(slot => {
    const items = day[slot.key];
    const eaten = !!S.eaten[slotKey(i, slot.key)] && items.length > 0;
    const chips = items.length
      ? items.map(id => { const it = resolveItem(id); return `<span class="chip">${it.icon} <span>${esc(it.name)}</span></span>`; }).join('')
      : `<span class="slot__empty">+ toque para montar</span>`;
    return `
      <div class="slot${eaten ? ' is-eaten' : ''}" data-tone="${slot.tone}" data-slot="${slotKey(i, slot.key)}">
        <button type="button" class="slot__main" data-action="open-meal" data-day="${i}" data-meal="${slot.key}" aria-label="Editar ${esc(slot.label)}">
          <span class="slot__label"><i>${slot.icon}</i>${esc(slot.label)}</span>
          <span class="slot__chips">${chips}</span>
        </button>
        <button type="button" class="eat" data-action="eat" data-day="${i}" data-meal="${slot.key}" aria-pressed="${eaten}" ${items.length ? '' : 'disabled'} title="Marcar que comeu">
          <span class="eat__star">⭐</span>${eaten ? 'Comi!' : 'Comi?'}
        </button>
      </div>`;
  }).join('');

  return `
    <article class="day${isToday ? ' is-today' : ''}${perfect ? ' is-perfect' : ''}" data-day="${i}" style="--i:${i}">
      <div class="day__head">
        <div class="day__name"><small>Dia ${i + 1} • Semana ${week}</small>${DAY_NAMES[i % 7]}${isToday ? '<span class="today-ribbon">HOJE</span>' : ''}</div>
        <div class="day__stars" aria-label="${eatenCount} de 5 refeições">${MEAL_SLOTS.map((_, k) => `<span class="${k < eatenCount ? 'on' : ''}">⭐</span>`).join('')}</div>
      </div>
      <div class="day__rainbow">${fruitColors.map(c => c === 'rainbow' ? '<i class="rainbow"></i>' : `<i style="background:${c}"></i>`).join('')}</div>
      <div class="day__body">${slots}</div>
    </article>`;
}

function renderPlanner(animate = false) {
  const grid = $('#planner-grid');
  let html = '';
  for (let i = 0; i < S.daysCount; i++) html += dayCardHTML(i);
  grid.innerHTML = html;
  if (!animate && ui.plannerAnimated) $$('.day', grid).forEach(d => { d.style.animation = 'none'; });
  ui.plannerAnimated = true;

  $$('[data-action="days"]').forEach(b => b.classList.toggle('is-active', Number(b.dataset.days) === S.daysCount));
  renderRainbow();
}

function refreshDayCard(i) {
  const old = $(`.day[data-day="${i}"]`);
  if (!old) return;
  const tmp = document.createElement('div');
  tmp.innerHTML = dayCardHTML(i).trim();
  const fresh = tmp.firstElementChild;
  fresh.style.animation = 'none';
  old.replaceWith(fresh);
}

// =========================================================
// RENDER: RECEITAS
// =========================================================
function chefHats(n) {
  return `<span class="chef-hats" title="Dificuldade ${n} de 3">${[1, 2, 3].map(k => `<span class="${k <= n ? '' : 'off'}">👩‍🍳</span>`).join('')}</span>`;
}

function renderRecipes() {
  const cats = [
    { name: 'Todas', icon: '✨', count: RECIPES_CATALOG.length },
    { name: 'Favoritas', icon: '❤️', count: S.favorites.length },
    ...RECIPE_CATEGORIES.map(c => ({ ...c, count: RECIPES_CATALOG.filter(r => r.category === c.name).length }))
  ];
  $('#recipe-filters').innerHTML = cats.map(c => `
    <button type="button" class="pill${ui.recipeCat === c.name ? ' is-active' : ''}" data-action="recipe-cat" data-cat="${esc(c.name)}">
      ${c.icon} ${esc(c.name)} <small>${c.count}</small>
    </button>`).join('');

  const term = norm(ui.recipeSearch.trim());
  const list = RECIPES_CATALOG.filter(r => {
    if (ui.recipeCat === 'Favoritas' && !S.favorites.includes(r.id)) return false;
    if (!['Todas', 'Favoritas'].includes(ui.recipeCat) && r.category !== ui.recipeCat) return false;
    if (!term) return true;
    const hay = norm([r.title, r.category, r.tags.join(' '), r.ingredients.map(i => i.item).join(' ')].join(' '));
    return term.split(/\s+/).every(t => hay.includes(t));
  });

  const grid = $('#recipes-grid');
  if (!list.length) {
    grid.innerHTML = ui.recipeCat === 'Favoritas' && !term
      ? `<div class="empty"><b>🤍</b>Nenhuma favorita ainda. Toque no coração das receitas que mais gostar!</div>`
      : `<div class="empty"><b>🔍</b>Nada encontrado para “${esc(ui.recipeSearch)}”. Tente outro ingrediente!</div>`;
    return;
  }

  grid.innerHTML = list.map((r, i) => {
    const c = catInfo(r.category);
    const fav = S.favorites.includes(r.id);
    const done = S.cooked.includes(r.id);
    return `
      <article class="rcard tone-${c.tone}" style="--i:${Math.min(i, 12)}">
        <button type="button" class="rcard__art" data-action="open-recipe" data-id="${r.id}" aria-label="Abrir ${esc(r.title)}">
          <span class="rcard__emoji">${r.emoji}</span>
          <span class="tag rcard__time">⏱️ ${esc(r.time)}</span>
        </button>
        <button type="button" class="fav${fav ? ' is-on' : ''}" data-action="fav" data-id="${r.id}" aria-pressed="${fav}" aria-label="Favoritar">${fav ? '❤️' : '🤍'}</button>
        <div class="rcard__body">
          <span class="rcard__cat">${c.icon} ${esc(r.category)}</span>
          <h3 class="rcard__title">${esc(r.title)}</h3>
          <p class="rcard__tip">${esc(r.kidTip)}</p>
          <div class="rcard__meta">${chefHats(r.difficulty)}${done ? '<span class="done-badge">✅ Já cozinhei</span>' : `<span>🍽️ ${esc(r.yield)}</span>`}</div>
        </div>
        <div class="rcard__foot">
          <button type="button" class="btn btn--sm btn--white" data-action="open-recipe" data-id="${r.id}">📖 Ver receita</button>
          <button type="button" class="btn btn--sm btn--tangerine" data-action="assign" data-id="${r.id}">➕ Cardápio</button>
        </div>
      </article>`;
  }).join('');
}

function toggleFav(id, btn) {
  const on = !S.favorites.includes(id);
  S.favorites = on ? [...S.favorites, id] : S.favorites.filter(x => x !== id);
  Sound.play(on ? 'pop' : 'unpop');
  buzz();
  if (on && btn) Confetti.burst(centerOf(btn).x, centerOf(btn).y, 14, 5);
  $$(`[data-action="fav"][data-id="${id}"]`).forEach(b => {
    b.classList.toggle('is-on', on);
    b.setAttribute('aria-pressed', on);
    if (b.classList.contains('fav')) b.textContent = on ? '❤️' : '🤍';
    else b.textContent = on ? '❤️ Favorita' : '🤍 Favoritar';
  });
  if (ui.recipeCat === 'Favoritas') renderRecipes();
  else $$('#recipe-filters .pill small')[1].textContent = S.favorites.length;
  checkProgress();
}

// =========================================================
// RENDER: MERCADO
// =========================================================
function renderMarket() {
  const cats = ['Todos', ...new Set(MARKET_CATALOG.map(m => m.category))];
  $('#market-filters').innerHTML = cats.map(c => `
    <button type="button" class="pill${ui.marketCat === c ? ' is-active' : ''}" data-action="market-cat" data-cat="${esc(c)}">${esc(c)}</button>`).join('');

  const term = norm(ui.marketSearch.trim());
  const list = MARKET_CATALOG.filter(m => {
    if (ui.marketCat !== 'Todos' && m.category !== ui.marketCat) return false;
    return !term || norm(`${m.name} ${m.note} ${m.category}`).includes(term);
  });

  $('#market-grid').innerHTML = list.length ? list.map((m, i) => `
    <article class="mcard" style="--i:${Math.min(i, 12)}">
      <div class="mcard__top">
        <span class="mcard__icon">${m.icon}</span>
        ${m.cleanLabel ? '<span class="clean">🌿 Rótulo limpo</span>' : '<span class="tag">⚠️ De vez em quando</span>'}
      </div>
      <span class="rcard__cat">${esc(m.category)}</span>
      <h3>${esc(m.name)}</h3>
      <p class="mcard__protein">💪 ${esc(m.protein)}</p>
      <p class="mcard__note">${esc(m.note)}</p>
      <button type="button" class="btn btn--sm btn--white" data-action="assign" data-id="${m.id}">➕ Colocar no cardápio</button>
    </article>`).join('')
    : `<div class="empty"><b>🔍</b>Nada encontrado para “${esc(ui.marketSearch)}”.</div>`;
}

// =========================================================
// RENDER: DIVERSÃO (quiz, passaporte, conquistas)
// =========================================================
function newQuiz() {
  // Prioriza perguntas que ainda não foram acertadas
  const notYet = shuffle(QUIZ.filter(q => !S.quizCorrect.includes(q.id)));
  const done = shuffle(QUIZ.filter(q => S.quizCorrect.includes(q.id)));
  ui.quiz = { qs: [...notYet, ...done].slice(0, 5), idx: 0, results: [], phase: 'ask', gained: 0, last: null };
}

function renderQuiz() {
  if (!ui.quiz) newQuiz();
  const Q = ui.quiz;
  const box = $('#quiz-box');
  $('#quiz-progress').textContent = `${S.quizCorrect.length}/${QUIZ.length} acertadas`;

  const steps = `<div class="quiz-steps">${Q.qs.map((_, k) => {
    const r = Q.results[k];
    return `<i class="${r === true ? 'ok' : r === false ? 'no' : k === Q.idx && Q.phase !== 'end' ? 'now' : ''}"></i>`;
  }).join('')}</div>`;

  if (Q.phase === 'end') {
    const score = Q.results.filter(Boolean).length;
    const face = score === 5 ? '🏆' : score >= 3 ? '🎉' : '💪';
    const msg = score === 5 ? 'Gabaritou! Que cabeça esperta!' : score >= 3 ? 'Mandou muito bem!' : 'Cada erro ensina algo novo. Bora de novo?';
    box.innerHTML = `${steps}
      <div class="quiz-end">
        <div class="quiz-end__big">${face}</div>
        <h3 class="h2">${score} de 5 acertos</h3>
        <p class="muted">${msg}</p>
        <p><b>${Q.gained ? `+${Q.gained} ⭐ novas` : 'Sem estrelas novas nessa rodada (já tinha acertado essas!)'}</b></p>
        <button type="button" class="btn btn--grape btn--lg" data-action="quiz-again">🔁 Jogar de novo</button>
      </div>`;
    return;
  }

  const q = Q.qs[Q.idx];
  if (Q.phase === 'ask') {
    box.innerHTML = `${steps}
      <div class="quiz-q">${esc(q.q)}</div>
      <div class="quiz-answers">
        <button type="button" class="btn btn--mint" data-action="quiz-answer" data-v="1">✅ Verdade</button>
        <button type="button" class="btn btn--berry" data-action="quiz-answer" data-v="0">❌ Mito</button>
      </div>`;
  } else {
    const ok = Q.last;
    box.innerHTML = `${steps}
      <div class="quiz-q ${ok ? 'is-right' : 'is-wrong'}">
        <div>${ok ? '🎉 Acertou!' : '🤔 Quase!'} <br><span class="quiz-explain">${esc(q.e)}</span></div>
      </div>
      <button type="button" class="btn btn--grape btn--lg" data-action="quiz-next">${Q.idx === Q.qs.length - 1 ? 'Ver resultado 🏁' : 'Próxima ▶'}</button>`;
  }
}

function answerQuiz(v, btn) {
  const Q = ui.quiz;
  if (Q.phase !== 'ask') return;
  const q = Q.qs[Q.idx];
  const ok = (v === '1') === q.a;
  Q.results[Q.idx] = ok;
  Q.last = ok;
  Q.phase = 'feedback';
  if (ok) {
    Sound.play('coin');
    buzz();
    if (!S.quizCorrect.includes(q.id)) {
      S.quizCorrect.push(q.id);
      Q.gained++;
      floatPlus(btn, '+1 ⭐');
    }
    Confetti.burst(centerOf(btn).x, centerOf(btn).y, 30, 7);
  } else {
    Sound.play('wrong');
    buzz([20, 40, 20]);
  }
  renderQuiz();
  checkProgress();
}

const RATES = [
  { k: 'amei', i: '😋', t: 'Amei' },
  { k: 'ok', i: '🙂', t: 'Gostei' },
  { k: 'ainda', i: '🤔', t: 'Ainda não' }
];

function stampHTML(f) {
  const r = S.tasted[f.id];
  return `
    <div class="stamp${r ? ' is-stamped' : ''}" data-fruit="${f.id}">
      <span class="stamp__emoji">${f.icon}</span>
      <span class="stamp__name">${esc(f.short)}</span>
      <span class="stamp__rates">${RATES.map(x => `<button type="button" class="${r === x.k ? 'is-on' : ''}" data-action="taste" data-id="${f.id}" data-rate="${x.k}" title="${x.t}" aria-label="${esc(f.short)}: ${x.t}">${x.i}</button>`).join('')}</span>
    </div>`;
}

function renderPassport() {
  $('#passport-count').textContent = `${Object.keys(S.tasted).length}/${FRUITS_CATALOG.length} carimbos`;
  $('#passport-grid').innerHTML = FRUITS_CATALOG.map(stampHTML).join('');
}

function taste(id, rate, btn) {
  const was = S.tasted[id];
  if (was === rate) {
    delete S.tasted[id];
    Sound.play('unpop');
  } else {
    S.tasted[id] = rate;
    if (!was) {
      Sound.play('stamp');
      buzz(25);
      floatPlus(btn, '+2 ⭐');
      Confetti.burst(centerOf(btn).x, centerOf(btn).y, 22, 6);
    } else Sound.play('pop');
  }
  const card = $(`.stamp[data-fruit="${id}"]`);
  const f = FRUITS_CATALOG.find(x => x.id === id);
  const tmp = document.createElement('div');
  tmp.innerHTML = stampHTML(f).trim();
  const fresh = tmp.firstElementChild;
  if (!was && S.tasted[id]) fresh.classList.add('just-stamped');
  card.replaceWith(fresh);
  $('#passport-count').textContent = `${Object.keys(S.tasted).length}/${FRUITS_CATALOG.length} carimbos`;
  if (S.tasted[id] === 'ainda' && !was) sayTip('Provar já é coragem! Tente de novo outro dia. 💪');
  checkProgress();
}

function renderBadges() {
  $('#badges-count').textContent = `${S.unlocked.length} / ${ACHIEVEMENTS.length}`;
  $('#badges-grid').innerHTML = ACHIEVEMENTS.map(a => {
    const on = S.unlocked.includes(a.id);
    return `
      <div class="badge${on ? ' is-on' : ''}">
        <span class="badge__icon">${a.icon}</span>
        <div><h4>${esc(a.title)}</h4><p>${esc(a.desc)}</p></div>
      </div>`;
  }).join('');
}

function renderFun() {
  renderQuiz();
  renderPassport();
  renderBadges();
}

// =========================================================
// ABAS
// =========================================================
const TAB_HASH = { planner: 'cardapio', recipes: 'receitas', market: 'mercado', fun: 'diversao' };

function setTab(tab, opts = {}) {
  if (!TAB_HASH[tab]) tab = 'planner';
  const changed = ui.tab !== tab;
  ui.tab = tab;
  $$('.tab').forEach(b => b.classList.toggle('is-active', b.dataset.tab === tab));
  $$('.view').forEach(v => { v.hidden = v.dataset.view !== tab; });
  if (tab === 'fun') renderFun();
  if (changed && !opts.silent) { Sound.play('tick'); window.scrollTo({ top: 0, behavior: REDUCED_MOTION ? 'auto' : 'smooth' }); }
  try { history.replaceState(null, '', '#' + TAB_HASH[tab]); } catch (e) {}
}

// =========================================================
// MODAIS
// =========================================================
function openModal(id) {
  if (ui.modal && ui.modal !== id) $('#' + ui.modal).hidden = true;
  else ui.lastFocus = document.activeElement;
  const m = $('#' + id);
  m.hidden = false;
  ui.modal = id;
  document.body.style.overflow = 'hidden';
  const focusable = m.querySelector('.close, button, input');
  if (focusable) setTimeout(() => focusable.focus({ preventScroll: true }), 30);
}

function closeModal() {
  if (!ui.modal) return;
  const closing = ui.modal;
  $('#' + closing).hidden = true;
  ui.modal = null;
  document.body.style.overflow = '';
  if (ui.lastFocus && document.contains(ui.lastFocus)) ui.lastFocus.focus({ preventScroll: true });
  if (closing === 'cook-modal' && ui.recipeId) { /* volta ao livro */ }
}

// =========================================================
// MONTADOR DE REFEIÇÃO
// =========================================================
const SLOT_PREFS = {
  cafe:   ['Lanches & Cafés', 'Doces & Shakes'],
  escola: ['Lanches & Cafés', 'Doces & Shakes', 'Saladas & Molhos'],
  almoco: ['Proteínas Principais', 'Acompanhamentos', 'Saladas & Molhos'],
  tarde:  ['Doces & Shakes', 'Lanches & Cafés'],
  jantar: ['Sopas & Caldos', 'Proteínas Principais', 'Saladas & Molhos', 'Acompanhamentos']
};

function openMeal(day, meal) {
  ui.editing = { day, meal };
  ui.temp = [...S.plan[day][meal]];
  ui.picker = 'recipes';
  ui.pickerSearch = '';
  $('#picker-search').value = '';
  const slot = MEAL_SLOTS.find(s => s.key === meal);
  $('#meal-day').textContent = `Dia ${day + 1} • ${DAY_NAMES[day % 7]}${day >= 7 ? ' (semana 2)' : ''}`;
  $('#meal-title').textContent = `${slot.icon} ${slot.label}`;
  renderPickerTabs();
  renderCombo();
  renderPicker();
  openModal('meal-modal');
}

function balanceOf(ids) {
  const has = { veg: false, prot: false, energy: false, drink: false };
  ids.forEach(id => {
    const it = resolveItem(id);
    if (it.type === 'fruit') has.veg = true;
    if (it.type === 'drink') {
      has.drink = true;
      if (it.raw.sector === L) has.prot = true;
    }
    if (it.type === 'market') {
      if ([P, L].includes(it.raw.sector)) has.prot = true;
      if ([PC, SN, M].includes(it.raw.sector)) has.energy = true;
    }
    if (it.type === 'recipe') {
      const r = it.raw;
      if (r.ingredients.some(i => i.sector === P) || r.ingredients.some(i => /queijo|iogurte|feij|grão/i.test(i.item))) has.prot = true;
      if (r.ingredients.some(i => [M, PC].includes(i.sector) && /aveia|tapioca|flocão|arroz|macarr|pão|batata|feij|grão|farinha/i.test(i.item)) || r.ingredients.some(i => /batata|macaxeira|inhame|banana/i.test(i.item))) has.energy = true;
      if (r.tags.includes('Vegetais') || r.category === 'Saladas & Molhos' || r.ingredients.filter(i => i.sector === H).length >= 2) has.veg = true;
    }
  });
  return has;
}

function renderCombo() {
  const box = $('#combo-chips');
  box.innerHTML = ui.temp.length
    ? ui.temp.map((id, idx) => {
        const it = resolveItem(id);
        return `<span class="combo-chip">${it.icon} ${esc(it.name)}<button type="button" data-action="remove-temp" data-idx="${idx}" aria-label="Tirar ${esc(it.name)}">✕</button></span>`;
      }).join('')
    : `<span class="combo-empty">Pratinho vazio… escolha abaixo ou peça uma sugestão mágica ✨</span>`;

  const b = balanceOf(ui.temp);
  const score = Object.values(b).filter(Boolean).length;
  $('#combo-balance').innerHTML = `
    <span class="${b.veg ? 'ok' : ''}">🥕 Fruta/vegetal</span>
    <span class="${b.prot ? 'ok' : ''}">💪 Proteína</span>
    <span class="${b.energy ? 'ok' : ''}">🌾 Energia</span>
    <span class="${b.drink ? 'ok' : ''}">💧 Bebida</span>
    ${score >= 3 ? '<span class="full">🌟 Prato completo!</span>' : ''}`;
}

function renderPickerTabs() {
  $$('.ptab').forEach(b => b.classList.toggle('is-active', b.dataset.picker === ui.picker));
}

function renderPicker() {
  const term = norm(ui.pickerSearch.trim());
  const meal = ui.editing ? ui.editing.meal : 'cafe';
  let list = [];
  if (ui.picker === 'recipes') {
    const prefs = SLOT_PREFS[meal];
    list = [...RECIPES_CATALOG]
      .sort((a, b) => {
        const ia = prefs.indexOf(a.category), ib = prefs.indexOf(b.category);
        return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
      })
      .map(r => ({ id: r.id, title: r.title, sub: `${r.category} • ${r.time}`, icon: r.emoji }));
  } else if (ui.picker === 'fruits') {
    const used = planFruits();
    list = FRUITS_CATALOG.map(f => ({ id: f.id, title: f.name, sub: used.has(f.id) ? `Cor: ${f.color}` : `Cor: ${f.color} • 🌈 nova na semana!`, icon: f.icon }));
  } else if (ui.picker === 'drinks') {
    list = DRINKS_CATALOG.map(d => ({ id: d.id, title: d.name, sub: d.id === 'd-agua' ? 'A bebida campeã!' : 'Bebida', icon: d.icon }));
  } else {
    list = MARKET_CATALOG.map(m => ({ id: m.id, title: m.name, sub: `${m.protein} • ${m.category}`, icon: m.icon }));
  }
  list = list.filter(x => !term || norm(`${x.title} ${x.sub}`).includes(term));
  $('#picker-grid').innerHTML = list.length ? list.map(x => {
    const inside = ui.temp.includes(x.id);
    return `
      <button type="button" class="opt${inside ? ' is-in' : ''}" data-action="toggle-temp" data-id="${x.id}">
        <span class="opt__ico">${x.icon}</span>
        <span class="opt__txt"><b>${esc(x.title)}</b><small>${esc(x.sub)}</small></span>
        <span class="opt__add">${inside ? '✓ no prato' : '+ add'}</span>
      </button>`;
  }).join('') : `<p class="muted small">Nada por aqui com esse filtro.</p>`;
}

function pickFruit(avoid = new Set()) {
  const used = planFruits();
  const fresh = FRUITS_CATALOG.filter(f => !used.has(f.id) && !avoid.has(f.id) && f.id !== 'f-salada');
  return pick(fresh.length ? fresh : FRUITS_CATALOG.filter(f => !avoid.has(f.id))).id;
}

function suggestFor(meal, avoidFruits = new Set()) {
  const byCat = (...cats) => RECIPES_CATALOG.filter(r => cats.includes(r.category));
  const lancheira = RECIPES_CATALOG.filter(r => r.tags.includes('Lancheira'));
  const fruit = () => { const f = pickFruit(avoidFruits); avoidFruits.add(f); return f; };
  switch (meal) {
    case 'cafe':
      return [pick(byCat('Lanches & Cafés')).id, Math.random() < 0.5 ? fruit() : pick(['d-leite', 'd-vitamina', 'd-iogurte'])];
    case 'escola':
      return [pick(lancheira).id, fruit(), pick(['d-agua', 'd-agua', 'd-aguacoco'])];
    case 'almoco':
      return [pick(byCat('Proteínas Principais')).id, pick(byCat('Acompanhamentos')).id, pick(byCat('Saladas & Molhos')).id];
    case 'tarde':
      return Math.random() < 0.5 ? [pick(byCat('Doces & Shakes')).id] : [pick(byCat('Lanches & Cafés')).id, fruit()];
    case 'jantar':
      return Math.random() < 0.55 ? [pick(byCat('Sopas & Caldos')).id] : [pick(byCat('Proteínas Principais')).id, pick(byCat('Saladas & Molhos', 'Acompanhamentos')).id];
  }
  return [];
}

// =========================================================
// ADICIONAR AO CARDÁPIO (a partir de receitas/mercado)
// =========================================================
function guessMeal(it) {
  if (it.type === 'recipe') {
    const c = it.raw.category;
    if (c === 'Lanches & Cafés') return it.raw.tags.includes('Lancheira') ? 'escola' : 'cafe';
    if (c === 'Doces & Shakes') return 'tarde';
    if (c === 'Sopas & Caldos') return 'jantar';
    return 'almoco';
  }
  return 'escola';
}

function openAssign(id) {
  const it = resolveItem(id);
  ui.assignId = id;
  ui.assignDay = todayIdx() < S.daysCount ? todayIdx() : 0;
  ui.assignMeal = guessMeal(it);
  $('#assign-item').textContent = `${it.icon} ${it.name}`;
  renderAssignChoices();
  openModal('assign-modal');
}

function renderAssignChoices() {
  let days = '';
  for (let i = 0; i < S.daysCount; i++) {
    days += `<button type="button" class="choice${i === ui.assignDay ? ' is-active' : ''}${i === todayIdx() ? ' is-today' : ''}" data-action="assign-day" data-day="${i}">${DAY_SHORT[i % 7]}<small>${i === todayIdx() ? 'hoje' : 'dia ' + (i + 1)}</small></button>`;
  }
  $('#assign-days').innerHTML = days;
  $('#assign-meals').innerHTML = MEAL_SLOTS.map(s =>
    `<button type="button" class="choice${s.key === ui.assignMeal ? ' is-active' : ''}" data-action="assign-meal" data-meal="${s.key}">${s.icon} ${esc(s.short)}</button>`).join('');
}

// =========================================================
// RECEITA E MODO COZINHEIRA
// =========================================================
function openRecipe(id) {
  const r = RECIPES_CATALOG.find(x => x.id === id);
  if (!r) return;
  ui.recipeId = id;
  const c = catInfo(r.category);
  const head = $('#recipe-head');
  head.className = `modal__head recipe-head tone-${c.tone}`;
  $('#recipe-emoji').textContent = r.emoji;
  $('#recipe-title').textContent = r.title;
  $('#recipe-meta').textContent = `${r.category} • ⏱️ ${r.time} • 🍽️ ${r.yield}`;
  $('#recipe-body').innerHTML = `
    <div class="r-tags">${r.tags.map(t => `<span>#${esc(t)}</span>`).join('')}<span>${chefHats(r.difficulty)}</span></div>
    <div class="r-boxes">
      <div class="r-box r-box--mint"><b>💡 Dica para a criança</b>${esc(r.kidTip)}</div>
      ${r.kidCan ? `<div class="r-box r-box--sky"><b>🧒 A criança pode ajudar</b>${esc(r.kidCan)}</div>` : ''}
    </div>
    <div class="r-cols">
      <div>
        <h4>🧺 Ingredientes</h4>
        <ul class="ing-list">${r.ingredients.map(i => `<li><label><input type="checkbox" /><span>${esc(i.item)}</span></label></li>`).join('')}</ul>
      </div>
      <div>
        <h4>👩‍🍳 Modo de preparo</h4>
        <ol class="steps-list">${r.steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol>
      </div>
    </div>`;
  const fav = S.favorites.includes(id);
  $('#recipe-foot').innerHTML = `
    <button type="button" class="btn btn--white btn--sm" data-action="fav" data-id="${id}" aria-pressed="${fav}">${fav ? '❤️ Favorita' : '🤍 Favoritar'}</button>
    <button type="button" class="btn btn--white btn--sm" data-action="print-recipe" data-id="${id}">🖨️ Imprimir</button>
    <button type="button" class="btn btn--tangerine btn--sm" data-action="assign" data-id="${id}">➕ Cardápio</button>
    <button type="button" class="btn btn--berry" data-action="start-cook" data-id="${id}">👩‍🍳 Cozinhar junto!</button>`;
  openModal('recipe-modal');
}

function startCook(id) {
  ui.cookId = id;
  ui.cookStep = 0;
  renderCook();
  openModal('cook-modal');
  Sound.play('whoosh');
}

function renderCook() {
  const r = RECIPES_CATALOG.find(x => x.id === ui.cookId);
  const total = r.steps.length + 1;
  const s = ui.cookStep;
  $('#cook-title').textContent = `${r.emoji} ${r.title}`;
  $('#cook-step-label').textContent = s === 0 ? 'Preparação' : `Passo ${s} de ${r.steps.length}`;
  $('#cook-dots').innerHTML = Array.from({ length: total }, (_, k) => `<i class="${k <= s ? 'done' : ''}"></i>`).join('');
  const stage = $('#cook-stage');
  if (s === 0) {
    stage.innerHTML = `
      <div class="cook__big">🧼🧺</div>
      <p class="cook__text">Lave as mãos e separe tudo!</p>
      <div class="cook__list">${r.ingredients.map(i => `<label><input type="checkbox" /> ${esc(i.item)}</label>`).join('')}</div>
      ${r.kidCan ? `<p class="cook__kid">🧒 Sua missão: ${esc(r.kidCan)}</p>` : ''}
      <p class="cook__kid">🔥 Fogão, forno e faca ficam com o adulto.</p>`;
  } else {
    stage.innerHTML = `
      <div class="cook__big">${KEYCAPS[s - 1] || '👉'}</div>
      <p class="cook__text">${esc(r.steps[s - 1])}</p>`;
  }
  $('[data-action="cook-prev"]').disabled = s === 0;
  $('#cook-next').textContent = s === total - 1 ? 'Terminei! 🎉' : 'Próximo ▶';
}

function cookNext() {
  const r = RECIPES_CATALOG.find(x => x.id === ui.cookId);
  if (ui.cookStep < r.steps.length) {
    ui.cookStep++;
    Sound.play('pop');
    buzz();
    renderCook();
    return;
  }
  // Fim da receita!
  const first = !S.cooked.includes(r.id);
  if (first) S.cooked.push(r.id);
  closeModal();
  Sound.play('fanfare');
  buzz([30, 30, 30]);
  Confetti.rain(140);
  toast(first ? `👩‍🍳 Receita concluída! +3 ⭐` : `👩‍🍳 Mais uma vez! Que chef!`, 'gold');
  sayTip(`Hummm, ${r.title.split(' ').slice(0, 3).join(' ')}… que cheirinho bom! 😋`);
  renderRecipes();
  checkProgress();
}

// =========================================================
// LISTA DE COMPRAS
// =========================================================
function buildShoppingList() {
  const sectors = new Map(SECTOR_ORDER.map(s => [s, new Map()]));
  const add = (sector, name) => {
    const sec = sectors.get(sector) || sectors.get(M);
    sec.set(name, (sec.get(name) || 0) + 1);
  };
  for (let i = 0; i < S.daysCount; i++) {
    MEAL_SLOTS.forEach(slot => S.plan[i][slot.key].forEach(id => {
      const it = resolveItem(id);
      if (!it.raw) return;
      if (it.type === 'recipe') it.raw.ingredients.forEach(ing => add(ing.sector, ing.item));
      else if (it.type === 'fruit') add(H, it.raw.short);
      else if (it.type === 'drink') it.raw.ingredients.forEach(ing => add(it.raw.sector, ing));
      else if (it.type === 'market') add(it.raw.sector, it.raw.name);
    }));
  }
  return sectors;
}

function shoppingCount(sectors = buildShoppingList()) {
  let total = 0, checked = 0;
  sectors.forEach((map, sec) => map.forEach((_, name) => { total++; if (S.shopChecked[`${sec}|${name}`]) checked++; }));
  return { total, checked };
}

function updateShoppingBadge() {
  const { total, checked } = shoppingCount();
  $('#shopping-badge').textContent = Math.max(0, total - checked);
}

function renderShopping() {
  const sectors = buildShoppingList();
  let html = '';
  sectors.forEach((map, sec) => {
    if (!map.size) return;
    const items = [...map.entries()].sort((a, b) => a[0].localeCompare(b[0], 'pt-BR')).map(([name, n]) => {
      const key = `${sec}|${name}`;
      const on = !!S.shopChecked[key];
      return `
        <label class="shop-item${on ? ' is-checked' : ''}">
          <input type="checkbox" data-shop="${esc(key)}" ${on ? 'checked' : ''} />
          <span>${esc(name)}</span>
          <em>${n}x</em>
        </label>`;
    }).join('');
    html += `<div class="shop-sector"><h4>${SECTOR_ICONS[sec] || '🛒'} ${esc(sec)} <small>${map.size}</small></h4><div class="shop-items">${items}</div></div>`;
  });
  $('#shop-sub').textContent = `Para ${S.daysCount} dias de cardápio`;
  $('#shopping-content').innerHTML = html || `<div class="empty"><b>🧺</b>Seu cardápio está vazio. Monte algumas refeições para gerar a lista!</div>`;
  updateShopProgress(sectors);
}

function updateShopProgress(sectors) {
  const { total, checked } = shoppingCount(sectors);
  const pct = total ? Math.round((checked / total) * 100) : 0;
  $('#shop-bar').style.width = pct + '%';
  $('#shop-pct').textContent = pct + '%';
  $('#cart-run').style.transform = `translateX(${Math.round(pct * 0.3)}px) rotate(${pct % 2 ? -6 : 6}deg)`;
  updateShoppingBadge();
  return pct;
}

function shoppingText() {
  const sectors = buildShoppingList();
  let text = `🛍️ *LISTA DE COMPRAS • ${S.daysCount} DIAS*\n_Cardápio Kids_\n\n`;
  sectors.forEach((map, sec) => {
    if (!map.size) return;
    text += `*${SECTOR_ICONS[sec] || ''} ${sec.toUpperCase()}*\n`;
    [...map.keys()].sort((a, b) => a.localeCompare(b, 'pt-BR')).forEach(name => {
      text += `${S.shopChecked[`${sec}|${name}`] ? '✅' : '▫️'} ${name}\n`;
    });
    text += '\n';
  });
  return text.trim();
}

async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return true; }
  catch (e) {
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch (err) {}
    ta.remove();
    return ok;
  }
}

// =========================================================
// IMPRESSÃO
// =========================================================
function printHTML(html) {
  const area = $('#single-print-area');
  area.innerHTML = html;
  document.body.classList.add('printing-single');
  const done = () => { document.body.classList.remove('printing-single'); window.removeEventListener('afterprint', done); };
  window.addEventListener('afterprint', done);
  window.print();
  setTimeout(done, 1500);
}

function printRecipe(id) {
  const r = RECIPES_CATALOG.find(x => x.id === id);
  if (!r) return;
  printHTML(`
    <p class="pmeta">${esc(r.category)} • ${esc(r.time)} • ${esc(r.yield)}</p>
    <h1>${r.emoji} ${esc(r.title)}</h1>
    <p class="ptip"><b>Dica:</b> ${esc(r.kidTip)}${r.kidCan ? `<br><b>A criança pode:</b> ${esc(r.kidCan)}` : ''}</p>
    <h2>Ingredientes</h2>
    <ul>${r.ingredients.map(i => `<li>${esc(i.item)}</li>`).join('')}</ul>
    <h2>Modo de preparo</h2>
    <ol>${r.steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol>`);
}

function printShopping() {
  const sectors = buildShoppingList();
  let html = `<h1>🛍️ Lista de Compras (${S.daysCount} dias)</h1><div class="pcols">`;
  sectors.forEach((map, sec) => {
    if (!map.size) return;
    html += `<h2>${esc(sec)}</h2><div>${[...map.keys()].map(n => `<div><span class="pbox"></span>${esc(n)}</div>`).join('')}</div>`;
  });
  printHTML(html + '</div>');
}

// =========================================================
// CONFIGURAÇÕES E BACKUP
// =========================================================
function openSettings() {
  ui.draft = { ...S.profile, sound: S.sound };
  $('#set-name').value = ui.draft.name;
  $('#set-sound').checked = ui.draft.sound;
  renderSettingsChoices();
  openModal('settings-modal');
}

function renderSettingsChoices() {
  $('#set-avatars').innerHTML = AVATARS.map(a =>
    `<button type="button" class="${a === ui.draft.avatar ? 'is-active' : ''}" data-action="set-avatar" data-a="${a}" aria-label="Avatar ${a}">${a}</button>`).join('');
  $$('[data-action="set-gender"]').forEach(b => b.classList.toggle('is-active', b.dataset.g === ui.draft.gender));
}

function saveSettings() {
  S.profile = { name: $('#set-name').value.trim().slice(0, 20), avatar: ui.draft.avatar, gender: ui.draft.gender };
  S.sound = $('#set-sound').checked;
  save();
  closeModal();
  renderStatus();
  renderBadges();
  Sound.play('pop');
  toast(`Prontinho${S.profile.name ? ', ' + S.profile.name : ''}! ${S.profile.avatar}`);
}

function exportBackup() {
  const blob = new Blob([JSON.stringify(S, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `cardapio-kids-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  toast('💾 Backup salvo!');
}

function importBackup(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (!data || !Array.isArray(data.plan)) throw new Error('formato');
      S = normalizeState(data);
      save();
      closeModal();
      renderAll(true);
      toast('✅ Backup restaurado!');
    } catch (e) {
      toast('⚠️ Esse arquivo não parece um backup do Cardápio Kids.');
    }
  };
  reader.readAsText(file);
}

// =========================================================
// RENDER GERAL
// =========================================================
function renderAll(animate = false) {
  renderPlanner(animate);
  renderRecipes();
  renderMarket();
  renderStatus();
  if (ui.tab === 'fun') renderFun();
}

// =========================================================
// AÇÕES (delegação de eventos)
// =========================================================
const ACTIONS = {
  tab(el) {
    setTab(el.dataset.tab);
    if (el.dataset.scroll) setTimeout(() => $('#' + el.dataset.scroll)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
  },
  mascot(el) {
    ui.tipIdx = (ui.tipIdx + 1) % MASCOT_TIPS.length;
    sayTip(MASCOT_TIPS[ui.tipIdx]);
    Sound.play('pop');
    el.style.animation = 'none'; void el.offsetWidth; el.style.animation = 'squish .45s var(--spring), float 3.2s ease-in-out .45s infinite';
  },
  days(el) {
    S.daysCount = Number(el.dataset.days) === 14 ? 14 : 7;
    save();
    Sound.play('tick');
    renderPlanner(true);
    renderStatus();
  },
  randomize() {
    if (!confirm('Sortear um cardápio novinho? O atual será substituído.')) return;
    const dice = $('#dice');
    dice.classList.remove('is-rolling'); void dice.offsetWidth; dice.classList.add('is-rolling');
    Sound.play('whoosh');
    const avoid = new Set();
    for (let i = 0; i < S.daysCount; i++) {
      const d = emptyDay();
      MEAL_SLOTS.forEach(s => { d[s.key] = suggestFor(s.key, avoid); });
      S.plan[i] = d;
      if (avoid.size > FRUITS_CATALOG.length - 3) avoid.clear();
    }
    save();
    setTimeout(() => {
      renderPlanner(true);
      renderStatus();
      Confetti.burst(centerOf(dice).x, centerOf(dice).y, 40, 8);
      toast('🎲 Cardápio novo sorteado!');
      checkProgress();
    }, 350);
  },
  'reset-plan'() {
    if (!confirm('Voltar para o cardápio base? O atual será substituído.')) return;
    S.plan = createInitialPlan(14);
    save();
    renderPlanner(true);
    renderStatus();
    toast('🔄 Cardápio base restaurado!');
    checkProgress();
  },
  'new-week'() {
    const n = computeProgress().eatenCount;
    if (!confirm(`Começar semana nova? Os “Comi!” serão limpos, mas suas ${n} estrelas vão para o cofrinho. 🐷`)) return;
    S.banked += n;
    S.eaten = {};
    S.shopChecked = {};
    save();
    renderPlanner(true);
    renderStatus();
    Sound.play('whoosh');
    toast(`🌅 Semana nova! ${n} ⭐ guardadas no cofrinho.`);
  },
  'print-plan'() {
    renderStatus();
    window.print();
  },
  eat(el) {
    const day = Number(el.dataset.day), meal = el.dataset.meal;
    if (!S.plan[day][meal].length) return;
    const key = slotKey(day, meal);
    const wasPerfect = isPerfect(day);
    const on = !S.eaten[key];
    if (on) S.eaten[key] = true; else delete S.eaten[key];
    save();

    const pos = centerOf(el);
    const before = rainbowInfo().count;
    refreshDayCard(day);
    renderRainbow();
    if (on && rainbowInfo().count > before) setTimeout(() => sayTip('Mais uma cor no arco-íris! 🌈'), 300);
    if (on) {
      Sound.play('coin');
      buzz();
      floatPlus($(`.day[data-day="${day}"] .eat[data-meal="${meal}"]`), '+1 ⭐');
      Confetti.burst(pos.x, pos.y, 18, 5);
      if (!wasPerfect && isPerfect(day)) {
        setTimeout(() => {
          Sound.play('fanfare');
          Confetti.rain(120);
          toast(`🏆 Dia perfeito na ${DAY_NAMES[day % 7]}!`, 'gold');
        }, 250);
      }
    } else Sound.play('unpop');
    checkProgress();
  },
  'open-meal'(el) { openMeal(Number(el.dataset.day), el.dataset.meal); },
  picker(el) {
    ui.picker = el.dataset.picker;
    renderPickerTabs();
    renderPicker();
    Sound.play('tick');
  },
  'toggle-temp'(el) {
    const id = el.dataset.id;
    if (ui.temp.includes(id)) { ui.temp = ui.temp.filter(x => x !== id); Sound.play('unpop'); }
    else { ui.temp.push(id); Sound.play('pop'); buzz(8); }
    renderCombo();
    renderPicker();
  },
  'remove-temp'(el) {
    ui.temp.splice(Number(el.dataset.idx), 1);
    Sound.play('unpop');
    renderCombo();
    renderPicker();
  },
  'suggest-combo'(el) {
    ui.temp = suggestFor(ui.editing.meal);
    Sound.play('whoosh');
    Confetti.burst(centerOf(el).x, centerOf(el).y, 20, 5);
    renderCombo();
    renderPicker();
  },
  'clear-slot'() { ui.temp = []; Sound.play('unpop'); renderCombo(); renderPicker(); },
  'save-slot'() {
    const { day, meal } = ui.editing;
    S.plan[day][meal] = [...ui.temp];
    if (!ui.temp.length) delete S.eaten[slotKey(day, meal)];
    save();
    closeModal();
    refreshDayCard(day);
    renderRainbow();
    renderStatus();
    Sound.play('coin');
    const complete = Object.values(balanceOf(ui.temp)).filter(Boolean).length >= 3;
    toast(complete ? '🌟 Prato completo salvo!' : '✅ Refeição salva!');
    checkProgress();
  },
  assign(el) { openAssign(el.dataset.id); },
  'assign-day'(el) { ui.assignDay = Number(el.dataset.day); Sound.play('tick'); renderAssignChoices(); },
  'assign-meal'(el) { ui.assignMeal = el.dataset.meal; Sound.play('tick'); renderAssignChoices(); },
  'confirm-assign'(el) {
    const list = S.plan[ui.assignDay][ui.assignMeal];
    if (!list.includes(ui.assignId)) list.push(ui.assignId);
    save();
    closeModal();
    renderPlanner();
    renderStatus();
    Sound.play('coin');
    const slot = MEAL_SLOTS.find(s => s.key === ui.assignMeal);
    toast(`🎉 Foi para ${DAY_NAMES[ui.assignDay % 7]} • ${slot.short}!`);
    checkProgress();
  },
  'recipe-cat'(el) { ui.recipeCat = el.dataset.cat; Sound.play('tick'); renderRecipes(); },
  'market-cat'(el) { ui.marketCat = el.dataset.cat; Sound.play('tick'); renderMarket(); },
  fav(el) { toggleFav(el.dataset.id, el); },
  'open-recipe'(el) { openRecipe(el.dataset.id); Sound.play('pop'); },
  'print-recipe'(el) { printRecipe(el.dataset.id); },
  'start-cook'(el) { startCook(el.dataset.id); },
  'cook-next'() { cookNext(); },
  'cook-prev'() { if (ui.cookStep > 0) { ui.cookStep--; Sound.play('unpop'); renderCook(); } },
  'quiz-answer'(el) { answerQuiz(el.dataset.v, el); },
  'quiz-next'() {
    const Q = ui.quiz;
    Q.idx++;
    Q.phase = Q.idx >= Q.qs.length ? 'end' : 'ask';
    if (Q.phase === 'end') {
      const score = Q.results.filter(Boolean).length;
      if (score >= 4) { Sound.play('fanfare'); Confetti.rain(100); } else Sound.play('pop');
    } else Sound.play('tick');
    renderQuiz();
  },
  'quiz-again'() { newQuiz(); Sound.play('whoosh'); renderQuiz(); },
  taste(el) { taste(el.dataset.id, el.dataset.rate, el); },
  'open-shopping'() { renderShopping(); openModal('shopping-modal'); Sound.play('pop'); },
  'shop-uncheck'() { S.shopChecked = {}; save(); renderShopping(); Sound.play('unpop'); },
  async 'copy-shopping'() {
    const ok = await copyText(shoppingText());
    toast(ok ? '📋 Lista copiada!' : '⚠️ Não consegui copiar. Tente pelo WhatsApp.');
  },
  'share-shopping'() {
    const text = shoppingText();
    window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank', 'noopener');
  },
  'print-shopping'() { printShopping(); },
  'open-settings'() { openSettings(); },
  'set-avatar'(el) { ui.draft.avatar = el.dataset.a; Sound.play('pop'); renderSettingsChoices(); },
  'set-gender'(el) { ui.draft.gender = el.dataset.g; Sound.play('tick'); renderSettingsChoices(); },
  'save-settings'() { saveSettings(); },
  export() { exportBackup(); },
  'reset-all'() {
    if (!confirm('Zerar TUDO? Cardápio, estrelas, carimbos e conquistas serão apagados.')) return;
    S = defaults();
    save();
    closeModal();
    ui.quiz = null;
    ui.prevTotal = null;
    renderAll(true);
    if (ui.tab === 'fun') renderFun();
    toast('🗑️ Tudo zerado. Recomeçar é divertido!');
  },
  'close-modal'() { closeModal(); }
};

function bindEvents() {
  const unlockAudio = () => { Sound.unlocked = true; };
  ['pointerdown', 'keydown', 'touchstart'].forEach(ev => document.addEventListener(ev, unlockAudio, { once: true, capture: true, passive: true }));
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-action]');
    if (el && ACTIONS[el.dataset.action]) {
      ACTIONS[el.dataset.action](el, e);
      return;
    }
    // Clique fora da caixa fecha o modal
    if (e.target.classList && e.target.classList.contains('modal')) closeModal();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && ui.modal) closeModal();
    if (ui.modal === 'cook-modal') {
      if (e.key === 'ArrowRight') cookNext();
      if (e.key === 'ArrowLeft') ACTIONS['cook-prev']();
    }
  });

  $('#recipe-search').addEventListener('input', e => { ui.recipeSearch = e.target.value; renderRecipes(); });
  $('#market-search').addEventListener('input', e => { ui.marketSearch = e.target.value; renderMarket(); });
  $('#picker-search').addEventListener('input', e => { ui.pickerSearch = e.target.value; renderPicker(); });

  $('#shopping-content').addEventListener('change', e => {
    const key = e.target.dataset.shop;
    if (!key) return;
    if (e.target.checked) { S.shopChecked[key] = true; Sound.play('pop'); buzz(8); }
    else { delete S.shopChecked[key]; Sound.play('unpop'); }
    e.target.closest('.shop-item').classList.toggle('is-checked', e.target.checked);
    save();
    const before = $('#shop-pct').textContent;
    const pct = updateShopProgress();
    if (pct === 100 && before !== '100%') {
      Sound.play('fanfare');
      Confetti.rain(120);
      toast('🛒 Compras completas! Bora cozinhar?', 'gold');
    }
  });

  $('#import-file').addEventListener('change', e => {
    const f = e.target.files && e.target.files[0];
    if (f) importBackup(f);
    e.target.value = '';
  });

  window.addEventListener('hashchange', () => setTab(tabFromHash(), { silent: true }));
}

function tabFromHash() {
  const h = location.hash.replace('#', '');
  return Object.keys(TAB_HASH).find(k => TAB_HASH[k] === h) || 'planner';
}

// =========================================================
// INÍCIO
// =========================================================
function init() {
  mountMascots();
  Confetti.init();
  bindEvents();
  renderAll(true);
  setTab(tabFromHash(), { silent: true });
  checkProgress();

  const name = S.profile.name.trim();
  const hour = new Date().getHours();
  const hi = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
  sayTip(`${hi}${name ? ', ' + name : ''}! Eu sou a Tangi 🍊 Toque em mim para dicas!`);

  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
}

document.addEventListener('DOMContentLoaded', init);
