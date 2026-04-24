// ACCORDION
document.querySelectorAll(".faq-q").forEach(btn => {
    btn.addEventListener("click", () => {
        const item = btn.closest(".faq-item");
        const isOpen = item.classList.contains("open");

        // Close all
        document.querySelectorAll(".faq-item.open").forEach(i => i.classList.remove("open"));

        // Open clicked if it wasn't already open
        if (!isOpen) item.classList.add("open");
    });
});

// ACTIVE NAV ON SCROLL
const sections = document.querySelectorAll(".faqs-section");
const navLinks = document.querySelectorAll(".fnav-link");

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const id = entry.target.id;
            navLinks.forEach(link => {
                link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
            });
        }
    });
}, { threshold: 0.3 });

sections.forEach(s => observer.observe(s));

navLinks.forEach(link => {
    link.addEventListener("click", e => {
        e.preventDefault();
        const target = document.querySelector(link.getAttribute("href"));
        if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
});

if (typeof lucide !== "undefined") lucide.createIcons();
