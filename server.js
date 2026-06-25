// Telco X — service availability prototype (STARTER)
// Two endpoints are fully worked as examples. The rest are guided TODOs —
// connecting Tools 2–7 is the build challenge. Each TODO returns 501 with a hint.

const express = require('express');
const path = require('path');
const data = require('./lib/data');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ============================================================
// WORKED EXAMPLE — Tool 1 (Locations). Search + select + helpful error.
// ============================================================

// AC1: all ten addresses can be searched/selected. Optional ?q= filter.
app.get('/api/locations', (req, res) => {
  const q = (req.query.q || '').toLowerCase().trim();
  const match = (l) => `${l.address} ${l.suburb} ${l.state} ${l.postcode}`.toLowerCase().includes(q);
  const results = q ? data.locations.filter(match) : data.locations;
  res.json(results.map(({ id, address, suburb, state, postcode }) =>
    ({ id, address, suburb, state, postcode })));
});

// AC2/AC3: select one address; unknown id returns a helpful error.
app.get('/api/locations/:id', (req, res) => {
  const location = data.getLocation(req.params.id);
  if (!location) {
    return res.status(404).json({
      error: 'Address not found',
      message: 'We could not find that address. Check the details and try again.'
    });
  }
  res.json(location); // includes coordinates for the map pin + connection_status
});

// ============================================================
// TODO — connect Tools 2–6 (build phase: 35–105 min)
// ============================================================

// Tool 2 — technology for a location (drives the valid product set).
app.get('/api/locations/:id/technology', (req, res) => {
  res.status(501).json({ error: 'Not implemented',
    hint: 'Return data.getTechnology(req.params.id); 404 if the location is unknown.' });
});

// Tool 3 — valid products for a technology (AC5).
app.get('/api/technology/:tech/products', (req, res) => {
  res.status(501).json({ error: 'Not implemented',
    hint: 'Return data.getProductsForTechnology(req.params.tech).' });
});

// Tool 4 — subscriber record. ACTIVE ONLY. Respect upgrade_eligible (AC4).
app.get('/api/locations/:id/subscriber', (req, res) => {
  res.status(501).json({ error: 'Not implemented',
    hint: 'Guard with data.isActive(id) first. Non-active must not return records. Then data.getSubscriber(id).' });
});

// Tool 5 — network record. ACTIVE ONLY. network_status is RAG (AC4).
app.get('/api/locations/:id/network', (req, res) => {
  res.status(501).json({ error: 'Not implemented',
    hint: 'ACTIVE only. data.getNetwork(id).' });
});

// Tool 6 — service record. ACTIVE ONLY. service_health is RAG (AC4).
app.get('/api/locations/:id/service', (req, res) => {
  res.status(501).json({ error: 'Not implemented',
    hint: 'ACTIVE only. data.getService(id).' });
});

// ============================================================
// TODO — connect Tool 7 (build phase: 105–135 min)
// ============================================================

// Tool 7 — providers for a technology. Count + names must match Tool 7 (AC8).
app.get('/api/technology/:tech/providers', (req, res) => {
  res.status(501).json({ error: 'Not implemented',
    hint: 'Return data.getProvidersForTechnology(req.params.tech).' });
});

const PORT = process.env.PORT || 3001;
if (require.main === module) {
  app.listen(PORT, () => console.log(`Telco X starter running on http://localhost:${PORT}`));
}
module.exports = app;
