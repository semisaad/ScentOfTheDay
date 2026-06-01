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
        ${priceRange ? `<p class="perfume-price-range">${priceRange}</p>` : ''}
        <div class="card-cta-hint">View &amp; Order →</div>
      </div>
    `;
    card.addEventListener('click', () => { window.location.href = `product.html?id=${i}`; });
    grid.appendChild(card);
  });
}

/* ── Collection search with dropdown suggestions ── */
const collectionInput   = document.getElementById('collectionSearch');
const collectionResults = document.getElementById('collectionSearchResults');

collectionInput.addEventListener('input', function () {
  const q = this.value.trim().toLowerCase();

  if (!q) {
    collectionResults.classList.remove('open');
    renderGrid(perfumes);
    return;
  }

  const matches = perfumes.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.family.toLowerCase().includes(q) ||
    [...(p.top||[]), ...(p.middle||[]), ...(p.base||[])].some(n => n.toLowerCase().includes(q))
  );

  /* update the grid below */
  renderGrid(matches);

  /* show dropdown suggestions */
  if (matches.length === 0) {
    collectionResults.innerHTML = '<div class="csr-empty">No fragrances found</div>';
  } else {
    collectionResults.innerHTML = matches.map(p => {
      const i = perfumes.indexOf(p);
      const priceVals = p.prices ? Object.values(p.prices) : [];
      const priceStr  = priceVals.length
        ? `৳${Math.min(...priceVals)} – ৳${Math.max(...priceVals)}`
        : '';
      return `
        <div class="csr-item" data-idx="${i}">
          <img class="csr-img" src="${p.img}" alt="${p.name}" onerror="this.style.opacity='0'">
          <div class="csr-info">
            <p class="csr-name">${p.name}</p>
            <p class="csr-family">${p.family}</p>
          </div>
          ${priceStr ? `<span class="csr-price">${priceStr}</span>` : ''}
        </div>`;
    }).join('');

    /* clicking a suggestion navigates to product page */
    collectionResults.querySelectorAll('.csr-item').forEach(item => {
      item.addEventListener('click', () => {
        window.location.href = `product.html?id=${item.dataset.idx}`;
      });
    });
  }

  collectionResults.classList.add('open');
});

/* close dropdown when clicking outside */
document.addEventListener('click', e => {
  if (!document.querySelector('.collection-search-wrap').contains(e.target)) {
    collectionResults.classList.remove('open');
  }
});

/* close dropdown on Escape */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') collectionResults.classList.remove('open');
});

/* ── Badge refresh on focus (returning from product page) ── */
window.addEventListener('focus', () => SOTDCart && SOTDCart.badge());