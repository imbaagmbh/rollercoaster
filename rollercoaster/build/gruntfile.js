module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        less: {
            main_style: {
                src:"<%= pkg.src_folder %>/css/style.less",
                dest:"../css/style.css"
            }
        },

        concat: {
            options: {
                stripBanners: true,
                separator: ''
            },
            css: {
                src: ['<%= pkg.src_folder %>/css/main.less','<%= pkg.src_folder %>/css/main_navigation.less','<%= pkg.src_folder %>/css/top_quote.less','<%= pkg.src_folder %>/css/startpage.less','<%= pkg.src_folder %>/css/startpage_who-we-are.less','<%= pkg.src_folder %>/css/stepper.less'],
                dest: '<%= pkg.build_folder %>/css/master.less'
            }
        },
        cssmin: {
            main_css: {
                src : '<%= less.main_style.dest %>',
                dest: '<%= pkg.target_folder %>/css/style.min.css'
            }
        },
        uglify: {
            rollercoaster_js: {
                src : '<%= pkg.src_folder %>/js/rollercoaster.js',
                dest: '<%= pkg.target_folder %>/js/rollercoaster.min.js'
            }
        },
        copy: {
            rollercoaster_js: {
                src : '<%= pkg.src_folder %>/js/rollercoaster.js',
                dest: '<%= pkg.target_folder %>/js/rollercoaster.js'
            }
        },

    });

    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');


    grunt.registerTask('default', ['less','cssmin','uglify','copy']);

};