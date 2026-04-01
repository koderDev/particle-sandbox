function applyBlackHole() {
  if (bhAlpha <= 0) return;
  particles.forEach((p) => {
    const dx = mouse.x - p.x;
    const dy = mouse.y - p.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    if(dist>500) return
    const force = (2000 * bhAlpha) / (dist * dist);
    const nx=dx/dist
    const ny=dy/dist
    const tx=-ny
    const ty=nx

    const swirlStrength = Math.min(6000/(dist*dist),2);

    p.vx += (nx) * force+tx*swirlStrength;
    p.vy += (ny) * force + ty*swirlStrength;

    const speed = Math.sqrt(p.vx*p.vx+p.vy*p.vy)
    if(speed > 30 ){
      p.vx=(p.vx/speed)*30;
      p.vy=(p.vy/speed)*30;
    }
    if (dist < 80 && blackHole) {
      particles.splice(particles.indexOf(p), 1);
    }
  });
}

function drawBlackHole() {
  if (!blackHole && bhAlpha <= 0) return;

  if (blackHole && bhAlpha < 1) bhAlpha += 0.03;
  if (!blackHole && bhAlpha > 0) {
    bhAlpha -= 0.03;
    if(bhAlpha<=0) canvas.style.cursor="default";
  }
  bhAlpha = Math.max(0, Math.min(1, bhAlpha));

  const time = Date.now() * 0.002;

  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2 + time;
    const radius = 70 + Math.sin(time * 2 + i) * 8;
    const x = mouse.x + Math.cos(angle) * radius;
    const y = mouse.y + Math.sin(angle) * radius;
    const size = 5 + Math.sin(time * 3 + i) * 1.5;
    const hue = (i / 8) * 360;

    ctx.globalAlpha = bhAlpha * (0.6 + Math.sin(time + i) * 0.3);
    ctx.fillStyle = `hsl(${hue}, 100%, 70%)`;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = bhAlpha * 0.1;
    ctx.strokeStyle = `hsl(${hue}, 100%, 70%)`;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(mouse.x, mouse.y);
    ctx.stroke();
  }

  ctx.globalAlpha = bhAlpha;
  ctx.beginPath();
  ctx.arc(mouse.x, mouse.y, 35, 0, Math.PI * 2);
  ctx.fillStyle = "#000";
  ctx.fill();

  const glow = ctx.createRadialGradient(
    mouse.x,
    mouse.y,
    15,
    mouse.x,
    mouse.y,
    100,
  );
  glow.addColorStop(0, `rgba(0, 0, 0, ${bhAlpha})`); // black center
  glow.addColorStop(0.3, `rgba(90, 1, 178, ${0.62 * bhAlpha})`); // purple middd
  glow.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.beginPath();
  ctx.arc(mouse.x, mouse.y, 100, 0, Math.PI * 2); // 60 -> 100
  ctx.fillStyle = glow;
  ctx.fill();

  ctx.globalAlpha = 1;
}

function applyOrbit(){
  if(!orbitMode) return
  if(orbitAlpha<=0) return
  const orbitRadius=250

  const sun_rad = 50
  const exclusion_zone=sun_rad+20
  const GM=800
  const max_speed=12

  particles.forEach(p=>{
    const dx=p.x-mouse.x
    const dy=p.y-mouse.y
    const dist=Math.sqrt(dx*dx+dy*dy)||1
    
    const nx=dx/dist
    const ny=dy/dist

    if(dist<exclusion_zone)
    {
      p.x=mouse.x+nx*exclusion_zone
      p.y=mouse.y+ny*exclusion_zone
      const radialVel=p.vx*nx+p.vy*ny
      if(radialVel<0){
        p.vx-=radialVel*nx*1.5
        p.vy-=radialVel*ny*1.5
      }
      return
    }

    const tx=-ny
    const ty=nx
    
    if(dist>orbitRadius) {
        p.vx+=-nx*1.5*orbitAlpha
        p.vy+=-ny*1.5*orbitAlpha
        return
    }

    const tangentialSpeed = p.vx * tx + p.vy * ty
    const idealSpeed = Math.sqrt(GM / dist)
    const diff = idealSpeed - tangentialSpeed
    p.vx += tx * diff * 0.05 * orbitAlpha
    p.vy += ty * diff * 0.05 * orbitAlpha

    const centripetalForce = (tangentialSpeed * tangentialSpeed) / dist
    p.vx -= nx * centripetalForce * 0.05 * orbitAlpha
    p.vy -= ny * centripetalForce * 0.05 * orbitAlpha
    
    const speed=Math.sqrt(p.vx*p.vx+p.vy*p.vy)
    if(speed>max_speed){
      p.vx=(p.vx/speed)*max_speed
      p.vy=(p.vy/speed)*max_speed
    }

  })
}

