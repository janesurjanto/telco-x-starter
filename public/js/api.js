// Telco X — API client for all three pages.
// All seven tools are now connected.

const API = {
  // Tool 1 — search all locations (optional query string)
  async searchLocations(q = '') {
    const res = await fetch(
      `/api/locations${q ? `?q=${encodeURIComponent(q)}` : ''}`
    );
    if (!res.ok) throw new Error('search_failed');
    return res.json();
  },

  // Tool 1 — single location by id (includes latitude, longitude, connection_status)
  async getLocation(id) {
    const res = await fetch(`/api/locations/${encodeURIComponent(id)}`);
    if (res.status === 404) throw new Error('not_found');
    if (!res.ok) throw new Error('fetch_failed');
    return res.json();
  },

  // Tool 2 — technology for a location
  async getTechnology(id) {
    const res = await fetch(`/api/locations/${encodeURIComponent(id)}/technology`);
    if (res.status === 404) throw new Error('not_found');
    if (!res.ok) throw new Error('fetch_failed');
    return res.json();
  },

  // Tool 3 — product catalogue for a technology
  async getProducts(tech) {
    const res = await fetch(`/api/technology/${encodeURIComponent(tech)}/products`);
    if (res.status === 404) throw new Error('not_found');
    if (!res.ok) throw new Error('fetch_failed');
    return res.json();
  },

  // Tool 4 — subscriber record (active locations only)
  async getSubscriber(id) {
    const res = await fetch(`/api/locations/${encodeURIComponent(id)}/subscriber`);
    if (res.status === 404) return null; // non-active: no record — not an error
    if (!res.ok) throw new Error('fetch_failed');
    return res.json();
  },

  // Tool 5 — network record (active locations only)
  async getNetwork(id) {
    const res = await fetch(`/api/locations/${encodeURIComponent(id)}/network`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error('fetch_failed');
    return res.json();
  },

  // Tool 6 — service record (active locations only)
  async getService(id) {
    const res = await fetch(`/api/locations/${encodeURIComponent(id)}/service`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error('fetch_failed');
    return res.json();
  },

  // Tool 7 — providers for a technology
  async getProviders(tech) {
    const res = await fetch(`/api/technology/${encodeURIComponent(tech)}/providers`);
    if (res.status === 404) throw new Error('not_found');
    if (!res.ok) throw new Error('fetch_failed');
    return res.json();
  }
};
