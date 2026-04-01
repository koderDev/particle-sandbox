const DICE_PRESETS = [
  { modes: ["z", "l"],        label: "spaceNweb" },
  { modes: ["z", "l", "t"],   label: "line0grav" },
  { modes: ["t", "b"],        label: "blackTrailHole" },
  { modes: ["o", "t"],        label: "orbiTrail" },
  { modes: ["z", "t"],        label: "trail0grav" },
  { modes: ["l", "m"],        label: "mergeLine" },
  { modes: ["c", "z"],        label: "cycl0gravityy" },
  { modes: ["c", "l"],        label: "cycLine" },
  { modes: ["g", "t"],        label: "flipGravTrailsss" },
  { modes: ["z", "l", "m"],   label: "mergeLine0grav" },
  { modes: ["o", "l"],        label: "orbitaLine" },
]

const shutterSound = new Audio("assets/sound/shutter.mp3");
shutterSound.load()

const diceSound = new Audio("assets/sound/dice.mp3");
diceSound.load()

let shutterReady = false
let diceReady = false

diceSound.addEventListener("canplaythrough",()=>{
  diceReady=true
})  

shutterSound.addEventListener("canplaythrough",()=>{
  shutterReady=true
})

function playDiceSound() {
  if(!diceReady) return
  diceSound.currentTime=0
  diceSound.play()
}

function playShutter() {
  if(!shutterReady) return
  shutterSound.currentTime=0
  shutterSound.play()
}

function togglePanel() {
  panelVisible=!panelVisible
  const panel=document.getElementById("panel")
  const indicator=document.getElementById("panel-indicator")

  if(panelVisible) {
    panel.style.display="flex"
    indicator.style.display="none"
  } else {
    panel.style.display = "none"
    indicator.style.display="flex"
    indicator.textContent="PANEL(h): OFF | RESTART (R) | SCREENSHOT (Q) | LMB (SPAWN) | RMB (SHOCKWAVE)"
    indicator.style.color="#828282"
  }
}


function takeSS(){
  if(screenshotPaused) return

  playShutter()
  setTimeout(()=>{

    takingScreenshot=true
  
    requestAnimationFrame(()=>{
      requestAnimationFrame(()=>{
        const dataUrl=canvas.toDataURL("image/png")
        takingScreenshot=false
        screenshotPaused=true
        const overlay=document.createElement("div")
        overlay.id = "ss-overlay"
        document.body.appendChild(overlay)
  
        const img = document.createElement("img")
        img.id="ss-preview"
        img.src=dataUrl
        overlay.appendChild(img)
  
        const actions = document.createElement("div")
        actions.id = "ss-actions"
        actions.innerHTML = `
        <span id="ss-label">screenshot captured!!</span>
        <div id="ss-actions-buttons">
        <button id="ss-download">download</button>
        <button id="ss-close">resume</button>
        </div>
        `
        overlay.appendChild(actions)
  
        requestAnimationFrame(()=>{
          overlay.classList.add("visible")
          img.classList.add("visible")
          actions.classList.add("visible")
        })
  
        document.getElementById("ss-download").addEventListener("click",()=>{
          const a = document.createElement("a")
          a.href=dataUrl
          a.download = `particle-sandbox-${Date.now()}.png`
          a.click()
          showToast("screenshot saved!", true)
        })
  
        document.getElementById("ss-close").addEventListener("click",()=>{
          overlay.classList.remove("visible")
          img.classList.remove("visible")
          actions.classList.remove("visible")
          setTimeout(()=>{
            overlay.remove()
            screenshotPaused=false
          }, 50)
        })
      })
    })
  },100)
  
}


function setModeBtn(key,isOn){
  const btn=document.getElementById(`btn-${key}`)
  if(!btn) return
  if(isOn) btn.classList.add("active")
  else btn.classList.remove("active")
}

