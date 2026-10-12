let products = [];

const productGrid = document.getElementById("productGrid");
const emptyState = document.getElementById("emptyState");
const searchInput = document.getElementById("searchInput");
const filterButtons = document.querySelectorAll(".filter-button");

let currentCategory = "all";

const API_BASE_URL = "http://127.0.0.1:5000/api";

async function loadProducts() {
    productGrid.innerHTML = `
        <div class="empty-state">
            <h3>Loading products...</h3>
            <p>Please wait while NOVA Market loads the latest products.</p>
        </div>
    `;

    try {
        const response = await fetch(`${API_BASE_URL}/products`);

        if (!response.ok) {
            throw new Error(
                `Product request failed with status ${response.status}`
            );
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
            throw new Error(
                "The products API returned an invalid response."
            );
        }

        products = data;

        displayProducts(products);
        updateCartBadge();
        updateWishlistBadge();

        if (cartDrawerExists()) {
            renderCart();
        }

        if (wishlistDrawerExists()) {
            renderWishlist();
        }

    } catch (error) {

        console.error(
            "NOVA Market product loading error:",
            error
        );

        productGrid.innerHTML = `
            <div class="empty-state">
                <h3>Unable to load products</h3>
                <p>
                    Please make sure the NOVA Market backend
                    is running on port 5000, then refresh the page.
                </p>
            </div>
        `;
    }
}

function cartDrawerExists() {
    return Boolean(
        document.getElementById("cartDrawer")
    );
}

function wishlistDrawerExists() {
    return Boolean(
        document.getElementById("wishlistDrawer")
    );
}

let cart =
    JSON.parse(
        localStorage.getItem("novaCart")
    ) || [];

let wishlist =
    JSON.parse(
        localStorage.getItem("novaWishlist")
    ) || [];

function saveCart() {
    localStorage.setItem(
        "novaCart",
        JSON.stringify(cart)
    );
}

function saveWishlist() {
    localStorage.setItem(
        "novaWishlist",
        JSON.stringify(wishlist)
    );
}

function displayProducts(productList) {

    productGrid.innerHTML = "";

    if (productList.length === 0) {

        emptyState.style.display = "block";

        return;
    }

    emptyState.style.display = "none";

    productList.forEach(product => {

        const isWishlisted =
            wishlist.includes(product.id);

        const productCard =
            document.createElement("article");

        productCard.className =
            "product-card";

        productCard.innerHTML = `

            <div class="product-image">

                <img
                    src="${product.image}"
                    alt="${product.name}"
                    loading="lazy"
                >

                <button
                    class="wishlist-button ${
                        isWishlisted ? "active" : ""
                    }"
                    data-id="${product.id}"
                    aria-label="Add ${
                        product.name
                    } to wishlist"
                >
                    ${
                        isWishlisted
                            ? "♥"
                            : "♡"
                    }
                </button>

            </div>

            <div class="product-info">

                <div class="product-category">
                    ${product.category}
                </div>

                <h3 class="product-name">
                    ${product.name}
                </h3>

                <div class="product-rating">
                    ★ ${product.rating}
                    <span>
                        (${product.reviews})
                    </span>
                </div>

                <div class="product-price-row">

                    <div>

                        <div class="product-price">
                            $${product.price.toFixed(2)}
                        </div>

                        <div class="product-old-price">
                            $${product.oldPrice.toFixed(2)}
                        </div>

                    </div>

                    <button
                        class="add-cart-button"
                        data-id="${product.id}"
                        aria-label="Add ${
                            product.name
                        } to cart"
                    >
                        🛒
                    </button>

                </div>

            </div>
        `;

        productGrid.appendChild(
            productCard
        );
    });

    attachProductEvents();
}

function filterProducts() {

    const searchTerm =
        searchInput.value
            .toLowerCase()
            .trim();

    const filteredProducts =
        products.filter(product => {

            const matchesCategory =
                currentCategory === "all" ||
                product.category
                    .toLowerCase() ===
                currentCategory.toLowerCase();

            const matchesSearch =
                product.name
                    .toLowerCase()
                    .includes(searchTerm) ||
                product.category
                    .toLowerCase()
                    .includes(searchTerm);

            return (
                matchesCategory &&
                matchesSearch
            );
        });

    displayProducts(
        filteredProducts
    );
}

filterButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            filterButtons.forEach(btn => {
                btn.classList.remove(
                    "active"
                );
            });

            button.classList.add(
                "active"
            );

            currentCategory =
                button.dataset.category;

            filterProducts();
        }
    );
});

searchInput.addEventListener(
    "input",
    () => {
        filterProducts();
    }
);

function attachProductEvents() {

    const productCards =
        document.querySelectorAll(
            ".product-card"
        );

    productCards.forEach(card => {

        card.addEventListener(
            "click",
            event => {

                if (
                    event.target.closest(
                        ".wishlist-button"
                    ) ||
                    event.target.closest(
                        ".add-cart-button"
                    )
                ) {
                    return;
                }

                const productId =
                    Number(
                        card.querySelector(
                            ".wishlist-button"
                        ).dataset.id
                    );

                openProductModal(
                    productId
                );
            }
        );
    });

    const cartButtons =
        document.querySelectorAll(
            ".add-cart-button"
        );

    const wishlistButtons =
        document.querySelectorAll(
            ".wishlist-button"
        );

    cartButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const productId =
                    Number(
                        button.dataset.id
                    );

                addToCart(productId);
            }
        );
    });

    wishlistButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const productId =
                    Number(
                        button.dataset.id
                    );

                toggleWishlist(
                    productId
                );
            }
        );
    });
}

function addToCart(productId) {

    const existingProduct =
        cart.find(
            item =>
                item.id === productId
        );

    if (existingProduct) {

        existingProduct.quantity += 1;

    } else {

        cart.push({
            id: productId,
            quantity: 1
        });
    }

    saveCart();

    updateCartBadge();

    const product =
        products.find(
            item =>
                item.id === productId
        );

    if (product) {
        alert(
            `${product.name} added to cart!`
        );
    }
}

function toggleWishlist(productId) {

    if (wishlist.includes(productId)) {

        wishlist =
            wishlist.filter(
                id =>
                    id !== productId
            );

    } else {

        wishlist.push(
            productId
        );
    }

    saveWishlist();

    filterProducts();

    updateWishlistBadge();
}

function updateCartBadge() {

    const cartBadge =
        document.querySelector(
            "#cartButton .badge"
        );

    if (!cartBadge) return;

    const totalItems =
        cart.reduce(
            (total, item) =>
                total + item.quantity,
            0
        );

    cartBadge.textContent =
        totalItems;
}

function updateWishlistBadge() {

    const wishlistBadge =
        document.querySelector(
            "#wishlistButton .badge"
        );

    if (!wishlistBadge) return;

    wishlistBadge.textContent =
        wishlist.length;
}

const categoryCards =
    document.querySelectorAll(
        ".category-card"
    );

categoryCards.forEach(card => {

    card.addEventListener(
        "click",
        () => {

            const categoryName =
                card.querySelector(
                    "h3"
                ).textContent.trim();

            const categoryMap = {
                "Home & Living": "Home"
            };

            currentCategory =
                categoryMap[
                    categoryName
                ] || categoryName;

            filterButtons.forEach(
                button => {

                    if (
                        button.dataset.category
                            .toLowerCase() ===
                        currentCategory
                            .toLowerCase()
                    ) {

                        button.classList.add(
                            "active"
                        );

                    } else {

                        button.classList.remove(
                            "active"
                        );
                    }
                }
            );

            document
                .querySelector(
                    ".products-section"
                )
                .scrollIntoView({
                    behavior: "smooth"
                });

            filterProducts();
        }
    );
});

loadProducts();
// ===============================
// CART DRAWER
// ===============================

const cartOverlay =
    document.getElementById(
        "cartOverlay"
    );

const cartDrawer =
    document.getElementById(
        "cartDrawer"
    );

const closeCartButton =
    document.getElementById(
        "closeCart"
    );

const cartItemsContainer =
    document.getElementById(
        "cartItems"
    );

const cartTotalElement =
    document.getElementById(
        "cartTotal"
    );

const cartButton =
    document.getElementById(
        "cartButton"
    );

const wishlistButton =
    document.getElementById(
        "wishlistButton"
    );

const searchButton =
    document.getElementById(
        "searchButton"
    );

function openCart() {

    if (!cartOverlay) return;

    renderCart();

    cartOverlay.classList.add(
        "active"
    );

    document.body.style.overflow =
        "hidden";
}

