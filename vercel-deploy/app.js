(() => {
  const $ = (s) => document.querySelector(s);
  const fmt = (n) => n.toLocaleString('en-US');
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const ymd = (iso) => iso.slice(0, 10).split('-').map(Number);

  // Name as written on singaporeair.com → [中文, IATA, English display name (defaults to the source name)]
  const CITY = {
    'Singapore': ['新加坡', 'SIN'], 'Brunei': ['文莱', 'BWN'], 'Denpasar': ['巴厘岛', 'DPS', 'Bali (Denpasar)'],
    'Bali': ['巴厘岛', 'DPS'], 'Jakarta': ['雅加达', 'CGK'], 'Kuala Lumpur': ['吉隆坡', 'KUL'], 'Penang': ['槟城', 'PEN'],
    'Surabaya': ['泗水', 'SUB'], 'Bangkok': ['曼谷', 'BKK'], 'Chiang Mai': ['清迈', 'CNX'], 'Krabi': ['甲米', 'KBV'],
    'Da Nang': ['岘港', 'DAD'], 'Hanoi': ['河内', 'HAN'], 'Ho Chi Minh City': ['胡志明市', 'SGN'], 'Manila': ['马尼拉', 'MNL'],
    'Cebu': ['宿务', 'CEB'], 'Phnom Penh': ['金边', 'KTI'], 'Phuket': ['普吉岛', 'HKT'], 'Siem Reap': ['暹粒', 'SAI'],
    'Yangon': ['仰光', 'RGN'], 'Hangzhou': ['杭州', 'HGH'], 'Beijing': ['北京', 'PEK'], 'Shanghai': ['上海', 'PVG'],
    'Guangzhou': ['广州', 'CAN'], 'Shenzhen': ['深圳', 'SZX'], 'Chengdu': ['成都', 'TFU'], 'Chongqing': ['重庆', 'CKG'],
    'Xiamen': ['厦门', 'XMN'], 'Hong Kong': ['香港', 'HKG'], 'Taipei': ['台北', 'TPE'], 'Seoul': ['首尔', 'ICN'],
    'Busan': ['釜山', 'PUS'], 'Tokyo (Narita)': ['东京成田', 'NRT', 'Tokyo Narita'], 'Tokyo (Haneda)': ['东京羽田', 'HND', 'Tokyo Haneda'],
    'Tokyo': ['东京', 'TYO'], 'Osaka': ['大阪', 'KIX'], 'Nagoya': ['名古屋', 'NGO'], 'Fukuoka': ['福冈', 'FUK'], 'Sapporo': ['札幌', 'CTS'],
    'Ahmedabad': ['艾哈迈达巴德', 'AMD'], 'Bengaluru': ['班加罗尔', 'BLR'], 'Chennai': ['金奈', 'MAA'], 'Delhi': ['德里', 'DEL'],
    'Hyderabad': ['海得拉巴', 'HYD'], 'Kolkata': ['加尔各答', 'CCU'], 'Mumbai': ['孟买', 'BOM'], 'Kochi': ['科钦', 'COK'],
    'Colombo': ['科伦坡', 'CMB'], 'Dhaka': ['达卡', 'DAC'], 'Kathmandu': ['加德满都', 'KTM'], 'Male': ['马累', 'MLE'],
    'Dubai': ['迪拜', 'DXB'], 'Johannesburg': ['约翰内斯堡', 'JNB'], 'Cape Town': ['开普敦', 'CPT'],
    'Darwin': ['达尔文', 'DRW'], 'Adelaide': ['阿德莱德', 'ADL'], 'Brisbane': ['布里斯班', 'BNE'], 'Cairns': ['凯恩斯', 'CNS'],
    'Melbourne': ['墨尔本', 'MEL'], 'Sydney': ['悉尼', 'SYD'], 'Perth': ['珀斯', 'PER'], 'Canberra': ['堪培拉', 'CBR'],
    'Auckland': ['奥克兰', 'AKL'], 'Christchurch': ['基督城', 'CHC'],
    'Istanbul': ['伊斯坦布尔', 'IST'], 'Amsterdam': ['阿姆斯特丹', 'AMS'], 'Barcelona': ['巴塞罗那', 'BCN'], 'Brussels': ['布鲁塞尔', 'BRU'],
    'Copenhagen': ['哥本哈根', 'CPH'], 'Frankfurt': ['法兰克福', 'FRA'], 'London Gatwick': ['伦敦盖特威克', 'LGW'],
    'London (LHR)': ['伦敦希思罗', 'LHR', 'London Heathrow'], 'London Heathrow': ['伦敦希思罗', 'LHR'], 'London': ['伦敦', 'LHR'],
    'Manchester': ['曼彻斯特', 'MAN'], 'Milan': ['米兰', 'MXP'], 'Munich': ['慕尼黑', 'MUC'], 'Paris': ['巴黎', 'CDG'],
    'Rome': ['罗马', 'FCO'], 'Zurich': ['苏黎世', 'ZRH'], 'Athens': ['雅典', 'ATH'],
    'New York': ['纽约', 'JFK'], 'New York (JFK)': ['纽约', 'JFK', 'New York'], 'Newark': ['纽瓦克', 'EWR'],
    'Los Angeles': ['洛杉矶', 'LAX'], 'San Francisco': ['旧金山', 'SFO'], 'Seattle': ['西雅图', 'SEA'], 'Houston': ['休斯顿', 'IAH'],
    'Vancouver': ['温哥华', 'YVR'],
  };
  const REGION = {
    'South East Asia':    { zh: '东南亚',     id: 'sea', icon: '🌴', c: '#0f766e', c2: '#14b8a6', soft: '#ccfbf1' },
    'North Asia':         { zh: '东北亚',     id: 'na',  icon: '🏯', c: '#1d4ed8', c2: '#3b82f6', soft: '#dbeafe' },
    'West Asia & Africa': { zh: '西亚 & 非洲', id: 'waa', icon: '🕌', c: '#c2410c', c2: '#f59e0b', soft: '#ffedd5' },
    'Southwest Pacific':  { zh: '西南太平洋', id: 'swp', icon: '🦘', c: '#15803d', c2: '#22c55e', soft: '#dcfce7' },
    'Europe':             { zh: '欧洲',       id: 'eu',  icon: '🏰', c: '#6d28d9', c2: '#9333ea', soft: '#ede9fe' },
    'USA':                { zh: '美国',       id: 'usa', icon: '🗽', c: '#b91c1c', c2: '#ef4444', soft: '#fee2e2' },
  };
  const regionInfo = (name) => REGION[name] || {
    zh: name, id: 'r-' + name.toLowerCase().replace(/[^a-z0-9]+/g, '-'), icon: '✈️', c: '#334155', c2: '#64748b', soft: '#e2e8f0',
  };
  const CABINS = ['Economy', 'Premium Economy', 'Business', 'First'];

  // 30% off → 七折, 15% off → 八五折
  const CN = '〇一二三四五六七八九';
  const zhFold = (pct) => { const v = 100 - pct; return (v % 10 ? CN[Math.floor(v / 10)] + CN[v % 10] : CN[v / 10]) + '折'; };

  const I18N = {
    zh: {
      htmlLang: 'zh-CN',
      h1: '新加坡航空 KrisFlyer Spontaneous Escapes',
      date: (iso) => { const [y, m, d] = ymd(iso); return `${y}年${m}月${d}日`; },
      short: (iso) => { const [, m, d] = ymd(iso); return `${m}月${d}日`; },
      range(a, b) { const [y1, m1, d1] = ymd(a), [y2, m2, d2] = ymd(b); return `${y1}年${m1}月${d1}日 — ${y1 === y2 ? '' : y2 + '年'}${m2}月${d2}日`; },
      month: (id) => { const [y, m] = id.split('-').map(Number); return `${y}年${m}月出行`; },
      travelLbl: '出行期', bookLbl: '预订截止',
      discount: (p) => (p ? `Saver 奖励票${zhFold(p)}` : 'Saver 奖励票优惠'),
      daysLeft: (n) => `还剩 ${n} 天`, lastDay: '今天截止', closed: '已截止',
      routes: (n) => `${n} 条航线`, routesUnit: '条航线', regions: (n) => `${n} 大地区`,
      cabinChip: '经济舱 / 豪华经济舱 / 商务舱里程', blackoutChip: '屏蔽期一览',
      cabin: { 'Economy': '经济舱', 'Premium Economy': '豪华经济舱', 'Business': '商务舱', 'First': '头等舱' },
      milesRange: (cab, r) => `${cab} ${r} 里程`,
      legendBo: '<b>屏蔽期</b> = 不适用优惠票的日期',
      legendDash: '<b>—</b> = 无屏蔽期或无该舱位优惠',
      legendMiles: '里程为单人单程已含折扣，不含税费',
      source: '数据来源：',
      thRoute: '航线', thMiles: '里程', thFlights: '航班号', thBlackout: '屏蔽期',
      back: '↑ 返回总览',
      // [{m, segs:["4日","7–9日"]}] → "11月4日, 7–9日, 12月1日"
      blackout: (groups) => groups.map((g) => { const s = [...g.segs]; s[0] = `${g.m}月${s[0]}`; return s; }).flat(),
      day: (a, b) => (b ? `${a}–${b}日` : `${a}日`),
      editionLabel: '选择期数', current: '当期', archivedTag: '往期',
      archivedBar: (r, link) => `📦 这是往期优惠（${r} 出行），已不可预订。${link}`,
      viewCurrent: '查看当期 →',
      check: '🔄 检查官网更新',
      lastChecked: (t) => `上次检查：${t}`,
      status: {
        checking: '正在检查官网…', unchanged: '已是最新', recent: '刚刚检查过，已是最新',
        added: '已获取当期优惠', new: '发现新一期优惠，已更新，上一期已存入往期',
        updated: '官网内容有变动，已同步', error: (e) => `无法获取官网数据：${e}`,
        unavailable: '当前预览不支持检查更新（需要部署到 Vercel）',
      },
      notesTitle: '预订须知',
      notes: (m) => [
        '<b>仅限线上预订：</b>需在 singaporeair.com 或 SingaporeAir App 登录 KrisFlyer 兑换，并在同一预订流程中立即出票。会员服务中心、售票处、旅行社均不适用。',
        '<b>不可更改、不可退票：</b>未使用或部分未使用的机票均不可取消。',
        `<b>整个行程都须符合条件：</b>任一航段在 ${m.travel} 之外、在 ${m.bookBy} 之后出票，或不在上表航班之列，整张票都不享优惠。往返如有一程不符合，请分开单程预订。`,
        '<b>航班号必须一致：</b>往返两段的航班号都须在上表中。代码共享航班不适用。',
        '<b>全里程支付：</b>不适用里程 + 现金。税费另付，不打折。',
        '<b>其他：</b>可单程或往返，不可中途停留，不可候补，不可与其他优惠叠加。座位有限，先到先得。',
        '<b>兑换步骤：</b>登录 → Book a Flight → Redeem flights → 在 <b>Promo</b> 票价栏选择航班 → 结账确认。',
        ...(m.scootPct ? [`<b>另有：</b>酷航 (Scoot) 指定航线经济舱 Saver 奖励票${zhFold(m.scootPct)}，需在 FlyScoot.com 或 Scoot App 登录 KrisFlyer 兑换。`] : []),
      ],
      disclaimer: (d) => `非官方整理，与新加坡航空无关。数据抄录自官方活动页面（${d}）。座位、屏蔽期和条款可能随时变更，预订前请以官网为准。`,
      time: (iso) => { const t = new Date(iso); return `${t.getMonth() + 1}月${t.getDate()}日 ${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`; },
    },
    en: {
      htmlLang: 'en',
      h1: 'Singapore Airlines KrisFlyer Spontaneous Escapes',
      date: (iso) => { const [y, m, d] = ymd(iso); return `${d} ${MON[m - 1]} ${y}`; },
      short: (iso) => { const [, m, d] = ymd(iso); return `${d} ${MON[m - 1]}`; },
      range(a, b) {
        const [y1, m1, d1] = ymd(a), [y2, m2, d2] = ymd(b);
        if (y1 === y2 && m1 === m2) return `${d1} – ${d2} ${MON[m1 - 1]} ${y1}`;
        return `${d1} ${MON[m1 - 1]}${y1 === y2 ? '' : ' ' + y1} – ${d2} ${MON[m2 - 1]} ${y2}`;
      },
      month: (id) => { const [y, m] = id.split('-').map(Number); return `${MON[m - 1]} ${y} travel`; },
      travelLbl: 'Travel', bookLbl: 'Book by',
      discount: (p) => (p ? `${p}% off Saver awards` : 'Saver award discount'),
      daysLeft: (n) => `${n} days left`, lastDay: 'Last day', closed: 'Closed',
      routes: (n) => `${n} route${n === 1 ? '' : 's'}`, routesUnit: 'routes', regions: (n) => `${n} region${n === 1 ? '' : 's'}`,
      cabinChip: 'Economy / Premium Economy / Business miles', blackoutChip: 'Blackout dates',
      cabin: { 'Economy': 'Economy', 'Premium Economy': 'Premium Economy', 'Business': 'Business', 'First': 'First' },
      milesRange: (cab, r) => `${cab} ${r} miles`,
      legendBo: '<b>Blackout</b> = dates the deal doesn\'t apply',
      legendDash: '<b>—</b> = no blackout dates, or no deal in this cabin',
      legendMiles: 'Miles are per person, one-way, after discount, excluding taxes',
      source: 'Source: ',
      thRoute: 'Route', thMiles: 'Miles', thFlights: 'Flights', thBlackout: 'Blackout',
      back: '↑ Back to overview',
      // [{m, segs:["4","7–9"]}] → "4, 7–9 Nov, 1 Dec"
      blackout: (groups) => groups.map((g) => { const s = [...g.segs]; s[s.length - 1] += ` ${MON[g.m - 1]}`; return s; }).flat(),
      day: (a, b) => (b ? `${a}–${b}` : `${a}`),
      editionLabel: 'Choose month', current: 'current', archivedTag: 'archived',
      archivedBar: (r, link) => `📦 You're viewing an archived promotion (${r} travel). It can no longer be booked. ${link}`,
      viewCurrent: 'View current →',
      check: '🔄 Check singaporeair.com',
      lastChecked: (t) => `Last checked ${t}`,
      status: {
        checking: 'Checking singaporeair.com…', unchanged: 'Up to date', recent: 'Checked moments ago: up to date',
        added: 'Saved the current promotion', new: 'New promotion found and shown; the previous one is archived',
        updated: 'The official page changed; synced', error: (e) => `Couldn't check singaporeair.com: ${e}`,
        unavailable: 'Checking isn\'t available in this preview (needs the Vercel deployment)',
      },
      notesTitle: 'Before you book',
      notes: (m) => [
        '<b>Online only:</b> redeem on singaporeair.com or the SingaporeAir app while logged in to KrisFlyer, and ticket in the same session. Not available via KrisFlyer Membership Services, ticket offices or travel agents.',
        '<b>No changes, no refunds:</b> unused and partly used tickets can\'t be cancelled.',
        `<b>The whole itinerary must qualify:</b> if any leg is outside ${m.travel}, is ticketed after ${m.bookBy}, or isn't a listed flight, the whole booking loses the discount. Book legs as separate one-ways if needed.`,
        '<b>Flight numbers must match:</b> on a return booking, both sectors must be listed flights. Codeshares don\'t qualify.',
        '<b>Miles only:</b> no miles + cash. Taxes and fees are charged on top and aren\'t discounted.',
        '<b>Other limits:</b> one-way or return, no stopovers, no waitlisting, can\'t be combined with other promotions. Seats are limited, first come, first served.',
        '<b>How to redeem:</b> log in → Book a Flight → Redeem flights → pick flights in the <b>Promo</b> fare column → check out.',
        ...(m.scootPct ? [`<b>Also:</b> ${m.scootPct}% off Economy Saver awards on selected Scoot flights. Redeem by logging in to KrisFlyer on FlyScoot.com or the Scoot app.`] : []),
      ],
      disclaimer: (d) => `Unofficial summary, not affiliated with Singapore Airlines. Data copied from the official promotion page on ${d}. Seats, blackout dates and terms can change at any time, so check the official page before booking.`,
      time: (iso) => { const t = new Date(iso); return `${t.getDate()} ${MON[t.getMonth()]}, ${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`; },
    },
  };

  // ---------- state ----------
  let lang;
  let T;
  let index = null;            // from /api/promos; null when the API isn't available
  let promo = window.PROMO_SEED; // the promotion being shown
  let checkState = null;       // { key, error? } for the status line

  const isArchived = () => index && promo && index.current && promo.id !== index.current;

  function group(p) {
    const regions = new Map();
    p.routes.forEach((r) => {
      if (!regions.has(r.region)) regions.set(r.region, { name: r.region, rows: new Map(), cabins: new Set() });
      const g = regions.get(r.region);
      const key = `${r.origin}|${r.dest}`;
      if (!g.rows.has(key)) g.rows.set(key, { origin: r.origin, dest: r.dest, cab: {} });
      g.rows.get(key).cab[r.cabin] = r;
      g.cabins.add(r.cabin);
    });
    return [...regions.values()];
  }

  const city = (name) => {
    const [zh, code, en] = CITY[name] || [name, ''];
    return `${esc(lang === 'zh' ? zh : en || name)}${code ? `<span class="iata">${esc(code)}</span>` : ''}`;
  };
  const regionTitle = (g) => (lang === 'zh' ? regionInfo(g.name).zh : g.name);
  const regionSub = (g) => (lang === 'zh' ? g.name : regionInfo(g.name).zh);

  function blackout(r) {
    if (!r.blackout.length) return r.blackoutRaw ? esc(r.blackoutRaw) : '—';
    const groups = [];
    for (let i = 0; i < r.blackout.length; i++) {
      let j = i;
      const [y, m, d] = ymd(r.blackout[i]);
      while (j + 1 < r.blackout.length) {
        const [y2, m2, d2] = ymd(r.blackout[j + 1]);
        const [, , dj] = ymd(r.blackout[j]);
        if (y2 !== y || m2 !== m || d2 !== dj + 1) break;
        j++;
      }
      const seg = T.day(d, j > i ? ymd(r.blackout[j])[2] : null);
      const last = groups[groups.length - 1];
      if (last && last.m === m && last.y === y) last.segs.push(seg); else groups.push({ y, m, segs: [seg] });
      i = j;
    }
    return T.blackout(groups).map((s) => `<span class="seg">${s}</span>`).join(', ');
  }

  const range = (list) => {
    const lo = Math.min(...list), hi = Math.max(...list);
    return lo === hi ? fmt(lo) : `${fmt(lo)} — ${fmt(hi)}`;
  };
  const cabinRanges = (g) => CABINS.filter((k) => g.cabins.has(k)).map((k) => {
    const miles = [...g.rows.values()].map((row) => row.cab[k]?.miles).filter(Boolean);
    return T.milesRange(T.cabin[k] || k, range(miles));
  });

  // ---------- rendering ----------
  function renderStatus() {
    $('#checkBtn').textContent = T.check;
    $('#checkBtn').disabled = checkState?.key === 'checking';
    let msg = '';
    if (checkState) {
      const s = T.status[checkState.key];
      msg = typeof s === 'function' ? s(checkState.error) : s;
    } else if (index?.lastChecked) {
      msg = T.lastChecked(T.time(index.lastChecked));
    }
    const el = $('#checkStatus');
    el.textContent = msg;
    el.className = `check-status ${checkState?.key === 'error' ? 'err' : ''} ${['new', 'updated', 'added'].includes(checkState?.key) ? 'good' : ''}`;
  }

  function renderEditions() {
    const wrap = $('#editionWrap');
    const list = index?.promos || [];
    wrap.hidden = list.length < 2;
    $('#edition').innerHTML = list.map((p) => `<option value="${esc(p.id)}" ${p.id === promo.id ? 'selected' : ''}>`
      + `${esc(T.month(p.id))} · ${p.id === index.current ? T.current : T.archivedTag}</option>`).join('');
    const bar = $('#archivedBar');
    bar.hidden = !isArchived();
    if (isArchived()) {
      bar.innerHTML = T.archivedBar(esc(T.range(promo.meta.travelFrom, promo.meta.travelTo)), `<a href="#" data-goto="${esc(index.current)}">${T.viewCurrent}</a>`);
    }
  }

  function render() {
    T = I18N[lang];
    const { meta } = promo;
    const groups = group(promo);
    document.documentElement.lang = T.htmlLang;
    document.title = T.h1;
    document.querySelectorAll('[data-t]').forEach((el) => { el.textContent = T[el.dataset.t]; });
    document.querySelectorAll('.lang button').forEach((b) => b.setAttribute('aria-pressed', b.dataset.lang === lang));

    const left = Math.ceil((new Date(meta.bookBy + 'T23:59:59+08:00') - new Date()) / 864e5);
    const countdown = left > 1 ? T.daysLeft(left) : left === 1 ? T.lastDay : T.closed;
    const dot = '<span class="dot">·</span>';
    $('#heroMeta').innerHTML = `<span class="k">${T.travelLbl}</span> <b>${T.range(meta.travelFrom, meta.travelTo)}</b>${dot}`
      + `<span class="k">${T.bookLbl}</span> <b>${T.date(meta.bookBy)}</b> <span class="countdown">${countdown}</span>${dot}`
      + `<span class="k">${T.discount(meta.discountPct)}</span>`;
    $('#heroChips').innerHTML = `<span class="hchip">✈️ ${T.routes(groups.reduce((n, g) => n + g.rows.size, 0))}</span>`
      + `<span class="hchip">🌏 ${T.regions(groups.length)}</span>`
      + `<span class="hchip">💺 ${T.cabinChip}</span>`
      + `<a class="hchip" href="#tables">📅 ${T.blackoutChip}</a>`;
    renderEditions();
    renderStatus();

    $('#regionGrid').innerHTML = groups.map((g) => {
      const R = regionInfo(g.name);
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
      const R = regionInfo(g.name);
      const cabins = CABINS.filter((k) => g.cabins.has(k));
      const head = `
        <tr class="group"><th class="route-h" rowspan="2">${T.thRoute}</th>${cabins.map((k) => `<th colspan="3">${T.cabin[k] || k}</th>`).join('')}</tr>
        <tr class="sub">${cabins.map(() => `<th class="first">${T.thMiles}</th><th>${T.thFlights}</th><th>${T.thBlackout}</th>`).join('')}</tr>`;
      const body = [...g.rows.values()].map((row) => {
        const cells = cabins.map((k) => {
          const r = row.cab[k];
          if (!r) return '<td class="first na">—</td><td class="na">—</td><td class="bo na">—</td>';
          return `<td class="first miles">${fmt(r.miles)}</td>
            <td class="fl">${r.flights.map((f) => `<span class="fno">${esc(f)}</span>`).join('')}</td>
            <td class="bo">${blackout(r)}</td>`;
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
        <div class="tscroll"><table><thead>${head}</thead><tbody>${body}</tbody></table></div>
        <div class="tfoot">
          <span>${T.legendBo}</span>${dot}<span>${T.legendDash}</span>
          <a class="back" href="#overview">${T.back}</a>
        </div>
      </section>`;
    }).join('');

    $('#notes').innerHTML = `<h2>${T.notesTitle}</h2><ul>${T.notes({
      travel: `${T.short(meta.travelFrom)}–${T.short(meta.travelTo)}`, bookBy: T.short(meta.bookBy), scootPct: meta.scootPct,
    }).map((n) => `<li>${n}</li>`).join('')}</ul>`
      + `<p class="disclaimer">${esc(T.disclaimer(T.date(meta.retrieved)))}</p>`;
  }

  // ---------- data loading, archive and update check ----------
  function setUrl(key, value) {
    const url = new URL(location.href);
    if (value) url.searchParams.set(key, value); else url.searchParams.delete(key);
    history.replaceState(null, '', url);
  }

  async function load(id) {
    try {
      const res = await fetch(`/api/promos${id ? `?id=${encodeURIComponent(id)}` : ''}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      index = data.index;
      if (data.promo) promo = data.promo;
    } catch (e) {
      // API unavailable (e.g. plain static server): keep showing the built-in data
    }
    render();
  }

  async function check() {
    checkState = { key: 'checking' };
    renderStatus();
    try {
      const res = await fetch('/api/check', { method: 'POST' });
      const ct = res.headers.get('content-type') || '';
      if (!ct.includes('json')) throw Object.assign(new Error('no api'), { unavailable: true });
      const data = await res.json();
      if (data.status === 'error' || !res.ok) {
        checkState = { key: res.status === 503 ? 'unavailable' : 'error', error: data.error || `HTTP ${res.status}` };
        if (data.index) index = data.index;
      } else {
        index = data.index;
        checkState = { key: data.status };
        // show the newest promotion unless the visitor is browsing the archive
        if (data.promo && (!isArchived() || data.status === 'new')) { promo = data.promo; setUrl('promo', null); }
      }
    } catch (e) {
      checkState = { key: e.unavailable || location.protocol === 'file:' ? 'unavailable' : 'error', error: e.message };
    }
    render();
  }

  // ---------- language: ?lang= → saved choice → browser language ----------
  function setLang(next, save) {
    lang = next;
    if (save) {
      try { localStorage.setItem('lang', next); } catch (e) { /* storage unavailable */ }
      setUrl('lang', next);
    }
    render();
  }
  let saved = null;
  try { saved = localStorage.getItem('lang'); } catch (e) { /* storage unavailable */ }
  const params = new URLSearchParams(location.search);
  const initial = [params.get('lang'), saved].find((v) => v && v in I18N)
    || ((navigator.language || '').toLowerCase().startsWith('zh') ? 'zh' : 'en');

  document.querySelector('.lang').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (b && b.dataset.lang !== lang) setLang(b.dataset.lang, true);
  });
  $('#checkBtn').addEventListener('click', check);
  $('#edition').addEventListener('change', (e) => {
    const id = e.target.value;
    checkState = null;
    setUrl('promo', id === index?.current ? null : id);
    load(id);
  });
  $('#archivedBar').addEventListener('click', (e) => {
    const a = e.target.closest('[data-goto]');
    if (!a) return;
    e.preventDefault();
    setUrl('promo', null);
    load(a.dataset.goto);
  });

  setLang(initial, false);
  load(params.get('promo'));
})();
