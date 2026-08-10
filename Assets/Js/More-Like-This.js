 const moreLikeThisSwiper = new Swiper('.moreLikeThisSwiper', {
    loop: true,
    slidesPerView: 2,
    spaceBetween: 18,
    navigation: {
      nextEl: '.cx-more-swiper .swiper-button-next',
      prevEl: '.cx-more-swiper .swiper-button-prev',
    },
      breakpoints: {
      480:  { slidesPerView: 2.4, spaceBetween: 18 },
      768:  { slidesPerView: 3.4, spaceBetween: 20 },
      992:  { slidesPerView: 4.4, spaceBetween: 22 },
      1200: { slidesPerView: 5.2, spaceBetween: 24 },
    },
  });