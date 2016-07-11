define(function(require) {
  var positioning = require('./../position/positioning');

  /** @constructor */
  function Dialog(
      $animate,
      $compile,
      $controller,
      $document,
      $rootScope,
      $templateRequest,
      backdropService,
      options) {

    this.animate_ = $animate;
    this.backdropService_ = backdropService;
    this.compile_ = $compile;
    this.controller_ = $controller;
    this.document_ = $document[0];
    this.options_ = options;
    this.rootScope_ = $rootScope;
    this.templateRequest_ = $templateRequest;

    this.parseOptions_(options);

    this.backdrop_ = null;

    this.wrapperEl_ = angular.element(this.document_.createElement('div'));
    this.wrapperEl_.addClass('dialog-wrapper');
  };

  Dialog.prototype.parseOptions_ = function() {
    var options = this.options_;
    options.scope = options.scope || this.rootScope_;
  };

  /**
   * Shows the dialog to the user.
   */
  Dialog.prototype.show = function(options) {
    this.loadTemplate_().then(() => {
      this.backdrop_ = this.backdropService_.show();
      this.backdrop_.onClick(this.cancel.bind(this));

      this.document_.body.appendChild(this.wrapperEl_[0]);
    });
  };

  Dialog.prototype.confirm = function() {
    // TODO: resolve promise.
    this.dispose();
  };

  Dialog.prototype.cancel = function() {
    // TODO: resolve promise.
    this.dispose();
  };

  /**
   * Dismisses the dialog. It can not be reused after dismissal.
   */
  Dialog.prototype.dispose = function() {
    this.backdrop_ && this.backdrop_.dismiss();
    var dialogEl = this.wrapperEl_[0].querySelector('.dialog');
    this.animate_.leave(dialogEl).then(() => {
      this.wrapperEl_.remove();
    });
  };

  /**
   * 
   */
  Dialog.prototype.loadTemplate_ = function() {
    var options = this.options_;

    if (options.template) {
      return this.q_.when(this.compileTemplate_(options.template));
    }

    return this.templateRequest_(options.templateUrl)
        .then(this.compileTemplate_.bind(this));
  };

  Dialog.prototype.compileTemplate_ = function(template) {
    var options = this.options_;

    // $compile only works if there is a single root element.
    // Wrap the template since we have no control over what
    // the user providers.
    var wrappedTemplate = '<div>' + template + '</div>';

    // Create a scope for the dialog to bind to.
    // Add some functions that it may invoke.
    var scope = options.scope.$new();
    scope['$confirm'] = this.confirm.bind(this);
    scope['$cancel'] = this.cancel.bind(this);
    scope.$on('$destroy', this.dispose.bind(this));

    // Compile.
    var el = this.compile_(wrappedTemplate)(scope);

    // Add some classes.
    //el.addClass('dialog');
    //options.class && el.addClass(options.class);
    //options.size && el.addClass('size-' + options.size);

    // Hook up a controller if the option was set.
    if (options.controller) {
      var locals = {
        '$confirm': this.confirm.bind(this),
        '$cancel': this.cancel.bind(this),
        '$dialog': this,
      }
      var ctrl = this.controller_(options.controller, locals);
      if (options.controllerAs) {
        scope[controllerAs] = ctrl;
      }
    }

    // Save.
    this.el_ = el;
    this.wrapperEl_.append(el);
  };

  return Dialog;
});
