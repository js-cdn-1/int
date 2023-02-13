const canvas = document.querySelector('canvas');
canvas.width = 600;
canvas.height = 600;


const ctx = canvas.getContext('2d');


function repere() {
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#000';
    ctx.moveTo(0, canvas.height/2);
    ctx.lineTo(canvas.width, canvas.height/2);

    ctx.moveTo(canvas.width/2, 0);
    ctx.lineTo(canvas.width/2, canvas.height);

    ctx.font = '12px roboto';
    ctx.fillStyle = '#000';
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

function renderPoint(x, y) {
    ctx.beginPath();
    ctx.fillStyle = 'red';
    ctx.arc(x, y, 3, 0, 2*Math.PI, false);
    ctx.fill();
    ctx.closePath();
}


var Points = [];
var eq = {};

document.getElementById('reset-btn').onclick = function () {
    Points = [];
    var m = document.getElementById('m');
    var tex = "\\( f(x) = ?\\)";
    m.innerHTML = tex;
    MathJax.Hub.Queue(["Typeset",MathJax.Hub, m]);
}

canvas.addEventListener('mousedown', evt => {
    if (evt.button !== 0 || Points.length >= 3) return;
    var rect = canvas.getBoundingClientRect();
    Points.push({
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    })

    if (Points.length === 3) {
        var x0 = (Points[0].x-300) * 4/280, y0 = (300-Points[0].y) * 4/280;
        var x1 = (Points[1].x-300) * 4/280, y1 = (300-Points[1].y) * 4/280;
        var x2 = (Points[2].x-300) * 4/280, y2 = (300-Points[2].y) * 4/280;
        var _eq = find_params(x0, x1, x2, y0, y1, y2);
        eq.a = _eq.a;
        eq.b = _eq.b;
        eq.c = _eq.c;
        update_ft_tex(eq.a, eq.b, eq.c);
    }
})

function find_params(x0, x1, x2, y0, y1, y2) {
    var a = ((x2-x0) * (y1-y0) - (x1-x0) * (y2-y0)) / ((x1*x1 - x0*x0) * (x2-x0) - (x2*x2 - x0*x0) * (x1-x0));

    var b = (y2 - y0 - a * (x2*x2 - x0*x0)) / (x2 - x0);

    var c = (y0 - a * x0*x0 - b * x0);

    return {a, b, c};
}

function update_ft_tex(a, b, c) {
    var m = document.getElementById('m');
    var tex = "\\( f(x) = " + a.toFixed(2) + "x^2 " + (b>0 ?"+":"") + b.toFixed(2) + "x " + (c>0 ?"+":"") + c.toFixed(2) +  "\\)";
    m.innerHTML = tex;
    MathJax.Hub.Queue(["Typeset",MathJax.Hub, m]);
}


function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    repere();

    Points.forEach(p => {
        renderPoint(p.x, p.y);
    })

    if (Points.length === 3) {
        plot(x => eq.a * x*x + eq.b * x + eq.c, -4, 4, 'dodgerblue');
    }
}

animate();