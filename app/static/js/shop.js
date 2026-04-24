// ===== SHOP.JS =====

let currentQty = 1;
let selectedSize = null;
let currentProductData = null;
let basket = JSON.parse(localStorage.getItem("glh_basket") || "[]");
let favouriteItems = JSON.parse(localStorage.getItem("glh_favourites") || "[]");

// CATEGORY FILTER
const catBtns = document.querySelectorAll(".cat-btn");
const categoryLabel = document.getElementById("categoryLabel");
const popularSection = document.getElementById("popularSection");

catBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        catBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const cat = btn.dataset.cat;
        if (categoryLabel) categoryLabel.textContent = cat === "all" ? "Browse everything" : `Browsing: ${btn.textContent.trim()}`;
        if (popularSection) popularSection.style.display = cat === "all" ? "block" : "none";
        filterProducts(cat);
    });
});

function filterProducts(cat) {
    const cards = document.querySelectorAll(".product-card:not(.placeholder)");
    let visible = 0;
    cards.forEach(card => {
        const match = cat === "all" || card.dataset.cat === cat;
        card.style.display = match ? "" : "none";
        if (match) visible++;
    });
    const count = document.getElementById("resultsCount");
    if (count) count.textContent = `Showing ${visible} product${visible !== 1 ? "s" : ""}`;
    const emptyEl = document.getElementById("shopEmpty");
    if (emptyEl) emptyEl.classList.toggle("hidden", visible > 0);
}

// SEARCH
const searchInput = document.getElementById("shopSearch");
const searchClear = document.getElementById("searchClear");

if (searchInput) {
    searchInput.addEventListener("input", () => {
        const val = searchInput.value.trim().toLowerCase();
        if (searchClear) searchClear.classList.toggle("hidden", val.length === 0);
        const cards = document.querySelectorAll(".product-card:not(.placeholder)");
        let visible = 0;
        cards.forEach(card => {
            const name = card.querySelector(".card-name")?.textContent.toLowerCase() || "";
            const vendor = card.querySelector(".card-vendor")?.textContent.toLowerCase() || "";
            const match = name.includes(val) || vendor.includes(val);
            card.style.display = match ? "" : "none";
            if (match) visible++;
        });
        const emptyEl = document.getElementById("shopEmpty");
        if (emptyEl) emptyEl.classList.toggle("hidden", visible > 0);
    });
}

if (searchClear) {
    searchClear.addEventListener("click", () => {
        searchInput.value = "";
        searchClear.classList.add("hidden");
        searchInput.focus();
        filterProducts("all");
    });
}

// SORT
const sortSelect = document.getElementById("shopSort");
if (sortSelect) {
    sortSelect.addEventListener("change", () => {
        const grid = document.getElementById("productGrid");
        if (!grid) return;
        const cards = [...grid.querySelectorAll(".product-card:not(.placeholder)")];
        cards.sort((a, b) => {
            const aPrice = parseFloat(a.querySelector(".d-price")?.textContent || 0);
            const bPrice = parseFloat(b.querySelector(".d-price")?.textContent || 0);
            if (sortSelect.value === "price-asc") return aPrice - bPrice;
            if (sortSelect.value === "price-desc") return bPrice - aPrice;
            if (sortSelect.value === "popular") {
                return (b.dataset.popular === "True" ? 1 : 0) - (a.dataset.popular === "True" ? 1 : 0);
            }
            return 0;
        });
        cards.forEach(c => c.remove());
        cards.forEach(c => grid.appendChild(c));
        if (typeof lucide !== "undefined") lucide.createIcons();
    });
}

// AUTH
const isLoggedIn = document.body.dataset.loggedin === "true";

function requireAuth(callback) {
    if (isLoggedIn) { callback(); } else { openAuthGate(); }
}

function openAuthGate() {
    document.getElementById("authGateOverlay")?.classList.remove("hidden");
    document.getElementById("authGate")?.classList.remove("hidden");
}

function closeAuthGate() {
    document.getElementById("authGateOverlay")?.classList.add("hidden");
    document.getElementById("authGate")?.classList.add("hidden");
}

