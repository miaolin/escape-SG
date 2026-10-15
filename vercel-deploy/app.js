(() => {
  const { meta, routes } = window.PROMO;
  const $ = (s) => document.querySelector(s);
  const fmt = (n) => n.toLocaleString('en-US');
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // [中文, IATA, English display name (defaults to the source name)]
  const CITY = {
    'Singapore': ['新加坡', 'SIN'], 'Brunei': ['文莱', 'BWN'], 'Denpasar': ['巴厘岛', 'DPS', 'Bali (Denpasar)'],
    'Jakarta': ['雅加达', 'CGK'], 'Kuala Lumpur': ['吉隆坡', 'KUL'], 'Surabaya': ['泗水', 'SUB'],
    'Bangkok': ['曼谷', 'BKK'], 'Da Nang': ['岘港', 'DAD'], 'Hanoi': ['河内', 'HAN'],
    'Ho Chi Minh City': ['胡志明市', 'SGN'], 'Manila': ['马尼拉', 'MNL'], 'Phnom Penh': ['金边', 'KTI'],
    'Phuket': ['普吉岛', 'HKT'], 'Siem Reap': ['暹粒', 'SAI'], 'Hangzhou': ['杭州', 'HGH'],
    'Ahmedabad': ['艾哈迈达巴德', 'AMD'], 'Colombo': ['科伦坡', 'CMB'], 'Dhaka': ['达卡', 'DAC'],
    'Darwin': ['达尔文', 'DRW'], 'Adelaide': ['阿德莱德', 'ADL'], 'Brisbane': ['布里斯班', 'BNE'],
    'Cairns': ['凯恩斯', 'CNS'], 'Melbourne': ['墨尔本', 'MEL'], 'Sydney': ['悉尼', 'SYD'],
    'Istanbul': ['伊斯坦布尔', 'IST'], 'Amsterdam': ['阿姆斯特丹', 'AMS'], 'Brussels': ['布鲁塞尔', 'BRU'],
    'Copenhagen': ['哥本哈根', 'CPH'], 'Frankfurt': ['法兰克福', 'FRA'], 'London Gatwick': ['伦敦盖特威克', 'LGW'],
    'London (LHR)': ['伦敦希思罗', 'LHR', 'London Heathrow'], 'Milan': ['米兰', 'MXP'], 'Munich': ['慕尼黑', 'MUC'],
    'Paris': ['巴黎', 'CDG'], 'Rome': ['罗马', 'FCO'], 'Zurich': ['苏黎世', 'ZRH'],
    'New York': ['纽约', 'JFK'], 'Los Angeles': ['洛杉矶', 'LAX'], 'San Francisco': ['旧金山', 'SFO'],
    'Seattle': ['西雅图', 'SEA'],
  };
  const REGION = {
    'South East Asia':    { zh: '东南亚',     id: 'sea', icon: '🌴', c: '#0f766e', c2: '#14b8a6', soft: '#ccfbf1' },
    'North Asia':         { zh: '东北亚',     id: 'na',  icon: '🏯', c: '#1d4ed8', c2: '#3b82f6', soft: '#dbeafe' },
    'West Asia & Africa': { zh: '西亚 & 非洲', id: 'waa', icon: '🕌', c: '#c2410c', c2: '#f59e0b', soft: '#ffedd5' },
    'Southwest Pacific':  { zh: '西南太平洋', id: 'swp', icon: '🦘', c: '#15803d', c2: '#22c55e', soft: '#dcfce7' },
    'Europe':             { zh: '欧洲',       id: 'eu',  icon: '🏰', c: '#6d28d9', c2: '#9333ea', soft: '#ede9fe' },
    'USA':                { zh: '美国',       id: 'usa', icon: '🗽', c: '#b91c1c', c2: '#ef4444', soft: '#fee2e2' },
  };
  const CABINS = ['Economy', 'Premium Economy', 'Business'];

  const I18N = {
    zh: {
      htmlLang: 'zh-CN',
      h1: '新加坡航空 KrisFlyer Spontaneous Escapes',
      travelLbl: '出行期', travelVal: '2026年11月1日 — 11月30日',
      bookLbl: '预订截止', bookVal: '2026年10月31日',
      discount: 'Saver 奖励票七折',
      daysLeft: (n) => `还剩 ${n} 天`, lastDay: '今天截止', closed: '已截止',
      routes: (n) => `${n} 条航线`, routesUnit: '条航线', regions: (n) => `${n} 大地区`,
      cabinChip: '经济舱 / 豪华经济舱 / 商务舱里程', blackoutChip: '屏蔽期一览',
      cabin: { 'Economy': '经济舱', 'Premium Economy': '豪华经济舱', 'Business': '商务舱' },
      milesRange: (cab, r) => `${cab} ${r} 里程`,
      legendBo: '<b>屏蔽期</b> = 不适用优惠票的日期',
      legendDash: '<b>—</b> = 无屏蔽期或无该舱位优惠',
      legendMiles: '里程为单人单程已含折扣，不含税费',
      source: '数据来源：',
      infoBook: '预订截止 2026年10月31日', infoTravel: '出行 2026年11月1日–11月30日',
      infoDiscount: 'Saver 奖励票 30% off', infoMiles: '里程为单人单程 · 已含折扣 · 不含税费',
      thRoute: '航线', thMiles: '里程', thFlights: '航班号', thBlackout: '屏蔽期',
      back: '↑ 返回总览',
      day: (a, b) => (b ? `${a}–${b}日` : `${a}日`),
      blackout: (segs) => { segs[0] = '11月' + segs[0]; return segs; },
      notesTitle: '预订须知',
      notes: [
        '<b>仅限线上预订：</b>需在 singaporeair.com 或 SingaporeAir App 登录 KrisFlyer 兑换，并在同一预订流程中立即出票。会员服务中心、售票处、旅行社均不适用。',
        '<b>不可更改、不可退票：</b>未使用或部分未使用的机票均不可取消。',
        '<b>整个行程都须符合条件：</b>任一航段在 11月1日–30日 之外、在 10月31日 之后出票，或不在上表航班之列，整张票都不享优惠。往返如有一程不符合，请分开单程预订。',
        '<b>航班号必须一致：</b>往返两段的航班号都须在上表中。代码共享航班不适用。',
        '<b>全里程支付：</b>不适用里程 + 现金。税费另付，不打折。',
        '<b>其他：</b>可单程或往返，不可中途停留，不可候补，不可与其他优惠叠加。座位有限，先到先得。',
        '<b>兑换步骤：</b>登录 → Book a Flight → Redeem flights → 在 <b>Promo</b> 票价栏选择航班 → 结账确认。',
        '<b>另有：</b>酷航 (Scoot) 指定航线经济舱 Saver 奖励票 85 折，需在 FlyScoot.com 或 Scoot App 登录 KrisFlyer 兑换。',
      ],
      disclaimer: (d) => `非官方整理，与新加坡航空无关。数据抄录自官方活动页面（${d}）。座位、屏蔽期和条款可能随时变更，预订前请以官网为准。`,
      date: (y, m, d) => `${y}年${m}月${d}日`,
    },
    en: {
      htmlLang: 'en',
      h1: 'Singapore Airlines KrisFlyer Spontaneous Escapes',
      travelLbl: 'Travel', travelVal: '1 – 30 Nov 2026',
      bookLbl: 'Book by', bookVal: '31 Oct 2026',
      discount: '30% off Saver awards',
      daysLeft: (n) => `${n} days left`, lastDay: 'Last day', closed: 'Closed',
      routes: (n) => `${n} routes`, routesUnit: 'routes', regions: (n) => `${n} regions`,
      cabinChip: 'Economy / Premium Economy / Business miles', blackoutChip: 'Blackout dates',
      cabin: { 'Economy': 'Economy', 'Premium Economy': 'Premium Economy', 'Business': 'Business' },
      milesRange: (cab, r) => `${cab} ${r} miles`,
      legendBo: '<b>Blackout</b> = dates the deal doesn\'t apply',
      legendDash: '<b>—</b> = no blackout dates, or no deal in this cabin',
      legendMiles: 'Miles are per person, one-way, after discount, excluding taxes',
      source: 'Source: ',
      infoBook: 'Book by 31 Oct 2026', infoTravel: 'Travel 1–30 Nov 2026',
      infoDiscount: '30% off Saver awards', infoMiles: 'Per person, one-way · discounted · excl. taxes',
      thRoute: 'Route', thMiles: 'Miles', thFlights: 'Flights', thBlackout: 'Blackout',
      back: '↑ Back to overview',
      day: (a, b) => (b ? `${a}–${b}` : `${a}`),
      blackout: (segs) => { segs[segs.length - 1] += ' Nov'; return segs; },
      notesTitle: 'Before you book',
      notes: [
        '<b>Online only:</b> redeem on singaporeair.com or the SingaporeAir app while logged in to KrisFlyer, and ticket in the same session. Not available via KrisFlyer Membership Services, ticket offices or travel agents.',
        '<b>No changes, no refunds:</b> unused and partly used tickets can\'t be cancelled.',
        '<b>The whole itinerary must qualify:</b> if any leg is outside 1–30 Nov, is ticketed after 31 Oct, or isn\'t a listed flight, the whole booking loses the discount. Book legs as separate one-ways if needed.',
        '<b>Flight numbers must match:</b> on a return booking, both sectors must be listed flights. Codeshares don\'t qualify.',
        '<b>Miles only:</b> no miles + cash. Taxes and fees are charged on top and aren\'t discounted.',
        '<b>Other limits:</b> one-way or return, no stopovers, no waitlisting, can\'t be combined with other promotions. Seats are limited, first come, first served.',
        '<b>How to redeem:</b> log in → Book a Flight → Redeem flights → pick flights in the <b>Promo</b> fare column → check out.',
        '<b>Also:</b> 15% off Economy Saver awards on selected Scoot flights. Redeem by logging in to KrisFlyer on FlyScoot.com or the Scoot app.',
      ],
      disclaimer: (d) => `Unofficial summary, not affiliated with Singapore Airlines. Data copied from the official promotion page on ${d}. Seats, blackout dates and terms can change at any time, so check the official page before booking.`,
      date: (y, m, d) => `${d} ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][m - 1]} ${y}`,
    },
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
  const groups = [...regions.values()];

  let lang;
  let T;

  const city = (name) => {
    const [zh, code, en] = CITY[name] || [name, ''];
    return `${esc(lang === 'zh' ? zh : en || name)}<span class="iata">${esc(code)}</span>`;
  };
  const regionTitle = (g) => (lang === 'zh' ? REGION[g.name].zh : g.name);
  const regionSub = (g) => (lang === 'zh' ? g.name : REGION[g.name].zh);

  // zh: "11月4日, 7–9日, 21–23日"   en: "4, 7–9, 21–23 Nov"
  function blackout(days) {
    if (!days.length) return '—';
    const segs = [];
    for (let i = 0; i < days.length; i++) {
      let j = i;
      while (j + 1 < days.length && days[j + 1] === days[j] + 1) j++;
      segs.push(T.day(days[i], j > i ? days[j] : null));
      i = j;
    }
    return T.blackout(segs).map((s) => `<span class="seg">${s}</span>`).join(', ');
  }

  const range = (list) => {
    const lo = Math.min(...list), hi = Math.max(...list);
    return lo === hi ? fmt(lo) : `${fmt(lo)} — ${fmt(hi)}`;
  };
  const cabinRanges = (g) => CABINS.filter((k) => g.cabins.has(k)).map((k) => {
    const miles = [...g.rows.values()].map((row) => row.cab[k]?.miles).filter(Boolean);
    return T.milesRange(T.cabin[k], range(miles));
  });

  function render() {
    T = I18N[lang];
    document.documentElement.lang = T.htmlLang;
    document.title = T.h1;
    document.querySelectorAll('[data-t]').forEach((el) => { el.textContent = T[el.dataset.t]; });
    document.querySelectorAll('.lang button').forEach((b) => b.setAttribute('aria-pressed', b.dataset.lang === lang));

    const left = Math.ceil((new Date(meta.bookBy + 'T23:59:59') - new Date()) / 864e5);
    const countdown = left > 1 ? T.daysLeft(left) : left === 1 ? T.lastDay : T.closed;
    const dot = '<span class="dot">·</span>';
    $('#heroMeta').innerHTML = `<span class="k">${T.travelLbl}</span> <b>${T.travelVal}</b>${dot}`
      + `<span class="k">${T.bookLbl}</span> <b>${T.bookVal}</b> <span class="countdown">${countdown}</span>${dot}`
      + `<span class="k">${T.discount}</span>`;
    $('#heroChips').innerHTML = `<span class="hchip">✈️ ${T.routes(groups.reduce((n, g) => n + g.rows.size, 0))}</span>`
      + `<span class="hchip">🌏 ${T.regions(groups.length)}</span>`
      + `<span class="hchip">💺 ${T.cabinChip}</span>`
      + `<a class="hchip" href="#tables">📅 ${T.blackoutChip}</a>`;

    $('#regionGrid').innerHTML = groups.map((g) => {
      const R = REGION[g.name];
      return `<a class="rcard" href="#${R.id}" style="--c:${R.c};--soft:${R.soft}">
        <h2>${esc(regionTitle(g))}</h2>
        <div class="en">${esc(regionSub(g))}</div>
        <span class="pill">${T.routes(g.rows.size)}</span>
        <p class="ranges">${cabinRanges(g).join(' · ')}</p>
      </a>`;
    }).join('');

    $('#legendBar').innerHTML = `<span>${T.legendBo}</span>${dot}<span>${T.legendDash}</span>${dot}<span>${T.legendMiles}</span>`
      + `<span class="src">${T.source}<a href="${esc(meta.source)}" target="_blank" rel="noopener">singaporeair.com</a></span>`;

    $('#tables').innerHTML = groups.map((g) => {
      const R = REGION[g.name];
      const cabins = CABINS.filter((k) => g.cabins.has(k));
      const head = `
        <tr class="group"><th class="route-h" rowspan="2">${T.thRoute}</th>${cabins.map((k) => `<th colspan="3">${T.cabin[k]}</th>`).join('')}</tr>
        <tr class="sub">${cabins.map(() => `<th class="first">${T.thMiles}</th><th>${T.thFlights}</th><th>${T.thBlackout}</th>`).join('')}</tr>`;
      const body = [...g.rows.values()].map((row) => {
        const cells = cabins.map((k) => {
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
          <div><h2>${R.icon} ${esc(regionTitle(g))}</h2><div class="en">${esc(regionSub(g))}</div></div>
          <div class="right">
            <div class="count">${g.rows.size}<small>${T.routesUnit}</small></div>
            <div class="rng">${cabinRanges(g).join(' · ')}</div>
          </div>
        </div>
        <div class="infobar">
          <span>🇸🇬 KrisFlyer Spontaneous Escapes</span>${dot}
          <span>${T.infoBook}</span>${dot}<span>${T.infoTravel}</span>${dot}<span>${T.infoDiscount}</span>
          <span class="end">${T.infoMiles}</span>
        </div>
        <div class="tscroll"><table><thead>${head}</thead><tbody>${body}</tbody></table></div>
        <div class="tfoot">
          <span>${T.legendBo}</span>${dot}<span>${T.legendDash}</span>
          <a class="back" href="#overview">${T.back}</a>
        </div>
      </section>`;
    }).join('');

    const [y, m, d] = meta.retrieved.split('-').map(Number);
    $('#notes').innerHTML = `<h2>${T.notesTitle}</h2><ul>${T.notes.map((n) => `<li>${n}</li>`).join('')}</ul>`
      + `<p class="disclaimer">${esc(T.disclaimer(T.date(y, m, d)))}</p>`;
  }

  // ---------- language: ?lang= → saved choice → browser language ----------
  function setLang(next, save) {
    lang = next;
    if (save) {
      try { localStorage.setItem('lang', next); } catch (e) { /* storage unavailable */ }
      const url = new URL(location.href);
      url.searchParams.set('lang', next);
      history.replaceState(null, '', url);
    }
    render();
  }
  let saved = null;
  try { saved = localStorage.getItem('lang'); } catch (e) { /* storage unavailable */ }
  const param = new URLSearchParams(location.search).get('lang');
  const initial = [param, saved].find((v) => v && v in I18N)
    || ((navigator.language || '').toLowerCase().startsWith('zh') ? 'zh' : 'en');

  document.querySelector('.lang').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (b && b.dataset.lang !== lang) setLang(b.dataset.lang, true);
  });
  setLang(initial, false);
})();
