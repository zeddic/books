define(function(require) {
  var angular = require('lib/angular');

  /** @nginject */
  function BookDirective() {
    return {
      restrict: 'E',
      templateUrl: 'js/app/components/book/book.html',
      controller: BookController,
      controllerAs: 'ctrl',
      scope: {
        'volume': '='
      }
    }
  }

  /** @nginject */
  function BookController() {

  }

  return angular
      .module('books.components.book', [])
      .directive('book', BookDirective);
});


// ui-sref="explore.book({bookId: volume.id })"