function drawOrbit(){
  // if(!orbitMode) return
    if (!orbitMode && orbitAlpha <= 0) return;

    if (orbitMode && orbitAlpha < 1) orbitAlpha += 0.03;
    if (!orbitMode && orbitAlpha > 0) {
      orbitAlpha -= 0.03;
      if(orbitAlpha<=0) canvas.style.cursor="default";
    }
    orbitAlpha = Math.max(0, Math.min(1, orbitAlpha));


  const time=Date.now()*0.01

  ctx.save()
  ctx.translate(mouse.x, mouse.y)
  ctx.rotate(time * 0.5)
  ctx.globalAlpha = 0.2 * orbitAlpha
  ctx.strokeStyle = "#fd8"
  ctx.lineWidth = 1
  ctx.setLineDash([8, 8])
  ctx.beginPath()
  ctx.arc(0, 0, 200, 0, Math.PI * 2)
  ctx.stroke()
  ctx.setLineDash([])
  ctx.restore()

  const coronaLayers = [
    { r: 160, alpha: 0.09*orbitAlpha },
    { r: 100, alpha: 0.08*orbitAlpha },
    { r: 80, alpha: 0.15*orbitAlpha },
  ]
  coronaLayers.forEach(({ r, alpha }) => {
    const grad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, r)
    grad.addColorStop(0, `rgba(255, 200, 50, ${orbitAlpha})`)
    grad.addColorStop(1, "rgba(0,0,0,0)")
    ctx.globalAlpha = orbitAlpha
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.arc(mouse.x, mouse.y, r, 0, Math.PI * 2)
    ctx.fill()
  })


  const sunGrad = ctx.createRadialGradient(
    mouse.x - 5, mouse.y - 5, 2,
    mouse.x, mouse.y, 50
  )
  sunGrad.addColorStop(0, "#fff5c0")   // bright white center
  sunGrad.addColorStop(0.5, "#ffd84d") // yellow
  sunGrad.addColorStop(0.8, "#ff9a00") // orange
  sunGrad.addColorStop(1, "#ff5500")   // red edge

  ctx.globalAlpha = orbitAlpha
  ctx.fillStyle = sunGrad
  ctx.beginPath()
  ctx.arc(mouse.x, mouse.y, 50, 0, Math.PI * 2)
  ctx.fill()

  ctx.save()
  ctx.translate(mouse.x, mouse.y)
  ctx.rotate(time * 0.8)
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + time
    const r = 30 + Math.sin(time * 3 + i) * 3
    ctx.globalAlpha = 0.15 * orbitAlpha
    ctx.fillStyle = "#fff"
    ctx.beginPath()
    ctx.arc(Math.cos(a) * r, Math.sin(a) * r, 10, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()

  ctx.globalAlpha = 1

}

