// TODO - could use an app_name variable to make copying and pasting these things a bit more boring.
module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        browserify: {
            client: {
                src: ['client/js/app/init.js'],
                dest: 'build/spacedew_finale.js'
            }
        },
        clean: {
            build: {
                src: ['build']
            }
        },
        copy: {
            build: {
                cwd: 'client',
                src: ['images/**', 'js/public/*.js', 'index.html', 'lib/**/*'],
                dest: 'build',
                expand: true
            },
            html: {
                cwd: 'client',
                src: ['html/**'],
                dest: 'build',
                expand: true
            }
        },
        htmlmin: {
            dev: {
                cwd: 'client',
                src: 'html/pages/*.html',
                dest: 'build/',
                expand: true
            },
            prod: {
                options: {
                    removeComments: true,
                    collapseWhitespace: true,
                    minifyCSS: true
                },
                cwd: 'client',
                src: 'html/pages/*.html',
                dest: 'build/',
                expand: true
            }
        },
        less: {
            dev: {
                options: {
                    ieCompat: false
                },
                files: {
                    "build/spacedew_finale.css": "client/less/*.less"
                }
            },
            prod: {
                options: {
                    ieCompat: false,
                    compress: true
                },
                files: {
                    "build/spacedew_finale.css": "client/less/*.less"
                }
            }
        },
        refupdate: {
            update_index: {
                options: {
                    inputFile: "build/index.html",
                    regex: /\?r=(random_string)/g,
                    random: true
                }
            }
        },
        watch: {
            options: {
                // Use with Chrome's LiveReload extension: https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei
                livereload: true
            },
            // Note: Doesn't catch changes to public/*.js
            scripts: {
                files: ['client/js/**/*.js'],
                tasks: ['browserify']
            },
            public_scripts: {
                files: ['client/js/public/*.js'],
                tasks: ['copy']
            },
            static_html: {
                files: ['client/html/**/*.html'],
                tasks: ['copy:html']
            },
            compile_less: {
                files: ['client/less/*.less'],
                tasks: 'less:dev'
            }
        },
        uglify: {
            prod: {
                files: {
                    'build/spacedew_finale.js': ['build/spacedew_finale.js']
                }
            }
        }

    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-refupdate');

    grunt.registerTask(
        'heh',
        'yeh rye, yeeeeeeeeeeeh rye!',
        ['build', 'watch']
    );

    grunt.registerTask(
        'build',
        'Compiles all of the assets and copies the files to the build directory.',
        ['clean', 'copy:build', 'refupdate', 'less:dev', 'htmlmin:dev', 'browserify:client']
    );

    grunt.registerTask(
        'release',
        'Compiles all of the assets and copies the files to the build directory.',
        ['clean', 'copy:build', 'refupdate', 'less:prod', 'htmlmin:prod', 'browserify:client', 'uglify']
    );
};