function restartSimulation(){
  particles=[]
  blackHole=false;
  setModeBtn("b",false);
  bhAlpha=0
  slithermode=false
  setModeBtn("p",false);
  trailMode=false;
  setModeBtn("t",false)
  mergeMode=false;
  setModeBtn("m",false)
  gravityFlip=false;
  setModeBtn("g",false)
  lineMode=false;
  setModeBtn("l",false)
  interactMode=false;
  setModeBtn("i",false)
  zeroGravity=false;
  setModeBtn("z",false)
  bubbleMode=false;
  setModeBtn("n",false)
  orbitMode=false;
  setModeBtn("o",false);
  orbitAlpha=0;
  cycloneMode=false;
  setModeBtn("c",false);
  cyclones=[]
  explosionMode=false;
  setModeBtn("e",false)
  discoMode=false;
  setModeBtn("d",false)

  grabbedParticle=null
  chargedParticle=null
  chargeStart=null

  pullSlider.value=0.9
  dampenSlider.value=0.01
  sizeSlider.value=30
  countSlider.value=100

  canvas.style.cursor="default"
  hidePopup()

  storyMode=true;
  setModeBtn("s",true)
  currentStory=0
  storyAlpha=0
  storyState="fadein"
  storyTimer=0
  waitingForTrigger=false
  storyTriggered=false

  showToast("simulation restarted",null);
}

function toggleMode(key){
  window.dispatchEvent(new KeyboardEvent("keydown",{key:key.toUpperCase()}))
}

document.querySelectorAll(".scheme-dot").forEach(dot => {
  dot.addEventListener("click", () => {

    const nextScheme=dot.dataset.scheme

    if(nextScheme==="mono"&&discoMode){
      showToast("heads up! can't use mono palette in disco mode", false)
      return
    }

    if(currentScheme==="mono"&&nextScheme!=="mono"){
      currentScheme="default"
      particles.forEach(p=>{
        p.hue=COLOR_SCHEMES.default()
      })
    }
    currentScheme=nextScheme
    particles.forEach(p=>{
      p.hue=COLOR_SCHEMES[currentScheme]()
    })
    document.querySelectorAll(".scheme-dot").forEach(d => d.classList.remove("active"))
    dot.classList.add("active")
    showToast(`particles will use the ${currentScheme} palette from now`, true)
  })
})


document.querySelectorAll(".reset-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const slider = document.getElementById(btn.dataset.id)
    const display = document.getElementById(`${btn.dataset.id}-val`)
    slider.value = btn.dataset.default
    if (display) display.textContent = btn.dataset.default
  })
})

document.getElementById("spawn-btn").addEventListener("click",()=>{

  if(bubbleMode){
    showToast("can't spawn in bubble mode!",false)
    return
  }

  if(orbitMode){
    showToast("can't spawn in orbit mode!",false)
    return
  }

  if(particles.length>=MAX_PARTICLES){
    showToast("particle limit reached!", false)
    return
  }
  const count = Math.floor(parseFloat(countSlider.value)/10)
  const cx=canvas.width/2
  const cy=canvas.height/2
  const spread=120
  for(let i=0;i<count;i++){
    const angle=Math.random()*Math.PI*2
    const r=Math.random()*spread
    const p=createParticle(
      cx+Math.cos(angle)*r,
      cy+Math.sin(angle)*r
    )
    particles.push(p)
  }

  showToast(`spawned ${count} particles`,true)
  fireTrigger("click")
})


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


function showPopup(msg) {
  popup.innerHTML = msg
  popup.style.display = "flex"
}

function hidePopup() {
  popup.innerHTML = ""
  popup.style.display = "none"
}

