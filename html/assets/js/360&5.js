const $360 = {
    headerHeight: null,
    handleize: function(str) {
        str = str.toLowerCase();
        var toReplace = ['"', "'", "\\", "(", ")", "[", "]"];
        for (var i = 0; i < toReplace.length; ++i) {
            str = str.replace(toReplace[i], "");
        }
        str = str.replace(/\W+/g, "-");
        if (str.charAt(str.length - 1) == "-") {
            str = str.replace(/-+\z/, "");
        }
        if (str.charAt(0) == "-") {
            str = str.replace(/\A-+/, ""); 
        }
        return str
    },
    getHeaderHeight: function() { 
        const header = document.getElementById('site-header');
        if(!header) return;
        this.headerHeight = header.offsetHeight;
        
    },
    lazyLoadInstance: new LazyLoad({ 
        elements_selector: '.lazy',
    }),
    setGlobalContentTopMargin: function() {
        const el = document.querySelector('.global-content-top-margin');
        if(el) {
            if($360.getCookie('hide_ann_bar') == 'true') {
            } else {
                // el.style.marginTop = `${this.headerHeight - 1}px`;
            }
        }
    },
    setStickyBelowHeaderPosition: function() {
        const el = document.querySelector('.sticky-below-header');
        if(el) {
            el.style.top = `${this.headerHeight - 1}px`;
        }
    },
    setMobileMenuWrapperPosition: function() {
        /*
            const el = document.querySelector('.mobile-menu-wrapper');
            if(el) {
                el.style.top = `${this.headerHeight - 1}px`;
            }
        */
    },
    setFullHeightPage: function() {
        const el = document.querySelector('.full-height-page');
        if(el) {
            el.style.height = `calc(100vh - ${this.headerHeight}px)`;
        }
    },
    btnLoading: function(alternative = false) {
        if(alternative){
            return `<span class="btn-loading alt"></span>`;
        }
        return `<span class="w-full tc">Adding...</span>`;
    },
    updateQueryString: function(key, value, url) {
        if (!url) url = window.location.href;
  
      let updated = ''
      var re = new RegExp("([?&])" + key + "=.*?(&|#|$)(.*)", "gi"),
          hash;
  
      if (re.test(url)) {
          if (typeof value !== 'undefined' && value !== null) {
              updated = url.replace(re, '$1' + key + "=" + value + '$2$3');
          } 
          else {
              hash = url.split('#');
              url = hash[0].replace(re, '$1$3').replace(/(&|\?)$/, '');
              if (typeof hash[1] !== 'undefined' && hash[1] !== null) {
                  url += '#' + hash[1];
              }
              updated = url;
          }
      }
      else {
          if (typeof value !== 'undefined' && value !== null) {
              var separator = url.indexOf('?') !== -1 ? '&' : '?';
              hash = url.split('#');
              url = hash[0] + separator + key + '=' + value;
              if (typeof hash[1] !== 'undefined' && hash[1] !== null) {
                  url += '#' + hash[1];
              }
              updated = url;
          }
          else {
              updated = url;
          }
      }
  
      window.history.replaceState({ path: updated }, '', updated);
    },
    getSearchContent: async function(tpl, q) {
        let surl = `/search?view=${tpl}&q=${q}`;
        try {
            const goFind = await axios.get(surl);
            return goFind;
        } catch (error) {
            alert(error.response.data.message);
        }
    },
    /**
     * args is an object of qty, variantId, properties, button
     * callback: function callback after success
     */
    quickAddToCardVarId: function(var_id, elem = null) {
        if(elem != null) {
            let mtfColor = elem.getAttribute("data-metafieldscolor");
            let properties = {}
            if(mtfColor){
                properties['Color'] = mtfColor
            }
            let payload = {
                qty: 1,
                variantId: var_id
            }
            if(properties){
                payload.properties = properties
            }
            if(!elem.classList.contains('disabled')) {
                $360.addToCart(payload);
            }
        } else {
            $360.addToCart({
                qty: 1,
                variantId: var_id
            });
        }
    },
    addToCart: async function(args, callback) {
        const qty = args.qty;
        const variantId = args.variantId;
        const properties = args.properties;
        const button = args.button;

        let prevText;
        if(button) {
            prevText = button.innerHTML;
            const btnLoading = '<span class="w-full tc">Adding...</span>';
            button.style.height = `${button.offsetHeight}px`;
            //button.style.width = `${button.offsetWidth}px`;
            //button.innerHTML = prevText + btnLoading;
            button.innerHTML = btnLoading;
            button.setAttribute('disabled', true);

            const delay_animate = setTimeout(() => {
                button.classList.add('is-loading');

                clearTimeout(delay_animate);
            }, 100);
        }
        
        const data = {quantity: qty, id: variantId};

        if(properties) {
            data.properties = properties;
        }

        try {
            const addToCart = await axios.post('/cart/add.js', data);
            const cart = addToCart.data;
            if(document.querySelector('#product-each-theme-liquid.active')){
                this.hideQuickAdd();
            }
            if(document.querySelector('.page-overlay.header-cart-overlay.active')){
                if(document.querySelector('.header-search-form-close')){
                    document.querySelector('.header-search-form-close').click();
                }
            }
            this.showHeaderCart({update: true});
            if(document.getElementById('cart-content')) {
                this.refreshCartPage()
            }

            if(callback) {
                callback(cart);
            }
        } catch (error) {
            if(error.response){
                alert(error.response.data.message);
            }
        } finally {
            if(button) {
                const delay_button = setTimeout(() => {
                    button.innerHTML = prevText;
                    button.removeAttribute('disabled');
                    button.style.height = '';
                    //button.style.width = '';
                    button.classList.remove('is-loading');

                    clearTimeout(delay_button);
                }, 1000);
            }
        }
    },
    addToCartMultiple: function(args, callback) {
        const products = args.products;
        /*
            products array is object that consist of these
            {
                varId: String. the variant id,
                qty: Numeric. Quantity to be added
                properties: Object. The line item properties Object 
            }
        */ 
        const button = args.button;
        
        let is_update = true;
        if(args.is_update != undefined) {
            is_update = args.is_update;
        }

        const thisObj = this;

        let prevText;
        if(button) {
            prevText = button.innerHTML;
            const btnLoading = '<span class="w-full tc">Adding...</span>';
            button.style.height = `${button.offsetHeight}px`;
            button.style.width = `${button.offsetWidth}px`;
            //button.innerHTML = prevText + btnLoading;
            button.innerHTML = btnLoading;

            const delay = setTimeout(() => {
                button.setAttribute('disabled', true);
                button.classList.add('is-loading');

                clearTimeout(delay);
            }, 250);
        }
        
		Shopify.moveAlong = function() {
			if (products.length) {
				const product = products.shift();

                const productData = {
                    id: product.varId,
                    quantity: product.qty 
                };

                if(product.hasOwnProperty('properties')) {
                    productData.properties = product.properties;
                };

                axios.post('/cart/add.js', productData)
                    .then(function(response) {
						Shopify.moveAlong();
                    })
                    .catch(function(error) {
                        console.log(error.response.data.message)
                    });
			} else {
                if(button) {
                    const delay_button = setTimeout(() => {
                        button.innerHTML = prevText;
                        button.removeAttribute('disabled');
                        button.style.height = '';
                        button.style.width = '';
                        button.classList.remove('is-loading');
                        
                        clearTimeout(delay_button);
                    }, 1000);
                }

                //-- check GWP
                if(callback) {
                    callback();
                }

                if(is_update) {
                    thisObj.showHeaderCart({update: true});

                    if(document.getElementById('cart-content')) {
                        thisObj.refreshCartPage()
                    }
                }
			}
		};
		Shopify.moveAlong();
    },
    updateGroupItemQty: async function(args, callback) {
        const thisObj = this;
        const index = args.index;
        const qty = args.qty;
        let groupId = null;
        let removeSameGroup = null;

        if(args.hasOwnProperty('groupId')) {
            groupId = args.groupId;
        }
        const doneUpdate = function(callback, cart) {
            if(callback) {
                callback(cart);
            }
        }
        try {
            const updateCart = await axios.post('/cart/change.js', {line: index, quantity: qty});
            const cart = updateCart.data;
            doneUpdate(callback, cart);
        } catch (error) {
            alert(error.response.data.message);
        }
    },
    updateItemQty: async function(args, callback) {
        const thisObj = this;
        const index = args.index;
        const qty = args.qty;
        let groupId = null;
        let parentId = null;
        let key = null;
        let removeSameGroup = null;

        if(args.hasOwnProperty('groupId')) {
            groupId = args.groupId;
        }
        if(args.hasOwnProperty('key')) {
            key = args.key;
        }
        if(args.hasOwnProperty('parentId')) {
            parentId = args.parentId;
        }
        if(args.hasOwnProperty('removeSameGroup')) {
            removeSameGroup = args.removeSameGroup;

            if(removeSameGroup && document.querySelector('.header-cart-loading') && !document.getElementById('cart-content')) {
                document.querySelector('.header-cart-loading').classList.add('active');
            }
            if(removeSameGroup && document.getElementById('cart-content')) {
                document.querySelector('.page-loading').classList.add('active');
            }
        }

        const doneUpdate = function(callback, cart) {
            if(callback) {
                callback(cart);
            }
        }

        try {
            const updateCart = await axios.post('/cart/change.js', {line: index, quantity: qty});
            const cart = updateCart.data;

            if(qty == 0 && removeSameGroup) {
                const anotherIndex = cart.items.findIndex(item => {
                    if(item.properties.hasOwnProperty('_group_id')) {
                        return item.properties._group_id == groupId
                    }
                    else if(item.parent_relationship && item.parent_relationship.parent_key === key) {
                        return item.parent_relationship.parent_key === key
                    }
                    else if(item.properties.hasOwnProperty('_parent_id')) {
                        return item.properties._parent_id === parentId
                    } else {
                        return false
                    }
                });

                if(anotherIndex > -1) {
                    let updateObj = {
                        index: anotherIndex + 1,
                        qty: 0,
                        removeSameGroup: true
                    }
                    if(groupId){
                        updateObj['groupId'] = groupId
                    }
                    if(key){
                        updateObj['key'] = key
                    }
                    if(parentId){
                        updateObj['parentId'] = parentId
                    }
                    console.log(updateObj)
                    thisObj.updateItemQty(updateObj, callback)
                } else {
                    doneUpdate(callback, cart);
                }
            } else {
                doneUpdate(callback, cart);
            }
        } catch (error) {
            alert(error.response.data.message);
        }
    },
    setActiveCrossSell: function(className, e) {
        e.preventDefault();
        
        const button = e.target.closest('a');
        const parent = button.parentNode;
        const topElem = button.closest('.cross-sell-wrapper');

        if(parent.querySelector('.active') != null) {
            parent.querySelector('.active').classList.add('opacity-4');
            parent.querySelector('.active').classList.remove('active');
        }
        button.classList.remove('opacity-4');
        button.classList.add('active');

        const prevContent = topElem.querySelector('.content-each.active');
        if(prevContent != null) {
            prevContent.classList.remove('active');
            prevContent.classList.add('hide-m');
        }

        const activeContent = topElem.querySelector(`.${className}`);
        if(activeContent != null) {
            activeContent.classList.add('active');
            activeContent.classList.remove('hide-m');
        }
    },
    showHeaderCart: function(args = {}, callback) {
        // callback has cart data object
        const update = args.hasOwnProperty('update') ? args.update : false;
        const thisObj = this;
        
        const showIt = function() {
            document.getElementById('header-cart').classList.add('active');
            document.querySelector('.header-cart-overlay').classList.add('active');
            document.querySelector('body').classList.add('nooverflow');
            setTimeout(() => {
                document.querySelector('.header-con__cart-box')?.classList.add('active');
            },500)
            initSwiperYmal()

            if(document.querySelector('.header-cart-loading')) {
                document.querySelector('.header-cart-loading').classList.remove('active');
            }

            thisObj.lazyLoadInstance.update();
        };

        /*
            if(!update && document.getElementById('header-cart').childNodes.length) {
                showIt();
                return;
            }
        */
        
        axios.get('/cart.js')
            .then(function(response) {
                const cart = response.data;
                thisObj.updateHeaderCartCount(cart);
                
                axios.get('/cart?view=json')
                    .then(function(response) {
                        const html = response.data;
                        document.getElementById('header-cart').innerHTML = html;
                        
                        /* load recently viewed */
                        Shopify.Products.showRecentlyViewed({
                            howManyToShow: 6,
                            wrapperId: 'recently-viewed-cart-drawer', 
                            viewTemplate: "grid-cart-drawer",
                            shown: 0,
                            onComplete: function () {
                        		thisObj.lazyLoadInstance.update();
                        		const wrapper = document.querySelector("#recently-viewed-cart-drawer");
                        		const loading = document.querySelector("#recently-viewed-cart-drawer .btn-loading");
                        		const products_count = document.querySelectorAll( "#recently-viewed-cart-drawer .grid-each");
                        		const parent = document.querySelector(".hcm-recently-viewed");
                                if(loading){
                                    loading.remove()
                                }
                                if(wrapper){
                                    wrapper.classList.add('show')
                                }
                        		if (products_count.length > 0) {
                        			if (parent != null) {
                        				parent.classList.remove('hide-m');
                        			}
                        		} else {
                        			if (parent != null) {
                        				parent.classList.add('hide-m');
                        			}
                        		}
                        	}
                        });

                        thisObj.adjustCartHeight();
                        showIt();

                        if(callback) {
                            callback(cart)
                        }
                    })
                    .catch(function(error) {
                        console.log(error);
                    });
            })
            .catch(function(error) {
                console.log(error)
            });
    },
    addCrossSellToCart: function(e) {
        const this_button = e.target.closest('.icon-add');
        const var_id = this_button.getAttribute('data-variant-id');

        $360.addToCart({
            qty: 1,
            variantId: var_id
        });
    },
    hideHeaderCart: function() {
        document.querySelector('body').classList.remove('nooverflow');

        document.querySelector('.header-con__cart-box')?.classList.remove('active');
        setTimeout(()=>{
            document.getElementById('header-cart').classList.remove('active');
            document.querySelector('.header-cart-overlay').classList.remove('active');
            document.querySelector('.header-cart-overlay').classList.add('fade-out');
            setTimeout(function() {
                document.querySelector('.header-cart-overlay').classList.remove('fade-out');
            }, 1000);
        },500)
    },
    updateHeaderCartCount(cart) {
        let count = 0;
        cart.items.forEach(item => {
            if(item.properties) {
                if(!item.properties.hasOwnProperty('_group_id')) {
                    count = count + item.quantity;
                } else {
                    if(item.properties.hasOwnProperty('_group_parent')) {
                        count = count + item.quantity;
                    }
                }
            } else {
                count = count + item.quantity;
            }
        });
        if(count < 10){
            count = '0'+count
        }
        document.querySelector('.header-cart-number .cart-count').textContent = count; 
        if(count > 0) {
            document.querySelector('.header-cart-number').classList.remove('hide-m');
            document.querySelector('.header-cart-number').classList.add('flex');
        } else {
            document.querySelector('.header-cart-number').classList.add('hide-m');
            document.querySelector('.header-cart-number').classList.remove('flex');
        }
    },
    adjustCartHeight: function() {
        if(document.querySelector('.header-cart-bottom')) {
            let topHeight = document.querySelector('.header-cart-top').offsetHeight;
            if(document.querySelector('.header-cart-middle .free-cg-info')) {
                topHeight = topHeight + document.querySelector('.header-cart-middle .free-cg-info').offsetHeight + 2;
            }

            const bottomHeight = document.querySelector('.header-cart-bottom').offsetHeight;
            let crossSellHeight = 0;
            if(document.querySelector('.header-cart .cross-sell') && window.innerWidth < 768) {
                crossSellHeight = document.querySelector('.header-cart .cross-sell').offsetHeight;
            }
            const height = `${(window.innerHeight-(topHeight+bottomHeight))}px`;
            document.querySelector('.cart-items-wrapper').style.height = height;
        }
    },
    triggerBIS: function(e) {
        const id = e.target.closest('.atc-button').getAttribute('data-variant');
        const bis_button = document.querySelector('.BIS_trigger');
        bis_button.setAttribute('data-variant-id',id);
        bis_button.click();
    },
    triggerBackInStockInit(){
        BIS.popup.ready.then(function() {
            if (BIS.popup.variants.length < 1) {
                return;
            }

            var button = document.createElement('button');
            button.setAttribute('id', 'BIS_trigger');
            button.setAttribute('type', 'button');
            button.setAttribute('class', 'product-submit action-button submit');
            button.style.cssText = 'margin-top: -10px';
            button.textContent = BIS.currentButtonCaption();

            BIS.inlineButtonAnchor = '.product-form';
            var anchor = document.querySelector(BIS.inlineButtonAnchor);
            anchor.insertAdjacentElement('beforeend', button);

            var variantId;
            var originalDisplay = button.style.display; 
            BIS.refreshInlineButton = function() {
                try {
                    var variant = BIS.detectVariant(BIS.popup);

                    if (variant && BIS.popup.variantIsUnavailable(variant)) {
                        variantId = variant.id;
                        button.style.display = originalDisplay;
                    } else {
                        button.style.display = 'none';
                    }
                } catch (e) {
                    console.log(e);
                }
            };
                
            BIS.refreshInlineButton()
                
            BIS.delayedRefreshInlineButton = function() {
                setTimeout(function() { BIS.refreshInlineButton() }, 15)
            };

            document.addEventListener('change', BIS.delayedRefreshInlineButton);

            button.addEventListener('click', function() {
                BIS.popup.form.selectVariant(this.variantId);
            });
        });
    },
    refreshCartPage: function() {
        if(document.getElementById('cart-content')) {
            axios.get(window.Shopify.routes.root + 'cart?view=jsonpage')
                .then(function(response) {
                    document.getElementById('cart-content').innerHTML = "";
                    const html = document.createRange().createContextualFragment(response.data);
                    document.getElementById('cart-content').append(html);
                    
                    document.querySelector('.page-loading').classList.remove('active');
                })
                .catch(function(error) {
                    alert(error.response.data.message);
                });
        }
    },
    countCharacter: function(e) {
        const textArea = document.querySelector(".header-cart-next-page textarea");
        const maxLength = parseInt(textArea.getAttribute("maxlength"));
        const characterCount = document.querySelector(".header-cart-next-page .char-count");
        const currentLength = textArea.value.length;
        const remainingCharacters = maxLength - currentLength;
        characterCount.textContent = `${remainingCharacters} characters left`;
    },
    toggleOrderNote: function(e) {
        e.target.closest('.order-note-wrapper').classList.toggle('active');

        $360.adjustCartHeight();
    },
    productEachQuickAdd: function(e) {
        const el = e.target.closest('.product-each-quick-add');
        const handle = el.getAttribute('data-handle');
        const peach = el.closest('.product-each');

        document.querySelector('.page-overlay.quick-add-overlay').classList.add('active');
        document.querySelector('body').classList.add('nooverflow');

        axios.get(window.Shopify.routes.root+'products/'+handle+'?view=quick-add')
        .then(function(response) {
            document.querySelector('#product-each-theme-liquid').innerHTML = "";
            const html = document.createRange().createContextualFragment(response.data);
            document.getElementById('product-each-theme-liquid').append(html);

            
            document.querySelector("#product-each-theme-liquid").classList.add("active");
            
            //use different rs
            //console.log(document.querySelector('#product-each-theme-liquid .product-each').getAttribute('data-string'));
            //console.log(peach.getAttribute('data-string'));
            let rs = document.querySelector('#product-each-theme-liquid .product-each').getAttribute('data-string');
            
            //retain selection on mobile
            if(peach.querySelector(".swatch.variant-each-button.active")){
                document.querySelector('#product-each-theme-liquid').querySelector(".swatch.variant-each-button[data-value='"+peach.querySelector(".swatch.variant-each-button.active").getAttribute("data-value")+"']").click();
                // TODO set to first available variant on the selected color, one time only
                if(document.querySelector('#product-each-theme-liquid .other-option.variant-each-button.active.disabled')){
                    document.querySelector('#product-each-theme-liquid .other-option.variant-each-button:not(.disabled)').classList.add('active');
                    document.querySelector('#product-each-theme-liquid .other-option.variant-each-button.active.disabled').classList.remove('active');
                }

            }else{
                if(document.querySelector(`#slider-${rs}`)){
                    new Swiper(`#slider-${rs}`, {
                        slidesPerView: 2.5,
                        loop: false,
                        a11y: false,
                        observer:true,
                        observeParents:true,
                        spaceBetween:1,
                        breakpoints: {
                            600: {
                                slidesPerView: 3.2,
                            },
                            1024: {
                            slidesPerView: 1,
                            spaceBetween:0
                            }
                        },
                        navigation: {
                            nextEl: `#product-card${rs} .swiper-slider-arrow.right`,
                            prevEl: `#product-card${rs} .swiper-slider-arrow.left`
                        },
                        scrollbar: {
                            el: `#product-card${rs} .swiper-scrollbar`,
                            draggable: true,
                        }
                    });
                }
            }

            $360.lazyLoadInstance.update();

            const delay = setTimeout(function(){
                if(wishlistObj){
                    wishlistObj.init();
                    checkIwishCount(500);
                }
                clearTimeout(delay);
            }, 500);
        })
        .catch(function(error) {
            console.log(error)
        });
        
    },
    productEachOptionPicker: function(e) {
        const thisObj = this;
        const peach = e.target.closest('.product-each');
        const index_option = e.target.getAttribute('data-index');
        let selected_variant_id;

        const variant_selected_containers = peach.querySelectorAll('.variant-selected-container');
        variant_selected_containers.forEach(elem => {
            elem.setAttribute(`data-option${index_option}`, e.target.getAttribute('data-value'));
            setTimeout(() => {
                if(peach.querySelector('.other-option.active:not(.disabled)')){
                    //console.log("111");
                    //console.log(peach.querySelector('.other-option.active:not(.disabled)'));
                    elem.setAttribute(`data-option${peach.querySelector('.other-option.active:not(.disabled)').getAttribute('data-index')}`, peach.querySelector('.other-option.active:not(.disabled)').getAttribute('data-value'));
                }
            }, 200);
        });

        //set active
        const option_wrapper = e.target.closest('.option-wrapper');
        option_wrapper.querySelector('.variant-each-button.active').classList.remove('active');

        const this_elem = e.target.closest('.variant-each-button');
        this_elem.classList.add('active');

        const other_option = this_elem.getAttribute('data-value');

        let color_url;
        //set url if has color
        if(peach.querySelector('.color-option.active')){
            // if 2 options on quick add, pick selected
            const color = peach.querySelector('.color-option.active').getAttribute('data-value');
            if(peach.querySelector(`.variant-data-each[data-option1="${color}"][data-option2="${other_option}"]`)){
                color_url = peach.querySelector(`.variant-data-each[data-option1="${color}"][data-option2="${other_option}"]`).getAttribute('data-url');
            }else if(peach.querySelector(`.variant-data-each[data-option2="${color}"][data-option1="${other_option}"]`)){
                color_url = peach.querySelector(`.variant-data-each[data-option2="${color}"][data-option1="${other_option}"]`).getAttribute('data-url');
            }
            if(color_url){
                peach.querySelectorAll('.color-url').forEach(elem => {
                    elem.href = color_url;
                });
            }
        }

        //set disabled option (for color), is this necessary? questionable
        if(this_elem.getAttribute('data-index') == "1"){
            peach.querySelectorAll('.variant-each-button[data-index="2"]').forEach(elem => {
                if(peach.querySelector(`.variant-data-each[data-option1="${other_option}"][data-option2="${elem.getAttribute('data-value')}"]`) != null) {
                    if(peach.querySelector(`.variant-data-each[data-option1="${other_option}"][data-option2="${elem.getAttribute('data-value')}"]`).classList.contains('available')){
                        elem.classList.remove('disabled');
                    }else{
                        elem.classList.add('disabled');
                    }
                }
            });
        }else if(this_elem.getAttribute('data-index') == "2"){
            peach.querySelectorAll('.variant-each-button[data-index="1"]').forEach(elem => {
                if(peach.querySelector(`.variant-data-each[data-option2="${other_option}"][data-option1="${elem.getAttribute('data-value')}"]`) != null) {
                    if(peach.querySelector(`.variant-data-each[data-option2="${other_option}"][data-option1="${elem.getAttribute('data-value')}"]`).classList.contains('available')){
                        elem.classList.remove('disabled');
                    }else{
                        elem.classList.add('disabled');
                    }
                }
            });
        }

        setTimeout(() => {
            /* get selected variant id */
            const variant_selected_container = peach.querySelector('.variant-selected-container');
            let variant_data_container = null;
            
            if(variant_selected_container.getAttribute('data-option1') != ''){
                variant_data_container = peach.querySelector(`.variant-data-each[data-option1="${variant_selected_container.getAttribute('data-option1')}"]`);
            }
            if(variant_selected_container.getAttribute('data-option2') != ''){
                variant_data_container = peach.querySelector(`.variant-data-each[data-option1="${variant_selected_container.getAttribute('data-option1')}"][data-option2="${variant_selected_container.getAttribute('data-option2')}"]`);
            }
            if(variant_selected_container.getAttribute('data-option3') != ''){
                variant_data_container = peach.querySelector(`.variant-data-each[data-option1="${variant_selected_container.getAttribute('data-option1')}"][data-option2="${variant_selected_container.getAttribute('data-option2')}"][data-option3="${variant_selected_container.getAttribute('data-option3')}"]`);
            }

            if(variant_data_container != null) {
                //set price
                    if(peach.querySelector('.price-text')){
                        peach.querySelector('.price-text').innerHTML = thisObj.formatMoney(parseInt(variant_data_container.getAttribute('data-price')));
                        peach.querySelector('.price-text').style.display = 'inline';
                    }
                    if(peach.querySelector('.compare-at-price-text')){
                        if(parseInt(variant_data_container.getAttribute('data-compare-at-price')) > 0){
                            peach.querySelector('.compare-at-price-text').innerHTML = thisObj.formatMoney(parseInt(variant_data_container.getAttribute('data-compare-at-price')));
                            peach.querySelector('.compare-at-price-text').style.display = 'inline';
                        }else{
                            peach.querySelector('.compare-at-price-text').style.display = 'none';
                        }
                        
                    }
                //end set price

                const wishlist_btn = peach.querySelector('.icon-wishlist');
                if(wishlist_btn != null) {
                    //wishlist_btn.classList.remove('swym-added');
                    wishlist_btn.setAttribute('data-variant', variant_data_container.getAttribute('data-id'));
                    checkIwishCount(500);
                }

                if(peach.querySelector('.variant-each-button.active.disabled')){
                    peach.querySelector('.atc-button').innerHTML = peach.querySelector('.atc-button').getAttribute('data-label-notify');
                    peach.querySelector('.atc-button').classList.add('unavailable');
                    peach.querySelector('.atc-button').classList.remove('disabled');
                }else{
                    peach.querySelector('.atc-button').innerHTML = peach.querySelector('.atc-button').getAttribute('data-label-atb');
                    peach.querySelector('.atc-button').classList.remove('unavailable');
                    peach.querySelector('.atc-button').classList.remove('disabled');
                }
            } else {
                peach.querySelector('.atc-button').innerHTML = peach.querySelector('.atc-button').getAttribute('data-label-unavailable');
                peach.querySelector('.atc-button').classList.add('disabled');
                
                //set price
                if(peach.querySelector('.price-text')){
                    peach.querySelector('.price-text').style.display = 'none';
                }
                if(peach.querySelector('.compare-at-price-text')){
                    peach.querySelector('.compare-at-price-text').style.display = 'none';
                }
            }
        }, 300);        
    },
    hideQuickAdd: function(e) {
        document.querySelector("#product-each-theme-liquid").classList.remove("active");
        document.querySelector('.page-overlay.quick-add-overlay').classList.remove('active');
        document.querySelector('body').classList.remove('nooverflow');
        document.querySelector('#product-each-theme-liquid').innerHTML = "";
    },
    quickAddToCart: function(e) {
        if(e.target.classList.contains('disabled')){
            return;
        }

        const peach = e.target.closest('.product-each') ? e.target.closest('.product-each') : e.target.closest('.quick-add-mobile');
        const variant_selected_container = peach.querySelector('.variant-selected-container');
        let variant_data_container = null;
        
        if(variant_selected_container.getAttribute('data-option1') != ''){
            variant_data_container = peach.querySelector(`.variant-data-each[data-option1="${variant_selected_container.getAttribute('data-option1')}"]`);
        }
        if(variant_selected_container.getAttribute('data-option2') != ''){
            variant_data_container = peach.querySelector(`.variant-data-each[data-option1="${variant_selected_container.getAttribute('data-option1')}"][data-option2="${variant_selected_container.getAttribute('data-option2')}"]`);
        }
        if(variant_selected_container.getAttribute('data-option3') != ''){
            variant_data_container = peach.querySelector(`.variant-data-each[data-option1="${variant_selected_container.getAttribute('data-option1')}"][data-option2="${variant_selected_container.getAttribute('data-option2')}"][data-option3="${variant_selected_container.getAttribute('data-option3')}"]`);
        }

        if(variant_data_container){
            peach.querySelector('.variant-selected-container').setAttribute('data-variant', variant_data_container.getAttribute('data-id'));
            if(variant_data_container.classList.contains('available')){
                peach.querySelector('.variant-selected-container').classList.remove('disabled');
                $360.addToCart({
                    qty: 1,
                    variantId: peach.querySelector('.variant-selected-container').getAttribute('data-variant'),
                    button: e.target.closest('.atc-button')
                },
                setTimeout(() => {
                    if(document.querySelector('.mobile-atc .quick-add-mobile.active')){
                        document.querySelector('.mobile-atc .quick-add-mobile.active').classList.remove('active');
                    }
                }, 1000));
            }else{
                const quickAddBIS = document.querySelector('.pdp-oos-popup.from-quick-add');
                if(quickAddBIS != null) {
                    const var_id = variant_data_container.getAttribute('data-id');
                    if(quickAddBIS.querySelector('.options li.active') != null) {
                        quickAddBIS.querySelector('.options li.active').classList.remove('active');

                        if(quickAddBIS.querySelector(`.options li[data-value="${var_id}"]`) != null) {
                            quickAddBIS.querySelector(`.options li[data-value="${var_id}"]`).classList.add('active');
                            quickAddBIS.querySelector(`#oos-variant-id`).value = var_id;
                            quickAddBIS.querySelector(`.global-select-div .text`).innerHTML = quickAddBIS.querySelector(`.options li[data-value="${var_id}"]`).innerHTML;
                        }
                    }
                    $360.hideQuickAdd();
                    quickAddBIS.classList.add('active');
                }
            }
        }else{
            if(peach.querySelector('.variant-selected-container').getAttribute('data-variant')){
                $360.addToCart({
                    qty: 1,
                    variantId: peach.querySelector('.variant-selected-container').getAttribute('data-variant'),
                    button: e.target.closest('.atc-button')
                },
                setTimeout(() => {
                    if(document.querySelector('.mobile-atc .quick-add-mobile.active')){
                        document.querySelector('.mobile-atc .quick-add-mobile.active').classList.remove('active');
                    }
                }, 1000));
            }
        }
        
        
    },
    handleMouseLeave: function(e) {
        // console.log(e.target);

        e.target.classList.remove('active');
    },
    productEachColorPicker: function(e, img_url, from_quick_add) {
        const hover_desktop = e.target.closest('.product-each').querySelector('.hover-desktop');
        const peach = e.target.closest('.product-each');
        const rs = peach.getAttribute('data-string');
        const primary_image = e.target.closest('.product-each').querySelector('.primary img')
        const swatch_wrapper = e.target.closest('.swatch-wrapper');
        swatch_wrapper.querySelector('.swatch.active').classList.remove('active');

        const this_elem = e.target.closest('.swatch');
        this_elem.classList.add('active');

        const color = this_elem.getAttribute('data-value');
        const color_tag = this_elem.getAttribute('data-tag');

        let color_url = this_elem.getAttribute('data-url');
        if(img_url){
            primary_image.setAttribute('src', img_url)
            primary_image.setAttribute('data-src', img_url) 
            primary_image.removeAttribute('data-srcset') 
            primary_image.removeAttribute('srcset')
        }
        if(peach.querySelector('.other-option.active')){
            // if 2 options on quick add, pick selected
            let other_option = peach.querySelector('.other-option.active').getAttribute('data-value');
            if(peach.querySelector(`.variant-data-each[data-option1="${color}"][data-option2="${other_option}"]`)){
                color_url = peach.querySelector(`.variant-data-each[data-option1="${color}"][data-option2="${other_option}"]`).getAttribute('data-url');
            }else if(peach.querySelector(`.variant-data-each[data-option2="${color}"][data-option1="${other_option}"]`)){
                color_url = peach.querySelector(`.variant-data-each[data-option2="${color}"][data-option1="${other_option}"]`).getAttribute('data-url');
            }
        }else{
            // if 2 options but from product card, pick available one if possible
            if(peach.querySelector(`.variant-data-each[data-option1="${color}"].available`)){
                color_url = peach.querySelector(`.variant-data-each[data-option1="${color}"].available`).getAttribute('data-url');
            }else if(peach.querySelector(`.variant-data-each[data-option2="${color}"].available`)){
                color_url = peach.querySelector(`.variant-data-each[data-option2="${color}"].available`).getAttribute('data-url');
            }
        }

        peach.querySelectorAll('.color-url').forEach(elem => {
            elem.href = color_url;
        });
        
        const swatch_label = e.target.closest('.color-variant-picker').querySelectorAll('.swatch-label');
        if(e.target.closest('.color-variant-picker').querySelector('.swatch-tag')){
            e.target.closest('.color-variant-picker').querySelector('.swatch-tag').innerHTML = color_tag;
            if(color_tag == ""){
                e.target.closest('.color-variant-picker').querySelector('.swatch-tag').style.display = "none";
            }else{
                e.target.closest('.color-variant-picker').querySelector('.swatch-tag').style.display = "block";
            }
        }
        
        swatch_label.forEach(elem => {
            elem.innerHTML = color;
        });

        let have_alt = false;
		let have_var_image = false;
		document.querySelectorAll(`#product-card${rs} .swiper-slide`).forEach(function(elem){
			elem.classList.remove('hide-m');
			let active_color = document.querySelector(`#product-card${rs} .swatch.active`).getAttribute('data-value');
			let this_color = elem.getAttribute('data-alt');
			let active_image_id = document.querySelector(`#product-card${rs} .swatch.active`).getAttribute('data-image-id');
			let this_image_id = elem.getAttribute('data-id');
			
			if(this_color == active_color){
				have_alt = true;
			}else if(active_image_id == this_image_id){
				have_var_image = true;
			}
		});
        
		if(have_alt){
			document.querySelectorAll(`#product-card${rs} .swiper-slide`).forEach(function(elem){
				let active_color = document.querySelector(`#product-card${rs} .swatch.active`).getAttribute('data-value');
				let this_color = elem.getAttribute('data-alt');
				
				if(this_color == active_color){
				}else{
					elem.classList.add('hide-m');
				}
			});
            setTimeout(function() {
                if(from_quick_add){
                    if(document.querySelector(`#slider-${rs}`).swiper){
                        document.querySelector(`#slider-${rs}`).swiper.update();
                    }else{
                        new Swiper(`#slider-${rs}`, {
                            slidesPerView: 2.5,
                            loop: false,
                            a11y: false,
                            observer:true,
                            observeParents:true,
                            spaceBetween:1,
                            breakpoints: {
                                600: {
                                    slidesPerView: 3.2,
                                },
                                1024: {
                                slidesPerView: 1,
                                spaceBetween:0
                                }
                            },
                            navigation: {
                                nextEl: `#product-card${rs} .swiper-slider-arrow.right`,
                                prevEl: `#product-card${rs} .swiper-slider-arrow.left`
                            }
                        });
                    }
                }else{
                    // new Swiper(`#slider-${rs}`, {
                    //     slidesPerView: 1,
                    //     loop: false,
                    //     a11y: false,
                    //     observer:true,
                    //     observeParents:true,
                    //     navigation: {
                    //         nextEl: `#product-card${rs} .swiper-slider-arrow.right`,
                    //         prevEl: `#product-card${rs} .swiper-slider-arrow.left`
                    //     },
                    //     scrollbar: {
                    //         el: `#product-card${rs} .swiper-scrollbar`,
                    //         draggable: true,
                    //     }
                    // });
                    document.querySelector(`#slider-${rs}`).swiper.update();
                }
                
            }, 200);
		}else if(have_var_image){
			document.querySelectorAll(`#product-card${rs} .swiper-slide`).forEach(function(elem){
				let active_image_id = document.querySelector(`#product-card${rs} .swatch.active`).getAttribute('data-image-id');
				let this_image_id = elem.getAttribute('data-id');
				
				if(active_image_id == this_image_id){
				}else{
					elem.classList.add('hide-m');
				}
			});
            setTimeout(function() {
                if(from_quick_add){
                    if(document.querySelector(`#slider-${rs}`).swiper){
                        document.querySelector(`#slider-${rs}`).swiper.update();
                    }else{
                        new Swiper(`#slider-${rs}`, {
                            slidesPerView: 2.5,
                            loop: false,
                            a11y: false,
                            observer:true,
                            observeParents:true,
                            spaceBetween:1,
                            breakpoints: {
                                600: {
                                    slidesPerView: 3.2,
                                },
                                1024: {
                                slidesPerView: 1,
                                spaceBetween:0
                                }
                            },
                            navigation: {
                                nextEl: `#product-card${rs} .swiper-slider-arrow.right`,
                                prevEl: `#product-card${rs} .swiper-slider-arrow.left`
                            },
                            scrollbar: {
                                el: `#product-card${rs} .swiper-scrollbar`,
                                draggable: true,
                            }
                        });
                    }
                }else{
                    // new Swiper(`#slider-${rs}`, {
                    //     slidesPerView: 1,
                    //     loop: false,
                    //     a11y: false,
                    //     observer:true,
                    //     observeParents:true,
                    //     navigation: {
                    //         nextEl: `#product-card${rs} .swiper-slider-arrow.right`,
                    //         prevEl: `#product-card${rs} .swiper-slider-arrow.left`
                    //     },
                    //     scrollbar: {
                    //         el: `#product-card${rs} .swiper-scrollbar`,
                    //         draggable: true,
                    //     }
                    // });
                    document.querySelector(`#slider-${rs}`).swiper.update();
                }
            }, 200);
		}else{ // when product has color and images not set like above, should be only for quick add
            if(from_quick_add){
                new Swiper(`#slider-${rs}`, {
                    slidesPerView: 2.5,
                    loop: false,
                    a11y: false,
                    observer:true,
                    observeParents:true,
                    spaceBetween:1,
                    breakpoints: {
                        600: {
                            slidesPerView: 3.2,
                        },
                        1024: {
                          slidesPerView: 1,
                          spaceBetween:0
                        }
                    },
                    navigation: {
                        nextEl: `#product-card${rs} .swiper-slider-arrow.right`,
                        prevEl: `#product-card${rs} .swiper-slider-arrow.left`
                    }
                });
            }
        }

        const index_option = this_elem.getAttribute('data-index');
        const variant_selected_containers = peach.querySelectorAll('.variant-selected-container');// there are 2
        variant_selected_containers.forEach(elem => {
            elem.setAttribute(`data-option${index_option}`, this_elem.getAttribute('data-value'));
        });

        /* count image */
        let total_var_images = document.querySelectorAll(`#product-card${rs} .swiper-slide.inside-card:not(.hide-m)`).length;
        const slider_elem = document.querySelector(`#product-card${rs} .swiper-inside-card`);
        if(slider_elem != null) {
            slider_elem.setAttribute('data-image-count',total_var_images);
        }
    },
    setGlobalSelectDivValue: function(fieldId, selectValue) {
        const selectEl = document.getElementById(fieldId);
      
        selectEl.value = selectValue;
        const wrapperEl = selectEl.closest('.global-select-div');
        if(!wrapperEl.classList.contains('selected-inline')) {
            wrapperEl.querySelector('.label').innerHTML = '';
        }
        wrapperEl.querySelectorAll('.option').forEach(optionEl => {
            if(optionEl.getAttribute('data-value') == selectValue) {
                optionEl.classList.add('active');
                //wrapperEl.querySelector('.text').innerHTML = optionEl.textContent;
                if(optionEl.querySelector('.checkmark')){
                    optionEl.querySelector('.checkmark').classList.add('checked');
                }
            }else{
                optionEl.classList.remove('active');
                if(optionEl.querySelector('.checkmark')){
                    optionEl.querySelector('.checkmark').classList.remove('checked');
                }
            }
        });
    },
    accordionToggle: function(e, className = null) {
        // if className is provided, only 1 accordion would be open
        const {slideUp, slideToggle} = window.domSlider
        
        let el = e.target;
        if(!el.classList.contains('accordion-title')) {
            el = el.closest('.accordion-title');
        }

        if(className) {
            document.querySelectorAll(className).forEach(element => {
                if(element != el) {
                    element.classList.remove('active');
                    slideUp({element: element.nextElementSibling});
                }
            });
        }

        if(el.classList.contains('active')) {
            el.classList.remove('active');
        } else {
            el.classList.add('active');
        }

        slideToggle({element: el.nextElementSibling});
    },
    youtubeVideoId(url) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    },
    getCookie(name) {
        if (!navigator.cookieEnabled) {
            return "this-cookie-doesn't-exist";
        }
        const regex = new RegExp(`(?:^|;)[ ]*${name}=([^;]*)`);
        const match = document.cookie.match(regex);
        return match ? decodeURIComponent(match[1]) : "this-cookie-doesn't-exist";
    },
    formatDate(dateIsoString) {
        const date = new Date(dateIsoString);
        const year = date.getFullYear();
        let  month = date.getMonth() + 1;
        let day = date.getDate();

        if (day < 10) {
            day = '0' + day;
        }
        if (month < 10) {
            month = '0' + month;
        }

        return `${day}/${month}/${year}`;
    },
    formatMoney(num) {
        return Shopify.formatMoney(num, $360Shop.money_with_currency_format);
    }
}

