// =========================

// GLOBAL FORM VALIDATION FUNCTION (FIXED)

// =========================

function checkFormValidity() {

    const nextBtn = document.getElementById("nextBtn");

    if (!nextBtn) return;

    const inputs = document.querySelectorAll("input[required]");

    const dobInputs = document.querySelectorAll("[data-dd-input]");

    let valid = true;

    // NORMAL INPUTS

    inputs.forEach(input => {

        if (!input.value.trim()) valid = false;

    });

    // DOB INPUTS (STEP 1 ONLY)

    if (dobInputs.length > 0) {

        dobInputs.forEach(input => {

            if (!input.value) valid = false;

        });

    }

    nextBtn.disabled = !valid;

}


// =========================
// DOB DROPDOWN SYSTEM (DESKTOP + MOBILE FIXED)
// =========================
const allDropdowns = document.querySelectorAll("[data-dd]");
let closeTimeout;
const isTouchDevice = window.matchMedia("(hover: none)").matches;
allDropdowns.forEach((dd) => {
    const btn = dd.querySelector("[data-dd-btn]");
    const menu = dd.querySelector("[data-dd-menu]");
    const label = dd.querySelector("[data-dd-label]");
    const input = dd.querySelector("[data-dd-input]");
    // =========================
    // 📱 MOBILE (CLICK MODE)
    // =========================
    if (isTouchDevice) {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const isOpen = dd.classList.contains("open");
            // close all
            allDropdowns.forEach(d => d.classList.remove("open"));
            // toggle current
            if (!isOpen) {
                dd.classList.add("open");
            }
        });
        // click outside = close
        document.addEventListener("click", () => {
            allDropdowns.forEach(d => d.classList.remove("open"));
        });
    } else {
        // =========================
        // 🖥️ DESKTOP (HOVER MODE)
        // =========================
        dd.addEventListener("mouseenter", () => {
            clearTimeout(closeTimeout);
            allDropdowns.forEach(d => d.classList.remove("open"));
            dd.classList.add("open");
            // AUTO SCROLL
            const selectedValue = input.value;
            if (selectedValue) {
                const selectedItem = menu.querySelector(`[data-value="${selectedValue}"]`);
                if (selectedItem) {
                    selectedItem.scrollIntoView({ block: "center" });
                }
            }
        });
        dd.addEventListener("mouseleave", () => {
            closeTimeout = setTimeout(() => {
                dd.classList.remove("open");
            }, 150);
        });
        menu.addEventListener("mouseenter", () => {
            clearTimeout(closeTimeout);
        });
        menu.addEventListener("mouseleave", () => {
            closeTimeout = setTimeout(() => {
                dd.classList.remove("open");
            }, 150);
        });
    }
    // =========================
    // ✅ SELECT VALUE (COMMON)
    // =========================
    menu.querySelectorAll("li").forEach(item => {
        item.addEventListener("click", () => {
            label.textContent = item.textContent;
            input.value = item.dataset.value;
            dd.classList.remove("open");
            checkFormValidity();
        });
    });
});

// =========================

// 3D CARD SYSTEM

// =========================

const card = document.querySelector(".card");

if (card) {

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

}


// =========================

// EYE TOGGLE

// =========================

document.querySelectorAll(".eye-btn").forEach(btn => {

    btn.addEventListener("click", () => {

        const input = document.getElementById(btn.dataset.target);

        if (!input) return;

        const isHiddenn = input.type === "password";


        input.type = isHiddenn ? "text" : "password";

        // toggle visual state 
        btn.classList.toggle("active", isHiddenn)

    });

});


// =========================

// PASSWORD STRENGTH (SAFE)

// =========================
const password = document.getElementById("password");

const passwordField = document.querySelector(".password-field");

let strongTimeout;

if (password && passwordField) {

    password.addEventListener("input", () => {

        const val = password.value;

        let strength = 0;

        if (val.length >= 8) strength++;

        if (/[A-Za-z]/.test(val)) strength++;

        if (/[0-9]/.test(val)) strength++;

        if (/[^A-Za-z0-9]/.test(val)) strength++;

        // reset state

        passwordField.classList.remove("weak", "medium", "strong", "pulse");

        // clear any previous timeout

        clearTimeout(strongTimeout);

        if (val.length === 0) return;

        if (strength <= 1) {

            passwordField.classList.add("weak");

        }

        else if (strength === 2 || strength === 3) {

            passwordField.classList.add("medium");

        }

        else {

            // STRONG STATE

            passwordField.classList.add("strong");

            // trigger pulse

            passwordField.classList.add("pulse");

            // remove pulse class after animation ends

            setTimeout(() => {

                passwordField.classList.remove("pulse");

            }, 800);

            // FADE BACK AFTER 2.5s

            strongTimeout = setTimeout(() => {

                passwordField.classList.remove("strong");

            }, 2500);

        }

    });

}


// =========================

// DISABLED BUTTON LOGIC (FIXED CLEAN)

// =========================

const nextBtn = document.getElementById("nextBtn");

