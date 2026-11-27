document.addEventListener("DOMContentLoaded", () => {
  // 1. Ініціалізація слайдера відгуків (Swiper.js v11)
  if (typeof Swiper !== "undefined" && document.querySelector(".reviews-swiper")) {
    new Swiper(".reviews-swiper", {
      loop: true,
      speed: 600,
      spaceBetween: 20,
      autoplay: {
        delay: 3500,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      },
      pagination: {
        el: ".reviews-swiper .swiper-pagination",
        clickable: true,
      },
      navigation: {
        nextEl: ".reviews-swiper .swiper-button-next",
        prevEl: ".reviews-swiper .swiper-button-prev",
      },
      a11y: {
        prevSlideMessage: "Попередній відгук",
        nextSlideMessage: "Наступний відгук",
        paginationBulletMessage: "Перейти до відгуку {{index}}",
      },
      breakpoints: {
        320: {
          slidesPerView: 1,
          spaceBetween: 16,
        },
        768: {
          slidesPerView: 2,
          spaceBetween: 20,
        },
        1024: {
          slidesPerView: 3,
          spaceBetween: 24,
        },
      },
    });
  }

  // 2. Ініціалізація модальної галереї (Fancybox v5)
  if (typeof Fancybox !== "undefined") {
    Fancybox.bind("[data-fancybox='readspace-gallery']", {
      Carousel: {
        transition: "fade",
      },
      Images: {
        Panzoom: {
          maxScale: 3,
        },
      },
      Toolbar: {
        display: {
          left: ["infobar"],
          middle: [],
          right: ["zoomIn", "zoomOut", "slideshow", "thumbs", "close"],
        },
      },
    });
  }

  // 3. Ефект друку тексту в Hero-блоці (Typed.js v3)
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (typeof Typed !== "undefined" && document.querySelector("#hero-typed") && !prefersReducedMotion) {
    new Typed("#hero-typed", {
      strings: ["за настроєм", "у вільну хвилину", "українською"],
      typeSpeed: 60,
      backSpeed: 35,
      startDelay: 1200,
      backDelay: 2000,
      loop: true,
      smartBackspace: true,
      cursorChar: "|",
    });
  }
});
