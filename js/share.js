const { jsx } = require("react/jsx-runtime")

function getSimState(){
    return {
        modes: {
            s:storyMode,
            b:blackHole,
            t:trailMode,
            m:mergeMode,
            g:gravityFlip,
            l: lineMode,
            z: zeroGravity,
            o: orbitMode,
            x: repelMode,
            d: discoMode,
            p:slithermode,
        },
        sliders: {
            pull: pullSlider.value,
            dampen:dampenSlider.value,
            count:countSlider.value,
            size: sizeSlider.value,
            maxpart:document.getElementById("maxpart").value
        },
        scheme:currentScheme,
        pcount:Math.min(particles.length,150)//cappin at 150
    }
}

function encodeState(st){
    return btoa(JSON.stringify(st))
}

function genShareUrl(){
    const state=getSimState()
    const encoded=encodeState(state)
    return `${window.location.origin}${window.location.pathname}?sim=${encoded}`
}

function cpyShareUrl(){
    const url=genShareUrl();

    navigator.clipboard.writeText(url).then(()=>{
        showToast("link copied!! share it with friends :)",true);
    }).catch((err)=>{
        console.error("copy failed", err);
        showToast("copy failed. please try again",false);
    })
}

function applyModes(modes){
    if(!modes) return
    // const modeMap={
    //    b:"B",t:"T",m:"M",g:"G",l:"L",z:"Z",o:"O",x:"X",p:"P"
    // }
    
    const modeMap={
        b:"B",t:"T",m:"M",g:"G",l:"L",o:"O",x:"X"
    }
    
    if(typeof modes.s!=='undefined'){
        storyMode=modes.s
        setModeBtn("s",storyMode)
        if(storyMode){
            currentStory=0
            storyAlpha=0
            storyState="fadein"
            storyTimer=0
            waitingForTrigger=false
            storyTriggered=false
        }
    }

    Object.entries(modes).forEach(([key,isOn])=>{
        if(!isOn||!modeMap[key]) return
        if(key==="o" && particles.length===0) return;
        if(key==="b" && orbitMode) return
        window.dispatchEvent(new KeyboardEvent("keydown", {key: modeMap[key]}))
    })

    if(modes.z){
        zeroGravity=true
        setModeBtn("z",true)
        pullSlider.dataset.saved=sliders?.pull || 0.9
        pullSlider.value = 0
    }

    if(modes.p){
        slithermode=true
        setModeBtn("p",true)
        pullSlider.dataset.slithersaved=sliders?.pull|0.9
        pullSlider.value=0
        particles.forEach(p=>{
            p.vx=(Math.random()-0.5)*1.5
            p.vy=(Math.random()-0.5)*1.5
        })
    }

    if(modes.d && currentScheme!=="mono"){
        setTimeout(()=>{
            discoMode=true
            setModeBtn("d",true)
            enableDiscoMode()
        },1500)
    }

}

function spawnParticles(count){
    if(!count||count<=0) return
    const n=Math.min(count,MAX_PARTICLES)
    for(let i=0;i<n;i++){
        particles.push(createParticle(
            Math.random()*canvas.width*0.7+canvas.width*0.15,
            Math.random()*canvas.height*0.7+canvas.height*0.15
        ))
    }  
}

function decodeState(encoded){
    try {
        return JSON.parse(atob(encoded))
    } catch(e) {
        console.log("couldn't decode state",e)
        return null
    }
} 

function applySliders(sliders) {
    if(!sliders) return
    pullSlider.value=sliders.pull||0.9
    dampenSlider.value=sliders.dampen||0.01
    countSlider.value=sliders.count || 100
    sizeSlider.value=sliders.size||30
    const maxElem =document.getElementById("maxpart")
    if(maxElem) maxElem.value=sliders.maxpart||420
    MAX_PARTICLES=parseInt(sliders.maxpart||420)
}

function applyPalette(clrscheme){
    if(!clrscheme) return
    currentScheme=clrscheme
    document.querySelectorAll(".scheme-dot").forEach(d=>{
        d.classList.toggle("active",d.dataset.scheme===clrscheme)
    })
}

function loadfromUrl(){
    const params=new URLSearchParams(window.location.search)
    const sim=params.get("sim")
    if(!sim) return

    const state=decodeState(sim)
    if(!state){
        showToast("couldn't load shared sim :(",false)
        return
    }

    setTimeout(()=>{
        applySliders(state.sliders)
        applyPalette(state.scheme)
        spawnParticles(state.pcount)

        setTimeout(()=>{
            applyModes(state.modes, state.sliders)
            showToast("shared simulation loaded!! 🔥",true)
        },100);
        window.history.replaceState({},"",window.location.pathname)
    },500)
}
