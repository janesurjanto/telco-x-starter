// Page 2 — Address result.
// Reads ?id= from the URL, fetches all relevant tools, branches on connection_status.

(async () => {
  const params = new URLSearchParams(location.search);
  const id = params.get('id');

  // BR-19/20: no id → back to search
  if (!id) {
    location.replace('/index.html');
    return;
  }

  // ── helpers ────────────────────────────────────────────────

  function rag(status, label) {
    // RAG badge: coloured dot + text label — never colour alone (BR-10)
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

  function techTag(tech) {
    const labels = {
      FTTP: 'Fibre to the Premises',
      HFC:  'Hybrid Fibre Coaxial',
      FTTN: 'Fibre to the Node',
      FTTC: 'Fibre to the Curb',
      'Fixed Wireless': 'Fixed Wireless'
    };
    return `<span class="tx-tech-tag">
              <span aria-hidden="true">📡</span>
              ${tech}
              <span class="tx-muted" style="font-weight:400;margin-left:4px">— ${labels[tech] || tech}</span>
            </span>`;
  }

  function fmtDate(d) {
    if (!d) return 'None';
    return new Date(d).toLocaleDateString('en-AU', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  }

  function setMap(loc) {
    // BR-07: map pin at coordinates from Tool 1; accessible text alternative
    const map = document.getElementById('map');
    map.setAttribute('aria-label',
      `Map showing pin at ${loc.address}, ${loc.suburb}. Coordinates: ${loc.latitude}, ${loc.longitude}`
    );
    // offset pin slightly so it renders centred on the map grid
    const pinEl = map.querySelector('.tx-map__pin');
    if (pinEl) {
      // shift pin x by lng offset, y by lat offset (purely cosmetic — no real projection)
      const lngOff = ((loc.longitude - 144.96) * 600).toFixed(0);
      const latOff = ((loc.latitude + 37.80) * -600).toFixed(0);
      pinEl.style.transform = `translate(calc(-50% + ${lngOff}px), calc(-100% + ${latOff}px))`;
    }
    const coordEl = map.querySelector('.tx-map__label');
    if (coordEl) coordEl.textContent = `${loc.latitude.toFixed(4)}, ${loc.longitude.toFixed(4)}`;
  }

  // ── fetch location (Tool 1) ─────────────────────────────────

  let loc;
  try {
    loc = await API.getLocation(id);
  } catch (e) {
    // BR-04/05: unknown id → helpful error, stay on page
    document.getElementById('address-heading').textContent = 'Address not found';
    const content = document.getElementById('content');
    content.innerHTML = `
      <div class="tx-empty">
        <div class="tx-empty__icon" aria-hidden="true">🔍</div>
        <div class="tx-empty__title">We couldn't find that address</div>
        <p class="tx-muted" style="margin-top:8px">
          The address ID in the URL doesn't match any known address.
        </p>
        <a href="/index.html" class="tx-btn" style="margin-top:20px;display:inline-flex">
          ← Back to search
        </a>
      </div>`;
    return;
  }

  // ── render address strip (BR-06) ───────────────────────────

  document.title = `Telco X — ${loc.address}`;
  document.getElementById('address-heading').textContent = `${loc.address}, ${loc.suburb}`;
  document.getElementById('address-meta').textContent = `${loc.state} ${loc.postcode}`;
  setMap(loc);

  // ── fetch technology (Tool 2) ───────────────────────────────

  let tech;
  try {
    tech = await API.getTechnology(id);
  } catch (e) {
    document.getElementById('content').innerHTML =
      `<p class="tx-error" role="alert">Could not load technology details for this address.</p>`;
    return;
  }

  // ── branch: active vs non-active ───────────────────────────

  if (loc.connection_status === 'active') {
    await renderActive(loc, tech);
  } else {
    await renderNonActive(loc, tech);
  }

  // ════════════════════════════════════════════════════════════
  // ACTIVE branch — Tools 2, 3, 4, 5, 6
  // ════════════════════════════════════════════════════════════

  async function renderActive(loc, tech) {
    // Fetch Tools 3, 4, 5, 6 in parallel
    const [products, subscriber, network, service] = await Promise.all([
      API.getProducts(tech.technology),
      API.getSubscriber(loc.id),
      API.getNetwork(loc.id),
      API.getService(loc.id)
    ]);

    const content = document.getElementById('content');
    content.innerHTML = '';

    // ── status row ────────────────────────────────────────────
    const statusRow = el('div', 'tx-status-pills');
    statusRow.innerHTML = connBadge(loc.connection_status) + techTag(tech.technology);
    content.appendChild(statusRow);

    // ── subscriber card ───────────────────────────────────────
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

    // ── upgrade banner — only when upgrade_eligible is true ───
    if (subscriber.upgrade_eligible) {
      const banner = el('div', 'tx-upgrade-banner');
      banner.setAttribute('role', 'button');
      banner.setAttribute('tabindex', '0');
      banner.setAttribute('aria-label', 'Upgrade your plan — view options');
      banner.innerHTML = `
        <span class="tx-upgrade-banner__icon" aria-hidden="true">⚡</span>
        <div>
          <strong>You're eligible for an upgrade</strong>
          <div style="font-size:13px;color:rgba(255,255,255,.75);margin-top:3px">
            Faster plans are available at your address. View options →
          </div>
        </div>`;
      banner.addEventListener('click', () => goToDetails('upgrade', loc, tech, subscriber, products));
      banner.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); banner.click(); }
      });
      content.appendChild(banner);
    }

    // ── network status (Tool 5) ───────────────────────────────
    section(content, 'Network status');
    const netCard = card(content);
    netCard.innerHTML = `
      <div class="tx-status-row">
        <span class="tx-status-row__label">Network health</span>
        ${rag(network.network_status, 'Network')}
      </div>
      <div class="tx-status-row">
        <span class="tx-status-row__label">Download sync</span>
        <span class="tx-value-sm">${network.sync_down_mbps} <span class="tx-muted">Mbps</span></span>
      </div>
      <div class="tx-status-row">
        <span class="tx-status-row__label">Upload sync</span>
        <span class="tx-value-sm">${network.sync_up_mbps} <span class="tx-muted">Mbps</span></span>
      </div>
      <div class="tx-status-row">
        <span class="tx-status-row__label">Latency</span>
        <span class="tx-value-sm">${network.latency_ms} <span class="tx-muted">ms</span></span>
      </div>
      <div class="tx-status-row">
        <span class="tx-status-row__label">Last outage</span>
        <span class="tx-value-sm" style="color:${network.last_outage ? 'var(--rag-amber)' : 'var(--rag-green)'}">
          ${fmtDate(network.last_outage)}
        </span>
      </div>
      <div style="margin-top:16px">
        <button class="tx-btn tx-btn--ghost tx-btn--sm" id="btn-network-detail">
          View network details
        </button>
      </div>`;
    netCard.querySelector('#btn-network-detail').addEventListener('click', () =>
      goToDetails('network', loc, tech, subscriber, network, service)
    );

    // ── service status (Tool 6) ───────────────────────────────
    section(content, 'Service status');
    const svcCard = card(content);
    svcCard.innerHTML = `
      <div class="tx-status-row">
        <span class="tx-status-row__label">Service health</span>
        ${rag(service.service_health, 'Service')}
      </div>
      <div class="tx-status-row">
        <span class="tx-status-row__label">Open tickets</span>
        <span class="tx-value-sm" style="color:${service.open_tickets > 0 ? 'var(--rag-amber)' : 'var(--rag-green)'}">
          ${service.open_tickets === 0 ? 'None' : service.open_tickets + ' open'}
        </span>
      </div>
      <div class="tx-status-row">
        <span class="tx-status-row__label">Last appointment</span>
        <span class="tx-value-sm">${fmtDate(service.last_appointment)}</span>
      </div>`;
  }

  // ════════════════════════════════════════════════════════════
  // NON-ACTIVE branch — Tools 2, 3, 7
  // ════════════════════════════════════════════════════════════

  async function renderNonActive(loc, tech) {
    const [products, providers] = await Promise.all([
      API.getProducts(tech.technology),
      API.getProviders(tech.technology)
    ]);

    const content = document.getElementById('content');
    content.innerHTML = '';

    // ── status row ────────────────────────────────────────────
    const statusRow = el('div', 'tx-status-pills');
    statusRow.innerHTML = connBadge(loc.connection_status) + techTag(tech.technology);
    content.appendChild(statusRow);

    // ── info chip ─────────────────────────────────────────────
    const chip = el('div', 'tx-info-chip');
    chip.innerHTML = `<span aria-hidden="true">ℹ️</span>
      ${providers.length} provider${providers.length !== 1 ? 's' : ''} available at this address via ${tech.technology}`;
    content.appendChild(chip);

    // ── available plans (Tool 3) ──────────────────────────────
    section(content, 'Available plans');
    const grid = el('div', 'tx-grid-2');
    products.forEach(p => {
      const card = el('div', 'tx-product-card');
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', `${p.name} plan — ${p.down_mbps} Mbps download. Choose this plan.`);
      card.innerHTML = `
        <div>
          <div class="tx-product-card__name">${p.name}</div>
          <span class="tx-product-card__tech">${tech.technology}</span>
        </div>
        <div class="tx-product-card__speed">${p.down_mbps} <small>Mbps ↓</small></div>
        <div class="tx-product-card__meta">${p.up_mbps} Mbps ↑ · Up to ${tech.max_speed_mbps} Mbps</div>
        <button class="tx-btn tx-btn--sm" aria-label="Choose ${p.name} plan">Choose this plan</button>`;
      const btn = card.querySelector('button');
      const goProviders = () => {
        const qs = new URLSearchParams({
          id:      loc.id,
          mode:    'providers',
          tech:    tech.technology,
          product: p.product_id,
          pname:   p.name,
          down:    p.down_mbps,
          up:      p.up_mbps
        });
        location.href = `/details.html?${qs}`;
      };
      btn.addEventListener('click', e => { e.stopPropagation(); goProviders(); });
      card.addEventListener('click', goProviders);
      card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goProviders(); }
      });
      grid.appendChild(card);
    });
    content.appendChild(grid);

    // ── providers list (Tool 7) ───────────────────────────────
    const divider = el('div', 'tx-divider');
    content.appendChild(divider);
    section(content, `${providers.length} provider${providers.length !== 1 ? 's' : ''} offer ${tech.technology} at this address`);
    const provCard = card(content);
    provCard.innerHTML = providers.map(name => `
      <div class="tx-provider-row">
        <div>
          <div class="tx-provider-row__name">${name}</div>
          <div class="tx-provider-row__plan">${tech.technology} · ${products.length} plan${products.length !== 1 ? 's' : ''} available</div>
        </div>
        <button class="tx-btn tx-btn--ghost tx-btn--sm" aria-label="Sign up with ${name}">Sign up</button>
      </div>`).join('');
  }

  // ── navigate to details page ────────────────────────────────

  function goToDetails(mode, loc, tech, ...rest) {
    const qs = new URLSearchParams({ id: loc.id, mode });
    location.href = `/details.html?${qs}`;
  }

  // ── DOM helpers ─────────────────────────────────────────────

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

})();
