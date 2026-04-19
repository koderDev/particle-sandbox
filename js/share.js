function getSimState(){
    return {
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
        showToast("loading shared simulation.. 🔥",null)
        window.history.replaceState({},"",window.location.pathname)
    },400)
}