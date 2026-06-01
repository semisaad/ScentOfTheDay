/* ===================================================
   SCENT OF THE DAY — product.js
   Product-page only logic. Cart drawer lives in cart.js.
   =================================================== */

let perfumes = [];
let currentQty = 1;
let selectedML = null;
let currentPerfumeIndex = null;

fetch('perfumes.json')
  .then(res => res.json())
  .then(data => { perfumes = data; initProduct(); })
  .catch(err => console.error('Failed to load perfumes:', err));

function initProduct() {
  const params = new URLSearchParams(window.location.search);
  const idx = parseInt(params.get('id') || '0', 10);
  currentPerfumeIndex = isNaN(idx) ? 0 : idx;
  const p = perfumes[currentPerfumeIndex] || perfumes[0];
  if (!p) return;

  document.title = `${p.name} — Scent Of The Day`;
  document.getElementById('pNum').textContent = `No. ${String(currentPerfumeIndex + 1).padStart(2, '0')}`;
  document.getElementById('pFamily').textContent = p.family;
  document.getElementById('pName').textContent = p.name;
  document.getElementById('pTagline').textContent = p.tagline;

  const descParagraphs = p.desc.split('\n\n');
  document.getElementById('pDesc').innerHTML = descParagraphs
    .map(d => `<p style="margin-bottom:1rem;">${d}</p>`).join('');

  document.getElementById('pTop').innerHTML   = p.top.map(n   => `<span class="note-tag top-note">${n}</span>`).join('');
  document.getElementById('pHeart').innerHTML = p.heart.map(n => `<span class="note-tag heart-note">${n}</span>`).join('');
  document.getElementById('pBase').innerHTML  = p.base.map(n  => `<span class="note-tag base-note">${n}</span>`).join('');

  const pImg = document.getElementById('pImg');
  pImg.src = p.img;
  pImg.alt = p.name;
  document.getElementById('pImgPlaceholder').textContent = p.name[0];

  SOTDCart.badge();
  SOTDCart.render();

  if (params.get('opencart') === '1') {
    setTimeout(SOTDCart.open, 300);
  }
}

/* ===== ML SELECTOR ===== */
function selectML(btn) {
  document.querySelectorAll('.ml-option').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  selectedML = parseInt(btn.dataset.ml, 10);
  const fb = document.getElementById('atcFeedback');
  if (fb) fb.classList.remove('visible');
}

/* ===== QTY (product page selector) ===== */
function changeQty(delta) {
  currentQty = Math.max(1, Math.min(10, currentQty + delta));
  document.getElementById('qtyDisplay').textContent = currentQty;
}

/* ===== ADD TO CART ===== */
function addToCart() {
  const p = perfumes[currentPerfumeIndex];
  if (!p) return;
  if (!selectedML) { SOTDCart.toast('Please select a size first'); return; }

  const ok = SOTDCart.add({
    perfumeIdx: currentPerfumeIndex,
    name: p.name,
    img: p.img,
    family: p.family,
    ml: selectedML,
    qty: currentQty,
  });
  if (!ok) return;

  const fb = document.getElementById('atcFeedback');
  if (fb) {
    fb.classList.add('visible');
    setTimeout(() => fb.classList.remove('visible'), 3000);
  }
  SOTDCart.toast(`${p.name} (${selectedML}ml) added to cart`);

  // Reset product-page qty so the next add doesn't silently double up.
  currentQty = 1;
  document.getElementById('qtyDisplay').textContent = currentQty;
}

/* ===== ACCORDION ===== */
function toggleAccordion(id) {
  const item = document.getElementById(id);
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.accordion-item').forEach(i => i.classList.remove('open'));
  if (!isOpen) item.classList.add('open');
}