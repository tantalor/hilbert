function hilbert(canvas, opt_w, opt_h) {
  var w = opt_w || 1200;
  var h = opt_h || 1200;
  
  canvas.width = w;
  canvas.height = h;
  canvas.style.width = (w / devicePixelRatio) + "px";
  canvas.style.height = (h / devicePixelRatio) + "px";
  
  var ctx = canvas.getContext('2d');
  
  // Transform (Left, Top, Right, Bottom)
  scale(ctx, w, h); // (0, 0, w, h) -> (0, 0, 1, 1)
  ctx.translate(.5, .5); // (0, 0, 1, 1) -> (-.5, -.5, .5, .5)
  scale(ctx, .5, -.5); // (-.5, -.5, .5, .5) -> (-1, 1, 1, -1)
  
  var i = 0;
  function iter() {
    ctx.clearRect(-1, -1, 2, 2);
    step(ctx, i++).then(iter);
  }
  
  return new Promise(function(resolve) {
    requestAnimationFrame(resolve);
  }).then(iter);
}

function scale(ctx, dx, dy) {
  ctx.scale(dx, dy);
  ctx.lineWidth /= Math.abs(dx);
}

function step(ctx, n) {
  var k = 1/2;
  var p = (1 - k) * Math.pow(2, -n+1);
  
  if (n == 0) {
    return new Promise(function (resolve) {
      requestAnimationFrame(function() {
        ctx.beginPath();
        ctx.moveTo(-k, -k);
        ctx.lineTo(-k, k);
        ctx.lineTo(k, k);
        ctx.lineTo(k, -k);
        ctx.stroke();
        resolve();
      });
    });
  }
  
  // Scale Down
  scale(ctx, .5, .5);

  // Bottom Left
  ctx.save();
  ctx.translate(-1, -1);
  ctx.scale(1, -1);
  ctx.rotate(-Math.PI/2);
  
  return step(ctx, n-1).then(function() {
    ctx.restore();

    // Left Connection
    ctx.beginPath();
    ctx.moveTo(-2+p, -p);
    ctx.lineTo(-2+p, p);
    ctx.stroke();

    // Top Left
    ctx.save();
    ctx.translate(-1, 1);
    return step(ctx, n-1);
  }).then(function() {
    ctx.restore();
    
    // Top Connection
    ctx.beginPath();
    ctx.moveTo(-p, p);
    ctx.lineTo(p, p);
    ctx.stroke();

    // Top Right
    ctx.save();
    ctx.translate(1, 1);
    return step(ctx, n-1);
  }).then(function() {
    ctx.restore();
    
    // Bottom Connection
    ctx.beginPath();
    ctx.moveTo(2-p, p);
    ctx.lineTo(2-p, -p);
    ctx.stroke();

    // Bottom Right
    ctx.save();
    ctx.translate(1, -1);
    ctx.scale(1, -1);
    ctx.rotate(Math.PI/2);
    return step(ctx, n-1);
  }).then(function() {
    ctx.restore();

    // Scale Up
    scale(ctx, 2, 2);
  });
}
