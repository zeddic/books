define(function(require) {

  var angular = require('lib/angular');
  var googapi = require('services/googapi');
  var gbooks = require('services/gbooks');

  function BooksRootDirective() {
    return {
      templateUrl: 'js/app/views/root/root.html',
      controller: BooksRootController,
      controllerAs: 'ctrl',
    }
  }

  function BooksRootController(googapi, gbooks, $rootScope) {
    this.googapi = googapi;

    this.onAuth = function() {
      googapi.auth();
      return false;
    };


    $rootScope.$on('$stateChangeError', function(e, toState, toParams, fromState, fromParams, error) {
      console.log('error!');
      throw error;
    });


    $rootScope.$on('$stateChangeSuccess', function(e, toState, toParams, fromState, fromParams) {
    });

  }

  return angular
      .module('views.root', [
        googapi.name,
        gbooks.name])
      .directive('booksRoot', BooksRootDirective);
});
