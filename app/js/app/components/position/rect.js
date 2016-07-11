define(function(require) {
  var Point = require('components/position/point');

  /** 
   * @constructor
   */
  function Rect(left, top, width, height) {
    this.left = left || 0;

    this.top = top || 0;

    this.right = this.left + (width || 0);

    this.bottom = this.top + (height || 0);
  };

  Rect.prototype.height = function() {
    return this.bottom - this.top;
  };

  Rect.prototype.width = function() {
    return this.right - this.left;
  };

  /**
   * Moves the rectangle by the given x/y amount.
   */
  Rect.prototype.add = function(point) {
    this.left += point.left;
    this.right += point.left;
    this.top += point.top;
    this.bottom += point.top;
    return this;
  };

  /**
   * Sets a new bottom for the rectangle, maintaining existing height.
   */
  Rect.prototype.shiftBottom = function(newBottom) {
    var height = this.height();
    this.bottom = newBottom;
    this.top = this.bottom - height;
  };

  /**
   * Sets a new top for the rectangle, maintaining existing height
   */
  Rect.prototype.shiftTop = function(newTop) {
    var height = this.height();
    this.top = newTop;
    this.bottom = this.top + height;
  };

  /**
   * Sets a new left for the rectangle, maintaining existing width
   */
  Rect.prototype.shiftLeft = function(newLeft) {
    var width = this.width();
    this.left = newLeft;
    this.right = this.left + width;
  };

  /**
   * Sets a new right for the rectangle, maintaining existing width
   */
  Rect.prototype.shiftLeft = function(newRight) {
    var width = this.width();
    this.right = newRight;
    this.left = this.right - width;
  };

  /**
   * Given a corner (a point with values in the [0-1] range),
   * returns that point on the rectangle.
   */
  Rect.prototype.cornerToPoint = function(cornor) {
    var y = this.top + cornor.top * this.height();
    var x = this.left + cornor.left * this.width();
    return new Point(x, y);
  };

  /**
   * Creates a new rectangle based on a provided elements
   * width, height, and offsetTop / Left.
   */
  Rect.fromElement = function(el) {
    return new Rect(
      el.offsetLeft,
      el.offsetTop,
      el.offsetWidth,
      el.offsetHeight);
  };

  /**
   * Creates a new rectangle based on a provided elements size
   * and positioned at 0,0.
   */
  Rect.fromElementSize = function(el) {
    return new Rect(0, 0, el.offsetWidth, el.offsetHeight);
  };

  return Rect;
});
