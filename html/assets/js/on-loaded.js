document.addEventListener('DOMContentLoaded', function(e) {
    $360.lazyLoadInstance.update();

    if(document.querySelector('.fade')) {
        document.querySelectorAll('.fade').forEach(function(el) {
            new Waypoint({
                element: el,
                handler: function(direction) {
                    this.element.classList.add('animated')
                },
                offset: '75%',
            });
        });
    }

    if(document.querySelector('.prev-sticky-hide-header')) {
        setTimeout(function() {
            new Waypoint({
                element: document.querySelector('.prev-sticky-hide-header'),
                handler: function(direction) {
                    if(direction == 'down') {
                        document.getElementById('site-header').classList.add('hide-to-top');
                    } else {
                        document.getElementById('site-header').classList.remove('hide-to-top');
                    }
                },
                offset: $360.headerHeight,
            });
        }, 500);
    }

    for (i = 0; i < refresh360_functions.length; i++) {
        $360[refresh360_functions[i]]();
    }
});