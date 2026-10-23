(() => {
  const CFG = window.GIFT_CONFIG;
  const HERO = CFG.hero;
  const CODE = CFG.code.startsWith('b64:') ? atob(CFG.code.slice(4)) : CFG.code;
  const KEY = 'david20.v1';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const app = document.getElementById('app');
  const topbar = document.getElementById('topbar');
  const wipe = document.getElementById('wipe');
  const wipeText = document.getElementById('wipeText');
  const fxLayer = document.getElementById('fx');
  const muteBtn = document.getElementById('mute');

  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const rand = (a, b) => a + Math.random() * (b - a);
  const plural = (n, [one, few, many]) => {
    const m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return one;
    if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few;
    return many;
  };

  /* ---------- Состояние ---------- */
  const fresh = () => ({ screen: 'cover', stones: [], bossWon: false, bossTries: 0, opened: false, time: 0, stats: {} });
  const params = new URLSearchParams(location.search);
  if (params.has('reset')) localStorage.removeItem(KEY);
  let S;
  try {
    S = Object.assign(fresh(), JSON.parse(localStorage.getItem(KEY) || '{}'));
  } catch {
    S = fresh();
  }
  if (params.has('dev')) S.stones = ART.STONES.map((s) => s.id);
  const save = () => localStorage.setItem(KEY, JSON.stringify(S));

  setInterval(() => {
    if (document.hidden || S.opened) return;
    S.time++;
    if (S.time % 5 === 0) save();
  }, 1000);

  /* ---------- Таймеры экрана ---------- */
  const timeouts = new Set();
  const intervals = new Set();
  const clearTimers = () => {
    timeouts.forEach(clearTimeout);
    intervals.forEach(clearInterval);
    timeouts.clear();
    intervals.clear();
  };
  const after = (fn, ms) => {
    const id = setTimeout(() => {
      timeouts.delete(id);
      fn();
    }, ms);
    timeouts.add(id);
    return id;
  };
  const every = (fn, ms) => {
    const id = setInterval(fn, ms);
    intervals.add(id);
    return id;
  };

  /* ---------- Эффекты ---------- */
  const FX = {
    burst(text, x, y, { color = '#FFC61A', size = 1 } = {}) {
      const s = document.createElement('span');
      s.className = 'onoma';
      s.textContent = text;
      s.style.left = x + 'px';
      s.style.top = y + 'px';
      s.style.setProperty('--c', color);
      s.style.setProperty('--r', rand(-14, 14) + 'deg');
      s.style.setProperty('--s', size);
      fxLayer.append(s);
      setTimeout(() => s.remove(), 900);
    },
    flash(color = '#fff') {
      const f = document.createElement('div');
      f.className = 'flash';
      f.style.background = color;
      fxLayer.append(f);
      setTimeout(() => f.remove(), 700);
    },
    shake(el) {
      if (!el) return;
      el.classList.remove('shake');
      void el.offsetWidth;
      el.classList.add('shake');
    },
    confetti(n = 180, origin) {
      if (reduced) return;
      const c = document.createElement('canvas');
      c.className = 'confetti';
      document.body.append(c);
      const dpr = Math.min(2, devicePixelRatio || 1);
      const W = innerWidth, H = innerHeight;
      c.width = W * dpr;
      c.height = H * dpr;
      const g = c.getContext('2d');
      g.scale(dpr, dpr);
      const colors = ['#E8202A', '#1F5BFF', '#FFC61A', '#1FC46A', '#8B3BFF', '#FF8A1F', '#fff'];
      const ox = origin ? origin.x : W / 2;
      const oy = origin ? origin.y : H * 0.45;
      const P = Array.from({ length: n }, () => ({
        x: ox, y: oy, vx: rand(-10, 10), vy: rand(-17, -5), s: rand(7, 14),
        r: rand(0, 6.28), vr: rand(-0.3, 0.3), c: pick(colors), star: Math.random() < 0.3,
      }));
      let frame = 0;
      const star = (s) => {
        g.beginPath();
        for (let i = 0; i < 10; i++) {
          const rr = i % 2 ? s * 0.25 : s * 0.6;
          const a = (i * Math.PI) / 5 - Math.PI / 2;
          g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
        }
        g.closePath();
        g.fill();
        g.stroke();
      };
      (function tick() {
        g.clearRect(0, 0, W, H);
        let alive = 0;
        for (const p of P) {
          p.vy += 0.38;
          p.vx *= 0.985;
          p.x += p.vx;
          p.y += p.vy;
          p.r += p.vr;
          if (p.y > H + 40) continue;
          alive++;
          g.save();
          g.translate(p.x, p.y);
          g.rotate(p.r);
          g.fillStyle = p.c;
          g.strokeStyle = '#000';
          g.lineWidth = 2;
          if (p.star) star(p.s);
          else {
            g.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
            g.strokeRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
          }
          g.restore();
        }
        if (alive && frame++ < 500) requestAnimationFrame(tick);
        else c.remove();
      })();
    },
  };

  /* ---------- Звук ---------- */
  const SPEAKER_ON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9h4l5-4v14l-5-4H3z" fill="currentColor"/><path d="M16 8c1.5 1.2 1.5 6.8 0 8M19 5c3 2.6 3 11.4 0 14" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round"/></svg>';
  const SPEAKER_OFF = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9h4l5-4v14l-5-4H3z" fill="currentColor"/><path d="M16 9l5 6M21 9l-5 6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>';
  const drawMute = () => {
    muteBtn.innerHTML = SFX.muted ? SPEAKER_OFF : SPEAKER_ON;
    muteBtn.setAttribute('aria-label', SFX.muted ? 'Включить звук' : 'Выключить звук');
  };
  muteBtn.onclick = () => {
    SFX.toggle();
    drawMute();
    SFX.click();
  };
  drawMute();
  addEventListener('pointerdown', () => SFX.unlock(), { once: true });

  /* ---------- Квесты ---------- */
  const QUESTS = [
    { id: 'space', title: 'Допрос в Щ.И.Т.', who: 'Ник Фьюри', blurb: 'Фьюри не пускает в архив кого попало. Ответь на 10 вопросов о героях, нужно минимум 8 верных.', game: GAMES.quiz },
    { id: 'mind', title: 'Загадки Риддлера', who: 'Риддлер', blurb: 'Риддлер запер камень за пятью загадками. Если думаешь дольше 25 секунд, откроется подсказка.', game: GAMES.riddles },
    { id: 'reality', title: 'Иллюзии Мистерио', who: 'Мистерио', blurb: 'Мистерио перемешал гербы героев. Найди все пары, чтобы развеять иллюзию.', game: GAMES.memory },
    { id: 'time', title: 'Шифр Доктора Стрэнджа', who: 'Доктор Стрэндж', blurb: 'Стрэндж оставил зашифрованное послание. Поверни кольцо на нужный ключ и найди кодовое слово.', game: GAMES.cipher },
    { id: 'power', title: 'Скорость Флэша', who: 'Флэш', blurb: 'Камень Силы носится по Спидфорсу. Поймай 25 молний за 30 секунд и не трогай бомбы Джокера.', game: GAMES.speed },
    { id: 'soul', title: 'Испытание Вормира', who: 'Красный Череп', blurb: 'Красный Череп охраняет Камень Души. Сначала жертва, потом песнь камней.', game: GAMES.soul },
  ];

  const BRIEF = [
    'Агент Давид, первый камень спрятан в архиве Щ.И.Т. Начни с допроса.',
    'Отлично. Риддлер уже прислал вызов. Не дай ему себя запутать.',
    'Два камня у тебя. Мистерио нервничает, так что жди иллюзий.',
    'Половина перчатки собрана. Танос это почувствовал.',
    'Флэш говорит, что ты почти так же быстр, как он. Почти.',
    'Последний камень на Вормире. Будь осторожен: там просят жертву.',
    'Все шесть камней у тебя. Танос ждёт. Пора с этим заканчивать.',
  ];

  const RANKS = [
    [0, 'Стажёр Щ.И.Т.'],
    [100, 'Новобранец Лиги'],
    [300, 'Мститель'],
    [500, 'Член Лиги Справедливости'],
    [600, 'Хранитель Бесконечности'],
    [1000, 'Легенда мультивселенной'],
  ];
  const xp = () => S.stones.length * 100 + (S.bossWon ? 400 : 0);
  const rank = () => RANKS.filter(([min]) => xp() >= min).pop()[1];

  const updateTop = () => {
    document.getElementById('rankName').textContent = rank();
    document.getElementById('xpFill').style.width = (xp() / 1000) * 100 + '%';
    document.getElementById('miniStones').innerHTML = ART.STONES.map((s) =>
      `<span class="mini${S.stones.includes(s.id) ? ' on' : ''}" style="--c:${s.color}" title="${s.name}"></span>`).join('');
  };

  /* ---------- Навигация ---------- */
  let current = null;
  const WIPES = ['Тем временем…', 'Чуть позже…', 'В другой вселенной…', 'Тем временем в штабе…', 'А в это время…'];

  function go(name, arg, instant = false) {
    clearTimers();
    SFX.click();
    const render = () => {
      current = name;
      if (['cover', 'story', 'hub', 'boss', 'gift'].includes(name)) {
        S.screen = name;
        save();
      }
      topbar.hidden = !['hub', 'quest', 'boss'].includes(name);
      updateTop();
      SCREENS[name](arg);
      window.scrollTo(0, 0);
      const h = app.querySelector('h1, h2');
      if (h) {
        h.setAttribute('tabindex', '-1');
        h.focus({ preventScroll: true });
      }
    };
    if (instant || reduced) return render();
    wipeText.textContent = pick(WIPES);
    wipe.className = 'wipe in';
    setTimeout(() => {
      render();
      wipe.className = 'wipe out';
      setTimeout(() => (wipe.className = 'wipe'), 420);
    }, 520);
  }

  /* ---------- Экраны ---------- */
  const SCREENS = {};

  SCREENS.cover = () => {
    app.innerHTML = `<section class="screen cover">
      <div class="cover-card">
        <div class="cover-top">
          <span class="cover-issue">№20</span>
          <span class="cover-brand">Мультивселенная<br>Комикс</span>
          <span class="cover-date">Юбилейный<br>выпуск</span>
        </div>
        <div class="cover-art">
          <span class="cover-20" aria-hidden="true">20</span>
          <div class="cover-gauntlet">${ART.gauntlet([])}</div>
          <span class="burst cover-burst"><span>Впервые<br>в 20 лет!</span></span>
        </div>
        <h1 class="cover-title">${HERO}</h1>
        <p class="cover-sub">Мультивселенная в опасности. Спасти её может только именинник.</p>
      </div>
      <button class="btn red big" type="button" data-start>${S.stones.length ? 'Продолжить выпуск' : 'Открыть выпуск'}</button>
    </section>`;
    app.querySelector('[data-start]').onclick = () => {
      SFX.unlock();
      if (S.stones.length || S.bossWon) go('hub');
      else go('story');
    };
  };

  SCREENS.story = () => {
    const panels = [
      `<div class="sp sp1">
        <p class="caption">Земля-2006. В этот день на свет появился герой.</p>
        <span class="sp-year" aria-hidden="true">2006</span>
      </div>`,
      `<div class="sp sp2">
        <p class="caption">Двадцать лет спустя Танос и Джокер заключили союз и похитили подарок именинника.</p>
        <div class="sp2-art">
          <div class="sp2-joker">${ART.joker()}</div>
          <div class="sp2-thanos">${ART.thanos()}</div>
        </div>
        <p class="bubble sp2-bubble joker-says">Ха-ха-ха! Подарочек теперь наш!</p>
        <p class="bubble sp2-bubble thanos-says">Не наш. Мой.</p>
      </div>`,
      `<div class="sp sp3">
        <p class="caption">Подарок раскололся на шесть Камней Бесконечности, и они разлетелись по всей мультивселенной.</p>
        <div class="sp3-gems" aria-hidden="true">${ART.STONES.map((s, i) => `<span style="--i:${i}">${ART.gem(s.id)}</span>`).join('')}</div>
      </div>`,
      `<div class="sp sp4">
        <p class="caption">Собери все камни, победи Таноса и верни свой подарок.</p>
        <p class="bubble sp4-bubble">${HERO}, ты наш единственный шанс.<small>Ник Фьюри</small></p>
      </div>`,
    ];
    app.innerHTML = `<section class="screen story">
      <h1 class="sr">Предыстория</h1>
      <div class="story-page">${panels.join('')}</div>
      <div class="story-nav"><button class="btn" type="button" data-next>Дальше</button></div>
    </section>`;
    const sp = [...app.querySelectorAll('.sp')];
    const next = app.querySelector('[data-next]');
    let step = 0;
    const reveal = () => {
      sp[step].classList.add('in');
      SFX.swoosh();
      if (step === sp.length - 1) {
        next.textContent = 'Принять миссию';
        next.classList.add('red');
      }
      sp[step].scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'nearest' });
    };
    reveal();
    next.onclick = () => {
      if (step < sp.length - 1) {
        step++;
        reveal();
      } else {
        go('hub');
      }
    };
  };

  let justGot = null;

  SCREENS.hub = () => {
    const n = S.stones.length;
    const unlocked = (i) => i === 0 || S.stones.includes(QUESTS[i - 1].id);
    const card = (q, i) => {
      const s = ART.stone(q.id);
      const done = S.stones.includes(q.id);
      const open = !done && unlocked(i);
      const state = done ? 'done' : open ? 'open' : 'locked';
      return `<button class="qcard ${state}" type="button" data-q="${i}" style="--c:${s.color}" ${open ? '' : 'disabled'}>
        <span class="qcard-head"><span class="qcard-issue">Выпуск №${i + 1}</span>${ART.gem(q.id)}</span>
        <span class="qcard-title">${open || done ? q.title : 'Засекречено'}</span>
        <span class="qcard-text">${done ? `${s.name} у тебя` : open ? s.name : 'Откроется после предыдущего выпуска'}</span>
        ${done ? '<span class="stamp">Есть!</span>' : ''}
        ${open ? '<span class="qcard-go">Начать</span>' : ''}
      </button>`;
    };
    const finalCard = S.bossWon
      ? `<button class="qcard final open" type="button" data-gift><span class="qcard-title">Твой подарок ждёт</span><span class="qcard-text">Танос повержен. Открой то, ради чего всё затевалось.</span><span class="qcard-go">Открыть</span></button>`
      : `<button class="qcard final ${n === 6 ? 'open' : 'locked'}" type="button" data-boss ${n === 6 ? '' : 'disabled'}>
          <span class="qcard-issue">Финальный выпуск</span>
          <span class="qcard-title">Битва с Таносом</span>
          <span class="qcard-text">${n === 6 ? 'Перчатка готова. Танос ждёт.' : `Нужны все шесть камней. Сейчас: ${n} из 6`}</span>
          ${n === 6 ? '<span class="qcard-go">В бой</span>' : ''}
        </button>`;

    app.innerHTML = `<section class="screen hub">
      <div class="hub-top">
        <div class="hub-gauntlet">${ART.gauntlet(S.stones, justGot)}</div>
        <div class="hub-brief">
          <h1>Карта мультивселенной</h1>
          <p class="hub-count">Камней в перчатке: <b>${n} из 6</b></p>
          <p class="bubble fury">${S.bossWon ? 'Ты сделал это, Давид. Мультивселенная в долгу перед тобой.' : BRIEF[n]}<small>Ник Фьюри</small></p>
        </div>
      </div>
      <div class="quest-grid">${QUESTS.map(card).join('')}${finalCard}</div>
    </section>`;
    justGot = null;

    app.querySelectorAll('[data-q]').forEach((b) => (b.onclick = () => go('quest', Number(b.dataset.q))));
    const bossBtn = app.querySelector('[data-boss]');
    if (bossBtn) bossBtn.onclick = () => go('boss');
    const giftBtn = app.querySelector('[data-gift]');
    if (giftBtn) giftBtn.onclick = () => go('gift');
  };

  const ctxFor = (onWin, extra = {}) => ({
    after, every, clear: clearTimers, sfx: SFX, fx: FX, config: CFG, win: onWin, ...extra,
  });

  SCREENS.quest = (i) => {
    const q = QUESTS[i];
    const s = ART.stone(q.id);
    app.innerHTML = `<section class="screen quest" style="--c:${s.color}">
      <button class="back" type="button" data-back>Назад к карте</button>
      <header class="quest-head">
        <span class="quest-gem">${ART.gem(q.id)}</span>
        <div>
          <p class="quest-issue">Выпуск №${i + 1}. ${s.name}</p>
          <h2>${q.title}</h2>
          <p class="quest-blurb">${q.blurb}</p>
        </div>
      </header>
      <div class="stage" id="stage"></div>
    </section>`;
    app.querySelector('[data-back]').onclick = () => go('hub');
    q.game(app.querySelector('#stage'), ctxFor((stats) => {
      if (!S.stones.includes(q.id)) S.stones.push(q.id);
      S.stats[q.id] = stats || true;
      save();
      updateTop();
      stoneModal(q.id);
    }));
  };

  function stoneModal(id) {
    clearTimers();
    const s = ART.stone(id);
    SFX.win();
    FX.confetti(120);
    const m = document.createElement('div');
    m.className = 'modal-back';
    m.innerHTML = `<div class="stone-modal" role="dialog" aria-modal="true" aria-labelledby="smt" style="--c:${s.color}">
      <div class="sm-rays" aria-hidden="true"></div>
      <div class="sm-gem">${ART.gem(id)}</div>
      <p class="sm-pow" aria-hidden="true">Есть!</p>
      <h2 id="smt">${s.name} твой</h2>
      <p>+100 опыта. Камней в перчатке: ${S.stones.length} из 6</p>
      <button class="btn" type="button">Вставить в перчатку</button>
    </div>`;
    document.body.append(m);
    const btn = m.querySelector('button');
    btn.focus();
    btn.onclick = () => {
      m.remove();
      justGot = id;
      go('hub');
    };
  }

  SCREENS.boss = () => {
    app.innerHTML = `<section class="screen bossfight">
      <button class="back" type="button" data-back>Назад к карте</button>
      <h2 class="boss-title">Финал. Танос</h2>
      <div class="stage" id="stage"></div>
    </section>`;
    app.querySelector('[data-back]').onclick = () => go('hub');
    S.bossTries++;
    save();
    GAMES.boss(app.querySelector('#stage'), ctxFor(() => {
      S.bossWon = true;
      save();
      go('gift');
    }, { onRetry: () => { S.bossTries++; save(); } }));
  };

  SCREENS.gift = () => {
    const minutes = Math.max(1, Math.round(S.time / 60));
    app.innerHTML = `<section class="screen gift${S.opened ? ' is-open' : ''}">
      <div class="gift-stage">
        <div class="gift-rays" aria-hidden="true"></div>
        <h1 class="gift-title">${HERO}, это тебе</h1>
        <button class="giftbox" type="button" aria-label="Стукнуть по коробке">
          <span class="gb-lid"><span class="gb-bow"></span></span>
          <span class="gb-base"></span>
          <span class="gb-tag">От ${CFG.fromGenitive || CFG.from}</span>
        </button>
        <p class="gift-hint" aria-live="polite">Коробка заперта на совесть. Стучи по ней.</p>
      </div>

      <div class="reveal" ${S.opened ? '' : 'hidden'}>
        <div class="ps-card">
          <div class="ps-top"><span class="ps-brand">PlayStation Store</span><span class="ps-flag">TR</span></div>
          <p class="ps-amount">${CFG.amount}<small>${CFG.currency}</small></p>
          <div class="ps-code-wrap">
            <span class="ps-code">${CODE}</span>
            <canvas class="scratch" ${S.opened ? 'hidden' : ''}></canvas>
          </div>
          <p class="ps-note">${S.opened ? 'Код для турецкого аккаунта PSN' : 'Сотри серебряный слой пальцем или мышкой'}</p>
        </div>
        <button class="link-btn light" type="button" data-showcode ${S.opened ? 'hidden' : ''}>Показать код без стирания</button>

        <div class="after" ${S.opened ? '' : 'hidden'}>
          <button class="btn big" type="button" data-copy>Скопировать код</button>
          <article class="letter">
            ${CFG.letter.map((p) => `<p>${p}</p>`).join('')}
            <p class="sign">Твой друг, ${CFG.from}</p>
          </article>
          <div class="howto">
            <h2>Как активировать</h2>
            <ol>
              <li>На PS5 открой PlayStation Store.</li>
              <li>Нажми «…» в правом верхнем углу и выбери «Активировать код». С компьютера то же самое есть на store.playstation.com в меню аватара.</li>
              <li>Введи код. ${CFG.amount} ${CFG.currency} упадут на кошелёк турецкого аккаунта.</li>
            </ol>
          </div>
          <p class="stats">Ты провёл в мультивселенной ${minutes} ${plural(minutes, ['минуту', 'минуты', 'минут'])} и вышел на бой с Таносом ${S.bossTries} ${plural(S.bossTries, ['раз', 'раза', 'раз'])}. Звание: ${rank()}.</p>
        </div>
      </div>
    </section>`;

    const section = app.querySelector('.gift');
    const box = app.querySelector('.giftbox');
    const hint = app.querySelector('.gift-hint');
    const reveal = app.querySelector('.reveal');
    const afterBlock = app.querySelector('.after');
    const canvas = app.querySelector('.scratch');
    const showBtn = app.querySelector('[data-showcode]');

    const copy = app.querySelector('[data-copy]');
    copy.onclick = async () => {
      try {
        await navigator.clipboard.writeText(CODE);
      } catch {
        const r = document.createRange();
        r.selectNodeContents(app.querySelector('.ps-code'));
        getSelection().removeAllRanges();
        getSelection().addRange(r);
        document.execCommand('copy');
      }
      copy.textContent = 'Код скопирован';
      SFX.good();
      setTimeout(() => (copy.textContent = 'Скопировать код'), 2500);
    };

    if (S.opened) return;

    const LINES = ['Внутри что-то звякнуло.', 'Ещё! Крышка поддаётся.', 'Камни в перчатке светятся. Бей сильнее.', 'Последний удар!'];
    const WORDS = ['ТУК!', 'БАХ!', 'КРАК!', 'БУМ!', 'ХРЯСЬ!'];
    const NEED = 5;
    let hits = 0;

    box.onclick = (e) => {
      if (hits >= NEED) return;
      hits++;
      const r = box.getBoundingClientRect();
      FX.burst(WORDS[(hits - 1) % WORDS.length], e.clientX || r.left + r.width / 2, (e.clientY || r.top) - 30, { size: 1 + hits * 0.12 });
      box.style.setProperty('--shake', hits);
      FX.shake(box);
      if (hits < NEED) {
        SFX.hit();
        hint.textContent = LINES[hits - 1];
        return;
      }
      open();
    };

    const open = () => {
      SFX.fanfare();
      FX.flash('#fff');
      section.classList.add('opening');
      hint.textContent = '';
      setTimeout(() => FX.confetti(260), 250);
      setTimeout(() => {
        reveal.hidden = false;
        section.classList.add('is-open');
        requestAnimationFrame(() => {
          initScratch();
          reveal.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
        });
      }, 1100);
    };

    const finish = () => {
      if (S.opened) return;
      S.opened = true;
      save();
      canvas.classList.add('cleared');
      setTimeout(() => (canvas.hidden = true), 500);
      showBtn.hidden = true;
      app.querySelector('.ps-note').textContent = 'Код для турецкого аккаунта PSN';
      afterBlock.hidden = false;
      SFX.win();
      FX.confetti(200);
    };
    showBtn.onclick = finish;

    function initScratch() {
      const wrap = canvas.parentElement;
      const rect = { width: wrap.clientWidth, height: wrap.clientHeight };
      const dpr = Math.min(2, devicePixelRatio || 1);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const g = canvas.getContext('2d');
      g.scale(dpr, dpr);
      const grd = g.createLinearGradient(0, 0, rect.width, rect.height);
      grd.addColorStop(0, '#d9dde3');
      grd.addColorStop(0.5, '#9aa3ae');
      grd.addColorStop(1, '#cfd4da');
      g.fillStyle = grd;
      g.fillRect(0, 0, rect.width, rect.height);
      g.fillStyle = 'rgba(0,0,0,.12)';
      for (let x = 4; x < rect.width; x += 8) for (let y = 4; y < rect.height; y += 8) {
        g.beginPath();
        g.arc(x, y, 1.4, 0, 7);
        g.fill();
      }
      g.fillStyle = '#3a3f47';
      g.font = `${Math.min(rect.height * 0.28, rect.width / 13)}px "Rubik Mono One", sans-serif`;
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillText('СОТРИ МЕНЯ', rect.width / 2, rect.height / 2);
      g.globalCompositeOperation = 'destination-out';

      let down = false;
      let moves = 0;
      let last = null;
      const point = (e) => {
        const r = canvas.getBoundingClientRect();
        return [(e.clientX - r.left) * (rect.width / r.width), (e.clientY - r.top) * (rect.height / r.height)];
      };
      const scratch = (e) => {
        const [x, y] = point(e);
        g.lineCap = 'round';
        g.lineWidth = 36;
        g.beginPath();
        g.moveTo(...(last || [x, y]));
        g.lineTo(x, y);
        g.stroke();
        last = [x, y];
        if (++moves % 8 === 0) check();
      };
      const check = () => {
        const { data } = g.getImageData(0, 0, canvas.width, canvas.height);
        let clear = 0, total = 0;
        for (let i = 3; i < data.length; i += 4 * 24) {
          total++;
          if (data[i] < 40) clear++;
        }
        if (clear / total > 0.55) finish();
      };
      canvas.addEventListener('pointerdown', (e) => {
        down = true;
        last = null;
        try { canvas.setPointerCapture(e.pointerId); } catch {}
        scratch(e);
      });
      canvas.addEventListener('pointermove', (e) => down && scratch(e));
      const up = () => {
        down = false;
        last = null;
        check();
      };
      canvas.addEventListener('pointerup', up);
      canvas.addEventListener('pointercancel', up);
    }
  };

  /* ---------- Старт ---------- */
  go(S.opened || S.bossWon ? 'gift' : 'cover', undefined, true);
})();
