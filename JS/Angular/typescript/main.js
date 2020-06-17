var Point = /** @class */ (function () {
    function Point(_x, _y) {
        this._x = _x;
        this._y = _y;
    }
    Point.prototype.draw = function () {
        console.log('X: ' + this._x + ', Y: ' + this._y);
    };
    Object.defineProperty(Point.prototype, "x", {
        get: function () {
            return this._x;
        },
        set: function (value) {
            if (value < 0) {
                throw new Error('value cannot be less than 0.');
            }
            this._x = value;
        },
        enumerable: false,
        configurable: true
    });
    Point.prototype.getDistance = function (another) {
        // ...
    };
    return Point;
}());
var pt = new Point(1, 2);
var x = pt.x;
pt.x = 10;
pt.draw();
