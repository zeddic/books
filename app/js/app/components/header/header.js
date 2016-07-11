define(function(require) {
  var angular = require('lib/angular');

  /** @nginject */
  function HeaderDirective() {
    return {
      templateUrl: 'js/app/components/header/header.html',
      controller: HeaderController,
      controllerAs: 'ctrl',
      scope: {}
    }
  }

  /** @nginject */
  function HeaderController($state, $stateParams, $rootScope) {

    /** 
     * Search Term input.
     * @type {string}
     */
    this.input = '';

    $rootScope.$on('$stateChangeSuccess', (e, toState) => {
      this.input = (toState.name == 'explore.search') ? $stateParams['q'] : '';
    });

    this.search = function() {
      if (this.input) {
        $state.go('explore.search', {'q': this.input});
      }
    }
  }

  return angular
      .module('books.components.header', [])
      .directive('booksHeader', HeaderDirective);
});
