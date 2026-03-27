/**
 * Payment Page — Multi-item checkout with UPI, QR, EmailJS, and simulated payment.
 */

// EmailJS config — user should create account at emailjs.com and update these
const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY';  // Replace with your EmailJS public key
const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID'; // Replace with your EmailJS service ID
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID'; // Replace with your EmailJS template ID

document.addEventListener('DOMContentLoaded', renderPayment);

function renderPayment() {
    const cart = getCart();
    const customer = JSON.parse(sessionStorage.getItem('pdd_customer') || '{}');
    const el = document.getElementById('payment-grid');

    // Support single-item via URL param (backward compatible)
    if (cart.length === 0) {
        const params = new URLSearchParams(window.location.search);
        const itemName = params.get('item');
        if (itemName && PRICES[itemName]) {
            addToCart(itemName, 1);
            renderPayment();
            return;
        }
        el.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><span class="empty-icon">💳</span><h3>Nothing to pay for</h3><p>Add items to your cart first!</p><a href="index.html#menu" class="btn-gold">🍽️ Browse Menu</a></div>`;
        return;
    }

    const { subtotal, gst, total } = getCartTotal();

    // Item list HTML
    let itemsHTML = '';
    cart.forEach(item => {
        itemsHTML += `<div class="pay-item">
            <img src="${item.image}" alt="${item.name}">
            <div class="pay-item-info"><h4>${item.name}</h4><span>× ${item.quantity}</span></div>
            <div class="pay-item-price">${formatCurrency(item.price * item.quantity)}</div>
        </div>`;
    });

    el.innerHTML = `
    <!-- Order Summary -->
    <div class="card">
        <div class="card-header"><h2>📋 Order Summary</h2></div>
        <div class="card-body">
            <div class="pay-items">${itemsHTML}</div>
            <div class="price-summary">
                <div class="row"><span>Subtotal</span><span>${formatCurrency(subtotal)}</span></div>
                <div class="row"><span>GST (5%)</span><span>${formatCurrency(gst)}</span></div>
                <div class="row"><span>Delivery</span><span style="color:var(--green);font-weight:600">FREE 🎉</span></div>
                <div class="row total"><span>Total</span><span>${formatCurrency(total)}</span></div>
            </div>
        </div>
    </div>
    <!-- UPI Payment -->
    <div class="card">
        <div class="card-header"><h2>💳 Pay via UPI</h2></div>
        <div class="card-body">
            <div class="upi-section">
                <h3>Scan & Pay 📲</h3>
                <div class="qr-box">
                    <img id="qr-code" src="" alt="UPI QR Code">
                    <p class="qr-label">Scan with any UPI app</p>
                </div>
                <div class="upi-id-box">
                    <span class="label">UPI ID</span>
                    <div class="upi-copy-row">
                        <code>${UPI_ID}</code>
                        <button class="copy-btn" id="copy-btn" onclick="copyUPI()">📋 Copy</button>
                    </div>
                </div>
                <div class="app-badges">
                    <span>Google Pay</span><span>PhonePe</span><span>Paytm</span><span>BHIM</span>
                </div>
            </div>
            <hr class="divider">
            <button class="btn-primary" style="width:100%;color:#fff!important;" onclick="processPayment()">🔒 Pay ${formatCurrency(total)}</button>
            <p class="secure-note">🔐 100% Secure Payment</p>
        </div>
    </div>`;

    // Generate QR
    generateQR(total);
}

function generateQR(amount) {
    const upiURL = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${amount}&cu=INR&tn=${encodeURIComponent('Piyush Da Dhaba Order')}`;
    document.getElementById('qr-code').src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiURL)}`;
}

function copyUPI() {
    navigator.clipboard.writeText(UPI_ID).then(() => {
        const btn = document.getElementById('copy-btn');
        btn.textContent = '✅ Copied!';
        btn.classList.add('copied');
        setTimeout(() => { btn.textContent = '📋 Copy'; btn.classList.remove('copied'); }, 2000);
    }).catch(() => {
        // Fallback
        const ta = document.createElement('textarea');
        ta.value = UPI_ID;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        const btn = document.getElementById('copy-btn');
        btn.textContent = '✅ Copied!';
        btn.classList.add('copied');
        setTimeout(() => { btn.textContent = '📋 Copy'; btn.classList.remove('copied'); }, 2000);
    });
}

function processPayment() {
    const cart = getCart();
    if (cart.length === 0) return;
    const { total } = getCartTotal();
    const customer = JSON.parse(sessionStorage.getItem('pdd_customer') || '{}');

    // Show loading
    document.getElementById('loading-overlay').classList.add('active');

    setTimeout(() => {
        document.getElementById('loading-overlay').classList.remove('active');

        // Create order
        const orderId = generateOrderId();
        const order = {
            orderId,
            items: cart.map(i => ({ name: i.name, quantity: i.quantity, price: i.price, image: i.image })),
            total,
            customer,
            upiId: UPI_ID,
            paymentMethod: 'UPI',
            date: new Date().toISOString()
        };
        addOrder(order);

        // Clear cart
        clearCart();
        sessionStorage.removeItem('pdd_customer');

        // Populate success card
        let detailsHTML = `
            <div style="display:flex;justify-content:space-between;padding:5px 0;font-size:.9rem"><span style="color:var(--brown4)">Order ID</span><span style="font-weight:700">${orderId}</span></div>
            <div style="display:flex;justify-content:space-between;padding:5px 0;font-size:.9rem"><span style="color:var(--brown4)">Items</span><span style="font-weight:700">${order.items.map(i => i.name + ' ×' + i.quantity).join(', ')}</span></div>
            <div style="display:flex;justify-content:space-between;padding:5px 0;font-size:.9rem"><span style="color:var(--brown4)">Amount Paid</span><span style="font-weight:700">${formatCurrency(total)}</span></div>`;
        document.getElementById('success-details').innerHTML = detailsHTML;
        document.getElementById('receipt-link').href = `receipt.html?id=${orderId}`;

        // Show success
        document.getElementById('success-overlay').classList.add('active');

        // Send email (if configured)
        sendConfirmationEmail(order);

    }, 2500);
}

function sendConfirmationEmail(order) {
    if (EMAILJS_PUBLIC_KEY === 'YOUR_PUBLIC_KEY') return; // Not configured

    try {
        emailjs.init(EMAILJS_PUBLIC_KEY);
        const itemsList = order.items.map(i => `${i.name} × ${i.quantity} — ${formatCurrency(i.price * i.quantity)}`).join('\n');
        emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
            to_email: order.customer.email || '',
            to_name: order.customer.name || 'Customer',
            order_id: order.orderId,
            items_list: itemsList,
            total_amount: formatCurrency(order.total),
            website_name: 'Piyush Da Dhaba'
        });
    } catch (e) {
        console.log('EmailJS not configured:', e);
    }
}
