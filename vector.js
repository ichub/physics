(function() {
    "use strict";

    function Vector(x, y) {
        this.x = x;
        this.y = y;
    }

    Vector.zero = function () {
        return new Vector(0, 0);
    };

    Vector.prototype.add = function (other) {
        return new Vector(this.x + other.x, this.y + other.y);
    };

    Vector.prototype.multiply = function (scalar) {
        return new Vector(this.x * scalar, this.y * scalar);
    };

    Vector.prototype.divide = function (scalar) {
        return this.multiply(1.0 / scalar);
    };

    Vector.prototype.subtract = function (other) {
        return this.add(other.multiply(-1));
    };

    Vector.prototype.length = function () {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    };

    Vector.prototype.normalize = function () {
        var length = this.length();

        if (length > 0) {
            return this.divide(length);
        }

        // to prevent divide by zero errors. this isn't here to be accurate
        // but rather to facilitate a nice simulation experience.
        return new Vector(Math.random() - 0.5, Math.random() - 0.5);
    };

    phys.Vector = Vector;
})(window.phys = window.phys || {});
