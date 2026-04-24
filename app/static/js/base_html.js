// CLEAR LOCALSTORAGE ON FRESH LOGIN
// CLEAR LOCALSTORAGE WHEN USER CHANGES
(function () {
    const currentUserId = document.body.dataset.userid;
    const storedUserId = localStorage.getItem("glh_user_id");

    if (currentUserId && storedUserId && currentUserId !== storedUserId) {
        // Different user logged in — clear all personal data
        localStorage.removeItem("glh_basket");
        localStorage.removeItem("glh_favourites");
        localStorage.removeItem("glh_orders");
        localStorage.removeItem("glh_addresses");
        localStorage.removeItem("glh_wallet");
    }

    if (currentUserId) {
        localStorage.setItem("glh_user_id", currentUserId);
    } else {
        // Logged out — clear stored user id
        localStorage.removeItem("glh_user_id");
    }
})();


/* CORE ELEMENTS */
const navItems = document.querySelectorAll(".nav-item");
const dropdowns = document.querySelectorAll(".dropdown");
const overlay = document.querySelector(".nav-overlay");

/* MOBILE ELEMENTS */
const mobileMenuBtn = document.getElementById("mobile-menu-btn");
const mobileMenu = document.getElementById("mobile-menu");
const mobileClose = document.getElementById("mobile-close");
const mobileAccount = document.getElementById("mobile-account");

/* ACCOUNT */
const accountBtn = document.getElementById("account-btn");
const accountModal = document.getElementById("account-modal");
const closeBtn = document.getElementById("close-account");

/* DROPDOWN */
navItems.forEach(item => {
    item.addEventListener("mouseenter", () => {
        const menu = item.dataset.menu;
        dropdowns.forEach(d => d.classList.remove("active"));
        const active = document.getElementById(menu + "-menu");
        if (active) {
            const rect = item.getBoundingClientRect();
            active.style.left = rect.left + rect.width / 2 + "px";
            active.classList.add("active");
            overlay.classList.add("active");
        }
    });
});

let timeout;
const wrapper = document.querySelector(".dropdown-wrapper");
if (wrapper) {
    wrapper.addEventListener("mouseleave", () => {
        timeout = setTimeout(closeMenu, 120);
    });
}

dropdowns.forEach(drop => {
    drop.addEventListener("mouseenter", () => clearTimeout(timeout));
});

if (overlay) overlay.addEventListener("mouseenter", closeMenu);

function closeMenu() {
    dropdowns.forEach(d => d.classList.remove("active"));
    overlay.classList.remove("active");
}

/* ACCOUNT MODAL */
if (accountBtn && accountModal) {
    accountBtn.addEventListener("click", () => {
        accountModal.classList.toggle("active");
        overlay.classList.toggle("active");
    });
}

if (closeBtn && accountModal) {
    closeBtn.addEventListener("click", () => {
        accountModal.classList.remove("active");
        overlay.classList.remove("active");
    });
}

if (overlay) {
    overlay.addEventListener("click", () => {
        if (accountModal) accountModal.classList.remove("active");
        overlay.classList.remove("active");
        if (mobileMenu) mobileMenu.classList.remove("active");
    });
}

/* MOBILE MENU */
if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener("click", () => mobileMenu.classList.add("active"));
}

if (mobileClose && mobileMenu) {
    mobileClose.addEventListener("click", () => mobileMenu.classList.remove("active"));
}

const mobileItems = document.querySelectorAll(".mobile-item");
mobileItems.forEach(item => {
    item.addEventListener("click", () => {
        const key = item.dataset.expand;
        const target = document.getElementById("mobile-" + key);
        item.classList.toggle("active");
        if (target) target.classList.toggle("active");
    });
});

if (mobileAccount && accountModal) {
    mobileAccount.addEventListener("click", () => {
        if (mobileMenu) mobileMenu.classList.remove("active");
        setTimeout(() => {
            accountModal.classList.add("active");
            overlay.classList.add("active");
        }, 300);
    });
}

/* MOBILE BASKET */
const mobileBasket = document.getElementById("mobile-basket");
if (mobileBasket) {
    mobileBasket.addEventListener("click", () => {
        if (mobileMenu) mobileMenu.classList.remove("active");
        setTimeout(() => openBasket(), 300);
    });
}

