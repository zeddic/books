define(function(require) {
  var angular = require('lib/angular');

  /** @nginject */
  function ShelfPickerDirective() {
    return {
      templateUrl: 'js/app/components/shelfpicker/shelf-picker.html',
      controller: ShelfPickerController,
      controllerAs: 'ctrl',
      bindToController: true,
      scope: {
        'bookId': '=',
        'buttonClasses': '@',
      },
      link: function(scope, el, attrs, ctrl) {
        el.addClass('shelf-container');
        var toggleEl = angular.element(el[0].querySelector('[dropdown-toggle]'));
        toggleEl.addClass(ctrl.buttonClasses);
      },
    }
  };

    /** @ngInject */
  function ShelfPickerController(gbooks) {
    
    /** @public {string} */
    this.bookId;

    this.containedIn = {};

    this.shelves = [];

    gbooks
        .getShelvesBookIsIn(this.bookId)
        .then(ids => this.containedIn = ids);

    gbooks
        .getVisibleShelves()
        .then(shelves => this.shelves = shelves);

    this.in = function(shelf) {
      return !!this.containedIn[shelf.id];
    };

    this.toggle = function(shelf) {
      if (this.in(shelf)) {
        gbooks.removeBookFromShelf(this.bookId, shelf.id);
      } else {
        gbooks.addBookToShelf(this.bookId, shelf.id);
      }
    };

    this.getIconName = function() {
      var count = this.getCount();

      if (count == 0) {
        return 'filter_none';
      } else if (count > 9) {
        return 'filter_9_plus';
      } else {
        return 'filter_' + count;
      }
    };

    this.getCount = function() {
      var count = 0;
      for (var key in this.containedIn) {
        count += (this.containedIn[key] ? 1 : 0);
      }
      return count;
    };
  };

  return angular
      .module('books.components.shelfpicker', [])
      .directive('shelfPicker', ShelfPickerDirective);
});
