const CHALLENGES = [
    { id: "spawn67", text: "spawn more than 67 particles!", time: 20, check: ()=>particles.length>67},

    {   id: "orbit30",
        text: "have 30+ particles orbiting the sun",
        time:30,
        check:()=>orbitMode&&particles.length>=30
    },

    {   id: "blackhole50",
        text: "eat 50+ particles in blackhole mode",
        time: 30,
        eaten: 0,
        lastCount: 0,
        onstart: function(){
            this.eaten=0
            this.lastCount=particles.length
        },
        check: function() {
            const now=particles.length
            if(blackHole&& now<this.lastCount){
                this.eaten+=this.lastCount-now
            }
            this.lastCount=now
            return this.eaten>=50
        }
    },
    { id:"cyclone4",text:"place 4 cyclones while having 60+ particles!",time:35, check:()=> cycloneMode && cyclones.length>=4 && particles.length>=60},
    {
        id:"disco50",
        text:"get 55+ particles dancing in disco mode",
        time:25,
        check: ()=> discoInterval && particles.length>=50
    }, 
    {
        id: "merge6",
        text:"merge particles until 6 (or less) particles remain!",
        time:36,
        check: ()=> mergeMode && particles.length<=6 && particles.length >0
    },
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

        if(!currChal) { 
            clearInterval(chalCheckInt); 
            return
        }

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
    // 2-3 minute ko gap ma arko challenge dine, maybe i can improve this in future versions - prod ko lagi
    const delay=Math.floor(Math.random()*60000)+120000
    // const delay = 1000 //debug yesma
    schedulenextchal(delay);
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
    const delay=Math.floor(Math.random()*60000)+120000 //prodyesma
    // const delay=1000 //debug yesma
    schedulenextchal(delay)
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
    },8000)
}

function startChal(){
    if(!chalOn) return
    const delay=Math.floor(Math.random()*45000)+45000; //prod ko lagi
    // const delay=1000 //debug ko lagi
    schedulenextchal(delay)
}

function schedulenextchal(delay){
    if(!chalOn) return
    nextchalin=Math.floor(delay/1000)

    if(nextchaltimer) clearInterval(nextchaltimer)
    nextchaltimer=setInterval(() => {
        if(!chalOn) { 
            clearInterval(nextchaltimer); 
            return
        }
        if(currChal) return
        nextchalin--
        updatenextchal()
        if(nextchalin<=0){
            clearInterval(nextchaltimer)
            showChal()
        }
    }, 1000);
}

function updatenextchal() {
    const label=document.getElementById("next-chal-label");
    const indicator=document.getElementById("panel-indicator")
    if(!label) return
    if(currChal){
        label.textContent="challenge active!"
        label.style.color="#fa0"
    } else if (!chalOn) {
        label.textContent=""
    } else {
        label.textContent=`next: ${nextchalin}s`
        label.style.color="#fff"
    }

    if(indicator && !panelVisible){
        const challengeappendtext=currChal ? ` | challenge ACTIVE!` : chalOn? ` | next challenge in: ${nextchalin}s` : ""
        indicator.textContent="PANEL(h): OFF | RESTART (R) | SCREENSHOT (Q) | LMB (SPAWN) | RMB (SHOCKWAVE)"+challengeappendtext
    }
}

