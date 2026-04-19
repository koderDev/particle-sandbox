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
