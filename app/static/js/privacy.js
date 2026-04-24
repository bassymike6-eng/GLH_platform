// ACTIVE NAV LINK ON SCROLL
const sections = document.querySelectorAll(".privacy-section");
const navLinks = document.querySelectorAll(".pnav-link");

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

// SMOOTH SCROLL
navLinks.forEach(link => {
    link.addEventListener("click", e => {
        e.preventDefault();
        const target = document.querySelector(link.getAttribute("href"));
        if (target) {
            target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    });
});
