requirejs.config({
  baseUrl: 'js/app',
  paths: {
    'lib': '../lib',
    'lib/angular': '../lib/angular.min',
    'lib/angularAnimate': '../lib/angular-animate',
    'lib/angularSanitize': '../lib/angular-sanitize.min',
    'lib/angularSortableView': '../lib/angular-sortable-view.min',
    'lib/uirouter': '../lib/angular-ui-router.min'
  },
  shim: {
    'lib/angular': {
      exports: 'angular'
    },
    'lib/angularAnimate': {
      'deps': ['lib/angular']
    },
    'lib/angularSanitize': {
      deps: ['lib/angular']
    },
    'lib/angularSortableView': {
      deps: ['lib/angular']
    },
    'lib/uirouter': {
      deps: ['lib/angular']
    }
  },
});

requirejs(['app']);
