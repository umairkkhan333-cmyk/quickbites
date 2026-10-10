// ===== CART SYSTEM =====
let cart = JSON.parse(localStorage.getItem('quickbiteCart')) || [];

function saveCart() {
  localStorage.setItem('quickbiteCart', JSON.stringify(cart));
  updateCartBadge();
}

function addToCart(id) {
  const item = foodItems.find(f => f.id === id);
  const existing = cart.find(c => c.id === id);
  if (existing) existing.qty += 1;
  else cart.push({ ...item, qty: 1 });
  saveCart();
  showToast(`${item.name} added to cart!`);
  if (typeof renderCart === 'function') renderCart();
}

function removeFromCart(id) {
  cart = cart.filter(c => c.id !== id);
  saveCart();
  if (typeof renderCart === 'function') renderCart();
}

function updateQty(id, change) {
  const item = cart.find(c => c.id === id);
  if (!item) return;
  item.qty += change;
  if (item.qty <= 0) removeFromCart(id);
  else { saveCart(); if (typeof renderCart === 'function') renderCart(); }
}

function updateCartBadge() {
  const badge = document.getElementById('cartBadge');
  if (!badge) return;
  const total = cart.reduce((sum, item) => sum + item.qty, 0);
  badge.textContent = total;
  badge.style.display = total > 0 ? 'flex' : 'none';
}

function getCartTotal() {
  return cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
}

// ===== TOAST =====
function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 100);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

// ===== FOOD CARD HTML (shared) =====
function foodCardHTML(item) {
  return `
    <div class="food-card">
      <img src="${item.image}" alt="${item.name}" loading="lazy">
      <div class="food-info">
        <h3>${item.name}</h3>
        <p>${item.description}</p>
        <div class="food-bottom">
          <span class="price">Rs. ${item.price}</span>
          <button class="btn-add" onclick="addToCart(${item.id})">
            <i class="fas fa-plus"></i> Add
          </button>
        </div>
      </div>
    </div>`;
}

document.addEventListener('DOMContentLoaded', updateCartBadge);
// ===== CART PAGE RENDER =====
function renderCart() {
  const container = document.getElementById('cartContainer');
  if (!container) return;

  const summary = document.getElementById('cartSummary');
  const empty = document.getElementById('emptyCart');

  if (cart.length === 0) {
    container.innerHTML = '';
    summary.style.display = 'none';
    empty.style.display = 'block';
    return;
  }

  empty.style.display = 'none';
  summary.style.display = 'block';

  container.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}">
      <div class="cart-item-info">
        <h4>${item.name}</h4>
        <p class="price">Rs. ${item.price}</p>
      </div>
      <div class="qty-controls">
        <button onclick="updateQty(${item.id}, -1)"><i class="fas fa-minus"></i></button>
        <span>${item.qty}</span>
        <button onclick="updateQty(${item.id}, 1)"><i class="fas fa-plus"></i></button>
      </div>
      <button class="remove-btn" onclick="removeFromCart(${item.id})">
        <i class="fas fa-trash"></i>
      </button>
    </div>
  `).join('');

  const subtotal = getCartTotal();
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + 100 + tax;

  document.getElementById('subtotal').textContent = `Rs. ${subtotal}`;
  document.getElementById('tax').textContent = `Rs. ${tax}`;
  document.getElementById('total').textContent = `Rs. ${total}`;
}

document.addEventListener('DOMContentLoaded', renderCart);

// ===== CHECKOUT PAGE LOGIC =====
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('checkoutForm');
  if (!form) return;

  const orderItems = document.getElementById('orderItems');
  if (orderItems) {
    orderItems.innerHTML = cart.map(item => `
      <div class="summary-row">
        <span>${item.name} × ${item.qty}</span>
        <span>Rs. ${item.price * item.qty}</span>
      </div>
    `).join('');
  }
  const subtotal = getCartTotal();
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + 100 + tax;
  const finalTotal = document.getElementById('finalTotal');
  if (finalTotal) finalTotal.textContent = `Rs. ${total}`;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const address = document.getElementById('address').value.trim();
    const payment = document.getElementById('payment').value;

    let valid = true;
    document.querySelectorAll('.error').forEach(el => el.textContent = '');

    if (name.length < 3) {
      document.getElementById('nameError').textContent = 'Please enter valid name';
      valid = false;
    }
    if (!/^03\d{9}$/.test(phone)) {
      document.getElementById('phoneError').textContent = 'Format: 03001234567';
      valid = false;
    }
    if (address.length < 10) {
      document.getElementById('addressError').textContent = 'Please enter complete address';
      valid = false;
    }

    if (!valid) return;

    let msg = `*New Order - QuickBite*%0A%0A`;
    msg += `*Name:* ${name}%0A`;
    msg += `*Phone:* ${phone}%0A`;
    msg += `*Address:* ${address}%0A`;
    msg += `*Payment:* ${payment}%0A%0A`;
    msg += `*Items:*%0A`;
    cart.forEach(item => {
      msg += `• ${item.name} × ${item.qty} = Rs. ${item.price * item.qty}%0A`;
    });
    msg += `%0A*Total: Rs. ${total}*`;

    cart = [];
    saveCart();

    showToast('Order placed! Opening WhatsApp...');
    setTimeout(() => {
      window.open(`https://wa.me/923001234567?text=${msg}`, '_blank');
      setTimeout(() => window.location.href = 'index.html', 1500);
    }, 800);
  });
});