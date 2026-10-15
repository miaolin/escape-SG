(() => {
  const { meta, routes } = window.PROMO;
  const DAYS = 30;
  const YEAR = meta.year, MONTH = meta.month - 1;
  const WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const $ = (s) => document.querySelector(s);
  const fmt = (n) => n.toLocaleString('en-GB');
  const weekday = (d) => new Date(YEAR, MONTH, d).getDay();
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  routes.forEach((r, i) => {
    r.id = i;
    r.dir = r.origin === 'Singapore' ? 'from' : r.dest === 'Singapore' ? 'to' : 'other';
    r.open = DAYS - r.blackout.length;
    r.city = r.dir === 'from' ? r.dest : r.dir === 'to' ? r.origin : `${r.origin} – ${r.dest}`;
  });

  const state = { q: '', cabin: 'all', dir: 'all', region: 'all', day: null, sort: 'miles' };

  // ---------- header facts ----------
  const cities = new Set(routes.flatMap((r) => [r.origin, r.dest]).filter((c) => c !== 'Singapore'));
  $('#dealCount').textContent = routes.length;
  $('#cityCount').textContent = `${cities.size} cities · ${new Set(routes.map((r) => r.region)).size} regions`;
  const deadline = new Date(meta.bookBy + 'T23:59:59');
  const left = Math.ceil((deadline - new Date()) / 864e5);
  $('#countdown').textContent = left > 1 ? `${left} days left` : left === 1 ? 'Last day' : 'Booking closed';
  $('#srcLink').href = meta.source;
  $('#retrieved').textContent = new Date(meta.retrieved).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  // ---------- chips ----------
  function chipGroup(el, key, label, options) {
    el.innerHTML = `<span class="lbl">${label}</span>` + options.map(([v, t]) => {
      const n = v === 'all' ? routes.length : routes.filter((r) => r[key] === v).length;
      return `<button class="chip" data-v="${esc(v)}" aria-pressed="${state[key] === v}">${esc(t)}<span class="n">${n}</span></button>`;
    }).join('');
    el.addEventListener('click', (e) => {
      const b = e.target.closest('.chip');
      if (!b) return;
      state[key] = b.dataset.v;
      el.querySelectorAll('.chip').forEach((c) => c.setAttribute('aria-pressed', c === b));
      render();
    });
  }
  chipGroup($('#cabinChips'), 'cabin', 'Cabin', [['all', 'All'], ['Economy', 'Economy'], ['Premium Economy', 'Premium Economy'], ['Business', 'Business']]);
  chipGroup($('#dirChips'), 'dir', 'Direction', [['all', 'All'], ['from', 'From Singapore'], ['to', 'To Singapore'], ['other', 'Other routes']]);
  const regions = [...new Set(routes.map((r) => r.region))];
  chipGroup($('#regionChips'), 'region', 'Region', [['all', 'All'], ...regions.map((r) => [r, r])]);

  // ---------- day picker ----------
  const daysEl = $('#days');
  daysEl.innerHTML = Array.from({ length: DAYS }, (_, i) => {
    const d = i + 1, w = weekday(d);
    return `<button class="day${w === 0 || w === 6 ? ' we' : ''}" data-d="${d}" aria-pressed="false" title="${WD[w]} ${d} Nov"><small>${WD[w][0]}</small><span>${d}</span></button>`;
  }).join('');
  function setDay(d) {
    state.day = d;
    daysEl.querySelectorAll('.day').forEach((b) => b.setAttribute('aria-pressed', +b.dataset.d === d));
    $('#dateLabel').textContent = d ? `${WD[weekday(d)]} ${d} Nov` : 'any day';
    $('#clearDate').hidden = !d;
    render();
  }
  daysEl.addEventListener('click', (e) => {
    const b = e.target.closest('.day');
    if (b) setDay(state.day === +b.dataset.d ? null : +b.dataset.d);
  });
  $('#clearDate').addEventListener('click', () => setDay(null));
  $('#q').addEventListener('input', (e) => { state.q = e.target.value.trim().toLowerCase(); render(); });
  $('#sort').addEventListener('change', (e) => { state.sort = e.target.value; render(); });

  // ---------- results ----------
  function strip(r) {
    const bo = new Set(r.blackout);
    return Array.from({ length: DAYS }, (_, i) => {
      const d = i + 1;
      const cls = [bo.has(d) ? 'bo' : '', state.day === d ? 'pick' : ''].join(' ').trim();
      return `<i class="${cls}" title="${d} Nov: ${bo.has(d) ? 'blackout' : 'available'}"></i>`;
    }).join('');
  }

  function card(r) {
    const cabinCls = r.cabin.split(' ')[0];
    return `<article class="card">
      <div class="top">
        <div>
          <div class="route">${esc(r.origin)} <span class="arrow">→</span> ${esc(r.dest)}</div>
          <div class="meta">${esc(r.region)} · ${r.flights.map(esc).join(', ')}</div>
        </div>
        <span class="cabin ${cabinCls}">${esc(r.cabin)}</span>
      </div>
      <div class="miles">${fmt(r.miles)}<small>miles one-way</small></div>
      <div class="strip" aria-label="${r.open} of ${DAYS} days available">${strip(r)}</div>
      <div class="strip-lbl"><span>1 Nov</span><span>${r.blackout.length ? `${r.open}/${DAYS} days open` : 'No blackout days'}</span><span>30 Nov</span></div>
    </article>`;
  }

  function render() {
    const q = state.q;
    let list = routes.filter((r) =>
      (state.cabin === 'all' || r.cabin === state.cabin) &&
      (state.dir === 'all' || r.dir === state.dir) &&
      (state.region === 'all' || r.region === state.region) &&
      (!state.day || !r.blackout.includes(state.day)) &&
      (!q || `${r.origin} ${r.dest} ${r.flights.join(' ')} ${r.region}`.toLowerCase().includes(q))
    );
    const sorters = {
      miles: (a, b) => a.miles - b.miles || b.open - a.open,
      avail: (a, b) => b.open - a.open || a.miles - b.miles,
      name: (a, b) => a.city.localeCompare(b.city) || a.miles - b.miles,
    };
    list.sort(sorters[state.sort]);
    $('#resultCount').textContent = `${list.length} deal${list.length === 1 ? '' : 's'}${state.day ? ` available on ${state.day} Nov` : ''}`;
    $('#results').innerHTML = list.length ? list.map(card).join('') : '<div class="empty">No deals match these filters. Try another date or cabin.</div>';
  }

  // ---------- round-trip planner ----------
  const pairs = new Map();
  routes.forEach((r) => {
    const back = routes.some((x) => x.origin === r.dest && x.dest === r.origin);
    if (!back) return;
    const [a, b] = r.origin === 'Singapore' ? [r.origin, r.dest] : r.dest === 'Singapore' ? [r.dest, r.origin] : [r.origin, r.dest].sort();
    pairs.set(`${a}|${b}`, { a, b });
  });
  const pairList = [...pairs.values()].sort((x, y) => (x.a !== 'Singapore') - (y.a !== 'Singapore') || x.b.localeCompare(y.b));
  const p = { pair: null, outCabin: null, retCabin: null, out: null, ret: null };

  $('#pCity').innerHTML = pairList.map((x, i) => `<option value="${i}">${esc(x.a)} ⇄ ${esc(x.b)}</option>`).join('');
  const leg = (from, to, cabin) => routes.find((r) => r.origin === from && r.dest === to && r.cabin === cabin);
  const cabinsFor = (from, to) => routes.filter((r) => r.origin === from && r.dest === to).sort((a, b) => a.miles - b.miles);

  function fillCabins(sel, from, to) {
    const opts = cabinsFor(from, to);
    sel.innerHTML = opts.map((r) => `<option value="${esc(r.cabin)}">${esc(r.cabin)} · ${fmt(r.miles)}</option>`).join('');
    return opts[0].cabin;
  }

  function selectPair(i) {
    p.pair = pairList[i];
    p.out = p.ret = null;
    p.outCabin = fillCabins($('#pOutCabin'), p.pair.a, p.pair.b);
    p.retCabin = fillCabins($('#pRetCabin'), p.pair.b, p.pair.a);
    renderPlanner();
  }

  function calendar(el, r, picked, minDay, other) {
    const bo = new Set(r.blackout);
    let html = WD.map((w) => `<span class="wd">${w[0]}</span>`).join('');
    html += '<span></span>'.repeat(weekday(1));
    for (let d = 1; d <= DAYS; d++) {
      const dis = bo.has(d) || (minDay && d < minDay);
      const between = p.out && p.ret && d > p.out && d < p.ret;
      html += `<button data-d="${d}" ${dis ? 'disabled' : ''} aria-pressed="${picked === d}" class="${between ? 'between' : ''}" title="${d} Nov${bo.has(d) ? ' · blackout' : ''}">${d}</button>`;
    }
    el.innerHTML = html;
  }

  function renderPlanner() {
    const { a, b } = p.pair;
    const out = leg(a, b, p.outCabin), ret = leg(b, a, p.retCabin);
    $('#pOutTitle').textContent = `${a} → ${b} · ${out.flights.join(', ')}`;
    $('#pRetTitle').textContent = `${b} → ${a} · ${ret.flights.join(', ')}`;
    if (p.ret && p.out && p.ret < p.out) p.ret = null;
    calendar($('#pOutCal'), out, p.out, null);
    calendar($('#pRetCal'), ret, p.ret, p.out);
    const total = out.miles + ret.miles;
    let note;
    if (p.out && p.ret) {
      const nights = p.ret - p.out;
      note = `${WD[weekday(p.out)]} ${p.out} Nov → ${WD[weekday(p.ret)]} ${p.ret} Nov · ${nights} night${nights === 1 ? '' : 's'}. Taxes and fees are extra.`;
    } else if (p.out) note = 'Now pick a return date.';
    else note = 'Pick an outbound date. Greyed-out days are blackout dates.';
    $('#pSummary').innerHTML = `
      <div><div class="meta">Outbound</div><b>${fmt(out.miles)}</b> miles</div>
      <div><div class="meta">Return</div><b>${fmt(ret.miles)}</b> miles</div>
      <div><div class="meta">Round trip, per person</div><span class="tot">${fmt(total)}</span> miles</div>
      <p class="note">${note}</p>`;
  }

  $('#pCity').addEventListener('change', (e) => selectPair(+e.target.value));
  $('#pOutCabin').addEventListener('change', (e) => { p.outCabin = e.target.value; p.out = p.ret = null; renderPlanner(); });
  $('#pRetCabin').addEventListener('change', (e) => { p.retCabin = e.target.value; p.ret = null; renderPlanner(); });
  $('#pOutCal').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (b && !b.disabled) { p.out = +b.dataset.d; renderPlanner(); }
  });
  $('#pRetCal').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (b && !b.disabled) { p.ret = +b.dataset.d; renderPlanner(); }
  });

  // ---------- tab highlight ----------
  const tabs = [...document.querySelectorAll('.tabs a')];
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) tabs.forEach((t) => t.classList.toggle('active', t.getAttribute('href') === `#${en.target.id}`));
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  document.querySelectorAll('main section').forEach((s) => io.observe(s));

  render();
  if (pairList.length) selectPair(0);
})();
