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
        stylesheets.push('bower_components/' + stylesheet + '.css')
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
        javascripts.push('bower_components/' + javascript + '.js')
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
        dest: '.tmp',
        options: {
          assets: ''
        }
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
      dev: '.tmp'
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
        src: 'src/scss',
        dest: '.tmp/assets/scss'
      },
      coffee: {
        src: 'src/coffee',
        dest: '.tmp/assets/coffee'
      },
      vendor_assets: {
        src: 'bower_components',
        dest: '.tmp/assets/vendor'
      },
      fonts: {
        src: 'src/fonts',
        dest: '.tmp/assets/fonts'
      },
      images: {
        src: 'src/images',
        dest: '.tmp/assets/images'
      }
    },

    copy: {
      assets: {
        expand: true,
        cwd: 'src',
        src: ['images/**', 'fonts/**'],
        dest: '../build'
      },
      html5shiv: {
        expand: true,
        cwd: 'bower_components/html5shiv/dist',
        src: 'html5shiv.js',
        dest: '../build'
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
          '../build/behaviour.js': '<%= buildJavascripts %>'
        }
      }
    },

    replace: {
      production: {
        src: ['.tmp/css/*.css', '../build/**/*.html'],
        overwrite: true,
        replacements: [{
          from: '/assets',
          to: ''
        }, {
          from: '/vendor/html5shiv/src/html5shiv.js',
          to: 'html5shiv.js'
        }]
      }
    }

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
    'clean:dev',
    'assemble:production',
    'sass:production',
    'coffee:production',
    'replace',
    'cssmin',
    'uglify',
    'copy',
  ]);
};
