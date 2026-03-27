const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particles = [];
let mouse = { x: window.innerWidth/2, y: window.innerHeight/2 };

const MAX_PARTICLES = 420;

const pullSlider = document.getElementById("pull");
const dampenSlider = document.getElementById("dampen");
const sizeSlider = document.getElementById("size");
const countSlider = document.getElementById("count");

const pcount = document.getElementById("pcount");

pcount.textContent = particles.length;


// helper function — add this at top
function setModeState(el, isOn) {
  el.textContent = isOn ? "ON" : "off"
  el.className = isOn ? "mode-on" : "mode-off"
  if (!isOn) el.style.color = "#afafaf"
}

document.querySelectorAll(".reset-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const slider = document.getElementById(btn.dataset.id)
    const display = document.getElementById(`${btn.dataset.id}-val`)
    slider.value = btn.dataset.default
    if (display) display.textContent = btn.dataset.default
  })
})

const stories = [
  { text: "welcome to particle sandbox.", trigger: null },
  { text: "click anywhere to spawn particles.", trigger: "click" },
  { text: "nice! right click to create a shockwave.", trigger: null },
  { text: "press G to flip gravity.", trigger: "g" },
  { text: "watch them float... press G again to bring them back.", trigger: "g" },
  { text: "press B to open a black hole at your cursor.", trigger: "b" },
  { text: "move your cursor around. they follow you and feed on particles.", trigger: null },
  { text: "press B again to close it.", trigger: "b" },
  { text: "press M to turn on merge mode.", trigger: "m" },
  { text: "now spawn more particles. same colors will merge.", trigger: null },
  { text: "done merging? press M to turn it off.", trigger: "m" },
  { text: "press L to connect nearby particles with lines.", trigger: "l" },
  { text: "looks like a neural network right? press L to turn off.", trigger: "l" },
  { text: "press I to enter interact mode.", trigger: "i" },
  { text: "grab a particle (click and drag) and throw it around.", trigger: null },
  { text: "press I again to go back to normal.", trigger: "i" },
  { text: "press T for trail mode.", trigger: "t" },
  { text: "click to spawn more particles and see their trails.", trigger: null },
  { text: "press T again to turn it off.", trigger: "t" },
  { text: "press Z for zero gravity.", trigger: "z" },
  { text: "now right click to get them floating around in the void.", trigger: null },
  { text: "press Z again to turn this off.", trigger: "z" },
  { text: "press N for bubble mode.", trigger: "n" },
  { text: "hover over bubbles to pop them.", trigger: null },
  { text: "press N to exit bubble mode.", trigger: "n" },
  { text: "you have learned everything.", trigger: null },
  { text: "now you can build your own universe.", trigger: null },
  { text: "we won't tell you what to do anymore.", trigger: null },
  { text: "press S to dismiss this. see you on the other side.", trigger: "s" },
]

let currentStory = 0
let storyAlpha = 0
let storyState = "fadein"
let storyTimer = 0
let storyMode = true
let waitingForTrigger = false
let storyTriggered = false