if (nextBtn) {

    const inputs = document.querySelectorAll("input[required]");

    // INITIAL STATE

    nextBtn.disabled = true;

    // INPUT EVENTS

    inputs.forEach(input => {

        input.addEventListener("input", checkFormValidity);

    });

    // RUN ON LOAD

    checkFormValidity();

}


// =========================

// SHAKE ON INVALID CLICK

// =========================

if (nextBtn) {

    nextBtn.addEventListener("click", (e) => {

        if (nextBtn.disabled) {

            e.preventDefault();

            nextBtn.classList.remove("shake");

            void nextBtn.offsetWidth;

            nextBtn.classList.add("shake");

        }

    });

}


// =========================

// MOBILE TOUCH FEEDBACK

// =========================

if (nextBtn) {

    nextBtn.addEventListener("touchstart", () => {

        if (nextBtn.disabled) {

            nextBtn.classList.remove("shake");

            void nextBtn.offsetWidth;

            nextBtn.classList.add("shake");

        }

    });

}

// DYNAMIC PROGRESS SYSTEM 
function setProgress(targetPercent) {
    const bar = document.querySelector(".progress-fill");
    if (!bar) return;

    // Start from 0 every time
    bar.style.width = "0%";

    // SMALL DELAY (PREMIUM FEEL)
    setTimeout(() => {

        bar.style.trasition = "width 0.9s cubic-bezier(0.4, 0, 0.2, 1)";
        bar.style.width = targetPercent + "%";
    }, 300);
}

// AUTO DETECT STEP 
document.addEventListener("DOMContentLoaded", () => {
    const stepText = document.querySelector(".step");

    if (!stepText) return;

    if (stepText.textContent.includes("Step 1")) {
        setProgress(0);
    }
    else if (stepText.textContent.includes("Step 2")) {
        setProgress(50);
    }
    else if (stepText.textContent.includes("Step 3")) {
        setProgress(100);
    }
});


// PREFILL DOB FROM SESSION 
document.addEventListener("DOMContentLoaded", () => {

    const signupData = JSON.parse(

        document.body.dataset.signup || "{}"

    );

    if (!signupData) return;

    const map = {

        dob_day: signupData.dob_day,

        dob_month: signupData.dob_month,

        dob_year: signupData.dob_year

    };

    document.querySelectorAll("[data-dd]").forEach(dd => {

        const input = dd.querySelector("[data-dd-input]");

        const label = dd.querySelector("[data-dd-label]");

        const name = input.name;

        const value = map[name];

        if (value) {

            input.value = value;

            label.textContent = value;

            dd.classList.add("prefill-animate");

        }

    });

});


// =========================

// FORM TRANSITION (NEXT)

// =========================

document.querySelectorAll("form").forEach(form => {

    form.addEventListener("submit", (e) => {

        if (form.id === "otpForm") return;

        const card = document.querySelector(".card");

        if (!card) return;

        e.preventDefault();

        // mark direction

        sessionStorage.setItem("navDirection", "forward");

        card.classList.add("slide-out-left");

        setTimeout(() => {

            form.submit();

        }, 300);

    });

});


// =========================

// BACK BUTTON TRANSITION

// =========================

const backBtn = document.getElementById("backBtn");

if (backBtn) {

    backBtn.addEventListener("click", (e) => {

        e.preventDefault();

        const card = document.querySelector(".card");

        sessionStorage.setItem("navDirection", "back");

        card.classList.add("slide-out-right");

        setTimeout(() => {

            window.location.href = backBtn.href;

        }, 300);

    });

}


// =========================

// PAGE LOAD ANIMATION

// =========================

window.addEventListener("DOMContentLoaded", () => {

    const card = document.querySelector(".card");

    if (!card) return;

    const direction = sessionStorage.getItem("navDirection");

    if (direction === "forward") {

        card.classList.add("slide-in-right");

    } else if (direction === "back") {

        card.classList.add("slide-in-left");

    }

    sessionStorage.removeItem("navDirection");

});


// MOBILE SWIPE BACK 

let touchStartX = 0;
let touchEndX = 0;

