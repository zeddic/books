define(function(require) {

  var angular = require('lib/angular');

  /**
   * A service for loading the Google JS API (jsapi) and requested client libraries.
   * @constructor
   */
  var GoogApiService = function($timeout, $rootScope, $window, $q) {

    var clientId = '';
    var clientSecret = '';
    var apiKey = '';
    var scopes = 'https://www.googleapis.com/auth/books';
    var apisToLoad = [];

    this.loaded = false;
    this.authorized = false;
    this.error = null;
    this.apisLoaded = false;

    /**
     * Requests that a gapi client api be loaded. (Example: 'books', 'v1')
     * Returns a promise that will be resolved once loaded. Load requests
     * will be queued to be loaded as soon as the base gapi has been
     * loaded and authorization complete.
     * @param {string} name
     * @param {string} version
     */
    this.loadApi = function(name, version) {
      var deferred = $q.defer();

      var loadFn = function() {
        return gapi.client.load('books', 'v1').then(
            (o) => { deferred.resolve(o); },
            (e) => { deferred.reject(e); });
      }

      if (this.authorized) {
        loadFn();
      } else {
        apisToLoad.push(loadFn);
      }

      return deferred.promise;
    };

    /**
     * Checks if the user is already authorized with gapi.
     */
    this.checkAuth = function() {
      gapi.auth.authorize(
        {client_id: clientId, scope: scopes, immediate: true}, 
        this.onAuthResult_.bind(this));
    };

    /**
     * Starts the authorization process. This may cause a popup to be
     * shown to the user.
     */
    this.auth = function() {
      gapi.auth.authorize(
        {client_id: clientId, scope: scopes, immediate: false}, 
        this.onAuthResult_.bind(this));
    };

    this.onAuthResult_ = function(result) {
      if (result && !result.error) {
        this.authorized = true;
        this.error = null;
        this.loadApis_().then(() => this.apisLoaded = true);
      } else {
        this.authorized = false;
        this.apisLoaded = false;
        this.error = result.error;
      }

      $rootScope.$apply();
    };

    /**
     * Load any APIs that have been queued after authorization is done.
     */
    this.loadApis_ = function() {
      var promises = apisToLoad.map(fn => fn());
      return $q.all(promises);
    };

    // Create a global callback.
    $window._onGoogleApi = () => {
      gapi.client.setApiKey(apiKey);
      this.loaded = true;
      $timeout(this.checkAuth.bind(this), 1);
    };

    // Add the gapi script tag and tie it to global callback.
    var script = document.createElement('script');
    script.setAttribute('type','text/javascript');
    script.setAttribute('src', 'https://apis.google.com/js/client.js?onload=_onGoogleApi');
    document.querySelector('head').appendChild(script);
  };

  /**
   * Requests that the GoogleApi Service load a particular gapi client
   * library after authorization is complete.
   *
   * Returns an ng-injectable function that is intended to be run within
   * a module's run() function.
   * 
   * Note that client libraries will be loaded Async. To determine when
   * libraries have finished loading, check the 'apisLoaded' boolean
   * on the service instance.
   *
   * Use the services googapi.loadApi if you need a promise based
   * interface to wait for the api to load.
   * 
   * Example Use:
   *  return angular
   *     .module('gbooks', [googapi.name])
   *     .service('gbooks', GoogleBooksService)
   *     .run(googapi.loadApi('books', 'v1'));
   */
  var loadApi = function(name, version) {
    /** @ngInject */
    return function(googapi) {
      googapi.loadApi(name, version);
    };
  }

  var module = angular
      .module('googapi', [])
      .service('googapi', GoogApiService);

  module.loadApi = loadApi;

  return module;
});
