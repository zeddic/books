define(function(require) {
  var angular = require('lib/angular');
  var positioning = require('./../position/positioning');

  var Keys = {
    ESC: 27
  };

  /** @nginject */
  function DropdownDirective() {
    return {
      controller: DropdownController,
      controllerAs: 'ctrl',
      scope: {},
      link: function(scope, el, attrs, ctrl) {
        el.addClass('dropdown-container');
        ctrl.init();
      }
    }
  };

    /** @nginject */
  function DropdownController($window, $element, $document, $scope, $attrs, $$rAF) {
    this.window_ = $window;
    this.el = $element;
    this.rAF_ = $$rAF;
    this.open = false;
    this.toggleEl = null;
    this.popupEl = null;

    let onDocClick = this.onDocClick_.bind(this);
    let onKeyDown = this.onKeyDown_.bind(this);
    let cleanupLayoutListeners = this.setupLayoutListeners_(this.onLayout_.bind(this));

    $document.on('click', onDocClick);
    $document.on('keydown', onKeyDown);

    // Cleanup global listeners.
    $scope.$on('$destroy', () => {
      $document.off('click', onDocClick);
      $document.off('keydown', onKeyDown);
      cleanupLayoutListeners();
    });
  };

  DropdownController.prototype.init = function() {
    //this.popup = popupService_.popup();
  };

  DropdownController.prototype.toggle = function() {
    this.setOpen(!this.open);
  };

  DropdownController.prototype.setOpen = function(open) {
    this.open = open;
    this.el.toggleClass('open', this.open);
    this.toggleEl && this.toggleEl.toggleClass('pressed', this.open);
    this.open && this.reposition_();
  };

  DropdownController.prototype.onDocClick_ = function(e) {
    if (!this.open || this.el[0].contains(e.target)) {
      return;
    }
    this.setOpen(false);
  };

  DropdownController.prototype.onLayout_ = function() {
    if (this.open) {
      this.reposition_();
    }
  };

  DropdownController.prototype.onKeyDown_ = function(e) {
    if (e.which == Keys.ESC) {
      this.setOpen(false);
    }
  };

  DropdownController.prototype.reposition_ = function() {
    var corner = this.popupEl.attr('corner');
    var anchorCorner = this.popupEl.attr('anchorCorner');

    positioning.position({
      el: this.popupEl[0],
      anchor: this.toggleEl[0],
      corner: corner || 'left top',
      anchorCorner: anchorCorner || 'left bottom',
    });
  };


  DropdownController.prototype.setupLayoutListeners_ = function(cb) {
    let repositionFn = this.throttleViaRAF_(cb);
    const window = this.window_;

    window.addEventListener('resize', repositionFn);
    window.addEventListener('orientationchange', repositionFn);
    window.addEventListener('scroll', repositionFn, true);

    return function cleanupListeners() {
      window.removeEventListener('resize', repositionFn);
      window.removeEventListener('orientationchange', repositionFn);
      window.removeEventListener('scroll', repositionFn, true);
    }
  };

  /**
   * Returns a throttled version of a function that will 
   * only be called at most once per request animation frame.
   *
   * If the throttled function is called multiple times within
   * the same animation frame, only the *last* call will be
   * executed on the next frame - all other calls will be lost.
   *
   * This is appropriate for spammy events, such as window
   * resize events or scrolling, where you only care about the
   * last event and there is no need to waste CPU cycles.
   *
   * Based off of ng-materials $rAF decorator.
   *
   * TODO(scott): move this to a common location.
   * 
   * @param {function} fn Function to throttle
   * @return {function} fn that has been throttled
   */
  DropdownController.prototype.throttleViaRAF_ = function(fn) {
    var rAF = this.rAF_;
    let pending = false;
    let lastContext, lastArguments;

    return function throttled() {
      lastContext = this;
      lastArguments = arguments;

      if (!pending) {
        pending = true;
        rAF(function() {
          fn.apply(lastContext, Array.prototype.slice.call(lastArguments));
          pending = false;
        });
      }
    };

  };

  /**
   * Directive for the button or link that should toggle
   * visibility of the dropdown popup.
   */
  function DropdownToggleDirective() {
    return {
      scope: {},
      require: '^dropdown',
      link: function(scope, el, attrs, dropdownCtrl) {
        el.addClass('dropdown-toggle');
        dropdownCtrl.toggleEl = el;

        var toggle = function(e) {
          e.preventDefault();
          if (attrs['disabled'] || el.hasClass('disabled')) {
            return;
          }
          scope.$apply(() => dropdownCtrl.toggle());
        };

        el.on('click', toggle);
        scope.$on('$destroy', () => el.off('click', toggle));
      }
    }
  };


  /**
   * Directive for the dropdown contents.
   */
  function DropdownPopupDirective() {
    return {
      scope: {},
      require: '^dropdown',
      link: function(scope, el, attrs, dropdownCtrl) {
        el.addClass('dropdown-popup');
        dropdownCtrl.popupEl = el;
      }
    }
  };


  return angular
      .module('books.components.dropdown', [])
      .directive('dropdown', DropdownDirective)
      .directive('dropdownToggle', DropdownToggleDirective)
      .directive('dropdownPopup', DropdownPopupDirective)
});
