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

// inside loop() add:
pcount.textContent = particles.length

// live value display
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
})

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

const bhactive = document.getElementById("bhactive")

window.addEventListener("keydown", (e) => {
    if (e.key === "b" || e.key === "B") {
        blackHole = !blackHole
        bhactive.textContent = blackHole ? "ON" : "off"
        bhactive.style.color = blackHole ? "#a0f" : "#555"
        bhactive.parentElement.style.color = blackHole ? "#7b7b7b" : "#555"

    }

    if (e.key === "t" || e.key === "T") {
        trailMode = !trailMode
        trailstate.textContent = trailMode ? "ON" : "off"
        trailstate.style.color = trailMode ? "#fa0" : "#555"
        trailstate.parentElement.style.color = trailMode ? "#7b7b7b" : "#555"
    }

})

function applyBlackHole() {
  if (!blackHole) return
  particles.forEach(p => {
    const dx = mouse.x - p.x
    const dy = mouse.y - p.y
    const dist = Math.sqrt(dx * dx + dy * dy) || 1

    const force = 2000 / (dist * dist)
    p.vx += (dx / dist) * force
    p.vy += (dy / dist) * force

    if (dist < 10) {
        particles.splice(particles.indexOf(p), 1)
    }
  })
}

function drawBlackHole() {
  if (!blackHole) return

  // dark circle
  ctx.globalAlpha = 1
  ctx.beginPath()
  ctx.arc(mouse.x, mouse.y, 20, 0, Math.PI * 2)
  ctx.fillStyle = "#000"
  ctx.fill()

  // glow ring
  const glow = ctx.createRadialGradient(mouse.x, mouse.y, 10, mouse.x, mouse.y, 60)
  glow.addColorStop(0, "rgba(90, 1, 178, 0.62)")
  glow.addColorStop(1, "rgba(0, 0, 0, 0)")
  ctx.beginPath()
  ctx.arc(mouse.x, mouse.y, 60, 0, Math.PI * 2)
  ctx.fillStyle = glow
  ctx.fill()
}



function applyGravity(p) {
  p.vy += parseFloat(pullSlider.value) * 0.3
}

function wallBounce(p) {
  if (p.x - p.size < 0) { p.x = p.size; p.vx *= -0.7 }
  if (p.x + p.size > canvas.width) { p.x = canvas.width - p.size; p.vx *= -0.7 }
  if (p.y - p.size < 0) { p.y = p.size; p.vy *= -0.7 }
  if (p.y + p.size > canvas.height) { p.y = canvas.height - p.size; p.vy *= -0.7 }
}

function resolveCollisions() {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const a = particles[i]
      const b = particles[j]
      const dx = b.x - a.x
      const dy = b.y - a.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      const minDist = a.size + b.size

      if (dist < minDist && dist > 0) {
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

function loop() {
//   ctx.globalAlpha = 1
  ctx.globalAlpha = trailMode ? 0.15 : 1  
ctx.fillStyle = "#0a0a0a"
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  resolveCollisions()
    applyBlackHole() 
    drawBlackHole()


  particles.forEach(p => {
    updateParticle(p)
    drawParticle(p)
  })

  pcount.textContent = particles.length

  requestAnimationFrame(loop)
}
loop()