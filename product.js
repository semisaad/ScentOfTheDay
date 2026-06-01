/* ===================================================
   SCENT OF THE DAY — product.js
   ================================================= */

let perfumes        = [];
let currentQty      = 1;
let selectedML      = null;
let perfumeIdx      = 0;

/* ── Load data then boot ── */
fetch('perfumes.json')
  .then(r => r.json())
  .then(data => { perfumes = data; initProduct(); })
  .catch(err => console.error('Failed to load perfumes:', err));

function initProduct() {
  const params = new URLSearchParams(window.location.search);
  const raw    = parseInt(params.get('id') || '0', 10);
  perfumeIdx   = isNaN(raw) ? 0 : Math.max(0, Math.min(raw, perfumes.length - 1));
  const p      = perfumes[perfumeIdx];
  if (!p) return;

  document.title = p.name + ' — Scent Of The Day';

  /* number */
  document.getElementById('pNum').textContent = 'No. ' + String(perfumeIdx + 1).padStart(2, '0');

  /* family badge */
  document.getElementById('pFamily').textContent = p.family;

  /* name */
  document.getElementById('pName').textContent = p.name;

  /* image — set src only after element is ready, show placeholder if it fails */
  const img  = document.getElementById('pImg');
  const phld = document.getElementById('pImgPlaceholder');
  phld.textContent = p.name[0];

  if (p.img) {
    img.onload  = () => { img.style.display = 'block'; phld.style.display = 'none'; };
    img.onerror = () => { img.style.display = 'none';  phld.style.display = 'flex'; };
    img.style.display = 'none'; /* hide until loaded */
    img.alt = p.name;
    img.src = p.img;
  } else {
    img.style.display  = 'none';
    phld.style.display = 'flex';
  }

  /* notes */
  document.getElementById('pTop').innerHTML    = (p.top    || []).map(n => `<span class="note-tag">${n}</span>`).join('');
  document.getElementById('pMiddle').innerHTML = (p.middle || []).map(n => `<span class="note-tag">${n}</span>`).join('');
  document.getElementById('pBase').innerHTML   = (p.base   || []).map(n => `<span class="note-tag">${n}</span>`).join('');

  /* build ml buttons from prices object */
  buildMLButtons(p.prices || {});

  /* sync badge */
  SOTDCart.badge();
  SOTDCart.render();

  /* auto-open cart if arriving via ?opencart=1 */
  if (params.get('opencart') === '1') {
    setTimeout(SOTDCart.open, 300);
  }
}

/* ── Build ML size buttons dynamically from prices ── */
function buildMLButtons(prices) {
  const container = document.getElementById('mlOptions');
  container.innerHTML = '';
  Object.entries(prices).forEach(([ml, price]) => {
    const btn = document.createElement('button');
    btn.className    = 'ml-option';
    btn.dataset.ml   = ml;
    btn.dataset.price = price;
    btn.type         = 'button';
    btn.innerHTML    = `
      <span class="ml-check">✓</span>
      <span class="ml-size">${ml}</span>
      <span class="ml-label">ml</span>
      <span class="ml-price">৳${price}</span>
    `;
    btn.addEventListener('click', () => selectML(btn));
    container.appendChild(btn);
  });
}

/* ── ML selector ── */
function selectML(btn) {
  document.querySelectorAll('.ml-option').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  selectedML = parseInt(btn.dataset.ml, 10);
  document.getElementById('selectedPrice').textContent = '৳' + btn.dataset.price;
  document.getElementById('priceRow').style.display    = 'flex';
  const fb = document.getElementById('atcFeedback');
  if (fb) fb.classList.remove('visible');
}

/* ── Quantity ── */
function changeQty(delta) {
  currentQty = Math.max(1, Math.min(10, currentQty + delta));
  document.getElementById('qtyDisplay').textContent = currentQty;
}

/* ── Add to cart ── */
function addToCart() {
  const p = perfumes[perfumeIdx];
  if (!p) return;
  if (!selectedML) { SOTDCart.toast('Please select a size first'); return; }

  const selectedBtn = document.querySelector('.ml-option.selected');
  const price = selectedBtn ? parseInt(selectedBtn.dataset.price, 10) : 0;

  const ok = SOTDCart.add({
    perfumeIdx,
    name:   p.name,
    img:    p.img,
    family: p.family,
    ml:     selectedML,
    price,
    qty:    currentQty,
  });
  if (!ok) return;

  const fb = document.getElementById('atcFeedback');
  if (fb) { fb.classList.add('visible'); setTimeout(() => fb.classList.remove('visible'), 3000); }

  SOTDCart.toast(p.name + ' (' + selectedML + 'ml) added to cart');

  /* reset qty */
  currentQty = 1;
  document.getElementById('qtyDisplay').textContent = 1;
}

/* ── Accordion (only Shipping remains) ── */
function toggleAccordion(id) {
  const item   = document.getElementById(id);
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.accordion-item').forEach(i => i.classList.remove('open'));
  if (!isOpen) item.classList.add('open');
}