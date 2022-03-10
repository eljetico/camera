var constraints = { video: { facingMode: "environment" }, audio: false };

const cameraView = document.querySelector("#camera--view"),
      cameraOutput = document.querySelector("#camera--output"),
      cameraSensor = document.querySelector("#camera--sensor"),
      cameraTrigger = document.querySelector("#camera--trigger"),
      hud = document.querySelector("#hud")

var pitchAngle = 0;
var hudActive = false;

function addHudDataToImage(cameraSensor) {
  if (!hudActive) { return true };

  var fillStyle = 'rgba(255, 255, 255, 0.8)';

  ctx = cameraSensor.getContext("2d")
  ctx.font = "20px ui-monospace";
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = fillStyle;  // a color name or by using rgb/rgba/hex values
  ctx.fillText("PTCH " + pitchAngle, 50, 50); // text and position

  // Draw image center
  cX = cameraSensor.width / 2;
  cY = cameraSensor.height / 2;

  ctx.moveTo(cX - 100, cY);
  ctx.lineTo(cX + 100, cY);
  ctx.strokeStyle = fillStyle;
  ctx.lineWidth = 3;
  ctx.stroke();
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
  // var tiltLR = eventData.gamma;
  pitchAngle = Math.round(eventData.beta);
  // var direction = eventData.alpha;

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
