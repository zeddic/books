define(function(require) {

  function RecommendedController(gbooks, $timeout, $scope) {
    this.books = [];
    this.loading = false;




    this.fetch = function() {
      this.loading = true;
      gbooks
        .getRecommended()
        .then(data => this.books = data.items)
        .finally(() => this.loading = false);
    }

    this.onSort = function(book, indexTo) {
      console.log('moved ' + book.id + ' to ' + indexTo);
      gbooks.moveBookInShelf(book.id, indexTo, shelfId)
          .then(data => console.log(data));
    }

    this.onVoted = function(book) {
      //this.fetch();
      gbooks
        .getRecommended()
        .then(data => {
          var newBooks = data.items;
          this.books.splice(newBooks.length);

          for (var i = 0; i < this.books.length; i++) {
            if (this.books[i].id != newBooks[i].id) {
              this.books[i] = newBooks[i];
            }
          }
        });


    }

    //this.fetch();

    $timeout(() => {
      this.fetch();
    }, 0);
  }

  return RecommendedController;
});
