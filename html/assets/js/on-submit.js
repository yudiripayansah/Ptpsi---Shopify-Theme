document.addEventListener('submit', function(e) {
    if(e.target.classList.contains('global-quick-add')) {
        e.preventDefault();
        const form = e.target;
        const qty = parseInt(form.querySelector('.global-qty-text').value);
        const variantId = form.querySelector('.variant-id').value;
        const button = form.querySelector('.add-to-cart');
        $360.addToCart({qty: qty, variantId: variantId, button: button});
    }
});