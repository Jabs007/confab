// Cart functionality using localStorage
class Cart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('cart')) || [];
        this.updateCartDisplay();
    }

    addItem(product) {
        const existingItem = this.items.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.quantity += product.quantity || 1;
        } else {
            this.items.push({ ...product, quantity: product.quantity || 1 });
        }
        this.saveCart();
        this.updateCartDisplay();
        this.showNotification('Item added to cart!');
    }

    removeItem(id) {
        this.items = this.items.filter(item => item.id !== id);
        this.saveCart();
        this.updateCartDisplay();
    }

    updateQuantity(id, quantity) {
        const item = this.items.find(item => item.id === id);
        if (item) {
            item.quantity = quantity;
            if (item.quantity <= 0) {
                this.removeItem(id);
            } else {
                this.saveCart();
                this.updateCartDisplay();
            }
        }
    }

    getTotal() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    getItemCount() {
        return this.items.reduce((count, item) => count + item.quantity, 0);
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.items));
    }

    updateCartDisplay() {
        // Update cart count in header
        const cartCountElements = document.querySelectorAll('.cart-item-quantity-amount, .product-quant');
        cartCountElements.forEach(el => el.textContent = this.getItemCount());

        // Update cart total in header
        const totalElements = document.querySelectorAll('.total-price, .product-pri');
        totalElements.forEach(el => el.textContent = '$' + this.getTotal().toFixed(2));

        // Update cart items in header dropdown
        const cartBox = document.querySelector('.cart-box');
        if (cartBox) {
            const cartItemsContainer = cartBox.querySelector('ul');
            if (cartItemsContainer) {
                cartItemsContainer.innerHTML = '';
                this.items.slice(0, 2).forEach(item => {
                    const li = document.createElement('li');
                    li.innerHTML = `
                        <img src="${item.image}" alt="image">
                        <div class="cart-product">
                            <a href="#">${item.name}</a>
                            <span>$${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    `;
                    cartItemsContainer.appendChild(li);
                });
            }
        }

        // Update cart page table
        this.renderCartPage();
    }

    renderCartPage() {
        const cartTableBody = document.getElementById('cart-items');
        if (cartTableBody) {
            cartTableBody.innerHTML = '';
            this.items.forEach(item => {
                const row = document.createElement('tr');
                row.className = 'align-items-center py-3';
                row.innerHTML = `
                    <td>
                        <div class="cart-item-thumb d-flex align-items-center gap-4">
                            <i class="fas fa-times remove-item" data-id="${item.id}"></i>
                            <img class="w-100" src="${item.image}" alt="product">
                            <span class="head text-nowrap">${item.name}</span>
                        </div>
                    </td>
                    <td class="text-center">
                        <span class="price-usd">$${item.price.toFixed(2)} USD</span>
                    </td>
                    <td class="price-quantity text-center">
                        <div class="quantity d-inline-flex align-items-center justify-content-center gap-1 py-2 px-4 border n50-border_20 text-sm">
                            <button class="quantityDecrement" data-id="${item.id}"><i class="fal fa-minus"></i></button>
                            <input type="text" value="${item.quantity}" class="quantityValue" data-id="${item.id}">
                            <button class="quantityIncrement" data-id="${item.id}"><i class="fal fa-plus"></i></button>
                        </div>
                    </td>
                    <td class="text-center">
                        <span class="price-usd">$${(item.price * item.quantity).toFixed(2)} USD</span>
                    </td>
                `;
                cartTableBody.appendChild(row);
            });
        }

        // Render checkout order summary
        this.renderCheckoutSummary();
    }

    renderCheckoutSummary() {
        const checkoutArea = document.querySelector('.product-checout-area');
        if (checkoutArea) {
            const existingItems = checkoutArea.querySelectorAll('.checkout-item:not(:first-child):not(:last-child)');
            existingItems.forEach(item => item.remove());

            // Insert items after the header
            const headerItem = checkoutArea.querySelector('.checkout-item');
            this.items.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'checkout-item d-flex align-items-center justify-content-between';
                itemDiv.innerHTML = `
                    <p>${item.name}</p>
                    <p>$${(item.price * item.quantity).toFixed(2)}</p>
                `;
                headerItem.insertAdjacentElement('afterend', itemDiv);
            });

            // Update total
            const totalItem = checkoutArea.querySelector('.checkout-item:last-child p:last-child');
            if (totalItem) {
                totalItem.textContent = '$' + this.getTotal().toFixed(2);
            }
        }
    }

    showNotification(message) {
        // Simple notification
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            z-index: 1000;
        `;
        document.body.appendChild(notification);
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 3000);
    }

    clearCart() {
        this.items = [];
        this.saveCart();
        this.updateCartDisplay();
    }
}

// Initialize cart
const cart = new Cart();

// Add to cart functionality
document.addEventListener('click', function(e) {
    if (e.target.closest('.add-to-cart')) {
        e.preventDefault();
        const button = e.target.closest('.add-to-cart');
        const productCard = button.closest('.product-card-item, .product-card-item-2');

        if (productCard) {
            const product = {
                id: productCard.dataset.id || Date.now().toString(),
                name: productCard.querySelector('h4 a, h4').textContent.trim(),
                price: parseFloat(productCard.querySelector('span, ul.doller li').textContent.replace('$', '')),
                image: productCard.querySelector('img').src
            };
            cart.addItem(product);
        }
    }
});

// Quantity controls
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('qtyplus') || e.target.classList.contains('cart-increment')) {
        const input = e.target.parentElement.querySelector('input');
        if (input) {
            input.value = parseInt(input.value) + 1;
        }
    }
    if (e.target.classList.contains('qtyminus') || e.target.classList.contains('cart-decrement')) {
        const input = e.target.parentElement.querySelector('input');
        if (input && parseInt(input.value) > 1) {
            input.value = parseInt(input.value) - 1;
        }
    }

    // Cart page quantity controls
    if (e.target.classList.contains('quantityIncrement')) {
        const id = e.target.getAttribute('data-id');
        const input = e.target.parentElement.querySelector('.quantityValue');
        if (input) {
            const newQty = parseInt(input.value) + 1;
            input.value = newQty;
            cart.updateQuantity(id, newQty);
        }
    }
    if (e.target.classList.contains('quantityDecrement')) {
        const id = e.target.getAttribute('data-id');
        const input = e.target.parentElement.querySelector('.quantityValue');
        if (input && parseInt(input.value) > 1) {
            const newQty = parseInt(input.value) - 1;
            input.value = newQty;
            cart.updateQuantity(id, newQty);
        }
    }

    // Remove item
    if (e.target.classList.contains('remove-item')) {
        const id = e.target.getAttribute('data-id');
        cart.removeItem(id);
    }
});

// Handle quantity input change
document.addEventListener('change', function(e) {
    if (e.target.classList.contains('quantityValue')) {
        const id = e.target.getAttribute('data-id');
        const newQty = parseInt(e.target.value);
        if (newQty > 0) {
            cart.updateQuantity(id, newQty);
        } else {
            cart.removeItem(id);
        }
    }
});

// Checkout form validation and submission
document.addEventListener('submit', function(e) {
    if (e.target.closest('form[action="#"]')) {
        e.preventDefault();
        const form = e.target.closest('form');

        // Basic validation
        const requiredFields = form.querySelectorAll('input[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                field.style.borderColor = 'red';
                isValid = false;
            } else {
                field.style.borderColor = '';
            }
        });

        if (isValid) {
            // Simulate order placement
            alert('Order placed successfully! Thank you for shopping with Karto.');
            cart.clearCart();
            // Redirect to home or order confirmation
            window.location.href = 'index.html';
        } else {
            alert('Please fill in all required fields.');
        }
    }
});