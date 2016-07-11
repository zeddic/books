define(function(require) {

  /** 
   * @constructor
   */
  function Point(left, top) {
    this.left = left;
    this.top = top;
  };


  Point.prototype.sub = function(point) {
    this.left -= point.left;
    this.top -= point.top;
    return this;
  };


  Point.prototype.copy = function() {
    return new Point(this.left, this.top);
  };

  return Point;
});
