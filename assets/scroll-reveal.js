if (!window.__scrollRevealInit) {
  window.__scrollRevealInit = true;
  document.documentElement.classList.add('reveal-ready');

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.15, rootMargin: '0px 0px -10% 0px' }
  );

  const observeAll = () => {
    document.querySelectorAll('[data-reveal]:not(.is-revealed)').forEach((el) => observer.observe(el));
  };

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-revealed'));
  } else {
    observeAll();
    document.addEventListener('shopify:section:load', observeAll);
  }
}
