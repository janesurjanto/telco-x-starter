// Page 1 — worked example. Live search against /api/locations, results link to Page 2.
const input = document.getElementById('search');
const results = document.getElementById('results');
const errorEl = document.getElementById('search-error');

function render(list) {
  errorEl.hidden = true;
  if (!list.length) {
    errorEl.hidden = false;
    errorEl.textContent = 'No matching address. Try a suburb or postcode from the list.';
    results.innerHTML = '';
    return;
  }
  results.innerHTML = list.map(l => `
    <a class="tx-card tx-card--link" style="display:block;text-decoration:none;color:inherit"
       href="/result.html?id=${l.id}">
      <strong>${l.address}</strong><br>
      <span class="tx-muted">${l.suburb} ${l.state} ${l.postcode}</span>
    </a>`).join('');
}

async function run(q) {
  try { render(await API.searchLocations(q)); }
  catch { errorEl.hidden = false; errorEl.textContent = 'Something went wrong. Try again.'; }
}

let t;
input.addEventListener('input', e => { clearTimeout(t); t = setTimeout(() => run(e.target.value), 150); });
run(''); // show all ten on load