/* MOBILE FAV */
const mobileFav = document.getElementById("mobile-fav");
if (mobileFav) {
    mobileFav.addEventListener("click", () => {
        if (mobileMenu) mobileMenu.classList.remove("active");
        setTimeout(() => openFavourites(), 300);
    });
}

/* ICONS */
if (typeof lucide !== "undefined") lucide.createIcons();

// LOADER
(function () {
    const loader = document.getElementById("pageLoader");
    if (!loader) return;
    const hide = () => loader.classList.add("is-hidden");
    const show = () => loader.classList.remove("is-hidden");
    const start = Date.now();
    window.addEventListener("load", () => {
        const elapsed = Date.now() - start;
        setTimeout(hide, Math.max(800 - elapsed, 0));
    });
    document.addEventListener("click", (e) => {
        const a = e.target.closest("a");
        if (!a) return;
        const href = a.getAttribute("href") || "";
        const target = a.getAttribute("target");
        if (!href || href.startsWith("#") || href.startsWith("javascript:")) return;
        if (target === "_blank") return;
        if (href.startsWith("http")) return;
        show();
    });
    window.addEventListener("pageshow", (e) => {
        if (e.persisted) hide();
    });
})();

// FOOTER INPUT
const input = document.querySelector(".newsletter-box input");
if (input) {
    input.addEventListener("focus", () => {
        input.parentElement.style.border = "1px solid #c89b6d";
    });
    input.addEventListener("blur", () => {
        input.parentElement.style.border = "1px solid rgba(255, 255, 255, 0.1)";
    });
}

// COOKIES
const banner = document.getElementById("cookie-banner");
const acceptBtn = document.getElementById("cookie-accept");
const declineBtn = document.getElementById("cookie-decline");
const cookieCloseBtn = document.getElementById("cookie-close");

function dismissCookie(choice) {
    if (choice) localStorage.setItem("cookiesChoice", choice);
    if (banner) banner.classList.remove("show");
}

if (!localStorage.getItem("cookiesChoice")) {
    let shown = false;
    function showBanner() {
        if (shown) return;
        shown = true;
        if (banner) banner.classList.add("show");
        if (typeof lucide !== "undefined") lucide.createIcons();
    }
    ["scroll", "click", "mousemove", "touchstart", "keydown"].forEach(ev => {
        window.addEventListener(ev, showBanner, { once: true });
    });
    setTimeout(showBanner, 4000);
}

if (acceptBtn) acceptBtn.addEventListener("click", () => dismissCookie("accepted"));
if (declineBtn) declineBtn.addEventListener("click", () => dismissCookie("declined"));
if (cookieCloseBtn) cookieCloseBtn.addEventListener("click", () => dismissCookie(null));

// ===== ACCOUNT MODAL PANELS =====
function switchPanel(name) {
    document.querySelectorAll(".account-panel").forEach(p => p.classList.add("hidden"));
    const target = document.getElementById("panel-" + name);
    if (target) {
        target.classList.remove("hidden");
        if (name === "orders") loadOrders();
    }
    if (typeof lucide !== "undefined") lucide.createIcons();
}

function closeAccountModal() {
    const modal = document.getElementById("account-modal");
    const ov = document.querySelector(".nav-overlay");
    if (modal) modal.classList.remove("active");
    if (ov) ov.classList.remove("active");
    setTimeout(() => switchPanel("main"), 350);
}

function loadOrders() {
    const orders = JSON.parse(localStorage.getItem("glh_orders") || "[]");
    const emptyEl = document.getElementById("orders-empty");
    const listEl = document.getElementById("orders-list");
    if (!listEl) return;
    listEl.innerHTML = "";
    if (orders.length === 0) {
        if (emptyEl) emptyEl.classList.remove("hidden");
        return;
    }
    if (emptyEl) emptyEl.classList.add("hidden");
    orders.forEach(order => {
        const card = document.createElement("div");
        card.className = "order-card";
        card.innerHTML = `
            <div class="order-card-header">
                <span class="order-ref">#${order.ref}</span>
                <span class="order-date">${order.date}</span>
            </div>
            <div class="order-items-preview">${order.items.map(i => i.name).join(", ")}</div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px;">
                <span class="order-total">£${parseFloat(order.total).toFixed(2)}</span>
                <span class="order-status"><i data-lucide="check-circle"></i> Confirmed</span>
            </div>
        `;
        listEl.appendChild(card);
    });
    if (typeof lucide !== "undefined") lucide.createIcons();
}

