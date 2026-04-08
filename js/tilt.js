function applyDeviceMotion(evnt){
    if(!tiltMode||!tiltPerms) return
    const accn=evnt.accelerationIncludingGravity
    if(!accn) return
    const scale=0.09 //responsive banauna lai
    tiltGravX=-(accn.x||0)*scale
    tiltGravY=(accn.y||0)*scale
}

async function requestTiltperm(){
    //ios13+ lai perms chahincha
    if(typeof DeviceMotionEvent!=="undefined"&& typeof DeviceMotionEvent.requestPermission==="function"){
        try {
            const result= await DeviceMotionEvent.requestPermission()
            if(result==="granted"){
                tiltPerms=true
                window.addEventListener("devicemotion",applyDeviceMotion)
                return true
            } else {
                showToast("tilt perms denieddd :(",false)
                return false
            }
        } catch(ev){
            showToast("tilt not available. maybe some errorss",false)
            return false
        }
    } else if(typeof DeviceMotionEvent!=="undefined"){
        //non ios lai perms chaidaina
        tiltPerms=true;
        window.addEventListener("devicemotion",applyDeviceMotion)
        return true
    } else {
        showToast("tilt not supported on this device",false)
        return false
    }
}

function enableTilt(){
    tiltMode=true
    setModeBtn("tilt",true)

   if(tiltPerms){
        showToast("tilt mode ON, tilt device and particles move acccordingly",true)
        return
    }

    requestTiltperm().then(granted=>{
        if(granted){
            showToast("tilt mode ONN, tilt device and particles move too",true)
        } else {
            tiltMode=false
            setModeBtn("tilt",false)
        }
    })
}

function disableTilt(){
    tiltMode=false
    setModeBtn("tilt",false)
    tiltGravX=0
    tiltGravY=0
    showToast("tilt mode OFFF",false)
}