function closeCart() {

    if (!cartOverlay) return;

    cartOverlay.classList.remove(
        "active"
    );

    document.body.style.overflow =
        "";
}

if (cartButton) {

    cartButton.addEventListener(
        "click",
        openCart
    );
}

if (closeCartButton) {

    closeCartButton.addEventListener(
        "click",
        closeCart
    );
}

if (cartOverlay) {

    cartOverlay.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                cartOverlay
            ) {
                closeCart();
            }
        }
    );
}

function renderCart() {

    if (!cartItemsContainer) {
        return;
    }

    if (cart.length === 0) {

        cartItemsContainer.innerHTML = `
            <div class="cart-empty">
                <div class="cart-empty-icon">
                    🛒
                </div>

                <h3>Your cart is empty</h3>

                <p>
                    Add some products to
                    your cart to get started.
                </p>
            </div>
        `;

        if (cartTotalElement) {
            cartTotalElement.textContent =
                "$0.00";
        }

        return;
    }

    let total = 0;

    cartItemsContainer.innerHTML = "";

    cart.forEach(cartItem => {

        const product =
            products.find(
                item =>
                    item.id ===
                    cartItem.id
            );

        if (!product) return;

        const itemTotal =
            product.price *
            cartItem.quantity;

        total += itemTotal;

        const cartItemElement =
            document.createElement(
                "div"
            );

        cartItemElement.className =
            "cart-item";

        cartItemElement.innerHTML = `

            <img
                class="cart-item-image"
                src="${product.image}"
                alt="${product.name}"
            >

            <div class="cart-item-info">

                <h4>
                    ${product.name}
                </h4>

                <p>
                    $${product.price.toFixed(2)}
                </p>

                <div class="cart-item-controls">

                    <button
                        class="quantity-button"
                        data-action="decrease"
                        data-id="${product.id}"
                        aria-label="Decrease quantity"
                    >
                        −
                    </button>

                    <span>
                        ${cartItem.quantity}
                    </span>

                    <button
                        class="quantity-button"
                        data-action="increase"
                        data-id="${product.id}"
                        aria-label="Increase quantity"
                    >
                        +
                    </button>

                    <button
                        class="remove-item"
                        data-id="${product.id}"
                    >
                        Remove
                    </button>

                </div>

            </div>

            <div class="cart-item-total">
                $${itemTotal.toFixed(2)}
            </div>
        `;

        cartItemsContainer.appendChild(
            cartItemElement
        );
    });

    if (cartTotalElement) {

        cartTotalElement.textContent =
            `$${total.toFixed(2)}`;
    }

    attachCartEvents();
}

function attachCartEvents() {

    const quantityButtons =
        document.querySelectorAll(
            ".quantity-button"
        );

    quantityButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const productId =
                        Number(
                            button.dataset.id
                        );

                    const action =
                        button.dataset.action;

                    updateCartQuantity(
                        productId,
                        action
                    );
                }
            );
        }
    );

    const removeButtons =
        document.querySelectorAll(
            ".remove-item"
        );

    removeButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const productId =
                        Number(
                            button.dataset.id
                        );

                    removeFromCart(
                        productId
                    );
                }
            );
        }
    );
}

function updateCartQuantity(
    productId,
    action
) {

    const item =
        cart.find(
            cartItem =>
                cartItem.id ===
                productId
        );

    if (!item) return;

    if (action === "increase") {
        item.quantity += 1;
    }

    if (action === "decrease") {
        item.quantity -= 1;
    }

    if (item.quantity <= 0) {

        cart =
            cart.filter(
                cartItem =>
                    cartItem.id !==
                    productId
            );
    }

    saveCart();

    updateCartBadge();

    renderCart();
}

function removeFromCart(
    productId
) {

    cart =
        cart.filter(
            item =>
                item.id !==
                productId
        );

    saveCart();

    updateCartBadge();

    renderCart();
}


// ===============================
// WISHLIST DRAWER
// ===============================

const wishlistOverlay =
    document.getElementById(
        "wishlistOverlay"
    );

const wishlistDrawer =
    document.getElementById(
        "wishlistDrawer"
    );

const closeWishlistButton =
    document.getElementById(
        "closeWishlist"
    );

const wishlistItemsContainer =
    document.getElementById(
        "wishlistItems"
    );

function openWishlist() {

    if (!wishlistOverlay) return;

    renderWishlist();

    wishlistOverlay.classList.add(
        "active"
    );

    document.body.style.overflow =
        "hidden";
}