function setLanguage(lang) {
    fetch(`/set-language/${lang}`).then(() => window.location.reload());
}

function confirmDelete() {
    if (confirm("Are you sure you want to delete your account? This cannot be undone.")) {
        window.location.href = "/user/delete";
    }
}

// ===== GLOBAL STATE =====
let globalBasket = JSON.parse(localStorage.getItem("glh_basket") || "[]");
let globalFavs = JSON.parse(localStorage.getItem("glh_favourites") || "[]");

function refreshAllDots() {
    globalBasket = JSON.parse(localStorage.getItem("glh_basket") || "[]");
    globalFavs = JSON.parse(localStorage.getItem("glh_favourites") || "[]");
    ["basketDot", "mobileBasketDot"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.toggle("hidden", globalBasket.length === 0);
    });
    ["favDot", "mobileFavDot"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.toggle("hidden", globalFavs.length === 0);
    });
}

refreshAllDots();

// ===== BASKET MODAL =====
function openBasket() {
    const isLoggedIn = document.body.dataset.loggedin === "true";
    if (!isLoggedIn) {
        window.location.href = "/auth/login?next=/shop";
        return;
    }
    _openBasket();
}

function _openBasket() {
    const ov = document.getElementById("basketOverlay");
    const modal = document.getElementById("basketModal");
    if (!ov || !modal) return;
    ov.classList.remove("hidden");
    modal.classList.remove("hidden");
    requestAnimationFrame(() => modal.classList.add("open"));
    document.body.style.overflow = "hidden";
    renderGlobalBasket();
    if (typeof lucide !== "undefined") lucide.createIcons();
}

function closeBasket() {
    const ov = document.getElementById("basketOverlay");
    const modal = document.getElementById("basketModal");
    if (!modal) return;
    modal.classList.remove("open");
    setTimeout(() => {
        ov?.classList.add("hidden");
        modal.classList.add("hidden");
        document.body.style.overflow = "";
    }, 350);
}

function renderGlobalBasket() {
    globalBasket = JSON.parse(localStorage.getItem("glh_basket") || "[]");
    const wrap = document.getElementById("basketItems");
    const emptyEl = document.getElementById("basketEmpty");
    const footerEl = document.getElementById("basketFooter");
    const totalEl = document.getElementById("basketTotal");
    if (!wrap) return;
    wrap.innerHTML = "";
    if (globalBasket.length === 0) {
        emptyEl?.classList.remove("hidden");
        footerEl?.classList.add("hidden");
        return;
    }
    emptyEl?.classList.add("hidden");
    footerEl?.classList.remove("hidden");
    let total = 0;
    globalBasket.forEach((item, index) => {
        total += item.price * item.qty;
        const el = document.createElement("div");
        el.className = "basket-item";
        el.innerHTML = `
            <img class="basket-item-img" src="${item.image}" alt="${item.name}">
            <div class="basket-item-info">
                <div class="basket-item-name">${item.name}</div>
                <div class="basket-item-vendor">${item.vendor}</div>
                <div class="basket-item-price">£${(item.price * item.qty).toFixed(2)}</div>
                <div class="basket-item-qty">Qty: ${item.qty} · ${item.unit}</div>
            </div>
            <button class="basket-item-remove" onclick="removeGlobalBasketItem(${index})">
                <i data-lucide="trash-2"></i>
            </button>
        `;
        wrap.appendChild(el);
    });
    if (totalEl) totalEl.textContent = `£${total.toFixed(2)}`;
    if (typeof lucide !== "undefined") lucide.createIcons();
}

