// Tiny fetch wrapper used across the three pages.
// searchLocations + getLocation are wired as worked examples.
// The remaining helpers are TODO — implement them as you connect Tools 2–7.
const API = {
  async searchLocations(q = '') {
    const res = await fetch(`/api/locations${q ? `?q=${encodeURIComponent(q)}` : ''}`);
    if (!res.ok) throw new Error('search_failed');
    return res.json();
  },
  async getLocation(id) {
    const res = await fetch(`/api/locations/${encodeURIComponent(id)}`);
    if (res.status === 404) throw new Error('not_found');
    if (!res.ok) throw new Error('fetch_failed');
    return res.json();
  },
  // TODO: getTechnology(id), getProducts(tech), getSubscriber(id),
  //       getNetwork(id), getService(id), getProviders(tech)
};
