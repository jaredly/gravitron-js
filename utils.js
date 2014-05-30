
var TAU = 2 * Math.PI

function extend(dest) {
    [].slice.call(arguments, 1).map(function (src) {
        for (var name in src) {
            dest[name] = src[name]
        }
    })
    return dest
}

function vec_as_pos(mag, ang) {
    return {
        x: Math.cos(ang) * mag,
        y: Math.sin(ang) * mag
    }
}

function pos_as_vec(x, y) {
    return {
        mag: Math.sqrt(x*x + y*y),
        angle: Math.atan2(y, x)
    }
}

function Vector(mag, angle) {
    this.mag = mag
    this.angle = angle
}

Vector.from_pos = function (pos) {
    var vec = pos_as_vec(pos.x, pos.y)
    return new Vector(vec.mag, vec.angle)
}

Vector.prototype = {
    push: function (mag, ang) {
        if (arguments.length === 1) {
            ang = mag.angle
            mag = mag.mag
        }
        var me = this.as_pos()
        var ot = vec_as_pos(mag, ang)
        var nw = pos_as_vec(me.x - ot.x, me.y - ot.y)
        this.mag = nw.mag
        this.angle = nw.angle
    },
    as_pos: function () {
        return vec_as_pos(this.mag, this.angle)
    }
}

function Position(x, y) {
    this.x = x
    this.y = y
}

Position.prototype = {
    as_vec: function () {
        return pos_as_vec(this.x, this.y)
    },
    move: function (x, y) {
        if (arguments.length === 1) {
            y = x.y
            x = x.x
        }
        this.x += x
        this.y += y
    },
    to: function (x, y) {
        if (arguments.length === 1) {
            y = x.y
            x = x.x
        }
        return new Position(this.x - x, this.y - y)
    },
    len: function () {
        return Math.sqrt(this.x*this.x + this.y*this.y)
    }
}

