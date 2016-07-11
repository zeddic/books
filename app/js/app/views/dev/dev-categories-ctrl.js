define(function(require) {

  function DevCategoriesController(gbooks, $stateParams, $scope) {
    this.categories = [];
    this.entries = [];

    this.pendingEntries = [];
    this.entriesByBookId = {};

    this.lookupId = 1604;

//    this.lookupId;
//    this.howMany;

    this.lookup = function() {
      this.loadCategory(this.lookupId);

/*      var id = Number(this.lookupId || '1');
      var howMany = Number(this.howMany || '5');

      for (var i = id; i < id + howMany; i++) {
        this.loadCategory(i);*/
      //}
    }

    this.loadCategory = function(id) {
      var idStr = 'coll_' + id;
      this.entriesByBookId = {};
      this.categories = [];

      gbooks.getCategoryBooks(idStr, 100, {onlyIds: true})
        .then(books => {
          this.parseBooks(id, books);
        })
        .catch(() => {
          this.parseError(id);
        });
    };

    this.parseBooks = function(id, books) {
      this.entries = books.map(book => {
        return {
          'category': id,
          'bookid': book.id,
          'title': '...',
          'description': '...',
          'categories': '',
        };
      });

      this.entries.forEach(entry => {
        gbooks.getBook(entry.bookid)
            .then(book => {
              entry.title = book.volumeInfo.title;
              entry.description = book.volumeInfo.description;
              entry.categories = book.volumeInfo.categories.join(',\n');
            });
      });
    };


    this.download = function() {
      var header = 'data:text/csv;charset=utf-8,';
      var data = this.entries.map(entry => {
        return [
          entry.category,
          entry.bookid,
          '"' + entry.title + '"',
          '"' + entry.categories + '"',
          '"' + entry.description + '"',
        ].join(', ');
      }).join('\n');

      var csvContent = encodeURI(header + data);

      var link = document.createElement('a');
      link.setAttribute('href', csvContent);
      link.setAttribute('download', 'bookdata.csv');
      link.click();

    };

    this.parseError = function(id) {
      this.entries.push({
        id: id,
        book: 'ERROR',
        categories: '',
        description: 'ERROR',
      });
    };

    //this.onCategoriesLoaded = function() {
    //}

    //gbooks.getCategories()
    //  .then(categories => this.categories = categories)
    //  .then(this.onCategoriesLoaded.bind(this));


    /*
    this.loadBooks = function() {
      this.categories.forEach(category => {
        var id = category.categoryId;
        category.books = [];
        gbooks.getCategoryBooks(id, 5)
            .then(books => category.books = books);
      });
    };

    gbooks.getCategories()
        .then(categories => this.categories = categories)
        .then(this.loadBooks.bind(this));

    */
  }

  return DevCategoriesController;
});
