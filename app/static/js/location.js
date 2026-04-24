// ===== LOCATION.JS =====

// MK College coordinates — MK6 5LP
const LAT = 52.0290;
const LNG = -0.7690;

// ---- INIT MAP ----
const map = L.map("glhMap", {
    center: [LAT, LNG],
    zoom: 15,
    zoomControl: true,
    scrollWheelZoom: false    // prevent accidental scroll zoom
});

// DARK TILE LAYER (matches site aesthetic)
L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/">CARTO</a>',
    subdomains: "abcd",
    maxZoom: 19
}).addTo(map);

// CUSTOM MARKER
const customIcon = L.divIcon({
    className: "",
    html: `
        <div style="
            width: 40px;
            height: 40px;
            background: #c89b6d;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 3px solid white;
            box-shadow: 0 4px 15px rgba(200,155,109,0.5);
        "></div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -45]
});

// ADD MARKER
const marker = L.marker([LAT, LNG], { icon: customIcon }).addTo(map);

marker.bindPopup(`
    <div style="
        background: #111;
        color: white;
        border: 1px solid #c89b6d;
        border-radius: 12px;
        padding: 12px 16px;
        font-family: -apple-system, sans-serif;
        min-width: 160px;
    ">
        <strong style="color: #c89b6d; font-size: 14px;">GLH Food & Drink</strong><br>
        <span style="font-size: 12px; opacity: 0.7;">Chaffron Way, MK6 5LP</span>
    </div>
`, {
    className: "glh-popup",
    closeButton: false
}).openPopup();

// ---- TODAY INDICATOR ----
const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const hours = {
    0: { open: 10, close: 23 },  // Sunday
    1: { open: 9,  close: 22 },  // Monday
    2: { open: 9,  close: 22 },  // Tuesday
    3: { open: 9,  close: 22 },  // Wednesday
    4: { open: 9,  close: 22 },  // Thursday
    5: { open: 9,  close: 22 },  // Friday
    6: { open: 10, close: 23 },  // Saturday
};

const now = new Date();
const todayIndex = now.getDay();
const currentHour = now.getHours();
const todayHours = hours[todayIndex];
const isOpen = currentHour >= todayHours.open && currentHour < todayHours.close;

// Highlight today's row
const hoursRows = document.querySelectorAll(".hours-row");
hoursRows.forEach(row => {
    const dayEl = row.querySelector(".day");
    if (dayEl && dayEl.textContent === days[todayIndex]) {
        row.classList.add("today");
    }
});

// Show open/closed status
const statusEl = document.getElementById("todayStatus");
if (statusEl) {
    if (isOpen) {
        statusEl.textContent = `✓ We're open now · Closes at ${todayHours.close}:00`;
        statusEl.className = "today-status open";
    } else {
        const tomorrow = hours[(todayIndex + 1) % 7];
        statusEl.textContent = `Closed · Opens tomorrow at ${tomorrow.open}:00am`;
        statusEl.className = "today-status closed";
    }
}
