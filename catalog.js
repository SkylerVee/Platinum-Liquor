// 1. INITIALIZE CLIENT CONFIGURATION CONNECTION TO SUPABASE
// The site is using plain browser scripts, so the client is read from the global window object.
const supabaseClient = window.supabaseClient;

// Global operational variables to hold data fetched live from database schema
let allProducts = [];
let allVariants = [];
let localShoppingCart = [];

// 2. FETCH LIQUOR ASSETS AUTOMATICALLY ON PAGE LOAD
async function loadPremiumCatalog() {
    const gridContainer = document.getElementById('liquor-catalog-grid');

    if (!supabaseClient) {
        if (gridContainer) {
            gridContainer.innerHTML = '<p class="loading-status" style="color:#ff4d4d;">Supabase is not configured yet. Add your project URL and anon key to the page before loading the catalog.</p>';
        }
        return;
    }

    const { data: productsData, error: prodError } = await supabaseClient.from('products').select('*');
    const { data: variantsData, error: varError } = await supabaseClient.from('product_variants').select('*');

    if (prodError || varError) {
        console.error("Database Connection Glitch:", prodError || varError);
        document.getElementById('liquor-catalog-grid').innerHTML = 
            `<p class="loading-status" style="color:#ff4d4d;">Could not establish secure data pathway pipeline.</p>`;
        return;
    }

    // Cache the arrays inside global runtime pointers
    allProducts = productsData;
    allVariants = variantsData;

    // Load active saved shopping layout cart item counts from browser cookies/memory
    initializeCartTracker();

    // Draw the store interface dynamically
    renderShopGrid(allProducts);
}

// 3. RENDER THE CARD LAYOUTS DYNAMICALLY
function renderShopGrid(productsToRender) {
    const gridContainer = document.getElementById('liquor-catalog-grid');
    gridContainer.innerHTML = ""; // Wipe loading messages

    if (productsToRender.length === 0) {
        gridContainer.innerHTML = `<p class="loading-status">No matching bottles found in current store stock.</p>`;
        return;
    }

    productsToRender.forEach(bottle => {
        // Filter out all variant rows belonging specifically to this one bottle ID
        const bottleVariants = allVariants.filter(v => v.product_id === bottle.id);
        
        // Skip drawing the bottle card if it doesn't have any pricing variants set up yet
        if (bottleVariants.length === 0) return;

        // Build the dropdown string elements iteratively
        let dropdownHtmlOptions = "";
        bottleVariants.forEach(variant => {
            const outOfStockFlag = variant.stock <= 0 ? " (Out of stock)" : "";
            const isDisabledAttribute = variant.stock <= 0 ? "disabled" : "";
            
            dropdownHtmlOptions += `
                <option value="${variant.id}" data-price="${variant.price}" ${isDisabledAttribute}>
                    ${variant.size}${outOfStockFlag}
                </option>
            `;
        });

        // Initialize display configuration using the first available pricing slot
        const initialVariant = bottleVariants[0];

        // Create item card element node structure layout blueprint
        const productCard = document.createElement('div');
        productCard.className = 'bottle-luxury-card';
        productCard.innerHTML = `
            <div class="bottle-img-wrapper">
                <img src="${bottle.image_url || 'https://unsplash.com'}" alt="${bottle.name}">
            </div>
            <div class="bottle-details-panel">
                <span class="bottle-tag-chip">${bottle.category}</span>
                <h3>${bottle.name}</h3>
                
                <!-- SELECT DROPDOWN SIZES INTERFACE COMPONENT -->
                <div class="shop-control-group">
                    <label class="control-lbl">Select Volume Size:</label>
                    <select id="size-dropdown-${bottle.id}" class="catalog-select-menu" onchange="handleSizeChange(${bottle.id})">
                        ${dropdownHtmlOptions}
                    </select>
                </div>

                <!-- SELECT VOLUME AMOUNT/QUANTITY CONTROL INTERFACE COMPONENT -->
                <div class="shop-control-group">
                    <label class="control-lbl">Order Amount:</label>
                    <input id="qty-input-${bottle.id}" class="catalog-qty-spinner" type="number" value="1" min="1" max="12">
                </div>

                <!-- DYNAMIC LIVE DISPLAY PRICE TRACKER -->
                <div class="pricing-panel">
                    <span class="currency-tag">KES</span>
                    <span id="price-target-${bottle.id}" class="price-val">${initialVariant.price.toLocaleString()}</span>
                </div>

                <button class="add-to-cart-btn" onclick="executeAddToCartOperation(${bottle.id})">Add To Cart</button>
            </div>
        `;

        gridContainer.appendChild(productCard);
    });
}

