const canvas1 = document.getElementById('cnv1');
canvas1.width = 600;
canvas1.height = 600;


const ctx = canvas1.getContext('2d');

var method_id = 0;
var example_id = 0;
var N = 4;
var running = false;

const examples = [
    {
        ft_expr: '\\( f(x) = cos(x) \\)',
        ft: x => Math.cos(x),
        ft_eval_int: '\\( S = \\int_{0}^{1} cos(x)dx = \\left[ sin(x) \\right]_0^1 \\approx 0.8414 \\)',
        a: 0,
        b: 1,
        eval_int: Math.sin(1)
    },
    {
        ft_expr: '\\( f(x) = \\sqrt{x} \\)',
        ft: x => Math.sqrt(x),
        ft_eval_int: '\\( S = \\int_0^2 \\sqrt{x}dx = \\left[ \\frac{2}{3}x^{\\frac{3}{2}} \\right]_0^2 \\approx 1.8856 \\)',
        a: 0,
        b: 2,
        eval_int: Math.pow(2, 3/2) * 2/3
    }
]

const exprs = {
    ft_expr: document.getElementById('ft-expr'),
    ft_eval_int: document.getElementById('ft-eval-int'),
    ft_n: document.getElementById('ft-n'),
    ft_sn: document.getElementById('ft-sn'),
    ft_e: document.getElementById('ft-e')
}

var playButton = document.getElementById('play-btn');
playButton.onclick = function () {
    running = !running;
    playButton.innerHTML = running? '<i class="fas fa-pause"></i>':'<i class="fas fa-play"></i>';
}

function update_example(new_example_id) {
    example_id = new_example_id;
    running = false;
    N = 4;

    const example = examples[example_id];

    document.getElementById('tex-loading').classList.remove('d-none');
    document.getElementById('tex').classList.add('d-none');
    playButton.innerHTML = running? '<i class="fas fa-pause"></i>':'<i class="fas fa-play"></i>';

    exprs['ft_expr'].innerHTML = example['ft_expr'];
    exprs['ft_eval_int'].innerHTML = example['ft_eval_int'];
    exprs['ft_n'].innerHTML = Math.floor(N);
    exprs['ft_sn'].innerHTML = '?';
    exprs['ft_e'].innerHTML = '?';

    MathJax.Hub.Queue(["Typeset",MathJax.Hub, exprs['ft_expr']]);
    MathJax.Hub.Queue(["Typeset",MathJax.Hub, exprs['ft_eval_int']]);

    setTimeout(() => {
        document.getElementById('tex-loading').classList.add('d-none');
        document.getElementById('tex').classList.remove('d-none');
    }, 1000);
}

function update_method(new_method_id) {
    method_id = new_method_id;
    running = false;
    N = 4;
    exprs['ft_n'].innerHTML = Math.floor(N);
    exprs['ft_sn'].innerHTML = '?';
    exprs['ft_e'].innerHTML = '?';
}

window.onload = function () {
    update_example(0);
}


function repere() {
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#F5F5F5';
    ctx.moveTo(0, canvas1.height/2);
    ctx.lineTo(canvas1.width, canvas1.height/2);

    ctx.moveTo(canvas1.width/2, 0);
    ctx.lineTo(canvas1.width/2, canvas1.height);

    ctx.font = '12px roboto';
    ctx.fillStyle = '#F5F5F5';
    var rx = 280 / 4;
    var dx = 4, dy = 4;

    for (var i=-dx; i<=dx; i++) {
        if (i == 0) continue;
        ctx.fillText(i, 300 + i*rx, 320);
    }

    for (var i=-dy; i<=dy; i++) {
        if (i == 0) continue;
        ctx.fillText(-i, 280, 300 + i*rx);
    }

    ctx.stroke();
    ctx.closePath();
}

function int_using_rectangles(ft, a, b, n) {
    var dx = (b-a) / n;
    var s = 280/4;
    ctx.beginPath();
    ctx.strokeStyle = '#16FF00';
    ctx.lineWidth = 1;
    var y = 0, x = 0;
    var S = 0;
    for (var i=0; i<n; i++) {
        x = (a+dx*i);
        y = ft(x + dx);

        // console.log({dx, y, i, S});
        S += Math.abs(y * dx);
        ctx.rect(300 + x*s, 300 - y*s, dx*s, y*s);
    }
    ctx.stroke();
    ctx.closePath();
    return S;
}

function polynomial2params(x0, x1, x2, y0, y1, y2) {
    var a = ((x2-x0) * (y1-y0) - (x1-x0) * (y2-y0)) / ((x1*x1 - x0*x0) * (x2-x0) - (x2*x2 - x0*x0) * (x1-x0));

    var b = (y2 - y0 - a * (x2*x2 - x0*x0)) / (x2 - x0);

    var c = (y0 - a * x0*x0 - b * x0);

    return {a, b, c};
}

function int_using_simpsons_rule(ft, a, b, n) {
    var dx = (b-a) / n;
    var s = 280/4;
    ctx.beginPath();
    ctx.strokeStyle = '#00FFD1';
    ctx.lineWidth = 1;
    for (var i=1; i<n; i++) {
        var prev = [a + (i-1)*dx, ft(a + (i-1)*dx)];
        var current = [a + i*dx, ft(a + i*dx)];
        var next = [a + (i+1)*dx, ft(a + (i+1)*dx)];

        var eq = polynomial2params(prev[0], prev[1], current[0], current[1], next[0], next[1]);
        plot(x => eq.a * x*x + eq.b * x + eq.c, prev[0], next[0], ctx.strokeStyle);
    }
    ctx.stroke();
    ctx.closePath();

    var coeff = [4, 2];
    var S = ft(a) + ft(b);
    var x = a+dx;
    for (var i=0; i<n-2; i++) {
        x += dx;
        S += ft(x) * coeff[i%2];
    }
    return S * dx/3;
}

function plot(ft, a, b, fillStyle = 'red') {
    var n = 100;
    var dx = (b-a) / n;
    var s = 280/4;

    ctx.strokeStyle = fillStyle;
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(300 + a*s, 300 - ft(a)*s);
    for (var x = a+dx; x <= b; x+=dx) {
        ctx.lineTo(300 + x*s, 300 - ft(x)*s);
    }
    ctx.stroke();
    ctx.closePath();
}


function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas1.width, canvas1.height);
    repere();

    var ft = examples[example_id].ft, a = examples[example_id].a, b = examples[example_id].b;

    plot(ft, a, 4, '#FFEA20');
    var sn;
    if (method_id == 0) {
        sn = int_using_rectangles(ft, a, b, Math.floor(N));
    } else {
        sn = int_using_simpsons_rule(ft, a, b, Math.floor(N));
    }

    if (running) {
        exprs['ft_n'].innerHTML = Math.floor(N);
        exprs['ft_sn'].innerHTML = sn.toFixed(4);
        exprs['ft_e'].innerHTML = Math.abs(sn - examples[example_id].eval_int).toFixed(4);

        N += 0.04;
    }
}

animate();
