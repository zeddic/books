define(function(require) {
  var angular = require('lib/angular');

  /** @nginject */
  function AnimateOnLoadDirective($animateCss) {
    return {
      link: function(scope, element) {
        $animateCss(element, {
          'event': 'enter',
          'structural': true
        }).start();
      }
    };
  }

  return angular
      .module('books.components.animate', [])
      .directive('animateOnLoad', AnimateOnLoadDirective);
});