function rollDice(){
  
  canvas.style.cursor = "default"
  playDiceSound();
  setTimeout(()=>{

    if(storyMode){
      storyMode=false
      setModeBtn("s",false);
    }
  
    if(blackHole) {
      blackHole=false;
      setModeBtn("b",false);
      bhAlpha=0;
      canvas.style.cursor="default"
    }
  
    if(trailMode){
      trailMode=false;
      setModeBtn("t",false);
    }
  
    
    if(mergeMode){
      mergeMode=false;
      setModeBtn("m",false);
    }
  
    
    if(gravityFlip){
      gravityFlip=false;
      setModeBtn("g",false);
    }
  
    
    if(lineMode){
      lineMode=false;
      setModeBtn("l",false);
    }
  
    
    if(interactMode){
      interactMode=false;
      setModeBtn("i",false);
      canvas.style.cursor="default";
    }
  
    
    if(zeroGravity){
      zeroGravity=false;
      setModeBtn("z",false);
      pullSlider.value = pullSlider.dataset.saved || 0.9;
    }
  
    
    if(orbitMode){
      orbitMode=false;
      setModeBtn("o",false);
      orbitAlpha=0;
    }
  
    if(repelMode){
      repelMode=false
      setModeBtn("x",false);
    }
    
    if(cycloneMode){
      cycloneMode=false;
      setModeBtn("c",false);
      cyclones=[];
      canvas.style.cursor="default";
    }
  
    
    if(explosionMode){
      explosionMode=false;
      setModeBtn("e",false);
      canvas.style.cursor="default";
    }
    hidePopup();
    particles=[]
  
    const schemes=Object.keys(COLOR_SCHEMES);
    const randomScheme = schemes[Math.floor(Math.random()*schemes.length)]
    currentScheme = randomScheme;
  
    document.querySelectorAll(".scheme-dot").forEach(dot=>{
      dot.classList.remove("active");
      if(dot.dataset.scheme===randomScheme){
        dot.classList.add("active");
      }
    })
  
    const preset = DICE_PRESETS[Math.floor(Math.random()*DICE_PRESETS.length)];
  
    preset.modes.forEach(key=>{
      if(key==="z"){
        zeroGravity=true;
        setModeBtn("z",true);
        pullSlider.dataset.saved = pullSlider.value
        pullSlider.value = 0
      }
      if(key==="l"){
        lineMode=true
        setModeBtn("l",true)
      }
  
      if(key === "b") {
        blackHole=true;
        setModeBtn("b",true);
        canvas.style.cursor="none"
      }
  
      if(key==="t"){
        trailMode=true;
        setModeBtn("t",true);
      }
  
      
      if(key==="m"){
        mergeMode=true;
        setModeBtn("m",true);
      }
  
      
      if(key==="g"){
        gravityFlip=true;
        setModeBtn("g",true);
      }
      
      if(key==="i"){
        interactMode=true;
        setModeBtn("i",true);
        canvas.style.cursor="default";
      }
  
      if(key==="o"){
        orbitMode=true;
        setModeBtn("o",true);
        canvas.style.cursor = "none"
  
        particles.forEach(p => {
          const dx = p.x - mouse.x
          const dy = p.y - mouse.y
          const dist = Math.sqrt(dx*dx + dy*dy) || 1
          const tx = dy/dist, ty = -dx/dist
          const kick = Math.sqrt(800 / Math.max(dist, 80))
          p.vx = tx * kick; p.vy = ty * kick
        })
      }
  
      
      if(key==="c"){
        cycloneMode=true;
        setModeBtn("c",true);
        canvas.style.cursor="crosshair";
        cyclones=[
          { x: canvas.width * 0.3, y: canvas.height * 0.4, id: Date.now() },
          { x: canvas.width * 0.7, y: canvas.height * 0.6, id: Date.now()+1 },
        ];
      }
        
      if(key==="e"){
        explosionMode=true;
        setModeBtn("e",true);
        canvas.style.cursor="crosshair";
      }
  
      const count = Math.min(Math.floor(parseFloat(countSlider.value) / 10) * 3, MAX_PARTICLES)
      for (let i = 0; i < count; i++) {
        particles.push(createParticle(
          Math.random() * canvas.width * 0.8 + canvas.width * 0.1,
          Math.random() * canvas.height * 0.8 + canvas.height * 0.1
        ))
      }
  
      if(preset.modes.includes("o")) {
        particles.forEach(p=>{
          const dx=p.x-mouse.x
          const dy=p.y-mouse.y
          const dist=Math.sqrt(dx*dx+dy*dy)||1
          const tx=dy/dist,ty=-dx/dist
          const kick=Math.sqrt(800/Math.max(dist,80))
          p.vx=tx*kick*(Math.random()*0.4+0.8)
          p.vy=ty*kick*(Math.random()*0.4+0.8)
        })
      }
  
      showToast(` ${preset.label} (${currentScheme} palette) 🎲`, true);

      if(!blackHole && !orbitMode && !cycloneMode && !explosionMode && !repelMode){
        canvas.style.cursor = "default"
      }
    })
  },100)
}

function showTutorialskipprompt() {
  const prompt = document.createElement("div")
  prompt.id="tutorial-skip"
  prompt.innerHTML=`
    <div id="skip-content">
      <span id="skip-text">if you want to explore on your own, press 'S' to skip the tutorial.</span>
    </div>
  `
  document.body.appendChild(prompt)

  requestAnimationFrame(()=>prompt.classList.add("visible"))

  const timeout = setTimeout(()=>dismissSkipPrompt(prompt),10000)
  prompt.dataset.timeout=timeout

  prompt._dismiss = () => dismissSkipPrompt(prompt,timeout)
  window._skipPromptDismiss=prompt._dismiss
}

