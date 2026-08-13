// header cart
async function giftProductToggle(varId,e) {
  e.preventDefault();

  let checkbox = e.target
  let parent = checkbox.closest('.hcb-gifting')
  let msg = parent.querySelector('#gift-msg')
  let args = {
    variantId: varId,
    qty: 1,
    properties: {
      'Gift Message': msg.value,
      "_isGiftWrap": true
    }
  }

  const btnLoading = '<span class="btn-loading"></span>';
  checkbox.style.height = `${checkbox.offsetHeight}px`;
  checkbox.style.width = `${checkbox.offsetWidth}px`;
  checkbox.innerHTML = btnLoading;
  
  $360.addToCart(args, function() { $360.refreshCartPage();});
}
let giftTitle = document.querySelector('.hcb-gifting .accordion-title');
if(giftTitle != null) {
  giftTitle.addEventListener('click', function(){
    $360.adjustCartHeight()
  })
}
function changePageCartDrawer(e) {
  changeCloseButton()
  let el = e.target
  if(!el.classList.contains('cp-btn')){
    el = el.closest('.cp-btn');
  }
  let target = el.getAttribute('data-target')
  if(target){
    let hcmPage = document.querySelectorAll('.hcm-page')
    let targetPage = document.querySelector('.hcm-page.'+target)
    let checkoutBtn = document.querySelector('#header-cart .checkout-btn')
    let nextBtn = document.querySelector('#header-cart .next-btn')
    let backBtn = document.querySelector('.header-cart-top .back-btn')
    let backIcon = backBtn.querySelector('.icon-back')
    hcmPage.forEach((i) => {
      i.classList.remove('active')
    })
    targetPage.classList.add('active')
    if(target == 'zapiet-portion'){
      checkoutBtn.classList.add('show')
      nextBtn.classList.remove('show')
      backIcon.classList.remove('hide-m')
      backBtn.setAttribute('data-target','cart-portion')
    } else {
      checkoutBtn.classList.remove('show')
      nextBtn.classList.add('show')
      backIcon.classList.add('hide-m')
      backBtn.setAttribute('data-target',false)
    }
  }
}
function changeCloseButton() {
  let closes = document.querySelectorAll('.Zapiet-Modal__Close-Button')
  closes.forEach((i) => {
    i.innerHTML = ''
  })
}
let zapietOpt = document.querySelectorAll('#storePickupApp .checkoutMethodsContainer.default .checkoutMethod')
zapietOpt.forEach((i) => {
  i.addEventListener('click',changeCloseButton)
})
changeCloseButton()