function drawStory() {
  if (!storyMode) return
  if (currentStory >= stories.length) return

  const story = stories[currentStory]

  if (story.trigger && !storyTriggered) {
    waitingForTrigger = true
    storyAlpha = 0.5 + Math.sin(Date.now() * 0.003) * 0.2
    ctx.save()
    ctx.globalAlpha = storyAlpha
    ctx.fillStyle = "#e1e1e1"
    ctx.font = "32px Space Grotesk"
    ctx.textAlign = "center"
    ctx.fillText(story.text, (canvas.width / 2)+120, canvas.height / 2)

    // hint arrow pulse
    ctx.globalAlpha = storyAlpha * 0.5
    ctx.fillStyle = "#aaa"
    ctx.font = "14px Space Grotesk"
    ctx.fillText("[ do it to continue ]", (canvas.width / 2)+120, canvas.height / 2 + 40)
    ctx.restore()
    return
  }

  if(storyTriggered) return
  // no trigger or trigger fired — normal fade in/hold/out
  waitingForTrigger = false
  storyTriggered = false

  if (storyState === "fadein") {
    storyAlpha += 0.025
    if (storyAlpha >= 1) { storyAlpha = 1; storyState = "hold" }
  } else if (storyState === "hold") {
    storyTimer++
    if (storyTimer > 100) { storyState = "fadeout"; storyTimer = 0 }
  } else if (storyState === "fadeout") {
    storyAlpha -= 0.025
    if (storyAlpha <= 0) {
      storyAlpha = 0
      storyState = "fadein"
      currentStory = (currentStory + 1) % stories.length
    }
  }

  

  ctx.save()
  ctx.globalAlpha = storyAlpha * 0.85
  ctx.fillStyle = "#e1e1e1"
  ctx.font = "32px Space Grotesk"
  ctx.textAlign = "center"
  ctx.fillText(story.text, (canvas.width / 2)+120, canvas.height / 2)
  ctx.restore()
}


function fireTrigger(key) {
  if (!storyMode) return
  if (currentStory >= stories.length) return
  const story = stories[currentStory]
  if (story.trigger === key && waitingForTrigger) {
    storyTriggered = true
    // advance after short delay
    setTimeout(() => {
      storyState = "fadein"
      storyAlpha = 0
      currentStory++
      storyTriggered = false
      waitingForTrigger = false
    }, 600)
  }
}


const sliders = [
  { slider: pullSlider, display: document.getElementById("pull-val") },
  { slider: dampenSlider, display: document.getElementById("dampen-val") },
  { slider: sizeSlider, display: document.getElementById("size-val") },
  { slider: countSlider, display: document.getElementById("count-val") },
];
sliders.forEach(({ slider, display }) => {
  slider.addEventListener("input", () => (display.textContent = slider.value));
});

