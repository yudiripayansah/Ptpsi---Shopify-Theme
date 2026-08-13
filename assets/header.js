let headerVue;
document.addEventListener("DOMContentLoaded", function (e) {
  headerVue = Vue.createApp({
    delimiters: ["${", "}"],
    data() {
      return {
        cachedResults: {},
        predictiveSearchResults: null,
        showHeaderBar: true,
        showSearchForm: false,
        activeSubmenu: null,
        showMobileMenu: false,
        hideSiteHeader: false,
        prevScrollPos: 0,
        targetDropdownToggle: null,
        q: null,
        recents_keywords: null
      };
    },
    mounted() {
      const this_obj = this;
      (this.predictiveSearchResults = document.querySelector("#header-con__predictive-search")),
      this.siteHeaderHideShowBehaviour();
      this.loadRecentKeywords();
      //-- init AOS plugin
      AOS.init();
      //-- open cart drawer on first load
      const urlSearchParams = new URLSearchParams(window.location.search);
      const param = urlSearchParams.get("drawer");
      if (param == "true") {
        this_obj.showHeaderCart();
      }
      //-- adjust first section at homepage
      if (window.Shopify && window.location.pathname === Shopify.routes.root) {
        let startTime = Date.now();

        let retry = setInterval(() => {
          // ⛔ stop after 3 seconds if never passed
          if (Date.now() - startTime > 3000) {
            clearInterval(retry);
            return;
          }

          if (window.scrollY === 0) {
            let logo_check = document.querySelector('.header-logo');
            if (logo_check && parseFloat(getComputedStyle(logo_check).paddingTop) > 0) {
              clearInterval(retry); // stop immediately once passed

              setTimeout(() => {
                let headerConObj = document.querySelector("#shopify-section-header");
                let global_content_tm = document.querySelector(".global-content-top-margin");
                let adjustheader = headerConObj.offsetHeight;
                // global_content_tm.style.marginTop = `${adjustheader - 1}px`;
              }, 400);
            }
          }
        }, 50);
      }
      // listen mobile menu click
      this.listenMainMobileMenuClick()
      //-- page overlay global clicked
      // const page_overlay_global = document.querySelector(
      //   ".page-overlay.header-cart-overlay"
      // );
      // page_overlay_global.addEventListener("click", function (event) {
      //   this_obj.showSearchForm = false;
      // });

      //-- check no-bar cookie
      if ($360.getCookie("hide_ann_bar") == "true") {
        this_obj.removeAnnBar();
      }

      //-- search view all clicked
      document.addEventListener("click", function (e) {
        if (e.target.classList.contains("search-view-all")) {
          e.preventDefault();
          this_obj.clickViewAll();
        }

        var target = e.target;
        if (target.classList.contains('checkout-btn')) {
          e.preventDefault();
          e.stopImmediatePropagation();
          var noteInput = document.getElementById('CartSpecialInstructions');
          if (noteInput) {
            var note = noteInput.value;
            fetch('/cart/update.js', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              body: JSON.stringify({ note: note })
            })
            .then(function(response) {
              window.location.href = "/checkout";
            })
            .catch(function() {
              window.location.href = "/checkout";
            });
          } else {
            window.location.href = "/checkout";
          }
          return false;
        }
      });

      //-- collection filter hover behaviour
      const collection_filter = document.querySelector("#collection-filter");
      if (collection_filter != null) {
        collection_filter.classList.remove("zi-6");
        collection_filter.classList.add("zi-2");

        collection_filter.addEventListener("mouseenter", function (event) {
          event.stopPropagation();
          collection_filter.classList.add("zi-6");
          collection_filter.classList.remove("zi-2");
        });
        collection_filter.addEventListener("mouseleave", function (event) {
          event.stopPropagation();
          const filter_overlay = this.querySelector(".page-overlay");
          if (
            filter_overlay != null &&
            !filter_overlay.classList.contains("active")
          ) {
            collection_filter.classList.add("zi-2");
            collection_filter.classList.remove("zi-6");
          }
        });
      }

      //-- if URL contains #
      if (window.location.href.includes("#")) {
        const delay = setTimeout(() => {
          const scrollTop =
            document.documentElement.scrollTop || document.body.scrollTop || 0;
          const headerHeight =
            document.querySelector("#header-con").offsetHeight;

          window.scrollTo({
            top: scrollTop - headerHeight,
            behavior: "smooth",
          });

          clearTimeout(delay);
        }, 500);
      }
    },
    methods: {
      listenMainMobileMenuClick(){
        let menus = document.querySelectorAll('#header-con .header-con-menu-col-main .accordion-title')
        menus.forEach((menu) => {
          menu.addEventListener('click',function(){
            let activeMenuBox = document.querySelector('#header-con .header-con-menu-col-main')
            let activeMenu = document.querySelector('#header-con .header-con-menu-col-main .accordion-title.active')
            if(activeMenu){
              activeMenuBox.classList.add('has-activemenu')
            } else {
              activeMenuBox.classList.remove('has-activemenu')
            }
          })
        })
      },
      toggleCurrencySwitcher(e) {
        e.preventDefault();

        const parent = e.target.closest(".currency-selector");
        if (parent != null) {
          parent.classList.toggle("active");
        }

        return false;
      },
      changeCountry(iso_code, e) {
        e.preventDefault();
        const country_field = e.target
          .closest(".currency-selector")
          .querySelector('input[name="country_code"]');
        country_field.value = iso_code;
        country_field.closest("form").submit();

        return false;
      },
      setCookie(name, value, days) {
        let expires = "";
        if (days) {
          const date = new Date();
          date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
          expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "") + expires + "; path=/";
      },
      closeAnnBar(event) {
        event.preventDefault();

        /* set cookie expired in 2 days */
        this.setCookie("hide_ann_bar", "true", 2);
        this.removeAnnBar();
      },
      removeAnnBar() {
        const site_header = document.querySelector(".site-header");
        const ann_bar = document.querySelector(".header-bar");
        const body = document.querySelector("body"); 
        const global_content_tm = document.querySelector(
          ".global-content-top-margin"
        );

        if (site_header != null) {
          if (ann_bar != null) {
            ann_bar.remove();
          }

          body.classList.add("no-bar");

          $360.headerHeight = site_header.querySelector(".header-con-outer").offsetHeight;
          // if (global_content_tm != null) {
          //   global_content_tm.style.marginTop = `-${ann_bar.offsetHeight}px`;
          // }

          // if (site_header.classList.contains("transparent")) {
          //   const first_section = document.querySelector(
          //     ".global-content-top-margin .shopify-section:first-child"
          //   );
          //   if (first_section != null) {
          //     first_section.style.marginTop = `-${
          //       $360.headerHeight + ann_bar.offsetHeight
          //     }px`;
          //   }
          // }
        }
      },
      handleKeyDown(event) {
        if (event.key === "Enter") {
          let keyword = this.q.trim();
          window.location.href ="/search?type=product&q=" +keyword +"";
          this.addToRecentKeywords(keyword);
        }
      },
      addToRecentKeywords(keyword) {
        let recentKeywords = this.getRecentKeywordsCookie();
        recentKeywords = recentKeywords.filter(kw => kw !== keyword);
        recentKeywords.unshift(keyword);
        recentKeywords = recentKeywords.slice(0, 6);
        this.setCookie('recent_keywords', JSON.stringify(recentKeywords), 30);
        this.recents_keywords = recentKeywords;
      },
      getRecentKeywordsCookie() {
        const cookie = this.$360 ? $360.getCookie('recent_keywords') : document.cookie
          .split('; ')
          .find(row => row.startsWith('recent_keywords='))
          ?.split('=')[1];
        if (cookie) {
          try {
            return JSON.parse(decodeURIComponent(cookie));
          } catch (e) {
            return [];
          }
        }
        return [];
      },
      loadRecentKeywords() {
        this.recents_keywords = this.getRecentKeywordsCookie();
        let recentKeywordsElem = document.querySelector('#header-con__search-recent')
        if(this.recents_keywords.length == 0){
          recentKeywordsElem.classList.add('hide-m');
        } else {
          recentKeywordsElem.classList.remove('hide-m');
        }
      },
      clickViewAll() {
        this.addToRecentKeywords(this.q)
        window.location.href =
          "/search?type=product&q=" +
          this.q +
          "";
      },
      renderSearchResults(resultsMarkup) {
        this.predictiveSearchResults.innerHTML = resultsMarkup;
        document.querySelector("#header-con__search-suggestion-box").classList.add("hide-m");
        document.querySelector("#header-con__predictive-search").classList.remove("hide-m");
        document.querySelector("#header-con__search-result").classList.remove("hide-m");
        document.querySelector("#header-con__search-result").classList.add("push-d-3");
        document.querySelector("#header-con__search-result").classList.add("col-d-6");
        document.querySelector("#header-con__search-result").classList.remove("col-d-12");
        document.querySelector("#header-con__search-result").classList.remove("product-results-only");
      },
      destroySearchResults() {
        setTimeout(() => {
          document.querySelector("#header-con__predictive-search").classList.add("hide-m");
          document.querySelector("#header-con__search-suggestion-box").classList.remove("hide-m");
        },500)
      },
      noSearchResults() {
        document.querySelector("#header-con__predictive-search").classList.add("hide-m");
        document.querySelector("#header-con__search-result").classList.remove("push-d-3");
        document.querySelector("#header-con__search-result").classList.remove("col-d-6");
        document.querySelector("#header-con__search-result").classList.add("col-d-12");
        document.querySelector("#header-con__search-result").classList.add("product-results-only");
      },
      async goSearch() {
        let this_obj = this
        setTimeout(async ()=>{
          if (this_obj.q.trim() == "" || this_obj.q.trim() == null) {
            this_obj.destroySearchResults();
          } else {
            fetch(`${routes.predictive_search_url}?q=${encodeURIComponent(this_obj.q)}&section_id=predictive-search&resources[type]=product,collection,article,page`)
            .then((response) => {
              if (!response.ok) {
                var error = new Error(response.status);
                throw error;
              }
              return response.text();
            })
            .then((text) => {
              const resultsMarkup = new DOMParser()
                .parseFromString(text, "text/html")
                .querySelector("#shopify-section-predictive-search").innerHTML;
              if (resultsMarkup.includes("no-result-marker")) {
                this_obj.noSearchResults();
              } else {
                this_obj.renderSearchResults(resultsMarkup);
              }
            })
            .catch((error) => {
              if (error?.code === 20) {
                return;
              }
              throw error;
            });
          }
  
          try {
            let resultContainer = document.querySelector("#header-con__search-result");
            const suggestion_elem = document.querySelector("#header-con__search-suggestion-box");
            const req = await $360.getSearchContent("filtered", this_obj.q);
            let { data, status } = req;
  
            if (this_obj.q.trim() == "") {
              if (suggestion_elem != null) {
                suggestion_elem.classList.remove("hide-m");
              }
              resultContainer.innerHTML = "";
              resultContainer.classList.add("hide-m");
            } else {
              if (suggestion_elem != null) {
                suggestion_elem.classList.add("hide-m");
              }
              resultContainer.innerHTML = data;
              resultContainer.classList.remove("hide-m");
              if (data.includes("no-result-marker")) {
                document.querySelector('#header-con__dropdown-search').classList.add('no-result');
              } else {
                document.querySelector('#header-con__dropdown-search').classList.remove('no-result');
              }
            }
            setTimeout(()=>{
              $360.lazyLoadInstance.update();
            },500)
          } catch (error) {
            console.log(error);
          }
        },500)
      },
      fillSearchInput(input){
        const event = new Event('input', {
          'bubbles': true,
          'cancelable': true
        });
        document.querySelectorAll('input.search-term').forEach((el) => {
          // el.value = input;
          el.dispatchEvent(event);
        })
        this.q = input
      },
      siteHeaderHideShowBehaviour() {
        const doc = document.documentElement;
        const body = document.body;
        const headerHeight = document.querySelector(".site-header").offsetHeight;
        let headerBarHeight = 0;
        if (document.querySelector("#header-bar") != null) {
          headerBarHeight = document.querySelector("#header-bar").offsetHeight;
        }

        const headerMenuHeight = document.querySelector(
          ".site-header .header-con-outer"
        ).offsetHeight;
        const siteHeaderObj = document.querySelector(".site-header");
        const headerConObj = document.querySelector("#shopify-section-header");
        let announcementBar = document.querySelector("#header-bar");
        let global_content_tm = document.querySelector(".global-content-top-margin");
        let hideHeight = 0;
        let dropdownPos = 0;
        const this_obj = this;
        window.addEventListener("scroll", () => {
          const scrollPos = Math.max(doc.scrollTop, body.scrollTop);
          const scrollDirection = scrollPos > this_obj.prevScrollPos ? "down" : "up";
          if (window.Shopify && window.location.pathname === Shopify.routes.root) {
            if (scrollDirection == "down" && scrollPos > headerHeight) {
                // global_content_tm.style.marginTop = `${headerHeight - 1}px`
            }
          }
          setTimeout(()=>{
            if(siteHeaderObj.classList.contains('dropdown-shown')){
              return;
            }
            if (scrollDirection == "down" && scrollPos > headerHeight) {
              this_obj.hideSiteHeader = true;
              siteHeaderObj.classList.remove("scroll-top");
              headerConObj.classList.remove("scroll-top");
              siteHeaderObj.classList.add("scroll-down");
              headerConObj.classList.add("scroll-down");
  
              if (announcementBar != null) {
                hideHeight = announcementBar.offsetHeight;
              }
  
              headerConObj.style.top = `-${headerHeight}px`;
  
              // adjust sticky div on PDP (desktop only)
              if (
                document.querySelector(".product-info-outer-wrapper") != null &&
                screen.width > 1023
              ) {
                const pdp_info_outer_wrapper = document.querySelector(
                  ".product-info-outer-wrapper"
                );
                pdp_info_outer_wrapper.style.top = "68px";
              }
  
              // adjust sticky div for collection tabbed
              if (
                document.querySelector(".collection-tabbed") != null &&
                screen.width > 1023
              ) {
                const collection_tabbed_info = document.querySelector(
                  ".collection-tabbed .ctc-tabs"
                );
                collection_tabbed_info.style.top = "40px";
              }
  
              // adjust sticky div on cart (tablet up)
              if (
                document.querySelector(".cart-right .inner.t-sticky") != null &&
                screen.width > 767
              ) {
                const sticky_elem = document.querySelector(
                  ".cart-right .inner.t-sticky"
                );
                sticky_elem.style.top = "50px";
              }
              // adjust collection filter
              if (document.querySelector("#collection-filter")) {
                const collection_filter_elem =
                  document.querySelector("#collection-filter");
                collection_filter_elem.style.top = "0";
  
                collection_filter_elem.classList.add("going-down");
                collection_filter_elem.classList.remove("going-up");
              }
            } else if (scrollDirection == "up") {
              siteHeaderObj.classList.remove("scroll-down");
              headerConObj.classList.remove("scroll-down");
              if (window.Shopify && window.location.pathname === Shopify.routes.root) {
                let adjustheader = headerConObj.offsetHeight + headerBarHeight;
                // global_content_tm.style.marginTop = `${adjustheader - 1}px`
              }
  
              // adjust collection filter
              if (document.querySelector("#collection-filter")) {
                const collection_filter_elem =
                  document.querySelector("#collection-filter");
                collection_filter_elem.style.top = `${
                  headerHeight - headerBarHeight
                }px`;
  
                collection_filter_elem.classList.remove("going-down");
                collection_filter_elem.classList.add("going-up");
  
              }
  
              // adjust sticky div on PDP (desktop only)
              if (
                document.querySelector(".product-info-outer-wrapper") != null &&
                screen.width > 1023
              ) {
                const pdp_info_outer_wrapper = document.querySelector(
                  ".product-info-outer-wrapper"
                );
                pdp_info_outer_wrapper.style.top = "80px";
              }
  
              // adjust sticky div for collection tabbed
              if (
                document.querySelector(".collection-tabbed") != null &&
                screen.width > 1023
              ) {
                const collection_tabbed_info = document.querySelector(
                  ".collection-tabbed .ctc-tabs"
                );
                collection_tabbed_info.style.top = "150px";
              }
  
              // adjust sticky div on cart (tablet up)
              if (
                document.querySelector(".cart-right .inner.t-sticky") != null &&
                screen.width > 767
              ) {
                const sticky_elem = document.querySelector(
                  ".cart-right .inner.t-sticky"
                );
                sticky_elem.style.top = "150px";
              }
  
              if (scrollPos <= headerHeight) {
                this_obj.hideSiteHeader = false;
                siteHeaderObj.classList.remove("scroll-top");
                headerConObj.classList.remove("scroll-top");
  
                if ($360.getCookie("hide_ann_bar") == "true") {
                  dropdownPos = headerMenuHeight;
                } else {
                  dropdownPos = headerHeight;
                }
  
                if (!body.classList.contains("no-bar")) {
                  headerConObj.style.top = `0`;
                }
              } else {
                if ($360.getCookie("hide_ann_bar") == "true") {
                  siteHeaderObj.style.transform = "translateY(0)";
                }
  
                headerConObj.style.top = `-${hideHeight}px`;
                siteHeaderObj.classList.add("scroll-top");
                headerConObj.classList.add("scroll-top");
                dropdownPos = headerMenuHeight;
              }
            }
            this_obj.prevScrollPos = scrollPos;
            this_obj.activeSubmenu = null;
          },200)
        });
      },
      showHeaderCart() {
        $360.showHeaderCart();
        // setTimeout(()=>{initSwiperYmal();},1000);
      },
      toggleSubmenu(target){
        let submenus = document.querySelectorAll('.header-con-submenu')
        let active_menus = document.querySelectorAll(`.header-con-menu-item`)
        let active_submenus = document.querySelectorAll(`.header-con-submenu[data-parent="${target}"]`)
        let active_menu = document.querySelector(`.header-con-menu-item[data-parent="${target}"]`)
        active_menus.forEach((i)=>{
          i.classList.remove('active')
        })
        submenus.forEach((i)=>{
          i.classList.add('hide-m')
          i.classList.remove('flex')
        })
        active_submenus.forEach((i)=>{
          i.classList.remove('hide-m')
          i.classList.add('flex')
        })
        active_menu.classList.add('active')
      },
      toggleHeaderMenu(target=null){
        const x = window.scrollX;
        const y = window.scrollY;
        window.scrollTo(x, y);
        let body = document.querySelector('body')
        let header_con = document.querySelector('#header-con')
        let dropdown = document.querySelector('.header-con__dropdown')
        let dropdown_menu = document.querySelector('#header-con__dropdown-menu')
        let dropdown_search = document.querySelector('#header-con__dropdown-search')
        let site_header = document.querySelector('#site-header')
        if(screen.width < 1024){
          site_header.classList.add('scroll-top')
          let announcementBar = document.querySelector("#header-bar");
          const headerConObj = document.querySelector("#shopify-section-header");
          let hideHeight = 0
          if (announcementBar != null) {
            hideHeight = announcementBar.offsetHeight;
          }
          headerConObj.style.top = `-${hideHeight}px`;
        }
        if(target == 'search'){
          dropdown_menu.classList.add('hide-m')
          dropdown_menu.classList.remove('flex')
          dropdown_search.classList.remove('hide-m')
          dropdown_search.classList.add('active')
          this.targetDropdownToggle = 'search'
        } else {
          dropdown_menu.classList.remove('hide-m')
          dropdown_menu.classList.add('flex')
          dropdown_search.classList.add('hide-m')
          dropdown_search.classList.remove('active')
          this.targetDropdownToggle = null
        }
        let header_logo = site_header.querySelector('.header-logo')
        let header_logo_box = site_header.querySelector('.header-logo-box')
        let header_bar = document.querySelector('#header-bar')
        let global_content_tm = document.querySelector(".global-content-top-margin");
        let headerHeight = document.querySelector("#header-con").offsetHeight;
        let top = 0
        if(!dropdown.classList.contains('show')){
          header_logo.style.padding = 0
          header_logo_box.style.width = '100px'
          header_con.classList.remove('on-homepage')
          // global_content_tm.style.marginTop = `${headerHeight - 1}px`
        } else {
          header_con.classList.add('on-homepage')
          // global_content_tm.style.marginTop = `${headerHeight - 1}px`
        }
        setTimeout(()=>{
          dropdown.classList.toggle('show')
          site_header.classList.toggle('dropdown-shown')
          body.classList.toggle('overflow')
          if(site_header.classList.contains('scroll-top')){
            top = site_header.offsetHeight - header_bar.offsetHeight
          } else {
            top = site_header.offsetHeight
          }
          if(dropdown.classList.contains('show')){
            dropdown.style.top = top+'px'
          } else {
            dropdown.removeAttribute('style')
          }
        },500)
      },
      toggleSearch(status = 'show'){
        let dropdown_menu = document.querySelector('#header-con__dropdown-menu')
        let dropdown_search = document.querySelector('#header-con__dropdown-search')
        let this_obj = this
        setTimeout(() =>{
          if(status == 'show') {
            dropdown_menu.classList.remove('active')
            dropdown_menu.classList.remove('flex')
            dropdown_menu.classList.add('hide-m')
            dropdown_search.classList.remove('hide-m')
            setTimeout(()=> {
              dropdown_search.classList.add('active')
            },500)
          } else {
            if(this_obj.q.trim() == '' || this_obj.q.trim() == null){
              dropdown_search.classList.remove('active')
              dropdown_search.classList.add('hide-m')
              dropdown_menu.classList.add('flex')
              dropdown_menu.classList.remove('hide-m')
              setTimeout(() => {
                dropdown_menu.classList.add('active')
              },500)
            }
          }
        },500)
      },
      toggleGiftWrap(){
        let gift_wrap = document.querySelector('.header-con__gift-wrap')
        gift_wrap.classList.toggle('active')
        if(!gift_wrap.classList.contains('active')){
          $360.showHeaderCart();
          // setTimeout(()=>{initSwiperYmal();},1000);
        }
      },
      toggleGiftWrapProduct(e){
        let target = e.target.closest('.hc__gw-item')
        let check = target.querySelector('.gift-wrap-main-product')
        if(check?.checked){
          target.classList.add('active')
        } else {
          target.classList.remove('active')
          this.removeGiftWrap(target)
        }
        this.countGiftWrapPrice()
        this.toggleGiftWrapDetails()
      },
      toggleGiftWrapDetails(){
        let details = document.querySelector('.hc__gwi-details')
        let anyChecked = document.querySelector('.gift-wrap-main-product:checked')
        details?.classList.toggle('hide', !anyChecked)
      },
      selectGiftWrapDesign(event){
        let parent = event.target.closest('.hc__gwi-design')
        let input = parent.querySelector('.gift-wrap-design')
        let design = input.value
        let gwp_vars = document.querySelectorAll('.header-con__gift-wrap-products .gwp-var')
        gwp_vars.forEach((item) => {
          let opt1 = item.getAttribute('data-opt1')
          let opt2 = item.getAttribute('data-opt2')
          let opt3 = item.getAttribute('data-opt3')
          item.classList.remove('selected')
          if(opt1 == design || opt2 == design || opt3 == design){
            item.classList.add('selected')
          }
        })
        this.countGiftWrapPrice()
      },
      countGiftWrapPrice(){
        let gift_wrap_product = document.querySelector('.gift-wrap-product-data')
        let gwp_price = gift_wrap_product.getAttribute('data-price')
        let gift_wrap_btn = document.querySelector('.btn-add-gift-wrap')
        let gift_wrap_btn_price = gift_wrap_btn.querySelector('.gift-wrap-total-price')
        let gift_wrap_btn_label = gift_wrap_btn.querySelector('.gift-wrap-total-label')
        let gift_wrap_products = document.querySelectorAll('.hc__gw-item.active')
        let total_price = 0
        gift_wrap_products.forEach((item) => {
          let parent_qty = item?.getAttribute('data-qty')
          let gift_wrap_var = item.querySelector('.gwp-var')?.value
          let gift_wrap_price = item.querySelector('.gwp-var')?.getAttribute('data-price')
          let selected_var = item.querySelector('.gwp-var.selected')?.value
          let selected_price = item.querySelector('.gwp-var.selected')?.getAttribute('data-price')
          if(selected_var){
            gift_wrap_var = selected_var
            gift_wrap_price = selected_price
          }
          gift_wrap_price = gift_wrap_price * parent_qty
          total_price = total_price + Number(gift_wrap_price)
        })
        console.log('count gift wrap')
        if(gift_wrap_products.length > 0){
          gift_wrap_btn.classList.remove('disabled')
          gift_wrap_btn_price.innerHTML = `+S${this.formatMoney(total_price)}`
        } else {
          gift_wrap_btn.classList.add('disabled')
          gift_wrap_btn_label.innerHTML = 'Add Gift Wrapping'
          gift_wrap_btn_price.innerHTML = `+S${this.formatMoney(gwp_price)}`
        }
      },
      countGiftWrapMsg(e){
        let parent = e.target.closest('.gift-wrap-message-box')
        let text = parent.querySelector('.gift-wrap-message')
        let counter = parent.querySelector('.gift-wrap-text-counter .counter')
        let max = Number(text.getAttribute('maxlength'))
        let left = max - text.value.length 
        if(text.value.length > 0){
          text.classList.remove('empty')
        } else {
          text.classList.add('empty')
        }
        counter.innerHTML = left
      },
      showLoading(){
        let loading = document.querySelector('.header-cart-loading')
        loading.classList.add('active')
      },
      async removeGiftWrap(target) {
        let removeId = target.querySelector('.gift-wrap-id')
        if(removeId){
          try {
            let remove = {}
            remove[removeId.value] = 0
            let payload = {
              updates: remove
            }
            await axios.post('/cart/update.js', payload)
            removeId.remove()
          } catch (error) {
            
          }
        }
      },
      async addGiftWrapProduct(items = [],to_delete = []){
        let payload = {
          items: items
        }
        this.showLoading()
        try {
          let deleteItem = {}
          to_delete.forEach((i) => {
            deleteItem[i] = 0
          })
          let deletePayload = {
            updates: deleteItem
          }
          if(to_delete.length > 0){
            const deleteOld = await axios.post('/cart/update.js', deletePayload)
          }
          if(items.length > 0){
            const addToCart = await axios.post('/cart/add.js', payload);
          }
          this.toggleGiftWrap()
          $360.showHeaderCart();
          // setTimeout(()=>{initSwiperYmal();},1000)
        } catch (error) {
          
        }
      },
      async processGiftWrapProduct(e){
        let target = e.target.closest('.btn-add-gift-wrap')
        let items = []
        let cart = await this.getCart()
        let cart_items = cart.data.items
        let to_delete = []
        if(!target.classList.contains('disabled')){
          let gift_wrap_products = document.querySelectorAll('.hc__gw-item.active')
          gift_wrap_products.forEach((item) => {
            // let parent_id = item.querySelector('.gift-wrap-main-product')?.value
            // let parent_index = item.querySelector('.gift-wrap-main-product')?.getAttribute('data-id')
            let orig_gift_wrap = item.querySelector('.gift-wrap-id')
            let orig_gift_wrap_id = orig_gift_wrap?.value
            let orig_gift_wrap_variant = orig_gift_wrap?.getAttribute('data-variant')
            let orig_gift_wrap_sender = orig_gift_wrap?.getAttribute('data-sender')
            let orig_gift_wrap_recipient = orig_gift_wrap?.getAttribute('data-recipient')
            let orig_gift_wrap_message = orig_gift_wrap?.getAttribute('data-message')
            let parent_qty = item.querySelector('.gift-wrap-main-product')?.getAttribute('data-qty')
            let parent_key = item.querySelector('.gift-wrap-main-product')?.getAttribute('data-key')
            let parent_title = item.querySelector('.gift-wrap-main-product')?.getAttribute('data-title')
            let parent_id = item.querySelector('.gift-wrap-main-product')?.getAttribute('data-id')
            let gift_wrap_var = item.querySelector('.gwp-var')?.value
            let selected_var = item.querySelector('.gwp-var.selected')?.value
            let sender_name = document.querySelector('.hc__gwi-details .gift-wrap-sender-name')?.value
            let recipient_name = document.querySelector('.hc__gwi-details .gift-wrap-recipient-name')?.value
            let message = document.querySelector('.hc__gwi-details .gift-wrap-message')?.value
            let leave_blank = document.querySelector('.hc__gwi-details .gift-leave-blank')
            if(selected_var){
              gift_wrap_var = selected_var
            }
            if(orig_gift_wrap_variant != gift_wrap_var || orig_gift_wrap_sender != sender_name || orig_gift_wrap_recipient != recipient_name || orig_gift_wrap_message != message){
              if(orig_gift_wrap){
                to_delete.push(orig_gift_wrap_id)
              }
              let child = {
                id: Number(gift_wrap_var),
                quantity: Number(parent_qty),
                parent_line_key: parent_key
              }
              let properties = {}
              properties['_parent_id'] = Number(parent_id)
              properties['For'] = parent_title
              properties['_gift_wrap'] = true
              if(leave_blank?.checked){
                // properties["Leave blank"] = true
              } else {
                properties["Sender name"] = sender_name
                properties["Recipient name"] = recipient_name
                properties["Message"] = message
                // properties["Leave blank"] = false
              }
              child.properties = properties
              items.push(child)
            }
          })
          this.addGiftWrapProduct(items,to_delete)
        }
      },
      async getCart(){
        try {
          let cart = await axios.get('/cart.js')
          if(cart.status == 200 || cart.status == 201){
            return cart
          } else {
            return null
          }
        } catch (error) {
          return null
        }
      },
      formatMoney(num) {
        return Shopify.formatMoney(num,'${{amount}}');
      },
      toggleCartPageDrawer() {
        let header_cart = document.querySelector('#header-cart')
        header_cart.classList.toggle('delivery')
      },
      clearGiftWrapMessage(e){
        let target = e.target.closest('.hc__gwi-details')
        let leave_blank = target.querySelector('.gift-leave-blank')
        if(leave_blank?.checked){
          target.querySelector('.gift-wrap-sender-name').value = ''
          target.querySelector('.gift-wrap-recipient-name').value = ''
          target.querySelector('.gift-wrap-message').value = ''
          target.querySelector('.gift-wrap-message').classList.add('empty')
        }
      },
      uncheckLeaveblank(e){
        let target = e.target.closest('.hc__gwi-details')
        let btn = document.querySelector('.btn-add-gift-wrap')
        let leave_blank = target.querySelector('.gift-leave-blank')
        let sender_name = target.querySelector('.gift-wrap-sender-name')?.value
        let recipient_name = target.querySelector('.gift-wrap-recipient-name')?.value
        let message = target.querySelector('.gift-wrap-message')?.value
        if(sender_name != '' || recipient_name != '' || message != ''){
          leave_blank.checked = false
        }
        let error = 0
        if(error > 0){
          btn.classList.add('disabled')
        } else {
          btn.classList.remove('disabled')
        }
      },
      toggleEmptyProduct(e){
        let target = e.target.closest('.hcel-link') 
        let idx = target.getAttribute('data-index')
        let links = document.querySelectorAll('.header-con__empty-links .hcel-link')
        let products = document.querySelectorAll('.header-con__empty-product .hcep-product')
        let product = document.querySelector(`.header-con__empty-product .hcep-product[data-index="${idx}"]`) 
        products.forEach((item) => {
          item.classList.add('hide-m')
          item.classList.remove('flex')
        })
        links.forEach((item) => {
          item.classList.remove('active')
        })
        product.classList.remove('hide-m')
        product.classList.add('flex')
        target.classList.add('active')
      },
      chooseDelivery(el){
        let target = el
        let parent = el.closest('.header-con__delivery-options')
        let storePickupApp = document.querySelector('#storePickupApp')
        let shipping_option = parent.querySelector('.shipping-options')
        let selected_option = parent.querySelector('input[name="shipping-option"]:checked')?.getAttribute('value')
        let pickup_option = parent.querySelector('.pickup-options')
        parent.querySelector('.delivery-option-item.active')?.classList.remove('active')
        let method = target.getAttribute('data-method')
        let opt = document.querySelectorAll('.checkoutMethodsContainer .checkoutMethod')
        opt.forEach(el => {
          const name = el.querySelector('.checkoutMethodName')?.innerText.trim();
          if ((method === 'Shipping' && name === 'Local Delivery') || (method !== 'Shipping' && name === 'Local Delivery')) {
            el.click()
            target.classList.add('active')
            if(method === 'Shipping'){
              shipping_option.classList.remove('hide-m')
              pickup_option.classList.add('hide-m')
              if(selected_option && selected_option != 'Local'){
                storePickupApp.classList.add('active')
              } else {
                storePickupApp.classList.remove('active')
              }
            } else {
              shipping_option.classList.add('hide-m')
              pickup_option.classList.remove('hide-m')
              storePickupApp.classList.add('active')
            }
          }
        });
      },
      selectShippingOption(el){
        let storePickupApp = document.querySelector('#storePickupApp')
        let date = document.querySelector('#header-con #storePickupApp .Zapiet-InputWithPrefix__Input')?.value
        let btncheckout = document.querySelector('.button-checkout')
        let selected_option = el.querySelector('input').value
        if(selected_option != 'Local'){
          storePickupApp.classList.add('active')
          if(date){
            btncheckout.classList.remove('disabled')
          } else {
            btncheckout.classList.add('disabled')
          }
        } else {
          storePickupApp.classList.remove('active')
          btncheckout.classList.remove('disabled')
        }
      },
      async resetCheckoutAttributesPreserveOthers() {
        const ATTRIBUTES_TO_REMOVE = [
          "Checkout-Method",

          // Delivery
          "Delivery-Location-Id",
          "Delivery-Date",
          "Delivery-Time",
          "Delivery-Slot-Id",

          // Pickup
          "Pickup-Location-Id",
          "Pickup-Date",
          "Pickup-Time",
          "Pickup-Location-Company",
          "Pickup-Location-Address-Line-1",
          "Pickup-Location-Address-Line-2",
          "Pickup-Location-City",
          "Pickup-Location-Postal-Code",
          "Pickup-Location-Country"
        ];

        try {
          const cartRes = await fetch('/cart.js');
          const cart = await cartRes.json();

          const attributesPayload = {};

          // 1. Preserve attribute lain
          Object.keys(cart.attributes || {}).forEach(key => {
            if (!ATTRIBUTES_TO_REMOVE.includes(key)) {
              attributesPayload[key] = cart.attributes[key];
            }
          });

          // 2. Force remove delivery & pickup attributes
          ATTRIBUTES_TO_REMOVE.forEach(key => {
            attributesPayload[key] = null;
          });

          // 3. Update cart SEKALI
          const updateRes = await fetch('/cart/update.js', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ attributes: attributesPayload })
          });

          const updatedCart = await updateRes.json();

          return updatedCart;
        } catch (err) {
          console.error('Failed to reset checkout attributes', err);
        }
      },
      async goCheckout(el){
        if(!el.classList.contains('disabled')){
          try {
            el.classList.remove('jc-between')
            el.classList.add('jc-center')
            el.querySelector('span:first-child').innerText = 'Loading...'
            el.querySelector('span:last-child').remove()
            el.setAttribute('disabled',true)
            let delivery_option = document.querySelector('.delivery-option-item.active')?.getAttribute('data-method')
            let shipping_option = document.querySelector('.header-con__delivery-options .shipping-options .shipping-option input[name="shipping-option"]:checked')?.getAttribute('value')
            if(delivery_option === 'Shipping' && shipping_option === 'Local'){
              await this.resetCheckoutAttributesPreserveOthers()
            }
            window.location.href = '/checkout'
          } catch (error) {
            
          }
        }
      }
    },
  });
  headerVue = headerVue.mount("#header-con");
});

