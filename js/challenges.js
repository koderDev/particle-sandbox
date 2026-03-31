const CHALLENGES = [
    { id: "chal1", text: "spawn more than 10 particles!", time: 20}
]

function getRandChal() {
    return CHALLENGES[Math.floor(Math.random()*CHALLENGES.length)]
}

function showChal(){
    if(!chalOn) return
    const c=getRandChal()
    currChal=c
    chalTimeRem=c.time

    const chalElem=document.createElement("div")
    chalElem.id="challenge-popup"
    chalElem.innerHTML = `
        <span id="challenge-tag">CHALENGE</span>
        <span id="challenge-text">${c.text}</span>
        <span id="challenge-tag">you have <span id="challenge-seconds>${c.time}</span>s</span>
    `

    document.body.appendChild(chalElem)
    requestAnimationFrame(()=>chalElem.classList.add("visible"))
}

function startChal(){
    if(!chalOn) return
    setTimeout(showChal,1000)
}