const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particles = []
let mouse = { x: 0, y: 0 }

const pullSlider = document.getElementById("pull")
const dampenSlider = document.getElementById("dampen")
const sizeSlider = document.getElementById("size")
const countSlider = document.getElementById("count")

const pcount = document.getElementById("pcount")

pcount.textContent = particles.length


const stories = [
  "you are the god of this universe.",
  "these particles obey your will.",
  "click to breathe life into the void.",
  "right click to unleash chaos.",
  "press B to tear open a black hole.",
  "they fear you.",
  "they trust you.",
  "want to flip gravity? press G",
  "apples need not fall downwards ;)",
  "press T for particle trails.",
  "trails = more chaos.",
  "and after all of this",
  "press M to merge the particles",
  "will they all merge to be ONE?",
  "what will you do with this power?",
  "the universe watches.",
  "every particle has a purpose.",
  "or maybe none of them do.",
]

let currentStory = 0
let storyAlpha = 0
let storyState = "fadein" // fadein, hold, fadeout
let storyTimer = 0
let storyMode = true
let shockwaves = []


function drawStory() {

      if (!storyMode) return

  if (storyState === "fadein") {
    storyAlpha += 0.01
    if (storyAlpha >= 1) { storyAlpha = 1; storyState = "hold" }
  } else if (storyState === "hold") {
    storyTimer++
    if (storyTimer > 180) { storyState = "fadeout"; storyTimer = 0 }
  } else if (storyState === "fadeout") {
    storyAlpha -= 0.01
    if (storyAlpha <= 0) {
      storyAlpha = 0
      storyState = "fadein"
      currentStory = (currentStory + 1) % stories.length
    }
  }

  ctx.save()
  ctx.globalAlpha = storyAlpha * 0.8
  ctx.fillStyle = "#e1e1e1"
  ctx.font = "32px Space Grotesk"
  ctx.textAlign = "center"
  ctx.fillText(stories[currentStory], canvas.width / 2, canvas.height / 2)
  ctx.restore()
}
  

const sliders = [
  { slider: pullSlider, display: document.getElementById("pull-val") },
  { slider: dampenSlider, display: document.getElementById("dampen-val") },
  { slider: sizeSlider, display: document.getElementById("size-val") },
  { slider: countSlider, display: document.getElementById("count-val") },
]
sliders.forEach(({ slider, display }) => {
  slider.addEventListener("input", () => display.textContent = slider.value)
})

canvas.addEventListener("mousemove", (e) => {
  mouse.x = e.clientX
  mouse.y = e.clientY
})

canvas.addEventListener("click", (e) => {
  const count = Math.floor(parseFloat(countSlider.value) / 10)
  for (let i = 0; i < count; i++) {
    particles.push(createParticle(e.clientX, e.clientY))
  }
})

canvas.addEventListener("contextmenu", (e) => {
  e.preventDefault()

  particles.forEach(p => {
    const dx = p.x - e.clientX
    const dy = p.y - e.clientY
    const dist = Math.sqrt(dx * dx + dy * dy) || 1
    p.vx += (dx / dist) * 10
    p.vy += (dy / dist) * 10
  })

  shockwaves.push({ x: e.clientX, y: e.clientY, radius: 0, alpha: 1 })
})


function drawShockwaves() {
  shockwaves.forEach(s => {
    s.radius += 6
    s.alpha -= 0.025

    ctx.globalAlpha = s.alpha
    ctx.strokeStyle = `rgba(255, 255, 255, ${s.alpha})`
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2)
    ctx.stroke()

    // second inner ring
    ctx.globalAlpha = s.alpha * 0.4
    ctx.strokeStyle = `rgba(180, 100, 255, ${s.alpha})`
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.arc(s.x, s.y, s.radius * 0.6, 0, Math.PI * 2)
    ctx.stroke()
  })

  ctx.globalAlpha = 1
  shockwaves = shockwaves.filter(s => s.alpha > 0)
}


function createParticle(x, y) {
  return {
    x, y,
    vx: (Math.random() - 0.5) * 6,
    vy: (Math.random() - 0.5) * 6,
    size: Math.random() * parseFloat(sizeSlider.value) + 6,
    mass: 1,
    hue: Math.random() * 360
  }
}


let blackHole = false
let trailMode = false
let mergeMode = false
let gravityFlip = false

let lineMode = true  // on by default
const linestate = document.getElementById("linestate")


const mergestate = document.getElementById("mergestate")
const bhactive = document.getElementById("bhactive")
const storystate = document.getElementById("storyActive")
const flipstate = document.getElementById("flipstate")
let bhAlpha = 0

window.addEventListener("keydown", (e) => {
    if (e.key === "b" || e.key === "B") {
        blackHole = !blackHole
        bhactive.textContent = blackHole ? "ON" : "off"
        bhactive.style.color = blackHole ? "#a0f" : "#555"

    }

    if (e.key === "t" || e.key === "T") {
        trailMode = !trailMode
        trailstate.textContent = trailMode ? "ON" : "off"
        trailstate.style.color = trailMode ? "#fa0" : "#555"
    }

    if (e.key === "s" || e.key === "S") {
    storyMode = !storyMode
    storystate.textContent = storyMode ? "ON" : "off"
    storystate.style.color = storyMode ? "#fff" : "#555"

    }

    if (e.key === "m" || e.key === "M") {
  mergeMode = !mergeMode
  mergestate.textContent = mergeMode ? "ON" : "off"
  mergestate.style.color = mergeMode ? "#0f0" : "#555"
}

if (e.key === "g" || e.key === "G") {
  gravityFlip = !gravityFlip
  flipstate.textContent = gravityFlip ? "ON" : "off"
  flipstate.style.color = gravityFlip ? "#0ff" : "#555"
}

// in keydown:
if (e.key === "l" || e.key === "L") {
  lineMode = !lineMode
  linestate.textContent = lineMode ? "ON" : "off"
  linestate.style.color = lineMode ? "#fff" : "#555"
}
})


