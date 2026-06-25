// Page 3 — Details / Providers.
// Two modes:
//   mode=network   → full network + service + subscriber summary (active only)
//   mode=upgrade   → plans above the current one (active only)
//   mode=providers → provider list from Tool 7 for a chosen plan

(async () => {
  const params  = new URLSearchParams(location.search);
  const id      = params.get('id');
  const mode    = params.get('mode');

  // ── back navigation (BR-19/20): history.back() restores result page state
  document.getElementById('back').addEventListener('click', e => {
    e.preventDefault();
    history.back();
  });

  if (!id || !mode) {
    location.replace('/index.html');
    return;
  }

  // ── helpers ────────────────────────────────────────────────

  function rag(status, label) {
    return `<span class="tx-rag tx-rag--${status}" aria-label="${label} status: ${status}">
              <span class="tx-rag__dot" aria-hidden="true"></span>${label}
            </span>`;
  }

  function connBadge(status) {
    const map = {
      active:   { cls: 'active',   icon: '✓', label: 'Active subscriber' },
      previous: { cls: 'previous', icon: '◐', label: 'Previously connected' },
      never:    { cls: 'never',    icon: '○', label: 'Never connected' }
    };
    const m = map[status] || map.never;
    return `<span class="tx-conn-badge tx-conn-badge--${m.cls}">
              <span aria-hidden="true">${m.icon}</span>${m.label}
            </span>`;
  }

  function fmtDate(d) {
    if (!d) return 'None';
    return new Date(d).toLocaleDateString('en-AU', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  }

  function el(tag, cls) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    return e;
  }

  function section(parent, label) {
    const s = el('p', 'tx-section-label');
    s.textContent = label;
    parent.appendChild(s);
  }

  function card(parent) {
    const c = el('div', 'tx-card');
    parent.appendChild(c);
    return c;
  }

  function statusRow(parent, label, valueHTML) {
    const row = el('div', 'tx-status-row');
    row.innerHTML = `<span class="tx-status-row__label">${label}</span><span>${valueHTML}</span>`;
    parent.appendChild(row);
  }

  // ── fetch location ──────────────────────────────────────────

  let loc;
  try { loc = await API.getLocation(id); }
  catch {
    document.getElementById('title').textContent = 'Address not found';
    document.getElementById('content').innerHTML =
      `<p class="tx-error" role="alert">We couldn't find that address. <a href="/index.html">Back to search</a></p>`;
    return;
  }

  // ── breadcrumb ──────────────────────────────────────────────
  const breadcrumb = el('div', 'tx-breadcrumb');
  breadcrumb.innerHTML =
    `<span class="tx-muted" style="font-size:12px">${loc.address}, ${loc.suburb}</span>
     ${connBadge(loc.connection_status)}`;
  document.getElementById('content').before(breadcrumb);

  // ══════════════════════════════════════════════════════════
  // MODE: providers — Tool 7 provider list for a chosen plan
  // ══════════════════════════════════════════════════════════

  if (mode === 'providers') {
    const tech    = params.get('tech');
    const pname   = params.get('pname')   || 'Selected plan';
    const down    = params.get('down')    || '—';
    const up      = params.get('up')      || '—';

    document.title = `Telco X — ${pname} providers`;
    document.getElementById('title').textContent = `${pname} plan`;

    // Plan header
    const planHeader = el('div', 'tx-plan-header');
    planHeader.innerHTML = `
      <span class="tx-plan-speed">${down} <small>Mbps ↓</small></span>
      <span class="tx-muted" style="font-size:16px">${up} Mbps ↑</span>
      <span class="tx-tech-tag"><span aria-hidden="true">📡</span> ${tech}</span>`;
    document.getElementById('content').appendChild(planHeader);

    let providers;
    try { providers = await API.getProviders(tech); }
    catch {
      document.getElementById('content').innerHTML +=
        `<p class="tx-error" role="alert">Could not load providers. Try again.</p>`;
      return;
    }

    // BR-17/18: provider names and count from Tool 7 — no mutation
    section(document.getElementById('content'),
      `${providers.length} provider${providers.length !== 1 ? 's' : ''} for this plan`);
    const provCard = card(document.getElementById('content'));
    provCard.innerHTML = providers.map(name => `
      <div class="tx-provider-row">
        <div>
          <div class="tx-provider-row__name">${name}</div>
          <div class="tx-provider-row__plan">${pname} · ${down}/${up} Mbps · ${tech}</div>
        </div>
        <button class="tx-btn tx-btn--sm tx-btn--aqua"
                aria-label="Sign up with ${name} for the ${pname} plan"
                data-provider="${name}">
          Sign up
        </button>
      </div>`).join('');

    // Sign-up confirmation (prototype — no real submission)
    provCard.querySelectorAll('[data-provider]').forEach(btn => {
      btn.addEventListener('click', () => {
        const prov = btn.dataset.provider;
        showModal(`Sign up with ${prov}`,
          `<strong>${prov}</strong> can set up your connection at this address.<br>
           This is a prototype — no real submission is made.`);
      });
    });

    // Info chip confirming data source
    const chip = el('div', 'tx-info-chip');
    chip.style.marginTop = '20px';
    chip.innerHTML = `<span aria-hidden="true">💡</span>
      Provider count for ${tech}: <strong>${providers.length}</strong> — sourced from tool7_providers.json.`;
    document.getElementById('content').appendChild(chip);

    return;
  }

  // ══════════════════════════════════════════════════════════
  // Active-only modes: must have active status
  // ══════════════════════════════════════════════════════════

  if (loc.connection_status !== 'active') {
    document.getElementById('title').textContent = 'Not available';
    document.getElementById('content').innerHTML =
      `<p class="tx-error" role="alert">This information is only available for active subscribers.</p>
       <a href="/result.html?id=${id}" class="tx-btn tx-btn--ghost" style="margin-top:16px;display:inline-flex">
         ← Back to address
       </a>`;
    return;
  }

  // Fetch Tools 2, 3, 4, 5, 6 for active modes
  const [tech, subscriber, network, service] = await Promise.all([
    API.getTechnology(id),
    API.getSubscriber(id),
    API.getNetwork(id),
    API.getService(id)
  ]);

  // ══════════════════════════════════════════════════════════
  // MODE: network — full network + service + connection summary
  // ══════════════════════════════════════════════════════════

  if (mode === 'network') {
    document.title = `Telco X — Network details`;
    document.getElementById('title').textContent = 'Network & service details';
    const content = document.getElementById('content');

    section(content, 'Network performance');
    const netCard = card(content);
    const netHeader = el('div', 'tx-card-row');
    netHeader.innerHTML = `<span style="font-weight:700;font-size:16px">Network health</span>${rag(network.network_status, 'Network')}`;
    netCard.appendChild(netHeader);

    const stats = el('div', 'tx-stat-row');
    stats.innerHTML = `
      <div class="tx-stat">
        <div class="tx-stat__val">${network.sync_down_mbps}<span> Mbps</span></div>
        <div class="tx-stat__label">Download sync</div>
      </div>
      <div class="tx-stat">
        <div class="tx-stat__val">${network.sync_up_mbps}<span> Mbps</span></div>
        <div class="tx-stat__label">Upload sync</div>
      </div>
      <div class="tx-stat">
        <div class="tx-stat__val">${network.latency_ms}<span> ms</span></div>
        <div class="tx-stat__label">Latency</div>
      </div>`;
    netCard.appendChild(el('div', 'tx-divider'));
    netCard.appendChild(stats);
    netCard.appendChild(el('div', 'tx-divider'));
    const outageRow = el('div', 'tx-status-row');
    outageRow.innerHTML = `
      <span class="tx-status-row__label">Last outage detected</span>
      <span style="font-weight:600;color:${network.last_outage ? 'var(--rag-amber)' : 'var(--rag-green)'}">
        ${fmtDate(network.last_outage)}
      </span>`;
    netCard.appendChild(outageRow);

    section(content, 'Service records');
    const svcCard = card(content);
    const svcHeader = el('div', 'tx-card-row');
    svcHeader.innerHTML = `<span style="font-weight:700;font-size:16px">Service health</span>${rag(service.service_health, 'Service')}`;
    svcCard.appendChild(svcHeader);
    const ticketRow = el('div', 'tx-status-row');
    ticketRow.innerHTML = `
      <span class="tx-status-row__label">Open support tickets</span>
      <span style="font-weight:600;color:${service.open_tickets > 0 ? 'var(--rag-amber)' : 'var(--rag-green)'}">
        ${service.open_tickets === 0 ? 'None' : service.open_tickets}
      </span>`;
    svcCard.appendChild(ticketRow);
    const apptRow = el('div', 'tx-status-row');
    apptRow.innerHTML = `
      <span class="tx-status-row__label">Last technician appointment</span>
      <span style="font-weight:600">${fmtDate(service.last_appointment)}</span>`;
    svcCard.appendChild(apptRow);

    section(content, 'Connection summary');
    const connCard = card(content);
    connCard.innerHTML = `
      <div class="tx-status-row">
        <span class="tx-status-row__label">Technology</span>
        <span class="tx-tech-tag" style="font-size:12px"><span aria-hidden="true">📡</span> ${tech.technology}</span>
      </div>
      <div class="tx-status-row">
        <span class="tx-status-row__label">Maximum speed</span>
        <span style="font-weight:600">${tech.max_speed_mbps} Mbps</span>
      </div>
      <div class="tx-status-row">
        <span class="tx-status-row__label">Current plan</span>
        <span style="font-weight:600">${subscriber.current_product_name}</span>
      </div>
      <div class="tx-status-row" style="border-bottom:none">
        <span class="tx-status-row__label">Account reference</span>
        <span style="font-weight:600;color:var(--tx-muted)">${subscriber.account_ref}</span>
      </div>`;
    return;
  }

  // ══════════════════════════════════════════════════════════
  // MODE: upgrade — plans above the current product
  // ══════════════════════════════════════════════════════════

  if (mode === 'upgrade') {
    document.title = 'Telco X — Upgrade your plan';
    document.getElementById('title').textContent = 'Upgrade your plan';

    const products = await API.getProducts(tech.technology);
    const currentIdx = products.findIndex(p => p.product_id === subscriber.current_product_id);
    const upgrades = currentIdx >= 0 ? products.slice(currentIdx + 1) : [];

    const content = document.getElementById('content');
    const sub = el('p', 'tx-muted');
    sub.style.marginBottom = '24px';
    sub.innerHTML = `You're currently on <strong>${subscriber.current_product_name}</strong>. Faster plans available on your ${tech.technology} connection:`;
    content.appendChild(sub);

    section(content, 'Upgrade options');

    if (!upgrades.length) {
      const empty = el('div', 'tx-empty');
      empty.innerHTML = `
        <div class="tx-empty__icon" aria-hidden="true">✓</div>
        <div class="tx-empty__title">You're already on the fastest plan</div>`;
      content.appendChild(empty);
      return;
    }

    const grid = el('div', 'tx-grid-2');
    upgrades.forEach(p => {
      const pcard = el('div', 'tx-product-card');
      pcard.setAttribute('tabindex', '0');
      pcard.setAttribute('role', 'button');
      pcard.setAttribute('aria-label', `Upgrade to ${p.name} — ${p.down_mbps} Mbps download`);
      pcard.innerHTML = `
        <div>
          <div class="tx-product-card__name">${p.name}</div>
          <span class="tx-product-card__tech">${tech.technology}</span>
        </div>
        <div class="tx-product-card__speed">${p.down_mbps} <small>Mbps ↓</small></div>
        <div class="tx-product-card__meta">${p.up_mbps} Mbps ↑ · Up to ${tech.max_speed_mbps} Mbps</div>
        <button class="tx-btn tx-btn--sm tx-btn--aqua">Select upgrade</button>`;
      const confirm = () => showModal(
        `Upgrade to ${p.name}`,
        `This would upgrade your ${tech.technology} connection to <strong>${p.down_mbps}/${p.up_mbps} Mbps</strong>.<br>
         Contact your provider to complete the upgrade. This prototype does not submit real requests.`
      );
      pcard.querySelector('button').addEventListener('click', e => { e.stopPropagation(); confirm(); });
      pcard.addEventListener('click', confirm);
      pcard.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); confirm(); }
      });
      grid.appendChild(pcard);
    });
    content.appendChild(grid);
    return;
  }

  // Unknown mode fallback
  location.replace(`/result.html?id=${id}`);

  // ── modal helper ────────────────────────────────────────────

  function showModal(title, body) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = body;
    document.getElementById('tx-modal').classList.add('open');
    document.getElementById('modal-close').focus();
  }

})();
