function applyDeviceMotion(evnt){
    if(!tiltMode||!tiltPerms) return
    const accn=evnt.accelerationIncludingGravity
    if(!accn) return
    const scale=0.05 //responsive banauna lai
    tiltGravX=-(accn.x||0)*scale
    tiltGravY=(accn.y||0)*scale
}

function enableTilt(){
    tiltMode=true
    if(tiltPerms){
        showToast("tilt mode ON, move device and particles move acccordingly",true)
        return
    }
}

function disableTilt(){
    tiltMode=false
    setModeBtn("tilt",false)
    tiltGravX=0
    tiltGravY=0
    showToast("tilt mode OFFF",false)
}