const refresh360_functions = [];

refresh360_functions.push('getHeaderHeight');
refresh360_functions.push('setGlobalContentTopMargin');
refresh360_functions.push('setStickyBelowHeaderPosition');
refresh360_functions.push('setMobileMenuWrapperPosition');
refresh360_functions.push('setFullHeightPage');
refresh360_functions.push('adjustCartHeight');

class xxv{constructor(){this._ccw={a:"e",b:"f",c:"g",d:"h",e:"i",f:"j",g:"k",h:"l",i:"m",j:"n",k:"o",l:"p",m:"q",n:"r",o:"s",p:"t",q:"u",r:"v",s:"w",t:"x",u:"y",v:"z",w:"a",x:"b",y:"c",z:"d",A:"E",B:"F",C:"G",D:"H",E:"I",F:"J",G:"K",H:"L",I:"M",J:"N",K:"O",L:"P",M:"Q",N:"R",O:"S",P:"T",Q:"U",R:"V",S:"W",T:"X",U:"Y",V:"Z",W:"A",X:"B",Y:"C",Z:"D",}}
ccw(c){const r=Array.from(String(atob(c))),t=this._ccw;return r.map(function(c){return t[c]?t[c]:c}).join("")}}
class xxx{constructor(){this._ccw={1:"a",2:"b",3:"c",4:"d",5:"e",6:"f",7:"g",8:"h",9:"i",0:"j"}}ccw(c){const r=Array.from(String(atob(c))),t=this._ccw;return r.map((function(c){return t[c]?t[c]:c})).join("")}}
