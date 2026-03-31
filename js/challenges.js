const CHALLENGES = [
    { id: "spawn67", text: "spawn more than 67 particles!", time: 20, check: ()=>particles.length>67},
    { id: "blackhole50", text: "eat 50+ particles in blackhole mode", time: 30, startCount:0, onstart:function(){ this.startCount=particles.length}, check: function(){return blackHole&&particles.length<this.startCount-50}}
]

const winchaltext=[
    "wohooo! challenge completed!!!",
    "YOU CRUSHED IT!",
    "seems like you're a proo",
    "chaos master FR",
    "not bad!!",
    "ate and left no crumbs hehe",
    "let em' coooook",
    "bro is locked in"
]

const losschaltext = [
    "better luck next time!",
    "thats sad",
    "ts so tuff, ngl",
    "skill issue LOL.. jk",
    "sooo close, try again next time!",
    "bro won hearts, atleast",
    "need to lock in mate",
    "need to cook next time",
]

let playedChal=[]

function getRandChal() {
    if(playedChal.length>=CHALLENGES.length) playedChal=[]
    const remaining = CHALLENGES.filter(c=>!playedChal.includes(c.id))
    const c=remaining[Math.floor(Math.random()*remaining.length)]
    playedChal.push(c.id)
    return {...c}  // chalenge ko copy dinxa
}

function showChal(){
    if(!chalOn) return
    if(currChal) return

    const c=getRandChal()
    currChal=c
    chalTimeRem=c.time
    if(c.onstart) c.onstart()

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

        if(!currChal) { clearInterval(chalCheckInt); return}

        if(currChal.check && currChal.check()){
            chalwon()
            return
        }

        chalTimeRem--
        const chalSec=document.getElementById("challenge-seconds")
        if(chalSec) chalSec.textContent=chalTimeRem
        if(chalTimeRem<=5&&chalSec) chalSec.style.color="#f66"

        if(chalTimeRem<=0){
            challost()
        }
    },1000)
}

function chalwon(){
    clearInterval(chalCheckInt)
    currChal=null
    removeChal()
    document.getElementById("challenge-border").style.display="none"
    const msg=winchaltext[Math.floor(Math.random()*winchaltext.length)]
    showChalRizzult(msg,true)
    setTimeout(showChal,5000);
}

function removeChal(){
    const chalElem=document.getElementById("challenge-popup")
    if(!chalElem) return
    chalElem.classList.remove("visible")
    setTimeout(()=>chalElem.remove(),300)
}

function challost(){
    clearInterval(chalCheckInt)
    currChal=null
    removeChal()
    document.getElementById("challenge-border").style.display="none"
    const msg=losschaltext[Math.floor(Math.random()*losschaltext.length)]
    showChalRizzult(msg,false)
    setTimeout(showChal,5000)

}

function showChalRizzult(msg,won){
    const rizzltElem=document.createElement("div")
    rizzltElem.id="challenge-result"
    rizzltElem.classList.add(won?"won":"lost")
    rizzltElem.innerHTML=`
        <span>${won?"🌹":"🥀"}</span>
        <span>${msg}</span>
    `

    document.body.append(rizzltElem)
    requestAnimationFrame(()=>rizzltElem.classList.add("visible"))
    setTimeout(()=>{
        rizzltElem.classList.remove("visible")
        setTimeout(()=>rizzltElem.remove(),300)
    },5000)
}

function startChal(){
    if(!chalOn) return
    setTimeout(showChal,1000)
}