define(function(require) {


  var AboutController = require('views/about/about-ctrl');
  var BookController = require('views/explore/book-ctrl');
  var CategoriesController = require('views/explore/categories-ctrl');
  var CategoryController = require('views/explore/category-ctrl');
  var DevCategoriesController = require('views/dev/dev-categories-ctrl');
  var ShelvesController = require('views/shelves/shelves-ctrl');
  var ShelfController = require('views/shelves/shelf-ctrl');
  var RecommendedController = require('views/recommended/recommended-ctrl');
  var SearchResultsController = require('views/explore/search-results-ctrl');

  /**
   * @ngInject
   */
  var routeConfig = function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/shelves");
    $stateProvider
      .state('shelves', {
        url: '/shelves',
        templateUrl: 'js/app/views/shelves/shelves.html',
        controller: ShelvesController,
        controllerAs: 'ctrl'
      })
      .state('shelves.shelf', {
        url: '/{shelfId}',
        templateUrl: 'js/app/views/shelves/shelf.html',
        controller: ShelfController,
        controllerAs: 'ctrl'
      })
      .state('explore', {
        url: '/explore',
        template: '<div ui-view></div>',
        redirectTo: 'explore.categories',
      })
      .state('explore.categories', {
        url: '/categores',
        templateUrl: 'js/app/views/explore/categories.html',
        controller: CategoriesController,
        controllerAs: 'ctrl'
      })
      .state('explore.category', {
        url: '/category/{categoryId}',
        templateUrl: 'js/app/views/explore/category.html',
        controller: CategoryController,
        controllerAs: 'ctrl'
      })
      .state('explore.search', {
        url: '/search?q',
        templateUrl: 'js/app/views/explore/search-results.html',
        controller: SearchResultsController,
        controllerAs: 'ctrl'
      })
      .state('explore.book', {
        url: '/{bookId}',
        templateUrl: 'js/app/views/explore/book.html',
        controller: BookController,
        controllerAs: 'ctrl'
      })
      .state('recommended', {
        url: '/recommended',
        templateUrl: 'js/app/views/recommended/recommended.html',
        controller: RecommendedController,
        controllerAs: 'ctrl'
      })
      .state('about', {
        url: '/about',
        templateUrl: 'js/app/views/about/about.html',
        controller: AboutController,
        controllerAs: 'ctrl'
      })
      .state('dev', {
        url: '/dev',
        template: '<div ui-view></div>',
        redirectTo: 'dev.cats',
      })
      .state('dev.cats', {
        url: '/cats',
        templateUrl: 'js/app/views/dev/dev-categories.html',
        controller: DevCategoriesController,
        controllerAs: 'ctrl'
      });
  }

  return routeConfig;
});
