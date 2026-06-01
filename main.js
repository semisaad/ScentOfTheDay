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