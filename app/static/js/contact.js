// TAB SWITCHING
const cnavBtns = document.querySelectorAll(".cnav-btn");
const tabs = document.querySelectorAll(".contact-tab");

cnavBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        cnavBtns.forEach(b => b.classList.remove("active"));
        tabs.forEach(t => t.classList.remove("active"));
        btn.classList.add("active");
        const tab = document.getElementById("tab-" + btn.dataset.tab);
        if (tab) tab.classList.add("active");
    });
});

// OTHER SUBJECT TOGGLE
const subjectSelect = document.querySelector("select[name='subject']");
const otherSubjectWrap = document.getElementById("otherSubjectWrap");

if (subjectSelect) {
    subjectSelect.addEventListener("change", () => {
        if (otherSubjectWrap) {
            otherSubjectWrap.classList.toggle("hidden", subjectSelect.value !== "other");
        }
    });
}

// OTHER PRODUCT TOGGLE
const productSelect = document.querySelector("select[name='product_type']");
const otherProductWrap = document.getElementById("otherProductWrap");

if (productSelect) {
    productSelect.addEventListener("change", () => {
        if (otherProductWrap) {
            otherProductWrap.classList.toggle("hidden", productSelect.value !== "other");
        }
    });
}

// AUTO OPEN VENDOR TAB IF URL HAS #vendor
if (window.location.hash === "#vendor") {
    const vendorBtn = document.querySelector("[data-tab='vendor']");
    if (vendorBtn) vendorBtn.click();
}

// AUTO DISMISS FLASH
const flash = document.querySelector(".contact-flash");
if (flash) {
    setTimeout(() => {
        flash.style.opacity = "0";
        flash.style.transition = "opacity 0.4s";
        setTimeout(() => flash.remove(), 400);
    }, 4000);
}

if (typeof lucide !== "undefined") lucide.createIcons();
