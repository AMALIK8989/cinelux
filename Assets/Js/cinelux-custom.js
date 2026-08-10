document.addEventListener("DOMContentLoaded", () => {

    // ===========================
    // Initialize AOS
    // ===========================

    const isMobile = window.innerWidth < 768;

document.querySelectorAll('[data-aos="fade-left"], [data-aos="fade-right"]').forEach(el => {
    if (isMobile) {
        el.setAttribute("data-aos", "fade-up");
    }
});

  AOS.init({
    once: false,
    duration: 500,
    easing: "ease-out-cubic",
});
    // ===========================
    // Hero Swiper
    // ===========================
    new Swiper("#cxHeroSwiper", {
        loop: true,
        speed: 900,
        centeredSlides: true,

        autoplay: {
            delay: 3500,
            disableOnInteraction: false
        },

        effect: "coverflow",

       coverflowEffect: {
    rotate: 10,
    stretch: 0,
    depth: 50,
    modifier: 1,
    slideShadows: false
},
        pagination: {
            el: ".swiper-pagination",
            clickable: true
        },

        navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev"
        },

        breakpoints: {
            0: {
                slidesPerView: 1
            },
            768: {
                slidesPerView: 1.2
            },
            992: {
                slidesPerView: 1.3
            }
        }
    });

    // ===========================
    // Sticky Navbar Shadow
    // ===========================
    const navbar = document.getElementById("cxNavbar");

    window.addEventListener("scroll", () => {

        if (window.scrollY > 40) {
navbar.classList.add("cx-scrolled");
        } else {
navbar.classList.remove("cx-scrolled");        }

    });

    // ===========================
    // Smooth Scroll
    // ===========================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {

        anchor.addEventListener("click", function(e) {

            const target = document.querySelector(this.getAttribute("href"));

            if (!target) return;

            e.preventDefault();

            target.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        });

    });

    // ===========================
    // Close Mobile Menu
    // ===========================
    const navLinks = document.querySelectorAll(".navbar-collapse .nav-link");
    const navbarCollapse = document.querySelector(".navbar-collapse");

    navLinks.forEach(link => {

        link.addEventListener("click", () => {

            if (navbarCollapse.classList.contains("show")) {

                bootstrap.Collapse.getOrCreateInstance(navbarCollapse).hide();

            }

        });

    });

    // ===========================
    // Active Navigation
    // ===========================
    const sections = document.querySelectorAll("section[id]");
    const menuLinks = document.querySelectorAll(".cx-nav-link");

    window.addEventListener("scroll", () => {

        let current = "";

        sections.forEach(section => {

            const top = section.offsetTop - 120;

            if (pageYOffset >= top) {
                current = section.getAttribute("id");
            }

        });

        menuLinks.forEach(link => {

            link.classList.remove("active");

            if (link.getAttribute("href") === "#" + current) {
                link.classList.add("active");
            }

        });

    });

    // ===========================
    // Card Hover Animation
    // ===========================
    document.querySelectorAll(".cx-why-card").forEach(card => {

        card.addEventListener("mouseenter", () => {
            card.style.transform = "translateY(-10px)";
        });

        card.addEventListener("mouseleave", () => {
            card.style.transform = "";
        });

    });

    // ===========================
    // Logo Float
    // ===========================
    // const logo = document.getElementById("logo-image");

    // if (logo) {

    //     let direction = 1;

    //     setInterval(() => {

    //         logo.style.transform =
    //             `translateY(${direction * 6}px)`;

    //         direction *= -1;

    //     }, 1800);

    // }

    // ===========================
    // Fade-in Buttons
    // ===========================
    document.querySelectorAll(".cx-btn-gold, .cx-btn-outline-gold")
        .forEach(btn => {

            btn.addEventListener("mouseenter", () => {
                btn.style.transform = "translateY(-3px)";
            });

            btn.addEventListener("mouseleave", () => {
                btn.style.transform = "";
            });

        });

});