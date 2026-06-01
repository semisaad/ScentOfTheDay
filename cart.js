/* ===================================================
   SCENT OF THE DAY — cart.js
   Shared by index.html and product.html
   ================================================= */
(function () {
  'use strict';

  /* ── CONFIG ── replace with your Facebook Page username ── */
  const FB_PAGE = '61589175521836';
  const STORAGE_KEY = 'sotd_cart';

  /* ── DELIVERY OPTIONS ── */
  const DELIVERY_OPTIONS = [
    { key: 'inside',  label: 'Inside Dhaka',  cost: 90  },
    { key: 'outside', label: 'Outside Dhaka', cost: 120 },
    { key: 'none',    label: 'No Delivery',   cost: 0   },
  ];

  let selectedDelivery = null; // key string

  /* ================================================================
     STORAGE
  ================================================================ */
  function loadCart() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      if (!Array.isArray(raw)) return [];
      return raw
        .filter(it => it && typeof it === 'object')
        .map(it => ({
          key:        it.key || `${it.perfumeIdx}_${it.ml}`,
          perfumeIdx: it.perfumeIdx,
          name:       it.name   || '',
          img:        it.img    || '',
          family:     it.family || '',
          ml:         it.ml,
          price:      Number(it.price) || 0,
          qty:        Math.max(1, Math.min(99, parseInt(it.qty, 10) || 1)),
        }));
    } catch { return []; }
  }

  function saveCart(cart) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }

  /* ================================================================
     BADGE
  ================================================================ */
  function updateCartBadge() {
    const cart  = loadCart();
    const total = cart.reduce((s, i) => s + i.qty, 0);
    document.querySelectorAll('#cartBadge, #navCartBadge').forEach(el => {
      el.textContent = total;
      el.classList.toggle('visible', total > 0);
    });
  }

  /* ================================================================
     TOTALS
  ================================================================ */
  function cartSubtotal(cart) {
    return cart.reduce((s, i) => s + i.price * i.qty, 0);
  }

  function deliveryCost() {
    if (!selectedDelivery) return 0;
    const opt = DELIVERY_OPTIONS.find(o => o.key === selectedDelivery);
    return opt ? opt.cost : 0;
  }

  /* ================================================================
     RENDER CART ITEMS
  ================================================================ */
  function renderCartItems() {
    const container = document.getElementById('cartItems');
    const footer    = document.getElementById('cartFooter');
    if (!container) return;

    const cart = loadCart();

    /* ── empty state ── */
    if (cart.length === 0) {
      selectedDelivery = null;
      container.innerHTML = `
        <div class="cart-empty">
          <div class="cart-empty-icon">∅</div>
          <p>Your cart is empty</p>
          <p style="font-size:0.75rem;opacity:0.7;margin-top:0.25rem;">Browse the collection and add fragrances</p>
        </div>`;
      if (footer) footer.style.display = 'none';
      return;
    }

    /* ── items ── */
    if (footer) footer.style.display = 'block';

    let html = '';
    cart.forEach(item => {
      html += `
        <div class="cart-item" data-key="${item.key}">
          <img class="cart-item-img" src="${item.img}" alt="${item.name}" onerror="this.style.opacity='0'">
          <div class="cart-item-info">
            <p class="cart-item-name">${item.name}</p>
            <p class="cart-item-meta">${item.family} · ${item.ml}ml</p>
            <p class="cart-item-price">৳${item.price} each</p>
            <div class="cart-item-bottom">
              <div class="cart-item-qty-wrap">
                <button class="cart-qty-btn qty-minus" type="button" data-key="${item.key}" aria-label="Decrease">−</button>
                <span class="cart-qty-num">${item.qty}</span>
                <button class="cart-qty-btn qty-plus" type="button" data-key="${item.key}" aria-label="Increase">+</button>
              </div>
              <span class="cart-item-line-total">৳${item.price * item.qty}</span>
              <button class="cart-item-remove" type="button" data-key="${item.key}">Remove</button>
            </div>
          </div>
        </div>`;
    });
    container.innerHTML = html;

    /* attach events using event delegation-style direct binding */
    container.querySelectorAll('.qty-minus').forEach(btn =>
      btn.addEventListener('click', () => updateCartQty(btn.dataset.key, -1)));
    container.querySelectorAll('.qty-plus').forEach(btn =>
      btn.addEventListener('click', () => updateCartQty(btn.dataset.key, +1)));
    container.querySelectorAll('.cart-item-remove').forEach(btn =>
      btn.addEventListener('click', () => removeCartItem(btn.dataset.key)));

    renderCartFooter(cart);
  }

  /* ================================================================
     RENDER CART FOOTER (totals + delivery + buttons)
  ================================================================ */
  function renderCartFooter(cart) {
    const summary = document.getElementById('cartSummary');
    if (!summary) return;

    const subtotal  = cartSubtotal(cart);
    const delivery  = deliveryCost();
    const total     = subtotal + delivery;
    const totalQty  = cart.reduce((s, i) => s + i.qty, 0);

    /* ── delivery selector HTML ── */
    const deliveryBtns = DELIVERY_OPTIONS.map(opt => {
      const active = selectedDelivery === opt.key ? 'active' : '';
      const label  = opt.cost > 0 ? `${opt.label} (+৳${opt.cost})` : opt.label;
      return `<button class="delivery-opt ${active}" data-key="${opt.key}" type="button">${label}</button>`;
    }).join('');

    summary.innerHTML = `
      <div class="cart-line-subtotal">
        <span>${totalQty} item${totalQty !== 1 ? 's' : ''}</span>
        <span>৳${subtotal}</span>
      </div>

      <div class="cart-delivery-section">
        <p class="cart-delivery-label">Delivery</p>
        <div class="cart-delivery-opts">${deliveryBtns}</div>
        ${!selectedDelivery ? '<p class="cart-delivery-warning">Please select a delivery option</p>' : ''}
      </div>

      <div class="cart-line-total">
        <span>Total</span>
        <span>৳${total}</span>
      </div>
    `;

    /* bind delivery buttons */
    summary.querySelectorAll('.delivery-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedDelivery = btn.dataset.key;
        renderCartFooter(loadCart());
      });
    });
  }

  /* ================================================================
     MUTATIONS
  ================================================================ */
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
    saveCart(loadCart().filter(i => i.key !== key));
    updateCartBadge();
    renderCartItems();
  }

  function addToCart(item) {
    if (!item || item.perfumeIdx == null || !item.ml) return false;
    const cart  = loadCart();
    const key   = `${item.perfumeIdx}_${item.ml}`;
    const addQty = Math.max(1, Math.min(99, parseInt(item.qty, 10) || 1));
    const existing = cart.find(i => i.key === key);
    if (existing) {
      existing.qty = Math.max(1, Math.min(99, existing.qty + addQty));
    } else {
      cart.push({
        key,
        perfumeIdx: item.perfumeIdx,
        name:   item.name   || '',
        img:    item.img    || '',
        family: item.family || '',
        ml:     item.ml,
        price:  Number(item.price) || 0,
        qty:    addQty,
      });
    }
    saveCart(cart);
    updateCartBadge();
    renderCartItems();
    return true;
  }

  /* ================================================================
     OPEN / CLOSE
  ================================================================ */
  function openCart() {
    renderCartItems();
    updateCartBadge();
    const overlay = document.getElementById('cartOverlay');
    const drawer  = document.getElementById('cartDrawer');
    if (overlay) overlay.classList.add('open');
    if (drawer)  drawer.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeCart() {
    const overlay = document.getElementById('cartOverlay');
    const drawer  = document.getElementById('cartDrawer');
    if (overlay) overlay.classList.remove('open');
    if (drawer)  drawer.classList.remove('open');
    document.body.style.overflow = '';
  }

  /* ================================================================
     BUILD ORDER TEXT
  ================================================================ */
  function buildOrderText() {
    const cart     = loadCart();
    const subtotal = cartSubtotal(cart);
    const delivery = deliveryCost();
    const total    = subtotal + delivery;
    const delivOpt = DELIVERY_OPTIONS.find(o => o.key === selectedDelivery);
    const delivLabel = delivOpt ? delivOpt.label : 'Not selected';

    let text = 'Hi! I\'d like to order the following from Scent Of The Day:\n\n';
    cart.forEach(item => {
      text += `• ${item.name} — ${item.ml}ml × ${item.qty}  (৳${item.price * item.qty})\n`;
    });
    text += `\nSubtotal:  ৳${subtotal}`;
    text += `\nDelivery:  ${delivLabel}${delivery > 0 ? ` (+৳${delivery})` : ''}`;
    text += `\nTotal:     ৳${total}`;
    text += '\n\nPlease confirm availability and arrange delivery. Thank you!';
    return text;
  }

  /* ================================================================
     COPY ORDER INFO
  ================================================================ */
  function copyOrderInfo() {
    const cart = loadCart();
    if (cart.length === 0)    { showToast('Your cart is empty'); return; }
    if (!selectedDelivery)    { showToast('Please select a delivery option first'); return; }

    const text = buildOrderText();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text)
        .then(() => showToast('Order info copied!'))
        .catch(() => fallbackCopy(text));
    } else {
      fallbackCopy(text);
    }
  }

  function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0;';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); showToast('Order info copied!'); }
    catch { showToast('Could not copy — please copy manually'); }
    document.body.removeChild(ta);
  }

  /* ================================================================
     FACEBOOK MESSAGE
  ================================================================ */
  function messageOnFacebook() {
    const cart = loadCart();
    if (cart.length === 0) { showToast('Your cart is empty'); return; }
    if (!selectedDelivery) { showToast('Please select a delivery option first'); return; }

    const text = buildOrderText();
    window.open(`https://m.me/${FB_PAGE}?text=${encodeURIComponent(text)}`, '_blank');
  }

  /* ================================================================
     TOAST
  ================================================================ */
  let _toastTimer = null;
  function showToast(msg) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(_toastTimer);
    _toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
  }

  /* ================================================================
     EVENT LISTENERS
  ================================================================ */
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeCart(); });
  window.addEventListener('storage', e => {
    if (e.key && e.key !== STORAGE_KEY) return;
    updateCartBadge();
    renderCartItems();
  });
  window.addEventListener('focus', updateCartBadge);
  document.addEventListener('DOMContentLoaded', updateCartBadge);

  /* ================================================================
     EXPOSE
  ================================================================ */
  window.SOTDCart = {
    load: loadCart, save: saveCart,
    add: addToCart, update: updateCartQty, remove: removeCartItem,
    render: renderCartItems, badge: updateCartBadge,
    open: openCart, close: closeCart,
    fb: messageOnFacebook, copy: copyOrderInfo,
    toast: showToast,
  };

  /* convenience globals for inline onclick */
  window.openCart          = openCart;
  window.closeCart         = closeCart;
  window.messageOnFacebook = messageOnFacebook;
  window.copyOrderInfo     = copyOrderInfo;
  window.showToast         = showToast;
})();