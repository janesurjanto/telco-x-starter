// Page 2 — TODO. Skeleton provided; build the address result + status branch.
const params = new URLSearchParams(location.search);
const id = params.get('id');
// TODO: if (!id) -> redirect to /index.html
// TODO: const loc = await API.getLocation(id); render address + map pin (loc.latitude/longitude)
// TODO: branch on loc.connection_status (active vs previous/never) per the business rules
console.log('Page 2 loaded for', id, '— build me.');
