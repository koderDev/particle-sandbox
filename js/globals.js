const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let diceRolls = 0
let gravityToggles = 0
let lastGravTime=0
let sessionMaxParticles=0

const ACHIEVEMENTS=[
    // { id: 'chaos_masterrr', text: 'Spawn more than 10 particles!', check: () => particles.length >= 10 } //just for testin
    {
        id: 'rolly_molly',
        text: 'rolled the dice 5 times!',
        check: () => diceRolls >= 5
    },
    {
        id: 'heavyweight',
        text:'maximum particle size!!!',
        check:()=>parseFloat(sizeSlider.value)>=parseFloat(sizeSlider.max)
    },
    {
        id:'flippity',
        text:'quick gravity toggerr',
        check: ()=>gravityToggles>=10
    },
    {
        id: 'ice_skater',
        text: 'MAXIMUM friction achieved!',
        check: ()=>parseFloat(dampenSlider.value)===parseFloat(dampenSlider.max)
    },
    {
        id:'super_massive',
        text:'MAX GRAVITY. HAIL NEWTON!!',
        check:()=> parseFloat(pullSlider.value)===parseFloat(pullSlider.max)
    }
];


const savedAchievements= JSON.parse(sessionStorage.getItem('unlockedAchievements')) || [];
const unlockedAchievements = new Set(savedAchievements);

function checkAchievements() {
    ACHIEVEMENTS.forEach(ach=>{
        if(!unlockedAchievements.has(ach.id) && ach.check()){
            unlockAch(ach.id);
            console.log(`unlocked:${ach.id}`);
        }
    })
}

function unlockAch(id){
    if(unlockedAchievements.has(id)) return;
    unlockedAchievements.add(id);
    sessionStorage.setItem('unlockedAchievements',JSON.stringify([...unlockedAchievements]));
    const ach=ACHIEVEMENTS.find(ach=>ach.id===id);
    if(!ach) return;
    showAchievementToast(ach);
}

function showAchievementToast(ach){
    const elem=document.createElement("div")
    elem.id="achievement-toast"
    elem.innerHTML=`
        <div id="ach-text">
            <span id="ach-title">achievement unlocked</span>
            <span id="ach-desc">${ach.text}</span>
        </div>
    `
    document.body.appendChild(elem)
    requestAnimationFrame(()=>elem.classList.add("visible"))
    setTimeout(()=>{
        elem.classList.remove("visible")
        setTimeout(()=>elem.remove(),400)
    },4000)
}


const POOL_SIZE=300
const particlePool=[]
for(let i=0;i<POOL_SIZE;i++){
    particlePool.push({
        x:0,y:0,vx:0,vy:0,size:0,mass:1,hue:0,isBubble:false,grabbed:false,_origSize:0
    })
}

function recycleParticle(p){
    p.isBubble=false;
    p.grabbed=false;
    if(particlePool.length<POOL_SIZE) particlePool.push(p)
}

let particles = [];
let MAX_PARTICLES = 420;

let mouse = { x: window.innerWidth/2, y: window.innerHeight/2 };

const pullSlider = document.getElementById("pull");
const dampenSlider = document.getElementById("dampen");
const sizeSlider = document.getElementById("size");
const countSlider = document.getElementById("count");

const pcount = document.getElementById("pcount");
pcount.textContent = particles.length;

let blackHole = false;
let zeroGravity=false
let trailMode = false;
let mergeMode = false;
let gravityFlip = false;
let cycloneMode = false
let lineMode = false;
let interactMode = false;
let bubbleMode = false
let orbitMode = false
let explosionMode=false
let discoMode = false

let discoInterval = null
let discoWarningShown = false
let discoWarningOpen = false

let shockwaves = [];

let cyclones = []
const MAX_CYCLONES=5
const CYCLONE_RADIUS=150

let chargedParticle=null
let chargeStart=null
let chargeX=0
let chargeY=0
const MAX_CHARGE_MS=10000

const popup = document.getElementById("popup")

let toastTimeout=null
let grabbedParticle = null;
let orbitAlpha=0;
let bhAlpha = 0;

let isMouseDown = false

const COLOR_SCHEMES = {
    default:    () => Math.random() * 360,
    fire:       () => Math.random() * 60,
    ice:        () => 180 + Math.random() * 60,
    neon:       () => [300, 120, 200, 60][Math.floor(Math.random()*4)]+Math.random()*30,
    mono:       () => 0,
}

let currentScheme = "default"

const MILESTONES=new Set([50,100,200,300,400])
const MILESTONE_COLORS = {
    50: "#62ff9c",
    100: "#beff62",
    200: "#fffa62",
    300: "#ffcb62",
    400: "#ff6262",
}
let lastMilestone = 0


let repelMode=false
let repelAlpha = 0

let panelVisible = true
let screenshotPaused= false
let takingScreenshot=false

let chalOn = false
let currChal = null
let chalTimeRem = 0
let chalCheckInt = null

let nextchalin=0
let nextchaltimer=null

let slithermode=false
let slithertime=0

let resizetimeout;
let fpsCount=0
let isLongPress=false;

window.addEventListener("resize",()=>{
    clearTimeout(resizetimeout)
    resizetimeout=setTimeout(()=>{
        handleResize()
    },200)
})

function handleResize() {
    canvas.width=window.innerWidth;
    canvas.height=window.innerHeight;
}

let tiltMode=false
let tiltGravX=0
let tiltGravY=0
let tiltPerms=false

const isMobile = ('ontouchstart' in window) && window.matchMedia("(max-height: 500px)").matches;
console.log(isMobile);