canvas.addEventListener("mousemove", (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

canvas.addEventListener("click", (e) => {
  if(interactMode) return
  if (bubbleMode) return
  if(orbitMode) {
    showToast("can't spawn in orbit mode!",false);
    return
  }
  if (blackHole) return
  if(particles.length >=MAX_PARTICLES)
  {
    showToast("particle limit reached!",false)
    return
  }
  const count = Math.floor(parseFloat(countSlider.value) / 10);
  for (let i = 0; i < count; i++) {
    particles.push(createParticle(e.clientX, e.clientY));
  }

  fireTrigger("click") 
});

canvas.addEventListener("contextmenu", (e) => {
  e.preventDefault();

  particles.forEach((p) => {
    const dx = p.x - e.clientX;
    const dy = p.y - e.clientY;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    p.vx += (dx / dist) * 10;
    p.vy += (dy / dist) * 10;
  });
  fireTrigger("rightclick");
  shockwaves.push({ x: e.clientX, y: e.clientY, radius: 0, alpha: 1 });
});

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

function createParticle(x, y) {
  return {
    x,
    y,
    vx: (Math.random() - 0.5) * 6,
    vy: (Math.random() - 0.5) * 6,
    size: Math.random() * parseFloat(sizeSlider.value) + 6,
    mass: 1,
    hue: Math.random() * 360,
  };
}

let blackHole = false;
let trailMode = false;
let mergeMode = false;
let gravityFlip = false;
let shockwaves = [];


let lineMode = false; // on by default
const linestate = document.getElementById("linestate");
let toastTimeout=null
let interactMode = false;
let grabbedParticle = null;
const interactstate = document.getElementById("interactstate");
const popup = document.getElementById("popup")
let bubbleMode = false
const bubblestate = document.getElementById("bubblestate");

let zeroGravity=false
const zerogravstate=document.getElementById("zerogravstate");
const trailstate=document.getElementById("trailstate");
const mergestate = document.getElementById("mergestate");
const bhactive = document.getElementById("bhactive");
const storystate = document.getElementById("storyActive");
const flipstate = document.getElementById("flipstate");
let bhAlpha = 0;

let orbitMode = false
const orbitstate=document.getElementById("orbitstate")


window.addEventListener("keydown", (e) => {
  if (bubbleMode && e.key !== "n" && e.key !== "N" && e.key !== "s" && e.key !== "S") {
    showToast("exit bubble mode first")
    return
  }

  if (e.key === "b" || e.key === "B") {
    if(interactMode){
      showToast("exit interact mode first")
      return
    }
    blackHole = !blackHole;
    setModeState(bhactive, blackHole)
    if (blackHole) bhactive.style.color = "#a0f"
    canvas.style.cursor=blackHole?"none":"default"
    showToast(blackHole ? "black hole ON" : "black hole OFF", blackHole)
    
    fireTrigger("b");
  }

  if (e.key === "t" || e.key === "T") {
    trailMode = !trailMode
    setModeState(trailstate, trailMode)
    if (trailMode) trailstate.style.color = "#fa0"
    showToast(trailMode ? "trail mode ON" : "trail mode OFF", trailMode)
    fireTrigger("t");
    

    if(trailMode){
      if(lineMode){
        lineMode=false
        linestate.textContent="off"
        linestate.style.color="#555"
        showToast("line mode turned off to save performance")
      }
    }
  }

  if (e.key === "s" || e.key === "S") {
    storyMode = !storyMode;
    setModeState(storystate, storyMode)
    showToast(storyMode ? "tutorial ON" : "tutorial OFF", storyMode)
    fireTrigger("s");

    if(storyMode){
      currentStory=0
      storyAlpha=0
      storyState="fadein"
      storyTimer=0
      waitingForTrigger=false
      storyTriggered=false
    }
  }

  if (e.key === "m" || e.key === "M") {
    mergeMode = !mergeMode;
    setModeState(mergestate, mergeMode)
    if (mergeMode) mergestate.style.color = "#0f0"
    showToast(mergeMode ? "merge mode ON" : "merge mode OFF", mergeMode)
    fireTrigger("m");
  }

  if (e.key === "g" || e.key === "G") {
    gravityFlip = !gravityFlip;
    setModeState(flipstate, gravityFlip)
    if (gravityFlip) flipstate.style.color = "#0ff"
    showToast(gravityFlip ? "gravity flip ON" : "gravity flip OFF", gravityFlip)
    fireTrigger("g");
  }

  if (e.key === "l" || e.key === "L") {
    if(trailMode){
      showToast("exit trail mode first")
      return
    }
    lineMode = !lineMode;
    setModeState(linestate, lineMode)
    showToast(lineMode ? "line mode ON" : "line mode OFF", lineMode)
    fireTrigger("l");
  }

  if (e.key === "i" || e.key === "I") {
    if (blackHole) { showToast("turn off black hole first"); return }
    interactMode = !interactMode
    setModeState(interactstate, interactMode)
    if (interactMode) interactstate.style.color = "#4cf"

    if (interactMode) {
      showPopup(`grab & throw particles. you can't create new particles in interact mode. press 'I' to exit`)
      canvas.style.cursor = "grab"
    } else {
      hidePopup()
      if (grabbedParticle) grabbedParticle = null
      canvas.style.cursor = "default"
    }

    showToast(interactMode ? "interact mode ON" : "interact mode OFF", interactMode)
    fireTrigger("i")
  }

  if (e.key === "z" || e.key === "Z") {
    zeroGravity = !zeroGravity
    setModeState(zerogravstate, zeroGravity)
    if (zeroGravity) zerogravstate.style.color = "#ff0"

    if (zeroGravity) {
      pullSlider.dataset.saved = pullSlider.value
      pullSlider.value = 0
    } else {
      const saved = pullSlider.dataset.saved || 0.9
      pullSlider.value = saved
    }

    showToast(zeroGravity ? "zero gravity ON" : "zero gravity OFF", zeroGravity)
    fireTrigger("z")
  }

  if(e.key==="n"||e.key==="N"){
    bubbleMode=!bubbleMode;
    setModeState(bubblestate,bubbleMode)
    if (bubbleMode) {
      bubblestate.style.color = "#7df"
      enableBubbleMode()
      showPopup(`hover over the bubbles to pop them. you can't create new particles in bubble mode. press "N" to exit. pop all the bubbles IF U CAN ;)`)
    } else {
      disableBubbleMode()
      hidePopup()
    }

    // showToast(bubbleMode?"bubble mode ON":"bubble mode OFF",bubbleMode)
    fireTrigger("n")
  }

  if(e.key==="o"||e.key==="O"){
    if(bubbleMode){ showToast("exit bubble mode first"); return}
    if(blackHole){ showToast("exit black hole mode first"); return}
    if(interactMode){showToast("exit interact mode first"); return}
    orbitMode=!orbitMode
    setModeState(orbitstate,orbitMode)
    if(orbitMode) orbitstate.style.color="#fd8"
    canvas.style.cursor = orbitMode?"none":"default"

    if (orbitMode) {
      showPopup(`orbit mode — particles orbit the sun(mouse)· press 'o' to exit`)
    } else {
      hidePopup()
    } 

    showToast(orbitMode?"orbit mode on":"orbit mode OFF", orbitMode)
    fireTrigger("o")
  }

});

function showPopup(msg) {
  popup.innerHTML = msg
  popup.style.display = "flex"
}

function hidePopup() {
  popup.innerHTML = ""
  popup.style.display = "none"
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

function showToast(msg, isOn=null){
  const toast=document.getElementById("toast")

  if(toastTimeout){
    clearTimeout(toastTimeout)
    toastTimeout=null
  }
  toast.textContent=msg
  toast.style.opacity="1"

  if (isOn === true) {
    toast.style.background = "#1a4d2e"
    toast.style.color = "#4cff8f"
  } else if (isOn === false) {
    toast.style.background = "#4d1a1a"
    toast.style.color = "#ff6b6b"
  } else {
    toast.style.background = "#2a2a2a"
    toast.style.color = "#afafaf"
  }

  toastTimeout=setTimeout(()=>{
    toast.style.transform="opactity 0.8s ease"
    toast.style.opacity="0"
    toastTimeout=null
  },2000)
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

let isMouseDown = false

canvas.addEventListener("mousedown",(e)=>{
  if(e.button!==0) return
  isMouseDown=true
  if (interactMode){
    let closest=null
    let closestDist=30
    particles.forEach(p=>{
      const dx=p.x-e.clientX
      const dy=p.y-e.clientY
  
      const r=Math.sqrt(dx*dx+dy*dy)
      if(r<closestDist){
        closestDist=r
        closest=p
      }
    })
  
    if(closest){
      grabbedParticle=closest
      grabbedParticle.grabbed = true
      grabbedParticle.prevX=e.clientX
      grabbedParticle.prevY=e.clientY
      canvas.style.cursor="grabbing"
  
    }
  }

})

canvas.addEventListener("mousemove", (e) => {
  mouse.x = e.clientX
  mouse.y = e.clientY

  if (interactMode && grabbedParticle) {
    grabbedParticle.vx = e.clientX - grabbedParticle.prevX
    grabbedParticle.vy = e.clientY - grabbedParticle.prevY
    grabbedParticle.prevX = e.clientX
    grabbedParticle.prevY = e.clientY
    grabbedParticle.x = e.clientX
    grabbedParticle.y = e.clientY
  }
})

canvas.addEventListener("mouseup",(e)=>{
  isMouseDown=false
  if (grabbedParticle) {
    grabbedParticle.grabbed = false
    grabbedParticle = null
    canvas.style.cursor = interactMode ? "grab" : "default"
  }
})


function getGridKey(x, y, cellSize) {
  return `${Math.floor(x / cellSize)},${Math.floor(y / cellSize)}`
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

function resolveMergeOrCollide() {
  const cellSize = 80
  const grid = buildGrid(cellSize)

  grid.forEach((cell, key) => {
    const [gx, gy] = key.split(",").map(Number)

    // only check neighboring cells
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
            const bi = particles.indexOf(b)
            if (bi > -1) particles.splice(bi, 1)
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
}


function applyOrbit(){
  if(!orbitMode) return
  const orbitRadius=250
  const orbitStrength = 3
  const inwardStrength = 1.5

  particles.forEach(p=>{
    const dx=p.x-mouse.x
    const dy=p.y-mouse.y
    const dist=Math.sqrt(dx*dx+dy*dy)||1
    if(dist>orbitRadius) return

    const nx=dx/dist
    const ny=dy/dist
    const tx=-ny
    const ty=nx

    const influence=(1-dist/orbitRadius)
    p.vx += tx * orbitStrength * influence - nx * inwardStrength * influence
    p.vy += ty * orbitStrength * influence - ny * inwardStrength * influence
    
    const speed=Math.sqrt(p.vx*p.vx+p.vy*p.vy)
    if(speed>12){
      p.vx=(p.vx/speed)*12
      p.vy=(p.vy/speed)*12
    }

  })
}


function drawOrbit(){
  if(!orbitMode) return
  const time=Date.now()*0.01

    // rotating dashed ring
  ctx.save()
  ctx.translate(mouse.x, mouse.y)
  ctx.rotate(time * 0.5)
  ctx.globalAlpha = 0.2
  ctx.strokeStyle = "#fd8"
  ctx.lineWidth = 1
  ctx.setLineDash([8, 8])
  ctx.beginPath()
  ctx.arc(0, 0, 200, 0, Math.PI * 2)
  ctx.stroke()
  ctx.setLineDash([])
  ctx.restore()

  // sun corona — outer glow layers
  const coronaLayers = [
    { r: 160, alpha: 0.09 },
    { r: 100, alpha: 0.08 },
    { r: 80, alpha: 0.15 },
  ]
  coronaLayers.forEach(({ r, alpha }) => {
    const grad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, r)
    grad.addColorStop(0, `rgba(255, 200, 50, ${alpha})`)
    grad.addColorStop(1, "rgba(0,0,0,0)")
    ctx.globalAlpha = 1
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

  ctx.globalAlpha = 1
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
    ctx.globalAlpha = 0.15
    ctx.fillStyle = "#fff"
    ctx.beginPath()
    ctx.arc(Math.cos(a) * r, Math.sin(a) * r, 10, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()

  ctx.globalAlpha = 1

}



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

  // fade in/out
  if (blackHole && bhAlpha < 1) bhAlpha += 0.03;
  if (!blackHole && bhAlpha > 0) {
    bhAlpha -= 0.03;
    if(bhAlpha<=0) canvas.style.cursor="default";
  }
  bhAlpha = Math.max(0, Math.min(1, bhAlpha));

  const time = Date.now() * 0.002;

  // orbiting particles
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

  // dark circle - bigger and pure black
  ctx.globalAlpha = bhAlpha;
  ctx.beginPath();
  ctx.arc(mouse.x, mouse.y, 35, 0, Math.PI * 2);
  ctx.fillStyle = "#000";
  ctx.fill();

  // glow ring - bigger too
  const glow = ctx.createRadialGradient(
    mouse.x,
    mouse.y,
    15,
    mouse.x,
    mouse.y,
    100,
  ); // bigger spread
  glow.addColorStop(0, `rgba(0, 0, 0, ${bhAlpha})`); // black center
  glow.addColorStop(0.3, `rgba(90, 1, 178, ${0.62 * bhAlpha})`); // purple middd
  glow.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.beginPath();
  ctx.arc(mouse.x, mouse.y, 100, 0, Math.PI * 2); // 60 -> 100
  ctx.fillStyle = glow;
  ctx.fill();

  ctx.globalAlpha = 1;
}

function applyGravity(p) {
  if(zeroGravity) return
  if(orbitMode){
    //
    p.vy+=0.02
    return
  }
  const dir = gravityFlip ? -1 : 1;
  p.vy += dir * parseFloat(pullSlider.value) * 0.3;
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

function updateParticle(p) {
  if (p.grabbed) return

  if (p.isBubble) {
    p.vx += (Math.random() - 0.5) * 0.1  // gentle drift
    p.vx *= 0.98
    p.vy *= 0.98

    p.x += p.vx
    p.y += p.vy

    // bounce off walls softly
    if (p.x - p.size < 0) { p.x = p.size; p.vx *= -0.5 }
    if (p.x + p.size > canvas.width) { p.x = canvas.width - p.size; p.vx *= -0.5 }
    if (p.y - p.size < 0) { p.y = p.size; p.vy *= -0.5 }
    if (p.y + p.size > canvas.height) { p.y = canvas.height - p.size; p.vy *= -0.3 }
    return
  }

  applyGravity(p)
  p.vx *= parseFloat(dampenSlider.value)
  p.vy *= parseFloat(dampenSlider.value)
  p.x += p.vx
  p.y += p.vy
  wallBounce(p)
}

function drawParticle(p) {
  if (p.isBubble) {
    const r = p.size

    // outer transparent bubble
    ctx.globalAlpha = 0.08
    ctx.fillStyle = `hsl(200, 80%, 90%)`
    ctx.beginPath()
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2)
    ctx.fill()

    // bubble outline
    ctx.globalAlpha = 0.5
    ctx.strokeStyle = `rgba(180, 220, 255, 0.8)`
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2)
    ctx.stroke()

    // inner highlight — top left shine
    ctx.globalAlpha = 0.35
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)"
    ctx.beginPath()
    ctx.arc(p.x - r * 0.3, p.y - r * 0.3, r * 0.25, 0, Math.PI * 2)
    ctx.fill()

    // small secondary highlight
    ctx.globalAlpha = 0.15
    ctx.fillStyle = "rgba(255,255,255,0.6)"
    ctx.beginPath()
    ctx.arc(p.x + r * 0.25, p.y + r * 0.25, r * 0.1, 0, Math.PI * 2)
    ctx.fill()

    ctx.globalAlpha = 1
    return
  }

  // normal draw below...
  const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
  const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size)
  gradient.addColorStop(0, `hsl(${p.hue + speed * 5}, 100%, 70%)`)
  gradient.addColorStop(1, `hsl(${p.hue}, 100%, 40%)`)
  ctx.globalAlpha = 1
  ctx.fillStyle = gradient
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

      particles.splice(i,1)

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


function drawConnections() {
  if (!lineMode) return
  const cellSize = 100
  const grid = buildGrid(cellSize)

  const checked = new Set()

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
        const pairKey = a < b ? `${particles.indexOf(a)}-${particles.indexOf(b)}` : `${particles.indexOf(b)}-${particles.indexOf(a)}`
        if (checked.has(pairKey)) return
        checked.add(pairKey)

        const dx = b.x - a.x
        const dy = b.y - a.y
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist < 100) {
          const alpha = (1 - dist / 100) * 0.5
          ctx.globalAlpha = alpha
          ctx.strokeStyle = `hsl(${(a.hue + b.hue) / 2}, 100%, 90%)`
          ctx.lineWidth = 2
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

function loop() {
  //   ctx.globalAlpha = 1
  ctx.globalAlpha = trailMode ? 0.15 : 1;
  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  resolveMergeOrCollide();
  // spawnTrail();
  applyOrbit();
  drawStory();

  particles.forEach((p) => {
    updateParticle(p);
    drawParticle(p);
  });
  if (lineMode) drawConnections();
  
  drawOrbit()
  drawBlackHole();
  applyBlackHole();
  checkBubblePop()

  drawShockwaves();
  pcount.textContent = particles.length;

  requestAnimationFrame(loop);
}
loop();