function applyCyclones() {
  if (!cycloneMode || cyclones.length === 0) return

  const EXCLUSION_ZONE = 60 //cant enter this zone

  particles.forEach(p => {
    cyclones.forEach(c => {
      const dx = p.x - c.x
      const dy = p.y - c.y
      const dist = Math.sqrt(dx * dx + dy * dy) || 1
      if(dist<EXCLUSION_ZONE){
        const nx=dx/dist
        const ny=dy/dist
        p.x=c.x+nx*EXCLUSION_ZONE
        p.y=c.y+ny*EXCLUSION_ZONE

        const radialVel=p.vx*nx+p.vy*ny
        if(radialVel<0){
          p.vx-=radialVel*nx;
          p.vy-=radialVel*ny
        }
        return
      }

      if (dist > CYCLONE_RADIUS) return

      const nx = dx / dist
      const ny = dy / dist
      const tx = -ny
      const ty = nx

      const influence = 1 - dist / CYCLONE_RADIUS

      const spinStrength = 4
      p.vx += tx * spinStrength * influence
      p.vy += ty * spinStrength * influence

      const radialVel = p.vx * nx + p.vy * ny

      const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
      const centripetalNeeded = (speed * speed) / Math.max(dist, 10)
      const inwardForce = centripetalNeeded * 0.4 + 1.5 * influence

      p.vx -= nx * inwardForce
      p.vy -= ny * inwardForce

      if (radialVel > 0) {
        p.vx -= nx * radialVel * 0.6
        p.vy -= ny * radialVel * 0.6
      }

      const finalSpeed = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
      const maxSpeed = 8 + influence * 4
      if (finalSpeed > maxSpeed) {
        p.vx = (p.vx / finalSpeed) * maxSpeed
        p.vy = (p.vy / finalSpeed) * maxSpeed
      }
    })
  })
}

function drawCyclones()
{
  if(!cycloneMode && cyclones.length===0) return
  const time=Date.now()*0.001
  cyclones.forEach((c,ci)=>{
    [1,0.6,0.35].forEach((radiusFrac,i)=>{
      const r = CYCLONE_RADIUS * radiusFrac
      const speed = (i + 1) * 0.4
      ctx.save()
      ctx.translate(c.x, c.y)
      ctx.rotate(time * speed + ci)
      ctx.globalAlpha = 0.12 + i * 0.06
      ctx.strokeStyle = "#a8f"
      ctx.lineWidth = 1.5
      ctx.setLineDash([6, 10])
      ctx.beginPath()
      ctx.arc(0, 0, r, 0, Math.PI * 2)
      ctx.stroke()
      ctx.setLineDash([])
      ctx.restore()
    })

    const grad = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, 40)
    grad.addColorStop(0, "rgba(180, 100, 255, 0.35)")
    grad.addColorStop(1, "rgba(0,0,0,0)")
    ctx.globalAlpha = 1
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.arc(c.x, c.y, 40, 0, Math.PI * 2)
    ctx.fill()

    ctx.globalAlpha=0.7
    ctx.fillStyle="#c8a0ff"
    ctx.beginPath()
    ctx.arc(c.x,c.y,5,0,Math.PI*2)
    ctx.fill()
    ctx.globalAlpha=1

  })
}

function drawCharge() {
  if (!explosionMode || !chargedParticle || !chargeStart) return
  const t = Math.min((Date.now() - chargeStart) / MAX_CHARGE_MS, 1)
  const p = chargedParticle

  p.size = p._origSize + p._origSize * t * 3

  const pulse = Math.sin(Date.now() * 0.015) * 0.2
  const glowRadius = p.size + 20 + t * 40

  const grad = ctx.createRadialGradient(p.x, p.y, p.size * 0.5, p.x, p.y, glowRadius)
  grad.addColorStop(0, `rgba(255, ${Math.floor(200 - t*180)}, 0, ${0.6 + pulse})`)
  grad.addColorStop(0.5, `rgba(255, 80, 0, ${0.3 + t*0.2})`)
  grad.addColorStop(1, "rgba(0,0,0,0)")
  ctx.globalAlpha = 1
  ctx.fillStyle = grad
  ctx.beginPath()
  ctx.arc(p.x, p.y, glowRadius, 0, Math.PI * 2)
  ctx.fill()

  if (t > 0.8) {
    ctx.globalAlpha = (Math.sin(Date.now() * 0.025) + 1) * 0.5
    ctx.strokeStyle = "#f00"
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size + 8, 0, Math.PI * 2)
    ctx.stroke()
    ctx.globalAlpha = 1
  }
}

