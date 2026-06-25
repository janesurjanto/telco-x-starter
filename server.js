// Telco X — service availability prototype
// All six TODO endpoints implemented:
//   technology → products → subscriber (isActive guard) → network → service → providers

const express = require('express');
const path = require('path');
const data = require('./lib/data');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ============================================================
// WORKED — Tool 1 (Locations). Search + select + helpful error.
// ============================================================

// AC1: all ten addresses can be searched/selected. Optional ?q= filter.
app.get('/api/locations', (req, res) => {
  const q = (req.query.q || '').toLowerCase().trim();
  const match = (l) =>
    `${l.address} ${l.suburb} ${l.state} ${l.postcode}`.toLowerCase().includes(q);
  const results = q ? data.locations.filter(match) : data.locations;
  res.json(
    results.map(({ id, address, suburb, state, postcode, connection_status }) => ({
      id, address, suburb, state, postcode, connection_status
    }))
  );
});

// AC2/AC3: select one address; unknown id returns a helpful error.
app.get('/api/locations/:id', (req, res) => {
  const location = data.getLocation(req.params.id);
  if (!location) {
    return res.status(404).json({
      error: 'Address not found',
      message: "We couldn't find that address. Check the details and try again."
    });
  }
  res.json(location); // includes latitude, longitude, connection_status
});

// ============================================================
// Tool 2 — technology for a location (drives the valid product set)
// ============================================================

app.get('/api/locations/:id/technology', (req, res) => {
  const location = data.getLocation(req.params.id);
  if (!location) {
    return res.status(404).json({
      error: 'Address not found',
      message: "We couldn't find that address. Check the details and try again."
    });
  }
  const tech = data.getTechnology(req.params.id);
  if (!tech) {
    return res.status(404).json({
      error: 'Technology record not found',
      message: 'No technology record exists for this address.'
    });
  }
  res.json(tech);
});

// ============================================================
// Tool 3 — valid products for a technology (AC5)
// ============================================================

app.get('/api/technology/:tech/products', (req, res) => {
  const products = data.getProductsForTechnology(req.params.tech);
  if (!products.length) {
    return res.status(404).json({
      error: 'Technology not found',
      message: `No products found for technology: ${req.params.tech}`
    });
  }
  res.json(products);
});

// ============================================================
// Tool 4 — subscriber record. ACTIVE ONLY. isActive guard enforced.
// ============================================================

app.get('/api/locations/:id/subscriber', (req, res) => {
  const location = data.getLocation(req.params.id);
  if (!location) {
    return res.status(404).json({
      error: 'Address not found',
      message: "We couldn't find that address. Check the details and try again."
    });
  }
  // Business rule: non-active locations must never return subscriber records
  if (!data.isActive(req.params.id)) {
    return res.status(404).json({
      error: 'No subscriber record',
      message: 'This address does not have an active subscription.'
    });
  }
  const subscriber = data.getSubscriber(req.params.id);
  if (!subscriber) {
    return res.status(404).json({
      error: 'Subscriber record not found',
      message: 'Active address but no subscriber record found.'
    });
  }
  res.json(subscriber);
});

// ============================================================
// Tool 5 — network record. ACTIVE ONLY. network_status is RAG.
// ============================================================

app.get('/api/locations/:id/network', (req, res) => {
  const location = data.getLocation(req.params.id);
  if (!location) {
    return res.status(404).json({
      error: 'Address not found',
      message: "We couldn't find that address. Check the details and try again."
    });
  }
  // Business rule: only active locations have network records
  if (!data.isActive(req.params.id)) {
    return res.status(404).json({
      error: 'No network record',
      message: 'Network details are only available for active subscribers.'
    });
  }
  const networkRecord = data.getNetwork(req.params.id);
  if (!networkRecord) {
    return res.status(404).json({
      error: 'Network record not found',
      message: 'Active address but no network record found.'
    });
  }
  res.json(networkRecord);
});

// ============================================================
// Tool 6 — service record. ACTIVE ONLY. service_health is RAG.
// ============================================================

app.get('/api/locations/:id/service', (req, res) => {
  const location = data.getLocation(req.params.id);
  if (!location) {
    return res.status(404).json({
      error: 'Address not found',
      message: "We couldn't find that address. Check the details and try again."
    });
  }
  // Business rule: only active locations have service records
  if (!data.isActive(req.params.id)) {
    return res.status(404).json({
      error: 'No service record',
      message: 'Service details are only available for active subscribers.'
    });
  }
  const serviceRecord = data.getService(req.params.id);
  if (!serviceRecord) {
    return res.status(404).json({
      error: 'Service record not found',
      message: 'Active address but no service record found.'
    });
  }
  res.json(serviceRecord);
});

