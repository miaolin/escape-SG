(() => {
  const { meta, routes } = window.PROMO;
  const $ = (s) => document.querySelector(s);
  const fmt = (n) => n.toLocaleString('en-US');
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const CITY = {
    'Singapore': ['新加坡', 'SIN'], 'Brunei': ['文莱', 'BWN'], 'Denpasar': ['巴厘岛', 'DPS'],
    'Jakarta': ['雅加达', 'CGK'], 'Kuala Lumpur': ['吉隆坡', 'KUL'], 'Surabaya': ['泗水', 'SUB'],
    'Bangkok': ['曼谷', 'BKK'], 'Da Nang': ['岘港', 'DAD'], 'Hanoi': ['河内', 'HAN'],
    'Ho Chi Minh City': ['胡志明市', 'SGN'], 'Manila': ['马尼拉', 'MNL'], 'Phnom Penh': ['金边', 'KTI'],
    'Phuket': ['普吉岛', 'HKT'], 'Siem Reap': ['暹粒', 'SAI'], 'Hangzhou': ['杭州', 'HGH'],
    'Ahmedabad': ['艾哈迈达巴德', 'AMD'], 'Colombo': ['科伦坡', 'CMB'], 'Dhaka': ['达卡', 'DAC'],
    'Darwin': ['达尔文', 'DRW'], 'Adelaide': ['阿德莱德', 'ADL'], 'Brisbane': ['布里斯班', 'BNE'],
    'Cairns': ['凯恩斯', 'CNS'], 'Melbourne': ['墨尔本', 'MEL'], 'Sydney': ['悉尼', 'SYD'],
    'Istanbul': ['伊斯坦布尔', 'IST'], 'Amsterdam': ['阿姆斯特丹', 'AMS'], 'Brussels': ['布鲁塞尔', 'BRU'],
    'Copenhagen': ['哥本哈根', 'CPH'], 'Frankfurt': ['法兰克福', 'FRA'], 'London Gatwick': ['伦敦盖特威克', 'LGW'],
    'London (LHR)': ['伦敦希思罗', 'LHR'], 'Milan': ['米兰', 'MXP'], 'Munich': ['慕尼黑', 'MUC'],
    'Paris': ['巴黎', 'CDG'], 'Rome': ['罗马', 'FCO'], 'Zurich': ['苏黎世', 'ZRH'],
    'New York': ['纽约', 'JFK'], 'Los Angeles': ['洛杉矶', 'LAX'], 'San Francisco': ['旧金山', 'SFO'],
    'Seattle': ['西雅图', 'SEA'],
  };
  const REGION = {
    'South East Asia':    { zh: '东南亚',     id: 'sea',  icon: '🌴', c: '#0f766e', c2: '#14b8a6', soft: '#ccfbf1' },
    'North Asia':         { zh: '东北亚',     id: 'na',   icon: '🏯', c: '#1d4ed8', c2: '#3b82f6', soft: '#dbeafe' },
    'West Asia & Africa': { zh: '西亚 & 非洲', id: 'waa',  icon: '🕌', c: '#c2410c', c2: '#f59e0b', soft: '#ffedd5' },
    'Southwest Pacific':  { zh: '西南太平洋', id: 'swp',  icon: '🦘', c: '#15803d', c2: '#22c55e', soft: '#dcfce7' },
    'Europe':             { zh: '欧洲',       id: 'eu',   icon: '🏰', c: '#6d28d9', c2: '#9333ea', soft: '#ede9fe' },
    'USA':                { zh: '美国',       id: 'usa',  icon: '🗽', c: '#b91c1c', c2: '#ef4444', soft: '#fee2e2' },
  };
  const CABINS = [['Economy', '经济舱'], ['Premium Economy', '豪华经济舱'], ['Business', '商务舱']];

  const city = (name) => {
    const [zh, code] = CITY[name] || [name, ''];
    return `${esc(zh)}<span class="iata">${esc(code)}</span>`;
  };

  // "11月4日, 7–9日, 21–23日"
  function blackout(days) {
    if (!days.length) return '—';
    const parts = [];
    for (let i = 0; i < days.length; i++) {
      let j = i;
      while (j + 1 < days.length && days[j + 1] === days[j] + 1) j++;
      parts.push(`<span class="seg">${j > i ? `${days[i]}–${days[j]}日` : `${days[i]}日`}</span>`);
      i = j;
    }
    return parts.join(', ').replace('<span class="seg">', '<span class="seg">11月');
  }

  const range = (list) => {
    const lo = Math.min(...list), hi = Math.max(...list);
    return lo === hi ? fmt(lo) : `${fmt(lo)} — ${fmt(hi)}`;
  };

  // Group per region → one row per origin/destination pair, cabins side by side (source order kept).
  const regions = new Map();
  routes.forEach((r) => {
    if (!regions.has(r.region)) regions.set(r.region, { name: r.region, rows: new Map(), cabins: new Set() });
    const g = regions.get(r.region);
    const key = `${r.origin}|${r.dest}`;
    if (!g.rows.has(key)) g.rows.set(key, { origin: r.origin, dest: r.dest, cab: {} });
    g.rows.get(key).cab[r.cabin] = r;
    g.cabins.add(r.cabin);
  });

  function cabinRanges(g) {
    return CABINS.filter(([k]) => g.cabins.has(k)).map(([k, zh]) => {
      const miles = [...g.rows.values()].map((row) => row.cab[k]?.miles).filter(Boolean);
      return `${zh} ${range(miles)} 里程`;
    });
  }

  // ---------- overview ----------
  const groups = [...regions.values()];
  $('#routeTotal').textContent = groups.reduce((n, g) => n + g.rows.size, 0);
  $('#regionTotal').textContent = groups.length;
  const left = Math.ceil((new Date(meta.bookBy + 'T23:59:59') - new Date()) / 864e5);
  $('#countdown').textContent = left > 1 ? `还剩 ${left} 天` : left === 1 ? '今天截止' : '已截止';
  $('#srcLink').href = meta.source;
  $('#retrieved').textContent = meta.retrieved.replace(/(\d+)-0?(\d+)-0?(\d+)/, '$1年$2月$3日');

  $('#regionGrid').innerHTML = groups.map((g) => {
    const R = REGION[g.name];
    return `<a class="rcard" href="#${R.id}" style="--c:${R.c};--soft:${R.soft}">
      <h2>${R.zh}</h2>
      <div class="en">${esc(g.name)}</div>
      <span class="pill">${g.rows.size} 条航线</span>
      <p class="ranges">${cabinRanges(g).join(' · ')}</p>
    </a>`;
  }).join('');

  // ---------- region tables ----------
  $('#tables').innerHTML = groups.map((g) => {
    const R = REGION[g.name];
    const cabins = CABINS.filter(([k]) => g.cabins.has(k));
    const head = `
      <tr class="group"><th class="route-h" rowspan="2">航线</th>${cabins.map(([, zh]) => `<th colspan="3">${zh}</th>`).join('')}</tr>
      <tr class="sub">${cabins.map(() => '<th class="first">里程</th><th>航班号</th><th>屏蔽期</th>').join('')}</tr>`;
    const body = [...g.rows.values()].map((row) => {
      const cells = cabins.map(([k]) => {
        const r = row.cab[k];
        if (!r) return '<td class="first na">—</td><td class="na">—</td><td class="bo na">—</td>';
        return `<td class="first miles">${fmt(r.miles)}</td>
          <td class="fl">${r.flights.map((f) => `<span class="fno">${esc(f)}</span>`).join('')}</td>
          <td class="bo">${blackout(r.blackout)}</td>`;
      }).join('');
      return `<tr><td class="route">${city(row.origin)}<span class="arr">→</span>${city(row.dest)}</td>${cells}</tr>`;
    }).join('');

    return `<section class="panel" id="${R.id}" style="--c:${R.c};--c2:${R.c2};--soft:${R.soft}">
      <div class="rhead">
        <div><h2>${R.icon} ${R.zh}</h2><div class="en">${esc(g.name)}</div></div>
        <div class="right">
          <div class="count">${g.rows.size}<small>条航线</small></div>
          <div class="rng">${cabinRanges(g).join(' · ')}</div>
        </div>
      </div>
      <div class="infobar">
        <span>🇸🇬 KrisFlyer Spontaneous Escapes</span><span class="dot">·</span>
        <span>预订截止 2026年10月31日</span><span class="dot">·</span>
        <span>出行 2026年11月1日–11月30日</span><span class="dot">·</span>
        <span>Saver 奖励票 30% off</span>
        <span class="end">里程为单人单程 · 已含折扣 · 不含税费</span>
      </div>
      <div class="tscroll"><table><thead>${head}</thead><tbody>${body}</tbody></table></div>
      <div class="tfoot">
        <span><b>屏蔽期</b> = 不适用优惠票的日期</span><span class="dot">·</span>
        <span><b>—</b> = 无屏蔽期或无该舱位优惠</span>
        <a class="back" href="#overview">↑ 返回总览</a>
      </div>
    </section>`;
  }).join('');
})();