function closeWishlist() {

    if (!wishlistOverlay) return;

    wishlistOverlay.classList.remove(
        "active"
    );

    document.body.style.overflow =
        "";
}

if (wishlistButton) {

    wishlistButton.addEventListener(
        "click",
        openWishlist
    );
}

if (closeWishlistButton) {

    closeWishlistButton.addEventListener(
        "click",
        closeWishlist
    );
}

if (wishlistOverlay) {

    wishlistOverlay.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                wishlistOverlay
            ) {
                closeWishlist();
            }
        }
    );
}

function renderWishlist() {

    if (!wishlistItemsContainer) {
        return;
    }

    if (wishlist.length === 0) {

        wishlistItemsContainer.innerHTML = `
            <div class="wishlist-empty">

                <div class="wishlist-empty-icon">
                    ♡
                </div>

                <h3>
                    Your wishlist is empty
                </h3>

                <p>
                    Save products you love
                    for later.
                </p>

            </div>
        `;

        return;
    }

    wishlistItemsContainer.innerHTML =
        "";

    wishlist.forEach(
        productId => {

            const product =
                products.find(
                    item =>
                        item.id ===
                        productId
                );

            if (!product) return;

            const wishlistItem =
                document.createElement(
                    "div"
                );

            wishlistItem.className =
                "wishlist-item";

            wishlistItem.innerHTML = `

                <img
                    class="wishlist-item-image"
                    src="${product.image}"
                    alt="${product.name}"
                >

                <div class="wishlist-item-info">

                    <div class="wishlist-item-category">
                        ${product.category}
                    </div>

                    <h4>
                        ${product.name}
                    </h4>

                    <div class="wishlist-item-price">
                        $${product.price.toFixed(2)}
                    </div>

                    <div class="wishlist-actions">

                        <button
                            class="wishlist-cart-button"
                            data-id="${product.id}"
                        >
                            Add to Cart
                        </button>

                        <button
                            class="wishlist-remove-button"
                            data-id="${product.id}"
                        >
                            Remove
                        </button>

                    </div>

                </div>
            `;

            wishlistItemsContainer.appendChild(
                wishlistItem
            );
        }
    );

    attachWishlistEvents();
}

function attachWishlistEvents() {

    const addButtons =
        document.querySelectorAll(
            ".wishlist-cart-button"
        );

    addButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const productId =
                        Number(
                            button.dataset.id
                        );

                    addToCart(
                        productId
                    );
                }
            );
        }
    );

    const removeButtons =
        document.querySelectorAll(
            ".wishlist-remove-button"
        );

    removeButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const productId =
                        Number(
                            button.dataset.id
                        );

                    toggleWishlist(
                        productId
                    );

                    renderWishlist();
                }
            );
        }
    );
}


// ===============================
// SEARCH BUTTON
// ===============================

if (searchButton) {

    searchButton.addEventListener(
        "click",
        () => {

            const productsSection =
                document.querySelector(
                    ".products-section"
                );

            if (productsSection) {

                productsSection.scrollIntoView({
                    behavior: "smooth"
                });
            }

            if (searchInput) {

                setTimeout(
                    () => {
                        searchInput.focus();
                    },
                    500
                );
            }
        }
    );
}
// ===============================
// PRODUCT DETAILS MODAL
// ===============================

const productModalOverlay =
    document.getElementById(
        "productModalOverlay"
    );

const closeProductModalButton =
    document.getElementById(
        "closeProductModal"
    );

const modalProductImage =
    document.getElementById(
        "modalProductImage"
    );

const modalProductName =
    document.getElementById(
        "modalProductName"
    );

const modalProductCategory =
    document.getElementById(
        "modalProductCategory"
    );

const modalProductRating =
    document.getElementById(
        "modalProductRating"
    );

const modalProductDescription =
    document.getElementById(
        "modalProductDescription"
    );

const modalProductPrice =
    document.getElementById(
        "modalProductPrice"
    );

const modalProductOldPrice =
    document.getElementById(
        "modalProductOldPrice"
    );

const modalQuantityInput =
    document.getElementById(
        "modalQuantity"
    );

const modalAddCartButton =
    document.getElementById(
        "modalAddCart"
    );

const modalWishlistButton =
    document.getElementById(
        "modalWishlist"
    );

let currentModalProductId =
    null;

