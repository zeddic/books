define(function(require) {
  var angular = require('lib/angular');

  /**
   * Renders a card that displays a book with album art. 
   * Directive attributes:
   *
   * book - Book object from Google books API
   * showShelfPicker - {boolean} True to show a dropdown
   *     to pick what shelves the book is in. Defaults to
   *     true.
   * showVotes - {boolean} True to show thumbs up/down vote
   *     buttons. Defaults to false.
   * artOnly - {boolean} When true, only album art will be
   *     shown. When true, showShelfPicker and showVote
   *     attributes are ignored.
   * onVoted - {function} Executed after an up/down vote has
   *     been completed. 
   *
   * @nginject
   */
  function BookCardDirective() {
    return {
      templateUrl: 'js/app/components/bookcard/book-card.html',
      controller: BookCardController,
      controllerAs: 'ctrl',
      bindToController: true,
      scope: {
        'book': '=',
        'showShelfPicker': '=?',
        'showVotes': '=?',
        'artOnly': '=',
        'onVoted': '&'
      }
    }
  }

  /** @nginject */
  function BookCardController(gbooks) {

    /** @type {boolean} */
    this.showShelfPicker =
        angular.isUndefined(this.showShelfPicker) ?
            true :
            this.showShelfPicker;

    /** @type {boolean} */
    this.showVotes = this.showVotes || false;


    this.downvote = function() {
      gbooks.downvote(this.book.id)
          .then(this.triggerOnVoted.bind(this));
    };

    this.upvote = function() {
      gbooks.upvote(this.book.id)
          .then(this.triggerOnVoted.bind(this));
    };

    this.triggerOnVoted = function() {
      this.onVoted({'book': this.book});
    };
  }

  return angular
      .module('books.components.bookCard', [])
      .directive('bookCard', BookCardDirective);
});
