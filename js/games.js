window.GAMES = (() => {
  const shuffle = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const rand = (a, b) => a + Math.random() * (b - a);
  const norm = (s) => s.toLowerCase().replace(/ё/g, 'е').replace(/[^a-zа-я0-9\s-]/g, '').replace(/\s+/g, ' ').trim();
  const fail = (el, title, text, again, onRetry) => {
    el.innerHTML = `<div class="result">
      <p class="result-big">${title}</p>
      <p>${text}</p>
      <button class="btn" type="button" data-retry>${again}</button>
    </div>`;
    el.querySelector('[data-retry]').onclick = onRetry;
  };

  /* ---------- Камень Пространства: допрос Фьюри ---------- */
  const QUIZ = [
    { q: 'Как зовут дворецкого Бэтмена?', opts: ['Альфред', 'Джарвис', 'Себастьян', 'Бенсон'], a: 'Альфред', no: 'Джарвис служил Старку. Бэтмену подаёт чай Альфред.' },
    { q: 'Из какого металла сделан щит Капитана Америка?', opts: ['Вибраниум', 'Адамантий', 'Уру', 'Криптонит'], a: 'Вибраниум', no: 'Вибраниум, тот самый металл из Ваканды.' },
    { q: 'Родная планета Супермена?', opts: ['Криптон', 'Титан', 'Асгард', 'Ксандар'], a: 'Криптон', no: 'Титан — родина Таноса. Супермен с Криптона.' },
    { q: 'Последние слова Тони Старка перед щелчком в «Финале»?', opts: ['«Я — Железный человек»', '«Мстители, общий сбор»', '«Я вернусь»', '«Я есть Грут»'], a: '«Я — Железный человек»', no: '«Я — Железный человек». Классика, агент.' },
    { q: 'Как по-настоящему зовут Флэша?', opts: ['Барри Аллен', 'Питер Паркер', 'Хэл Джордан', 'Кларк Кент'], a: 'Барри Аллен', no: 'Барри Аллен. Хэл Джордан — это Зелёный Фонарь.' },
    { q: 'Как называется молот Тора?', opts: ['Мьёльнир', 'Штормбрейкер', 'Гунгнир', 'Экскалибур'], a: 'Мьёльнир', no: 'Штормбрейкер — топор. Молот зовут Мьёльнир.' },
    { q: 'Кто из этих героев из вселенной DC?', opts: ['Аквамен', 'Сокол', 'Шан-Чи', 'Дэдпул'], a: 'Аквамен', no: 'Аквамен — DC. Остальные из Marvel.' },
    { q: 'Сколько всего Камней Бесконечности?', opts: ['Шесть', 'Пять', 'Семь', 'Девять'], a: 'Шесть', no: 'Шесть. Ты как раз их сейчас собираешь.' },
    { q: 'В каком городе живёт Бэтмен?', opts: ['Готэм', 'Метрополис', 'Централ-Сити', 'Стар-Сити'], a: 'Готэм', no: 'Метрополис — город Супермена. Бэтмен в Готэме.' },
    { q: 'Что говорит Грут?', opts: ['«Я есть Грут»', '«Грут — король»', '«Грут голоден»', '«Мы — деревья»'], a: '«Я есть Грут»', no: 'Только «Я есть Грут». Ну, почти всегда.' },
    { q: 'Главная слабость Супермена?', opts: ['Криптонит', 'Вибраниум', 'Солнечный свет', 'Вода'], a: 'Криптонит', no: 'Криптонит. Солнце его, наоборот, заряжает.' },
    { q: 'Кто приёмный брат Тора?', opts: ['Локи', 'Хеймдалль', 'Один', 'Сурт'], a: 'Локи', no: 'Локи, бог обмана. Один — их отец.' },
  ];
  const PRAISE = ['Верно. Фьюри кивает.', 'Точно в цель.', 'Так и есть. Щ.И.Т. записал.', 'Правильно. Ты в теме.', 'Бинго. Коулсон бы гордился.'];

  function quiz(el, ctx) {
    const TOTAL = 10;
    const PASS = 8;
    let qs, i, score;

    const start = () => {
      qs = shuffle(QUIZ).slice(0, TOTAL).map((q) => ({ ...q, opts: shuffle(q.opts) }));
      i = 0;
      score = 0;
      show();
    };

    const show = () => {
      const q = qs[i];
      el.innerHTML = `<div class="quiz">
        <div class="meta-row"><span>Вопрос ${i + 1} из ${TOTAL}</span><span>Верно: ${score}</span></div>
        <div class="progress"><i style="width:${(i / TOTAL) * 100}%"></i></div>
        <h3 class="quiz-q">${q.q}</h3>
        <div class="quiz-opts">${q.opts.map((o, k) => `<button class="opt" type="button" data-k="${k}">${o}</button>`).join('')}</div>
        <p class="note" aria-live="polite"></p>
      </div>`;
      el.querySelectorAll('.opt').forEach((b) => (b.onclick = () => answer(b, q)));
    };

    const answer = (b, q) => {
      const all = el.querySelectorAll('.opt');
      all.forEach((x) => (x.disabled = true));
      const note = el.querySelector('.note');
      if (q.opts[b.dataset.k] === q.a) {
        score++;
        b.classList.add('right');
        ctx.sfx.good();
        note.textContent = pick(PRAISE);
      } else {
        b.classList.add('wrong');
        all.forEach((x) => q.opts[x.dataset.k] === q.a && x.classList.add('right'));
        ctx.sfx.bad();
        note.textContent = q.no;
      }
      ctx.after(() => (++i < TOTAL ? show() : finish()), 1700);
    };

    const finish = () => {
      if (score >= PASS) return ctx.win({ score });
      fail(el, `${score} из ${TOTAL}`, `Фьюри поднимает бровь: «Для доступа нужно минимум ${PASS}. Ещё раз, агент».`, 'Пройти допрос заново', start);
    };

    start();
  }

  /* ---------- Камень Разума: загадки Риддлера ---------- */
  const RIDDLES = [
    { q: 'Чем больше из неё берёшь, тем больше она становится. Что это?', a: [/ям/], hint: 'Её копают лопатой.' },
    { q: 'Что можно сломать, даже не прикоснувшись к этому?', a: [/обещ/, /тишин/, /слов/, /сердц/, /клятв/], hint: 'Его дают, а потом сдерживают. Или нет.' },
    { q: 'У меня есть города, но нет домов. Есть леса, но нет деревьев. Есть реки, но нет воды. Что я?', a: [/карт/], hint: 'Без меня Бэтмен заблудился бы в Готэме.' },
    { q: 'Это принадлежит тебе, но другие пользуются этим гораздо чаще, чем ты.', a: [/^им/, /имен/, /давид/], hint: 'Сегодня его напишут на торте.' },
    { q: 'Что всегда идёт только вверх и никогда не спускается вниз?', a: [/возраст/, /^год/, /лет/], hint: 'Сегодня его стало на единицу больше.' },
  ];
  const TAUNTS = ['Риддлер хохочет. Неверно.', 'Мимо. Подумай ещё.', 'Холодно, как у Мистера Фриза.', 'Даже Пингвин бы догадался. Ещё попытка.', 'Нет. Но ход мысли смелый.'];
  const HINT_DELAY = 25;

  function riddles(el, ctx) {
    let i = 0;

    const show = () => {
      const r = RIDDLES[i];
      let wait = HINT_DELAY;
      el.innerHTML = `<div class="riddle">
        <div class="meta-row"><span>Загадка ${i + 1} из ${RIDDLES.length}</span></div>
        <div class="progress green"><i style="width:${(i / RIDDLES.length) * 100}%"></i></div>
        <div class="riddler">
          <div class="riddler-mark" aria-hidden="true">?</div>
          <p class="bubble">${r.q}</p>
        </div>
        <form class="answer-row" novalidate>
          <label class="sr" for="ra">Твой ответ</label>
          <input id="ra" class="field" autocomplete="off" placeholder="Твой ответ" maxlength="40">
          <button class="btn green" type="submit">Ответить</button>
        </form>
        <p class="note" aria-live="polite"></p>
        <button class="link-btn" type="button" data-hint disabled>Подсказка через ${wait} с</button>
      </div>`;
      const input = el.querySelector('#ra');
      const note = el.querySelector('.note');
      const hintBtn = el.querySelector('[data-hint]');
      input.focus({ preventScroll: true });

      const timer = ctx.every(() => {
        wait--;
        if (wait > 0) {
          hintBtn.textContent = `Подсказка через ${wait} с`;
        } else {
          clearInterval(timer);
          hintBtn.disabled = false;
          hintBtn.textContent = 'Взять подсказку';
        }
      }, 1000);

      hintBtn.onclick = () => {
        note.textContent = `Подсказка: ${r.hint}`;
        note.className = 'note hint';
        hintBtn.hidden = true;
      };

      el.querySelector('form').onsubmit = (e) => {
        e.preventDefault();
        const v = norm(input.value);
        if (!v) return;
        if (r.a.some((re) => re.test(v))) {
          ctx.sfx.good();
          clearInterval(timer);
          ctx.fx.burst('В ТОЧКУ!', innerWidth / 2, innerHeight / 2, { color: '#1FC46A' });
          i++;
          if (i >= RIDDLES.length) ctx.after(() => ctx.win(), 700);
          else ctx.after(show, 700);
        } else {
          ctx.sfx.bad();
          ctx.fx.shake(input);
          note.textContent = pick(TAUNTS);
          note.className = 'note bad';
          input.select();
        }
      };
    };

    show();
  }

  /* ---------- Камень Реальности: память Мистерио ---------- */
  function memory(el, ctx) {
    let moves = 0;
    let found = 0;
    let open = [];
    let lock = false;
    const deck = shuffle([...ART.EMBLEM_KEYS, ...ART.EMBLEM_KEYS]);

    el.innerHTML = `<div class="memory">
      <div class="meta-row"><span>Ходы: <b data-moves>0</b></span><span>Пары: <b data-found>0</b> из ${ART.EMBLEM_KEYS.length}</span></div>
      <div class="mgrid">${deck.map((k, n) => `<button class="mcard" type="button" data-k="${k}" aria-label="Карта ${n + 1}">
        <span class="mback" aria-hidden="true">?</span><span class="mface">${ART.emblem(k)}</span>
      </button>`).join('')}</div>
    </div>`;

    const movesEl = el.querySelector('[data-moves]');
    const foundEl = el.querySelector('[data-found]');

    el.querySelectorAll('.mcard').forEach((c) => {
      c.onclick = () => {
        if (lock || c.classList.contains('flip')) return;
        c.classList.add('flip');
        ctx.sfx.click();
        open.push(c);
        if (open.length < 2) return;
        moves++;
        movesEl.textContent = moves;
        const [a, b] = open;
        open = [];
        if (a.dataset.k === b.dataset.k) {
          a.classList.add('matched');
          b.classList.add('matched');
          a.disabled = b.disabled = true;
          found++;
          foundEl.textContent = found;
          ctx.sfx.good();
          if (found === ART.EMBLEM_KEYS.length) ctx.after(() => ctx.win({ moves }), 800);
        } else {
          lock = true;
          ctx.after(() => {
            a.classList.remove('flip');
            b.classList.remove('flip');
            lock = false;
          }, 850);
        }
      };
    });
  }

  /* ---------- Камень Времени: шифр Стрэнджа ---------- */
  const ALPH = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ';
  const N = ALPH.length;
  const KEY = 20;
  const shift = (s, k) => [...s].map((ch) => {
    const i = ALPH.indexOf(ch);
    return i < 0 ? ch : ALPH[(((i + k) % N) + N) % N];
  }).join('');
  const PLAIN = 'ДАВИД, ВРЕМЯ НА ТВОЕЙ СТОРОНЕ. КОДОВОЕ СЛОВО: ДОРМАММУ';
  const SECRET = 'дормамму';

  function cipher(el, ctx) {
    const enc = shift(PLAIN, KEY);
    let key = 0;
    let solvedOnce = false;
    const ring = (cls) => `<div class="ring ${cls}">${[...ALPH].map((c, i) => `<span style="--i:${i}">${c}</span>`).join('')}</div>`;

    el.innerHTML = `<div class="cipher">
      <p class="cipher-enc"><span>Перехваченное послание:</span> ${enc}</p>
      <div class="dial-wrap">
        <div class="dial">
          ${ring('outer')}${ring('inner')}
          <div class="dial-core"><span data-key>0</span><small>ключ</small></div>
        </div>
        <div class="dial-controls">
          <button class="btn round" type="button" data-dir="-1" aria-label="Повернуть кольцо назад">−</button>
          <input type="range" min="0" max="${N - 1}" value="0" aria-label="Ключ шифра" data-range>
          <button class="btn round" type="button" data-dir="1" aria-label="Повернуть кольцо вперёд">+</button>
        </div>
      </div>
      <p class="cipher-out" data-out aria-live="polite"></p>
      <p class="note hint">Стрэндж оставил подсказку: «Ключ — число свечей на твоём торте».</p>
      <form class="answer-row" novalidate>
        <label class="sr" for="cw">Кодовое слово</label>
        <input id="cw" class="field" autocomplete="off" placeholder="Кодовое слово" maxlength="30">
        <button class="btn green" type="submit">Проверить</button>
      </form>
      <p class="note" data-note aria-live="polite"></p>
    </div>`;

    const inner = el.querySelector('.ring.inner');
    const out = el.querySelector('[data-out]');
    const keyEl = el.querySelector('[data-key]');
    const range = el.querySelector('[data-range]');
    const note = el.querySelector('[data-note]');

    const set = (k) => {
      key = ((k % N) + N) % N;
      range.value = key;
      keyEl.textContent = key;
      inner.style.transform = `rotate(${(-key * 360) / N}deg)`;
      out.textContent = shift(enc, -key);
      const clear = key === KEY;
      out.classList.toggle('clear', clear);
      if (clear && !solvedOnce) {
        solvedOnce = true;
        ctx.sfx.good();
      } else {
        ctx.sfx.tick();
      }
    };

    el.querySelectorAll('[data-dir]').forEach((b) => (b.onclick = () => set(key + Number(b.dataset.dir))));
    range.oninput = () => set(Number(range.value));
    set(0);

    el.querySelector('form').onsubmit = (e) => {
      e.preventDefault();
      const input = el.querySelector('#cw');
      if (norm(input.value) === SECRET) {
        ctx.sfx.good();
        ctx.win();
      } else {
        ctx.sfx.bad();
        ctx.fx.shake(input);
        note.textContent = 'Портал не открылся. Сначала расшифруй послание целиком.';
        note.className = 'note bad';
      }
    };
  }

  /* ---------- Камень Силы: скорость Флэша ---------- */
  function speed(el, ctx) {
    const NEED = 25;
    const TIME = 30;
    let score, left, running, started;

    const frame = (inner) => {
      el.innerHTML = `<div class="speed">
        <div class="meta-row"><span>Молнии: <b data-score>0</b> из ${NEED}</span><span>Время: <b data-time>${TIME}</b> с</span></div>
        <div class="arena">${inner}</div>
      </div>`;
    };

    const intro = () => {
      frame(`<div class="arena-msg">
        <p>Жми на молнии, пока они не исчезли. Бомба Джокера отнимает 3 очка.</p>
        <button class="btn red" type="button" data-go>Старт</button>
      </div>`);
      el.querySelector('[data-go]').onclick = run;
    };

    const run = () => {
      frame('');
      score = 0;
      left = TIME;
      running = true;
      started = performance.now();
      const scoreEl = el.querySelector('[data-score]');
      const timeEl = el.querySelector('[data-time]');
      const arena = el.querySelector('.arena');

      const timer = ctx.every(() => {
        left--;
        timeEl.textContent = left;
        if (left <= 5) ctx.sfx.tick();
        if (left <= 0) {
          clearInterval(timer);
          end(false);
        }
      }, 1000);

      const spawn = () => {
        if (!running) return;
        const t = (performance.now() - started) / 1000;
        const isBomb = Math.random() < 0.18;
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'target' + (isBomb ? ' bomb' : '');
        b.innerHTML = isBomb ? ART.bomb : ART.bolt;
        b.setAttribute('aria-label', isBomb ? 'Бомба' : 'Молния');
        b.style.left = rand(4, 82) + '%';
        b.style.top = rand(6, 76) + '%';
        const hit = (e) => {
          if (!running || b.dataset.done) return;
          b.dataset.done = '1';
          const x = e.clientX || innerWidth / 2;
          const y = e.clientY || innerHeight / 2;
          if (isBomb) {
            score = Math.max(0, score - 3);
            ctx.sfx.bad();
            ctx.fx.burst('БУМ!', x, y, { color: '#E8202A' });
            ctx.fx.shake(arena);
          } else {
            score++;
            ctx.sfx.hit();
            ctx.fx.burst(pick(['ВЖУХ!', 'ЕСТЬ!', 'ХОП!', 'ЗЗЗ!']), x, y);
          }
          scoreEl.textContent = score;
          b.classList.add('hit');
          setTimeout(() => b.remove(), 200);
          if (score >= NEED) end(true);
        };
        b.addEventListener('pointerdown', (e) => { e.preventDefault(); hit(e); });
        b.addEventListener('click', (e) => { if (e.detail === 0) hit(e); });
        arena.append(b);
        ctx.after(() => {
          if (b.dataset.done) return;
          b.classList.add('gone');
          setTimeout(() => b.remove(), 200);
        }, Math.max(650, 1250 - t * 20));
        ctx.after(spawn, Math.max(260, rand(400, 640) - t * 6));
      };
      spawn();
    };

    const end = (won) => {
      if (!running) return;
      running = false;
      ctx.clear();
      if (won) {
        ctx.fx.burst('СКОРОСТЬ СВЕТА!', innerWidth / 2, innerHeight / 2, { size: 1.4 });
        ctx.after(() => ctx.win({ score }), 900);
      } else {
        fail(el, `${score} из ${NEED}`, 'Флэш бы успел. Отдышись и попробуй снова.', 'Бежать ещё раз', intro);
      }
    };

    intro();
  }

  /* ---------- Камень Души: Вормир ---------- */
  function soul(el, ctx) {
    const LEVELS = 6;
    const ORDER = ['space', 'mind', 'reality', 'time', 'power', 'soul'];
    const choices = [
      { t: 'Свою PlayStation', r: 'Красный Череп качает головой: «Нет. Она тебе очень скоро пригодится».' },
      { t: 'Сон до обеда', r: '«Это не жертва, это подарок организму». Не засчитано.' },
      { t: `Своего друга ${ctx.config.fromGenitive || ctx.config.from}`, r: `${ctx.config.from} всё видел и обиделся. Выбери что-нибудь другое.` },
      { t: 'Свою лень', ok: true, r: '«Достойная жертва», — говорит Красный Череп. Камень Души откликается.' },
    ];

    const sacrifice = () => {
      el.innerHTML = `<div class="soul">
        <p class="bubble skull-bubble">Камень Души требует жертвы. Отдай то, чем дорожишь.</p>
        <div class="choices">${shuffle(choices).map((c) => `<button class="opt" type="button">${c.t}</button>`).join('')}</div>
        <p class="note" aria-live="polite"></p>
      </div>`;
      const note = el.querySelector('.note');
      el.querySelectorAll('.choices .opt').forEach((b) => {
        const c = choices.find((x) => x.t === b.textContent);
        b.onclick = () => {
          note.textContent = c.r;
          if (c.ok) {
            ctx.sfx.good();
            b.classList.add('right');
            el.querySelectorAll('.choices .opt').forEach((x) => (x.disabled = true));
            ctx.after(simon, 2200);
          } else {
            ctx.sfx.bad();
            b.classList.add('wrong');
            b.disabled = true;
            note.className = 'note bad';
          }
        };
      });
    };

    const simon = () => {
      let seq = [];
      let pos = 0;
      let accepting = false;

      el.innerHTML = `<div class="soul">
        <p class="bubble skull-bubble">Теперь повтори песнь камней. Смотри, какие камни зажигаются, и нажми их в том же порядке.</p>
        <div class="meta-row"><span data-status>Приготовься…</span><span>Длина песни: <b data-len>0</b> из ${LEVELS}</span></div>
        <div class="pads">${ORDER.map((id, i) => `<button class="pad" type="button" data-i="${i}" style="--c:${ART.stone(id).color}" aria-label="${ART.stone(id).name}">${ART.gem(id)}</button>`).join('')}</div>
      </div>`;
      const pads = [...el.querySelectorAll('.pad')];
      const status = el.querySelector('[data-status]');
      const lenEl = el.querySelector('[data-len]');

      const light = (i) => {
        pads[i].classList.add('lit');
        ctx.sfx.note(i);
        setTimeout(() => pads[i].classList.remove('lit'), 380);
      };

      const play = () => {
        accepting = false;
        status.textContent = 'Смотри и слушай…';
        lenEl.textContent = seq.length;
        const gap = Math.max(420, 700 - seq.length * 40);
        seq.forEach((s, k) => ctx.after(() => light(s), 600 + gap * k));
        ctx.after(() => {
          accepting = true;
          pos = 0;
          status.textContent = 'Твоя очередь';
        }, 600 + gap * seq.length);
      };

      const next = () => {
        seq.push(Math.floor(Math.random() * ORDER.length));
        play();
      };

      pads.forEach((p, i) => {
        p.onclick = () => {
          if (!accepting) return;
          light(i);
          if (i !== seq[pos]) {
            accepting = false;
            ctx.sfx.bad();
            ctx.fx.shake(el.querySelector('.pads'));
            status.textContent = 'Песнь сбилась. Начинаем сначала.';
            seq = [];
            ctx.after(next, 1600);
            return;
          }
          pos++;
          if (pos === seq.length) {
            accepting = false;
            if (seq.length >= LEVELS) {
              status.textContent = 'Камень Души запел в ответ';
              ctx.after(() => ctx.win(), 900);
            } else {
              status.textContent = 'Верно!';
              ctx.after(next, 900);
            }
          }
        };
      });

      ctx.after(next, 900);
    };

    sacrifice();
  }

  /* ---------- Финал: битва с Таносом ---------- */
  const LINES = [
    'Я неотвратим.',
    'Двадцать лет? Для титана это миг.',
    'Ты дерёшься с тем, кого не можешь победить.',
    'Подарок останется у меня.',
    'Неплохо. Но этого мало.',
    'Я — сама неизбежность.',
    'Перчатку ты собрал. А сил хватит?',
  ];
  const ABILITIES = [
    { id: 'space', label: 'Портал', dmg: 6, cd: 4 },
    { id: 'mind', label: 'Разум', dmg: 7, cd: 5 },
    { id: 'reality', label: 'Иллюзия', dmg: 9, cd: 7 },
    { id: 'time', label: 'Стоп-время', dmg: 2, cd: 13, freeze: 5 },
    { id: 'power', label: 'Сила', dmg: 13, cd: 10 },
    { id: 'soul', label: 'Душа', dmg: 4, cd: 15, heal: 1 },
  ];

  function boss(el, ctx) {
    const MAX_HP = 100;
    const MAX_HEARTS = 3;
    let hp = MAX_HP;
    let hearts = MAX_HEARTS;
    let attacking = false;
    let frozenUntil = 0;
    let shieldLockUntil = 0;
    let over = false;
    let enraged = false;

    el.innerHTML = `<div class="boss">
      <div class="boss-hud">
        <div class="hp">
          <span>Танос</span>
          <div class="hp-bar" role="progressbar" aria-valuemin="0" aria-valuemax="${MAX_HP}" aria-valuenow="${MAX_HP}"><i></i></div>
        </div>
        <div class="hearts" aria-label="Жизни"></div>
      </div>
      <div class="arena boss-arena">
        <p class="bubble thanos-bubble" aria-live="polite">Наконец-то, именинник.</p>
        <button class="thanos" type="button" aria-label="Ударить Таноса">${ART.thanos()}</button>
        <div class="warn" role="alert" hidden>Танос замахивается! Жми «Щит»</div>
        <div class="freeze-veil" hidden></div>
      </div>
      <div class="boss-controls">
        <div class="abilities">${ABILITIES.map((a) => `<button class="ab" type="button" data-id="${a.id}" style="--c:${ART.stone(a.id).color}">
          ${ART.gem(a.id)}<span>${a.label}</span><i class="cd"></i>
        </button>`).join('')}</div>
        <button class="btn blue shield" type="button">Щит</button>
      </div>
      <p class="boss-tip">Бей Таноса, используй силы камней. Когда он замахивается, успей нажать «Щит».</p>
    </div>`;

    const hpBar = el.querySelector('.hp-bar');
    const hpFill = hpBar.querySelector('i');
    const heartsEl = el.querySelector('.hearts');
    const bubble = el.querySelector('.thanos-bubble');
    const thanosBtn = el.querySelector('.thanos');
    const warn = el.querySelector('.warn');
    const veil = el.querySelector('.freeze-veil');
    const shield = el.querySelector('.shield');
    const arena = el.querySelector('.boss-arena');

    const drawHearts = () => {
      heartsEl.innerHTML = Array.from({ length: MAX_HEARTS }, (_, i) => `<span class="heart${i < hearts ? '' : ' lost'}"></span>`).join('');
      heartsEl.setAttribute('aria-label', `Жизни: ${hearts} из ${MAX_HEARTS}`);
    };
    const say = (t) => {
      bubble.textContent = t;
      bubble.classList.remove('pop');
      void bubble.offsetWidth;
      bubble.classList.add('pop');
    };
    const damage = (n, x, y, word) => {
      if (over) return;
      hp = Math.max(0, hp - n);
      hpFill.style.width = hp + '%';
      hpBar.setAttribute('aria-valuenow', hp);
      thanosBtn.classList.remove('hurt');
      void thanosBtn.offsetWidth;
      thanosBtn.classList.add('hurt');
      if (word) ctx.fx.burst(word, x, y, { size: n > 5 ? 1.3 : 0.9 });
      if (!enraged && hp <= 50) {
        enraged = true;
        thanosBtn.classList.add('enraged');
        say('Хватит игр!');
      }
      if (hp <= 0) victory();
    };
    const center = () => {
      const r = thanosBtn.getBoundingClientRect();
      return [r.left + r.width / 2 + rand(-40, 40), r.top + r.height / 2 + rand(-40, 40)];
    };

    thanosBtn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      if (over) return;
      ctx.sfx.hit();
      damage(1, e.clientX, e.clientY, Math.random() < 0.35 ? pick(['БАМ!', 'ХРЯСЬ!', 'БУМ!', 'ПАФ!', 'ТЫЩ!']) : null);
      if (Math.random() < 0.05) say(pick(LINES));
    });
    thanosBtn.addEventListener('click', (e) => {
      if (e.detail === 0 && !over) {
        ctx.sfx.hit();
        damage(1, ...center(), 'БАМ!');
      }
    });

    el.querySelectorAll('.ab').forEach((b) => {
      const a = ABILITIES.find((x) => x.id === b.dataset.id);
      b.onclick = () => {
        if (over || b.disabled) return;
        b.disabled = true;
        b.style.setProperty('--cd', a.cd + 's');
        b.classList.add('cooling');
        ctx.after(() => {
          b.disabled = false;
          b.classList.remove('cooling');
        }, a.cd * 1000);
        ctx.sfx.ability(a.id);
        if (a.freeze) {
          frozenUntil = Date.now() + a.freeze * 1000;
          veil.hidden = false;
          ctx.after(() => (veil.hidden = true), a.freeze * 1000);
          if (attacking) {
            attacking = false;
            warn.hidden = true;
            thanosBtn.classList.remove('charging');
          }
          say('Что… время остановилось?');
        }
        if (a.heal && hearts < MAX_HEARTS) {
          hearts++;
          drawHearts();
        }
        damage(a.dmg, ...center(), a.label.toUpperCase() + '!');
      };
    });

    shield.onclick = () => {
      if (over) return;
      const now = Date.now();
      if (attacking) {
        attacking = false;
        warn.hidden = true;
        thanosBtn.classList.remove('charging');
        ctx.sfx.shield();
        const r = shield.getBoundingClientRect();
        ctx.fx.burst('БЛОК!', r.left + r.width / 2, r.top - 20, { color: '#4FA3FF' });
        damage(3, ...center(), null);
        schedule();
      } else if (now > shieldLockUntil) {
        shieldLockUntil = now + 1100;
        shield.disabled = true;
        shield.textContent = 'Рано';
        ctx.after(() => {
          shield.disabled = false;
          shield.textContent = 'Щит';
        }, 1100);
      }
    };

    const schedule = () => {
      if (over) return;
      ctx.after(attack, enraged ? rand(2300, 3300) : rand(3500, 5000));
    };

    const attack = () => {
      if (over) return;
      if (Date.now() < frozenUntil) {
        ctx.after(attack, frozenUntil - Date.now() + 400);
        return;
      }
      attacking = true;
      warn.hidden = false;
      thanosBtn.classList.add('charging');
      ctx.sfx.charge();
      ctx.after(() => {
        if (!attacking || over) return;
        attacking = false;
        warn.hidden = true;
        thanosBtn.classList.remove('charging');
        hearts--;
        drawHearts();
        ctx.sfx.boom();
        ctx.fx.flash('#E8202A');
        ctx.fx.shake(arena);
        say(pick(LINES));
        if (hearts <= 0) defeat();
        else schedule();
      }, enraged ? 1050 : 1350);
    };

    const victory = () => {
      over = true;
      ctx.clear();
      warn.hidden = true;
      veil.hidden = true;
      thanosBtn.classList.remove('charging', 'hurt');
      thanosBtn.disabled = true;
      say('Я… неотвратим…');
      ctx.after(() => {
        ctx.sfx.snap();
        ctx.fx.flash('#fff');
        arena.insertAdjacentHTML('beforeend', '<p class="snap-line">А я — Давид.</p>');
        thanosBtn.classList.add('dust');
      }, 1600);
      ctx.after(() => ctx.win(), 4600);
    };

    const defeat = () => {
      over = true;
      ctx.clear();
      fail(el, 'Щёлк.', 'Танос щёлкнул пальцами. Но герои не сдаются, а камни всё ещё у тебя.', 'Вернуться в бой', () => {
        if (ctx.onRetry) ctx.onRetry();
        boss(el, ctx);
      });
    };

    drawHearts();
    ctx.after(() => say(pick(LINES)), 1800);
    schedule();
  }

  return { quiz, riddles, memory, cipher, speed, soul, boss };
})();