function openProductModal(
    productId
) {

    const product =
        products.find(
            item =>
                item.id ===
                productId
        );

    if (!product) {
        console.error(
            "Product not found:",
            productId
        );
        return;
    }

    currentModalProductId =
        productId;

    if (modalProductImage) {

        modalProductImage.src =
            product.image;

        modalProductImage.alt =
            product.name;
    }

    if (modalProductName) {

        modalProductName.textContent =
            product.name;
    }

    if (modalProductCategory) {

        modalProductCategory.textContent =
            product.category;
    }

    if (modalProductRating) {

        modalProductRating.innerHTML = `
            ★ ${product.rating}
            <span>
                (${product.reviews} reviews)
            </span>
        `;
    }

    if (modalProductDescription) {

        modalProductDescription.textContent =
            product.description ||
            "No description is available for this product.";
    }

    if (modalProductPrice) {

        modalProductPrice.textContent =
            `$${product.price.toFixed(2)}`;
    }

    if (modalProductOldPrice) {

        if (product.oldPrice) {

            modalProductOldPrice.textContent =
                `$${product.oldPrice.toFixed(2)}`;

            modalProductOldPrice.style.display =
                "inline";

        } else {

            modalProductOldPrice.style.display =
                "none";
        }
    }

    if (modalQuantityInput) {

        modalQuantityInput.value = 1;
    }

    updateModalWishlistButton();

    if (productModalOverlay) {

        productModalOverlay.classList.add(
            "active"
        );

        document.body.style.overflow =
            "hidden";
    }
}

function closeProductModal() {

    if (!productModalOverlay) {
        return;
    }

    productModalOverlay.classList.remove(
        "active"
    );

    document.body.style.overflow =
        "";

    currentModalProductId =
        null;
}

if (closeProductModalButton) {

    closeProductModalButton.addEventListener(
        "click",
        closeProductModal
    );
}

if (productModalOverlay) {

    productModalOverlay.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                productModalOverlay
            ) {
                closeProductModal();
            }
        }
    );
}

function updateModalWishlistButton() {

    if (
        !modalWishlistButton ||
        currentModalProductId === null
    ) {
        return;
    }

    const isWishlisted =
        wishlist.includes(
            currentModalProductId
        );

    modalWishlistButton.textContent =
        isWishlisted
            ? "♥ Remove from Wishlist"
            : "♡ Add to Wishlist";

    modalWishlistButton.classList.toggle(
        "active",
        isWishlisted
    );
}

if (modalWishlistButton) {

    modalWishlistButton.addEventListener(
        "click",
        () => {

            if (
                currentModalProductId ===
                null
            ) {
                return;
            }

            toggleWishlist(
                currentModalProductId
            );

            updateModalWishlistButton();
        }
    );
}

if (modalAddCartButton) {

    modalAddCartButton.addEventListener(
        "click",
        () => {

            if (
                currentModalProductId ===
                null
            ) {
                return;
            }

            let quantity = 1;

            if (modalQuantityInput) {

                quantity =
                    Number(
                        modalQuantityInput.value
                    );

                if (
                    !Number.isInteger(
                        quantity
                    ) ||
                    quantity < 1
                ) {
                    quantity = 1;
                }
            }

            const existingProduct =
                cart.find(
                    item =>
                        item.id ===
                        currentModalProductId
                );

            if (existingProduct) {

                existingProduct.quantity +=
                    quantity;

            } else {

                cart.push({
                    id:
                        currentModalProductId,
                    quantity:
                        quantity
                });
            }

            saveCart();

            updateCartBadge();

            const product =
                products.find(
                    item =>
                        item.id ===
                        currentModalProductId
                );

            if (product) {

                alert(
                    `${quantity} × ${product.name} added to cart!`
                );
            }

            closeProductModal();
        }
    );
}


// ===============================
// MODAL QUANTITY CONTROLS
// ===============================

const quantityDecreaseButton =
    document.getElementById(
        "quantityDecrease"
    );

const quantityIncreaseButton =
    document.getElementById(
        "quantityIncrease"
    );

if (quantityDecreaseButton) {

    quantityDecreaseButton.addEventListener(
        "click",
        () => {

            if (!modalQuantityInput) {
                return;
            }

            let quantity =
                Number(
                    modalQuantityInput.value
                );

            quantity = Math.max(
                1,
                quantity - 1
            );

            modalQuantityInput.value =
                quantity;
        }
    );
}

