
function Screen(canvas, width, height) {
    this.canvas = canvas
    canvas.width = width
    canvas.height = height
    this.width = width
    this.height = height
    this.ctx = canvas.getContext('2d')
}

Screen.prototype = {
    rect: function (x, y, w, h, color) {
        this.ctx.beginPath()
        this.ctx.fillStyle = color
        this.ctx.rect(x, y, w, h)
        this.ctx.fill()
    },
    circle: function (x, y, r, color) {
        this.ctx.beginPath()
        this.ctx.fillStyle = color
        this.ctx.arc(x, y, r, 0, TAU, false)
        this.ctx.fill();
    },
    clear: function () {
        this.ctx.clearRect(0, 0, this.width, this.height)
    }
}

