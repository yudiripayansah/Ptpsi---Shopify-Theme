window.addEventListener('resize', function (e) {
    for (i = 0; i < refresh360_functions.length; i++) {
        $360[refresh360_functions[i]]();
    }
});