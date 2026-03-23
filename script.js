const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particles = []


function createParticle(x, y) {
  return {
    x,
    y,
    vx: (Math.random() - 0.5) * 4,
    vy: (Math.random() - 0.5) * 4,
    life: 1,
    size: Math.random() * 2 + 6  
  }
}

function drawParticle(ctx, p) {
  ctx.globalAlpha = Math.pow(p.life, 2);    
  //ctx.fillStyle = `hsl(37, 100%, 60%)`
  ctx.fillStyle=`hsl(${p.vx * 75}, 100%, 50%)`
  ctx.beginPath()
  ctx.arc(p.x, p.y, p.size*p.life, 0, Math.PI * 2)
  ctx.fill()

}

function updateParticle(p) {
  p.vy += 0.01
  p.x += p.vx
  p.y += p.vy
  p.life -= 0.01
}

function loop(){
  ctx.globalAlpha = 1
  ctx.fillStyle = "#000"
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  
  particles = particles.filter(p => p.life > 0)
  particles.forEach(particle => {
    updateParticle(particle)
    drawParticle(ctx, particle)
  })

  requestAnimationFrame(loop)
}

loop();

canvas.addEventListener("mousemove", (e) => {
  for (let i = 0; i < 4; i++) {
    particles.push(createParticle(e.clientX, e.clientY))
  }
})
//createParticle(200,200);
//drawParticle(ctx,createParticle(200,200));