define(function(require) {

  function CategoryController(gbooks, $stateParams, $scope) {
    var categoryId = $stateParams['categoryId'];
    this.category = {};
    this.books = [];

    gbooks.getCategories()
        .then(categories => {
          this.category = categories.filter(category => {
            return category.categoryId == categoryId;
          })[0];
        });

    gbooks.getCategoryBooks(categoryId, 100)
        .then(books => this.books = books);
  }

  return CategoryController;
});
