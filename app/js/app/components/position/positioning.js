/**
 * Utility methods related to positioning.
 */
define(function(require) {

  var Corner = require('components/position/corner');
  var Rect = require('components/position/rect');
  var Point = require('components/position/point');
  var UID_KEY = 'zeddic-uid';
  var UID_PREFIX = 'zeddic-uid-'
  var uid = 0;
  var positioning = {};

  /**
   * Describes how one element should be positioned relative to
   * another. 
   *
   * A position is described as: "Place element next to anchor
   * so that these two corners meet".
   *
   * For example: "Place element so that it's top left corner
   * meets the anchor element's bottom left corner".
   *
   * Corners may be any position within the two elements. For
   * example, you could also say: "Place element so that
   * both of their middles meet". This would be equivalent
   * to positioning an element in the center of a region.
   *
   * Corners may be specified either as strings or as Corner
   * objects. When using a string to describe a corner,
   * specify the x coordinate followed by a space followed by
   * the y coordinate. Values are in the range 0 to 1. You may
   * also use the names "top, left, right, bottom, middle".
   *
   * Example configuration: 
   *
   * {
   *   el: popupEl,
   *   anchor: buttonEl,
   *   corner: 'top left',
   *   anchorCorner: 'bottom left'
   * }
   *
   * TODO(scott): Add an option for offsets. They will probably need
   * to be taken account for in the flip positioning stage too.
   *
   * @record
   */
   function PositionOptions() {};

   /**
    * @type {Element} The element to be positioned.
    */
   PositionOptions.prototype.el;

   /**
    * @type {Element} The element to be positioned relative to.
    */
   PositionOptions.prototype.anchor;

   /**
    * @type {(Corner|string)} The corner of the element that should meet anchorCorner.
    */
   PositionOptions.prototype.corner;

   /**
    * @type {(Corner|string)} The corner of the anchor that should meet corner.
    */
   PositionOptions.prototype.anchorCorner;


  /**
   * Returns a Unique ID for an element.
   * @param el {Element}
   * @return {string}
   */
  positioning.uid = function(el) {
    if (!el[UID_KEY]) {
      el[UID_KEY] = UID_PREFIX + (++uid);
    }
    return el[UID_KEY];
  };


  /**
   * Given a set of positioning options, positions the moveable
   * element next to the anchor. The elements position is set
   * by making it position: absolute and setting the top/left
   * css attributes. The class 'positioned' is also placed on
   * the element which you may use to apply additional properties,
   * such as a transition if you want to animate movement.
   *
   * See {@code getPosition} for more details on how this position
   * is determined.
   *
   * @param {PositionOptions} options
   */
  positioning.position = function(options) {
    var rect = positioning.getPosition(options);

    var css = {
      'top': rect.top + 'px',
      'left': rect.left + 'px',
      'position': 'absolute',
    };

    angular.element(options.el)
        .addClass('positioned')
        .css(css);
  };


  /**
   * Given a set of positioning options, returns a rectangle that
   * represents a positioning for the moveable element to be placed
   * near the anchor element and still remain visible to the user.
   * 
   * The returned rectangle is in the elements coordinate space and
   * represents a position relative to its offset parent.
   * 
   * The rules dictating position are roughly:
   *
   * 1 - Try to position such that the two configured corners
   *     are meeting exactly.
   *
   * 2 - If offscreen, try flipping a combination of the x and y
   *     parts of the corners. For example: if positioning
   *     right of the anchor results in the moveable element being
   *     offscreen, try to position instead left of the anchor.
   *
   * 3 - If still offscreen, slide the moveable element 
   *     up/down/left/right until it is visible. The amount of sliding
   *     is limited such that the moveable element always remains
   *     touching the anchor.
   *
   * @param {PositionOptions} options
   * @return {rect} position 
   */
  positioning.getPosition = function(options) {
    options = positioning.parseOptions_(options);
    var el = options.el;
    var anchor = options.anchor;

    // If element out of the DOM, give up.
    if (!el.offsetParent) {
      return new Rect(0, 0, 0, 0);
    }
    
    var anchorRect = positioning.rectInOtherCoordinateSpace(anchor, el);
    var clip = positioning.getClipRect(el);

    // Step 1: Find Ideal Position
    // --------------------------------------
    var rect = positioning.getIdealPosition(options);


    // Step 2: If Clips: Flip X/Y Corners
    // --------------------------------------

    // Below Anchor & Clips Bottom or
    // Above Anchor & Clips Top
    var flipY =
        (rect.top >= anchorRect.bottom && rect.bottom > clip.bottom) ||
        (rect.bottom <= anchorRect.top && rect.top < clip.top);

    // Left of Anchor and Clips Left or
    // Right of Anchor and Clips Right
    var flipX = 
        (rect.left <= anchorRect.left && rect.left < clip.left) ||
        (rect.right >= anchorRect.right && rect.right > clip.right);

    if (flipX || flipY) {
      var flippedConfig = {
        el: el,
        anchor: anchor,
        anchorCorner: options.anchorCorner.copy(),
        corner: options.corner.copy(),
      };

      if (flipX) {
        flippedConfig.corner.flipX();
        flippedConfig.anchorCorner.flipX();
      }

      if (flipY) {
        flippedConfig.corner.flipY();
        flippedConfig.anchorCorner.flipY();
      }

      rect = positioning.getIdealPosition(flippedConfig);
    }


    // Step 3: If Still Clips: Try Sliding

    // Portion Below Anchor and Clips Bottom --> Slide Up
    if (rect.bottom > anchorRect.bottom && rect.bottom > clip.bottom) {
      rect.shiftBottom(Math.max(anchorRect.bottom, clip.bottom));
    }

    // Portion Above Anchor and Clips Top --> Slide Down
    if (rect.top < anchorRect.top && rect.top < clip.top) {
      rect.shiftTop(Math.min(anchorRect.top, clip.top));
    }

    // Portion Left of Anchor and Clips Left --> Slide Right
    if (rect.left < anchorRect.left && rect.left < clip.left) {
      rect.shiftLeft(Math.min(anchorRect.left, clip.left));
    }

    // Portion Right of Anchor and Clips Right --> Slide Left
    if (rect.right > anchorRect.right && rect.right > clip.right) {
      rect.shiftRight(Math.max(anchorRect.right, clip.right));
    }

    return rect;
  };


  /**
   * Given a set of positioning options, returns the ideal
   * rectangle where the moveable element could be placed
   * relative to it's offset parent such that the two corners
   * are touching.
   *
   * Does NOT take int account visibility on the screen. The ideal
   * position, may be partially or entirelly off the edge of the
   * viewport.
   *
   * @param {PositionOptions} options
   * @return {Rect} ideal position
   */
  positioning.getIdealPosition = function(options) {
    options = positioning.parseOptions_(options);
    var parent = options.el.offsetParent;
    var el = options.el;
    var anchor = options.anchor;

    // Find where the anchor is relative to the moveable element.
    var anchorRect = positioning.rectInOtherCoordinateSpace(anchor, el);
    var anchorPoint = anchorRect.cornerToPoint(options.anchorCorner);

    // Determine where the moveable element is.
    var elRect = Rect.fromElementSize(el);
    var elPoint = elRect.cornerToPoint(options.corner);

    // Determine the difference between the two corner points.
    // The moveable element will need to move this amount to be positioned there.
    var moveAmount = anchorPoint.copy().sub(elPoint);

    elRect.add(moveAmount);

    return elRect;
  };



  /**
   * Given an element, returns a Clipping Rectangle that defines
   * the dimensions in the elements coordinate spaces that are visible
   * on screen to the user.
   * @param {Element} el
   */
  positioning.getClipRect = function(el) {
    var rect = new Rect(0, 0, Infinity, Infinity);

    // TODO(scott): Be smarter here and climb the dom
    // looking the first parent element containing the offset
    // parent that contains a non-default css overflow value.
    // For now I'm just using the window viewport.

    // Create a clipping rect based on the viewport.
    var scrollY = window.pageYOffset;
    var scrollX = window.pageXOffset;
    var body = document.body;

    rect.top = Math.max(rect.top, scrollY);
    rect.left = Math.max(rect.left, scrollX);
    rect.bottom = Math.min(rect.bottom, scrollY + window.innerHeight);
    rect.right = Math.min(rect.right, scrollX + window.innerWidth);

    // Convert the clipping rect into the elements coordinate space.
    var elCoord = positioning.pageOffset(el.offsetParent);
    var diff = new Point(0, 0).sub(elCoord);

    return rect.add(diff);
  };


  /**
   * Returns a rectangle describing the bounds of Element 1, but in
   * Element 2's coordinate space.
   *
   * If both Element 1 and 2 have the same offset parent, this is
   * equivalent to Rect.fromElement(el1);
   *
   * @param {Element} el1 the element to get the rect for
   * @param {Element} el2 the element whose coordinate space to use
   * @return {Rect} A rectangle describing el1s bounds in el2s coord space
   */
  positioning.rectInOtherCoordinateSpace = function(el1, el2) {
    var coordSpaceDiff = positioning.coordinateSpaceDifference(el1, el2);
    return Rect.fromElement(el1).add(coordSpaceDiff);
  };


  /**
   * Given two elements, returns the difference between their two
   * coordinates spaces in viewport space.
   *
   * Elements topOffset and leftOffset positions are always relative
   * to the closest offsetParent. Two elements may have two different
   * offset parents, meaning that they are giving top/left coordinates
   * in two entirely different coordinate spaces. This function determines
   * the difference between the two coordinates spaces so points can
   * be converted between them.
   */
  positioning.coordinateSpaceDifference = function(el1, el2) {
    // TODO(baileys): Take into account border/margin/padding
    // as needed.
    var parent1Pos = positioning.pageOffset(el1.offsetParent || document.body);
    var parent2Pos = positioning.pageOffset(el2.offsetParent || document.body);
    return parent1Pos.sub(parent2Pos);
  };

  /**
   * Returns an elements top/left position relative to the
   * very top/left of the document body.
   */
  positioning.pageOffset = function(el) {
    var bounds = el.getBoundingClientRect();
    var scrollX = window.pageXOffset;
    var scrollY = window.pageYOffset;

    return new Point(
        bounds.left + scrollX,
        bounds.top + scrollY);
  };


  /**
   * Returns a version of {PositionOptions} with any corners specified
   * as strings into Corner objects.
   */
  positioning.parseOptions_ = function(options) {
    // Options already in valid format? Don't do anything.
    if (options.corner instanceof Corner &&
        options.anchorCorner instanceof Corner) {
      return options;
    }

    // Parse needed corners.
    var corner = options.corner instanceof Corner ?
        options.corner : Corner.fromString(options.corner);

    var anchorCorner = options.anchorCorner instanceof Corner ?
        options.anchorCorner : Corner.fromString(options.anchorCorner);

    return {
      el: options.el,
      anchor: options.anchor,
      corner: corner,
      anchorCorner: anchorCorner,
    };
  };


  /**
   * Given a map of css property names to numbers, creates a
   * new object with 'px' appended to each.
   */
  positioning.toCss = function(cssMap) {
    var converted = {};
    for (key in cssMap) {
      converted[key] = cssMap[key] + 'px';
    }
    return converted;
  }

  return positioning;
});