// PRODUCT MODAL
function openProductModal(card) {
    const data = card.querySelector(".card-data");
    if (!data) return;
    const name = data.querySelector(".d-name")?.textContent;
    const vendor = data.querySelector(".d-vendor")?.textContent;
    const price = parseFloat(data.querySelector(".d-price")?.textContent || 0);
    const unit = data.querySelector(".d-unit")?.textContent;
    const category = data.querySelector(".d-category")?.textContent;
    const description = data.querySelector(".d-description")?.textContent;
    const stock = parseInt(data.querySelector(".d-stock")?.textContent || 99);
    let images = [], sizes = [];
    try { images = JSON.parse(data.querySelector(".d-images")?.textContent || "[]"); } catch (e) { }
    try { sizes = JSON.parse(data.querySelector(".d-sizes")?.textContent || "[]"); } catch (e) { }

    currentProductData = { id: card.dataset.id, name, vendor, price, unit, category, description, stock, images, sizes };
    currentQty = 1;
    selectedSize = sizes.length > 0 ? sizes[0] : null;

    document.getElementById("modalName").textContent = name;
    document.getElementById("modalVendor").textContent = vendor;
    document.getElementById("modalVendorTag").textContent = vendor;
    document.getElementById("modalCategory").textContent = category;
    document.getElementById("modalUnit").textContent = `/ ${unit}`;
    document.getElementById("modalDescription").textContent = description;
    document.getElementById("qtyVal").textContent = 1;
    updateModalPrice(selectedSize ? selectedSize.price : price);

    const stockEl = document.getElementById("modalStock");
    if (stockEl) {
        stockEl.textContent = stock <= 5 ? `⚠️ Only ${stock} left` : `✓ In stock`;
        stockEl.className = stock <= 5 ? "modal-stock low" : "modal-stock ok";
    }

    const mainImg = document.getElementById("modalMainImg");
    const thumbsWrap = document.getElementById("galleryThumbs");
    const imgList = images.length > 0 ? images : ["/static/images/placeholder.jpg"];
    if (mainImg) mainImg.src = imgList[0];
    if (thumbsWrap) {
        thumbsWrap.innerHTML = "";
        imgList.forEach((src, i) => {
            const thumb = document.createElement("div");
            thumb.className = "thumb" + (i === 0 ? " active" : "");
            thumb.innerHTML = `<img src="${src}" alt="">`;
            thumb.addEventListener("click", () => {
                if (mainImg) mainImg.src = src;
                thumbsWrap.querySelectorAll(".thumb").forEach(t => t.classList.remove("active"));
                thumb.classList.add("active");
            });
            thumbsWrap.appendChild(thumb);
        });
    }

    const sizesWrap = document.getElementById("modalSizes");
    if (sizesWrap) {
        sizesWrap.innerHTML = "";
        sizes.forEach((s, i) => {
            const btn = document.createElement("button");
            btn.className = "size-opt" + (i === 0 ? " active" : "");
            btn.textContent = s.label;
            btn.addEventListener("click", () => {
                sizesWrap.querySelectorAll(".size-opt").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                selectedSize = s;
                updateModalPrice(s.price);
            });
            sizesWrap.appendChild(btn);
        });
    }

    const modalHeart = document.getElementById("modalHeart");
    if (modalHeart) {
        const isFaved = favouriteItems.some(f => String(f.productId) === String(card.dataset.id));
        modalHeart.classList.toggle("active", isFaved);
    }

    document.getElementById("productModalOverlay")?.classList.add("active");
    document.getElementById("productModal")?.classList.add("active");
    document.body.style.overflow = "hidden";
    if (typeof lucide !== "undefined") lucide.createIcons();
}

function updateModalPrice(price) {
    const el = document.getElementById("modalPrice");
    if (el) el.textContent = `£${(price * currentQty).toFixed(2)}`;
}

function closeProductModal() {
    document.getElementById("productModalOverlay")?.classList.remove("active");
    document.getElementById("productModal")?.classList.remove("active");
    document.body.style.overflow = "";
}

function changeQty(dir) {
    currentQty = Math.max(1, currentQty + dir);
    const el = document.getElementById("qtyVal");
    if (el) el.textContent = currentQty;
    updateModalPrice(selectedSize ? selectedSize.price : currentProductData?.price || 0);
}

// BASKET — adds to localStorage then syncs global
function addToBasket() {
    requireAuth(() => {
        if (!currentProductData) return;
        basket = JSON.parse(localStorage.getItem("glh_basket") || "[]");
        basket.push({
            id: Date.now(),
            name: currentProductData.name,
            vendor: currentProductData.vendor,
            price: selectedSize ? selectedSize.price : currentProductData.price,
            unit: selectedSize ? selectedSize.label : currentProductData.unit,
            image: currentProductData.images?.[0] || "/static/images/placeholder.jpg",
            qty: currentQty
        });
        localStorage.setItem("glh_basket", JSON.stringify(basket));
        refreshAllDots();
        showToast(`${currentProductData.name} added to basket`);
        closeProductModal();
    });
}

function buyNow() {
    requireAuth(() => {
        addToBasket();
        window.location.href = "/checkout";
    });
}

// FAVOURITES
function toggleFavourite(e, btn) {
    e.stopPropagation();
    requireAuth(() => {
        favouriteItems = JSON.parse(localStorage.getItem("glh_favourites") || "[]");
        const card = btn.closest(".product-card");
        const productId = String(card ? card.dataset.id : currentProductData?.id || "");
        if (!productId) return;
        const cardEl = document.querySelector(`.product-card[data-id="${productId}"]`);
        const cardHeart = cardEl?.querySelector(".card-heart");
        const modalHeart = document.getElementById("modalHeart");
        const alreadyFaved = favouriteItems.some(f => String(f.productId) === productId);

        if (alreadyFaved) {
            favouriteItems = favouriteItems.filter(f => String(f.productId) !== productId);
            if (cardHeart) cardHeart.classList.remove("active");
            if (modalHeart) modalHeart.classList.remove("active");
        } else {
            if (cardHeart) cardHeart.classList.add("active");
            if (modalHeart) modalHeart.classList.add("active");
            const data = currentProductData || {};
            favouriteItems.push({
                productId,
                name: data.name || cardEl?.querySelector(".card-name")?.textContent || "Product",
                vendor: data.vendor || cardEl?.querySelector(".card-vendor")?.textContent || "",
                price: data.price || 0,
                unit: data.unit || "",
                image: data.images?.[0] || "/static/images/placeholder.jpg"
            });
        }
        localStorage.setItem("glh_favourites", JSON.stringify(favouriteItems));
        refreshAllDots();
    });
}

// TOAST
function showToast(msg) {
    let toast = document.getElementById("shopToast");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "shopToast";
        toast.className = "shop-toast";
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2800);
}

// KEYBOARD
document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
        closeProductModal();
        closeAuthGate();
    }
});

// ON LOAD — restore heart states
favouriteItems.forEach(item => {
    const card = document.querySelector(`.product-card[data-id="${item.productId}"]`);
    if (card) card.querySelector(".card-heart")?.classList.add("active");
});