function dismissSkipPrompt(prompt){
  if(!prompt||!prompt.parentNode) return
  prompt.classList.remove("visible")
  setTimeout(()=>prompt.remove(),400)
  window._skipPromptDismiss=null
}

document.getElementById("ss-btn").addEventListener("click",()=>{
  const btn = document.getElementById("ss-btn")

  btn.classList.remove("clickin")
  btn.classList.add("clickin")
  btn.addEventListener("animationend",()=>btn.classList.remove("clickin"),{once:true})

  setTimeout(()=>{
    takeSS();
  },100)


})

document.getElementById("dice-btn").addEventListener("click",()=>{
  const btn=document.getElementById("dice-btn")

  btn.classList.remove("rolling")
  void btn.offsetWidth
  btn.classList.add("rolling")
  btn.addEventListener("animationend",()=>btn.classList.remove("rolling"), {once:true})

  setTimeout(()=>{
    rollDice()
  }, 150)

})

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
  if(explosionMode) return
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


  if(cycloneMode){
    if(cyclones.length>=MAX_CYCLONES){
      showToast(`max ${MAX_CYCLONES} cyclones! press DEL to reset`,false)
      return
    }
    cyclones.push({x:e.clientX,y:e.clientY,id:Date.now()})
    showToast(`cyclone placed (${cyclones.length}/${MAX_CYCLONES}).`, true)
    return
  }

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


