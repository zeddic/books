define(function(require) {

  function ShelvesController(googapi, gbooks, $stateParams, $state) {
    this.googapi = googapi;
    this.shelves = [];

    gbooks
        .getVisibleShelves()
        .then(shelves => this.shelves = shelves)
        .then(shelves => {
          if (angular.isUndefined($stateParams['shelfId'])) {
            $state.go('shelves.shelf', {'shelfId': shelves[0].id });
          }
        });
  };

  return ShelvesController;
});