// 4. LIVE UPDATE THE SCREEN PRICE VALUE SHIFT LOGIC ON DROPDOWN CHANGE
function handleSizeChange(bottleId) {
    const sizeSelectMenu = document.getElementById(`size-dropdown-${bottleId}`);
    const selectedOptionNode = sizeSelectMenu.options[sizeSelectMenu.selectedIndex];
    
    // Read the custom attached data attribute value from option element configuration block
    const variantPrice = parseInt(selectedOptionNode.getAttribute('data-price'));
    
    // Animate change value output straight into visual inner text element
    document.getElementById(`price-target-${bottleId}`).textContent = variantPrice.toLocaleString();
}

// 5. SECURE THE QUANTITY VALUE AND SAVE ITEMS INTO PROGRESSIVE LOCAL BROWSER STORAGE
function executeAddToCartOperation(bottleId) {
    const sizeSelectMenu = document.getElementById(`size-dropdown-${bottleId}`);
    const chosenVariantId = parseInt(sizeSelectMenu.value);
    const chosenQtyInput = parseInt(document.getElementById(`qty-input-${bottleId}`).value);

    if (isNaN(chosenVariantId)) {
        alert("This selection format option is currently out of stock!");
        return;
    }
    if (chosenQtyInput < 1 || chosenQtyInput > 12) {
        alert("Please specify a logical purchase amount bounded between 1 and 12 units.");
        return;
    }

    // Identify standard details from lookup references to finalize layout construction
    const specificVariantObj = allVariants.find(v => v.id === chosenVariantId);
    const specificProductObj = allProducts.find(p => p.id === bottleId);

    // Build the clean unified e-commerce item object card array properties tracking system
    const shoppingCartLineItem = {
        variantId: chosenVariantId,
        productId: bottleId,
        itemName: specificProductObj.name,
        selectedSize: specificVariantObj.size,
        unitPrice: specificVariantObj.price,
        orderedQuantity: chosenQtyInput
    };

    // Check if the exact drink size variation already exists inside the active shopping cart
    const existingIndex = localShoppingCart.findIndex(item => item.variantId === chosenVariantId);
    
    if (existingIndex > -1) {
        // Increment amount variables directly rather than printing duplicate lines
        localShoppingCart[existingIndex].orderedQuantity += chosenQtyInput;
    } else {
        localShoppingCart.push(shoppingCartLineItem);
    }

    // Push layout state string directly down to local cached cookie arrays
    localStorage.setItem('platinum_order_cart', JSON.stringify(localShoppingCart));
    
    // Refresh header numbers overlay feedback component display pill metrics counters
    updateHeaderCartCounterPill();
    
    alert(`Added (${chosenQtyInput}) units of ${specificProductObj.name} [${specificVariantObj.size}] into checkout pipeline successfully.`);
}

// 6. PERSISTENT STORAGE INITIALIZER INTERACTIVE TRACKERS HELPERS
function initializeCartTracker() {
    const savedCartString = localStorage.getItem('platinum_order_cart');
    if (savedCartString) {
        localShoppingCart = JSON.parse(savedCartString);
    }
    updateHeaderCartCounterPill();
}

