// Worked example tests for Tool 1. The Tester extends the skipped path matrix below.
const request = require('supertest');
const app = require('../server');

describe('Tool 1 — Locations (worked example)', () => {
  test('returns all ten addresses', async () => {
    const res = await request(app).get('/api/locations');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(10);
  });

  test('search narrows results by suburb', async () => {
    const res = await request(app).get('/api/locations?q=brunswick');
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body.every(l => /brunswick/i.test(l.suburb))).toBe(true);
  });

  test('unknown address returns a helpful 404', async () => {
    const res = await request(app).get('/api/locations/LOC-999');
    expect(res.status).toBe(404);
    expect(res.body.message).toBeTruthy();
  });

  test('known address includes coordinates for the map pin', async () => {
    const res = await request(app).get('/api/locations/LOC-001');
    expect(res.status).toBe(200);
    expect(typeof res.body.latitude).toBe('number');
    expect(typeof res.body.longitude).toBe('number');
  });
});

// ---------------------------------------------------------------
// TESTER TODO — build out the path matrix (remove .skip to activate)
// Covers the negative business rules and the Tool 7 provider counts.
// ---------------------------------------------------------------
describe.skip('Path matrix (Tester to implement)', () => {
  test('non-active location does not expose subscriber records', async () => {
    // const res = await request(app).get('/api/locations/LOC-005/subscriber');
    // expect([403, 404]).toContain(res.status);
  });
  test('upgrade card hidden when upgrade_eligible is false (LOC-001)', async () => {});
  test('provider count matches Tool 7 for FTTP (expect 5)', async () => {});
});
