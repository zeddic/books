define(function(require) {
  var angular = require('lib/angular');
  var googapi = require('services/googapi');

  function GoogleBooksService(googapi, $q, $window) {

    /**
     * Google Precreates shelfs with known ids for all users.
     * Any of their custom shelfs will have ids over 1000.
     * @public {Object<number>}
     */
    var Shelf = this.Shelf = {
      FAVORITES: 0,
      PURCHASED: 1,
      TO_READ: 2,
      READING_NOW: 3,
      HAVE_READ: 4,
      REVIEWED: 5,
      RECENTLY_VIEWED: 6,
      MY_EBOOKS: 7,
      BOOKS_FOR_YOU: 8,
      BROWSING_HISTORY: 9
    };

    var HIDDEN_SHELVES = [
      Shelf.PURCHASED,
      Shelf.REVIEWED,
      Shelf.RECENTLY_VIEWED,
      Shelf.MY_EBOOKS,
      Shelf.BOOKS_FOR_YOU,
      Shelf.BROWSING_HISTORY
    ];


    /**
     * A cached list of shelves.
     * @private {angular.$q.Promise<Array<Shelf>>}
     */
    this.shelvesPromise_ = null;

    /**
     * A cached promise resolving to a map of book ids to a set of shelves
     * those books are in.
     * @private {angular.$q.Promise<?Object<Object<boolean>>}
     */
    this.shelvesByBookPromise_ = null;

    /**
     * Returns a list of all known shelves. Cached.
     */
    this.getShelves = function() {
      if (this.shelvesPromise_) {
        return this.shelvesPromise_;
      }

      return this.shelvesPromise_ = $q
          .when(gapi.client.books.mylibrary.bookshelves.list())
          .then(data => data.result.items);
    };

    /**
     * Gets a list of all shelfs that should be visible to the user.
     */
    this.getVisibleShelves = function() {
      return this
          .getShelves()
          .then(shelves => shelves.filter(shelf => {
            return HIDDEN_SHELVES.indexOf(shelf.id) == -1;
          }));
    };

    /**
     * Fetches details about a particular shelf.
     */
    this.getShelf = function(id) {
      return this.getShelves()
          .then(shelves => {
            return shelves.filter(shelf => shelf.id == id)[0];
          });
    };

    /**
     * Fetchs a list of all books on a given shelf.
     */
    this.getShelfBooks = function(shelfId) {
      var params = {
        'shelf': shelfId,
        'maxResults': 1000
      }

      return $q
          .when(gapi.client.books.mylibrary.bookshelves.volumes.list(params))
          .then(data => data.result);
    };

    /**
     * Given a shelfId, returns an array of bookIds that are contained in the
     * shelf.
     * @param {string} shelfId
     * returns angular.$q.Promise<string>
     */
    this.getShelfBookIds = function(shelfId) {
      var params = {
        'shelf': shelfId,
        'maxResults': 4500,
        'fields': 'items/id'
      };

      return $q
          .when(gapi.client.books.mylibrary.bookshelves.volumes.list(params))
          .then(data => data.result.items || [])
          .then(books => books.map(book => book.id));
    };

    /**
     * Given a bookId, returns an object that can be queried to see
     * what shelves contain that book. Object keys are shelfIds and
     * values are true/false.
     *
     * The returned map is a live reference to the underlying lookup
     * and may be modified.
     */
    this.getShelvesBookIsIn = function(bookId) {
      return this
          .getShelvesByBook_()
          .then(lookup => {
            return lookup[bookId] || (lookup[bookId] = {});
          });
    };


    this.shelvesByBookPromise

    /**
     * Returns a map of bookIds to a set of shelfIds that contain
     * that book. Cached.
     *
     * Example:
     * lookup['book1'][4] // returns true if book1 is in shelf 4.
     *
     * return angular.$q.Promise<Object<Object<boolean>>
     * @private
     */
    this.getShelvesByBook_ = function() {
      if (this.shelvesByBookPromise_) {
        return this.shelvesByBookPromise_;
      }

      // Given a list of shelves, requests a list of book ids in
      // each. Returns a promise that will resolve to a map of
      // shelfId to the list of book ids.
      var requestBookIdsInEachShelf = (shelves) => {
        var shelfIds = shelves.map(shelf => shelf.id);
        var promises = {};

        shelfIds.forEach((shelfId) => {
          promises[shelfId] = this.getShelfBookIds(shelfId);
        });

        return $q.all(promises);
      };

      // Given a map of shelfId to bookIds, converts it to
      // a map of bookIds to shelves that book id is in.
      var convertBookIdsToLookupMap = (bookLists) => {
        var lookup = {};
        for (var shelfId in bookLists) {
          var bookIds = bookLists[shelfId];
          bookIds.forEach(id => {
            var set = lookup[id] || (lookup[id] = {});
            set[shelfId] = true;
          });
        }
        return lookup;
      };

      this.shelvesByBookPromise_ = this
          .getVisibleShelves()
          .then(requestBookIdsInEachShelf)
          .then(convertBookIdsToLookupMap)
          .then(lookup => this.shelvesByBook_ = lookup);

      return this.shelvesByBookPromise_;
    };


    /**
     * Gets Recommended books. For some reason google returns different
     * results for this call then getting from the BOOKS_FOR_YOU shelf.
     */
    this.getRecommended = function() {
      return $q
          .when(gapi.client.books.volumes.recommended.list())
          .then(data => data.result);
    };

    this.getBook = function(bookId) {
      return $q
          .when(gapi.client.books.volumes.get({'volumeId': bookId}))
          .then(data => data.result);
    };

    this.search = function(query, opt_libraryRestrict) {
      var restrict = !!opt_libraryRestrict ? 'my-library' : 'no-restrict';
      return $q
          .when(gapi.client.books.volumes.list({
            'q': query,
            'libraryRestrict': restrict,
            'maxResults': 40,
            'orderBy': 'relevance'
          }))
          .then(data => data.result);
    };

    this.getRelatedBooks = function(bookId) {

      var params = {
        'volumeId': bookId,
        //'association': 'related-for-play'
        //'association': 'end-of-sample'//'related-for-play'
      };

      return $q
          .when(gapi.client.books.volumes.associated.list(params))
          .then(data => data.result);
    };

    /**
     * Adds a book to a particular shelf.
     */
    this.addBookToShelf = function(bookId, shelfId) {
      var params = {
        'volumeId': bookId,
        'shelf': shelfId
      };

      return $q
          .when(gapi.client.books.mylibrary.bookshelves.addVolume(params))
          .then(data => {
            return this.getShelvesBookIsIn(bookId);
          })
          .then(containedIn => {
            containedIn[shelfId] = true;
            return this.getShelf(shelfId);
          })
          .then(shelf => {
            shelf.volumeCount++;
          });
    };

    /**
     * Removes a book from a particular shelf.
     */
    this.removeBookFromShelf = function(bookId, shelfId) {
      var toReturn;
      var params = {
        'volumeId': bookId,
        'shelf': shelfId
      };

      return $q
          .when(gapi.client.books.mylibrary.bookshelves.removeVolume(params))
          .then(data => {
            return this.getShelvesBookIsIn(bookId);
          })
          .then(containedIn => {
            containedIn[shelfId] = false;
            return this.getShelf(shelfId);
          })
          .then(shelf => {
            shelf.volumeCount--;
          });
    };

    this.moveBookInShelf = function(bookId, position, shelfId) {
      var params = {
        'volumeId': bookId,
        'volumePosition': position,
        'shelf': shelfId
      };

      return $q
          .when(gapi.client.books.mylibrary.bookshelves.moveVolume(params))
          .then(data => data.result);
    };

    this.downvote = function(bookId) {
      return this.vote_(bookId, false);
    };

    this.upvote = function(bookId) {
      var add = this.addBookToShelf(bookId, Shelf.TO_READ);
      var vote = this.vote_(bookId, true);
      return $q.all([add, vote]);
    };

    this.vote_ = function(bookId, likedIt) {
      var params = {
        'volumeId': bookId,
        'rating': likedIt ? 'HAVE_IT' : 'NOT_INTERESTED'
      };
      return $q
          .when(gapi.client.books.volumes.recommended.rate(params))
          .then(data => data.result);
    };


    this.getCategories = function() {
      var params = {};
      return $q
          .when(gapi.client.books.onboarding.listCategories(params))
          .then(data => data.result.items);
    };

    this.getCategoryBooks = function(categoryId, opt_pageSize, opt_options) {
      var options = opt_options || {};
      var pageSize = opt_pageSize || 20;
      var params = {
        'categoryId': categoryId,
        'pageSize': pageSize,
        'fields': options.onlyIds ? 'items/id' : undefined,
      };

      return $q
          .when(gapi.client.books.onboarding.listCategoryVolumes(params))
          .then(data => data.result.items);
    };
  }


  return angular
      .module('gbooks', [googapi.name])
      .service('gbooks', GoogleBooksService)
      .run(googapi.loadApi('books', 'v1'));
});