// ============================================================
// Tool 7 — providers for a technology. Count + names must match Tool 7.
// ============================================================

app.get('/api/technology/:tech/providers', (req, res) => {
  const providers = data.getProvidersForTechnology(req.params.tech);
  if (!providers.length) {
    return res.status(404).json({
      error: 'Technology not found',
      message: `No providers found for technology: ${req.params.tech}`
    });
  }
  res.json(providers);
});

// ============================================================
// Wi-Fi Placement Assistant — POST /api/wifi/analyse
// Currently returns mock rule-based tips derived from the
// submitted filenames and sizes.
//
// To connect a real vision model:
//   1. Accept multipart/form-data with 'modem' and 'floorplan' fields.
//   2. Forward both images to a vision API (e.g. Anthropic Claude vision,
//      Google Vision, or AWS Rekognition).
//   3. Parse the model response and map it to the tips schema below.
//   4. Return { tips: string[], confidence: 'high'|'medium'|'low' }.
// ============================================================

const multer = require('multer');
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB per file
});

app.post('/api/wifi/analyse', upload.fields([
  { name: 'modem', maxCount: 1 },
  { name: 'floorplan', maxCount: 1 }
]), (req, res) => {
  const modem     = req.files && req.files['modem']     && req.files['modem'][0];
  const floorplan = req.files && req.files['floorplan'] && req.files['floorplan'][0];

  if (!modem || !floorplan) {
    return res.status(400).json({
      error: 'Missing files',
      message: 'Please upload both a modem photo and a floorplan image.'
    });
  }

  // ── Mock analysis (replace with real vision model call) ──────────────────
  const mName = modem.originalname.toLowerCase();
  const fName = floorplan.originalname.toLowerCase();
  const totalKB = (modem.size + floorplan.size) / 1024;

  const tips = [];

  // Modem placement tip
  if (/floor|ground|carpet|low/.test(mName)) {
    tips.push('Raise the modem onto a table or shelf — placing it on the floor limits signal spread significantly.');
  } else if (/cupboard|cabinet|wardrobe|closet|enclosed/.test(mName)) {
    tips.push('Move the modem into an open area. Enclosed cupboards can reduce Wi-Fi signal strength by up to 50%.');
  } else if (/kitchen|microwave|oven|fridge/.test(mName)) {
    tips.push('Keep the modem away from kitchen appliances — microwaves and metal surfaces interfere with Wi-Fi signals.');
  } else if (/window|wall|corner|edge/.test(mName)) {
    tips.push('Move the modem away from external walls — signal is lost through the building exterior. Aim for a central position.');
  } else {
    tips.push('Current modem placement looks reasonable. Focus on height and clearing nearby obstructions.');
  }

  tips.push('Place the modem in a central location in your home where possible.');
  tips.push('Keep the modem elevated on a shelf or table rather than on the floor.');
  tips.push('Keep the modem away from microwaves, thick walls, and large metal appliances.');

  // Floorplan tip
  if (/apartment|unit|flat/.test(fName)) {
    tips.push('For an apartment, place the modem near the middle of the space, away from bathrooms and utility rooms.');
  } else if (/two.stor|2.stor|upstairs|double|level/.test(fName)) {
    tips.push('For a two-storey home, place the modem near the centre of the level where internet is used most.');
  } else if (/large|big/.test(fName)) {
    tips.push('For a larger home, consider adding a mesh Wi-Fi extender to cover distant rooms.');
  } else if (/narrow|terrace|long/.test(fName)) {
    tips.push('For a long or narrow home, avoid placing the modem at one end — a central position gives more even coverage.');
  } else {
    tips.push('If some rooms remain weak, consider adding a mesh Wi-Fi extender to boost coverage in those areas.');
  }

  const confidence = totalKB > 500 ? 'high' : totalKB > 100 ? 'medium' : 'low';

  res.json({ tips: tips.slice(0, 5), confidence });
});

const PORT = process.env.PORT || 3001;
if (require.main === module) {
  app.listen(PORT, () =>
    console.log(`Telco X running on http://localhost:${PORT}`)
  );
}
module.exports = app;
