
function Circle (pos, vel, acc, size, color, game) {
    this.pos = pos
    this.vel = vel
    this.acc = acc
    this.size = size
    this.color = color
    this.game = game
    this.max_speed = 0
}

Circle.prototype = {
    solid: true,
    step: function () {
        if (!this.vel) return
        if (this.acc) {
            this.vel.push(this.acc)
        }
        if (this.max_speed && Math.abs(this.vel.mag) > this.max_speed) {
            this.vel.mag = (this.vel.mag > 0 ? 1 : -1) * this.max_speed
        }
        this.pos.move(this.vel.as_pos());
    },
    draw: function (screen) {
        screen.circle(this.pos.x, this.pos.y, this.size, this.color)
        var x = false
          , y = false
        if (this.pos.x < 0 - this.size) {
            x = 0
        } else if (this.pos.x > screen.width + this.size) {
            x = 1
        }
        if (this.pos.y < 0 - this.size) {
            y = 0
        } else if (this.pos.y > screen.height + this.size) {
            y = 1
        }
        if (x === false && y === false) return
        if (x === false) {
            x = this.pos.x
        } else {
            x *= screen.width
        }
        if (y === false) {
            y = this.pos.y
        } else {
            y *= screen.height
        }
        screen.rect(x-5, y-5, 10, 10, this.color)
    },
    hit: function (pain) {
        this.die()
    },
    die: function () {
        this.game.remove(this)
    },
    gravity: function (other) {
        var to_other = Vector.from_pos(this.pos.to(other.pos))
        if (to_other.mag <= this.size + other.size) {
            other.die()
        }
        this.acc = to_other
        this.acc.mag = 20 / this.acc.mag
    },
    collide_with: function () {
        return false
    }
}

function Explosion(pos, size, color, game) {
    this.pos = pos
    this.size = size
    this.timer = 0
    this.max = 20
    this.color = color
    Circle.call(this, pos, new Vector(0, 0), null, size, color, game)
}

Explosion.prototype = extend(Object.create(Circle.prototype), {
    step: function () {
        this.timer += 1
        if (this.timer >= this.max) this.die()
    },
    draw: function (screen) {
        var scale = this.timer / this.max + 1
        screen.ctx.globalAlpha = 2 - scale
        screen.circle(this.pos.x, this.pos.y, this.size * scale, this.color)
        screen.ctx.globalAlpha = 1
    }
})


function Bullet(pos, vel, size, color, parent, game) {
    this.damage = 1
    this.safe = true
    this.parent = parent
    Circle.call(this, pos, vel, null, size, color, game)
    this.max_speed = 5
}

Bullet.prototype = extend(Object.create(Circle.prototype), {
    step: function () {
        this.gravity(this.game.player)
        Circle.prototype.step.call(this, this.game)
        if (this.safe && !this.game.isColliding(this, this.parent)) {
            this.safe = false
        }
    },
    die: function () {
        this.game.remove(this)
        this.game.add(new Explosion(
            this.pos, this.size, this.color, this.game
        ))
    },
    collide_with: function (other) {
        if (other instanceof Bullet) {
            this.hit(other.damage)
            other.hit(this.damage)
            return true
        }
    }
})

function Enemy (pos, size, color, waiting, game) {
    this.waiting = waiting * game.fps
    Circle.call(this, pos, null, null, size, color, game)
}

Enemy.prototype = extend(Object.create(Circle.prototype), {
    step: function () {
        Circle.prototype.step.call(this, this.game)
        if (this.game.frames && this.game.frames % this.waiting === 0) {
            this.fire()
        }
    },
    fire: function () {
        var dir = this.pos.to(this.game.player.pos).as_vec()
        dir.mag = - this.size - 20
        var shift = vec_as_pos(dir.mag, dir.angle)
        this.game.add(new Bullet(
            new Position(this.pos.x + shift.x, this.pos.y + shift.y),
            new Vector(3, dir.angle + TAU/2),
            5,
            'green',
            this,
            this.game
        ))
    },
    collide_with: function (other) {
        if (other instanceof Bullet) {
            if (other.safe && other.parent === this) return true
            this.hit(other.damage)
            other.die()
            return true
        }
    }
})

function FollowEnemy (pos, size, color, waiting, game) {
    this.waiting = waiting * game.fps
    Circle.call(this, pos, new Vector(0, 0), null, size, color, game)
    this.max_speed = .5
}

FollowEnemy.prototype = extend(Object.create(Enemy.prototype), {
    step: function () {
        var to_other = Vector.from_pos(this.pos.to(this.game.player.pos))
        to_other.mag = .05
        this.acc = to_other
        Enemy.prototype.step.call(this)
    }
})

function Player (pos, size, game) {
    Circle.call(this, pos, new Vector(0, 0), new Vector(0, 0), size, 'red', game)
}

