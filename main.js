/* ===================================================
   SCENT OF THE DAY — main.js
   ================================================= */

let perfumes = [];

fetch('perfumes.json')
  .then(r => r.json())
  .then(data => { perfumes = data; renderGrid(perfumes); })
  .catch(err => console.error('Failed to load perfumes:', err));

/* ── Render grid ── */
const grid = document.getElementById('perfumeGrid');

function renderGrid(list) {
  grid.innerHTML = '';
  if (list.length === 0) {
    grid.innerHTML = '<p class="no-results">No fragrances found.</p>';
    return;
  }
  list.forEach(p => {
    const i   = perfumes.indexOf(p);
    const num = String(i + 1).padStart(2, '0');

    /* price range from prices object */
    const priceVals  = p.prices ? Object.values(p.prices) : [];
    const priceRange = priceVals.length
      ? `৳${Math.min(...priceVals)} – ৳${Math.max(...priceVals)}`
      : '';

    const card = document.createElement('div');
    card.className = 'perfume-card';
    card.innerHTML = `
      <div class="card-img-wrap">
        <img class="card-img" src="${p.img}" alt="${p.name}" loading="lazy" onerror="this.style.display='none'">
        <div class="card-img-placeholder">${p.name[0]}</div>
      </div>
      <div class="card-body">
        <p class="perfume-number">No. ${num}</p>
        <h3 class="perfume-name">${p.name}</h3>
        <p class="perfume-family">${p.family}</p>
        <p class="notes-label">Key Notes</p>
        <div class="notes-list">
          ${[...(p.top || []).slice(0,2), ...(p.middle || []).slice(0,1)].map(n => `<span class="note-tag">${n}</span>`).join('')}
        </div>
        ${priceRange ? `<p class="perfume-price-range">${priceRange}</p>` : ''}
        <div class="card-cta-hint">View &amp; Order →</div>
      </div>
    `;
    card.addEventListener('click', () => { window.location.href = `product.html?id=${i}`; });
    grid.appendChild(card);
  });
}

/* ── Collection search ── */
document.getElementById('collectionSearch').addEventListener('input', function () {
  const q = this.value.trim().toLowerCase();
  if (!q) { renderGrid(perfumes); return; }
  renderGrid(perfumes.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.family.toLowerCase().includes(q) ||
    [...(p.top||[]), ...(p.middle||[]), ...(p.base||[])].some(n => n.toLowerCase().includes(q))
  ));
});

/* ── Nav search ── */
const navInput   = document.getElementById('navSearchInput');
const navResults = document.getElementById('navSearchResults');

navInput.addEventListener('input', function () {
  const q = this.value.trim().toLowerCase();
  if (!q) { navResults.classList.remove('open'); return; }

  const matches = perfumes.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.family.toLowerCase().includes(q) ||
    [...(p.top||[]), ...(p.middle||[]), ...(p.base||[])].some(n => n.toLowerCase().includes(q))
  );

  navResults.innerHTML = matches.length === 0
    ? '<p class="search-empty">No results found</p>'
    : matches.map(p => {
        const i = perfumes.indexOf(p);
        return `<div class="search-result-item" onclick="navGoTo(${i})">
          <img class="sri-img" src="${p.img}" alt="${p.name}" onerror="this.style.display='none'">
          <div class="sri-info">
            <p class="sri-name">${p.name}</p>
            <p class="sri-tagline">${p.family}</p>
          </div>
        </div>`;
      }).join('');

  navResults.classList.add('open');
});

function navGoTo(i) {
  navResults.classList.remove('open');
  navInput.value = '';
  window.location.href = `product.html?id=${i}`;
}

document.addEventListener('click', e => {
  if (!document.getElementById('navSearchWrap').contains(e.target))
    navResults.classList.remove('open');
});

/* ── Badge refresh on focus (returning from product page) ── */
window.addEventListener('focus', () => SOTDCart && SOTDCart.badge());