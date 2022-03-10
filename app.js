var constraints = { video: { facingMode: "environment" }, audio: false };

const cameraView = document.querySelector("#camera--view"),
      cameraOutput = document.querySelector("#camera--output"),
      cameraSensor = document.querySelector("#camera--sensor"),
      cameraTrigger = document.querySelector("#camera--trigger"),
      hud = document.querySelector("#hud")

var aspectRatio, pitchAngle, _rawRoll, rollAngle = 0;
var aX = 0, aY = 0, aZ = 0;
var hudActive = false;

function addHudDataToImage(cameraSensor) {
  if (!hudActive) { return true };

  var fillStyle = 'rgba(255, 255, 255, 0.5)';

  ctx = cameraSensor.getContext("2d")
  ctx.font = "20px ui-monospace";
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = fillStyle;  // a color name or by using rgb/rgba/hex values
  ctx.fillText("PTCH " + pitchAngle, 50, 50); // text and position

  // Draw image center
  cX = cameraSensor.width / 2;
  cY = cameraSensor.height / 2;

  fillStyle = 'rgba(255, 255, 255, 0.2)';

  ctx.moveTo(cX - 100, cY);
  ctx.lineTo(cX + 100, cY);
  ctx.strokeStyle = fillStyle;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.moveTo(cX, cY - 60);
  ctx.lineTo(cX, cY + 60);
  ctx.strokeStyle = fillStyle;
  ctx.lineWidth = 2;
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

function draw() {
  aspectRatio = document.body.clientWidth / document.body.clientHeight;

  roll = Math.atan2(aX, aY);
  pitch = -Math.atan2(aZ, aX * Math.sin(roll) + aY * Math.cos(roll));

  pitchAngle = Math.round(pitch * 180/Math.PI);
  rollAngle = Math.round(roll * 180/Math.PI);

  updateHud(pitchAngle, rollAngle);

  requestAnimationFrame(draw);
}

function updateHud() {
  sign = "-";

  if (aspectRatio > 1 && _rawRoll > 0) {
    sign = ">";
  } else if (aspectRatio > 1 && _rawRoll <= 0) {
    sign = "<";
  }

  hud.textContent = "P:" + pitchAngle + "|R:" + rollAngle + "|" + sign;
}

// DEPRECATE THIS
// function orientationHandler(eventData) {
//   rollAngle = Math.round(eventData.gamma);
//   pitchAngle = Math.round(eventData.beta);
//   // var direction = eventData.alpha;
//
//   hud.textContent = "P:" + pitchAngle + "|R:" + rollAngle;
// }

function hudStart() {
  updateHud();
  window.addEventListener("deviceorientation", updateOrientations, false);
  window.addEventListener('devicemotion', updateAccelerations, true);
  hudActive = true;
}

function startApp() {
  cameraStart();
  draw();
}

function updateAccelerations(evt) {
  if (!evt || !evt.accelerationIncludingGravity) {
    return;
  }

  var accelData = evt.accelerationIncludingGravity;

  var _aX = accelData.x;
  var _aY = accelData.y;
  var _aZ = accelData.z;

  if (aspectRatio > 1 && _rawRoll > 0) {

    aX = _aY;
    aY = -_aX;

  } else if (aspectRatio > 1 && _rawRoll <= 0) {

    aX = -_aY;
    aY = _aX;

  } else {

    aX = _aX;
    aY = _aY;
  }

  aZ = _aZ;
}

function updateOrientations(evt) {
  if (!evt || evt.gamma == null) {
    return;
  }
  _rawRoll = evt.gamma;
}

hud.onclick = function() {
  if (window.DeviceOrientationEvent) {
    DeviceOrientationEvent.requestPermission()
    .then(response => {
      if (response == "granted") {
        hudStart();
      }
    });
  } else {
    hud.textContent = "DENIED";
  }
};

cameraTrigger.onclick = function() {
    cameraSensor.width = cameraView.videoWidth;
    cameraSensor.height = cameraView.videoHeight;
    cameraSensor.getContext("2d").drawImage(cameraView, 0, 0);
    // addHudDataToImage(cameraSensor);
    cameraOutput.src = cameraSensor.toDataURL("image/jpeg");
    cameraOutput.classList.add("taken");
};

window.addEventListener("load", startApp, false);