Player.prototype = extend(Object.create(Circle.prototype), {
    step: function () {
        var push = .3
        if (this.game.buttons.up) {
            this.vel.push(new Vector(push, TAU/4))
        }
        if (this.game.buttons.right) {
            this.vel.push(new Vector(push, TAU/2))
        }
        if (this.game.buttons.left) {
            this.vel.push(new Vector(push, 0))
        }
        if (this.game.buttons.down) {
            this.vel.push(new Vector(push, TAU*3/4))
        }
        var max = 7
        if (this.vel.mag > max) {
            this.vel.mag = max;
        }
        if (this.vel.mag < -max) {
            this.vel.mag = -max;
        }
        this.vel.mag *= .98
        if (Math.abs(this.vel.mag) < .1) {
            this.vel.mag = 0
        }
        Circle.prototype.step.call(this, this.game)
    },
    collide_with: function (other) {
        this.die()
    }
})

function keyName(key) {
    return {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    }[key]
}

var rooms = [{
    name: 'First',
    objects: [
        [Enemy, [new Position(100, 100), 10, 'green', 5]],
    ]
}, {
    name: 'Second',
    objects: [
        [Enemy, [new Position(100, 100), 10, 'green', 5]],
        [Enemy, [new Position(400, 400), 10, 'green', 5]],
    ]
}, {
    name: 'Third',
    objects: [
        [Enemy, [new Position(100, 100), 10, 'orange', 2]],
        [Enemy, [new Position(400, 400), 10, 'green', 5]],
    ]
}, {
    name: 'Third',
    objects: [
        [FollowEnemy, [new Position(100, 100), 10, 'blue', 3]],
    ]
}]

function Game (canvas, fps) {
    this.screen = new Screen(canvas, 500, 500)
    this.fps = fps || 60
    this.buttons = {
        up: false, down: false, left: false, right: false
    }
    this.objects = []
    this.player = new Player(new Position(250, 250), 10, this)
    this.objects.push(this.player)
    this.collisions = {}
    this.waitForRoom = false
    this.listen()
}

Game.prototype = {
    reset: function () {
        this.objects = []
        this.player = new Player(new Position(250, 250), 10, this)
        this.objects.push(this.player)
        this.collisions = {}
        this.waitForRoom = false
        this.run()
    },
    run: function () {
        this.room = 0
        this.last = Date.now()
        this.frames = 0
        this.loadRoom(this.room)
        this._loop_interval = setInterval(this.loop.bind(this), 1000 / this.fps)
    },
    queueRoom: function () {
        this.waitForRoom = 60
    },
    nextRoom: function () {
        this.room++
        if (this.room >= rooms.length) {
            return this.over();
        }
        this.loadRoom(this.room)
    },
    listen: function () {
        window.addEventListener('keydown', this.onKeyDown.bind(this))
        window.addEventListener('keyup', this.onKeyUp.bind(this))
    },
    onKeyDown: function (e) {
        var button = keyName(e.keyCode)
        if (!button) return
        e.preventDefault()
        this.buttons[button] = true
    },
    onKeyUp: function (e) {
        var button = keyName(e.keyCode)
        if (!button) return
        this.buttons[button] = false
    },
    calcCollisions: function () {
        var distance
          , objs = this.objects.slice()
        this.collisions = {}
        for (var i=0; i<objs.length; i++) {
            if (!objs[i].solid) continue
            for (var j=i+1; j<objs.length; j++) {
                if (!objs[j].solid) continue
                distance = objs[i].pos.to(objs[j].pos).len()
                if (distance <= objs[i].size + objs[j].size) {
                    this.collisions[i + ':' + j] =
                    this.collisions[j + ':' + i] = true
                    if (!objs[i].collide_with(objs[j])) {
                        objs[j].collide_with(objs[i])
                    }
                }
            }
        }
    },
    loadRoom: function (num) {
        var that = this
        // this.objects = [this.player]
        this.livingEnemies = 0
        rooms[num].objects.map(function (defs) {
            var constructor = defs[0].bind.apply(defs[0], [null].concat(defs[1].concat([that])))
            that.add(new constructor())
        })
    },
    over: function () {
        clearInterval(this._loop_interval)
        this._loop_interval = null
        setTimeout(this.reset.bind(this), 1000)
    },
    isColliding: function (one, two) {
        var i = this.objects.indexOf(one)
          , j = this.objects.indexOf(two)
        return this.collisions[i + ':' + j]
    },
    loop: function () {
        this.calcCollisions()
        this.step()
        this.draw()
        this.frames += 1
        if (this.frames % 1000 == 1) {
            console.log(this.frames / (Date.now() - this.last))
        }
        if (this.waitForRoom !== false) {
            this.waitForRoom--
            if (this.waitForRoom <= 0) {
                this.waitForRoom = false
                this.nextRoom()
            }
        }
    },
    step: function () {
        this.objects.forEach(function (o) {o.step()})
    },
    draw: function () {
        var screen = this.screen
        screen.clear()
        this.objects.forEach(function (o) {o.draw(screen)})
    },
    remove: function (what) {
        if (what === this.player) this.over()
        var i = this.objects.indexOf(what)
        if (i === -1) return
        if (what instanceof Enemy) {
            this.livingEnemies--
        }
        this.objects.splice(i, 1)
        if (this.livingEnemies <= 0) {
            this.queueRoom()
        }
    },
    add: function (what) {
        if (what instanceof Enemy) {
            this.livingEnemies++
        }
        this.objects.push(what)
    }
}

