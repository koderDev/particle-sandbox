let fps=0
let lastfpstime=performance.now()

function loop() {
  fpsCount++;
  const now=performance.now()
  if(now-lastfpstime>=1000){
    fps=fpsCount;
    fpsCount=0;
    lastfpstime=now
    document.getElementById("fps-counter").textContent=`fps: ${fps}`;
  }

  if(!screenshotPaused){

    const currentalpha=slithermode?0.04:(trailMode?0.15:1);
    ctx.globalAlpha = currentalpha;
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    resolveMergeOrCollide()

    applyOrbit();
    drawStory();

    particles.forEach((p) => {
      updateParticle(p);
      drawParticle(p);
    });

    if (lineMode) drawConnections();
    applyBlackHole();
    applyCyclones();
    applySlitherPhysiks()
    drawOrbit()
    drawBlackHole();
    drawCyclones();
    checkBubblePop()
    drawRepel();
    applyRepel();
    drawShockwaves();
    drawCharge();
    pcount.textContent = particles.length;

    const count = particles.length;
    for(const m of MILESTONES) {
      if(count>=m&&lastMilestone<m){
        lastMilestone=m
        const msgs = {
          50: "50 particles! warming up!!",
          100: "100 particles! getting chotic!",
          200: "200 particles! pure CHAOS",
          300: "300 particles! MADNESS!!",
          400: "400 particles! MAXIMUM CHAOSSSSS"
        }
        showToast(msgs[m],true)

        const pcountEle = document.getElementById("pcount")
        pcountEle.style.color=MILESTONE_COLORS[m]
        pcountEle.style.transition="color 0.5s ease"

        setTimeout(()=>{
          pcountEle.style.color=""
        },3000)
      }
    } 
    
    if(count<50) lastMilestone=0

  }

  requestAnimationFrame(loop);
}

if(!isMobile) setModeBtn("s", true)
else {
  storyMode=false;
}
loop();
