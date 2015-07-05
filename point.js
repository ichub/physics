(function () {
    "use strict";

    function Point(x, y) {
        this.pos = new phys.Vector(x, y);
        this.vel = phys.Vector.zero();
        this.highlighted = false;
        this.dragged = false;
    }

    Point.radius = 10;
    Point.friction = 0.01;
    Point.bounceResistance = 0.5;
    Point.airResistance = 1.025;
    Point.mass = 0.2;

    Point.prototype.update = function (context, adjust) {
        if (!this.dragged) {
            this.pos = this.pos.add(this.vel.multiply(adjust));
            this.vel = this.vel.add(new phys.Vector(0, Point.mass).multiply(adjust));
            this.vel = this.vel.divide(Point.airResistance);
        }

        this.collideWithWalls(context);
    };

    Point.prototype.draw = function (context) {
        if (this.highlighted) {
            context.fillStyle = '#CB99C9';
        }
        else {
            context.fillStyle = '#38d296';
        }

        context.beginPath();
        context.arc(this.pos.x, this.pos.y, Point.radius / 2, 0, 2 * Math.PI);
        context.fill();
    };

    Point.prototype.collideWithWalls = function (context) {
        if (this.pos.x < Point.radius / 2) { // if too far left.
            this.pos.x = Point.radius / 2;
            this.vel.x = Math.abs(this.vel.x) * (1 - Point.bounceResistance);
            this.vel.y *= 1 - Point.friction;
        }

        if (this.pos.y < Point.radius / 2) { // if too far up.
            this.pos.y = Point.radius / 2;
            this.vel.y = Math.abs(this.vel.y) * (1 - Point.bounceResistance);
            this.vel.x *= 1 - Point.friction;
        }

        if (this.pos.x > context.canvas.width - Point.radius / 2) { // if too far to the right.
            this.pos.x = context.canvas.width - Point.radius / 2;
            this.vel.x = Math.abs(this.vel.x) * -1 * (1 - Point.bounceResistance);
            this.vel.y *= 1 - Point.friction;
        }

        if (this.pos.y > context.canvas.height - Point.radius / 2) { // if too far to the bottom.
            this.pos.y = context.canvas.height - Point.radius / 2;
            this.vel.y = Math.abs(this.vel.y) * -1 * (1 - Point.bounceResistance);
            this.vel.x *= 1 - Point.friction;
        }
    };

    phys.Point = Point;
})(window.phys = window.phys || {});
