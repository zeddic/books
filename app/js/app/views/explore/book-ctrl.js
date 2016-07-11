define(function(require) {

  function BookController(gbooks, $stateParams, $scope) {
    var bookId = $stateParams['bookId'];
    this.bookId = bookId;
    this.book = {};
    this.search = '';
    this.results = [];
    this.related = [];
    this.bookImageUrl = null;

    gbooks
        .getBook(bookId)
        .then(data => {
          this.book = data;
          var links = this.book.volumeInfo.imageLinks;
          this.bookImageUrl = links.small || links.thumbnail || null;
        });

    gbooks
       .getRelatedBooks(bookId)
       .then(data => this.related = data);

    this.addToList = function() {
      gbooks.addBookToShelf(bookId, gbooks.Shelf.TO_READ)
          .then(result => {
            console.log(result);
          })
    }

    this.downvote = function() {
      gbooks.downvote(bookId);
    }

    this.upvote = function() {
      gbooks.upvote(bookId);
    }
  }
  return BookController;
});
