define(function(require) {
  var angular = require('lib/angular');
  var animate = require('components/animate/animate');
  var backdrop = require('components/backdrop/backdrop');
  var book = require('components/book/book');
  var bookCard = require('components/bookcard/book-card');
  var dialog = require('components/dialog/dialog-module');
  var dropdown = require('components/dropdown/dropdown');
  var header = require('components/header/header');
  var position = require('components/position/position');
  var shelfpicker = require('components/shelfpicker/shelf-picker');

  return angular
      .module('books.components', [
        animate.name,
        backdrop.name,
        book.name,
        bookCard.name,
        dialog.name,
        dropdown.name,
        header.name,
        position.name,
        shelfpicker.name
      ]);
});
