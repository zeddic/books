define(function(require) {
  var angular = require('lib/angular');

    /** @nginject */
  function BackdropService($animate, $window, $document, $timeout, $$rAF, $rootScope) {
    this.animate = $animate;
    this.document = $document;
    this.window = $window;
    this.raf = $$rAF;
    this.rootScope = $rootScope;
  };

  BackdropService.prototype.show = function() {
    var doc = this.document[0];
    var raf = this.raf;

    var backdropEl = angular.element(doc.createElement('div'));
    backdropEl.addClass('backdrop');
    doc.body.appendChild(backdropEl[0]);

    // Frame 1: element is rendered
    // Frame 2: fade in opacity
    // They must be in different frames or the css transition will
    // skip to the final state.
    raf(() => {
      raf(() => {
        angular.element(backdropEl[0]).addClass('fade');
      });
    });

    return {
      dismiss: () => {
        this.animate.leave(backdropEl);
      },
      onClick: (handler) => {
        backdropEl.on('click', () => {
          this.rootScope.$apply(() => handler());
        });
      },
    };
  };

  return angular
      .module('books.components.backdrop', [])
      .service('backdropService', BackdropService);
});
