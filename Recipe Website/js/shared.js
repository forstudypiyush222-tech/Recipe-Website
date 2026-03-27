/**
 * Piyush Da Dhaba — Shared Utilities
 * Cart, Orders, Ratings, Prices — all backed by localStorage
 */

// ===== ITEM PRICES (₹) =====
const PRICES = {
    'Gulab Jamun': 149,
    'Vampire Blood Drink': 99,
    'Classic Barfi': 199,
    'Butter Chicken': 349,
    'Hyderabadi Biryani': 299,
    'Pani Puri (Golgappa)': 79,
    'Chole Bhature': 149,
    'Crispy Jalebi': 129,
    'Rasmalai': 179,
    'Monster Green Pasta': 249,
    'Zombie Burger': 199,
    'Zombie Brain Jelly': 149,
    'Poison Apple Drink': 119,
    'Ghost Marshmallow Dessert': 159,
    'Coffin Sandwich': 189,
    'Toxic Slime Drink': 109,
    'Skull Chocolate Cake': 249,
    'Spider Web Pizza': 229,
    'Bloody Pancakes': 169,
    'Graveyard Dessert Cup': 179
};

// ===== ITEM IMAGES =====
const IMAGES = {
    'Gulab Jamun': '../assets/gulab jamun.jpg',
    'Vampire Blood Drink': '../assets/blood drink.png',
    'Classic Barfi': '../assets/barfi.jpg',
    'Butter Chicken': '../assets/butter_chicken.png',
    'Hyderabadi Biryani': '../assets/biryani.png',
    'Pani Puri (Golgappa)': '../assets/pani_puri.png',
    'Chole Bhature': '../assets/chole_bhature.png',
    'Crispy Jalebi': '../assets/jalebi.png',
    'Rasmalai': '../assets/rasmalai.png',
    'Monster Green Pasta': '../assets/Monster green pasta.png',
    'Zombie Burger': '../assets/Zombie Burger.png',
    'Zombie Brain Jelly': '../assets/Zombie Brain Jelly.png',
    'Poison Apple Drink': '../assets/Poison Apple Drink.png',
    'Ghost Marshmallow Dessert': '../assets/Ghost Marshmallow Dessert.png',
    'Coffin Sandwich': '../assets/Coffin Sandwich.png',
    'Toxic Slime Drink': '../assets/Toxic Slime Drink.png',
    'Skull Chocolate Cake': '../assets/Skull Chocolate Cake.png',
    'Spider Web Pizza': '../assets/Spider Web Pizza.png',
    'Bloody Pancakes': '../assets/Bloody Pancakes.png',
    'Graveyard Dessert Cup': '../assets/Graveyard Dessert Cup.png'
};

// ===== ITEM CATEGORIES =====
const CATEGORIES = {
    'Gulab Jamun': '🍩 Indian Sweet',
    'Vampire Blood Drink': '🧛 Spooky Drink',
    'Classic Barfi': '🍬 Indian Sweet',
    'Butter Chicken': '🍗 Main Course',
    'Hyderabadi Biryani': '🍚 Main Course',
    'Pani Puri (Golgappa)': '💥 Street Food',
    'Chole Bhature': '🔥 North Indian',
    'Crispy Jalebi': '🌀 Indian Sweet',
    'Rasmalai': '🥛 Indian Sweet',
    'Monster Green Pasta': '🧟 Spooky Special',
    'Zombie Burger': '🧟‍♂️ Spooky Special',
    'Zombie Brain Jelly': '🧠 Spooky Special',
    'Poison Apple Drink': '🍎 Spooky Drink',
    'Ghost Marshmallow Dessert': '👻 Spooky Special',
    'Coffin Sandwich': '⚰️ Spooky Special',
    'Toxic Slime Drink': '☣️ Spooky Drink',
    'Skull Chocolate Cake': '💀 Spooky Special',
    'Spider Web Pizza': '🕷️ Spooky Special',
    'Bloody Pancakes': '🩸 Spooky Special',
    'Graveyard Dessert Cup': '🪦 Spooky Special'
};

const UPI_ID = '7061711917@ptaxis';
const UPI_NAME = 'Piyush';

// ==================== CART ====================

function getCart() {
    return JSON.parse(localStorage.getItem('pdd_cart') || '[]');
}

function setCart(cart) {
    localStorage.setItem('pdd_cart', JSON.stringify(cart));
    updateCartBadge();
}

function addToCart(name, qty = 1) {
    const cart = getCart();
    const idx = cart.findIndex(i => i.name === name);
    if (idx >= 0) {
        cart[idx].quantity += qty;
    } else {
        cart.push({
            name,
            price: PRICES[name] || 149,
            quantity: qty,
            image: IMAGES[name] || '',
            category: CATEGORIES[name] || '🍽️ Specialty'
        });
    }
    setCart(cart);
    return cart;
}

function removeFromCart(index) {
    const cart = getCart();
    cart.splice(index, 1);
    setCart(cart);
    return cart;
}

function updateCartItemQty(index, qty) {
    const cart = getCart();
    if (cart[index]) {
        cart[index].quantity = Math.max(1, Math.min(20, qty));
        setCart(cart);
    }
    return cart;
}

function clearCart() {
    localStorage.removeItem('pdd_cart');
    updateCartBadge();
}

function getCartTotal() {
    const cart = getCart();
    const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const gst = Math.round(subtotal * 0.05);
    return { subtotal, gst, total: subtotal + gst, itemCount: cart.reduce((s, i) => s + i.quantity, 0) };
}

// ==================== CART BADGE ====================

function updateCartBadge() {
    const badge = document.getElementById('cart-badge');
    if (!badge) return;
    const cart = getCart();
    const count = cart.reduce((s, i) => s + i.quantity, 0);
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
}

// ==================== ORDERS ====================

function getOrders() {
    return JSON.parse(localStorage.getItem('pdd_orders') || '[]');
}

function addOrder(order) {
    const orders = getOrders();
    orders.unshift(order); // newest first
    localStorage.setItem('pdd_orders', JSON.stringify(orders));
}

function getOrderById(id) {
    return getOrders().find(o => o.orderId === id);
}

function generateOrderId() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const rand = String(Math.floor(1000 + Math.random() * 9000));
    return `ORD-${y}${m}${d}-${rand}`;
}

// ==================== RATINGS ====================

function getRatings() {
    return JSON.parse(localStorage.getItem('pdd_ratings') || '{}');
}

function addRating(itemName, reviewObj) {
    // reviewObj: { name, rating, comment, date }
    const ratings = getRatings();
    if (!ratings[itemName]) {
        ratings[itemName] = { reviews: [] };
    }
    ratings[itemName].reviews.unshift(reviewObj);
    localStorage.setItem('pdd_ratings', JSON.stringify(ratings));
}

function getAvgRating(itemName) {
    const ratings = getRatings();
    const data = ratings[itemName];
    if (!data || data.reviews.length === 0) return 0;
    const sum = data.reviews.reduce((s, r) => s + r.rating, 0);
    return (sum / data.reviews.length).toFixed(1);
}

function getReviews(itemName) {
    const ratings = getRatings();
    return (ratings[itemName] && ratings[itemName].reviews) || [];
}

// ==================== HELPERS ====================

function formatCurrency(n) {
    return '₹' + n.toLocaleString('en-IN');
}

function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// Toast notification
function showToast(message, duration = 2500) {
    let toast = document.getElementById('pdd-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'pdd-toast';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.className = 'toast-show';
    setTimeout(() => { toast.className = ''; }, duration);
}

// Init cart badge on page load
document.addEventListener('DOMContentLoaded', () => {
    updateCartBadge();
});
