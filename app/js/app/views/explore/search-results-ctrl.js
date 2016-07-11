define(function(require) {

  /**
   * @constructor
   */
  function SearchResultsController(gbooks, $stateParams, $scope) {
    this.results = [];
    this.stateParams = $stateParams;
    this.term = $stateParams['q'];
    this.gbooks = gbooks;
    this.loading = false;
    this.search();
  }

  SearchResultsController.prototype.search = function() {
    if (!this.term) {
      this.results = [];
      this.loading = false;
      return;
    }

    this.loading = true;
    this.gbooks.search(this.term)
        .then(results => this.results = results)
        .finally(() => this.loading = false);
  };

  return SearchResultsController;
});
