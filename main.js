/* ===================================================
   SCENT OF THE DAY — main.js
   =================================================== */

/* ===== LOAD PERFUME DATA FROM JSON ===== */
let perfumes = [];
fetch('perfumes.json')
  .then(res => res.json())
  .then(data => {
    perfumes = data;
    renderGrid(perfumes);
  })
  .catch(err => console.error('Failed to load perfumes:', err));

/* ===== RENDER GRID ===== */
const grid = document.getElementById('perfumeGrid');

function renderGrid(list) {
  grid.innerHTML = '';
  if (list.length === 0) {
    grid.innerHTML = '<p class="no-results">No fragrances found.</p>';
    return;
  }
  list.forEach((p) => {
    const i = perfumes.indexOf(p);
    const num = String(i + 1).padStart(2, '0');
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
        <p class="perfume-tagline">${p.tagline}</p>
        <p class="notes-label">Key Notes</p>
        <div class="notes-list">
          ${[...p.top.slice(0,2), ...p.heart.slice(0,1)].map(n => `<span class="note-tag">${n}</span>`).join('')}
        </div>
        <p class="perfume-desc">${p.short}</p>
        <div style="margin-top:1.25rem; padding-top:1rem; border-top:1px solid var(--border);">
          <span style="
            display:inline-block;
            font-size:0.65rem;
            letter-spacing:0.18em;
            text-transform:uppercase;
            color:var(--maroon);
            opacity:0.75;
          ">View &amp; Order →</span>
        </div>
      </div>
    `;
    card.addEventListener('click', () => {
      window.location.href = `product.html?id=${i}`;
    });
    grid.appendChild(card);
  });
}

renderGrid(perfumes);

/* ===== COLLECTION SEARCH ===== */
document.getElementById('collectionSearch').addEventListener('input', function () {
  const q = this.value.trim().toLowerCase();
  if (!q) { renderGrid(perfumes); return; }
  const filtered = perfumes.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.family.toLowerCase().includes(q) ||
    p.tagline.toLowerCase().includes(q) ||
    [...p.top, ...p.heart, ...p.base].some(n => n.toLowerCase().includes(q))
  );
  renderGrid(filtered);
});

/* ===== NAV SEARCH ===== */
const navInput   = document.getElementById('navSearchInput');
const navResults = document.getElementById('navSearchResults');

navInput.addEventListener('input', function () {
  const q = this.value.trim().toLowerCase();
  if (!q) { navResults.classList.remove('open'); return; }

  const matches = perfumes.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.family.toLowerCase().includes(q) ||
    [...p.top, ...p.heart, ...p.base].some(n => n.toLowerCase().includes(q))
  );

  if (matches.length === 0) {
    navResults.innerHTML = '<p class="search-empty">No results found</p>';
  } else {
    navResults.innerHTML = matches.map(p => {
      const i = perfumes.indexOf(p);
      return `<div class="search-result-item" onclick="navGoTo(${i})">
        <img class="sri-img" src="${p.img}" alt="${p.name}" onerror="this.style.display='none'">
        <div class="sri-info">
          <p class="sri-name">${p.name}</p>
          <p class="sri-tagline">${p.family}</p>
        </div>
      </div>`;
    }).join('');
  }
  navResults.classList.add('open');
});


function navGoTo(i) {
  navResults.classList.remove('open');
  navInput.value = '';
  window.location.href = `product.html?id=${i}`;
}

document.addEventListener('click', function (e) {
  if (!document.getElementById('navSearchWrap').contains(e.target)) {
    navResults.classList.remove('open');
  }
});

/* ===== REFRESH CART BADGE ===== */
function refreshCartBadge() {
  const cart = JSON.parse(localStorage.getItem('sotd_cart') || '[]');
  const total = cart.reduce((s, i) => s + i.qty, 0);
  const badge = document.getElementById('navCartBadge');
  if (badge) {
    badge.textContent = total;
    badge.classList.toggle('visible', total > 0);
  }
}

refreshCartBadge();
window.addEventListener('storage', refreshCartBadge);