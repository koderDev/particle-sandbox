//purano, unoptimized
// function createParticle(x, y) {
//   return {
//     x,
//     y,
//     vx:(Math.random() - 0.5) * 6,
//     vy: (Math.random() - 0.5) * 6,
//     size:Math.random() * parseFloat(sizeSlider.value) + 6,
//     mass: 1,
//     // hue: Math.random() * 360,
//     hue:COLOR_SCHEMES[currentScheme]()
//   };
// }

function createParticle(x,y){
  const p = particlePool.length>0?particlePool.pop():{}
  p.x=x
  p.y=y
  p.vx=(Math.random()-0.5)*6
  p.vy=(Math.random()-0.5)*6
  p.size=Math.random()*parseFloat(sizeSlider.value)+6
  p.mass=1
  p.hue=COLOR_SCHEMES[currentScheme]()
  p.isBubble=false
  p.grabbed=false
  p._origSize=p.size
  return p

}


function updateParticle(p) {
  if (p.grabbed) return

  if (p.isBubble) {
    p.vx +=(Math.random() - 0.5) * 0.1  
    p.vx *=0.98
    p.vy *= 0.98

    p.x += p.vx
    p.y += p.vy

    // walls bata bounce hunxa halka halka
    if (p.x - p.size < 0) { p.x = p.size; p.vx *= -0.5 }
    if (p.x + p.size > canvas.width) { p.x = canvas.width - p.size; p.vx *= -0.5 }
    if (p.y - p.size < 0) { p.y = p.size; p.vy *= -0.5 }
    if (p.y + p.size > canvas.height) { p.y = canvas.height - p.size; p.vy *= -0.3 }
    return
  }

  applyGravity(p)

  if(!slithermode){
    const friction=1-parseFloat(dampenSlider.value)
    p.vx*=friction
    p.vy*=friction
  }

  p.x += p.vx
  p.y += p.vy

  if(!orbitMode) wallBounce(p)
}

function drawParticle(p) {

  const margin=p.size*2.5
  //screen bhanda bahira no pticle
  if(
    p.x+margin<0 ||
    p.x-margin>canvas.width ||
    p.y+margin<0 ||
    p.y-margin>canvas.height
  ) return

  if (p.isBubble) {
    const r = p.size

    ctx.globalAlpha = 0.08
    ctx.fillStyle = `hsl(200, 80%, 90%)`
    ctx.beginPath()
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2)
    ctx.fill()

    ctx.globalAlpha = 0.5
    ctx.strokeStyle = `rgba(180, 220, 255, 0.8)`
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2)
    ctx.stroke()

    ctx.globalAlpha = 0.35
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)"
    ctx.beginPath()
    ctx.arc(p.x - r * 0.3, p.y - r * 0.3, r * 0.25, 0, Math.PI * 2)
    ctx.fill()

    ctx.globalAlpha =0.15
    ctx.fillStyle = "rgba(255,255,255,0.6)"
    ctx.beginPath()
    ctx.arc(p.x + r * 0.25, p.y + r * 0.25, r * 0.1, 0, Math.PI * 2)
    ctx.fill()

    ctx.globalAlpha =1
    return
  }
  const speed =Math.sqrt(p.vx * p.vx + p.vy * p.vy)
  const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size)
  
  if(currentScheme === "mono") {
    gradient.addColorStop(0,`hsl(0,0%,${70+speed*3}%)`)
    gradient.addColorStop(1, `hsl(0,0%,25%)`)
  } else {
    gradient.addColorStop(0, `hsl(${p.hue + speed * 5}, 100%, 70%)`)
    gradient.addColorStop(1, `hsl(${p.hue}, 100%, 40%)`)
  }
  
  ctx.globalAlpha =1
  ctx.fillStyle =gradient
  ctx.beginPath()
  ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
  ctx.fill()

  if (p.grabbed) {
    ctx.globalAlpha = 0.8
    ctx.strokeStyle = "#fff"
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size + 4, 0, Math.PI * 2)
    ctx.stroke()
    ctx.globalAlpha = 1
  }
}

