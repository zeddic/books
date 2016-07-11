module.exports = function(grunt) {
  'use strict';

  grunt.initConfig({
    requirejs: {
      compile: {
        options: {
          appDir: 'app',
          baseUrl: 'js/app',
          paths: {},
          removeCombined: true,
          modules: [{ name: 'app' }],
          dir: 'deploy',
          mainConfigFile: 'app/js/app/main.js',
          optimize: 'none',
        }
      }
    },

    'closure-compiler': {
      compile: {
        src: 'deploy/js/app/app.js',
        dest: 'deploy/js/app/app.js'
      },
      options: {
        compilation_level: 'WHITESPACE_ONLY',
        language_in: 'ECMASCRIPT6_STRICT',
        language_out: 'ECMASCRIPT5_STRICT',
        warning_level: 'QUIET',
      }
    }
  });


  require('google-closure-compiler').grunt(grunt);

  grunt.loadNpmTasks('grunt-contrib-requirejs');

  // The Build phase is two passes:
  // 1: Merge require-js files and copy files into the deploy package
  // 2: A Google Closure compiler pass to downcompile es6 to es5

  // TODO: Figure out a way to hold off merging our external libraries into the
  // minified package until after the closure compiler pass is done.
  grunt.registerTask('build', ['requirejs', 'closure-compiler'])
};
