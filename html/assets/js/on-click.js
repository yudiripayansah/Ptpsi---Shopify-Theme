document.addEventListener('click', function(e) {
    const el = e.target;

    /** Global Select Div */
    if(el.classList.contains('global-select-div') || el.closest('.global-select-div')) {
        const selectDivEl = el.classList.contains('global-select-div') ? el : el.closest('.global-select-div');

        document.querySelectorAll('.global-select-div.active').forEach(function(gsd) {
            if(gsd != selectDivEl) {
                gsd.classList.remove('active');
            }
        });

        if(selectDivEl.classList.contains('active')) {
            selectDivEl.classList.remove('active');
        } else {
            selectDivEl.classList.add('active');
        }
    } else {
        document.querySelectorAll('.global-select-div.active').forEach(function(gsd) {
            gsd.classList.remove('active');
        });
    }

    if(el.classList.contains('option') && el.closest('.global-select-div')) {
        const optionEl = el;
        const select = optionEl.closest('.options').nextElementSibling;
        select.value = optionEl.getAttribute('data-value');
        select.dispatchEvent(new Event('change'));
        if(select.closest('.global-select-div').querySelector('.inner .text')){
            select.closest('.global-select-div').querySelector('.inner .text').textContent = optionEl.textContent;
        }

        const options = optionEl.closest('.options');
        const activeOption = options.querySelector('.active');
        if(activeOption != null) {
          activeOption.classList.remove('active');
        }

        optionEl.classList.add('active');
    }
    /** End Global Select Div */

    /** on click .global-minus */
    if(el.classList.contains('global-minus') || el.closest('.global-minus')) {
        const globalMinBtn = el.classList.contains('global-minus') ? el : el.closest('.global-minus');
        const numInput = globalMinBtn.nextElementSibling;
        const currentNum = numInput.value;
        const minNum = numInput.getAttribute('min');
        if (minNum) {
            if (currentNum == minNum) return;
        }

        numInput.value = currentNum - 1;
        numInput.dispatchEvent(new Event('input')); 
    }
    /** End on click .global-minus */

    /** on click .global-plus */
    if(el.classList.contains('global-plus') || el.closest('.global-plus')) {
        const globalMinBtn = el.classList.contains('global-plus') ? el : el.closest('.global-plus');
        const numInput = globalMinBtn.previousElementSibling;
        const currentNum = parseInt(numInput.value);
        const maxNum = numInput.getAttribute('max');
        if (maxNum) {
            if (currentNum == maxNum) return;
        }

        numInput.value = currentNum + 1;
        numInput.dispatchEvent(new Event('input'));
    }
    /** End on click .global-plus */

    /** on click .checkout-btn */
    if(el.classList.contains('checkout-btn') || el.closest('.checkout-btn')) {
        const checkoutBtn = el.classList.contains('checkout-btn') ? el : el.closest('.checkout-btn');
        
        let prevText = checkoutBtn.innerHTML;
        const btnLoading = '<span class="btn-loading"></span>';
        checkoutBtn.style.height = `${checkoutBtn.offsetHeight}px`;
        checkoutBtn.style.width = `${checkoutBtn.offsetWidth}px`;
        checkoutBtn.innerHTML = btnLoading;
        checkoutBtn.setAttribute('disabled', true);

        const delay_animate = setTimeout(() => {
            checkoutBtn.classList.add('is-loading');

            clearTimeout(delay_animate);
        }, 300);
        
    }
    /** End on click .checkout-btn */

    /** on click .btn-checkout */
    if(el.classList.contains('btn-checkout') || el.closest('.btn-checkout')) {
        const checkoutBtn = el.classList.contains('btn-checkout') ? el : el.closest('.btn-checkout');
        
        let prevText = checkoutBtn.innerHTML;
        const btnLoading = '<span class="btn-loading"></span>';
        checkoutBtn.style.height = `${checkoutBtn.offsetHeight}px`;
        checkoutBtn.style.width = `${checkoutBtn.offsetWidth}px`;
        checkoutBtn.innerHTML = btnLoading;
        checkoutBtn.setAttribute('disabled', true);

        const delay_animate = setTimeout(() => {
            checkoutBtn.classList.add('is-loading');

            clearTimeout(delay_animate);
        }, 300);
        window.location.href = '/checkout'
    }
    /** End on click .btn-checkout */

    /** page overlay */
    if(el.classList.contains('page-overlay') && el.classList.contains('show-mobile') && el.classList.contains('show-fade')) {
        const close_button = document.querySelector('.mobile-menu-wrapper .close-button');
        if(close_button != null) {
            close_button.click();
        }
    }
    /** end page overlay */

    /** wishlist button */
    if(el.closest('.swym-button')) {
        e.preventDefault();
        const elem = el.closest('.swym-button');
        const product_data = {
            et: 4,  
            epi: Number(elem.getAttribute('data-variant-id')),
			du: elem.getAttribute('data-product-url'),
			empi: Number(elem.getAttribute('data-product-id')) 
        }

        //if(!$360Shop.is_login) {
        //    toggleLoginRegisterPopup();
        //} else {
            if(!elem.classList.contains('swym-added')) {
                _swat.addToWishList(product_data, function(e){
                    elem.classList.add('swym-added');
                });
            } else {
                _swat.removeFromWishList(product_data, function(e){
                    elem.classList.remove('swym-added');
                });
            }
        //}
    }
    /** end wishlist button */
});
