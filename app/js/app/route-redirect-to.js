define(function(require) {

  /**
   * Adds support for a 'redirectTo' on ui-router states. This is a temporary
   * patch until it is added natively to ui-router.
   * @ngInject
   */
  var routeRedirectTo = function($rootScope, $state, $injector) {
    $rootScope.$on('$stateChangeStart',function (event, toState, toParams) {
      var redirect = toState.redirectTo;
      if (redirect) {
        if (angular.isString(redirect)) {
          event.preventDefault();
          $state.go(redirect, toParams);
        }
        else {
          var newState = $injector.invoke(redirect, null, { toState: toState, toParams: toParams });
          if (newState) {
            if (angular.isString(newState)) {
              event.preventDefault();
              $state.go(newState);
            }
            else if (newState.state) {
              event.preventDefault();
              $state.go(newState.state, newState.params);
            }
          }
        }
      }
    });
  };

  return routeRedirectTo;
});
