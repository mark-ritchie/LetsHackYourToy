var client = null;
var devices = [];

document.getElementById("button-sync").addEventListener("click", async (ev) => {    
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

document.getElementById("button-start").addEventListener("click", (ev) => {
    vibrate(1);
});

document.getElementById("button-stop").addEventListener("click", (ev) => {
    vibrate(0);
});

function vibrate(intensity) {
    devices.forEach(device => {
        device.SendVibrateCmd(intensity);
    });
}