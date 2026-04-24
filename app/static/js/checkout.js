// ===== CHECKOUT.JS =====

let basket = JSON.parse(localStorage.getItem("glh_basket") || "[]");
let wallet = parseFloat(localStorage.getItem("glh_wallet") || "50.00");
let discountApplied = false;
let deliveryCost = 3.95;
let deliveryType = "standard";
const DISCOUNT_CODE = (window.DISCOUNT_CODE || "GLH25").toUpperCase();

// ---- RENDER BASKET ----
function renderBasket() {
    const wrap = document.getElementById("basket-items-wrap");
    const empty = document.getElementById("basket-empty");
    const discountWrap = document.getElementById("discount-wrap");
    const clearBtn = document.getElementById("clearCartBtn");
    const toStep2 = document.getElementById("toStep2Btn");
    const sumItems = document.getElementById("summary-items");

    if (!wrap) return;
    wrap.innerHTML = "";
    if (sumItems) sumItems.innerHTML = "";

    if (basket.length === 0) {
        if (empty) empty.classList.remove("hidden");
        if (discountWrap) discountWrap.classList.add("hidden");
        if (clearBtn) clearBtn.classList.add("hidden");
        if (toStep2) toStep2.classList.add("hidden");
        updateSummary();
        return;
    }

    if (empty) empty.classList.add("hidden");
    if (discountWrap) discountWrap.classList.remove("hidden");
    if (clearBtn) clearBtn.classList.remove("hidden");
    if (toStep2) toStep2.classList.remove("hidden");

    basket.forEach((item, index) => {
        // BASKET ITEM
        const el = document.createElement("div");
        el.className = "basket-co-item";
        el.innerHTML = `
            <img class="basket-co-img" src="${item.image}" alt="${item.name}">
            <div class="basket-co-info">
                <div class="basket-co-name">${item.name}</div>
                <div class="basket-co-vendor">${item.vendor}</div>
                <div class="qty-controls">
                    <button class="qty-co-btn" onclick="changeItemQty(${index}, -1)">−</button>
                    <span class="qty-co-val" id="qty-${index}">${item.qty}</span>
                    <button class="qty-co-btn" onclick="changeItemQty(${index}, 1)">+</button>
                </div>
            </div>
            <div class="basket-co-subtotal">£${(item.price * item.qty).toFixed(2)}</div>
        `;
        wrap.appendChild(el);

        // SUMMARY ITEM
        if (sumItems) {
            const si = document.createElement("div");
            si.className = "sum-item";
            si.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <span class="sum-item-name">${item.name} × ${item.qty}</span>
                <span class="sum-item-price">£${(item.price * item.qty).toFixed(2)}</span>
            `;
            sumItems.appendChild(si);
        }
    });

    updateSummary();
    if (typeof lucide !== "undefined") lucide.createIcons();
}

function changeItemQty(index, dir) {
    basket[index].qty = Math.max(1, basket[index].qty + dir);
    localStorage.setItem("glh_basket", JSON.stringify(basket));
    renderBasket();
}

function clearCart() {
    if (!confirm("Clear your entire basket?")) return;
    basket = [];
    localStorage.setItem("glh_basket", JSON.stringify(basket));
    discountApplied = false;
    renderBasket();
}

// ---- SUMMARY ----
function updateSummary() {
    const subtotal = basket.reduce((t, i) => t + i.price * i.qty, 0);
    const discount = discountApplied ? subtotal * 0.25 : 0;
    const afterDiscount = subtotal - discount;
    const vat = afterDiscount * 0.20;
    const total = afterDiscount + vat + deliveryCost;

    const setText = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    };

    setText("sum-subtotal", `£${subtotal.toFixed(2)}`);
    setText("sum-discount", `-£${discount.toFixed(2)}`);
    setText("sum-delivery", deliveryCost === 0 ? "Free" : `£${deliveryCost.toFixed(2)}`);
    setText("sum-vat", `£${vat.toFixed(2)}`);
    setText("sum-total", `£${total.toFixed(2)}`);

    const discRow = document.getElementById("sum-discount-row");
    if (discRow) discRow.style.display = discountApplied ? "flex" : "none";

    updateWalletInfo(total);
}

// ---- DISCOUNT ----
function applyDiscount() {
    const input = document.getElementById("discountInput");
    const msg = document.getElementById("discountMsg");
    if (!input || !msg) return;

    const code = input.value.trim().toUpperCase();
    msg.classList.remove("hidden", "success", "error");

    if (discountApplied) {
        msg.textContent = "Discount already applied.";
        msg.classList.add("error");
        return;
    }

    if (code === DISCOUNT_CODE) {
        discountApplied = true;
        msg.textContent = "✓ 25% discount applied!";
        msg.classList.add("success");
        updateSummary();
    } else if (code === "") {
        msg.textContent = "Please enter a discount code.";
        msg.classList.add("error");
    } else {
        msg.textContent = "Invalid or already used discount code.";
        msg.classList.add("error");
    }
}

// ---- DELIVERY ----
function selectDelivery(btn, type, cost) {
    document.querySelectorAll(".delivery-opt").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    deliveryType = type;
    deliveryCost = cost;

    const addrSection = document.getElementById("addressSection");
    if (addrSection) {
        addrSection.style.display = type === "collect" ? "none" : "block";
    }

    updateSummary();
}

// ---- ADDRESS SELECT ----
function handleAddressSelect() {
    const sel = document.getElementById("addressSelect");
    const newFields = document.getElementById("newAddressFields");
    if (!sel || !newFields) return;
    newFields.style.display = sel.value === "new" ? "block" : "none";
}

// Load saved addresses into select
function loadSavedAddresses() {
    const sel = document.getElementById("addressSelect");
    if (!sel) return;
    const addresses = JSON.parse(localStorage.getItem("glh_addresses") || "[]");
    addresses.forEach((addr, i) => {
        const opt = document.createElement("option");
        opt.value = i;
        opt.textContent = `${addr.line1}, ${addr.city}, ${addr.postcode}`;
        sel.insertBefore(opt, sel.firstChild);
    });
}

// ---- WALLET INFO ----
function updateWalletInfo(total) {
    const infoEl = document.getElementById("walletPayInfo");
    const display = document.getElementById("walletDisplayAmount");
    if (!infoEl) return;
    if (display) display.textContent = `£${wallet.toFixed(2)}`;

    if (basket.length === 0) {
        infoEl.innerHTML = "";
        return;
    }

    if (wallet >= total) {
        infoEl.innerHTML = `
            <div class="wallet-sufficient">
                <i data-lucide="check-circle"></i>
                You have sufficient balance to complete this order.
                After payment your balance will be <strong>£${(wallet - total).toFixed(2)}</strong>.
            </div>
        `;
    } else {
        infoEl.innerHTML = `
            <div class="wallet-insufficient">
                <i data-lucide="alert-circle"></i>
                Insufficient balance. You need £${total.toFixed(2)} but have £${wallet.toFixed(2)}.
                Please top up your wallet.
            </div>
        `;
        const payBtn = document.getElementById("payBtn");
        if (payBtn) payBtn.disabled = true;
    }

    if (typeof lucide !== "undefined") lucide.createIcons();
}

// ---- STEP NAVIGATION ----
function goToStep(step) {
    // Validate step 2 fields
    if (step === 3) {
        const first = document.getElementById("coFirstName")?.value.trim();
        const last = document.getElementById("coLastName")?.value.trim();
        if (!first || !last) {
            alert("Please enter your first and last name.");
            return;
        }
        if (deliveryType !== "collect") {
            const sel = document.getElementById("addressSelect");
            if (sel?.value === "new") {
                const addr1 = document.getElementById("addr1")?.value.trim();
                const city = document.getElementById("city")?.value.trim();
                const postcode = document.getElementById("postcode")?.value.trim();
                if (!addr1 || !city || !postcode) {
                    alert("Please complete your delivery address.");
                    return;
                }
            }
        }
    }

    // Hide all steps
    document.querySelectorAll(".checkout-step").forEach(s => s.classList.add("hidden"));
    document.getElementById(`step-${step}`)?.classList.remove("hidden");

    // Update progress
    ["1", "2", "3"].forEach(n => {
        const prog = document.getElementById(`prog-${n}`);
        if (!prog) return;
        prog.classList.remove("active", "done");
        if (parseInt(n) < step) prog.classList.add("done");
        if (parseInt(n) === step) prog.classList.add("active");
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
    if (typeof lucide !== "undefined") lucide.createIcons();
}

// ---- PROCESS PAYMENT ----
// ---- PROCESS PAYMENT ----
function processPayment() {
    const subtotal = basket.reduce((t, i) => t + i.price * i.qty, 0);
    const discount = discountApplied ? subtotal * 0.25 : 0;
    const afterDiscount = subtotal - discount;
    const vat = afterDiscount * 0.20;
    const total = afterDiscount + vat + deliveryCost;

    if (wallet < total) {
        alert("Insufficient wallet balance.");
        return;
    }

    // SAVE ITEMS BEFORE CLEARING BASKET
    const orderItems = basket.map(i => ({
        name: i.name,
        qty: i.qty,
        price: i.price,
        image: i.image
    }));

    const orderRef = "GLH" + Date.now().toString().slice(-6);

    // DEDUCT WALLET
    wallet = wallet - total;
    localStorage.setItem("glh_wallet", wallet.toFixed(2));

    // SAVE ADDRESS IF REQUESTED
    const saveCheck = document.getElementById("saveAddress");
    if (saveCheck?.checked && deliveryType !== "collect") {
        const sel = document.getElementById("addressSelect");
        if (sel?.value === "new") {
            const addresses = JSON.parse(localStorage.getItem("glh_addresses") || "[]");
            addresses.push({
                line1: document.getElementById("addr1")?.value.trim(),
                line2: document.getElementById("addr2")?.value.trim(),
                city: document.getElementById("city")?.value.trim(),
                postcode: document.getElementById("postcode")?.value.trim()
            });
            localStorage.setItem("glh_addresses", JSON.stringify(addresses));
        }
    }

    // SAVE ORDER TO LOCALSTORAGE
    const order = {
        ref: orderRef,
        date: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
        items: orderItems,
        total: total.toFixed(2),
        delivery: deliveryType,
        status: "confirmed"
    };
    const orders = JSON.parse(localStorage.getItem("glh_orders") || "[]");
    orders.unshift(order);
    localStorage.setItem("glh_orders", JSON.stringify(orders));

    // CLEAR BASKET
    basket = [];
    localStorage.setItem("glh_basket", JSON.stringify(basket));
    if (typeof refreshAllDots === "function") refreshAllDots();

    // SAVE TO DB — uses orderItems not basket
    fetch("/order/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            ref: orderRef,
            total: total.toFixed(2),
            items: orderItems  // ← saved before basket was cleared
        })
    }).finally(() => {
        window.location.href = `/order-success?ref=${orderRef}&total=${total.toFixed(2)}`;
    });
}


// ---- PREFILL USER DETAILS ----
function prefillUserDetails() {
    const firstName = document.getElementById("coFirstName");
    const lastName = document.getElementById("coLastName");


    const userMeta = document.querySelector('meta[name="user-name"]');
    if (userMeta && firstName && lastName) {
        const parts = userMeta.content.split(" ");
        if (firstName) firstName.value = parts[0] || "";
        if (lastName) lastName.value = parts.slice(1).join(" ") || "";
    }
}

// ---- INIT ----
renderBasket();
loadSavedAddresses();
prefillUserDetails();
if (typeof lucide !== "undefined") lucide.createIcons();
