define(function(require) {
  var angular = require('lib/angular');
  var backdrop = require('./../backdrop/backdrop');
  var Dialog = require('./dialog');

    /** @ngInject */
  function DialogService(
      $animate,
      $compile,
      $controller,
      $document,
      $rootScope,
      $templateRequest,
      backdropService) {

    /**
     * Spawns a new dialog with the specified options.
     */
    this.show = function(options) {
      const dialog = new Dialog(
          $animate,
          $compile,
          $controller,
          $document,
          $rootScope,
          $templateRequest,
          backdropService,
          options);

      dialog.show();
      return dialog;
    }
  };



  /**
   * Directive for the dropdown contents.
   */
  function DialogDirective() {
    return {
      scope: {},
      templateUrl: 'js/app/components/dialog/basic-dialog.html',
      transclude: true,
    }
  };

  return angular
      .module('books.components.dialog', [
        backdrop.name,
      ])
      .service('dialogService', DialogService);
});
