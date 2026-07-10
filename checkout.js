// 1. DATA ROUTING ENDPOINT STRUCTS LINKED TO YOUR SUPABASE INSTANCE
const checkoutDbClient = window.supabaseClient || window.supabaseAuthClient || null;

if (!checkoutDbClient) {
    const itemsListContainer = document.getElementById('checkout-items-list-container');
    if (itemsListContainer) {
        itemsListContainer.innerHTML = `<p class="empty-cart-notice">Supabase is not configured yet. Your cart still loads locally, but orders cannot be saved until your project URL and anon key are added.</p>`;
    }
}

// Operational Pointer Arrays
let operationalCartItems = [];

// 2. PARSE LOCAL STORAGE CART DATA AND COMPUTE NUMERICS
function loadCartOrderDetails() {
    const itemsListContainer = document.getElementById('checkout-items-list-container');
    const savedCartString = localStorage.getItem('platinum_order_cart');

    if (!savedCartString || JSON.parse(savedCartString).length === 0) {
        itemsListContainer.innerHTML = `<p class="empty-cart-notice">Your cart is currently empty. Visit the catalog to add premium selections.</p>`;
        return;
    }

    operationalCartItems = JSON.parse(savedCartString);
    itemsListContainer.innerHTML = ""; // Clear text template placeholder

    let computedRunningTotal = 0;

    // Render individual cart lines dynamically
    operationalCartItems.forEach(item => {
        // --- FORMAT CORRECTION ---
        // Ensures properties map cleanly whether your catalog uses camelCase or lowercase properties
        const name = item.itemName || item.item_name || "Premium Selection";
        const size = item.selectedSize || item.selected_size || "Standard";
        const quantity = parseInt(item.orderedQuantity || item.ordered_quantity || item.quantity || 1);
        const price = parseFloat(item.unitPrice || item.unit_price || item.price || 0);

        const itemLineCost = price * quantity;
        computedRunningTotal += itemLineCost;

        const cartItemRowNode = document.createElement('div');
        cartItemRowNode.className = "checkout-cart-item-row";
        cartItemRowNode.innerHTML = `
            <div style="display:flex; flex-direction:column; gap:2px;">
                <strong style="color:#ffffff; font-size:0.95rem;">${name}</strong>
                <span style="color:#777; font-size:0.8rem;">Size: ${size} | Qty: ${quantity}</span>
            </div>
            <span style="color:#79bf43; font-weight:bold; font-size:0.95rem;">KES ${itemLineCost.toLocaleString()}</span>
        `;
        itemsListContainer.appendChild(cartItemRowNode);
    });

    // Execute the exact 50% down-payment formulation split calculations
    calculatePaymentSplitStructure(computedRunningTotal);
}

// 3. CALCULATE THE EXACT 50% SPLIT FINANCIAL METRICS
function calculatePaymentSplitStructure(totalCartCost) {
    const calculatedDepositDue = totalCartCost * 0.50;
    const calculatedBalanceRemaining = totalCartCost * 0.50;

    document.getElementById('bill-total-val').textContent = totalCartCost.toLocaleString();
    document.getElementById('bill-deposit-val').textContent = calculatedDepositDue.toLocaleString();
    document.getElementById('bill-balance-val').textContent = calculatedBalanceRemaining.toLocaleString();
}

// 4. DISPATCH ORDERS DISK STORAGE ROUTINES AND EXECUTE LIVE SAFARICOM STK PAYMENTS
async function triggerMpesaPaymentDeposit(event) {
    event.preventDefault();

    if (operationalCartItems.length === 0) {
        alert("TRANSACTION BLOCK: Your checkout basket contains no items.");
        return;
    }

    const customerNameInput = document.getElementById('cust-delivery-name').value.trim();
    const customerPhoneInput = document.getElementById('cust-mpesa-phone').value.trim();
    const customerAddressInput = document.getElementById('cust-delivery-address').value.trim();

    // Kenya Mobile Format Interception Check (Enforces 254XXXXXXXX code format)
    const keniaPhoneRegex = /^254(7|1)\d{8}$/;
    if (!keniaPhoneRegex.test(customerPhoneInput)) {
        alert("FORMAT ERROR: Please specify a valid Kenyan phone number starting with the 254 country code (e.g., 254712345678).");
        return;
    }

    // --- CORRECTION ---
    // Cleans up comma character formatting strings to prevent breaking math functions
    const totalAmountScore = parseInt(document.getElementById('bill-total-val').textContent.replace(/,/g, ''));
    const depositAmountVal = totalAmountScore * 0.50;
    const balanceAmountVal = totalAmountScore * 0.50;

    // Visual button loading indicator logic to block double-clicks
    const submitBtn = event.target.querySelector('button') || document.activeElement;
    const originalBtnText = submitBtn.innerText;
    submitBtn.disabled = true;
    submitBtn.innerText = "Sending STK Push to Phone...";

    try {
        // --- LIVE MPESA INTERFACE LINK FULLY FIXED ---
        const mpesaResponse = await fetch("https://zogdzaazwfiegcbxopqp.supabase.co", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json" 
            },
            body: JSON.stringify({
                phoneNumber: customerPhoneInput,
                amount: depositAmountVal
            })
        });

        const mpesaResult = await mpesaResponse.json();

        if (!mpesaResult.success) {
            alert("M-Pesa Initialization Failed: " + (mpesaResult.error || "Please check backend logs."));
            submitBtn.disabled = false;
            submitBtn.innerText = originalBtnText;
            return; 
        }

        // Pull tracking code straight out of the operational Safaricom data payload response
        const safaricomCheckoutId = mpesaResult.data.CheckoutRequestID || 'ws_CO_' + Date.now();

        alert(`[M-PESA STK GATEWAY]: A secure transaction prompt for KES ${depositAmountVal.toLocaleString()} has been pushed to your device. Enter your M-Pesa PIN now!`);

        if (!checkoutDbClient) {
            alert('Supabase is not configured yet. Please add your Supabase URL and anon key to save the order.');
            submitBtn.disabled = false;
            submitBtn.innerText = originalBtnText;
            return;
        }

        // Log the complete order context state inside your Supabase instance tables
        const { data: orderRecord, error: orderError } = await checkoutDbClient
            .from('orders')
            .insert([{
                customer_name: customerNameInput,
                customer_phone: customerPhoneInput,
                delivery_address: customerAddressInput,
                total_amount: totalAmountScore,
                deposit_amount_paid: depositAmountVal,
                balance_on_delivery: balanceAmountVal,
                mpesa_checkout_id: safaricomCheckoutId, 
                payment_status: 'Pending PIN Verification' 
            }])
            .select();

        if (orderError) {
            console.error("Database Order Storage Crash: ", orderError.message);
            alert("Transaction processing failed due to database connectivity parameters.");
            return;
        }

        alert(`ORDER CAPTURED! Your order is pending M-Pesa payment validation. The remaining balance of KES ${balanceAmountVal.toLocaleString()} is payable upon delivery drop-off.`);
        
        // Clear out local order storage basket configurations completely
        localStorage.removeItem('platinum_order_cart');
        
        // Redirect cleanly back onto your dashboard landing interface scene
        window.location.href = 'home.html';

    } catch (apiError) {
        console.error("M-Pesa Gateway Connection Crash: ", apiError);
        alert("Network Error: Cloud network server routing could not link up with Daraja system APIs. Details: " + apiError.message);
    } {
        submitBtn.disabled = false;
        submitBtn.innerText = originalBtnText;
    }
}

// Automatically start engine tracking upon lifecycle canvas load completions
window.onload = loadCartOrderDetails;