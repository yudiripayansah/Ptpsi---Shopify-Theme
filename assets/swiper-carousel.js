if (!customElements.get('swiper-carousel')) {
  class SwiperCarousel extends HTMLElement {
    connectedCallback() {
      const el = this.querySelector('.swiper');
      if (!el || el.swiper || !window.Swiper) return;

      const pagination = this.querySelector('.swiper-pagination');
      const nextEl = this.querySelector('.swiper-button-next');
      const prevEl = this.querySelector('.swiper-button-prev');

      new window.Swiper(el, {
        loop: this.dataset.loop === 'true',
        spaceBetween: Number(this.dataset.spaceBetween) || 16,
        slidesPerView: 1,
        breakpoints: this.dataset.breakpoints ? JSON.parse(this.dataset.breakpoints) : undefined,
        autoplay:
          this.dataset.autoplay === 'true'
            ? { delay: Number(this.dataset.autoplayDelay) || 4000, disableOnInteraction: false, pauseOnMouseEnter: true }
            : false,
        pagination: pagination ? { el: pagination, clickable: true } : false,
        navigation: nextEl && prevEl ? { nextEl, prevEl } : false,
        a11y: {
          prevSlideMessage: this.dataset.prevLabel || 'Previous slide',
          nextSlideMessage: this.dataset.nextLabel || 'Next slide',
        },
      });
    }
  }

  customElements.define('swiper-carousel', SwiperCarousel);
}