// script-custom.js
function fillSearchInput(input){
  const event = new Event('input', {
      'bubbles': true,
      'cancelable': true
  });
  document.querySelectorAll('input.search-term').forEach((el) => {
    el.value = input;
    el.dispatchEvent(event);
  })
  
}
function addToRecentKeywords(event,keyword){
  event.preventDefault()
}
// header cart
function initSwiperYmal() {
  let ymalSwiperEl = document.querySelector(".ymal-swiper");
  if (ymalSwiperEl) {
    let carouselYmal = new Swiper(".ymal-swiper", {
      slidesPerView: 2.5,
      spaceBetween: 16,
      breakpoints: {
        1366: {
          slidesPerView: 2.5,
          spaceBetween: 12,
          freeMode: false,
        },
      },
      loop: false,
      a11y: false,
      navigation: {
        nextEl: ".ymal-nav-next",
        prevEl: ".ymal-nav-prev",
      },
      on: {
        init: function () {
          ymalSwiperEl = document.querySelector(".ymal-swiper");
          ymalSwiperEl.classList.remove('hide-m')
          $360.lazyLoadInstance.update();
        },
        slideChange: function () {
          $360.lazyLoadInstance.update();
        },
        resize: function () {
          $360.lazyLoadInstance.update();
        },
      },
    });
    ymalSwiperEl = document.querySelector(".ymal-swiper");
    ymalSwiperEl.classList.remove('hide-m')
  } else {
    setTimeout(function () {
      initSwiperYmal();
    }, 500);
  }
}
async function giftProductToggle(varId, e) {
  e.preventDefault();

  let checkbox = e.target;
  let parent = checkbox.closest(".hcb-gifting");
  let msg = parent.querySelector("#gift-msg");
  let args = {
    variantId: varId,
    qty: 1,
    properties: {
      "Gift Message": msg.value,
      _isGiftWrap: true,
    },
  };

  const btnLoading = '<span class="btn-loading"></span>';
  checkbox.style.height = `${checkbox.offsetHeight}px`;
  checkbox.style.width = `${checkbox.offsetWidth}px`;
  checkbox.innerHTML = btnLoading;

  $360.addToCart(args, function () {
    $360.refreshCartPage();
  });
}
let giftTitle = document.querySelector(".hcb-gifting .accordion-title");
if (giftTitle != null) {
  giftTitle.addEventListener("click", function () {
    $360.adjustCartHeight();
  });
}
const wireZapietEvents = () => {
  let checkout_btn = document.querySelector('#header-con #header-cart .button-checkout')
  try {
    window.ZapietEvent.listen('checkoutEnabled', function(e) { 
      checkout_btn?.classList.remove('disabled')
    });
    window.ZapietEvent.listen('checkoutDisabled', function(e) { 
      checkout_btn?.classList.add('disabled')
    });
  } catch (err) {
    console.log(err)
  }
};
const checkInterval = setInterval(() => {
  let checkout_btn = document.querySelector('#header-con #header-cart .button-checkout')
  if (window.ZapietEvent !== undefined && window.ZapietEvent && checkout_btn) {
    clearInterval(checkInterval); 
    const checkWidget = setTimeout(function(){
      clearTimeout(checkWidget);
    }, 700);
    wireZapietEvents();
  }
}, 500);
