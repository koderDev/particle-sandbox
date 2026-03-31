const CHALLENGES = [
    { id: "chal1", text: "spawn more than 10 particles!", time: 20}
]

function getRandChal() {
    return CHALLENGES[Math.floor(Math.random()*CHALLENGES.length)]
}

function showChal(){
    if(!chalOn) return
    if(currChal) return

    const c=getRandChal()
    currChal=c
    chalTimeRem=c.time

    const chalElem=document.createElement("div")
    chalElem.id="challenge-popup"
    chalElem.innerHTML = `
        <span id="challenge-tag">CHALLENGE</span>
        <span id="challenge-text">${c.text}</span>
        <span id="challenge-timer-text">[ you have <span id="challenge-seconds">${c.time}</span>s ]</span>
        `

    document.body.appendChild(chalElem)
    requestAnimationFrame(()=>chalElem.classList.add("visible"))

    document.getElementById("challenge-border").style.display="block"

    chalCheckInt=setInterval(()=>{
        chalTimeRem--
        const chalSec=document.getElementById("challenge-seconds")
        if(chalSec) chalSec.textContent=chalTimeRem
        if(chalTimeRem<=5&&chalSec) chalSec.style.color="#f66"

        if(chalTimeRem<=0){
            chalLost()
        }
    },1000)
}

function removeChal(){
    const chalElem=document.getElementById("challenge-popup")
    if(!chalElem) return
    chalElem.classList.remove("visible")
    setTimeout(()=>chalElem.remove(),400)
}

function chalLost(){
    clearInterval(chalCheckInt)
    currChal=null
    removeChal()
    document.getElementById("challenge-border").style.display="none"
    showToast("better luck next time", false)
    setTimeout(showChal,30000)

}

function startChal(){
    if(!chalOn) return
    setTimeout(showChal,1000)
}