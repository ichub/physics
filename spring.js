(function () {
    "use strict";

    function Spring(firstPoint, secondPoint) {
        this.first = firstPoint;
        this.second = secondPoint;
        this.restLength = 100;
        this.springyness = 16;
    }

    Spring.prototype.length = function () {
        return this.second.pos.subtract(this.first.pos).length();
    };

    Spring.prototype.draw = function (context) {
        context.strokeStyle = '#DEA5A4';
        context.beginPath();
        context.moveTo(this.first.pos.x, this.first.pos.y);
        context.lineTo(this.second.pos.x, this.second.pos.y);
        context.stroke();
    };

    Spring.prototype.update = function () {
        var difference = this.second.pos.subtract(this.first.pos);
        var distance = this.length();

        var extension = distance - this.restLength;
        var vel = difference.normalize().divide(this.springyness).multiply(extension);

        this.first.vel = this.first.vel.add(vel);
        this.second.vel = this.second.vel.subtract(vel);
    };

    phys.Spring = Spring;
})(window.phys = window.phys || {});