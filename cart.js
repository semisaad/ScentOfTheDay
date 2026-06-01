/* ===================================================
   SCENT OF THE DAY — cart.js  (shared cart drawer)
   Used by both index.html and product.html.
   Requires:
     #cartDrawer, #cartOverlay, #cartItems, #cartEmpty,
     #cartFooter, #cartSummary, #cartBadge, #toast
   =================================================== */

(function () {
  'use strict';

  const STORAGE_KEY = 'sotd_cart';
  const FB_PAGE = '61589175521836';

  /* ---------- storage ---------- */
  function loadCart() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      if (!Array.isArray(raw)) return [];
      // ensure every item has a stable key (back-compat with old items)
      return raw
        .filter(it => it && typeof it === 'object')
        .map(it => ({
          key: it.key || `${it.perfumeIdx}_${it.ml}`,
          perfumeIdx: it.perfumeIdx,
          name: it.name || '',
          img: it.img || '',
          family: it.family || '',
          ml: it.ml,
          qty: Math.max(1, Math.min(99, parseInt(it.qty, 10) || 1)),
        }));
    } catch {
      return [];
    }
  }

  function saveCart(cart) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }

  /* ---------- badge ---------- */
  function updateCartBadge() {
    const cart = loadCart();
    const total = cart.reduce((s, i) => s + i.qty, 0);
    document.querySelectorAll('#cartBadge, #navCartBadge').forEach(badge => {
      badge.textContent = total;
      badge.classList.toggle('visible', total > 0);
    });
  }

  /* ---------- render ---------- */
  function renderCartItems() {
    const container = document.getElementById('cartItems');
    const empty = document.getElementById('cartEmpty');
    const footer = document.getElementById('cartFooter');
    if (!container) return;

    const cart = loadCart();

    if (cart.length === 0) {
      container.innerHTML = '';
      if (empty) {
        container.appendChild(empty);
        empty.style.display = 'flex';
      }
      if (footer) footer.style.display = 'none';
      return;
    }

    if (empty) empty.style.display = 'none';
    if (footer) footer.style.display = 'block';
    container.innerHTML = '';

    cart.forEach(item => {
      const div = document.createElement('div');
      div.className = 'cart-item';
      div.innerHTML = `
        <img class="cart-item-img" src="${item.img}" alt="${item.name}" onerror="this.style.opacity='0'">
        <div class="cart-item-info">
          <p class="cart-item-name">${item.name}</p>
          <p class="cart-item-meta">${item.family} · ${item.ml}ml vial</p>
          <div class="cart-item-bottom">
            <div class="cart-item-qty-wrap">
              <button class="cart-qty-btn qty-minus" type="button" aria-label="Decrease">−</button>
              <span class="cart-qty-num">${item.qty}</span>
              <button class="cart-qty-btn qty-plus" type="button" aria-label="Increase">+</button>
            </div>
            <button class="cart-item-remove" type="button">Remove</button>
          </div>
        </div>
      `;
      const key = item.key;
      div.querySelector('.qty-minus').addEventListener('click', () => updateCartQty(key, -1));
      div.querySelector('.qty-plus').addEventListener('click',  () => updateCartQty(key, +1));
      div.querySelector('.cart-item-remove').addEventListener('click', () => removeCartItem(key));
      container.appendChild(div);
    });

    const totalItems = cart.reduce((s, i) => s + i.qty, 0);
    const summary = document.getElementById('cartSummary');
    if (summary) {
      summary.innerHTML =
        `<strong>${totalItems} item${totalItems !== 1 ? 's' : ''}</strong> ready to order. Tap the button below to send your selection directly to our Facebook page — we'll confirm and arrange delivery.`;
    }
  }

  /* ---------- mutations ---------- */
  function updateCartQty(key, delta) {
    const cart = loadCart();
    const item = cart.find(i => i.key === key);
    if (!item) return;
    item.qty = Math.max(1, Math.min(99, item.qty + delta));
    saveCart(cart);
    updateCartBadge();
    renderCartItems();
  }

  function removeCartItem(key) {
    const cart = loadCart().filter(i => i.key !== key);
    saveCart(cart);
    updateCartBadge();
    renderCartItems();
  }

  function addToCart(item) {
    if (!item || item.perfumeIdx == null || !item.ml) return false;
    const cart = loadCart();
    const key = `${item.perfumeIdx}_${item.ml}`;
    const existing = cart.find(i => i.key === key);
    const addQty = Math.max(1, Math.min(99, parseInt(item.qty, 10) || 1));
    if (existing) {
      existing.qty = Math.max(1, Math.min(99, existing.qty + addQty));
    } else {
      cart.push({
        key,
        perfumeIdx: item.perfumeIdx,
        name: item.name || '',
        img: item.img || '',
        family: item.family || '',
        ml: item.ml,
        qty: addQty,
      });
    }
    saveCart(cart);
    updateCartBadge();
    renderCartItems();
    return true;
  }

  /* ---------- open / close ---------- */
  function openCart() {
    const drawer = document.getElementById('cartDrawer');
    const overlay = document.getElementById('cartOverlay');
    if (!drawer || !overlay) return;
    renderCartItems();
    updateCartBadge();
    overlay.classList.add('open');
    drawer.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeCart() {
    const drawer = document.getElementById('cartDrawer');
    const overlay = document.getElementById('cartOverlay');
    if (drawer) drawer.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  /* ---------- facebook ---------- */
  function messageOnFacebook() {
    const cart = loadCart();
    if (cart.length === 0) { showToast('Your cart is empty'); return; }
    let msg = "Hi! I'd like to order the following fragrances from Scent Of The Day:\n\n";
    cart.forEach(item => {
      msg += `• ${item.name} — ${item.ml}ml × ${item.qty}\n`;
    });
    msg += '\nPlease let me know availability and delivery details. Thank you!';
    window.open(`https://m.me/${FB_PAGE}?text=${encodeURIComponent(msg)}`, '_blank');
  }

  /* ---------- toast ---------- */
  function showToast(msg) {
    const t = document.getElementById('toast');
    if (!t) { console.log(msg); return; }
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => t.classList.remove('show'), 2800);
  }

  /* ---------- listeners ---------- */
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeCart(); });
  window.addEventListener('storage', e => {
    if (e.key && e.key !== STORAGE_KEY) return;
    updateCartBadge();
    renderCartItems();
  });
  window.addEventListener('focus', updateCartBadge);
  document.addEventListener('DOMContentLoaded', updateCartBadge);

  /* ---------- expose ---------- */
  window.SOTDCart = {
    load: loadCart,
    save: saveCart,
    add: addToCart,
    update: updateCartQty,
    remove: removeCartItem,
    render: renderCartItems,
    badge: updateCartBadge,
    open: openCart,
    close: closeCart,
    fb: messageOnFacebook,
    toast: showToast,
  };

  // Convenience globals for inline onclick handlers
  window.openCart = openCart;
  window.closeCart = closeCart;
  window.messageOnFacebook = messageOnFacebook;
  window.showToast = showToast;
})();
