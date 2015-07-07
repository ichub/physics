(function (phys) {
    "use strict";

    function Simulation() {
        this.$canvas = $('#canvas');
        this.canvas = this.$canvas.get(0);
        this.context = this.canvas.getContext('2d');

        // minimum mouse distance between the mouse
        // and a point before it can become dragged
        this.mouseThreshold = 50;

        this.points = [];
        this.springs = [];

        // whether or not dragging right now
        this.dragPressed = false;

        // for macs, control clicking is equivalent
        // to right clicking, so keep track of
        // whether or not it's pressed here
        this.controlPressed = false;

        // a reference to the currently dragged point
        // null if no dragged
        this.dragged = null;

        // mouse position
        this.ms = phys.Vector.zero();

        this.lastFrameTime = null;

        this.initialize();
    }

    // we need to set the canvas width to its actual width,
    // otherwise the canvas stretches and shrinks its content
    // when it is resized
    Simulation.prototype.adjustCanvasSize = function () {
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;
    };

    Simulation.prototype.initialize = function () {
        this.adjustCanvasSize();

        var that = this;

        this.$canvas.mousedown(function (e) {
            that.onMouseDown(e);
        });

        this.$canvas.mousemove(function (e) {
            that.onMouseMove(e);
        });

        // prevent right clicks on the canvas
        this.$canvas.on('contextmenu', function (e) {
            e.preventDefault();
            return false;
        });

        $(window).resize(function () {
            that.adjustCanvasSize();
        });

        $(document.body).keydown(function (e) {
            if (e.keyCode == 17) { // ctrl
                that.controlPressed = true;
            }
            else if (e.keyCode == 68) { // d
                that.dragPressed = true;

                if (this.dragged == null && that.points.length > 0) {
                    var distance = that.ms.subtract(that.points[0].pos).length();
                    var currentClosest = that.points[0];

                    // find the point that is the closest to the mouse
                    for (var i = 0; i < that.points.length; i++) {
                        var newDistance = that.points[i].pos.subtract(that.ms).length();

                        if (newDistance < distance) {
                            distance = newDistance;
                            currentClosest = that.points[i];
                        }
                    }

                    if (distance < that.mouseThreshold) {
                        // set the dragged point to be dragged
                        that.dragged = currentClosest;
                        that.dragged.dragged = true;

                        // set the dragged point's position to the
                        // mouse position and set its velocity
                        // to zero
                        that.dragged.pos = that.ms;
                        that.dragged.vel = phys.Vector.zero();
                    }
                }
            }
        });

        // stop dragging if the 'd' key is released
        $(document.body).keyup(function (e) {
            if (e.keyCode == 17) { // ctrl
                that.controlPressed = false;
            }
            else if (e.keyCode == 68) { // d
                that.dragPressed = false;

                if (that.dragged) {
                    that.dragged.dragged = false;
                    that.dragged = null;
                }
            }
        });
    };

    Simulation.prototype.onMouseMove = function (e) {
        var offset = this.$canvas.offset();

        this.ms = new phys.Vector(e.pageX - offset.left, e.pageY - offset.top);

        this.handleMouseMove();
    };

    Simulation.prototype.onMouseDown = function (e) {
        // left mouse button
        if (e.which == 1) {
            // control+click equals right click
            if (this.controlPressed) {
                this.handleRightClick(this.ms.x, this.ms.y);
            }
            else {
                this.handleLeftClick(this.ms.x, this.ms.y);
            }
        }
        // right mouse button
        else if (e.which == 3) {
            this.handleRightClick(this.ms.x, this.ms.y);
        }
    };

    // the right click action is to select points within
    // this.mouseThreshold pixels away and then connect
    // all the selected points with springs
    Simulation.prototype.handleRightClick = function (x, y) {
        // get already highlighted point, if there is one
        var highlighted = this.points.filter(function (point) {
            return point.highlighted;
        });

        for (var i = 0; i < this.points.length; i++) {
            if (this.points[i].pos.subtract(new phys.Vector(x, y)).length() < this.mouseThreshold) {
                this.points[i].highlighted = true;

                highlighted.push(this.points[i]);
            }
        }

        // if there is more than one highlighted point, connect them
        // with springs, making sure that the spring doesn't already exist
        if (highlighted.length > 1) {
            for (var i = 0; i < highlighted.length; i++) {
                for (var j = i + 1; j < highlighted.length; j++) {
                    if (!this.springExists(highlighted[i], highlighted[j])) {
                        this.springs.push(new phys.Spring(highlighted[i], highlighted[j]));
                    }
                }

                // unhilight the point after we're done with it
                highlighted[i].highlighted = false;
            }
        }
    };

    Simulation.prototype.handleLeftClick = function (x, y) {
        this.points.push(new phys.Point(x, y));
    };

    Simulation.prototype.handleMouseMove = function () {
        // we only care about mouse movements
        // if we are dragging
        if (this.dragPressed) {
            if (this.dragged) {
                this.dragged.pos = this.ms;
                this.dragged.vel = phys.Vector.zero();
            }
        }
    };

    Simulation.prototype.springExists = function (first, second) {
        for (var i = 0; i < this.springs.length; i++) {
            if ((this.springs[i].first == first && this.springs[i].second == second)
                || (this.springs[i].second == first && this.springs[i].first == second)) {
                return true;
            }
        }

        return false;
    };

    Simulation.prototype.start = function () {
        this.lastFrameTime = this.lastFrameTime || new Date();
        var currentTime = new Date();

        // difference between the time that the last frame
        // was run and the current time in milliseconds
        var delta = currentTime - this.lastFrameTime;

        // number that we multiply displacements by to
        // compensate for going faster/slower than 60fps
        var adjust = (1000 / 60) / delta;

        this.tick(adjust);

        this.lastFrameTime = currentTime;

        var that = this;

        requestAnimationFrame(function () {
            that.start();
        });
    };

    Simulation.prototype.tick = function (adjust) {
        this.clear();

        // first we updated the game state
        for (var i = 0; i < this.springs.length; i++) {
            this.springs[i].update(this.context, adjust);
        }

        for (var i = 0; i < this.points.length; i++) {
            this.points[i].update(this.context, adjust);
        }

        // then we draw it to the screen
        for (var i = 0; i < this.springs.length; i++) {
            this.springs[i].draw(this.context);
        }

        for (var i = 0; i < this.points.length; i++) {
            this.points[i].draw(this.context);
        }
    };

    Simulation.prototype.clear = function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    };

    phys.Simulation = Simulation;
})(window.phys = window.phys || {});

window.onload = function () {
    var sim = new phys.Simulation();

    sim.start();
};