// Page 3 — TODO. Two modes: details (active subscriber view) and providers (Tool 7 list).
const params = new URLSearchParams(location.search);
const id = params.get('id');
const mode = params.get('mode'); // 'details' | 'providers'
document.getElementById('back').addEventListener('click', e => { e.preventDefault(); history.back(); });
// TODO: render based on mode. Keep the selected address across back navigation (AC9).
console.log('Page 3 loaded:', { id, mode }, '— build me.');
