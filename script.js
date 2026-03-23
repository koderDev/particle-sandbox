const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particles = []
let mouse = { x: canvas.width / 2, y: canvas.height / 2 }

canvas.addEventListener("mousemove", (e) => {
  mouse.x = e.clientX
  mouse.y = e.clientY
})

function createParticle() {
  return {
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * 2,
    vy: (Math.random() - 0.5) * 2,
    life: 1.0,
    size: Math.random() * 20 + 10
  }
}

function updateParticle(p) {
  const dx = mouse.x - p.x
  const dy = mouse.y - p.y
  const dist = Math.sqrt(dx * dx + dy * dy)

  // always pull towards mouse
  p.vx += (dx / dist) * 0.5
  p.vy += (dy / dist) * 0.5

  // dampen so they dont overshoot too crazy
  p.vx *= 0.92
  p.vy *= 0.92

  p.x += p.vx
  p.y += p.vy

  // respawn when too close to mouse
  if (dist < 5) {
    p.x = Math.random() * canvas.width
    p.y = Math.random() * canvas.height
    p.vx = (Math.random() - 0.5) * 2
    p.vy = (Math.random() - 0.5) * 2
  }
}

function drawParticle(p) {
  const dx = mouse.x - p.x
  const dy = mouse.y - p.y
  const dist = Math.sqrt(dx * dx + dy * dy)

  // closer to mouse = brighter
  const alpha = Math.min(1, 150 / dist)

  const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size)
  gradient.addColorStop(0, `hsla(200, 100%, 80%, ${alpha})`)
  gradient.addColorStop(1, `hsla(200, 100%, 60%, 0)`)

  ctx.globalAlpha = alpha * 0.8
  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
  ctx.fill()
}

function loop() {
  ctx.globalAlpha = 0.15
  ctx.fillStyle = "#000"
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  particles.forEach(p => {
    updateParticle(p)
    drawParticle(p)
  })

  requestAnimationFrame(loop)
}

// spawn particles all over screen
for (let i = 0; i < 80; i++) {
  particles.push(createParticle())
}

loop()