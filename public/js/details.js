// Page 3 — Details / Providers.
// Four modes driven by ?mode= in the URL:
//   mode=details   → full subscriber + network + service view (active only)
//   mode=providers → provider list from Tool 7 for a chosen plan
//   mode=network   → network & service deep-dive + connection summary (active only)
//   mode=upgrade   → plans above the subscriber's current product (active only)
//
// Back button: history.back() so result.html scroll + state is restored (BR-19/20).

(async () => {
  const params = new URLSearchParams(location.search);
  const id     = params.get('id');
  const mode   = params.get('mode');

  // ── modal — defined first so every mode below can call it ──────────────────
  function showModal(title, body) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML    = body;
    const m = document.getElementById('tx-modal');
    m.hidden = false;
    m.classList.add('open');
    document.getElementById('modal-close').focus();
  }

  // ── back button → history.back() (BR-19/20) ────────────────────────────────
  document.getElementById('back').addEventListener('click', e => {
    e.preventDefault();
    history.back();
  });

  if (!id || !mode) {
    location.replace('/index.html');
    return;
  }

  // ── shared helpers ─────────────────────────────────────────────────────────

  function rag(status, label) {
    // Coloured dot + text label — never colour alone (BR-10)
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
    return s;
  }

  function card(parent) {
    const c = el('div', 'tx-card');
    parent.appendChild(c);
    return c;
  }

  // ── fetch location (Tool 1) ────────────────────────────────────────────────

  let loc;
  try {
    loc = await API.getLocation(id);
  } catch {
    document.getElementById('title').textContent = 'Address not found';
    document.getElementById('content').innerHTML =
      `<p class="tx-error" role="alert">
         We couldn't find that address.
         <a href="/index.html">Back to search</a>
       </p>`;
    return;
  }

  // ── breadcrumb strip (appears above h1 for all modes) ─────────────────────
  const breadcrumb = el('div', 'tx-breadcrumb');
  breadcrumb.innerHTML =
    `<span class="tx-muted" style="font-size:12px">${loc.address}, ${loc.suburb}</span>
     ${connBadge(loc.connection_status)}`;
  document.getElementById('content').before(breadcrumb);

  const content = document.getElementById('content');

  // ══════════════════════════════════════════════════════════════════════════
  // MODE: providers — Tool 7 provider list for a chosen plan (non-active path)
  // ══════════════════════════════════════════════════════════════════════════

  if (mode === 'providers') {
    const tech  = params.get('tech')  || '';
    const pname = params.get('pname') || 'Selected plan';
    const down  = params.get('down')  || '—';
    const up    = params.get('up')    || '—';

    document.title = `Telco X — ${pname} providers`;
    document.getElementById('title').textContent = `${pname} plan`;

    // Plan summary header
    const planHeader = el('div', 'tx-plan-header');
    planHeader.innerHTML = `
      <span class="tx-plan-speed">${down} <small>Mbps ↓</small></span>
      <span class="tx-muted" style="font-size:16px">${up} Mbps ↑</span>
      <span class="tx-tech-tag"><span aria-hidden="true">📡</span> ${tech}</span>`;
    content.appendChild(planHeader);

    // Fetch Tool 7
    let providers;
    try {
      providers = await API.getProviders(tech);
    } catch {
      content.innerHTML +=
        `<p class="tx-error" role="alert">Could not load providers. Please try again.</p>`;
      return;
    }

    // Provider list — names and count must match tool7_providers.json exactly (BR-17/18)
    section(content,
      `${providers.length} provider${providers.length !== 1 ? 's' : ''} for this plan`);

    const provCard = card(content);
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

    provCard.querySelectorAll('[data-provider]').forEach(btn => {
      btn.addEventListener('click', () => {
        showModal(
          `Sign up with ${btn.dataset.provider}`,
          `<strong>${btn.dataset.provider}</strong> can set up your ${pname} connection
           at this address.<br>This is a prototype — no real submission is made.`
        );
      });
    });

    // Data-source confirmation chip
    const chip = el('div', 'tx-info-chip');
    chip.style.marginTop = '20px';
    chip.innerHTML =
      `<span aria-hidden="true">💡</span>
       Provider count for ${tech}: <strong>${providers.length}</strong>
       — sourced from tool7_providers.json.`;
    content.appendChild(chip);

    return;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // All remaining modes are active-only — enforce the guard
  // ══════════════════════════════════════════════════════════════════════════

  if (loc.connection_status !== 'active') {
    document.getElementById('title').textContent = 'Not available';
    content.innerHTML =
      `<p class="tx-error" role="alert">
         This information is only available for active subscribers.
       </p>
       <a href="/result.html?id=${id}"
          class="tx-btn tx-btn--ghost"
          style="margin-top:16px;display:inline-flex">
         ← Back to address
       </a>`;
    return;
  }

  // Fetch Tools 2, 4, 5, 6 in parallel (all active modes need them)
  let tech, subscriber, network, service;
  try {
    [tech, subscriber, network, service] = await Promise.all([
      API.getTechnology(id),
      API.getSubscriber(id),
      API.getNetwork(id),
      API.getService(id)
    ]);
  } catch {
    content.innerHTML =
      `<p class="tx-error" role="alert">
         Could not load account details. Please try again.
       </p>`;
    return;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // MODE: details — subscriber card + network summary + service summary
  // ══════════════════════════════════════════════════════════════════════════

  if (mode === 'details') {
    document.title = `Telco X — Account details`;
    document.getElementById('title').textContent = 'Account details';

    // ── subscriber card ──────────────────────────────────────────────────────
    section(content, 'Your plan');
    const subCard = card(content);
    subCard.innerHTML = `
      <div class="tx-card-row">
        <div>
          <div class="tx-label-small">Account reference</div>
          <div class="tx-value">${subscriber.account_ref}</div>
        </div>
        <div style="text-align:right">
          <div class="tx-label-small">Connected since</div>
          <div class="tx-value-sm">${fmtDate(subscriber.connected_since)}</div>
        </div>
      </div>
      <div class="tx-divider"></div>
      <div>
        <div class="tx-label-small">Current plan</div>
        <div class="tx-plan-name">${subscriber.current_product_name}</div>
        <div class="tx-muted" style="font-size:13px;margin-top:2px">
          ${tech.technology} · Up to ${tech.max_speed_mbps} Mbps
        </div>
      </div>`;

    // ── network summary ──────────────────────────────────────────────────────
    section(content, 'Network status');
    const netCard = card(content);
    netCard.innerHTML = `
      <div class="tx-status-row">
        <span class="tx-status-row__label">Network health</span>
        ${rag(network.network_status, 'Network')}
      </div>
      <div class="tx-status-row">
        <span class="tx-status-row__label">Download sync</span>
        <span class="tx-value-sm">
          ${network.sync_down_mbps} <span class="tx-muted">Mbps</span>
        </span>
      </div>
      <div class="tx-status-row">
        <span class="tx-status-row__label">Upload sync</span>
        <span class="tx-value-sm">
          ${network.sync_up_mbps} <span class="tx-muted">Mbps</span>
        </span>
      </div>
      <div class="tx-status-row">
        <span class="tx-status-row__label">Latency</span>
        <span class="tx-value-sm">
          ${network.latency_ms} <span class="tx-muted">ms</span>
        </span>
      </div>
      <div class="tx-status-row">
        <span class="tx-status-row__label">Last outage</span>
        <span class="tx-value-sm"
              style="color:${network.last_outage ? 'var(--rag-amber)' : 'var(--rag-green)'}">
          ${fmtDate(network.last_outage)}
        </span>
      </div>`;

    // ── service summary ──────────────────────────────────────────────────────
    section(content, 'Service status');
    const svcCard = card(content);
    svcCard.innerHTML = `
      <div class="tx-status-row">
        <span class="tx-status-row__label">Service health</span>
        ${rag(service.service_health, 'Service')}
      </div>
      <div class="tx-status-row">
        <span class="tx-status-row__label">Open tickets</span>
        <span class="tx-value-sm"
              style="color:${service.open_tickets > 0 ? 'var(--rag-amber)' : 'var(--rag-green)'}">
          ${service.open_tickets === 0 ? 'None' : service.open_tickets + ' open'}
        </span>
      </div>
      <div class="tx-status-row">
        <span class="tx-status-row__label">Last appointment</span>
        <span class="tx-value-sm">${fmtDate(service.last_appointment)}</span>
      </div>`;

    return;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // MODE: network — full performance stats + service records + connection info
  // ══════════════════════════════════════════════════════════════════════════

  if (mode === 'network') {
    document.title = 'Telco X — Network details';
    document.getElementById('title').textContent = 'Network & service details';

    // Network performance
    section(content, 'Network performance');
    const netCard = card(content);

    const netHeader = el('div', 'tx-card-row');
    netHeader.innerHTML =
      `<span style="font-weight:700;font-size:16px">Network health</span>
       ${rag(network.network_status, 'Network')}`;
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

    // Service records
    section(content, 'Service records');
    const svcCard = card(content);

    const svcHeader = el('div', 'tx-card-row');
    svcHeader.innerHTML =
      `<span style="font-weight:700;font-size:16px">Service health</span>
       ${rag(service.service_health, 'Service')}`;
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

    // Connection summary
    section(content, 'Connection summary');
    const connCard = card(content);
    connCard.innerHTML = `
      <div class="tx-status-row">
        <span class="tx-status-row__label">Technology</span>
        <span class="tx-tech-tag" style="font-size:12px">
          <span aria-hidden="true">📡</span> ${tech.technology}
        </span>
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

  // ══════════════════════════════════════════════════════════════════════════
  // MODE: upgrade — plans above the subscriber's current product (Tool 3)
  // ══════════════════════════════════════════════════════════════════════════

  if (mode === 'upgrade') {
    document.title = 'Telco X — Upgrade your plan';
    document.getElementById('title').textContent = 'Upgrade your plan';

    let products;
    try {
      products = await API.getProducts(tech.technology);
    } catch {
      content.innerHTML =
        `<p class="tx-error" role="alert">Could not load plans. Please try again.</p>`;
      return;
    }

    const currentIdx = products.findIndex(p => p.product_id === subscriber.current_product_id);
    const upgrades   = currentIdx >= 0 ? products.slice(currentIdx + 1) : [];

    const sub = el('p', 'tx-muted');
    sub.style.marginBottom = '24px';
    sub.innerHTML =
      `You're currently on <strong>${subscriber.current_product_name}</strong>.
       Faster plans available on your ${tech.technology} connection:`;
    content.appendChild(sub);

    if (!upgrades.length) {
      const empty = el('div', 'tx-empty');
      empty.innerHTML = `
        <div class="tx-empty__icon" aria-hidden="true">✓</div>
        <div class="tx-empty__title">You're already on the fastest plan</div>`;
      content.appendChild(empty);
      return;
    }

    section(content, 'Upgrade options');
    const grid = el('div', 'tx-grid-2');

    upgrades.forEach(p => {
      const pcard = el('div', 'tx-product-card');
      pcard.setAttribute('tabindex', '0');
      pcard.setAttribute('role', 'button');
      pcard.setAttribute('aria-label',
        `Upgrade to ${p.name} — ${p.down_mbps} Mbps download`);
      pcard.innerHTML = `
        <div>
          <div class="tx-product-card__name">${p.name}</div>
          <span class="tx-product-card__tech">${tech.technology}</span>
        </div>
        <div class="tx-product-card__speed">${p.down_mbps} <small>Mbps ↓</small></div>
        <div class="tx-product-card__meta">
          ${p.up_mbps} Mbps ↑ · Up to ${tech.max_speed_mbps} Mbps
        </div>
        <button class="tx-btn tx-btn--sm tx-btn--aqua">Select upgrade</button>`;

      const confirm = () => showModal(
        `Upgrade to ${p.name}`,
        `This would upgrade your ${tech.technology} connection to
         <strong>${p.down_mbps}/${p.up_mbps} Mbps</strong>.<br>
         Contact your provider to complete the upgrade.
         This prototype does not submit real requests.`
      );
      pcard.querySelector('button').addEventListener('click', e => {
        e.stopPropagation();
        confirm();
      });
      pcard.addEventListener('click', confirm);
      pcard.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); confirm(); }
      });
      grid.appendChild(pcard);
    });

    content.appendChild(grid);
    return;
  }

  // Unknown mode — fall back to result page
  location.replace(`/result.html?id=${id}`);

})();
