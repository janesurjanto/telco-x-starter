// Telco X — server endpoint tests
// Covers: all 8 endpoints, isActive guard, 404 paths, AC1–AC8 assertions

const request = require('supertest');
const app = require('../server');

// ── fixtures ──────────────────────────────────────────────────────────────────
const ACTIVE_ID     = 'LOC-001';  // Brunswick — FTTP, active subscriber
const ACTIVE_ID_2   = 'LOC-002';  // Carlton — HFC, upgrade_eligible = true
const PREV_ID       = 'LOC-005';  // Northcote — FTTC, previously connected
const NEVER_ID      = 'LOC-007';  // Williamstown — FTTP, never connected
const UNKNOWN_ID    = 'LOC-999';  // does not exist

// ── Tool 1 — Locations ────────────────────────────────────────────────────────

describe('GET /api/locations', () => {
  it('returns all 10 locations when no query is given (AC1)', async () => {
    const res = await request(app).get('/api/locations');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(10);
  });

  it('filters by address keyword', async () => {
    const res = await request(app).get('/api/locations?q=Brunswick');
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].suburb).toBe('Brunswick');
  });

  it('filters by postcode', async () => {
    const res = await request(app).get('/api/locations?q=3056');
    expect(res.status).toBe(200);
    expect(res.body.every(l => l.postcode === '3056')).toBe(true);
  });

  it('returns connection_status in each result', async () => {
    const res = await request(app).get('/api/locations');
    expect(res.status).toBe(200);
    res.body.forEach(l => {
      expect(['active', 'previous', 'never']).toContain(l.connection_status);
    });
  });

  it('returns empty array for no matches', async () => {
    const res = await request(app).get('/api/locations?q=ZZZNOTREAL');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(0);
  });
});

