define(function(require) {

  /**
   * @constructor
   */
  function AboutController(dialogService, backdropService) {
    this.showDialog = function() {
      dialogService.show({
        templateUrl: 'js/app/views/about/about-dialog.html',
      });
    };
  };

  return AboutController;
});
