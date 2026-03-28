const stories = [
  { text: "welcome to particle sandbox.", trigger: null },
  { text: "left click anywhere to spawn particles.", trigger: "click" },
  { text: "OR click on the spawn button to spawn them.", trigger: "click" },
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
  { text: "press O for orbit mode.", trigger: "o" },
  { text: "mouse=sun & particles=orbit around the sun.", trigger: null },
  { text: "press O to exit orbit mode.", trigger: "o" },
  { text: "press C for cyclone mode.", trigger: "c" },
  { text: "right click anywhere to place cyclones.", trigger: null },
  { text: "spawn particles near cyclone and see them revolve.", trigger: null },
  { text: "press C to exit cyclone mode.", trigger: "c" },
  { text: "press E for explosion mode.", trigger:"e"},
  { text: "click on a particle for a while, and release it.", trigger:null},
  { text: "longer you press, biggger the explosion ", trigger: null},
  { text: "press E to exit explosion mode.", trigger: "e"},
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
    ctx.fillText("[ do it to continue ]", (canvas.width / 2)+110, canvas.height / 2 + 40)
    ctx.restore()
    return
  }


  if(storyTriggered) return
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