window.addEventListener("keydown", (e) => {

  if(e.key==="Escape"){
    const overlay = document.getElementById("ss-overlay")
    if(overlay){
      overlay.classList.remove("visible")
      const img = overlay.querySelector("#ss-preview")
      const actions = overlay.querySelector("#ss-actions")
      if(img) img.classList.remove("visible")
      if(actions) actions.classList.remove("#visible")
      setTimeout(()=>{
        overlay.remove()
        screenshotPaused=false
    },50)
    }
  }

  if(e.key==="p"||e.key==="P"){

    if(!slithermode){
      if(blackHole) {blackHole=false; setModeBtn("b",false),bhAlpha=0}
      if(trailMode) {trailMode=false; setModeBtn("t",false)}
      if(gravityFlip) {gravityFlip=false; setModeBtn("g",false)}
      if(bubbleMode) {bubbleMode=false; setModeBtn("n",false),disableBubbleMode()}

    }

    slithermode=!slithermode
    setModeBtn("p",slithermode);
    if(slithermode){
      pullSlider.dataset.slithersaved=pullSlider.value
      pullSlider.value=0 //gravity0 banayo
      particles.forEach(p=> {
        p.vx=(Math.random()-0.5)*1.5
        p.vy=(Math.random()-0.5)*1.5
      })
      showToast("slither mode ONN",true)
    } else {
      pullSlider.value=pullSlider.dataset.slithersaved||0.9
      showToast("slither mode OFF",false)
    }
    fireTrigger("p")
  }

  if(e.key==="d"||e.key==="D"){
    if(discoWarningOpen) true
    if(bubbleMode) {
      showToast("exit bubble mode first");
      return
    }
    discoMode=!discoMode
    setModeBtn("d",discoMode)
    if(discoMode){
      enableDiscoMode()
    } else {
      stopDisco()
    }
  }

  if(e.key==="q"||e.key==="Q"){
    takeSS();
  }
  if(e.key==="h"||e.key==="H"){
    togglePanel();
  }

  if(e.key==="r"||e.key==="R"){
    restartSimulation();
  }

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
    setModeBtn("b",blackHole)

    if (blackHole && particles.length === 0) {
      showToast("add some particles first!", false)
    }

    canvas.style.cursor=blackHole?"none":"default"
    fireTrigger("b");
  }

  if (e.key === "t" || e.key === "T") {
    trailMode = !trailMode
    setModeBtn("t", trailMode)
    showToast(trailMode ? "trail mode ON" : "trail mode OFF", trailMode)
    fireTrigger("t");
    

    if(trailMode){
      if(lineMode){
        lineMode=false
        setModeBtn("l",false);
        showToast("line mode turned off to save performance")
      }
    }
  }

  if (e.key === "s" || e.key === "S") {
    if(window._skipPromptDismiss) window._skipPromptDismiss()
    storyMode = !storyMode;
    setModeBtn("s", storyMode)
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
    setModeBtn("m", mergeMode)
    showToast(mergeMode ? "merge mode ON" : "merge mode OFF", mergeMode)
    fireTrigger("m");
  }

  if (e.key === "g" || e.key === "G") {
    gravityFlip = !gravityFlip;
    setModeBtn("g", gravityFlip)
    showToast(gravityFlip ? "gravity flip ON" : "gravity flip OFF", gravityFlip)
    fireTrigger("g");
  }

  if (e.key === "l" || e.key === "L") {
    if(trailMode){
      showToast("exit trail mode first")
      return
    }
    lineMode = !lineMode;
    setModeBtn("l", lineMode)
    showToast(lineMode ? "line mode ON" : "line mode OFF", lineMode)
    fireTrigger("l");
  }

  if (e.key === "i" || e.key === "I") {
    if (blackHole) { showToast("turn off black hole first"); return }
    interactMode = !interactMode
    setModeBtn("i", interactMode)

    if (interactMode) {
      showPopup(`grab & throw particles. you can't create new particles in interact mode. press 'I' to exit`)

      if (particles.length === 0) {
        showToast("add some particles first!", false)
      }

      canvas.style.cursor = "grab"
    } else {
      hidePopup()
      if (grabbedParticle) grabbedParticle = null
      canvas.style.cursor = "default"
    }

    fireTrigger("i")
  }

  if (e.key === "z" || e.key === "Z") {
    zeroGravity = !zeroGravity
    setModeBtn("z", zeroGravity)

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

    if(discoMode){
      discoMode=false
      setModeBtn("d",false)
      stopDisco()
    }
    setModeBtn("n", bubbleMode)
    if (bubbleMode) {
      enableBubbleMode()
      showPopup(`hover over the bubbles to pop them. you can't create new particles in bubble mode. press "N" to exit.`)
    } else {
      disableBubbleMode()
      hidePopup()
    }

    fireTrigger("n")
  }

  if(e.key==="o"||e.key==="O"){
    if(bubbleMode){ showToast("exit bubble mode first"); return}
    if(blackHole){ showToast("exit black hole mode first"); return}
    if(interactMode){showToast("exit interact mode first"); return}
    orbitMode=!orbitMode
    setModeBtn("o", orbitMode)
    if(orbitMode) 
    {    
      const cap=80
      if(particles.length>cap){
        particles=particles.slice(particles.length-cap)
        showToast(`reduced to ${cap} particles for orbit mode`,null);
      }

      particles.forEach(p=>{
        const dx=p.x-mouse.x
        const dy=p.y-mouse.y
        const dist=Math.sqrt(dx*dx+dy*dy)||1
        const tx=dy/dist
        const ty=-dx/dist
        const kickSpeed=Math.sqrt(800/Math.max(dist,80)) 
        p.vx=tx*kickSpeed*(Math.random()*0.4+0.8)
        p.vy=ty*kickSpeed*(Math.random()*0.4+0.8)
      })

      showPopup(`orbit mode: particles orbit the sun(mouse)· press 'o' to exit`)
      canvas.style.cursor = orbitMode?"none":"default"
  
    } else {
      hidePopup();
    }

    fireTrigger("o")
  }


  if(e.key==="c"||e.key==="C"){
    if(bubbleMode){ showToast("exit bubble mode first"); return}
    if(blackHole){ showToast("exit black hole mode first"); return}

    cycloneMode=!cycloneMode
    setModeBtn("c",cycloneMode)
    if(cycloneMode) 
    {    
      cyclones=[]
      canvas.style.cursor="crosshair"
      showPopup(`right click -> place a cyclone (max=${MAX_CYCLONES}). left click -> spawn particles. DEL -> remove all cyclones. press 'C' to exit.`)
      showToast("cyclone mode ON", true)
    } else {
      cyclones=[]
      canvas.style.cursor="default"
      hidePopup();
      showToast("cyclone mode OFF", false)
    }
    fireTrigger("c")
  }

  if(e.key==="Delete"||e.key==="Backspace"){
    if(cycloneMode && cyclones.length>0){
      cyclones=[]
      showToast("all cyclones cleared",null)
    }
  }

  if(e.key==="e"||e.key==="E"){
    if(bubbleMode) {showToast("exit bubble mode first");return}
    explosionMode=!explosionMode
    setModeBtn("e",explosionMode)
    if(explosionMode){
      if(particles.length===0){
        showToast("add some particles first!",false)
      }
      showPopup(`explosion mode: hole left click on a particle=charge, release to BOOOOOM. press 'E' to exit.`);
      canvas.style.cursor="crosshair"
    } else {
      chargeStart=null
      chargedParticle=null
      canvas.style.cursor="default"
      hidePopup()
    }
    fireTrigger("e");
  }

  if(e.key==="x"||e.key==="X"){
    if(bubbleMode) {
      showToast("exit bubble mode first");
      return
    }
    repelMode = !repelMode
    setModeBtn("x",repelMode)
    canvas.style.cursor=repelMode?"none":"default"
    showToast(repelMode ? "repel mode ON": "repel mode OFF",repelMode)
    fireTrigger("x")
  }


});

