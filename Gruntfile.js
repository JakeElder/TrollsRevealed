/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({

    // Metadata.
    pkg: grunt.file.readJSON('package.json'),

    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
      ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',

    buildStylesheets: (function () {
      var stylesheets = [];
      var json = grunt.file.readJSON('src/content/data/stylesheets.json')
      json.vendor.forEach(function (stylesheet) {
        stylesheets.push('vendor/assets/css/' + stylesheet + '.css')
      });
      json.app.forEach(function (stylesheet) {
        stylesheets.push('.tmp/css/' + stylesheet + '.css')
      });
      return stylesheets;
    }()),

    buildJavascripts: (function () {
      var javascripts = [];
      var json = grunt.file.readJSON('src/content/data/javascripts.json')
      json.vendor.forEach(function (javascript) {
        javascripts.push('vendor/assets/js/' + javascript + '.js')
      });
      json.app.forEach(function (javascript) {
        javascripts.push('.tmp/js/' + javascript + '.js')
      });
      return javascripts;
    }()),

    // Task configuration.
    concat: {
      options: {
        banner: '<%= banner %>',
        stripBanners: true
      },
      javascript: {
        src: 'lib/<%= pkg.name %>.js',
        dest: 'dist/<%= pkg.name %>.js'
      }
    },

    watch: {
      coffee: {
        files: '<%= coffee.dev.src %>',
        tasks: 'coffee:dev'
      },
      sass: {
        files: '<%= sass.dev.src %>',
        tasks: 'sass:dev'
      },
      content: {
        files: 'src/content/**/*.{hbs,json}',
        tasks: 'assemble:dev'
      },
      dev: {
        files: '.tmp/**/*.{html,css,js}',
        options: {
          livereload: true
        }
      }
    },

    assemble: {
      options: {
        partials: 'src/content/partials/**/*.hbs',
        layout: 'src/content/layouts/default.hbs',
        data: [
          'package.json',
          'src/content/data/**/*.json'
        ]
      },
      dev: {
        expand: true,
        cwd: 'src/content/documents',
        src: '**/*.hbs',
        dest: '.tmp'
      },
      production: {
        options: {
          production: true
        },
        expand: true,
        cwd: 'src/content/documents',
        src: '**/*.hbs',
        dest: '../build'
      }
    },

    sass: {
      dev: {
        options: {
          sourcemap: true
        },
        expand: true,
        cwd: '.tmp/assets/scss',
        src: '**/*.scss',
        dest: '.tmp/assets/css',
        ext: '.css'
      },
      production: {
        expand: true,
        cwd: 'src/scss',
        src: '**/*.scss',
        dest: '.tmp/css',
        ext: '.css'
      }
    },

    clean: {
      dev: '.tmp',
      ender: 'vendor/js/ender'
    },

    ender: {
      options: {
        output: 'vendor/js/ender/ender',
        dependencies: 'jeesh'
      }
    },

    coffee: {
      dev: {
        options: {
          sourceMap: true
        },
        expand: true,
        cwd: '.tmp/assets/coffee',
        src: '**/*.coffee',
        dest: '.tmp/assets/js',
        ext: '.js'
      },
      production: {
        files: {
          '.tmp/behaviour.js': 'src/coffee/**/*.coffee'
        }
      }
    },

    express: {
      dev: {
        options: {
          port: 9000,
          hostname: '*',
          bases: '.tmp',
          livereload: true
        }
      }
    },

    symlink: {
      scss: {
        dest: '.tmp/assets/scss',
        src: 'src/scss'
      },
      coffee: {
        dest: '.tmp/assets/coffee',
        src: 'src/coffee'
      },
      vendor_css: {
        dest: '.tmp/assets/css/vendor',
        src: 'vendor/assets/css'
      },
      vendor_js: {
        dest: '.tmp/assets/js/vendor',
        src: 'vendor/assets/js'
      }
    },

    copy: {
      vendor_js: {
        expand: true,
        cwd: 'vendor/assets/js',
        src: '**/*.js',
        dest: '.tmp/assets/js/vendor'
      }
    },

    cssmin: {
      production: {
        files: {
          '../build/style.css': '<%= buildStylesheets %>'
        }
      }
    },

    uglify: {
      production: {
        files: {
          '../build/behaviour.js': '<%= buildStylesheets %>'
        }
      }
    },

  });

  // Load dependencies.
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
  grunt.loadNpmTasks('assemble');

  // Tasks.
  grunt.registerTask('default', 'server');

  grunt.registerTask('server', [
    'clean:dev',
    'assemble:dev',
    'symlink',
    'sass:dev',
    'coffee:dev',
    'express',
    'watch',
    'clean:dev'
  ]);

  grunt.registerTask('build', [
    'assemble:production',
    'sass:production',
    'coffee:production',
    'cssmin',
    'uglify'
  ]);
};
