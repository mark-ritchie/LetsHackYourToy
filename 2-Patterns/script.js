var client = null;
var devices = [];
var patternDateStarted = null;
var timeInterval = null;
var intensity = null;
var isVibrating = false;

document.getElementById("button-sync").addEventListener("click", async (ev) => {

    client = new Buttplug.ButtplugClient("ButtplugClient");

    try {
        const connector = new Buttplug.ButtplugEmbeddedClientConnector();
        await client.Connect(connector);
    } catch (e) {
        console.log(e);
        return;
    }
    client.addListener('deviceadded', async (device) => {
        await client.StopScanning();
        document.getElementById("toys-available").innerText = "";
        devices.push(device);
        devices.forEach(device => {
            document.getElementById("toys-available").innerText += device._name + "; ";
        });
    });

    client.addListener('deviceremoved', async (device) => {
        document.getElementById("toys-available").innerText = "";
        devices.pop(device);
        devices.forEach(device => {
            document.getElementById("toys-available").innerText += device._name + "; ";
        });
    });

    await client.StartScanning();
});


document.getElementById("slider-power").addEventListener("input", (ev) => {
    intensity = parseFloat(document.getElementById("slider-power").value);
});

document.getElementById("button-start").addEventListener("click", (ev) => {
    startPattern('0');
});

document.getElementById("button-stop").addEventListener("click", (ev) => {
    stopPatternInterval();
    stopVibrating();
});

document.getElementById("button-pattern-slow").addEventListener("click", (ev) => {
    startPattern('1');
});

document.getElementById("button-pattern-medium").addEventListener("click", (ev) => {
    startPattern('2');
});

document.getElementById("button-pattern-fast").addEventListener("click", (ev) => {
    startPattern('3');
});

document.getElementById("button-pattern-orgasmic").addEventListener("click", (ev) => {
    startPattern('4');
});

function startPattern(patternName) {
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
    startPatternInternal(pattern);
}

function stopPatternInterval() {
    if (timeInterval) {
        clearInterval(timeInterval);
    }
}

function stopVibrating() {
    setTimeout(() => {
        vibrate(0);
    }, 50);
}

function startPatternInternal(pattern) {
    patternDateStarted = new Date();
    timeInterval = setInterval(() => {
        pattern(new Date() - patternDateStarted);
    }, 10);
}

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