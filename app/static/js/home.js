function infiniteScroll(rowSelector, speed, direction) {

    const row = document.querySelector(rowSelector);

    if (!row) return;

    const track = row.querySelector(".track");

    const originalSet = track.querySelector(".set");

    // Clone enough sets to fill screen with no gaps

    const setWidth = originalSet.scrollWidth + 20; // 20 = gap

    const copiesNeeded = Math.ceil((window.innerWidth * 3) / setWidth) + 2;

    // Clear existing clones, keep only original

    track.innerHTML = "";

    track.appendChild(originalSet);

    for (let i = 0; i < copiesNeeded; i++) {

        track.appendChild(originalSet.cloneNode(true));

    }

    let pos = direction === "right" ? -setWidth : 0;

    let animId;

    function step() {

        if (direction === "left") {

            pos -= speed;

            if (pos <= -setWidth) pos = 0;

        } else {

            pos += speed;

            if (pos >= 0) pos = -setWidth;

        }

        track.style.transform = `translateX(${pos}px)`;

        animId = requestAnimationFrame(step);

    }

    animId = requestAnimationFrame(step);

}

// Start both rows

infiniteScroll(".row1", 0.6, "left");

infiniteScroll(".row2", 0.6, "right");



