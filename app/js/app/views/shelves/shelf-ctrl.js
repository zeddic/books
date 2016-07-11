define(function(require) {

  function ShelfController(gbooks, $stateParams) {
    var shelfId = $stateParams['shelfId'];
    this.books = [];


    gbooks
        .getShelfBooks(shelfId)
        .then(data => this.books = data.items);



    this.onSort = function(book, indexTo) {
      console.log('moved ' + book.id + ' to ' + indexTo);
      gbooks.moveBookInShelf(book.id, indexTo, shelfId)
          .then(data => console.log(data));
    }

  }

  return ShelfController;
});