if (quantityIncreaseButton) {

    quantityIncreaseButton.addEventListener(
        "click",
        () => {

            if (!modalQuantityInput) {
                return;
            }

            let quantity =
                Number(
                    modalQuantityInput.value
                );

            quantity += 1;

            modalQuantityInput.value =
                quantity;
        }
    );
}

if (modalQuantityInput) {

    modalQuantityInput.addEventListener(
        "change",
        () => {

            let quantity =
                Number(
                    modalQuantityInput.value
                );

            if (
                !Number.isInteger(
                    quantity
                ) ||
                quantity < 1
            ) {
                quantity = 1;
            }

            modalQuantityInput.value =
                quantity;
        }
    );
}


// ===============================
// ESCAPE KEY
// ===============================

document.addEventListener(
    "keydown",
    event => {

        if (event.key !== "Escape") {
            return;
        }

        closeCart();
        closeWishlist();
        closeProductModal();
    }
);
// ===============================
// CHECKOUT
// ===============================

const checkoutOverlay =
    document.getElementById(
        "checkoutOverlay"
    );

const closeCheckoutButton =
    document.getElementById(
        "closeCheckout"
    );

const checkoutForm =
    document.getElementById(
        "checkoutForm"
    );

const checkoutItemsContainer =
    document.getElementById(
        "checkoutItems"
    );

const checkoutTotalElement =
    document.getElementById(
        "checkoutTotal"
    );

const successOverlay =
    document.getElementById(
        "successOverlay"
    );

const closeSuccessButton =
    document.getElementById(
        "closeSuccess"
    );

const orderNumberElement =
    document.getElementById(
        "orderNumber"
    );


// ===============================
// OPEN CHECKOUT
// ===============================

function openCheckout() {

    if (cart.length === 0) {

        alert(
            "Your cart is empty. Please add a product before checking out."
        );

        return;
    }

    if (!checkoutOverlay) {
        console.error(
            "Checkout overlay was not found."
        );
        return;
    }

    renderCheckout();

    checkoutOverlay.classList.add(
        "active"
    );

    document.body.style.overflow =
        "hidden";
}


// ===============================
// CLOSE CHECKOUT
// ===============================

function closeCheckout() {

    if (!checkoutOverlay) {
        return;
    }

    checkoutOverlay.classList.remove(
        "active"
    );

    document.body.style.overflow =
        "";
}


if (closeCheckoutButton) {

    closeCheckoutButton.addEventListener(
        "click",
        closeCheckout
    );
}


if (checkoutOverlay) {

    checkoutOverlay.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                checkoutOverlay
            ) {

                closeCheckout();
            }
        }
    );
}


// ===============================
// CHECKOUT SUMMARY
// ===============================

function renderCheckout() {

    if (!checkoutItemsContainer) {
        return;
    }

    checkoutItemsContainer.innerHTML =
        "";

    let total = 0;

    cart.forEach(cartItem => {

        const product =
            products.find(
                item =>
                    item.id ===
                    cartItem.id
            );

        if (!product) {
            return;
        }

        const itemTotal =
            product.price *
            cartItem.quantity;

        total += itemTotal;

        const checkoutItem =
            document.createElement(
                "div"
            );

        checkoutItem.className =
            "checkout-item";

        checkoutItem.innerHTML = `

            <img
                src="${product.image}"
                alt="${product.name}"
            >

            <div>
                <h4>
                    ${product.name}
                </h4>

                <p>
                    ${cartItem.quantity}
                    ×
                    $${product.price.toFixed(2)}
                </p>
            </div>

            <strong>
                $${itemTotal.toFixed(2)}
            </strong>

        `;

        checkoutItemsContainer.appendChild(
            checkoutItem
        );
    });

    if (checkoutTotalElement) {

        checkoutTotalElement.textContent =
            `$${total.toFixed(2)}`;
    }
}


// ===============================
// CONNECT CHECKOUT BUTTON
// ===============================

const checkoutButton =
    document.querySelector(
        ".checkout-button"
    );

if (checkoutButton) {

    checkoutButton.addEventListener(
        "click",
        () => {

            openCheckout();
        }
    );
}


// ===============================
// PLACE ORDER
// ===============================

