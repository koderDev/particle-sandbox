const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particles = [];
const MAX_PARTICLES = 420;
let mouse = { x: window.innerWidth/2, y: window.innerHeight/2 };


//sliderss
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
let lineMode = false; // on by default
let interactMode = false;
let bubbleMode = false
let orbitMode = false
let explosionMode=false

let shockwaves = [];

let cyclones = []
const MAX_CYCLONES=5
const CYCLONE_RADIUS=150

let chargedParticle=null
let chargeStart=null
let chargeX=0
let chargeY=0
const MAX_CHARGE_MS=10000 //10seconds max

const popup = document.getElementById("popup")

let toastTimeout=null
let grabbedParticle = null;
let orbitAlpha=0;
let bhAlpha = 0;

let isMouseDown = false



