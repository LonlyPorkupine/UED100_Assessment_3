$(document).ready(function() {

    // ===========================
    // MOBILE NAVIGATION TOGGLE
    // ===========================
    // When the menu toggle button is clicked, add/remove the "active" class to show/hide mobile nav
    $('#menu-toggle').click(function() {
        $('#nav-links').toggleClass('active');
    });

    // Close mobile navigation when a nav link is clicked
    $('#nav-links a').click(function() {
        $('#nav-links').removeClass('active');
    });

    // ===========================
    // CONTACT FORM VALIDATION
    // ===========================
    // Intercept form submission
    $('#contactUs').submit(function(e) {
        e.preventDefault(); // Prevent default form submission

        // Get form input values
        const name = $('#name').val().trim();
        const email = $('#email').val().trim();
        const message = $('#message').val().trim();

        // Clear previous error messages
        $('.form-error').text('');
        let hasError = false;

        // Simple empty field checks
        if (name === '') { 
            $('#name').next('.form-error').text('Please enter your name.'); 
            hasError = true; 
        }
        if (email === '') { 
            $('#email').next('.form-error').text('Please enter your email.'); 
            hasError = true; 
        }
        if (message === '') { 
            $('#message').next('.form-error').text('Please enter a message.'); 
            hasError = true; 
        }
        if (hasError) return; // Stop if there are errors

        // Validate name with regex (letters and spaces only)
        const namePattern = /^[a-zA-Z\s]+$/;
        if (!namePattern.test(name)) { 
            $('#name').next('.form-error').text('Please only use letters and spaces.'); 
            return; 
        }

        // Validate email with regex
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) { 
            $('#email').next('.form-error').text('Please enter a valid email address.'); 
            return; 
        }

        // Reset form fields
        $('#contactUs')[0].reset();

        // Remove any existing success messages
        $('.success-msg').remove();

        // Success message
        $('<div class="success-msg" role="alert" aria-live="assertive">Thank you! Your message has been sent.</div>')
            .css({
                color: '#ffffff',
                padding: '15px 20px',
                background: '#005eb8',
                border: '2px solid #e00034',
                borderRadius: '6px',
                marginTop: '15px',
                fontWeight: 'bold',
                textAlign: 'center',
                fontSize: '1.1rem',
                boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
            })
            .insertAfter('#contactUs') // Insert message after the form
            .hide() // Start hidden
            .slideDown(400) // Animate in
            .delay(5000)    // Display for 5 seconds
            .slideUp(600, function() { $(this).remove(); }); // Animate out and remove

    });
});