function updateHeaderCartCounterPill() {
    // Reduce array calculation values to count total item unit sums inside basket array
    const totalUnitsCount = localShoppingCart.reduce((runningSum, item) => runningSum + item.orderedQuantity, 0);
    
    const cartCounterEl = document.getElementById('cart-counter');
    if (cartCounterEl) {
        cartCounterEl.textContent = totalUnitsCount;
    }
}

// 7. FILTER CATEGORY LOGIC CHIPS HANDLERS
function filterCatalog(targetCategory) {
    // Switch active structural visibility class highlights on visual trigger buttons
    const chipsNodes = document.querySelectorAll('.filter-chip');
    chipsNodes.forEach(chip => chip.classList.remove('active'));
    
    if (event && event.target) {
        event.target.classList.add('active');
    }

    if (targetCategory === 'all') {
        renderShopGrid(allProducts);
    } else {
        const filteredList = allProducts.filter(p => p.category.toLowerCase() === targetCategory.toLowerCase());
        renderShopGrid(filteredList);
    }
}

// Run engine core immediately upon page canvas compilation lifecycle loops
window.onload = loadPremiumCatalog;
// 1. CHOOSE & SAVE USER REVIEW IMAGE DIRECTLY INSIDE SUPABASE PUBLIC STORAGE
async function uploadReviewPhotoAsset(fileInputNode) {
    if (!fileInputNode || fileInputNode.files.length === 0) return null;
    
    const chosenFile = fileInputNode.files[0];
    const randomizedUniqueName = `${Date.now()}-${Math.random().toString(36).substring(7)}-${chosenFile.name}`;
    
    const { data, error } = await supabaseClient.storage
        .from('review-images')
        .upload(randomizedUniqueName, chosenFile);
        
    if (error) {
        console.error("Storage upload blocker error: ", error.message);
        return null;
    }
    
    const storageBaseUrl = supabaseClient?.supabaseUrl || window.SUPABASE_URL || window.__SUPABASE_URL__ || '';

    // Construct the absolute secure string path reference output link URL
    return `${storageBaseUrl}/storage/v1/object/public/review-images/${randomizedUniqueName}`;
}

// 2. DISPATCH A NEW COMPLETED REVIEW OBJECT RECORD DOWN TO TABLES
async function handleReviewFormSubmit(event) {
    event.preventDefault();
    
    const name = document.getElementById('rev-name').value.trim();
    const rating = parseInt(document.getElementById('rev-rating').value);
    const comment = document.getElementById('rev-comment').value.trim();
    const fileInput = document.getElementById('rev-photo-file');
    
    // Process image file stream if available
    const structuralPhotoUrlLink = await uploadReviewPhotoAsset(fileInput);
    
    const { error } = await supabaseClient
        .from('product_reviews')
        .insert([{
            customer_name: name,
            rating: rating,
            comment_text: comment,
            photo_url: structuralPhotoUrlLink
        }]);
        
    if (!error) {
        alert("Thank you for your valuable feedback tracking metrics!");
        document.getElementById('review-submission-form').reset();
        loadTimelineReviewsAndReplies(); // Refresh list display instantly
    }
}


