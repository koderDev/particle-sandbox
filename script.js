const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particles = [];
let mouse = { x: 0, y: 0 };

const MAX_PARTICLES = 420;

const pullSlider = document.getElementById("pull");
const dampenSlider = document.getElementById("dampen");
const sizeSlider = document.getElementById("size");
const countSlider = document.getElementById("count");

const pcount = document.getElementById("pcount");

pcount.textContent = particles.length;


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
  { text: "nice! now try right clicking to blast them.", trigger: "rightclick" },
  { text: "press G to flip gravity.", trigger: "g" },
  { text: "watch them float... press G again to bring them back.", trigger: "g" },
  { text: "press B to open a black hole at your cursor.", trigger: "b" },
  { text: "move your cursor around. they follow you.", trigger: null },
  { text: "press B again to close it.", trigger: "b" },
  { text: "press M to turn on merge mode.", trigger: "m" },
  { text: "now spawn more particles. same colors will merge.", trigger: "click" },
  { text: "press L to connect nearby particles with lines.", trigger: "l" },
  { text: "press I to enter interact mode.", trigger: "i" },
  { text: "grab a particle and throw it around.", trigger: null },
  { text: "press I again to go back to normal.", trigger: "i" },
  { text: "press T for trail mode. move your mouse.", trigger: "t" },
  { text: "press Z for zero gravity mode.", trigger: "z" },
  { text: "watch them float... press Z again to turn this off.", trigger: "z" },
  { text: "you have learned everything.", trigger: null },
  { text: "now build your own universe.", trigger: null },
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
    // just keep showing current text, pulse it slightly
    storyAlpha = 0.5 + Math.sin(Date.now() * 0.003) * 0.2
    ctx.save()
    ctx.globalAlpha = storyAlpha
    ctx.fillStyle = "#e1e1e1"
    ctx.font = "28px Space Grotesk"
    ctx.textAlign = "center"
    ctx.fillText(story.text, canvas.width / 2, canvas.height / 2)

    // hint arrow pulse
    ctx.globalAlpha = storyAlpha * 0.5
    ctx.fillStyle = "#aaa"
    ctx.font = "14px Space Grotesk"
    ctx.fillText("[ do it to continue ]", canvas.width / 2, canvas.height / 2 + 40)
    ctx.restore()
    return
  }

  // no trigger or trigger fired — normal fade in/hold/out
  waitingForTrigger = false
  storyTriggered = false

  if (storyState === "fadein") {
    storyAlpha += 0.035
    if (storyAlpha >= 1) { storyAlpha = 1; storyState = "hold" }
  } else if (storyState === "hold") {
    storyTimer++
    if (storyTimer > 100) { storyState = "fadeout"; storyTimer = 0 }
  } else if (storyState === "fadeout") {
    storyAlpha -= 0.035
    if (storyAlpha <= 0) {
      storyAlpha = 0
      storyState = "fadein"
      currentStory = (currentStory + 1) % stories.length
    }
  }

  

  ctx.save()
  ctx.globalAlpha = storyAlpha * 0.85
  ctx.fillStyle = "#e1e1e1"
  ctx.font = "28px Space Grotesk"
  ctx.textAlign = "center"
  ctx.fillText(story.text, canvas.width / 2, canvas.height / 2)
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
  if(particles.length >=MAX_PARTICLES)
  {
    showToast("particle limit reached!")
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
const interactPopup = document.getElementById("interactPopup");

let zeroGravity=false
const zerogravstate=document.getElementById("zerogravstate");
const trailstate=document.getElementById("trailstate");
const mergestate = document.getElementById("mergestate");
const bhactive = document.getElementById("bhactive");
const storystate = document.getElementById("storyActive");
const flipstate = document.getElementById("flipstate");
let bhAlpha = 0;

window.addEventListener("keydown", (e) => {
  if (e.key === "b" || e.key === "B") {
    if(interactMode){
      showToast("exit interact mode first")
      return
    }
    blackHole = !blackHole;
    bhactive.textContent = blackHole ? "ON" : "off";
    bhactive.style.color = blackHole ? "#a0f" : "#555";
    canvas.style.cursor=blackHole?"none":"default"
    showToast(blackHole ? "black hole ON" : "black hole OFF", blackHole)
    
    fireTrigger("b");
  }

  if (e.key === "t" || e.key === "T") {
    trailMode = !trailMode;
    trailstate.textContent = trailMode ? "ON" : "off";
    trailstate.style.color = trailMode ? "#fa0" : "#555";
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
    storystate.textContent = storyMode ? "ON" : "off";
    storystate.style.color = storyMode ? "#fff" : "#555";
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
    mergestate.textContent = mergeMode ? "ON" : "off";
    mergestate.style.color = mergeMode ? "#0f0" : "#555";
    showToast(mergeMode ? "merge mode ON" : "merge mode OFF", mergeMode)
    fireTrigger("m");
  }

  if (e.key === "g" || e.key === "G") {
    gravityFlip = !gravityFlip;
    flipstate.textContent = gravityFlip ? "ON" : "off";
    flipstate.style.color = gravityFlip ? "#0ff" : "#555";
    showToast(gravityFlip ? "gravity flip ON" : "gravity flip OFF", gravityFlip)
    fireTrigger("g");
  }

  if (e.key === "l" || e.key === "L") {
    if(trailMode){
      showToast("exit trail mode first")
      return
    }
    lineMode = !lineMode;
    linestate.textContent = lineMode ? "ON" : "off";
    linestate.style.color = lineMode ? "#fff" : "#555";
    showToast(lineMode ? "line mode ON" : "line mode OFF", lineMode)
    fireTrigger("l");
  }

  if (e.key === "i" || e.key === "I") {
    if (blackHole) { showToast("turn off black hole first"); return }
    interactMode = !interactMode
    interactstate.textContent = interactMode ? "ON" : "off"
    interactstate.style.color = interactMode ? "#4cf" : "#555"
    interactPopup.style.display = interactMode ? "flex" : "none"
    if (!interactMode && grabbedParticle) grabbedParticle = null
    canvas.style.cursor = interactMode ? "grab" : "default"
    showToast(interactMode ? "interact mode ON" : "interact mode OFF", interactMode)
    fireTrigger("i")
  }

if (e.key === "z" || e.key === "Z") {
  zeroGravity = !zeroGravity
  zerogravstate.textContent = zeroGravity ? "ON" : "off"
  zerogravstate.style.color = zeroGravity ? "#ff0" : "#555"

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
});



function showToast(msg, isOn=null){
  const toast=document.getElementById("toast")

  if(toastTimeout){
    clearTimeout(toastTimeout)
    toastTimeout=null
  }
  toast.textContent=msg
  toast.style.opacity="1"

  if(isOn ===true){
    toast.style.background="rgba(0,200,100,0.15)"
    // toast.style.borderColor="rgba(0,200,100,0.3)"
    toast.style.color="rgba(0,220,110,0.9)"
  } else if(isOn === false){
    toast.style.background = "rgba(220,60,60,0.15)";
    // toast.style.borderColor = "rgba(220,60,60,0.3)";
    toast.style.color = "rgba(220,80,80,0.9)";
  } else {
    toast.style.background = "rgba(255,255,255,0.08)"
    // toast.style.borderColor="rgba(255,255,255,0.1)"
    toast.style.color="#aaa"
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
  if (!blackHole && bhAlpha > 0) bhAlpha -= 0.03;
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
  glow.addColorStop(0.3, `rgba(90, 1, 178, ${0.62 * bhAlpha})`); // purple mid
  glow.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.beginPath();
  ctx.arc(mouse.x, mouse.y, 100, 0, Math.PI * 2); // 60 -> 100
  ctx.fillStyle = glow;
  ctx.fill();

  ctx.globalAlpha = 1;
}

function applyGravity(p) {
  if(zeroGravity) return
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
  if(p.grabbed) return
  applyGravity(p);
  p.vx *= parseFloat(dampenSlider.value);
  p.vy *= parseFloat(dampenSlider.value);
  p.x += p.vx;
  p.y += p.vy;
  wallBounce(p);
}

function drawParticle(p) {
  const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
  const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
  gradient.addColorStop(0, `hsl(${p.hue + speed * 5}, 100%, 70%)`);
  gradient.addColorStop(1, `hsl(${p.hue}, 100%, 40%)`);

  ctx.globalAlpha = 1;
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
  ctx.fill();

    // ring around grabbed particle
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
  drawStory();

  particles.forEach((p) => {
    updateParticle(p);
    drawParticle(p);
  });
  if (lineMode) drawConnections();
  
  drawBlackHole();
  applyBlackHole();

  drawShockwaves();
  pcount.textContent = particles.length;

  requestAnimationFrame(loop);
}
loop();
