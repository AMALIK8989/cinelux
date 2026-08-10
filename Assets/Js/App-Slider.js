document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch("../../Assets/Api/Data.json");
        if (!response.ok) throw new Error("Unable to load slider data.");
        const json = await response.json();
        const movies = json.data;
        await buildSlider(movies);
    } catch (err) {
        console.error(err);
    }
});

function preloadImages(urls) {
    return Promise.all(urls.map(src => new Promise(resolve => {
        const img = new Image();
        img.onload = img.onerror = resolve;
        img.src = src;
    })));
}

async function buildSlider(movies) {
    const totNum = document.getElementById("totNum");
    const bgWrapper = document.getElementById("bgWrapper");
    const posterWrapper = document.getElementById("posterWrapper");
    const movieTitle = document.getElementById("movieTitle");
    const movieDesc = document.getElementById("movieDesc");
    const watchBtn = document.getElementById("watchBtn");
    const trailerBtn = document.getElementById("trailerBtn");
    const genreTags = document.getElementById("genreTags");
    const curNum = document.getElementById("curNum");
    const progressBar = document.getElementById("progressBar");
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    const section = document.getElementById("slider-section");

    totNum.textContent = String(movies.length).padStart(2, "0");

    //------------------------------------------------------
    // Background Slides
    //------------------------------------------------------
    bgWrapper.innerHTML = movies.map(movie => `
        <div class="swiper-slide" style="background-image:url('${movie.bgImage}')"></div>
    `).join("");

    //------------------------------------------------------
    // Poster Slides
    //------------------------------------------------------
    posterWrapper.innerHTML = movies.map(movie => `
        <div class="swiper-slide">
            <span class="poster-badge">${movie.badge}</span>
            <img src="${movie.poster}" alt="${movie.title}" loading="lazy">
            <div class="poster-rating">
                <svg viewBox="0 0 24 24">
                    <polygon points="12 2 15.09 8.26 22 9.27
                                17 14.14 18.18 21.02
                                12 17.77 5.82 21.02
                                7 14.14 2 9.27
                                8.91 8.26 12 2"/>
                </svg>
                ${movie.rating}
            </div>
        </div>
    `).join("");

    // Wait for poster + bg images to actually load before initializing Swiper,
    // otherwise slide heights/positions can be measured wrong and cause jumps.
    await preloadImages(movies.flatMap(m => [m.bgImage, m.poster]));

    //------------------------------------------------------
    // Swipers
    //------------------------------------------------------
    const DURATION = 5000;
    const STEP = 60;
    let progressInterval;
    let progressValue = 0;

    const bgSwiper = new Swiper("#bg-swiper", {
        loop: true,
        effect: "fade",
        fadeEffect: { crossFade: true },
        speed: 900,
        allowTouchMove: false
    });

    const posterSwiper = new Swiper("#poster-swiper", {
    loop: true,
    centeredSlides: true,
    slidesPerView: 3,
    spaceBetween: 18,
    speed: 700,
    grabCursor: true,
    autoplay: {
        delay: DURATION,
        disableOnInteraction: false
    },
    breakpoints: {
        0: { slidesPerView: 2, spaceBetween: 12 },
        768: { slidesPerView: 3, spaceBetween: 18 },
        1200: { slidesPerView: 3, spaceBetween: 24 }
    },
    on: {
        slideChange() {
            syncSlide(this.realIndex);
        }
    }
});

    function syncSlide(index) {
        bgSwiper.slideToLoop(index, 900);
        updateText(index);
        startProgress();
    }

    //------------------------------------------------------
    // Text
    //------------------------------------------------------
    function updateText(index) {
        const movie = movies[index];
        const anim = document.querySelectorAll(".ca");

        anim.forEach(el => el.classList.remove("vis"));

        setTimeout(() => {
            movieTitle.textContent = movie.title;
            movieDesc.textContent = movie.description;
            watchBtn.href = movie.watchUrl;
            trailerBtn.href = movie.trailerUrl;

            genreTags.innerHTML = movie.genres
                .map(g => `<span class="genre-tag">${g}</span>`)
                .join("");

            curNum.textContent = String(index + 1).padStart(2, "0");

            anim.forEach(el => el.classList.add("vis"));
        }, 180);
    }

    //------------------------------------------------------
    // Progress
    //------------------------------------------------------
    function startProgress() {
        clearInterval(progressInterval);
        progressValue = 0;
        progressBar.style.width = "0%";

        const increment = (STEP / DURATION) * 100;

        progressInterval = setInterval(() => {
            progressValue = Math.min(progressValue + increment, 100);
            progressBar.style.width = progressValue + "%";
            if (progressValue >= 100) clearInterval(progressInterval);
        }, STEP);
    }

    //------------------------------------------------------
    // Buttons
    //------------------------------------------------------
    prevBtn.onclick = () => {
        posterSwiper.slidePrev();
    };

    nextBtn.onclick = () => {
        posterSwiper.slideNext();
    };

    //------------------------------------------------------
    // Pause
    //------------------------------------------------------
    section.addEventListener("mouseenter", () => {
        posterSwiper.autoplay.stop();
        clearInterval(progressInterval);
    });

    section.addEventListener("mouseleave", () => {
        posterSwiper.autoplay.start();
        startProgress();
    });

    //------------------------------------------------------
    // Init
    //------------------------------------------------------
    updateText(0);
    startProgress();
}