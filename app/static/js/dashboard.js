// ===== DASHBOARD JS =====

const orders = JSON.parse(localStorage.getItem("glh_orders") || "[]");
const favs = JSON.parse(localStorage.getItem("glh_favourites") || "[]");
const wallet = parseFloat(localStorage.getItem("glh_wallet") || "50.00");

// UPDATE STATS
const statOrders = document.getElementById("stat-orders");
const statWallet = document.getElementById("stat-wallet");
const statFavs = document.getElementById("stat-favs");
const walletBadge = document.getElementById("walletBadgeAmount");

if (statOrders) statOrders.textContent = orders.length;
if (statWallet) statWallet.textContent = `£${wallet.toFixed(2)}`;
if (statFavs) statFavs.textContent = favs.length;
if (walletBadge) walletBadge.textContent = `£${wallet.toFixed(2)}`;

// RECENT ORDERS ON DASHBOARD HOME
const recentWrap = document.getElementById("dash-recent-orders");
if (recentWrap && orders.length > 0) {
    recentWrap.innerHTML = "";
    orders.slice(0, 3).forEach(order => {
        recentWrap.appendChild(buildOrderCard(order));
    });
    if (typeof lucide !== "undefined") lucide.createIcons();
}

// FULL ORDERS PAGE
const fullList = document.getElementById("full-orders-list");
const ordersEmpty = document.getElementById("orders-empty-state");
if (fullList) {
    if (orders.length === 0) {
        if (ordersEmpty) ordersEmpty.classList.remove("hidden");
    } else {
        if (ordersEmpty) ordersEmpty.classList.add("hidden");
        orders.forEach(order => {
            fullList.appendChild(buildOrderCard(order));
        });
        if (typeof lucide !== "undefined") lucide.createIcons();
    }
}

function buildOrderCard(order) {
    const card = document.createElement("div");
    card.className = "dash-order-card";
    const itemsHTML = order.items.map(i => `
        <div class="dash-order-item">
            <img src="${i.image || '/static/images/placeholder.jpg'}" alt="${i.name}">
            <span class="dash-order-item-name">${i.name} × ${i.qty}</span>
            <span class="dash-order-item-price">£${(i.price * i.qty).toFixed(2)}</span>
        </div>
    `).join("");

    card.innerHTML = `
        <div class="dash-order-top">
            <span class="dash-order-ref">#${order.ref}</span>
            <span class="dash-order-date">${order.date}</span>
        </div>
        <div class="dash-order-items">${itemsHTML}</div>
        <div class="dash-order-footer">
            <span class="dash-order-total">£${parseFloat(order.total).toFixed(2)}</span>
            <span class="dash-order-status">
                <i data-lucide="check-circle"></i>
                Confirmed
            </span>
        </div>
    `;
    return card;
}

// ADDRESSES
const addressList = document.getElementById("address-list");
const addressEmpty = document.getElementById("address-empty");
const addressForm = document.getElementById("addressForm");

let addresses = JSON.parse(localStorage.getItem("glh_addresses") || "[]");

function renderAddresses() {
    if (!addressList) return;
    addressList.innerHTML = "";
    if (addresses.length === 0) {
        if (addressEmpty) addressEmpty.classList.remove("hidden");
        return;
    }
    if (addressEmpty) addressEmpty.classList.add("hidden");
    addresses.forEach((addr, i) => {
        const card = document.createElement("div");
        card.className = "address-card";
        card.innerHTML = `
            <p>${addr.line1}${addr.line2 ? ", " + addr.line2 : ""}<br>
            ${addr.city}, ${addr.postcode}</p>
            <button class="address-delete" onclick="deleteAddress(${i})">
                <i data-lucide="trash-2"></i>
            </button>
        `;
        addressList.appendChild(card);
    });
    if (typeof lucide !== "undefined") lucide.createIcons();
}

function deleteAddress(index) {
    addresses.splice(index, 1);
    localStorage.setItem("glh_addresses", JSON.stringify(addresses));
    renderAddresses();
}

if (addressForm) {
    addressForm.addEventListener("submit", e => {
        e.preventDefault();
        const addr = {
            line1: document.getElementById("addr1").value.trim(),
            line2: document.getElementById("addr2").value.trim(),
            city: document.getElementById("city").value.trim(),
            postcode: document.getElementById("postcode").value.trim()
        };
        addresses.push(addr);
        localStorage.setItem("glh_addresses", JSON.stringify(addresses));
        addressForm.reset();
        renderAddresses();
    });
}

renderAddresses();

// MOBILE SIDEBAR TOGGLE
const dashMenuBtn = document.getElementById("dashMenuBtn");
const dashSidebar = document.querySelector(".dash-sidebar");
const sidebarOverlay = document.getElementById("sidebarOverlay");
const sidebarCloseBtn = document.getElementById("sidebarCloseBtn");

function closeSidebar() {
    dashSidebar?.classList.remove("open");
    sidebarOverlay?.classList.remove("active");
}

if (dashMenuBtn) dashMenuBtn.addEventListener("click", () => {
    dashSidebar?.classList.toggle("open");
    sidebarOverlay?.classList.toggle("active");
});
if (sidebarOverlay) sidebarOverlay.addEventListener("click", closeSidebar);
if (sidebarCloseBtn) sidebarCloseBtn.addEventListener("click", closeSidebar);
if (typeof lucide !== "undefined") lucide.createIcons();



// ===== WALLET SYSTEM =====
let walletBalance = parseFloat(localStorage.getItem("glh_wallet") || "50.00");

function renderWallet() {
    const el = document.getElementById("walletBalance");
    const badge = document.getElementById("walletBadgeAmount");
    const stat = document.getElementById("stat-wallet");
    if (el) el.textContent = `£${walletBalance.toFixed(2)}`;
    if (badge) badge.textContent = `£${walletBalance.toFixed(2)}`;
    if (stat) stat.textContent = `£${walletBalance.toFixed(2)}`;
}

function topUp(amount) {
    walletBalance += amount;
    localStorage.setItem("glh_wallet", walletBalance.toFixed(2));
    renderWallet();
    showWalletToast(`£${amount.toFixed(2)} added to your wallet`);
}

function topUpCustom() {
    const input = document.getElementById("customAmount");
    if (!input) return;
    const amount = parseFloat(input.value);
    if (!amount || amount <= 0 || amount > 500) {
        showWalletToast("Please enter a valid amount (£1–£500)", true);
        return;
    }
    topUp(amount);
    input.value = "";
}

function showWalletToast(msg, isError = false) {
    let toast = document.getElementById("walletToast");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "walletToast";
        toast.className = "wallet-toast";
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.background = isError ? "rgba(239,68,68,0.15)" : "rgba(74,222,128,0.15)";
    toast.style.borderColor = isError ? "#ef4444" : "#4ade80";
    toast.style.color = isError ? "#ef4444" : "#4ade80";
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2800);
}

renderWallet();
if (typeof lucide !== "undefined") lucide.createIcons();
