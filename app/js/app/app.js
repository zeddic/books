define(function(require) {

  require('lib/uirouter');
  require('lib/angularAnimate');
  require('lib/angularSanitize');
  require('lib/angularSortableView');

  var angular = require('lib/angular');
  var googapi = require('services/googapi');
  var gbooks = require('services/gbooks');
  var components = require('components/components');
  var root = require('views/root/root');
  var route = require('route');
  var routeRedirectTo = require('route-redirect-to');

  var module = angular
      .module('books', [
          'ui.router',
          'ngAnimate',
          'ngSanitize',
          'angular-sortable-view',
          root.name,
          components.name,
          googapi.name,
          gbooks.name
      ]);

  module.run(routeRedirectTo);
  module.config(route);

  angular.element(document).ready(function() {
    angular.bootstrap(document, ['books'])
  });
});