function resolveMergeOrCollide() {
  const cellSize = 80
  const grid = buildGrid(cellSize)
  const toRemove=new Set()

  grid.forEach((cell, key) => {
    const [gx, gy] =key.split(",").map(Number)

    // najeek ko cells matra check garxa
    const neighbors = []
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const n = grid.get(`${gx + dx},${gy + dy}`)
        if (n) neighbors.push(...n)
      }
    }

    for (let i = 0; i < cell.length; i++) {
      for (let j = 0; j < neighbors.length; j++) {
        const a = cell[i]
        const b = neighbors[j]
        if (a === b) continue
        if (!a || !b) continue
        if(toRemove.has(a)||toRemove.has(b)) continue

        const dx = b.x - a.x
        const dy = b.y - a.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        const minDist = a.size + b.size

        if (dist < minDist && dist > 0) {
          if (mergeMode && a.size + b.size <= 80 && Math.abs(a.hue - b.hue) < 30) {
            const totalMass = a.size + b.size
            a.vx = (a.vx * a.size + b.vx * b.size) / totalMass
            a.vy = (a.vy * a.size + b.vy * b.size) / totalMass
            a.size = Math.min(totalMass * 0.6, 80)
            a.hue = Math.random() * 360
            toRemove.add(b)
          } else {
            const angle = Math.atan2(dy, dx)
            const overlap = minDist - dist
            a.x -= Math.cos(angle) * overlap / 2
            a.y -= Math.sin(angle) * overlap / 2
            b.x += Math.cos(angle) * overlap / 2
            b.y += Math.sin(angle) * overlap / 2

            const nx = dx / dist
            const ny = dy / dist
            const relVx = a.vx - b.vx
            const relVy = a.vy - b.vy
            const dot = relVx * nx + relVy * ny
            if (dot > 0) {
              a.vx -= dot * nx
              a.vy -= dot * ny
              b.vx += dot * nx
              b.vy += dot * ny
            }
          }
        }
      }
    }
  })

  if(toRemove.size>0){
    for(const p of toRemove) recycleParticle(p)
    particles=particles.filter(p=>!toRemove.has(p))
  }
}

function buildGrid(cellSize) {
  const grid = new Map()
  particles.forEach(p => {
    const key = getGridKey(p.x, p.y, cellSize)
    if (!grid.has(key)) grid.set(key, [])
    grid.get(key).push(p)
  })
  return grid
}

function getGridKey(x, y, cellSize) {
  return `${Math.floor(x / cellSize)},${Math.floor(y / cellSize)}`
}


function wallBounce(p) {
  if (p.x - p.size < 0) {
    p.x = p.size;
    p.vx *= -0.7;
  }
  if (p.x + p.size > canvas.width) {
    p.x = canvas.width - p.size;
    p.vx *= -0.7;
  }
  if (p.y - p.size < 0) {
    p.y = p.size;
    p.vy *= -0.7;
  }
  if (p.y + p.size > canvas.height) {
    p.y = canvas.height - p.size;
    p.vy *= -0.7;
  }
}


function applyGravity(p) {
  if(zeroGravity) return
  if(orbitMode){
    return
  }
  const dir = gravityFlip ? -1 : 1;
  p.vy += dir * parseFloat(pullSlider.value) * 0.3;
}

function checkBubblePop()
{
  if(!bubbleMode) return
  for(let i=particles.length -1;i>=0;i--){
    const p = particles[i]
    if(!p.isBubble) continue

    const dx=mouse.x-p.x
    const dy=mouse.y-p.y
    const dist = Math.sqrt(dx*dx+dy*dy)

    if(dist<p.size+8){

      const px=p.x
      const py=p.y
      const psize=p.size

      // particles.splice(i,1) //purano code
      const removed=particles.splice(i,1)[0]
      recycleParticle(removed)

      if(bubbleMode && particles.filter(p=>p.isBubble).length===0){
        bubbleMode = false
        setModeState(bubblestate,false)
        hidePopup()
        particles.length=0;
        canvas.style.cursor="default"
        showToast("all bubbles popped!!🥳",true);
      }

      if(p.size>12){
        const splitAngle=Math.random()*Math.PI*2
        for(let s=0;s<2;s++){
          const angle = splitAngle+s*Math.PI+(Math.random() - 0.5)* 0.5
          const speed = Math.random() * 1.5 + 0.5
          particles.push({
            x:px,
            y: py,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 0.8,
            size: p.size * 0.55,
            mass: 1,
            hue: p.hue,
            isBubble: true
          })
        }
      }

            // pop shockwave
      shockwaves.push({ x: px, y: py, radius: 0, alpha: 0.6 })

    }
  }

}


