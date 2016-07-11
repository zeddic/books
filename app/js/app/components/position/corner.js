define(function(require) {

  /**
   * Short hand strings to refer to corner x/y values.
   * @type {Object<number>}
   */
  const SHORTHANDS = {
    'top': 0,
    'left': 0,
    'right': 1,
    'bottom': 1,
    'middle': .5,
    'center': .5,
  };

  /** 
   * A corner represents a location on a rectangle where
   * something should be positioned on. It is represented
   * as a X/Y value in the range of 0 and 1.
   * 
   * For example:
   * X:  0 Y:  0 = Top Left Corner
   * X:  1 Y:  0 = Top Right Corner
   * X:0.5 Y:0.5 = Middle
   * 
   * @constructor
   */
  function Corner(left, top) {
    this.left = Math.min(1, Math.max(0, left));
    this.top = Math.min(1, Math.max(0, top));
  };

  /**
   * Flips the X axis of the corner. For example, if
   * the corner was "Top Left", this would make it become
   * "Top Right"
   */
  Corner.prototype.flipX = function() {
    this.left = 1 - Math.min(this.left, 1);
    return this;
  };

  /**
   * Flips the Y axis of the corner. For example, if
   * the corner was "Top Left", this would make it become
   * "Bottom Left"
   */
  Corner.prototype.flipY = function() {
    this.top = 1 - Math.min(this.top, 1);
    return this;
  };

  /**
   * Returns a new corner instance based on this one.
   */
  Corner.prototype.copy = function() {
    return new Corner(this.left, this.top);
  };

  /**
   * Parses a corner from a user supplied string of
   * <X_VALUE> <Y_VALUE>
   * 
   * Values may be integers, or any of the strings:
   * top, bottom, left, right, or middle.
   *
   * Example Valid Inputs:
   *
   * "left top"
   * "left middle"
   * "right bottom"
   * "middle middle"
   * ".5 .8"
   * ".5 bottom" 
   */
  Corner.fromString = function(value) {
    let values = value.trim().toLowerCase().split(' ');
    values = values.map(val => val.trim());

    let x = values[0];
    let y = values[1];

    x = angular.isDefined(SHORTHANDS[x]) ? SHORTHANDS[x] : x;
    y = angular.isDefined(SHORTHANDS[y]) ? SHORTHANDS[y] : y;

    return new Corner(Number(x), Number(y));
  };

  return Corner;
});
