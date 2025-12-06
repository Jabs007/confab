/**
 * Cart Manager - Handles all shopping cart operations
 * Confab E-commerce - Adams Jabali
 */

class CartManager {
    constructor() {
        this.storageKey = 'confab_cart';
        this.cart = this.loadCart();
        this.taxRate = 0.16; // 16% VAT (Kenya)
        this.shippingCost = 500; // KES 500 flat rate
        this.freeShippingThreshold = 5000; // Free shipping over KES 5000
    }

    /**
     * Load cart from localStorage
     */
    loadCart() {
        try {
            const savedCart = localStorage.getItem(this.storageKey);
            return savedCart ? JSON.parse(savedCart) : { items: [] };
        } catch (error) {
            console.error('Error loading cart:', error);
            return { items: [] };
        }
    }

    /**
     * Save cart to localStorage
     */
    saveCart() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.cart));
            this.updateCartUI();
        } catch (error) {
            console.error('Error saving cart:', error);
        }
    }

    /**
     * Add item to cart
     */
    addItem(product) {
        const existingItem = this.cart.items.find(item => item.id === product.id);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.items.push({
                id: product.id,
                name: product.name,
                price: parseFloat(product.price),
                image: product.image,
                quantity: 1
            });
        }

        this.saveCart();
        this.showNotification(`${product.name} added to cart!`, 'success');
        return true;
    }

    /**
     * Remove item from cart
     */
    removeItem(productId) {
        const index = this.cart.items.findIndex(item => item.id === productId);

        if (index !== -1) {
            const itemName = this.cart.items[index].name;
            this.cart.items.splice(index, 1);
            this.saveCart();
            this.showNotification(`${itemName} removed from cart`, 'info');
            return true;
        }

        return false;
    }

    /**
     * Update item quantity
     */
    updateQuantity(productId, quantity) {
        const item = this.cart.items.find(item => item.id === productId);

        if (item) {
            if (quantity <= 0) {
                this.removeItem(productId);
            } else {
                item.quantity = parseInt(quantity);
                this.saveCart();
            }
            return true;
        }

        return false;
    }

    /**
     * Increase item quantity
     */
    increaseQuantity(productId) {
        const item = this.cart.items.find(item => item.id === productId);
        if (item) {
            item.quantity += 1;
            this.saveCart();
        }
    }

    /**
     * Decrease item quantity
     */
    decreaseQuantity(productId) {
        const item = this.cart.items.find(item => item.id === productId);
        if (item) {
            if (item.quantity > 1) {
                item.quantity -= 1;
                this.saveCart();
            } else {
                this.removeItem(productId);
            }
        }
    }

    /**
     * Clear entire cart
     */
    clearCart() {
        this.cart.items = [];
        this.saveCart();
        this.showNotification('Cart cleared', 'info');
    }

    /**
     * Get cart item count
     */
    getItemCount() {
        return this.cart.items.reduce((total, item) => total + item.quantity, 0);
    }

    /**
     * Calculate subtotal
     */
    getSubtotal() {
        return this.cart.items.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
    }

    /**
     * Calculate tax
     */
    getTax() {
        return this.getSubtotal() * this.taxRate;
    }

    /**
     * Calculate shipping
     */
    getShipping() {
        const subtotal = this.getSubtotal();
        return subtotal >= this.freeShippingThreshold ? 0 : this.shippingCost;
    }

    /**
     * Calculate total
     */
    getTotal() {
        return this.getSubtotal() + this.getTax() + this.getShipping();
    }

    /**
     * Get cart summary
     */
    getSummary() {
        return {
            items: this.cart.items,
            itemCount: this.getItemCount(),
            subtotal: this.getSubtotal(),
            tax: this.getTax(),
            shipping: this.getShipping(),
            total: this.getTotal(),
            freeShippingRemaining: Math.max(0, this.freeShippingThreshold - this.getSubtotal())
        };
    }

    /**
     * Format currency (Kenyan Shillings)
     */
    formatCurrency(amount) {
        return `KES ${amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
    }

    /**
     * Update cart UI elements
     */
    updateCartUI() {
        const itemCount = this.getItemCount();

        // Update cart counter in header
        const cartCounters = document.querySelectorAll('.cart-counter, .number');
        cartCounters.forEach(counter => {
            counter.textContent = itemCount;
            counter.style.display = itemCount > 0 ? 'inline-block' : 'none';
        });

        // Update cart dropdown/sidebar
        this.renderCartDropdown();
    }

    /**
     * Render cart dropdown
     */
    renderCartDropdown() {
        const cartBox = document.querySelector('.cart-box');
        if (!cartBox) return;

        const summary = this.getSummary();

        if (summary.items.length === 0) {
            cartBox.innerHTML = `
        <div class="empty-cart" style="padding: 40px 20px; text-align: center;">
          <i class="fa-regular fa-cart-shopping" style="font-size: 48px; color: #ddd; margin-bottom: 15px;"></i>
          <p style="color: #999; margin: 0;">Your cart is empty</p>
        </div>
      `;
            return;
        }

        // Render cart items
        let itemsHTML = '';
        summary.items.forEach(item => {
            itemsHTML += `
        <ul>
          <li>
            <img src="${item.image}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover;">
            <div class="cart-product">
              <a href="#">${item.name}</a>
              <span>${this.formatCurrency(item.price)} x ${item.quantity}</span>
            </div>
            <button class="remove-cart-item" data-id="${item.id}" style="background: none; border: none; color: #ff0000; cursor: pointer; font-size: 18px;">
              <i class="fa-regular fa-times"></i>
            </button>
          </li>
        </ul>
      `;
        });

        cartBox.innerHTML = `
      ${itemsHTML}
      <div class="shopping-items">
        <span>Subtotal:</span>
        <span>${this.formatCurrency(summary.subtotal)}</span>
      </div>
      ${summary.freeShippingRemaining > 0 ? `
        <div style="padding: 10px 20px; background: #f0f8ff; margin: 10px 0; border-radius: 5px; font-size: 13px;">
          <i class="fa-solid fa-truck"></i> Add ${this.formatCurrency(summary.freeShippingRemaining)} more for FREE shipping!
        </div>
      ` : `
        <div style="padding: 10px 20px; background: #e8f5e9; margin: 10px 0; border-radius: 5px; font-size: 13px;">
          <i class="fa-solid fa-check-circle"></i> You qualify for FREE shipping!
        </div>
      `}
      <div class="cart-button mb-4">
        <a href="shop-cart.html" class="theme-btn">View Cart</a>
      </div>
    `;

        // Attach remove button listeners
        cartBox.querySelectorAll('.remove-cart-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const productId = btn.dataset.id;
                this.removeItem(productId);
            });
        });
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'success') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `cart-notification cart-notification-${type}`;
        notification.innerHTML = `
      <i class="fa-solid fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
      <span>${message}</span>
    `;

        // Add styles
        notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#4caf50' : '#2196f3'};
      color: white;
      padding: 15px 20px;
      border-radius: 5px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      display: flex;
      align-items: center;
      gap: 10px;
      animation: slideInRight 0.3s ease;
      font-size: 14px;
    `;

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    /**
     * Initialize cart on page load
     */
    init() {
        this.updateCartUI();
        this.attachEventListeners();
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Add to cart buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.add-to-cart-btn')) {
                e.preventDefault();
                const btn = e.target.closest('.add-to-cart-btn');
                const productData = {
                    id: btn.dataset.id,
                    name: btn.dataset.name,
                    price: btn.dataset.price,
                    image: btn.dataset.image
                };
                this.addItem(productData);
            }
        });
    }
}

// Initialize cart manager when DOM is ready
let cartManager;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        cartManager = new CartManager();
        cartManager.init();
    });
} else {
    cartManager = new CartManager();
    cartManager.init();
}

// Make cartManager globally available
window.cartManager = cartManager;
