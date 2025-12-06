/**
 * Product Filter & Sort Module
 * Confab E-commerce - Adams Jabali
 */

class ProductFilter {
    constructor() {
        this.products = [];
        this.filteredProducts = [];
        this.filters = {
            categories: [],
            priceRange: { min: 0, max: Infinity },
            rating: 0,
            inStock: false
        };
        this.sortBy = 'default';
    }

    /**
     * Initialize filter system
     */
    init(products) {
        this.products = products;
        this.filteredProducts = [...products];
        this.attachEventListeners();
        this.renderProducts();
    }

    /**
     * Filter by category
     */
    filterByCategory(categories) {
        this.filters.categories = categories;
        this.applyFilters();
    }

    /**
     * Filter by price range
     */
    filterByPrice(min, max) {
        this.filters.priceRange = { min, max };
        this.applyFilters();
    }

    /**
     * Filter by rating
     */
    filterByRating(rating) {
        this.filters.rating = rating;
        this.applyFilters();
    }

    /**
     * Filter by stock availability
     */
    filterByStock(inStock) {
        this.filters.inStock = inStock;
        this.applyFilters();
    }

    /**
     * Apply all filters
     */
    applyFilters() {
        this.filteredProducts = this.products.filter(product => {
            // Category filter
            if (this.filters.categories.length > 0 &&
                !this.filters.categories.includes(product.category)) {
                return false;
            }

            // Price filter
            if (product.price < this.filters.priceRange.min ||
                product.price > this.filters.priceRange.max) {
                return false;
            }

            // Rating filter
            if (product.rating < this.filters.rating) {
                return false;
            }

            // Stock filter
            if (this.filters.inStock && !product.inStock) {
                return false;
            }

            return true;
        });

        this.sortProducts();
        this.renderProducts();
    }

    /**
     * Sort products
     */
    sortProducts() {
        switch (this.sortBy) {
            case 'price-low':
                this.filteredProducts.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                this.filteredProducts.sort((a, b) => b.price - a.price);
                break;
            case 'name-az':
                this.filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'name-za':
                this.filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
                break;
            case 'rating':
                this.filteredProducts.sort((a, b) => b.rating - a.rating);
                break;
            case 'newest':
                this.filteredProducts.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
                break;
            default:
                // Keep original order
                break;
        }
    }

    /**
     * Set sort method
     */
    setSortBy(sortMethod) {
        this.sortBy = sortMethod;
        this.sortProducts();
        this.renderProducts();
    }

    /**
     * Clear all filters
     */
    clearFilters() {
        this.filters = {
            categories: [],
            priceRange: { min: 0, max: Infinity },
            rating: 0,
            inStock: false
        };
        this.sortBy = 'default';
        this.applyFilters();
    }

    /**
     * Render filtered products
     */
    renderProducts() {
        const container = document.getElementById('products-container');
        if (!container) return;

        if (this.filteredProducts.length === 0) {
            container.innerHTML = `
        <div class="col-12 text-center py-5">
          <i class="fa-solid fa-box-open" style="font-size: 64px; color: #ddd;"></i>
          <h3 class="mt-3">No products found</h3>
          <p class="text-muted">Try adjusting your filters</p>
          <button class="btn btn-primary mt-3" onclick="productFilter.clearFilters()">
            Clear Filters
          </button>
        </div>
      `;
            return;
        }

        let html = '';
        this.filteredProducts.forEach(product => {
            html += this.createProductCard(product);
        });

        container.innerHTML = html;
        this.updateResultsCount();
    }

    /**
     * Create product card HTML
     */
    createProductCard(product) {
        return `
      <div class="col-xl-3 col-lg-4 col-md-6 mb-4">
        <div class="product-card-item">
          <div class="product-image">
            <img src="${product.image}" alt="${product.name}">
            ${product.onSale ? '<span class="badge bg-danger">Sale</span>' : ''}
            ${!product.inStock ? '<span class="badge bg-secondary">Out of Stock</span>' : ''}
            <ul class="social-icon">
              <li>
                <button class="add-to-cart-btn"
                        data-id="${product.id}"
                        data-name="${product.name}"
                        data-price="${product.price}"
                        data-image="${product.image}"
                        ${!product.inStock ? 'disabled' : ''}>
                  <i class="fa-regular fa-cart-shopping"></i>
                </button>
              </li>
              <li>
                <a href="product-details.html?id=${product.id}">
                  <i class="fa-regular fa-eye"></i>
                </a>
              </li>
              <li>
                <button class="add-to-wishlist-btn" data-id="${product.id}">
                  <i class="fa-regular fa-heart"></i>
                </button>
              </li>
            </ul>
          </div>
          <div class="product-content">
            <h4><a href="product-details.html?id=${product.id}">${product.name}</a></h4>
            <p>${product.category}</p>
            <div class="rating">
              ${this.renderStars(product.rating)}
              <span>(${product.reviews} reviews)</span>
            </div>
            <span class="price">
              ${product.onSale ?
                `<del>KES ${product.price.toFixed(2)}</del> KES ${product.salePrice.toFixed(2)}` :
                `KES ${product.price.toFixed(2)}`
            }
            </span>
          </div>
        </div>
      </div>
    `;
    }

    /**
     * Render star rating
     */
    renderStars(rating) {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                stars += '<i class="fas fa-star"></i>';
            } else if (i - 0.5 <= rating) {
                stars += '<i class="fas fa-star-half-alt"></i>';
            } else {
                stars += '<i class="far fa-star"></i>';
            }
        }
        return stars;
    }

    /**
     * Update results count
     */
    updateResultsCount() {
        const countElement = document.getElementById('results-count');
        if (countElement) {
            countElement.textContent = `Showing ${this.filteredProducts.length} of ${this.products.length} products`;
        }
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Category checkboxes
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('category-filter')) {
                const categories = Array.from(document.querySelectorAll('.category-filter:checked'))
                    .map(cb => cb.value);
                this.filterByCategory(categories);
            }
        });

        // Price range slider
        const priceMin = document.getElementById('price-min');
        const priceMax = document.getElementById('price-max');
        if (priceMin && priceMax) {
            const updatePrice = () => {
                this.filterByPrice(
                    parseFloat(priceMin.value) || 0,
                    parseFloat(priceMax.value) || Infinity
                );
            };
            priceMin.addEventListener('input', updatePrice);
            priceMax.addEventListener('input', updatePrice);
        }

        // Sort dropdown
        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.setSortBy(e.target.value);
            });
        }

        // Clear filters button
        const clearBtn = document.getElementById('clear-filters');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearFilters());
        }
    }
}

// Initialize
const productFilter = new ProductFilter();
window.productFilter = productFilter;
