function Complex(a, b) {
    this.a = a
    this.b = b
}

Complex.prototype.square = function() {
    return new Complex(this.a * this.a - this.b * this.b, 2 * this.a * this.b)
}

Complex.prototype.square_assign = function() {
    let a_old = this.a
    this.a = a_old * a_old - this.b * this.b
    this.b = 2 * a_old * this.b
    return this
}

Complex.prototype.assign = function(a, b) {
    this.a = a
    this.b = b
}

Complex.prototype.add_assign = function(z) {
    this.a += z.a
    this.b += z.b
    return this
}

Complex.prototype.toString = function() {
    return '(' + this.a + ' + ' + this.b + 'i)'
}

Complex.prototype.clone = function() {
    return new Complex(this.a, this.b)
}

Complex.prototype.absolute_value_squared = function() {
    return this.a * this.a + this.b * this.b
}

function complex_sum(c, w) {
    return new Complex(c.a + w.a, c.b + w.b)
}

function maximize_canvas(id) {
    let canvas = document.getElementById(id)
    canvas.width = window.innerWidth
    canvas.style.width = '' + window.innerWidth + 'px'
    canvas.height = window.innerHeight
    canvas.style.height = '' + window.innerHeight + 'px'
}

// returns true if bounded, else a number between 0 and 1, where 0 means
// the function diverged quickly and 1 means the function diverged slowly
function bounded(c, iter) {
    let z = c.clone()
    // write directly into z to avoid reallocations
    for (let i=0; i < iter; i+=1) {
        z.square_assign().add_assign(c)
        if (z.absolute_value_squared() > 4) {
            return i / iter
        }
    }
    return true
}

function clamp(x, min, max) {
    return Math.max(Math.min(x, max), min)
}

function color_map(n) {
    let x = clamp(n, 0, 1) * 360
    return 'hsl(' + x + ', 100%, 80%)'
}

function make_pixel_to_graph(width, height, x1, x2, y1, y2) {
    let y_delta, x_delta, x_mid, y_mid, x_start, y_start
    y_delta = y2 - y1
    x_delta = x2 - x1
    if (width > height) {
        // then make width appear relative to height
        x_delta = y_delta / height * width
        x_mid = (x2 + x1) / 2
        x_start = x_mid - x_delta / 2
        y_start = y1
    } else {
        y_delta = x_delta / width * height
        y_mid = (y2 + y1) / 2
        y_start = y_mid - y_delta / 2
        x_start = x1
    }
    return function (z, xpx, ypx) {
        ypx = height - ypx
        z.assign(xpx / width * x_delta + x_start,
            ypx / height * y_delta + y_start)
    }
}

function zoom_around_point(width, height, zoom, a, b) {
    let x1 = a - 2 / zoom
    let x2 = a + 2 / zoom
    let y1 = b - 2 / zoom
    let y2 = b + 2 / zoom
    return make_pixel_to_graph(width, height, x1, x2, y1, y2)
}

function mandelbrot(ctx, iters, zoom, fill_diverged) {
    zoom = zoom || 1
    fill_diverged = fill_diverged || false;
    let {width, height} = ctx.canvas
    let z = new Complex(0, 0)
    let get_c = make_pixel_to_graph(width, height, -2, 1, -1, 1)
    for (let x=0; x < width; x+=1) {
        for (let y=0; y < height; y+=1) {
            get_c(z, x, y)
            let r = bounded(z, iters)
            if (r === true) {
                if (fill_diverged) {
                    ctx.fillStyle = "rgba(0, 0, 0, 1)"
                    ctx.fillRect(x, y, 1, 1)
                }
            } else {
                ctx.fillStyle = color_map(r)
                ctx.fillRect(x, y, 1, 1)
            }
        }
    }
}

const MAX_ITERS = 35;

const X = 0;
const Y = 0;

function once() {
    let canvas = document.getElementById("main-ctx")
    let ctx = canvas.getContext("2d")
    mandelbrot(ctx, MAX_ITERS)
}

function animate() {
    let canvas = document.getElementById("main-ctx")
    let ctx = canvas.getContext("2d")
    let iters = 1
    let handle
    function loop() {
        mandelbrot(ctx, iters)
        iters += 1
        if (iters >= MAX_ITERS) {
            clearInterval(handle)
        }
    }
    loop()
    handle = setInterval(loop, 100)
}

function zoom_animate() {
    let canvas = document.getElementById("main-ctx")
    let ctx = canvas.getContext("2d")
    let zoom = 1
    let handle
    function loop() {
        mandelbrot(ctx, MAX_ITERS, zoom, true)
        zoom *= 2
        if (zoom >= 50000) {
            clearInterval(handle)
            console.log("Ding!")
        }
    }
    loop()
    handle = setInterval(loop, 100)
}

maximize_canvas('main-ctx')
window.addEventListener('resize', function() {
    maximize_canvas('main-ctx')
})

animate()
// once()
// zoom_animate()
