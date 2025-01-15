export const initServiceSlider = () => {
    new Swiper(".services-slider", {
      slidesPerView: 1.2,
      spaceBetween: 20,
      centeredSlides: true,
      loop: true,
      autoplay: {
        delay: 3000,
        disableOnInteraction: false,
      },
      navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
      },
      pagination: {
        el: ".swiper-pagination",
        clickable: true,
      },
      breakpoints: {
        768: {
          slidesPerView: 3,
        },
      },
      slideToClickedSlide: false, // Nonaktifkan perpindahan slide dengan klik
    });
  };
  