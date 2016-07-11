define(function(require) {

  function CategoriesController(gbooks, $stateParams, $scope) {
    this.categories = [];

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
  }

  return CategoriesController;
});
