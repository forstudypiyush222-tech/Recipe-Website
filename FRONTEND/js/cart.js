/** Cart Page Logic */
document.addEventListener('DOMContentLoaded', renderCart);

function renderCart() {
    const cart = getCart();
    const el = document.getElementById('cart-content');
    if (cart.length === 0) {
        el.innerHTML = `<div class="empty-state"><span class="empty-icon">🛒</span><h3>Your cart is empty</h3><p>Browse our delicious menu and add items!</p><a href="index.html#menu" class="btn-gold">🍽️ Browse Menu</a></div>`;
        return;
    }
    const { subtotal, gst, total } = getCartTotal();
    let html = '<div class="cart-grid">';
    cart.forEach((item, i) => {
        html += `
        <div class="cart-item">
            <img class="cart-item-img" src="${item.image}" alt="${item.name}">
            <div class="cart-item-info">
                <h3>${item.name}</h3>
                <span class="cat">${item.category}</span>
                <div class="price">${formatCurrency(item.price)} each</div>
            </div>
            <div class="cart-item-qty">
                <button onclick="changeCartQty(${i},-1)">−</button>
                <span>${item.quantity}</span>
                <button onclick="changeCartQty(${i},1)">+</button>
            </div>
            <div class="cart-item-subtotal">${formatCurrency(item.price * item.quantity)}</div>
            <div class="cart-item-remove"><button class="btn-danger" onclick="removeItem(${i})">✕</button></div>
        </div>`;
    });
    html += '</div>';
    html += `
    <div class="cart-summary">
        <div class="summary-row"><span>Subtotal</span><span>${formatCurrency(subtotal)}</span></div>
        <div class="summary-row"><span>GST (5%)</span><span>${formatCurrency(gst)}</span></div>
        <div class="summary-row"><span>Delivery</span><span class="free">FREE 🎉</span></div>
        <div class="summary-row total"><span>Total</span><span>${formatCurrency(total)}</span></div>
        <div class="summary-actions">
            <a href="index.html#menu" class="btn-secondary">🍽️ Continue Shopping</a>
            <a href="checkout.html" class="btn-primary" style="color:#fff!important;">🛒 Proceed to Checkout</a>
        </div>
    </div>`;
    el.innerHTML = html;
}

function changeCartQty(index, delta) {
    const cart = getCart();
    if (cart[index]) {
        cart[index].quantity = Math.max(1, Math.min(20, cart[index].quantity + delta));
        setCart(cart);
        renderCart();
    }
}

function removeItem(index) {
    removeFromCart(index);
    renderCart();
    showToast('Item removed from cart 🗑️');
}