// 3. READ ALL DATABASE ENTRIES AND RENDER LOG CARDS WITH REPLY BOXES
async function loadTimelineReviewsAndReplies() {
    const feedContainer = document.getElementById('reviews-output-feed-container');
    if (!feedContainer) return; // Safeguard if element isn't on current page canvas
    
    // Fetch parent evaluations alongside child interaction replies from Supabase
    const { data: reviews, error: revErr } = await supabaseClient.from('product_reviews').select('*').order('created_at', { ascending: false });
    const { data: replies, error: repErr } = await supabaseClient.from('review_replies').select('*').order('created_at', { ascending: true });
    
    if (revErr || repErr) {
        feedContainer.innerHTML = `<p style="color:#ff4d4d;">Could not pull active feedback streams.</p>`;
        return;
    }
    
    if (reviews.length === 0) {
        feedContainer.innerHTML = `<p style="color:#666; text-align: center; padding: 20px;">No customer reviews logged yet. Be the first to share your experience!</p>`;
        return;
    }
    
    feedContainer.innerHTML = ""; // Wipe loaders
    
    reviews.forEach(review => {
        // Filter out child reactions mapping to this specific review ID
        const linkedRepliesList = replies.filter(r => r.review_id === review.id);
        
        let starsString = "⭐".repeat(review.rating);
        
        // Assemble active response replies segments using your new clean style row layout
        let repliesMarkupRows = "";
        linkedRepliesList.forEach(reply => {
            repliesMarkupRows += `
                <div class="single-reply-row">
                    <strong style="color:#d4af37;">${reply.responder_name}:</strong> 
                    <span style="color:#ccc;">${reply.reply_text}</span>
                </div>
            `;
        });
        
        const reviewBlockNode = document.createElement('div');
        // Hook up your new professional CSS design layout class rule card properties directly
        reviewBlockNode.className = "review-post-card";
        reviewBlockNode.innerHTML = `
            <div class="review-card-header">
                <span class="review-customer-info">${review.customer_name} <span class="review-star-rating">${starsString}</span></span>
                <button class="review-like-btn" onclick="incrementLikeCounter(${review.id}, ${review.likes_count})">
                    👍 Helpful (${review.likes_count})
                </button>
            </div>
            <p style="color:#ddd; margin:0 0 10px 0; line-height: 1.5;">${review.comment_text}</p>
            
            ${review.photo_url ? `<div class="review-uploaded-media"><img src="${review.photo_url}" alt="Delivery Proof"></div>` : ""}
            
            <!-- Nested Dynamic Replies Thread Segment Panel Wrapper -->
            <div class="review-replies-container">
                ${repliesMarkupRows}
                
                <!-- inline interaction text response mechanism box -->
                <div class="reply-action-input-group">
                    <input type="text" id="reply-input-${review.id}" class="reply-inline-field" placeholder="Reply to this experience log...">
                    <button class="reply-submit-btn" onclick="submitReplyToThread(${review.id})">Reply</button>
                </div>
            </div>
        `;
        feedContainer.appendChild(reviewBlockNode);
    });
}

// 4. SUBMIT AN INTERACTIVE REPLY VALUE NODE TO THE LOG TIMELINE
async function submitReplyToThread(reviewId) {
    const inputNode = document.getElementById(`reply-input-${reviewId}`);
    const textVal =


inputNode.value.trim();
    if (!textVal) return;
    
    // Quick naming strategy lookup fallback default configurations
    const responderName = "Customer Feedback"; 

    const { error } = await supabaseClient
        .from('review_replies')
        .insert([{
            review_id: reviewId,
            responder_name: responderName,
            reply_text: textVal
        }]);
        
    if (!error) {
        inputNode.value = "";
        loadTimelineReviewsAndReplies();
    }
}

// 5. UPDATE PROGRESSIVE LIKE COUNTERS INSTANTLY ON USER CLICKS
async function incrementLikeCounter(reviewId, currentLikes) {
    const { error } = await supabaseClient
        .from('product_reviews')
        .update({ likes_count: currentLikes + 1 })
        .eq('id', reviewId);
        
    if (!error) {
        loadTimelineReviewsAndReplies();
    }
}

// Register structural execution loops to trigger compilation upon engine startup bindings
const originalOnloadHandler = window.onload;
window.onload = async function() {
    if (originalOnloadHandler) await originalOnloadHandler();
    // Verify that the element wrapper exists on the page template view canvas mapping frame before rendering
    if (document.getElementById('reviews-output-feed-container')) {
        loadTimelineReviewsAndReplies();
    }
};