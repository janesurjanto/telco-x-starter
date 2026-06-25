// Data access layer for the seven Telco X tool files.
// This is scaffolding — the getters are provided so you can focus on
// connecting the tools to the screens, not on file plumbing.
// RULE: keep all challenge data unchanged. This layer is read-only.

const fs = require('fs');
const path = require('path');
const DATA_DIR = path.join(__dirname, '..', 'data');
const load = (file) => JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf8'));

const locations  = load('tool1_locations.json').locations;            // Tool 1
const technology = load('tool2_technology.json').technology;          // Tool 2
const products   = load('tool3_products.json').products_by_technology; // Tool 3
const subscribers = load('tool4_subscriber.json').subscribers;        // Tool 4 (active only)
const network    = load('tool5_network.json').network;                // Tool 5 (active only)
const service    = load('tool6_service.json').service;                // Tool 6 (active only)
const providers  = load('tool7_providers.json').providers_by_technology; // Tool 7

const getLocation             = (id)   => locations.find(l => l.id === id);
const getTechnology           = (id)   => technology.find(t => t.location_id === id);
const getProductsForTechnology = (tech) => products[tech] || [];
const getProvidersForTechnology = (tech) => providers[tech] || [];
const getSubscriber           = (id)   => subscribers.find(s => s.location_id === id);
const getNetwork              = (id)   => network.find(n => n.location_id === id);
const getService              = (id)   => service.find(s => s.location_id === id);
const isActive                = (id)   => { const l = getLocation(id); return !!l && l.connection_status === 'active'; };

module.exports = {
  locations, technology, products, subscribers, network, service, providers,
  getLocation, getTechnology, getProductsForTechnology, getProvidersForTechnology,
  getSubscriber, getNetwork, getService, isActive
};