document.addEventListener("touchstart", (e) => {
    touchStartX = e.changedTouches[0].screenX;

});
document.addEventListener("touchend", (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    const swipeDistance = touchEndX - touchStartX;

    const isFromEdge = touchStartX < 40; // only from left edge

    if (swipeDistance > 80 && isFromEdge) {
        triggerBack();
    }
}

function triggerBack() {

    const backbtn = document.getElementById("backbtn");
    const card = document.querySelector(".card");

    if (!backbtn || !card) return;

    sessionStorage.setItem("navDirection", "back");

    card.classList.add("slide-out-right");

    setTimeout(() => {

        window.location.href = backBtn.href;
    }, 300);
}

// =========================
// PROGRESS BAR ANIMATION
// =========================
window.addEventListener("DOMContentLoaded", () => {
    const bar = document.querySelector(".progress-fill");
    if (!bar) return;
    const target = bar.dataset.progress;
    setTimeout(() => {
        bar.style.width = target + "%";
    }, 200); // slight delay = premium feel
});


// TRIGGER FOR CAPTCHA ANMIATION 
const captchaBox = document.querySelector(".captcha-box");
const inputs = document.querySelectorAll("#email, #password, #confirm");

let captchaShown = false;

inputs.forEach(input => {
    input.addEventListener("input", () => {
        if (!captchaShown && input.value.length > 0) {
            captchaShown = true;
            captchaBox.classList.add("show");
        }
    });

});



// STEP 3 LOGIC

const sendBtn = document.getElementById("sendCodeBtn");

const otpWrapper = document.getElementById("otpWrapper");

const otpInputs = document.querySelectorAll(".otp-inputs input");

const otpCombined = document.getElementById("otpCombined");

if (sendBtn && otpWrapper) {

    sendBtn.addEventListener("click", async () => {

        await fetch("/auth/send-otp", { method: "POST", credentials: "same-origin" });

        otpWrapper.classList.add("show");

        sendBtn.style.display = "none";

        startCooldown();

    });

}

// AUTO INPUT FLOW

otpInputs.forEach((input, index) => {

    input.addEventListener("input", () => {

        if (input.value.length === 1 && index < otpInputs.length - 1) {

            otpInputs[index + 1].focus();

        }

        combineOTP();

    });

    input.addEventListener("keydown", (e) => {

        if (e.key === "Backspace" && !input.value && index > 0) {

            otpInputs[index - 1].focus();

        }

    });

});

// COMBINE OTP

function combineOTP() {

    let code = "";

    otpInputs.forEach(input => code += input.value);



    if (otpCombined) otpCombined.value = code;

    // AUTO SUBMIT WHEN COMPLETE
    if (code.length === 6) {
        triggerOTPSubmit();
    }

}

// TRIGGER SUBMIT OTP
function triggerOTPSubmit() {

    const form = document.getElementById("otpForm");
    const loader = document.getElementById("otpLoader");

    if (!form || !loader) return;

    // SHOW LOADER
    loader.classList.add("show");

    // SLIGHT DELAY FOR SMOOTH UX FEEL
    setTimeout(() => {
        form.submit();
    }, 800);
}

// PASTE SUPPORT

document.addEventListener("paste", (e) => {

    const paste = e.clipboardData.getData("text").trim();

    if (paste.length === 6) {

        otpInputs.forEach((input, i) => {

            input.value = paste[i];

        });

        combineOTP();

    }

});


// COOLDOWN SYSTEM
const resendBtn = document.getElementById("resendBtn");

let countdown = 30;

let cooldownActive = false;

function startCooldown() {

    if (!resendBtn) return;

    cooldownActive = true;

    resendBtn.classList.add("disabled");

    const interval = setInterval(() => {

        countdown--;

        resendBtn.textContent = `Resend (${countdown}s)`;

        if (countdown <= 0) {

            clearInterval(interval);

            cooldownActive = false;

            resendBtn.classList.remove("disabled");

            resendBtn.textContent = "Resend";

            countdown = 30;

        }

    }, 1000);

}


// RESEND FUNCTIONALITY BUTTON
if (resendBtn) {
    resendBtn.addEventListener("click", async () => {

        if (cooldownActive) return; // PREVENTS SPAM

        await fetch("/auth/send-otp", { method: "POST" });

        startCooldown(); // RESTART TIMER
    });
}

// LOGIC TO DETECT ERRO AND SHAKE FOR STEP 3 VERFIY OPT 
window.addEventListener("DOMContentLoaded", () => {
    const errorAlert = document.querySelector(".alert-error");
    const otpInputs = document.querySelectorAll(".otp-inputs input");

    if (errorAlert && otpInputs.length > 0) {
        otpInputs.forEach(input => {
            input.classList.add("otp-shake");
            input.value = ""; // this clears inputs
        });

        otpInputs[0].focus();
    }
})

// LOGIN PAGE 
// =========================

// LOGIN PAGE LOGIC

// =========================

if (document.body.classList.contains("login-page")) {

    const loginBtn = document.getElementById("loginBtn");

    const inputs = document.querySelectorAll("#email, #password");

    function checkLoginValidity() {

        let valid = true;

        inputs.forEach(input => {

            if (!input.value.trim()) valid = false;

        });

        loginBtn.disabled = !valid;

    }

    // INITIAL STATE

    if (loginBtn) {

        loginBtn.disabled = true;

        inputs.forEach(input => {

            input.addEventListener("input", checkLoginValidity);

        });

        checkLoginValidity();

    }

    // AUTO FOCUS EMAIL

    document.getElementById("email")?.focus();

}



// RESET PASSWORD BUTTON 


const resetBtn = document.getElementById("resetBtn");

const passwordInput = document.getElementById("password");

const confirmInput = document.getElementById("confirm");

if (resetBtn && passwordInput && confirmInput) {

    function checkResetValidity() {

        const password = passwordInput.value.trim();

        const confirm = confirmInput.value.trim();

        // ONLY check if filled (let backend handle rules)

        resetBtn.disabled = !(password && confirm);

    }

    passwordInput.addEventListener("input", checkResetValidity);

    confirmInput.addEventListener("input", checkResetValidity);

    checkResetValidity(); // run on load

}
 