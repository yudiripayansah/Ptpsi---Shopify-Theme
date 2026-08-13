var Shopify = {};

Shopify.Products = (function() {
  var config = { 
    howManyToShow: 10,
    howManyToStoreInMemory: 10, 
    wrapperId: 'recently-viewed-products', 
    templateId: 'recently-viewed-product-template',
    onComplete: null,
    viewTemplate: "grid",
    loadOn: "pdp",
    shown: 0
  };

  var productHandleQueue = [];
  var wrapper = null;
  var template = null;
  var shown = 0;

  var cookie = {
    configuration: {
      expires: 90,
      path: '/',
      domain: window.location.hostname
    },
    name: 'shopify_recently_viewed',
    write: function(recentlyViewed) {
      document.cookie = this.name + '=' + recentlyViewed.join(' ') + '; expires=' + (new Date(Date.now() + this.configuration.expires * 24 * 60 * 60 * 1000).toUTCString()) + '; path=' + this.configuration.path + '; domain=' + this.configuration.domain;
    },
    read: function() {
      var cookies = document.cookie.split(';').map(function(cookie) {
        return cookie.trim().split('=');
      });
      var cookieValue = cookies.find(function(c) {
        return c[0] == cookie.name;
      });
      return cookieValue ? cookieValue[1].split(' ') : [];
    },
    destroy: function() {
      document.cookie = this.name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=' + this.configuration.path + '; domain=' + this.configuration.domain;
    },
    remove: function(productHandle) {
      var recentlyViewed = this.read();
      var position = recentlyViewed.indexOf(productHandle);
      if (position !== -1) {
        recentlyViewed.splice(position, 1);
        this.write(recentlyViewed);
      }       
    }
  };

  var finalize = function() {
    if (config.shown > 0) {
      if(document.querySelector('.product-recently-viewed') != null) {
        document.querySelector('.product-recently-viewed').classList.remove('hide-m');
      }
    } else {
      if(document.querySelector('.product-recently-viewed') != null) {
        document.querySelector('.product-recently-viewed').classList.add('hide-m');
      }
    }
    let csWrap = document.querySelector('.header-cart-wrapper .cross-sell-wrapper')
    let rcvItemsBox = document.querySelector('.header-cart-wrapper .recently-viewed-content')
    let csItemsBox = document.querySelector('.header-cart-wrapper .cross-sell-content')
    if(csWrap && rcvItemsBox){
      let rcvItems = rcvItemsBox.querySelectorAll('.grid-each')
      let rcvBtn = document.querySelector('.header-cart-wrapper .rcv-btn')
      let csBtn = document.querySelector('.header-cart-wrapper .cs-btn')
      if(rcvItems.length < 1){
        rcvItemsBox.classList.add('hide-m')
        rcvBtn.classList.add('hide-m')
        csBtn.classList.add('active')
        csBtn.classList.remove('opacity-4')
        csItemsBox.classList.remove('hide-m')
        csItemsBox.classList.add('active')
      } else {
        rcvItemsBox.classList.remove('hide-m')
        rcvBtn.classList.remove('hide-m')
        csBtn.classList.remove('active')
        csBtn.classList.add('opacity-4')
        csItemsBox.classList.add('hide-m')
        csItemsBox.classList.remove('active')
      }
    }
    let clcsWrap = document.querySelector('.cart-left .cross-sell-wrapper')
    let clrcvItemsBox = document.querySelector('.cart-left .recently-viewed-content')
    let clcsItemsBox = document.querySelector('.cart-left .cross-sell-content')
    if(clcsWrap && clrcvItemsBox){
      let clrcvItems = clrcvItemsBox.querySelectorAll('.grid-each')
      let clrcvBtn = document.querySelector('.cart-left .rcv-btn')
      let clcsBtn = document.querySelector('.cart-left .cs-btn')
      if(clrcvItems.length < 1){
        clrcvItemsBox.classList.add('hide-m')
        clrcvBtn.classList.add('hide-m')
        clcsBtn.classList.add('active')
        clcsBtn.classList.remove('opacity-4')
        clcsItemsBox.classList.remove('hide-m')
        clcsItemsBox.classList.add('active')
      } else {
        clrcvItemsBox.classList.remove('hide-m')
        clrcvBtn.classList.remove('hide-m')
        clcsBtn.classList.remove('active')
        clcsBtn.classList.add('opacity-4')
        clcsItemsBox.classList.add('hide-m')
        clcsItemsBox.classList.remove('active')
      }
    }
    // If we have a callback.
    if (config.onComplete) {
      try { config.onComplete() } catch (error) { }
    }  
  };

  var moveAlong = function() {
    
    if (productHandleQueue.length && config.shown < config.howManyToShow) {
      fetch(`/products/${productHandleQueue[0]}?view=${config.viewTemplate}`)
      .then(function(response) {
        // Check if the request was successful
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.text();
      })
      .then(function(data) {
        wrapper.insertAdjacentHTML('beforeend', data);
        productHandleQueue.shift();

        if(data.trim() != '') {
          config.shown++;
        }

        moveAlong();
      })
      .catch(function(error) {
        console.error('Fetch error:', error);
      });
      var xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          if (xhr.status === 200) {
          } else {
            console.error('Request failed:', xhr.status);
          }
        }
      };
    } else {
      finalize();
    }
  };

  return {
    resizeImage: function(src, size) {
      if (size == null) {
        return src;
      }
      if (size == 'master') {
        return src.replace(/http(s)?:/, "");
      }
      var match = src.match(/\.(jpg|jpeg|gif|png|bmp|bitmap|tiff|tif)(\?v=\d+)?/i);
      if (match != null) {
        var parts = src.split(match[0]);
        return (parts[0] + "_" + size + match[0]).replace(/http(s)?:/, "");
      } else {
        return null;
      }
    },

    showRecentlyViewed: function(params) {
      params = params || {};

      // Update defaults.
      Object.assign(config, params);

      // Read cookie.
      productHandleQueue = cookie.read();

      // Template and element where to insert.
      template = document.getElementById(config.templateId);
      wrapper = document.getElementById(config.wrapperId);

      // How many products to show.
      config.howManyToShow = Math.min(productHandleQueue.length, config.howManyToShow);

      // If we have any to show.
      if (config.howManyToShow && wrapper) {
        // Getting each product with an Ajax call and rendering it on the page.
        moveAlong();    
      } else {
        if (config.onComplete) {
          try { config.onComplete() } catch (error) { }
        }  
      }
    },

    getConfig: function() {
      return config;
    },

    clearList: function() {
      cookie.destroy();      
    },
    
    recordRecentlyViewed: function(params) {
      params = params || {};

      // Update defaults.
      Object.assign(config, params);

      // Read cookie.
      var recentlyViewed = cookie.read();
      // If we are on a product page.
      if (window.location.pathname.includes('/products/')) {
        // What is the product handle on this page.
        var productHandle = window.location.pathname.match(/\/products\/([a-z0-9\-]+)/)[1];
        // In what position is that product in memory.
        var position = recentlyViewed.indexOf(productHandle);
        // If not in memory.
        if (position === -1) {
          // Add product at the start of the list.
          recentlyViewed.unshift(productHandle);
          // Only keep what we need.
          recentlyViewed = recentlyViewed.splice(0, config.howManyToStoreInMemory);
        } else {
          // Remove the product and place it at start of list.
          recentlyViewed.splice(position, 1);
          recentlyViewed.unshift(productHandle);              
        }
        // Update cookie.
        cookie.write(recentlyViewed);
      }
    }
  };
})();