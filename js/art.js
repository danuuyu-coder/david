window.ART = (() => {
  let uid = 0;

  const STONES = [
    { id: 'space',   name: 'Камень Пространства', color: '#2F7BFF', light: '#A9CBFF' },
    { id: 'mind',    name: 'Камень Разума',       color: '#FFD21F', light: '#FFF3A6' },
    { id: 'reality', name: 'Камень Реальности',   color: '#E8202A', light: '#FF9A9F' },
    { id: 'time',    name: 'Камень Времени',      color: '#1FC46A', light: '#A8F5C8' },
    { id: 'power',   name: 'Камень Силы',         color: '#8B3BFF', light: '#D3B3FF' },
    { id: 'soul',    name: 'Камень Души',         color: '#FF8A1F', light: '#FFD1A3' },
  ];
  const stone = (id) => STONES.find((s) => s.id === id);

  function gem(id) {
    const s = stone(id);
    return `<svg class="gem" viewBox="0 0 40 48" aria-hidden="true">
      <polygon points="20,2 37,15 31,45 9,45 3,15" fill="${s.color}" stroke="#000" stroke-width="3" stroke-linejoin="round"/>
      <polygon points="20,2 37,15 3,15" fill="${s.light}" opacity=".6"/>
      <polygon points="20,15 27,15 20,45 13,15" fill="#fff" opacity=".22"/>
      <polygon points="10,9 16,5 14,12" fill="#fff" opacity=".9"/>
    </svg>`;
  }

  const SLOTS = {
    soul: [26, 160, 8],
    reality: [57, 108, 8],
    space: [89, 101, 8],
    power: [121, 106, 8],
    time: [148, 114, 7],
    mind: [100, 160, 17],
  };

  function gauntlet(owned = [], fresh = null) {
    const g = 'gold' + ++uid;
    const slot = (id) => {
      const [x, y, r] = SLOTS[id];
      const s = stone(id);
      const has = owned.includes(id);
      return `<g class="slot${has ? ' on' : ''}${fresh === id ? ' fresh' : ''}">
        <circle cx="${x}" cy="${y}" r="${r + 3}" fill="#4a3000" stroke="#000" stroke-width="3"/>
        ${has ? `<circle class="halo" cx="${x}" cy="${y}" r="${r + 9}" fill="${s.color}" opacity=".45"/>
        <ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 1.12}" fill="${s.color}" stroke="#000" stroke-width="2"/>
        <ellipse cx="${x - r * 0.35}" cy="${y - r * 0.4}" rx="${r * 0.32}" ry="${r * 0.22}" fill="#fff" opacity=".9"/>` : ''}
      </g>`;
    };
    return `<svg class="gauntlet" viewBox="0 0 190 260" aria-hidden="true">
      <defs>
        <linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#FFE878"/><stop offset=".55" stop-color="#F5B800"/><stop offset="1" stop-color="#B57600"/>
        </linearGradient>
      </defs>
      <g stroke="#000" stroke-width="4" stroke-linejoin="round" fill="url(#${g})">
        <rect x="8" y="126" width="34" height="78" rx="16" transform="rotate(-28 25 165)"/>
        <rect x="42" y="36" width="30" height="96" rx="14"/>
        <rect x="74" y="20" width="30" height="104" rx="14"/>
        <rect x="106" y="30" width="30" height="98" rx="14"/>
        <rect x="136" y="54" width="25" height="78" rx="12"/>
        <rect x="38" y="98" width="124" height="112" rx="28"/>
        <rect x="46" y="196" width="108" height="58" rx="10"/>
      </g>
      <g stroke="#8a5a00" stroke-width="3" stroke-linecap="round" fill="none">
        <path d="M49 62h16M81 48h16M113 58h16M142 78h13M81 76h16M49 86h16M113 84h16"/>
        <path d="M56 214h88M56 236h88"/>
      </g>
      ${['soul', 'reality', 'space', 'power', 'time', 'mind'].map(slot).join('')}
    </svg>`;
  }

  function thanos() {
    const g = 'tg' + ++uid;
    return `<svg class="thanos-svg" viewBox="0 0 240 280" aria-hidden="true">
      <defs>
        <linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#FFE878"/><stop offset=".55" stop-color="#F5B800"/><stop offset="1" stop-color="#9c6400"/>
        </linearGradient>
      </defs>
      <path d="M6 280 C16 222 68 204 120 204 C172 204 224 222 234 280Z" fill="#2B4FA8" stroke="#000" stroke-width="5"/>
      <path d="M44 280 C54 244 84 230 120 230 C156 230 186 244 196 280Z" fill="url(#${g})" stroke="#000" stroke-width="4"/>
      <path d="M60 92 C60 40 180 40 180 92 L182 150 C182 200 150 224 120 224 C90 224 58 200 58 150Z" fill="#8a5bb8" stroke="#000" stroke-width="5"/>
      <path d="M96 184 L98 214 M108 188 L109 220 M120 189 L120 223 M132 188 L131 220 M144 184 L142 214" stroke="#3d1f5e" stroke-width="4" stroke-linecap="round"/>
      <path d="M46 152 C38 60 68 18 120 18 C172 18 202 60 194 152 L178 152 C180 92 166 70 120 68 C74 70 60 92 62 152Z" fill="url(#${g})" stroke="#000" stroke-width="5" stroke-linejoin="round"/>
      <path d="M120 20 L120 66 M88 28 L96 70 M152 28 L144 70" stroke="#9c6400" stroke-width="3"/>
      <path class="brow" d="M74 110 L113 124 L110 133 L72 121Z" fill="#000"/>
      <path class="brow" d="M166 110 L127 124 L130 133 L168 121Z" fill="#000"/>
      <ellipse class="eye" cx="95" cy="138" rx="10" ry="5" fill="#9fd8ff" stroke="#000" stroke-width="3"/>
      <ellipse class="eye" cx="145" cy="138" rx="10" ry="5" fill="#9fd8ff" stroke="#000" stroke-width="3"/>
      <path d="M120 142 L113 162 L125 164" stroke="#3d1f5e" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M98 178 C112 172 128 172 142 180" stroke="#000" stroke-width="5" fill="none" stroke-linecap="round"/>
    </svg>`;
  }

  function joker() {
    return `<svg class="joker-svg" viewBox="0 0 240 280" aria-hidden="true">
      <path d="M8 280 C18 224 66 206 120 206 C174 206 222 224 232 280Z" fill="#6A2CA8" stroke="#000" stroke-width="5"/>
      <path d="M86 280 L98 214 L142 214 L154 280Z" fill="#2DB34A" stroke="#000" stroke-width="4" stroke-linejoin="round"/>
      <path d="M106 214 L120 280 L134 214Z" fill="#FF8A1F" stroke="#000" stroke-width="3" stroke-linejoin="round"/>
      <path d="M60 280 L76 220 L104 214 L96 280Z M180 280 L164 220 L136 214 L144 280Z" fill="#4B1C80" stroke="#000" stroke-width="4" stroke-linejoin="round"/>
      <path d="M104 196 L104 214 L136 214 L136 196Z" fill="#EDEBE3" stroke="#000" stroke-width="4"/>
      <path d="M76 104 C76 56 164 56 164 104 L162 156 C158 198 140 214 120 214 C100 214 82 198 78 156Z" fill="#F4F2EA" stroke="#000" stroke-width="5"/>
      <path d="M64 124 C46 80 66 30 120 24 C174 30 194 80 176 124 L168 98 L164 66 L148 84 L140 50 L124 76 L112 44 L100 78 L86 54 L80 92 L72 80Z" fill="#2DB34A" stroke="#000" stroke-width="5" stroke-linejoin="round"/>
      <path d="M92 74 L98 92 M120 60 L118 84 M146 70 L140 90" stroke="#1a7a30" stroke-width="3" stroke-linecap="round"/>
      <ellipse cx="99" cy="124" rx="15" ry="10" fill="#3b2a55" opacity=".85"/>
      <ellipse cx="141" cy="124" rx="15" ry="10" fill="#3b2a55" opacity=".85"/>
      <ellipse cx="99" cy="125" rx="7" ry="5" fill="#fff" stroke="#000" stroke-width="2"/>
      <ellipse cx="141" cy="125" rx="7" ry="5" fill="#fff" stroke="#000" stroke-width="2"/>
      <circle cx="101" cy="125" r="2.6" fill="#1FC46A" stroke="#000" stroke-width="1"/>
      <circle cx="143" cy="125" r="2.6" fill="#1FC46A" stroke="#000" stroke-width="1"/>
      <path d="M82 108 C90 98 104 98 114 106 M126 106 C136 98 150 98 158 108" stroke="#000" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M120 132 L116 150 L124 152" stroke="#8a8478" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M80 160 C96 196 144 196 160 160 C146 174 94 174 80 160Z" fill="#D7192A" stroke="#000" stroke-width="4" stroke-linejoin="round"/>
      <path d="M90 166 C104 182 136 182 150 166 C136 174 104 174 90 166Z" fill="#fff" stroke="#000" stroke-width="2"/>
      <path d="M102 172 L102 178 M112 174 L112 181 M122 175 L122 182 M132 174 L132 181 M142 171 L142 177" stroke="#000" stroke-width="1.5"/>
      <path d="M76 152 C72 158 74 166 80 170 M164 152 C168 158 166 166 160 170" stroke="#000" stroke-width="3" fill="none" stroke-linecap="round"/>
    </svg>`;
  }

  const bolt = `<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="29" fill="#E8202A" stroke="#000" stroke-width="4"/><polygon points="37,6 17,36 30,36 25,58 47,26 34,26 41,6" fill="#FFD21F" stroke="#000" stroke-width="3" stroke-linejoin="round"/></svg>`;

  const bomb = `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M44 14 C48 6 54 8 58 4" stroke="#000" stroke-width="3" fill="none"/><circle cx="58" cy="4" r="3" fill="#FFC61A"/><rect x="36" y="12" width="12" height="10" rx="2" fill="#333" stroke="#000" stroke-width="3" transform="rotate(35 42 17)"/><circle cx="30" cy="38" r="23" fill="#6A2CA8" stroke="#000" stroke-width="4"/><text x="30" y="45" text-anchor="middle" font-family="Rubik Mono One, sans-serif" font-size="15" fill="#3BE36B">ХА</text></svg>`;

  const EMBLEMS = {
    shield: `<circle cx="32" cy="32" r="28" fill="#E8202A" stroke="#000" stroke-width="3"/><circle cx="32" cy="32" r="21" fill="#fff"/><circle cx="32" cy="32" r="15" fill="#E8202A"/><circle cx="32" cy="32" r="10" fill="#1F5BFF"/><polygon points="32,23.5 34.2,29.4 40.5,29.5 35.5,33.3 37.3,39.4 32,35.8 26.7,39.4 28.5,33.3 23.5,29.5 29.8,29.4" fill="#fff"/>`,
    bolt: `<circle cx="32" cy="32" r="28" fill="#E8202A" stroke="#000" stroke-width="3"/><circle cx="32" cy="32" r="19" fill="#fff" stroke="#000" stroke-width="2"/><polygon points="36,12 22,35 31,35 27,52 43,28 34,28 39,12" fill="#FFD21F" stroke="#000" stroke-width="2.5" stroke-linejoin="round"/>`,
    bat: `<ellipse cx="32" cy="32" rx="29" ry="20" fill="#FFD21F" stroke="#000" stroke-width="3"/><path d="M6 30 C13 30 17 25 17 20 C21 23 26 23 28 19 L29.5 14 L31 18 L33 18 L34.5 14 L36 19 C38 23 43 23 47 20 C47 25 51 30 58 30 C52 33 49 37 48 43 C45 40 40 40 37 45 L32 50 L27 45 C24 40 19 40 16 43 C15 37 12 33 6 30Z" fill="#000"/>`,
    spider: `<circle cx="32" cy="32" r="28" fill="#E8202A" stroke="#000" stroke-width="3"/><g stroke="#000" stroke-width="2.5" fill="none" stroke-linecap="round"><path d="M28 28 L16 18 L12 8M36 28 L48 18 L52 8M28 32 L14 30 L8 36M36 32 L50 30 L56 36M28 36 L16 42 L12 52M36 36 L48 42 L52 52"/></g><circle cx="32" cy="23" r="4.5" fill="#000"/><ellipse cx="32" cy="35" rx="5.5" ry="10" fill="#000"/>`,
    hammer: `<circle cx="32" cy="32" r="28" fill="#4FA3FF" stroke="#000" stroke-width="3"/><rect x="28.5" y="30" width="7" height="26" rx="2" fill="#7a4a1d" stroke="#000" stroke-width="2.5"/><rect x="13" y="12" width="38" height="20" rx="3" fill="#C9CED6" stroke="#000" stroke-width="3"/><path d="M18 18h28M18 26h28" stroke="#8b919b" stroke-width="2"/>`,
    reactor: `<circle cx="32" cy="32" r="28" fill="#1b2340" stroke="#000" stroke-width="3"/><circle cx="32" cy="32" r="20" fill="#7FE8FF" stroke="#000" stroke-width="2.5"/><circle cx="32" cy="32" r="13" fill="#fff"/><polygon points="32,20 43,40 21,40" fill="none" stroke="#1F5BFF" stroke-width="3.5" stroke-linejoin="round"/>`,
    lantern: `<circle cx="32" cy="32" r="28" fill="#1FC46A" stroke="#000" stroke-width="3"/><rect x="12" y="14" width="40" height="7" fill="#000"/><rect x="12" y="43" width="40" height="7" fill="#000"/><circle cx="32" cy="32" r="13" fill="none" stroke="#000" stroke-width="7"/>`,
    wonder: `<circle cx="32" cy="32" r="28" fill="#E8202A" stroke="#000" stroke-width="3"/><path d="M9 22 L19 44 L26 30 L32 41 L38 30 L45 44 L55 22" stroke="#000" stroke-width="10" fill="none" stroke-linejoin="round"/><path d="M9 22 L19 44 L26 30 L32 41 L38 30 L45 44 L55 22" stroke="#FFC61A" stroke-width="5" fill="none" stroke-linejoin="round"/>`,
  };
  const emblem = (k) => `<svg viewBox="0 0 64 64" aria-hidden="true">${EMBLEMS[k]}</svg>`;

  return { STONES, stone, gem, gauntlet, thanos, joker, bolt, bomb, emblem, EMBLEM_KEYS: Object.keys(EMBLEMS) };
})();