describe('GET /api/locations/:id', () => {
  it('returns a location with coordinates (AC3 — map pin)', async () => {
    const res = await request(app).get(`/api/locations/${ACTIVE_ID}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(ACTIVE_ID);
    expect(typeof res.body.latitude).toBe('number');
    expect(typeof res.body.longitude).toBe('number');
  });

  it('returns 404 with helpful message for unknown id (AC2)', async () => {
    const res = await request(app).get(`/api/locations/${UNKNOWN_ID}`);
    expect(res.status).toBe(404);
    expect(res.body.error).toBeDefined();
    expect(res.body.message).toBeDefined();
    expect(typeof res.body.message).toBe('string');
    expect(res.body.message.length).toBeGreaterThan(10);
  });
});

// ── Tool 2 — Technology ───────────────────────────────────────────────────────

describe('GET /api/locations/:id/technology', () => {
  it('returns technology for a valid location', async () => {
    const res = await request(app).get(`/api/locations/${ACTIVE_ID}/technology`);
    expect(res.status).toBe(200);
    expect(res.body.technology).toBe('FTTP');
    expect(typeof res.body.max_speed_mbps).toBe('number');
  });

  it('returns 404 for an unknown location', async () => {
    const res = await request(app).get(`/api/locations/${UNKNOWN_ID}/technology`);
    expect(res.status).toBe(404);
    expect(res.body.error).toBeDefined();
  });

  it('works for a non-active location too', async () => {
    const res = await request(app).get(`/api/locations/${PREV_ID}/technology`);
    expect(res.status).toBe(200);
    expect(res.body.technology).toBeDefined();
  });
});

// ── Tool 3 — Products ─────────────────────────────────────────────────────────

describe('GET /api/technology/:tech/products', () => {
  it('returns FTTP product list (AC5)', async () => {
    const res = await request(app).get('/api/technology/FTTP/products');
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    res.body.forEach(p => {
      expect(p.product_id).toBeDefined();
      expect(typeof p.down_mbps).toBe('number');
      expect(typeof p.up_mbps).toBe('number');
    });
  });

  it('returns products for all five technologies', async () => {
    const techs = ['FTTP', 'HFC', 'FTTN', 'FTTC', 'Fixed Wireless'];
    for (const tech of techs) {
      const res = await request(app).get(`/api/technology/${encodeURIComponent(tech)}/products`);
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
    }
  });

  it('returns 404 for an unknown technology', async () => {
    const res = await request(app).get('/api/technology/UNKNOWN/products');
    expect(res.status).toBe(404);
    expect(res.body.error).toBeDefined();
  });
});

// ── Tool 4 — Subscriber (isActive guard) ──────────────────────────────────────

describe('GET /api/locations/:id/subscriber', () => {
  it('returns subscriber for an active location (AC4)', async () => {
    const res = await request(app).get(`/api/locations/${ACTIVE_ID}/subscriber`);
    expect(res.status).toBe(200);
    expect(res.body.account_ref).toBeDefined();
    expect(res.body.current_product_name).toBeDefined();
    expect(typeof res.body.upgrade_eligible).toBe('boolean');
  });

  it('returns upgrade_eligible=false for LOC-001 (no upgrade card)', async () => {
    const res = await request(app).get(`/api/locations/${ACTIVE_ID}/subscriber`);
    expect(res.status).toBe(200);
    expect(res.body.upgrade_eligible).toBe(false);
  });

  it('returns upgrade_eligible=true for LOC-002 (show upgrade card)', async () => {
    const res = await request(app).get(`/api/locations/${ACTIVE_ID_2}/subscriber`);
    expect(res.status).toBe(200);
    expect(res.body.upgrade_eligible).toBe(true);
  });

  it('returns 404 for a previous-connection address — isActive guard (AC4)', async () => {
    const res = await request(app).get(`/api/locations/${PREV_ID}/subscriber`);
    expect(res.status).toBe(404);
    expect(res.body.error).toBeDefined();
  });

  it('returns 404 for a never-connected address — isActive guard (AC4)', async () => {
    const res = await request(app).get(`/api/locations/${NEVER_ID}/subscriber`);
    expect(res.status).toBe(404);
    expect(res.body.error).toBeDefined();
  });

  it('returns 404 for unknown id', async () => {
    const res = await request(app).get(`/api/locations/${UNKNOWN_ID}/subscriber`);
    expect(res.status).toBe(404);
  });
});

// ── Tool 5 — Network (active only) ────────────────────────────────────────────

describe('GET /api/locations/:id/network', () => {
  it('returns network record with RAG status for active (AC4)', async () => {
    const res = await request(app).get(`/api/locations/${ACTIVE_ID}/network`);
    expect(res.status).toBe(200);
    expect(['green', 'amber', 'red']).toContain(res.body.network_status);
    expect(typeof res.body.sync_down_mbps).toBe('number');
    expect(typeof res.body.latency_ms).toBe('number');
  });

  it('returns 404 for a previous-connection address', async () => {
    const res = await request(app).get(`/api/locations/${PREV_ID}/network`);
    expect(res.status).toBe(404);
  });

  it('returns 404 for a never-connected address', async () => {
    const res = await request(app).get(`/api/locations/${NEVER_ID}/network`);
    expect(res.status).toBe(404);
  });

  it('returns 404 for unknown id', async () => {
    const res = await request(app).get(`/api/locations/${UNKNOWN_ID}/network`);
    expect(res.status).toBe(404);
  });

  it('RAG statuses span green/amber/red across the four active locations', async () => {
    const activeIds = ['LOC-001', 'LOC-002', 'LOC-003', 'LOC-004'];
    const statuses = await Promise.all(
      activeIds.map(id =>
        request(app).get(`/api/locations/${id}/network`).then(r => r.body.network_status)
      )
    );
    expect(statuses).toContain('green');
    expect(statuses).toContain('amber');
    expect(statuses).toContain('red');
  });
});

// ── Tool 6 — Service (active only) ────────────────────────────────────────────

describe('GET /api/locations/:id/service', () => {
  it('returns service record with RAG status for active (AC4)', async () => {
    const res = await request(app).get(`/api/locations/${ACTIVE_ID}/service`);
    expect(res.status).toBe(200);
    expect(['green', 'amber', 'red']).toContain(res.body.service_health);
    expect(typeof res.body.open_tickets).toBe('number');
    expect(res.body.last_appointment).toBeDefined();
  });

  it('returns 404 for a previous-connection address', async () => {
    const res = await request(app).get(`/api/locations/${PREV_ID}/service`);
    expect(res.status).toBe(404);
  });

  it('returns 404 for a never-connected address', async () => {
    const res = await request(app).get(`/api/locations/${NEVER_ID}/service`);
    expect(res.status).toBe(404);
  });

  it('returns 404 for unknown id', async () => {
    const res = await request(app).get(`/api/locations/${UNKNOWN_ID}/service`);
    expect(res.status).toBe(404);
  });
});

// ── Tool 7 — Providers ────────────────────────────────────────────────────────

describe('GET /api/technology/:tech/providers', () => {
  // AC8 (now AC7 in BRD): count + names must match Tool 7 exactly
  const expectedCounts = {
    'FTTP': 5,
    'HFC': 4,
    'FTTN': 3,
    'FTTC': 4,
    'Fixed Wireless': 2
  };

  Object.entries(expectedCounts).forEach(([tech, count]) => {
    it(`returns exactly ${count} providers for ${tech} (AC7 — BR-17/18)`, async () => {
      const res = await request(app).get(`/api/technology/${encodeURIComponent(tech)}/providers`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(count);
    });
  });

  it('returns provider names as strings (BR-17 — no truncation)', async () => {
    const res = await request(app).get('/api/technology/FTTP/providers');
    expect(res.status).toBe(200);
    expect(res.body).toContain('Aurora Telecom');
    expect(res.body).toContain('BlueWave');
    expect(res.body).toContain('Corelink');
    expect(res.body).toContain('Meridian Net');
    expect(res.body).toContain('Skyline Broadband');
  });

  it('returns correct providers for Fixed Wireless', async () => {
    const res = await request(app).get('/api/technology/Fixed%20Wireless/providers');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body).toContain('Aurora Telecom');
    expect(res.body).toContain('Skyline Broadband');
  });

  it('returns 404 for unknown technology', async () => {
    const res = await request(app).get('/api/technology/SATELLITE/providers');
    expect(res.status).toBe(404);
    expect(res.body.error).toBeDefined();
  });
});

// ── Status mix verification (AC10) ────────────────────────────────────────────

describe('Dataset status mix (AC10 — at least one active + one non-active)', () => {
  it('has at least one active location', async () => {
    const res = await request(app).get('/api/locations');
    const active = res.body.filter(l => l.connection_status === 'active');
    expect(active.length).toBeGreaterThanOrEqual(1);
  });

  it('has at least one non-active location', async () => {
    const res = await request(app).get('/api/locations');
    const nonActive = res.body.filter(l => l.connection_status !== 'active');
    expect(nonActive.length).toBeGreaterThanOrEqual(1);
  });

  it('dataset contains exactly 4 active, 3 previous, 3 never addresses', async () => {
    const res = await request(app).get('/api/locations');
    const active   = res.body.filter(l => l.connection_status === 'active');
    const previous = res.body.filter(l => l.connection_status === 'previous');
    const never    = res.body.filter(l => l.connection_status === 'never');
    expect(active).toHaveLength(4);
    expect(previous).toHaveLength(3);
    expect(never).toHaveLength(3);
  });
});