// ===========================
// PRODUCT GRID + MODAL + CART
// ===========================
document.addEventListener("DOMContentLoaded", () => {

    // ===========================
    // CART VARIABLES
    // ===========================
    // Initialize cart array and cache DOM elements for cart functionality
    let cart = [];
    const cartSidebar = document.getElementById("cart-sidebar");
    const cartOverlay = document.getElementById("cart-overlay");
    const cartItemsContainer = document.getElementById("cart-items");
    const cartCount = document.getElementById("cart-count");
    const cartTotal = document.getElementById("cart-total");
    const cartMessageContainer = document.getElementById("cart-message-container");
    const closeCartButtons = document.querySelectorAll("#close-cart, #cart-overlay");
    const clearCartBtn = document.getElementById("clear-cart-btn");
    const checkoutBtn = document.getElementById("checkout-btn");
    const cartIcon = document.getElementById("cart-icon");
    const modalAddBtn = document.getElementById("modal-add-btn");
    const floatingCartBtn = document.getElementById("floating-cart-btn");

    // ===========================
    // FUNCTION TO GENERATE PRODUCT CARDS
    // ===========================
    function generateProductGrid(gridId, productArray) {
        const grid = document.getElementById(gridId);
        if (!grid) return;

        productArray.forEach(product => {
            const col = document.createElement("div");
            col.className = "col-12 col-md-4 mb-3"; // full width on mobile, 1/3 width on md+
            col.innerHTML = `
                <div class="card h-100 shadow-sm product-card">
                    <img src="${product.img}" class="card-img-top" alt="${product.name}">
                    <div class="card-body">
                        <h5 class="card-title">${product.name}</h5>
                        <p class="card-text">${product.price}</p>
                    </div>
                    <div class="card-footer bg-white border-0">
                        <button class="btn kmart-btn w-100 add-btn">+ Add</button>
                    </div>
                </div>
            `;

            // Store product data on card element for modal/cart usage
            const cardDiv = col.querySelector(".product-card");
            cardDiv.dataset.name = product.name;
            cardDiv.dataset.price = product.price;
            cardDiv.dataset.desc = product.desc;
            cardDiv.dataset.img = product.img;

            grid.appendChild(col);
        });
    }

    // ===========================
    // GENERATE CHRISTMAS & REGULAR PRODUCT GRIDS
    // ===========================
    generateProductGrid("christmas-grid", christmasProducts);
    generateProductGrid("regular-grid", regularProducts);

    // ===========================
    // EVENT DELEGATION FOR PRODUCT CARDS
    // ===========================
    // Handles clicks on "Add" button and card itself for modal display
    ["christmas-grid", "regular-grid", "search-results-grid"].forEach(gridId => {
        const grid = document.getElementById(gridId);
        if (!grid) return;

        grid.addEventListener("click", (e) => {
            const addBtn = e.target.closest(".add-btn");
            if (addBtn) {
                e.stopPropagation();
                const card = addBtn.closest(".product-card");
                addProductToCart(card.dataset.name, parseFloat(card.dataset.price.replace("$","")), card.dataset.img);
                return;
            }

            // Open product modal when card is clicked
            const card = e.target.closest(".product-card");
            if (!card) return;

            document.getElementById("productModalLabel").textContent = card.dataset.name;
            document.getElementById("modal-price").textContent = card.dataset.price;
            document.getElementById("modal-desc").textContent = card.dataset.desc;
            document.getElementById("modal-img").src = card.dataset.img;

            const modal = new bootstrap.Modal(document.getElementById("productModal"));
            modal.show();
        });
        
    });

    // ===========================
    // MODAL ADD BUTTON CLICK
    // ===========================
    // Adds the product displayed in modal to cart
    modalAddBtn.addEventListener("click", () => {
        const name = document.getElementById("productModalLabel").textContent;
        const price = parseFloat(document.getElementById("modal-price").textContent.replace("$",""));
        const img = document.getElementById("modal-img").src;
        addProductToCart(name, price, img);
    });

    // ===========================
    // ADD PRODUCT TO CART FUNCTION
    // ===========================
    function addProductToCart(name, price, img) {
        const existing = cart.find(i => i.name === name);
        if (existing) existing.quantity += 1;
        else cart.push({ name, price, image: img, quantity: 1 });

        updateCart(); // Refresh cart display
        openCart();   // Automatically open cart sidebar
    }

    // ===========================
    // CART SIDEBAR FUNCTIONS
    // ===========================
    function openCart() {
        cartSidebar.classList.add("active");
        cartOverlay.classList.add("active");
    }

    function closeCart() {
        cartSidebar.classList.remove("active");
        cartOverlay.classList.remove("active");
    }

    // event listner for floating cart button
    floatingCartBtn.addEventListener("click", (e) => {
    e.preventDefault();
    openCart();
    });

    // ===========================
    // UPDATE CART DISPLAY
    // ===========================
    function updateCart() {
    cartItemsContainer.innerHTML = "";
    let total = 0;

    cart.forEach((item, index) => {
        const cartItem = document.createElement("div");
        cartItem.className = "cart-item";
        cartItem.dataset.index = index;
        cartItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div class="cart-item-details">
                <span>${item.name}</span>
                <span>$${item.price}</span>
            </div>
            <div class="cart-item-controls">
                <div class="qty-controls">
                    <button class="qty-btn minus" data-index="${index}">−</button>
                    <span class="qty-display">${item.quantity}</span>
                    <button class="qty-btn plus" data-index="${index}">+</button>
                </div>

                <button class="remove-item btn btn-sm btn-outline-danger">&times;</button>
            </div>
        `;
        cartItemsContainer.appendChild(cartItem);

        total += parseFloat(item.price) * item.quantity;
    });

    cartTotal.textContent = total.toFixed(2);

    // Update main cart count
    const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0);
    cartCount.textContent = totalItems;
    cartCount.style.display = totalItems > 0 ? "inline-block" : "none";

    // Update floating cart count
    if (floatingCartBtn) {
        const floatingCartCount = floatingCartBtn.querySelector("#floating-cart-count");
        if (floatingCartCount) {
            floatingCartCount.textContent = totalItems;
            floatingCartCount.style.display = totalItems > 0 ? "inline-block" : "none";
        }
    }
    }

    // Event listeners for quantity modification buttons
    document.addEventListener("click", function (e) {
    if (e.target.classList.contains("plus")) {
        const i = e.target.dataset.index;
        cart[i].quantity++;
        updateCart();
    }

    if (e.target.classList.contains("minus")) {
        const i = e.target.dataset.index;
        if (cart[i].quantity > 1) {
            cart[i].quantity--;
        }
        updateCart();
    }
    });

    // ======================================
    // APEAR AND DISAPEAR FLOATING CART BUTTON
    // ======================================
    const topNavbar = document.querySelector('.navbar'); 

    window.addEventListener('scroll', () => {
    const navbarBottom = topNavbar.getBoundingClientRect().bottom;

    if (navbarBottom < 0) {
        // Shows floating cart when user has scrolled past navbar
        floatingCartBtn.style.display = 'flex';
    } else {
        // Hides floating cart if navbar still visible
        floatingCartBtn.style.display = 'none';
    }
    });


    // ===========================
    // CART SIDEBAR EVENTS
    // ===========================

    // Remove a single item from the cart when the "remove" button is clicked
    cartItemsContainer.addEventListener("click", (e) => {
        // Check if the clicked element has the "remove-item" class
        if (e.target.classList.contains("remove-item")) {
            // Get the index of the cart item from the data attribute
            const index = parseInt(e.target.closest(".cart-item").dataset.index);
            // Remove the item from the cart array
            cart.splice(index, 1);
            // Update the cart UI and totals
            updateCart();
        }
    });

    // Update quantity when user changes the input value
    cartItemsContainer.addEventListener("input", (e) => {
        // Check if the input element has the "item-qty" class
        if (e.target.classList.contains("item-qty")) {
            // Get the index of the cart item
            const index = parseInt(e.target.closest(".cart-item").dataset.index);
            // Get the input value and ensure it is at least 1
            let qty = parseInt(e.target.value);
            if (qty < 1) qty = 1;
            e.target.value = qty;
            // Update the quantity in the cart array
            cart[index].quantity = qty;
            // Update the cart UI and totals
            updateCart();
        }
    });

    // Clear all items from the cart when the "clear cart" button is clicked
    clearCartBtn.addEventListener("click", () => {
        cart = []; // Empty the cart array
        updateCart(); // Refresh the cart UI
    });

    // Checkout button functionality
    checkoutBtn.addEventListener("click", () => {
        if (cart.length === 0) {
            // Show a message if the cart is empty
            showCartMessage("Your cart is empty!");
            return;
        }
        // Get the total amount from the cart total element
        const total = cartTotal.textContent;
        // Show a success message with the total
        showCartMessage(`Checkout successful! Total: $${total}`);
        // Empty the cart after checkout
        cart = [];
        updateCart();
    });

    // Close the cart sidebar when clicking any close button or overlay
    closeCartButtons.forEach(el => {
        el.addEventListener("click", closeCart);
    });

    // Open the cart sidebar when clicking the cart icon
    cartIcon.addEventListener("click", (e) => {
        e.preventDefault(); // Prevent default link behavior if cart icon is a link
        openCart(); // Open the cart sidebar
    });

    // ===========================
    // SHOW TEMPORARY CART MESSAGE
    // ===========================

    function showCartMessage(text) {
        // Create a new div element for the message
        const msg = document.createElement("div");
        msg.className = "success-msg"; // Add class for styling
        msg.textContent = text; // Set the message text

        // Apply inline styles to the message
        Object.assign(msg.style, {
            backgroundColor: "#005eb8",
            color: "white",
            fontWeight: "600",
            padding: "8px",
            border: "none",
            borderRadius: "4px",
            marginTop: "10px",
            textAlign: "center"
        });

        // Add the message to the cart message container
        cartMessageContainer.appendChild(msg);

        // Remove the message automatically after 3.6 seconds
        setTimeout(() => msg.remove(), 3600);
    }

    // ===========================
    // SEARCH BAR FUNCTION
    // ===========================

    // Add an event listener to the search form to handle the 'submit' event
    document.getElementById('searchForm').addEventListener('submit', function(e) {
        // Prevent the default form submission behavior (page reload)
        e.preventDefault();

        // Get the search input value, convert to lowercase, and trim whitespace
        const query = document.getElementById('searchInput').value.toLowerCase().trim();

        // Get references to the results container and results title elements
        const resultsGrid = document.getElementById('search-results-grid');
        const resultsTitle = document.getElementById('search-results-title');

        // Clear any previous search results
        resultsGrid.innerHTML = '';

        // Filter regular products that match the search query (case-insensitive)
        const filteredRegular = regularProducts
            .filter(p => p.name.toLowerCase().includes(query))
            .map(p => p.name); // Extract only the product names

        // Filter Christmas products that match the search query
        const filteredChristmas = christmasProducts
            .filter(p => p.name.toLowerCase().includes(query))
            .map(p => p.name); // Extract only the product names

        // Combine filtered results from both categories
        const allNames = [...filteredRegular, ...filteredChristmas];

        if (allNames.length > 0 && query !== '') {
            // If there are matching results and the query is not empty

            // Display the results title and show the query
            resultsTitle.style.display = 'block';
            resultsTitle.textContent = `Search Results for "${query}"`;

            // Retrieve full product objects by name
            const fullResults = allNames.map(name => getProductByName(name));

            // Generate the product grid to display the search results
            generateProductGrid('search-results-grid', fullResults);

            // Scroll to the search results section (smoothly) for better UX on mobile
            document.getElementById('search-results').scrollIntoView({ behavior: 'smooth', block: 'start' });

            // Remove focus from the search input
            document.getElementById('searchInput').blur();

        } else if (query !== '') {
            // If no results found but the query is not empty
            resultsTitle.style.display = 'block';
            resultsTitle.textContent = `No results found for "${query}"`;
        } else {
            // If the search query is empty, hide the results title and clear the grid
            resultsTitle.style.display = 'none';
            resultsGrid.innerHTML = '';
        }
    });

    // Helper function to find a product object by name
    function getProductByName(name) {
        // Search regular products first, then Christmas products
        return regularProducts.find(p => p.name === name) ||
            christmasProducts.find(p => p.name === name);
    }
});