function resolveMergeOrCollide() {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const a = particles[i]
      const b = particles[j]
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
        particles.splice(j, 1)
        j--
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
}

function applyBlackHole() {
  if (bhAlpha <= 0) return
  particles.forEach(p => {
    const dx = mouse.x - p.x
    const dy = mouse.y - p.y
    const dist = Math.sqrt(dx * dx + dy * dy) || 1
    const force = (2000 * bhAlpha) / (dist * dist)
    p.vx += (dx / dist) * force
    p.vy += (dy / dist) * force
    if (dist < 10 && blackHole) {
      particles.splice(particles.indexOf(p), 1)
    }
  })
}

function drawBlackHole() {
  if (!blackHole && bhAlpha <= 0) return

  // fade in/out
  if (blackHole && bhAlpha < 1) bhAlpha += 0.03
  if (!blackHole && bhAlpha > 0) bhAlpha -= 0.03
  bhAlpha = Math.max(0, Math.min(1, bhAlpha))

  const time = Date.now() * 0.002

  // orbiting particles
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2 + time
    const radius = 70 + Math.sin(time * 2 + i) * 8
    const x = mouse.x + Math.cos(angle) * radius
    const y = mouse.y + Math.sin(angle) * radius
    const size = 5 + Math.sin(time * 3 + i) * 1.5
    const hue = (i / 8) * 360

    ctx.globalAlpha = bhAlpha * (0.6 + Math.sin(time + i) * 0.3)
    ctx.fillStyle = `hsl(${hue}, 100%, 70%)`
    ctx.beginPath()
    ctx.arc(x, y, size, 0, Math.PI * 2)
    ctx.fill()

    ctx.globalAlpha = bhAlpha * 0.1
    ctx.strokeStyle = `hsl(${hue}, 100%, 70%)`
    ctx.lineWidth = 0.5
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(mouse.x, mouse.y)
    ctx.stroke()
  }

    // dark circle - bigger and pure black
    ctx.globalAlpha = bhAlpha
    ctx.beginPath()
    ctx.arc(mouse.x, mouse.y, 35, 0, Math.PI * 2) 
    ctx.fillStyle = "#000"
    ctx.fill()

    // glow ring - bigger too
    const glow = ctx.createRadialGradient(mouse.x, mouse.y, 15, mouse.x, mouse.y, 100)  // bigger spread
    glow.addColorStop(0, `rgba(0, 0, 0, ${bhAlpha})`)                // black center
    glow.addColorStop(0.3, `rgba(90, 1, 178, ${0.62 * bhAlpha})`)    // purple mid
    glow.addColorStop(1, "rgba(0, 0, 0, 0)")
    ctx.beginPath()
    ctx.arc(mouse.x, mouse.y, 100, 0, Math.PI * 2)  // 60 -> 100
    ctx.fillStyle = glow
    ctx.fill()

  ctx.globalAlpha = 1
}


function applyGravity(p) {
  const dir = gravityFlip ? -1 : 1
  p.vy += dir * parseFloat(pullSlider.value) * 0.3
}

function wallBounce(p) {
  if (p.x - p.size < 0) { p.x = p.size; p.vx *= -0.7 }
  if (p.x + p.size > canvas.width) { p.x = canvas.width - p.size; p.vx *= -0.7 }
  if (p.y - p.size < 0) { p.y = p.size; p.vy *= -0.7 }
  if (p.y + p.size > canvas.height) { p.y = canvas.height - p.size; p.vy *= -0.7 }
}


function updateParticle(p) {
  applyGravity(p)
  p.vx *= parseFloat(dampenSlider.value)
  p.vy *= parseFloat(dampenSlider.value)
  p.x += p.vx
  p.y += p.vy
  wallBounce(p)
}

function drawParticle(p) {
  const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
  const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size)
  gradient.addColorStop(0, `hsl(${p.hue + speed * 5}, 100%, 70%)`)
  gradient.addColorStop(1, `hsl(${p.hue}, 100%, 40%)`)

  ctx.globalAlpha = 1
  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
  ctx.fill()
}

function drawConnections() {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const a = particles[i]
      const b = particles[j]
      const dx = b.x - a.x
      const dy = b.y - a.y
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist < 100) {
        const alpha = (1 - dist / 100) * 0.4
        ctx.globalAlpha = alpha
        ctx.strokeStyle = `hsl(${(a.hue + b.hue) / 2}, 100%, 70%)`
        ctx.lineWidth = 0.5
        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
        ctx.stroke()
      }
    }
  }
  ctx.globalAlpha = 1
}

function loop() {
//   ctx.globalAlpha = 1
  ctx.globalAlpha = trailMode ? 0.15 : 1  
ctx.fillStyle = "#0a0a0a"
  ctx.fillRect(0, 0, canvas.width, canvas.height)

//   resolveCollisions()
resolveMergeOrCollide()
drawStory()

particles.forEach(p => {
        updateParticle(p)
        drawParticle(p)
        if (lineMode) drawConnections()
    })
    
    drawBlackHole()
    applyBlackHole() 

    drawShockwaves()
  pcount.textContent = particles.length

  requestAnimationFrame(loop)
}
loop()


