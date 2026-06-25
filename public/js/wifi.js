// Telco X — Modem Placement Assistant (wifi.js)
// Rule-based mock engine: analyses image filename + size to select tips.
// In production, replace analyseMock() with a call to a real vision API
// (e.g. POST /api/wifi/analyse) that passes the images to a model like Claude.

(function () {
  'use strict';

  // ── State ────────────────────────────────────────────────────────────────
  let modemFile  = null;
  let floorFile  = null;

  // ── DOM refs ─────────────────────────────────────────────────────────────
  const form        = document.getElementById('wifi-form');
  const btnSubmit   = document.getElementById('btn-submit');
  const submitHint  = document.getElementById('submit-hint');
  const loadingEl   = document.getElementById('wifi-loading');
  const resultsEl   = document.getElementById('wifi-results');
  const tipsEl      = document.getElementById('wifi-tips');
  const confEl      = document.getElementById('wifi-confidence');
  const btnReset    = document.getElementById('btn-reset');

  // ── Upload wiring ────────────────────────────────────────────────────────

  setupUpload('input-modem', 'drop-modem', 'preview-modem', 'err-modem', file => {
    modemFile = file;
    updateSubmit();
  });

  setupUpload('input-floor', 'drop-floor', 'preview-floor', 'err-floor', file => {
    floorFile = file;
    updateSubmit();
  });

  function setupUpload(inputId, zoneId, previewId, errId, onFile) {
    const input   = document.getElementById(inputId);
    const zone    = document.getElementById(zoneId);
    const preview = document.getElementById(previewId);
    const errEl   = document.getElementById(errId);

    // File chosen via picker
    input.addEventListener('change', () => {
      if (input.files[0]) handleFile(input.files[0]);
    });

    // Keyboard activation of the label/zone
    zone.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        input.click();
      }
    });

    // Drag and drop
    zone.addEventListener('dragover', e => {
      e.preventDefault();
      zone.classList.add('wifi-drop-zone--dragover');
    });
    zone.addEventListener('dragleave', () => {
      zone.classList.remove('wifi-drop-zone--dragover');
    });
    zone.addEventListener('drop', e => {
      e.preventDefault();
      zone.classList.remove('wifi-drop-zone--dragover');
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    });

    function handleFile(file) {
      errEl.hidden = true;

      // Validate type
      if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
        errEl.textContent = 'Please upload an image file (JPG, PNG, HEIC, or PDF).';
        errEl.hidden = false;
        return;
      }
      // Validate size (10 MB)
      if (file.size > 10 * 1024 * 1024) {
        errEl.textContent = 'File is too large. Maximum size is 10 MB.';
        errEl.hidden = false;
        return;
      }

      onFile(file);
      zone.classList.add('wifi-drop-zone--has-file');
      renderPreview(file, preview);
    }
  }

  function renderPreview(file, previewEl) {
    previewEl.innerHTML = '';

    // Thumbnail for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = e => {
        const img = document.createElement('img');
        img.src = e.target.result;
        img.className = 'wifi-thumb';
        img.alt = `Preview of ${file.name}`;
        previewEl.appendChild(img);
        previewEl.appendChild(nameEl(file));
        previewEl.appendChild(sizeEl(file));
      };
      reader.readAsDataURL(file);
    } else {
      // PDF — show icon + name
      const icon = document.createElement('span');
      icon.textContent = '📄';
      icon.style.fontSize = '32px';
      previewEl.appendChild(icon);
      previewEl.appendChild(nameEl(file));
      previewEl.appendChild(sizeEl(file));
    }
  }

  function nameEl(file) {
    const p = document.createElement('p');
    p.className = 'wifi-thumb-name';
    p.textContent = file.name;
    return p;
  }

  function sizeEl(file) {
    const p = document.createElement('p');
    p.className = 'wifi-thumb-size';
    p.textContent = formatBytes(file.size);
    return p;
  }

  function formatBytes(bytes) {
    if (bytes < 1024)       return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  // ── Enable / disable submit button ───────────────────────────────────────

  function updateSubmit() {
    const ready = modemFile !== null && floorFile !== null;
    btnSubmit.disabled = !ready;
    submitHint.textContent = ready
      ? 'Both images ready. Click to get your tips.'
      : modemFile
        ? 'Now upload your floorplan to continue.'
        : floorFile
          ? 'Now upload your modem photo to continue.'
          : 'Upload both images to continue.';
  }

  // ── Form submit ───────────────────────────────────────────────────────────

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!modemFile || !floorFile) return;

    // Show loading, hide form
    form.hidden = true;
    loadingEl.hidden = false;
    resultsEl.hidden = true;

    // Simulate network/AI latency (1.8 s)
    await delay(1800);

    const result = analyseMock(modemFile, floorFile);

    loadingEl.hidden = true;
    renderResults(result);
    resultsEl.hidden = false;
    resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  // ── Mock analysis engine ─────────────────────────────────────────────────
  // In production: replace this function with a fetch() call to
  // POST /api/wifi/analyse that forwards the images to a vision model.
  //
  // Example production flow:
  //   const formData = new FormData();
  //   formData.append('modem', modemFile);
  //   formData.append('floorplan', floorFile);
  //   const res = await fetch('/api/wifi/analyse', { method: 'POST', body: formData });
  //   return res.json(); // { tips: [...], confidence: 'high'|'medium'|'low' }

  function analyseMock(modemFile, floorFile) {
    const mName = modemFile.name.toLowerCase();
    const fName = floorFile.name.toLowerCase();
    const mSize = modemFile.size;
    const fSize = floorFile.size;

    const tips = [];

    // ── Modem placement tips (based on filename keywords) ─────────────────

    if (/floor|ground|carpet|low/.test(mName)) {
      tips.push('Raise the modem onto a table or shelf — placing it on the floor limits signal spread significantly.');
    } else if (/cupboard|cabinet|wardrobe|closet|enclosed/.test(mName)) {
      tips.push('Move the modem into an open area. Enclosed cupboards and cabinets can reduce Wi-Fi signal strength by up to 50%.');
    } else if (/kitchen|microwave|oven|fridge/.test(mName)) {
      tips.push('Keep the modem away from kitchen appliances. Microwaves and large metal appliances can interfere with Wi-Fi signals.');
    } else if (/window|wall|corner|edge|outside/.test(mName)) {
      tips.push('Move the modem away from external walls and windows — signal is lost through the building exterior. Aim for the centre of your home.');
    } else {
      tips.push('Current modem placement looks reasonable. Focus on height and clearing nearby obstructions for best results.');
    }

    // ── Always-on placement tips ──────────────────────────────────────────

    tips.push('Place the modem in a central location in your home where possible, so signal reaches all rooms equally.');
    tips.push('Keep the modem elevated on a shelf or table rather than on the floor — height improves signal spread.');
    tips.push('Keep the modem away from microwaves, thick brick walls, metal cabinets, and large appliances that can absorb or interfere with signal.');

    // ── Floorplan tips (based on filename keywords) ───────────────────────

    if (/apartment|unit|flat|studio/.test(fName)) {
      tips.push('For an apartment, place the modem close to the middle of the space, away from bathrooms and utility rooms where signal is rarely needed.');
    } else if (/two.stor|2.stor|upstairs|double|level/.test(fName)) {
      tips.push('For a two-storey home, place the modem near the centre of the level where the internet is used most — upper floor placement often gives better overall coverage.');
    } else if (/large|big|acreage|mansion/.test(fName)) {
      tips.push('For a larger home, consider adding a mesh Wi-Fi extender to cover distant rooms and dead spots.');
    } else if (/narrow|terrace|townhouse|long/.test(fName)) {
      tips.push('For a narrow or long home layout, avoid placing the modem at one far end — a central hallway position will give more even coverage.');
    } else if (/small|studio|cottage|granny/.test(fName)) {
      tips.push('For a smaller home, a central hallway or living area should provide good coverage throughout.');
    } else {
      tips.push('If some bedrooms or rooms remain weak, consider adding a mesh Wi-Fi extender to boost coverage in those areas.');
    }

    // ── Confidence heuristic ──────────────────────────────────────────────
    // A real model would return this directly. Here we infer from file sizes
    // as a proxy for image quality/detail.
    let confidence;
    const totalKB = (mSize + fSize) / 1024;
    if (totalKB > 500) {
      confidence = 'high';
    } else if (totalKB > 100) {
      confidence = 'medium';
    } else {
      confidence = 'low';
    }

    // Cap tips to 5 as per the change request
    return { tips: tips.slice(0, 5), confidence };
  }

  // ── Render results ────────────────────────────────────────────────────────

  function renderResults({ tips, confidence }) {
    // Tips list
    tipsEl.innerHTML = tips.map((tip, i) => `
      <li class="wifi-tips__item">
        <span class="wifi-tips__num" aria-hidden="true">${i + 1}</span>
        <span class="wifi-tips__text">${tip}</span>
      </li>`).join('');

    // Confidence badge
    const labels = { high: 'Confidence: High', medium: 'Confidence: Medium', low: 'Confidence: Low' };
    confEl.textContent = labels[confidence] || 'Confidence: Medium';
    confEl.className = `wifi-confidence wifi-confidence--${confidence}`;
  }

  // ── Reset ─────────────────────────────────────────────────────────────────

  btnReset.addEventListener('click', () => {
    modemFile = null;
    floorFile = null;

    // Reset drop zones
    ['modem', 'floor'].forEach(which => {
      document.getElementById(`drop-${which}`).classList.remove('wifi-drop-zone--has-file');
      const preview = document.getElementById(`preview-${which}`);
      const isModem = which === 'modem';
      preview.innerHTML = `
        <span class="wifi-drop-zone__icon" aria-hidden="true">${isModem ? '📷' : '🏠'}</span>
        <span class="wifi-drop-zone__label">Click to upload or drag and drop</span>
        <span class="wifi-drop-zone__sub">${isModem ? 'JPG, PNG, HEIC up to 10 MB' : 'JPG, PNG, PDF up to 10 MB'}</span>`;
      document.getElementById(`input-${which}`).value = '';
      document.getElementById(`err-${which}`).hidden = true;
    });

    resultsEl.hidden = true;
    form.hidden = false;
    updateSubmit();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ── Utilities ─────────────────────────────────────────────────────────────

  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

})();
