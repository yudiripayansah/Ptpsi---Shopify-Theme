let footerVue;
document.addEventListener("DOMContentLoaded", function (e) {
  footerVue = Vue.createApp({
    delimiters: ["${", "}"],
    methods: {
      toggleCurrencySwitcher(e) {
        e.preventDefault();
        let currencySwitcher = document.querySelector(
          "#currency-select-dropdown"
        );
        if (currencySwitcher) {
          currencySwitcher.classList.toggle("show");
        }
        return false;
      },
      toggleLanguageSwitcher(e) {
        e.preventDefault();

        const parent = e.target.closest(".language-selector");
        if (parent != null) {
          parent.classList.toggle("active");
        }

        return false;
      },
      changeCountry(iso_code, e) {
        e.preventDefault();

        const parent = e.target.closest("#currency-select-dropdown");
        let options = parent.querySelectorAll(".csd-option");
        options.forEach((item) => {
          item.classList.remove("active");
        });
        e.target.classList.add("active");

        const country_field = e.target
          .closest("#currency-selector-form-footer")
          .querySelector('input[name="country_code"]');
        country_field.value = iso_code;
        return false;
      },
      footerAccordion(e) {
        if (window.innerWidth < 1024) {
          $360.accordionToggle(e);
        }
      },
      setActiveCategory(e) {
        const clicked_el = e.target.closest(".category");
        const active_el = e.target
          .closest(".category-wrapper")
          .querySelectorAll(".category.active");
        if (active_el.length > 0) {
          active_el[0].classList.remove("active");
        }

        clicked_el.classList.add("active");
      },
      setLocalization() {
        document.getElementById("localization_form").submit();
      },
      setCurrency() {},
      gototop() {
        window.scrollTo({
          top: 0,
          behavior: 'smooth' // Smooth scrolling
        });
      }
    },
    mounted() {
      window.addEventListener('resize',()=>{
        let footerLink = document.querySelector('.site-footer .stfr-links:first-child')
        if(footerLink){
          footerLink.querySelector('.title-icon').classList.add('active')
          footerLink.querySelector('.description').setAttribute('style','display:block')
          footerLink.querySelector('.description').setAttribute('aria-hidden','false')
          footerLink.querySelector('.description').classList.remove('DOM-slider-hidden')
        }
      })
    }
  });

  footerVue.mount("#site-footer");
});
