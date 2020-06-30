//Context of our application
var client = null;
var devices = [];
var patternDateStarted = null;
var timeInterval = null;
var intensity = null;
var isVibrating = false;


//Set action on synchronisation button
document.getElementById("button-sync").addEventListener("click", async (ev) => {
    //Init all services to control most toys
    if (client === null) {
        client = new Buttplug.ButtplugClient("ButtplugClient");

        try {
            const connector = new Buttplug.ButtplugEmbeddedClientConnector();
            await client.Connect(connector);
        } catch (e) {
            console.log(e);
            return;
        }
    }
    
    //Add an action when a new device is added.
    //Here it's going to add the name of the device to a collection and write all names in the element with id "toys-available".
    client.addListener('deviceadded', async (device) => {        
        //When we've found a device we stop the scan.
        await client.StopScanning();
        document.getElementById("toys-available").innerText = "";
        devices.push(device); //this line add a device to the array "devices".
        devices.forEach(device => {
            document.getElementById("toys-available").innerText += device._name + "; ";
        });
    });

    //Add an action when a device is removed (lost connection for example).
    //Here it's going to remove the device from the collection and rewrite all names in the element with id "toys-available".
    client.addListener('deviceremoved', async (device) => {
        document.getElementById("toys-available").innerText = "";
        devices.pop(device); //this line remove a device from the array "devices".
        devices.forEach(device => {
            document.getElementById("toys-available").innerText += device._name + "; ";
        });
    });

    //Everything is initialized, we can launch the scan.
    await client.StartScanning();
});

//Listen to change on the slider value and set it in our variable intensity.
document.getElementById("slider-power").addEventListener("input", (ev) => {
    intensity = parseFloat(document.getElementById("slider-power").value);
});

//When start is clicked we launch the first pattern.
document.getElementById("button-start").addEventListener("click", (ev) => {
    startPattern('0');
});

//When stop is clicked we stopped the pattern loop and the vibration.
document.getElementById("button-stop").addEventListener("click", (ev) => {
    stopPatternInterval();
    stopVibrating();
});

//Launch a slow frequency pattern. Bzz * * * Bzz * * * Bzz.
document.getElementById("button-pattern-slow").addEventListener("click", (ev) => {
    startPattern('1');
});

//Launch a middle frequency pattern.Bzz * * Bzz * * Bzz.
document.getElementById("button-pattern-medium").addEventListener("click", (ev) => {
    startPattern('2');
});

//Launch a fast frequency pattern.Bzz Bzz Bzz.
document.getElementById("button-pattern-fast").addEventListener("click", (ev) => {
    startPattern('3');
});

//Launch a pattern that some constructor call orgasmic. You will see...
document.getElementById("button-pattern-orgasmic").addEventListener("click", (ev) => {
    startPattern('4');
});


function startPattern(patternName) {
    //We stop everything before starting a new pattern.
    stopPatternInterval();
    stopVibrating();

    let pattern;

    switch (patternName) {
        case '0':
            pattern = playForever;
            break;
        case '1':
            pattern = playPatternLow;
            break;
        case '2':
            pattern = playPatternMiddle;
            break;
        case '3':
            pattern = playPatternHigh;
            break;
        case '4':
            pattern = playPatternOrgasmic;
            break;
        default:
            break;
    }
    //We call the method start pattern with the pattern we want to use.
    startPatternInternal(pattern);
}

//We clear the loop calling a pattern each x milliseconds.
function stopPatternInterval() {
    if (timeInterval) {
        clearInterval(timeInterval);
    }
}

//This method will stop vibrations after 50 milliseconds.
//We wait these 50 milliseconds to be sure the pattern is stopped before stopping the vibration. If it wasn't, the toy would restart.
function stopVibrating() {
    setTimeout(() => {
        vibrate(0);
    }, 50);
}

//We launch a new pattern.
//We set the start date to know how many time have ellapsed since the beginning and know where we are in the pattern (must be vibrating? must be not? how much?)
function startPatternInternal(pattern) {
    patternDateStarted = new Date();
    timeInterval = setInterval(() => {
        pattern(new Date() - patternDateStarted);
    }, 10);
}

//Just vibrating
function playForever(millisecondsEllapsed) {
    vibrate(intensity);
}

function playPatternLow(millisecondsEllapsed) {
    playPatternTimed(millisecondsEllapsed, 500);
}

function playPatternMiddle(millisecondsEllapsed) {
    playPatternTimed(millisecondsEllapsed, 300);
}

function playPatternHigh(millisecondsEllapsed) {
    playPatternTimed(millisecondsEllapsed, 150);
}

//Here we have a method who take an ellapsed time and a rythm.
//Basically it says it must vibrate each "rythm" milliseconds.
function playPatternTimed(millisecondsEllapsed, rythm) {
    let millisecondsRounded = Math.round(millisecondsEllapsed / 10) * 10;
    let modulo = millisecondsRounded % rythm;

    if (modulo == 0) {
        if (isVibrating) {
            vibrate(0);
        }
        else {
            vibrate(intensity);
        }
    }
}

//Our special method to have an orgasmic pattern!
function playPatternOrgasmic(millisecondsEllapsed) {
    let timeInSeconds = millisecondsEllapsed / 1000;
    let milliseconds = timeInSeconds - Math.trunc(timeInSeconds);
    if (isVibrating && milliseconds < 0.2) {
        vibrate(0);
    }
    else {
        vibrate(milliseconds);
    }
}

//And the vibration method that also update the state of our toy to know if it's active or not!
function vibrate(intensity) {
    if (intensity == 0) {
        isVibrating = false;
    }
    else {
        isVibrating = true;
    }
    devices.forEach(device => {
        device.SendVibrateCmd(intensity);
    });
}