function removeGlobalBasketItem(index) {
    globalBasket = JSON.parse(localStorage.getItem("glh_basket") || "[]");
    globalBasket.splice(index, 1);
    localStorage.setItem("glh_basket", JSON.stringify(globalBasket));
    refreshAllDots();
    renderGlobalBasket();
}

function clearBasket() {
    globalBasket = [];
    localStorage.setItem("glh_basket", JSON.stringify(globalBasket));
    refreshAllDots();
    renderGlobalBasket();
}

// ===== FAV MODAL =====
function openFavourites() {
    const isLoggedIn = document.body.dataset.loggedin === "true";
    if (!isLoggedIn) {
        window.location.href = "/auth/login?next=/shop";
        return;
    }
    _openFavourites();
}

function _openFavourites() {
    const ov = document.getElementById("favOverlay");
    const modal = document.getElementById("favModal");
    if (!ov || !modal) return;
    ov.classList.remove("hidden");
    modal.classList.remove("hidden");
    requestAnimationFrame(() => modal.classList.add("open"));
    document.body.style.overflow = "hidden";
    renderGlobalFavourites();
    if (typeof lucide !== "undefined") lucide.createIcons();
}

function closeFavourites() {
    const ov = document.getElementById("favOverlay");
    const modal = document.getElementById("favModal");
    if (!modal) return;
    modal.classList.remove("open");
    setTimeout(() => {
        ov?.classList.add("hidden");
        modal.classList.add("hidden");
        document.body.style.overflow = "";
    }, 350);
}

function renderGlobalFavourites() {
    globalFavs = JSON.parse(localStorage.getItem("glh_favourites") || "[]");
    const wrap = document.getElementById("favItems");
    const emptyEl = document.getElementById("favEmpty");
    if (!wrap) return;
    wrap.innerHTML = "";
    if (globalFavs.length === 0) {
        emptyEl?.classList.remove("hidden");
        return;
    }
    emptyEl?.classList.add("hidden");
    globalFavs.forEach((item, index) => {
        const el = document.createElement("div");
        el.className = "fav-item";
        el.innerHTML = `
            <img class="fav-item-img" src="${item.image}" alt="${item.name}">
            <div class="fav-item-info">
                <div class="fav-item-name">${item.name}</div>
                <div class="fav-item-vendor">${item.vendor}</div>
                <div class="fav-item-price">£${parseFloat(item.price).toFixed(2)} / ${item.unit}</div>
            </div>
            <button class="fav-item-remove" onclick="event.stopPropagation(); removeGlobalFav(${index})">
                <i data-lucide="heart-off"></i>
            </button>
        `;
        el.addEventListener("click", e => {
            if (e.target.closest(".fav-item-remove")) return;
            closeFavourites();
            setTimeout(() => {
                const card = document.querySelector(`.product-card[data-id="${item.productId}"]`);
                if (card && typeof openProductModal === "function") {
                    card.style.display = "";
                    openProductModal(card);
                } else {
                    window.location.href = "/shop";
                }
            }, 400);
        });
        wrap.appendChild(el);
    });
    if (typeof lucide !== "undefined") lucide.createIcons();
}

function removeGlobalFav(index) {
    globalFavs = JSON.parse(localStorage.getItem("glh_favourites") || "[]");
    globalFavs.splice(index, 1);
    localStorage.setItem("glh_favourites", JSON.stringify(globalFavs));
    refreshAllDots();
    renderGlobalFavourites();
}

// WIRE NAV BUTTONS
document.addEventListener("DOMContentLoaded", () => {
    const basketBtn = document.getElementById("basket-btn");
    if (basketBtn) basketBtn.addEventListener("click", openBasket);

    const favBtn = document.getElementById("fav-btn");
    if (favBtn) favBtn.addEventListener("click", openFavourites);

    document.addEventListener("keydown", e => {
        if (e.key === "Escape") {
            closeBasket();
            closeFavourites();
        }
    });
});


