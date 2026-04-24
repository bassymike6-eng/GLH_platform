const sections = document.querySelectorAll(".delivery-section");
const navLinks = document.querySelectorAll(".dnav-link");

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