canvas.addEventListener("mousedown",(e)=>{
  if(e.button!==0) return
  isMouseDown=true

  if (explosionMode && e.button === 0) {
    let closest = null
    let closestDist = 60 
    particles.forEach(p => {
      const dx = p.x - e.clientX
      const dy = p.y - e.clientY
      const dist = Math.sqrt(dx*dx + dy*dy)
      if (dist < closestDist) { closestDist = dist; closest = p }
    })
    if (closest) {
      chargedParticle = closest
      chargedParticle._origSize = closest.size  
      chargeStart = Date.now()
    }
    return
  }
  

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
  
  if (explosionMode && e.button === 0 && chargedParticle && chargeStart) {
    const held = Date.now() - chargeStart
    const p = chargedParticle
    chargedParticle = null
    chargeStart = null

    if (held > MAX_CHARGE_MS) {
      p.size = p._origSize 
      showToast("held too long... fizzled 💨", null)
      shockwaves.push({ x: p.x, y: p.y, radius: 0, alpha: 0.3 })
      return
    }

    const t = held / MAX_CHARGE_MS
    const blastRadius = 80 + t * 350
    const blastForce = 10 + t * 35
    const px = p.x, py = p.y

    particles.splice(particles.indexOf(p), 1)

    particles.forEach(other => {
      const dx = other.x - px
      const dy = other.y - py
      const dist = Math.sqrt(dx*dx + dy*dy) || 1
      if (dist > blastRadius) return
      const falloff = 1 - dist / blastRadius
      const nx = dx / dist, ny = dy / dist
      other.vx += nx * blastForce * falloff
      other.vy += ny * blastForce * falloff
      // other.hue = Math.random() * 60  
      other.hue = COLOR_SCHEMES[currentScheme]();
    })

    const rings = Math.floor(1 + t * 4)
    for (let i = 0; i < rings; i++) {
      setTimeout(() => {
        shockwaves.push({ x: px, y: py, radius: i * 20, alpha: 0.9 - i * 0.15 })
      }, i * 50)
    }

    showToast(held < 1000 ? "pop 💥" : held < 5000 ? "BOOM 💥" : "MEGABLAST 💥💥", true)
    return
  }

  if (grabbedParticle) {
    grabbedParticle.grabbed = false
    grabbedParticle = null
    canvas.style.cursor = interactMode ? "grab" : "default"
  }
})

setTimeout(showTutorialskipprompt,25000)



function showChaloptin(){
  const optInelem=document.getElementById("challenge-optin");
  requestAnimationFrame(()=>optInelem.classList.add("visible"))
  document.getElementById("optin-yes").addEventListener("click",()=>{
    chalOn=true
    document.getElementById("chal-panel-row").style.display="flex"
    optInelem.classList.remove("visible");
    setTimeout(()=>optInelem.style.display="none",300)
    startChal()
    showToast(`challenges enabled!! first one will be after ${nextchalin} seconds`, true)
  })

  document.getElementById("optin-no").addEventListener("click",()=>{
    optInelem.classList.remove("visible")
    setTimeout(()=>optInelem.style.display="none",300)
    showToast("no worries, explore the sandbox!",null)
  })
}

setTimeout(showChaloptin,20000)