function drawShockwaves() {
  shockwaves.forEach((s) => {
    s.radius += 6;
    s.alpha -= 0.025;

    ctx.globalAlpha = s.alpha;
    ctx.strokeStyle = `rgba(255, 255, 255, ${s.alpha})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
    ctx.stroke();

    // second inner ring
    ctx.globalAlpha = s.alpha * 0.4;
    ctx.strokeStyle = `rgba(180, 100, 255, ${s.alpha})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.radius * 0.6, 0, Math.PI * 2);
    ctx.stroke();
  });

  ctx.globalAlpha = 1;
  shockwaves = shockwaves.filter((s) => s.alpha > 0);
}

function applyRepel() {
  if (repelAlpha <= 0) return
  const repelRadius = 180
  const repelStrength = 6

  particles.forEach(p => {
    const dx = p.x - mouse.x
    const dy = p.y - mouse.y
    const dist = Math.sqrt(dx * dx + dy * dy) || 1
    if (dist > repelRadius) return
    const influence = (1 - dist / repelRadius)
    p.vx += (dx / dist) * repelStrength * influence * repelAlpha
    p.vy += (dy / dist) * repelStrength * influence * repelAlpha
  })
}

function drawRepel() {
  if (!repelMode && repelAlpha <= 0) return
  if (repelMode && repelAlpha < 1) repelAlpha += 0.05
  if (!repelMode && repelAlpha > 0) repelAlpha -= 0.05
  repelAlpha = Math.max(0, Math.min(1, repelAlpha))
  if (repelAlpha <= 0) return

  const time = Date.now() * 0.002
  const pulse = Math.sin(time * 3) * 10

  ctx.save()
  ctx.translate(mouse.x, mouse.y)

  for (let i = 0; i < 3; i++) {
    const r = 60 + i * 40 + pulse
    ctx.globalAlpha = repelAlpha * (0.15 - i * 0.04)
    ctx.strokeStyle = "#f84"
    ctx.lineWidth = 1.5
    ctx.setLineDash([5, 5])
    ctx.beginPath()
    ctx.arc(0, 0, r, 0, Math.PI * 2)
    ctx.stroke()
    ctx.setLineDash([])
  }

  const r=14
  ctx.globalAlpha=repelAlpha*0.9
  ctx.strokeStyle="#f84"
  ctx.lineWidth=2.5

  ctx.beginPath()
  ctx.arc(0,0,r,0,Math.PI*2)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(-r*Math.cos(Math.PI/4), -r*Math.sin(Math.PI/4))
  ctx.lineTo(r*Math.cos(Math.PI/4),r*Math.sin(Math.PI/4))
  ctx.stroke()


  const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, 50)
  grad.addColorStop(0, `rgba(255, 130, 60, ${0.2 * repelAlpha})`)
  grad.addColorStop(1, "rgba(0,0,0,0)")
  ctx.globalAlpha = 1
  ctx.fillStyle = grad
  ctx.beginPath()
  ctx.arc(0, 0, 50, 0, Math.PI * 2)
  ctx.fill()

  ctx.globalAlpha = repelAlpha * 0.8
  ctx.fillStyle = "#f84"
  ctx.beginPath()
  ctx.arc(0, 0, 4, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()
  ctx.globalAlpha = 1
}

