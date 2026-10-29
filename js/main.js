window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    const welcome = document.getElementById('welcome-screen');
    if (welcome) welcome.classList.add('slide-up');
  }, 1000);

  initNewsSlider();
  updateCartDisplay();
  loadOrderSummary();
});

// Slider Berita
let currentSlide = 0;
function initNewsSlider() {
  const track = document.getElementById('slide-track');
  if (!track) return;
  const totalSlides = track.children.length;

  setInterval(() => {
    currentSlide = (currentSlide + 1) % totalSlides;
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
  }, 5000);
}

function moveSlide(direction) {
  const track = document.getElementById('slide-track');
  if (!track) return;
  const totalSlides = track.children.length;
  currentSlide = (currentSlide + direction + totalSlides) % totalSlides;
  track.style.transform = `translateX(-${currentSlide * 100}%)`;
}

// Keranjang Belanja LocalStorage
let cart = JSON.parse(localStorage.getItem('gusteau_cart')) || [];

// FUNGSI ADD TO CART DARI PAGE DETAIL
function addToCartWithOptions(name, price) {
  const variantSelect = document.getElementById('product-variant');
  const qtyInput = document.getElementById('product-qty');

  const variant = variantSelect ? variantSelect.value : 'Standard Edition';
  const qty = qtyInput ? parseInt(qtyInput.value) || 1 : 1;

  const existing = cart.find(item => item.name === name && item.variant === variant);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ name, price, qty, variant });
  }

  localStorage.setItem('gusteau_cart', JSON.stringify(cart));
  updateCartDisplay();
  alert(`Successfully added ${qty}x ${name} (${variant}) to your cart!`);
  window.location.href = 'cart.html';
}

function updateCartDisplay() {
  const container = document.getElementById('cart-items-container');
  const summaryBox = document.getElementById('cart-summary-box');
  const countBadge = document.getElementById('cart-count');

  let grandTotal = 0;
  let totalCount = 0;

  cart.forEach(item => {
    grandTotal += item.price * item.qty;
    totalCount += item.qty;
  });

  if (countBadge) countBadge.textContent = totalCount;
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: var(--text-muted); font-style: italic; padding: 20px;">Your cart is currently empty.</p>';
    if (summaryBox) summaryBox.style.display = 'none';
    return;
  }

  let html = '';
  cart.forEach((item, index) => {
    let subtotal = item.price * item.qty;
    html += `
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed var(--border-subtle); padding: 12px 0;">
        <div>
          <strong>${item.name}</strong><br>
          <small style="color: var(--text-muted);">Variant: ${item.variant} | Price: Rp${item.price.toLocaleString('id-ID')}</small>
        </div>
        <div style="display: flex; align-items: center; gap: 15px;">
          <span>Qty: ${item.qty}</span>
          <span style="font-weight: bold; color: var(--olive-green);">Rp${subtotal.toLocaleString('id-ID')}</span>
          <button onclick="removeItem(${index})" style="background:none; border:none; color:#9e2a2b; cursor:pointer; font-weight:bold;">✕</button>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
  if (summaryBox) {
    summaryBox.style.display = 'block';
    document.getElementById('cart-total-price').textContent = 'Rp' + grandTotal.toLocaleString('id-ID');
  }
}

function removeItem(index) {
  cart.splice(index, 1);
  localStorage.setItem('gusteau_cart', JSON.stringify(cart));
  updateCartDisplay();
}

function clearCart() {
  cart = [];
  localStorage.removeItem('gusteau_cart');
  updateCartDisplay();
}

function handleCheckout(event) {
  event.preventDefault();
  const region = document.getElementById('shipping-region').value;
  const payment = document.getElementById('payment-method').value;
  const voucherCode = document.getElementById('voucher-code').value.trim().toUpperCase();

  let discountRate = 0;
  let appliedVoucher = '-';

  if (voucherCode === 'REMY10') {
    discountRate = 0.10;
    appliedVoucher = 'REMY10 (10% OFF)';
  } else if (voucherCode !== '') {
    alert('Invalid voucher code. Proceeding without discount.');
  }

  const orderData = {
    items: cart,
    region: region,
    payment: payment,
    voucher: appliedVoucher,
    discountRate: discountRate,
    date: "October 29, 2026"
  };

  localStorage.setItem('gusteau_last_order', JSON.stringify(orderData));
  localStorage.removeItem('gusteau_cart');
  window.location.href = 'sukses.html';
}

function loadOrderSummary() {
  const listContainer = document.getElementById('receipt-items-list');
  const totalContainer = document.getElementById('receipt-grand-total');
  const voucherContainer = document.getElementById('receipt-voucher-used');
  const regionText = document.getElementById('tracker-region-text');
  const estimateText = document.getElementById('tracker-estimate-text');
  if (!listContainer) return;

  const order = JSON.parse(localStorage.getItem('gusteau_last_order'));
  if (!order) return;

  let html = '';
  let subtotal = 0;

  order.items.forEach(item => {
    let sub = item.price * item.qty;
    subtotal += sub;
    html += `
      <div class="receipt-row">
        <span>${item.qty}x ${item.name}</span>
        <span>Rp${sub.toLocaleString('id-ID')}</span>
      </div>
    `;
  });

  let discountAmount = subtotal * order.discountRate;
  let grandTotal = subtotal - discountAmount;

  listContainer.innerHTML = html;
  if (voucherContainer) voucherContainer.textContent = order.voucher;
  if (totalContainer) totalContainer.textContent = 'Rp' + grandTotal.toLocaleString('id-ID');

  if (regionText && estimateText) {
    regionText.textContent = order.region;
    if (order.region === 'Bandung Area (Instant/Same Day)') {
      estimateText.textContent = 'Estimated Delivery: Today (Instant Courier)';
    } else if (order.region === 'Jabodetabek & West Java') {
      estimateText.textContent = 'Estimated Delivery: 1-2 Days';
    } else if (order.region === 'Central & East Java') {
      estimateText.textContent = 'Estimated Delivery: 2-3 Days';
    } else {
      estimateText.textContent = 'Estimated Delivery: 3-5 Days (Outer Island)';
    }
  }
}