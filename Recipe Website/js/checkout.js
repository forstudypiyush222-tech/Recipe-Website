/** Checkout Page Logic */
document.addEventListener('DOMContentLoaded', () => {
    if(window.clarity) { clarity("event", "checkout_started"); console.log("Clarity Event:", "checkout_started"); }
    renderCheckout();
});

/* --- Validation Rules --- */
const VALIDATORS = {
    'co-name': {
        required: true,
        test: v => /^[a-zA-Z\s]{2,}$/.test(v),
        msg: 'Enter a valid name (min 2 letters, no numbers or symbols)'
    },
    'co-phone': {
        required: true,
        test: v => /^[6-9]\d{9}$/.test(v),
        msg: 'Enter a valid 10-digit Indian phone number (starts with 6-9)'
    },
    'co-email': {
        required: true,
        test: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v),
        msg: 'Enter a valid email address (e.g. name@example.com)'
    },
    'co-address': {
        required: false,
        test: v => v.length === 0 || v.length >= 5,
        msg: 'Address must be at least 5 characters if provided'
    }
};

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
                <div class="form-group">
                    <label class="form-label" for="co-name">Full Name *</label>
                    <input class="form-input" id="co-name" placeholder="Enter your name" required aria-describedby="co-name-err" autocomplete="name">
                    <span class="field-error-msg" id="co-name-err" role="alert"></span>
                </div>
                <div class="form-group">
                    <label class="form-label" for="co-phone">Phone Number *</label>
                    <input class="form-input" id="co-phone" type="tel" placeholder="Enter 10-digit phone number" required aria-describedby="co-phone-err" autocomplete="tel" maxlength="10" inputmode="numeric">
                    <span class="field-error-msg" id="co-phone-err" role="alert"></span>
                </div>
                <div class="form-group">
                    <label class="form-label" for="co-email">Email Address *</label>
                    <input class="form-input" id="co-email" type="email" placeholder="name@example.com" required aria-describedby="co-email-err" autocomplete="email">
                    <span class="field-error-msg" id="co-email-err" role="alert"></span>
                </div>
                <div class="form-group">
                    <label class="form-label" for="co-address">Delivery Address</label>
                    <input class="form-input" id="co-address" placeholder="Enter delivery address" aria-describedby="co-address-err" autocomplete="street-address">
                    <span class="field-error-msg" id="co-address-err" role="alert"></span>
                </div>
                <hr class="divider">
                <button class="btn-primary" id="co-submit-btn" style="width:100%;color:#fff!important;" onclick="proceedToPayment()" disabled>💳 Proceed to Payment</button>
                <p class="checkout-note">🔐 Your details are safe. We don't spam, promise! 😄</p>
            </div>
        </div>
    </div>`;

    initFormValidation();
}

/* --- Attach real-time validation listeners --- */
function initFormValidation() {
    Object.keys(VALIDATORS).forEach(id => {
        const input = document.getElementById(id);
        if (!input) return;

        input.addEventListener('blur', () => {
            validateField(id);
            updateSubmitButton();
        });

        input.addEventListener('input', () => {
            const val = input.value.trim();
            const rule = VALIDATORS[id];
            // If currently in error state, re-validate on each keystroke
            if (input.classList.contains('field-error')) {
                validateField(id);
            } else if (val && rule.test(val)) {
                setFieldState(id, 'valid');
            }
            updateSubmitButton();
        });
    });

    updateSubmitButton();
}

/* --- Validate a single field, returns true if valid --- */
function validateField(id) {
    const input = document.getElementById(id);
    const rule = VALIDATORS[id];
    if (!input || !rule) return true;

    const val = input.value.trim();

    if (rule.required && !val) {
        setFieldState(id, 'error', 'This field is required');
        return false;
    }
    if (val && !rule.test(val)) {
        setFieldState(id, 'error', rule.msg);
        return false;
    }

    if (val) {
        setFieldState(id, 'valid');
    } else {
        // Optional field left empty — neutral state
        setFieldState(id, 'neutral');
    }
    return true;
}

/* --- Set visual state for a field --- */
function setFieldState(id, state, msg) {
    const input = document.getElementById(id);
    const errEl = document.getElementById(id + '-err');
    if (!input) return;

    input.classList.remove('field-error', 'field-valid');

    if (state === 'error') {
        input.classList.add('field-error');
        input.setAttribute('aria-invalid', 'true');
        if (errEl) errEl.textContent = msg || '';
    } else if (state === 'valid') {
        input.classList.add('field-valid');
        input.setAttribute('aria-invalid', 'false');
        if (errEl) errEl.textContent = '';
    } else {
        // neutral
        input.removeAttribute('aria-invalid');
        if (errEl) errEl.textContent = '';
    }
}

/* --- Check all required fields and enable/disable submit --- */
function updateSubmitButton() {
    const btn = document.getElementById('co-submit-btn');
    if (!btn) return;

    const allValid = Object.keys(VALIDATORS).every(id => {
        const input = document.getElementById(id);
        const rule = VALIDATORS[id];
        if (!input) return true;
        const val = input.value.trim();
        if (rule.required && !val) return false;
        if (val && !rule.test(val)) return false;
        return true;
    });

    btn.disabled = !allValid;
}

function proceedToPayment() {
    // Validate all fields at once
    let allValid = true;
    Object.keys(VALIDATORS).forEach(id => {
        if (!validateField(id)) allValid = false;
    });
    updateSubmitButton();

    if (!allValid) {
        const firstInvalid = document.querySelector('.form-input.field-error');
        if (firstInvalid) firstInvalid.focus();
        return;
    }

    const name = document.getElementById('co-name').value.trim();
    const phone = document.getElementById('co-phone').value.trim();
    const email = document.getElementById('co-email').value.trim();
    const address = document.getElementById('co-address').value.trim();

    // Store customer info for payment page
    sessionStorage.setItem('pdd_customer', JSON.stringify({ name, phone, email, address }));
    window.location.href = 'payment.html';
}
