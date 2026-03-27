// =========================

// DOB DROPDOWN SYSTEM

// =========================

document.querySelectorAll("[data-dd]").forEach((dd) => {

    const btn = dd.querySelector("[data-dd-btn]");

    const menu = dd.querySelector("[data-dd-menu]");

    const label = dd.querySelector("[data-dd-label]");

    const input = dd.querySelector("[data-dd-input]");

    btn.addEventListener("click", (e) => {

        e.stopPropagation();

        dd.classList.toggle("open");

    });

    menu.querySelectorAll("li").forEach(item => {

        item.addEventListener("click", () => {

            label.textContent = item.textContent;

            input.value = item.dataset.value;

            dd.classList.remove("open");

        });

    });

    document.addEventListener("click", () => dd.classList.remove("open"));

});


// =========================

// 3D CARD SYSTEM (YOUR LOGIC)

// =========================

const card = document.querySelector(".card");

card.addEventListener("mousemove", (e) => {

    const rect = card.getBoundingClientRect();

    const x = (e.clientX - rect.left) / rect.width;

    const y = (e.clientY - rect.top) / rect.height;

    const rotateX = (0.5 - y) * 10;

    const rotateY = (x - 0.5) * 10;

    card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

    card.style.setProperty("--lx", `${x * 100}%`);

    card.style.setProperty("--ly", `${y * 100}%`);

});

card.addEventListener("mouseenter", () => {

    card.classList.add("is-paper");

});

card.addEventListener("mouseleave", () => {

    card.classList.remove("is-paper");

    card.style.transform = "";

});



// EYE TOGGLE

document.querySelectorAll(".eye-btn").forEach(btn => {

    btn.addEventListener("click", () => {

        const input = document.getElementById(btn.dataset.target);

        input.type = input.type === "password" ? "text" : "password";

    });

});

// PASSWORD STRENGTH

const password = document.getElementById("password");

const bar = document.getElementById("strengthFill");

password.addEventListener("input", () => {

    const val = password.value;

    let strength = 0;

    if (val.length >= 8) strength++;

    if (/[A-Z]/.test(val) || /[a-z]/.test(val)) strength++;

    if (/[0-9]/.test(val)) strength++;

    if (/[^A-Za-z0-9]/.test(val)) strength++;

    const width = (strength / 4) * 100;

    bar.style.width = width + "%";

    if (strength <= 1) bar.style.background = "red";

    else if (strength == 2) bar.style.background = "orange";

    else bar.style.background = "limegreen";

});
 