function enableBubbleMode() {

  if(particles.length ===0){
    bubbleMode = false
    setModeState(bubblestate,false)
    showToast("add some particles first")
    return
  }
  if (particles.length > 80) {
    particles = particles.slice(particles.length - 80)
  }

  if(blackHole){
    blackHole=false
    setModeState(bhactive,false)
    bhAlpha=0
    canvas.style.cursor="default"
  }
  if(trailMode){
    trailMode=false
    setModeState(trailstate,false)
  }
  if(mergeMode){
    mergeMode=false
    setModeState(mergestate,false)
  }
  if(gravityFlip){
    gravityFlip=false
    setModeState(flipstate,false)
  }
  if(interactMode){
    interactMode=false
    setModeState(interactstate,false)
    hidePopup()
    canvas.style.cursor="default"
  }
  if(zeroGravity){
    zeroGravity=false
    setModeState(zerogravstate,false)
    pullSlider.value=pullSlider.dataset.saved || 0.9
    document.getElementById("pull-val").textContent=pullSlider.value
  }
  showToast("all modes turned off for bubble mode",null)
  

  particles.forEach(p => {
    p.isBubble = true
    p.vx = (Math.random() - 0.5) * 1.5
    p.vy = (Math.random() - 0.5) * 1.5
    p.size = Math.max(p.size, 20)  
  })

  canvas.style.cursor="ne-resize";
}

function disableBubbleMode() {
  particles.forEach(p => {
    p.isBubble = false
  })
  canvas.style.cursor="default"
}

function drawConnections() {
  if (!lineMode) return
  const cellSize = 100
  const grid = buildGrid(cellSize)
  const checked = new Set()

  for (let i = 0; i < particles.length; i++) particles[i]._idx = i

  ctx.globalAlpha=1

  grid.forEach((cell, key) => {
    const [gx, gy] = key.split(",").map(Number)
    const neighbors = []
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const n = grid.get(`${gx + dx},${gy + dy}`)
        if (n) neighbors.push(...n)
      }
    }

    cell.forEach(a => {
      neighbors.forEach(b => {
        if (a === b) return
        const ai=a._idx
        const bi=b._idx
        const pairKey=ai<bi?(ai<<16|bi):(bi << 16|ai)
        if (checked.has(pairKey)) return
        checked.add(pairKey)

        const dx = b.x - a.x
        const dy = b.y - a.y
        const distsq = dx * dx + dy * dy

        if (distsq < 10000) {
          const dist=Math.sqrt(distsq);
          const alpha = (1 - dist / 100) * 0.5
          ctx.globalAlpha = alpha
          ctx.strokeStyle = _getlineColor(a.hue,b.hue)
          ctx.lineWidth = 3
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(b.x, b.y)
          ctx.stroke()
        }
      })
    })
  })
  ctx.globalAlpha = 1
}

const _lineColorcache=new Map()
function _getlineColor(hueA,hueB){
  const key=(Math.round(hueA/5)*5)<<16|(Math.round(hueB/5)*5)
  if(_lineColorcache.has(key)) return _lineColorcache.get(key)
  const avg=Math.round((hueA+hueB)/2)
  const color=`hsl(${avg},100%,70%)`
  if(_lineColorcache.size>500) _lineColorcache.clear()
  _lineColorcache.set(key,color)
  return color
}

function spawnTrail(){
  if (!trailMode) return
  if (!isMouseDown) return
  if (interactMode) return
  if (particles.length >=MAX_PARTICLES) return
  for(let i=0;i<3;i++)
  {
    particles.push(createParticle(mouse.x,mouse.y))
  }
}