if (checkoutForm) {

    checkoutForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            if (cart.length === 0) {

                alert(
                    "Your cart is empty."
                );

                return;
            }

            const submitButton =
                checkoutForm.querySelector(
                    ".place-order-button"
                );

            if (submitButton) {

                submitButton.disabled =
                    true;

                submitButton.textContent =
                    "Processing Order...";
            }

            try {

                const formData =
                    new FormData(
                        checkoutForm
                    );

                const customer = {

                    firstName:
                        formData.get(
                            "firstName"
                        ),

                    lastName:
                        formData.get(
                            "lastName"
                        ),

                    email:
                        formData.get(
                            "email"
                        ),

                    phone:
                        formData.get(
                            "phone"
                        ),

                    address:
                        formData.get(
                            "address"
                        ),

                    city:
                        formData.get(
                            "city"
                        ),

                    postalCode:
                        formData.get(
                            "postalCode"
                        ),

                    paymentMethod:
                        formData.get(
                            "paymentMethod"
                        )
                };


                // Calculate order total

                let orderTotal = 0;

                const orderItems =
                    cart.map(
                        cartItem => {

                            const product =
                                products.find(
                                    item =>
                                        item.id ===
                                        cartItem.id
                                );

                            if (!product) {
                                return null;
                            }

                            const itemTotal =
                                product.price *
                                cartItem.quantity;

                            orderTotal +=
                                itemTotal;

                            return {

                                productId:
                                    product.id,

                                productName:
                                    product.name,

                                quantity:
                                    cartItem.quantity,

                                price:
                                    product.price,

                                total:
                                    itemTotal
                            };
                        }
                    )
                    .filter(
                        item =>
                            item !== null
                    );


                // Generate order number

                const orderNumber =
                    "NOVA-" +
                    Date.now()
                        .toString()
                        .slice(-8);


                // Create order object

                const order = {

                    orderNumber:
                        orderNumber,

                    customer:
                        customer,

                    items:
                        orderItems,

                    total:
                        Number(
                            orderTotal.toFixed(2)
                        ),

                    status:
                        "Pending",

                    createdAt:
                        new Date()
                            .toISOString()
                };


                /*
                 * Save order locally for now.
                 *
                 * We will connect this to the
                 * Flask /api/orders endpoint
                 * in the next backend step.
                 */

                const existingOrders =
                    JSON.parse(
                        localStorage.getItem(
                            "novaOrders"
                        )
                    ) || [];

                existingOrders.push(
                    order
                );

                localStorage.setItem(
                    "novaOrders",
                    JSON.stringify(
                        existingOrders
                    )
                );


                // Clear cart

                cart = [];

                saveCart();

                updateCartBadge();

                renderCart();


                // Close checkout

                closeCheckout();


                // Show success message

                showOrderSuccess(
                    orderNumber
                );


                // Reset form

                checkoutForm.reset();

            } catch (error) {

                console.error(
                    "Checkout error:",
                    error
                );

                alert(
                    "Something went wrong while processing your order. Please try again."
                );

            } finally {

                if (submitButton) {

                    submitButton.disabled =
                        false;

                    submitButton.textContent =
                        "Place Order";
                }
            }
        }
    );
}


// ===============================
// ORDER SUCCESS
// ===============================

function showOrderSuccess(
    orderNumber
) {

    if (!successOverlay) {

        alert(
            `Order ${orderNumber} placed successfully!`
        );

        return;
    }

    if (orderNumberElement) {

        orderNumberElement.textContent =
            orderNumber;
    }

    successOverlay.classList.add(
        "active"
    );

    document.body.style.overflow =
        "hidden";
}


function closeOrderSuccess() {

    if (!successOverlay) {
        return;
    }

    successOverlay.classList.remove(
        "active"
    );

    document.body.style.overflow =
        "";
}


if (closeSuccessButton) {

    closeSuccessButton.addEventListener(
        "click",
        closeOrderSuccess
    );
}


if (successOverlay) {

    successOverlay.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                successOverlay
            ) {

                closeOrderSuccess();
            }
        }
    );
}


// ===============================
// PROFILE BUTTON
// ===============================

const profileButton =
    document.getElementById(
        "profileButton"
    );

if (profileButton) {

    profileButton.addEventListener(
        "click",
        () => {

            alert(
                "Customer account functionality is coming next."
            );
        }
    );
}


// ===============================
// INITIAL UI STATE
// ===============================

updateCartBadge();

updateWishlistBadge();