// ===== LANGUAGE SYSTEM =====
const GLH_TRANSLATIONS = {
    en: {
        // NAVBAR
        "discover": "Discover",
        "legal": "Legal",
        "support": "Support",
        "shop": "Shop",
        "about": "About Us",
        "location": "Location",
        "privacy": "Privacy Policy",
        "terms": "Terms & Conditions",
        "returns": "Returns Policy",
        "contact": "Contact Us",
        "faqs": "FAQs",
        "delivery": "Delivery & Services",
        // FOOTER
        "footer_tagline": "Premium food & drink delivered fast. Built for convenience and quality.",
        "footer_discount": "Get 25% off",
        "footer_subscribe": "Subscribe and receive exclusive discounts.",
        "footer_email": "Enter your email",
        "footer_discover": "Discover",
        "footer_support": "Support",
        "footer_hours": "Opening Hours",
        "footer_address": "Address",
        "footer_hours_weekday": "Mon - Fri: 9am - 10pm",
        "footer_hours_weekend": "Sat - Sun: 10am - 11pm",
        "footer_rights": "© 2026 GLH. All rights reserved.",
        // ACCOUNT MODAL
        "my_account": "My Account",
        "orders": "Orders",
        "dashboard": "Dashboard",
        "settings": "Settings",
        "language": "Language",
        "logout": "Log Out",
        "sign_in": "Sign In",
        "create_account": "Create Account",
        "sign_in_prompt": "Sign in to access your orders, settings and more.",
        // BASKET
        "your_basket": "Your Basket",
        "basket_empty": "Your basket is empty",
        "basket_empty_sub": "Add some products to get started",
        "subtotal": "Subtotal",
        "view_checkout": "View in Checkout",
        "clear_basket": "Clear basket",
        // FAVOURITES
        "your_favourites": "Your Favourites",
        "no_favourites": "No favourites yet",
        "no_favourites_sub": "Tap the heart on any product to save it here",
        // SHOP
        "browse_everything": "Browse everything",
        "sort_by": "Sort by",
        "featured": "Featured",
        "price_low": "Price: Low to High",
        "price_high": "Price: High to Low",
        "most_popular": "Most Popular",
        "in_stock": "✓ In stock",
        "add_to_basket": "Add to Basket",
        "buy_now": "Buy Now",
        // GENERAL
        "back": "Back",
        "save_changes": "Save Changes",
        "delete_account": "Delete Account",
        "send_code": "Send Code",
        "next": "Next",
        "loading": "Loading...",
    },
    fr: {
        "discover": "Découvrir",
        "legal": "Légal",
        "support": "Assistance",
        "shop": "Boutique",
        "about": "À propos",
        "location": "Localisation",
        "privacy": "Politique de confidentialité",
        "terms": "Conditions générales",
        "returns": "Politique de retour",
        "contact": "Nous contacter",
        "faqs": "FAQ",
        "delivery": "Livraison & Services",
        "footer_tagline": "Alimentation et boissons premium livrées rapidement. Conçu pour la commodité et la qualité.",
        "footer_discount": "Obtenez 25% de réduction",
        "footer_subscribe": "Abonnez-vous et recevez des remises exclusives.",
        "footer_email": "Entrez votre email",
        "footer_discover": "Découvrir",
        "footer_support": "Assistance",
        "footer_hours": "Heures d'ouverture",
        "footer_address": "Adresse",
        "footer_hours_weekday": "Lun - Ven: 9h - 22h",
        "footer_hours_weekend": "Sam - Dim: 10h - 23h",
        "footer_rights": "© 2026 GLH. Tous droits réservés.",
        "my_account": "Mon compte",
        "orders": "Commandes",
        "dashboard": "Tableau de bord",
        "settings": "Paramètres",
        "language": "Langue",
        "logout": "Se déconnecter",
        "sign_in": "Se connecter",
        "create_account": "Créer un compte",
        "sign_in_prompt": "Connectez-vous pour accéder à vos commandes et plus encore.",
        "your_basket": "Votre panier",
        "basket_empty": "Votre panier est vide",
        "basket_empty_sub": "Ajoutez des produits pour commencer",
        "subtotal": "Sous-total",
        "view_checkout": "Voir la caisse",
        "clear_basket": "Vider le panier",
        "your_favourites": "Vos favoris",
        "no_favourites": "Pas encore de favoris",
        "no_favourites_sub": "Appuyez sur le cœur pour sauvegarder un produit",
        "browse_everything": "Tout parcourir",
        "sort_by": "Trier par",
        "featured": "En vedette",
        "price_low": "Prix: Croissant",
        "price_high": "Prix: Décroissant",
        "most_popular": "Plus populaires",
        "in_stock": "✓ En stock",
        "add_to_basket": "Ajouter au panier",
        "buy_now": "Acheter maintenant",
        "back": "Retour",
        "save_changes": "Sauvegarder",
        "delete_account": "Supprimer le compte",
        "send_code": "Envoyer le code",
        "next": "Suivant",
        "loading": "Chargement...",
    },
    es: {
        "discover": "Descubrir",
        "legal": "Legal",
        "support": "Soporte",
        "shop": "Tienda",
        "about": "Sobre nosotros",
        "location": "Ubicación",
        "privacy": "Política de privacidad",
        "terms": "Términos y condiciones",
        "returns": "Política de devoluciones",
        "contact": "Contáctanos",
        "faqs": "Preguntas frecuentes",
        "delivery": "Entrega y Servicios",
        "footer_tagline": "Comida y bebida premium entregada rápido. Diseñado para la comodidad y calidad.",
        "footer_discount": "Obtén 25% de descuento",
        "footer_subscribe": "Suscríbete y recibe descuentos exclusivos.",
        "footer_email": "Introduce tu email",
        "footer_discover": "Descubrir",
        "footer_support": "Soporte",
        "footer_hours": "Horario de apertura",
        "footer_address": "Dirección",
        "footer_hours_weekday": "Lun - Vie: 9am - 10pm",
        "footer_hours_weekend": "Sáb - Dom: 10am - 11pm",
        "footer_rights": "© 2026 GLH. Todos los derechos reservados.",
        "my_account": "Mi cuenta",
        "orders": "Pedidos",
        "dashboard": "Panel de control",
        "settings": "Configuración",
        "language": "Idioma",
        "logout": "Cerrar sesión",
        "sign_in": "Iniciar sesión",
        "create_account": "Crear cuenta",
        "sign_in_prompt": "Inicia sesión para acceder a tus pedidos y más.",
        "your_basket": "Tu cesta",
        "basket_empty": "Tu cesta está vacía",
        "basket_empty_sub": "Añade productos para empezar",
        "subtotal": "Subtotal",
        "view_checkout": "Ver en caja",
        "clear_basket": "Vaciar cesta",
        "your_favourites": "Tus favoritos",
        "no_favourites": "Sin favoritos aún",
        "no_favourites_sub": "Toca el corazón para guardar un producto",
        "browse_everything": "Ver todo",
        "sort_by": "Ordenar por",
        "featured": "Destacados",
        "price_low": "Precio: Menor a Mayor",
        "price_high": "Precio: Mayor a Menor",
        "most_popular": "Más populares",
        "in_stock": "✓ En stock",
        "add_to_basket": "Añadir a la cesta",
        "buy_now": "Comprar ahora",
        "back": "Atrás",
        "save_changes": "Guardar cambios",
        "delete_account": "Eliminar cuenta",
        "send_code": "Enviar código",
        "next": "Siguiente",
        "loading": "Cargando...",
    }
};

function t(key) {
    const lang = localStorage.getItem("glh_lang") || "en";
    return GLH_TRANSLATIONS[lang]?.[key] || GLH_TRANSLATIONS["en"][key] || key;
}

function applyLanguage() {
    const lang = localStorage.getItem("glh_lang") || "en";
    document.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.dataset.i18n;
        const translation = GLH_TRANSLATIONS[lang]?.[key];
        if (!translation) return;
        if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
            el.placeholder = translation;
        } else {
            el.textContent = translation;
        }
    });

    // Update lang buttons active state
    document.querySelectorAll(".lang-btn").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.lang === lang);
    });
}

// Override setLanguage to also save to localStorage
function setLanguage(lang) {
    localStorage.setItem("glh_lang", lang);
    fetch(`/set-language/${lang}`).then(() => {
        applyLanguage();
        window.location.reload();
    });
}

// Run on every page load
document.addEventListener("DOMContentLoaded", applyLanguage);
