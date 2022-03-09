var constraints = { video: { facingMode: "environment" }, audio: false };

const cameraView = document.querySelector("#camera--view"),
      cameraOutput = document.querySelector("#camera--output"),
      cameraSensor = document.querySelector("#camera--sensor"),
      cameraTrigger = document.querySelector("#camera--trigger"),
      hud = document.querySelector("#hud"),
      pitchAngle = 0,
      hudActive = false

function addHudDataToImage(cameraSensor) {
  if (!hudActive) { return true };

  ctx = cameraSensor.getContext("2d")
  ctx.font = '40px "Andale Mono"';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#66ff00';  // a color name or by using rgb/rgba/hex values
  ctx.fillText("PTCH " + pitchAngle, 150, 50); // text and position
}

function cameraStart() {
    navigator.mediaDevices
        .getUserMedia(constraints)
        .then(function(stream) {
        track = stream.getTracks()[0];
        cameraView.srcObject = stream;
    })
    .catch(function(error) {
        console.error("Oops. Something is broken.", error);
    });
}

function orientationHandler(eventData) {
  var tiltLR = eventData.gamma;
  pitchAngle = eventData.beta;
  var direction = eventData.alpha;

  hud.textContent = Math.round(pitchAngle);
}

function hudStart() {
  hud.textContent = "-"
  window.addEventListener("deviceorientation", orientationHandler, false);
  hudActive = true;
}

function startApp() {
  cameraStart();
  // hudStart();
}

hud.onclick = function() {
  hud.textContent = "WAIT";

  if (window.DeviceOrientationEvent) {
    DeviceOrientationEvent.requestPermission()
    .then(response => {
      if (response == "granted") {
        hudStart();
      }
    });
  } else {
    hud.textContent = "NO DATA";
  }
};

cameraTrigger.onclick = function() {
    cameraSensor.width = cameraView.videoWidth;
    cameraSensor.height = cameraView.videoHeight;
    cameraSensor.getContext("2d").drawImage(cameraView, 0, 0);
    addHudDataToImage(cameraSensor);
    cameraOutput.src = cameraSensor.toDataURL("image/jpeg");
    cameraOutput.classList.add("taken");
};

window.addEventListener("load", startApp, false);
