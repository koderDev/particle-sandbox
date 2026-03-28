function loop() {
  ctx.globalAlpha = trailMode ? 0.15 : 1;
  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  resolveMergeOrCollide();
  applyOrbit();
  drawStory();

  particles.forEach((p) => {
    updateParticle(p);
    drawParticle(p);
  });
  if (lineMode) drawConnections();
  
  applyBlackHole();
  applyCyclones();
  drawOrbit()
  drawBlackHole();
  drawCyclones();
  checkBubblePop()
  
  drawShockwaves();
  drawCharge();
  pcount.textContent = particles.length;

  requestAnimationFrame(loop);
}

setModeBtn("s", true)
loop();
