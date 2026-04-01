const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particles = [];
const MAX_PARTICLES = 420;
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