/** Checkout Page Logic */
document.addEventListener('DOMContentLoaded', renderCheckout);

function renderCheckout() {
    const cart = getCart();
    const el = document.getElementById('checkout-content');
    if (cart.length === 0) {
        el.innerHTML = `<div class="empty-state"><span class="empty-icon">📦</span><h3>Nothing to checkout</h3><p>Add items to your cart first!</p><a href="index.html#menu" class="btn-gold">🍽️ Browse Menu</a></div>`;
        return;
    }
    const { subtotal, gst, total } = getCartTotal();
    let itemsHTML = '';
    cart.forEach(item => {
        itemsHTML += `<div class="order-item">
            <img src="${item.image}" alt="${item.name}">
            <div class="order-item-info"><h4>${item.name}</h4><span>× ${item.quantity}</span></div>
            <div class="order-item-price">${formatCurrency(item.price * item.quantity)}</div>
        </div>`;
    });

    el.innerHTML = `
    <div class="checkout-grid">
        <div class="card">
            <div class="card-header"><h2>📋 Order Summary</h2></div>
            <div class="card-body">
                <div class="order-list">${itemsHTML}</div>
                <div class="price-summary">
                    <div class="row"><span>Subtotal</span><span>${formatCurrency(subtotal)}</span></div>
                    <div class="row"><span>GST (5%)</span><span>${formatCurrency(gst)}</span></div>
                    <div class="row"><span>Delivery</span><span style="color:var(--green);font-weight:600;">FREE 🎉</span></div>
                    <div class="row total"><span>Total</span><span>${formatCurrency(total)}</span></div>
                </div>
            </div>
        </div>
        <div class="card">
            <div class="card-header"><h2>📝 Your Details</h2></div>
            <div class="card-body">
                <div class="form-group"><label class="form-label" for="co-name">Full Name *</label><input class="form-input" id="co-name" placeholder="Enter your name" required></div>
                <div class="form-group"><label class="form-label" for="co-phone">Phone Number *</label><input class="form-input" id="co-phone" type="tel" placeholder="Enter phone number" required></div>
                <div class="form-group"><label class="form-label" for="co-email">Email Address *</label><input class="form-input" id="co-email" type="email" placeholder="Enter email for order confirmation" required></div>
                <div class="form-group"><label class="form-label" for="co-address">Delivery Address</label><input class="form-input" id="co-address" placeholder="Enter delivery address"></div>
                <hr class="divider">
                <button class="btn-primary" style="width:100%;color:#fff!important;" onclick="proceedToPayment()">💳 Proceed to Payment</button>
                <p class="checkout-note">🔐 Your details are safe. We don't spam, promise! 😄</p>
            </div>
        </div>
    </div>`;
}

function proceedToPayment() {
    const name = document.getElementById('co-name').value.trim();
    const phone = document.getElementById('co-phone').value.trim();
    const email = document.getElementById('co-email').value.trim();
    const address = document.getElementById('co-address').value.trim();

    if (!name) { shakeField('co-name'); return; }
    if (!phone || phone.length < 10) { shakeField('co-phone'); return; }
    if (!email || !email.includes('@')) { shakeField('co-email'); return; }

    // Store customer info for payment page
    sessionStorage.setItem('pdd_customer', JSON.stringify({ name, phone, email, address }));
    window.location.href = 'payment.html';
}

function shakeField(id) {
    const el = document.getElementById(id);
    el.style.borderColor = 'var(--red)';
    el.style.animation = 'shake .4s ease';
    el.focus();
    setTimeout(() => { el.style.animation = ''; el.style.borderColor = ''; }, 500);
}
