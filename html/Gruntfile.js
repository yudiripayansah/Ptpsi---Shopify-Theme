module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-purgecss');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    // Yeoman configuration
    var yeomanConfig = {
        src: 'src',
        dist: 'dist'
    }

    // Grunt configuration
    grunt.initConfig({
        yeoman: yeomanConfig,

        pkg: grunt.file.readJSON('package.json'),

        imageoptim: {
            png: {
                options: {
                    jpegMini: false,
                    imageAlpha: true,
                    quitAfter: true
                },

                src: ['assets/img/**/*.png']
            },

            jpg: {
                options: {
                    jpegMini: true,
                    imageAlpha: false,
                    quitAfter: true
                },

                src: ['assets/img/**/*.{jpg,JPG,jpeg,JPEG}']
            }
        },

        sass: {
            dist: {
                options: {
                    style: 'expanded'
                },
                files: {
                    'assets/css/account.css': 'assets/sass/account.scss',
                    'assets/css/blog.css': 'assets/sass/blog.scss',
                    'assets/css/cart.css': 'assets/sass/cart.scss',
                    'assets/css/collection.css': 'assets/sass/collection.scss',
                    'assets/css/footer.css': 'assets/sass/footer.scss',
                    'assets/css/index.css': 'assets/sass/index.scss',
                    'assets/css/style.css': 'assets/sass/main.scss',
                    'assets/css/page.css': 'assets/sass/page.scss',
                    'assets/css/password.css': 'assets/sass/password.scss',
                    'assets/css/product.css': 'assets/sass/product.scss',
                    'assets/css/search.css': 'assets/sass/search.scss',
                }
            }
        },

        autoprefixer: {
            options: {
                browsers: ['last 2 version', 'ie 9', 'ie 8']
            },

            multiple_files: {
                expand: true,
                flatten: true,
                src: 'assets/css/style.css',
                dest: 'assets/css'
            }
        },

        pixrem: {
            account: {
                src: 'assets/css/account.css',
                dest: 'assets/css/account.css'
            },
            blog: {
                src: 'assets/css/blog.css',
                dest: 'assets/css/blog.css'
            },
            cart: {
                src: 'assets/css/cart.css',
                dest: 'assets/css/cart.css'
            },
            collection: {
                src: 'assets/css/collection.css',
                dest: 'assets/css/collection.css'
            },
            footer: {
                src: 'assets/css/footer.css',
                dest: 'assets/css/footer.css'
            },
            index: {
                src: 'assets/css/index.css',
                dest: 'assets/css/index.css'
            },
            main: {
                src: 'assets/css/style.css',
                dest: 'assets/css/style.css'
            },
            page: {
                src: 'assets/css/page.css',
                dest: 'assets/css/page.css'
            },
            password: {
                src: 'assets/css/password.css',
                dest: 'assets/css/password.css'
            },
            product: {
                src: 'assets/css/product.css',
                dest: 'assets/css/product.css'
            },
            search: {
                src: 'assets/css/search.css',
                dest: 'assets/css/search.css'
            }
        },

        cssmin: {
            account: {
                expand: true,
                cwd: 'assets/css',
                src: ['account.css'],
                dest: '../assets',
                ext: '.css'
            },
            blog: {
                expand: true,
                cwd: 'assets/css',
                src: ['blog.css'],
                dest: '../assets',
                ext: '.css'
            },
            cart: {
                expand: true,
                cwd: 'assets/css',
                src: ['cart.css'],
                dest: '../assets',
                ext: '.css'
            },
            collection: {
                expand: true,
                cwd: 'assets/css',
                src: ['collection.css'],
                dest: '../assets',
                ext: '.css'
            },
            footer: {
                expand: true,
                cwd: 'assets/css',
                src: ['footer.css'],
                dest: '../assets',
                ext: '.css'
            },
            index: {
                expand: true,
                cwd: 'assets/css',
                src: ['index.css'],
                dest: '../assets',
                ext: '.css'
            },
            main: {
                expand: true,
                cwd: 'assets/css',
                src: ['style.css'],
                dest: '../assets',
                ext: '.css'
            },
            page: {
                expand: true,
                cwd: 'assets/css',
                src: ['page.css'],
                dest: '../assets',
                ext: '.css'
            },
            password: {
                expand: true,
                cwd: 'assets/css',
                src: ['password.css'],
                dest: '../assets',
                ext: '.css'
            },
            product: {
                expand: true,
                cwd: 'assets/css',
                src: ['product.css'],
                dest: '../assets',
                ext: '.css'
            },
            search: {
                expand: true,
                cwd: 'assets/css',
                src: ['search.css'],
                dest: '../assets',
                ext: '.css'
            }
        },

        purgecss: {
            my_target: {
                options: {
                    content: [
                        '../assets/vendor.js',
                        '../**/*.liquid'
                    ]
                },
                files: {
                    '../assets/style.css': ['../assets/style.css']
                }
            }
        },

        // jshint: {
        //     options: {
        //         force: true
        //     },

        //     beforeconcat: ['assets/js/*.js']
        // },

        concat: {
            dist: {
                src: [
                    './assets/js/vue.global.js',
                    './node_modules/vanilla-lazyload/dist/lazyload.min.js',
                    './node_modules/swiper/swiper-bundle.min.js',
                    './node_modules/axios/dist/axios.min.js',
                    './node_modules/waypoints/lib/noframework.waypoints.min.js',
                    './node_modules/dom-slider/dist/dom-slider.js',
                    './node_modules/lodash/lodash.js',
                    './node_modules/animate-css-grid/dist/main.js',
                    './node_modules/smarquee/smarquee.js',
                    './assets/js/format-money.js',
                    './assets/js/plugin.js',
                    './assets/js/360&5.js',
                    './assets/js/on-click.js',
                    './assets/js/on-loaded.js',
                    './assets/js/on-resize.js',
                    './assets/js/on-submit.js',
                    //'./assets/js/header.js',
                    //'./assets/js/footer.js',
                    './assets/js/nouislider.min.js',
                    './assets/js/splitting.min.js',
                    './assets/js/ScrollTrigger.min.js',
                    './assets/js/SplitText.min.js'
                ],
                dest: './assets/tmp/js/vendor.js'
            },
        },

        uglify: {
            options: {
                mangle: true
            },
            my_target: {
                files: {
                    '../assets/vendor.min.js': ['./assets/tmp/js/vendor.js']
                }
            }
        },

        watch: {
            options: {
                livereload: true
            },

            sass: {
                files: ['assets/sass/**/*.scss'],
                tasks: ['sass', 'autoprefixer', 'pixrem', 'cssmin']
            },

            scripts: {
                files: ['assets/js/**/*.js'],
                tasks: ['concat', 'uglify'],
                options: {
                    livereload: true
                }
            }
        },
    });

    // Load grunt tasks matching 'grunt-*'
    require('load-grunt-tasks')(grunt);

    // 4. Where we tell Grunt what to do when we type "grunt" into the terminal.
    grunt.registerTask('default', ['watch']);

    grunt.registerTask('build', [
        'sass', 
        'autoprefixer', 
        'pixrem', 
        'cssmin', 
        'purgecss', 
        'concat', 
        'uglify'
    ]);
};