function enableDiscoMode() {
  if (discoWarningOpen) return

  if(currentScheme==="mono"){
    discoWarningOpen=false
    discoMode=false
    setModeBtn("d",false)
    showToast("heads up! disco mode doesn't work with mono palette",false)
    return
  }


  discoWarningOpen = true

  const warning = document.createElement("div")
  warning.id = "disco-warning"
  warning.innerHTML = `
    <div id="disco-warning-content">
      <span id="disco-warning-title">epilepsy warning</span>
      <span id="disco-warning-text">disco mode causes rapidly flashing colors. do not proceed if you are sensitive to flashing lights.</span>
      <div id="disco-warning-buttons">
        <button id="disco-confirm">i understand, <br>let's discooo (Y)</button>
        <button id="disco-cancel">cancel (N)</button>
      </div>
    </div>
  `
  document.body.appendChild(warning)
  requestAnimationFrame(() => warning.classList.add("visible"))

  function confirmDisco() {
    discoWarningOpen = false
    warning.classList.remove("visible")
    setTimeout(() => { warning.remove(); startDisco() }, 80)
    cleanup()
  }

  function cancelDisco() {
    discoWarningOpen = false
    discoMode = false
    setModeBtn("d", false)
    warning.classList.remove("visible")
    setTimeout(() => warning.remove(), 80)
    cleanup()
  }

  function warningKeyHandler(e) {
    if (discoWarningOpen) {
      e.stopImmediatePropagation()
      if (e.key === "y" || e.key === "Y") confirmDisco()
      if (e.key === "n" || e.key === "N" || e.key === "Escape") cancelDisco()
    }
  }

  function cleanup() {
    document.getElementById("disco-confirm")?.removeEventListener("click", confirmDisco)
    document.getElementById("disco-cancel")?.removeEventListener("click", cancelDisco)
    window.removeEventListener("keydown", warningKeyHandler, true)
  }

  document.getElementById("disco-confirm").addEventListener("click", confirmDisco)
  document.getElementById("disco-cancel").addEventListener("click", cancelDisco)
  window.addEventListener("keydown", warningKeyHandler, true)
}

function startDisco() {
  if(bubbleMode){
    bubbleMode=false
    setModeBtn("n",false)
    disableBubbleMode()
    hidePopup()
  }

  showToast("disco mode ON",true)
  discoInterval=setInterval(()=>{
    if(!discoMode){
      clearInterval(discoInterval)
      return
    }
    particles.forEach(p=>{
      p.hue=COLOR_SCHEMES[currentScheme]()
    })
  },80)
}

function stopDisco() {
  if(discoInterval){
    clearInterval(discoInterval)
    discoInterval=null
  }
  showToast("disco mode OFF", false);
} 

function applySlitherPhysiks() { 
  if(!slithermode) return
  slithertime+=0.018;
  particles.forEach((p,i)=>{

    //unique phase harek particle ko lagi
    const phasei=i*1.3
    const phaseii= i*0.7
    const phaseiii =i*2.1
    const wiggleX=Math.sin(slithertime*2.2+phasei)*0.12
    const wiggleY=Math.sin(slithertime*1.7+phaseii)*0.12
    const slowx= Math.cos(slithertime*0.8+phaseiii)*0.06
    const slowy=Math.sin(slithertime*0.6+phasei)*0.06
    p.vx+=wiggleX+slowx
    p.vy+=wiggleY+slowy

    if(Math.random()<0.03){
      const angle=Math.random()*Math.PI*2
      const kick= Math.random()*0.8+0.3
      p.vx+=Math.cos(angle)*kick
      p.vy+=Math.sin(angle)*kick
    }

    if(Math.random()*0.4){
      p.vx += (Math.random()-0.5)*3
      p.vy+=(Math.random()-0.5)*3
    }

    const speed= Math.sqrt(p.vx*p.vx+p.vy*p.vy)
    const speedmaxm=2.67
    if(speed>speedmaxm){
      p.vx= (p.vx/speed)*speedmaxm
      p.vy=(p.vy/speed)*speedmaxm
    }
    p.vx *=0.96 //spontaneous dekhiyos bhanera halya ho
    p.vy*=0.96
  })

}
