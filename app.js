var constraints = { video: { facingMode: "environment" }, audio: false };

const cameraView = document.querySelector("#camera--view"),
      cameraOutput = document.querySelector("#camera--output"),
      cameraSensor = document.querySelector("#camera--sensor"),
      cameraTrigger = document.querySelector("#camera--trigger"),
      hud = document.querySelector("#hud")

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
  console.info("Got an orientation event");

  var tiltLR = eventData.gamma;
  var tiltFB = eventData.beta;
  var direction = eventData.alpha;

  hud.textContent = Math.round(tiltFB);
}

function hudStart() {
  if (window.DeviceOrientationEvent) {
    hud.textContent = "0224"
    window.addEventListener("deviceorientation", orientationHandler, false);
  } else {
    hud.textContent = "No Data"
  }
}

function startApp() {
  cameraStart();
  hudStart();
}

cameraTrigger.onclick = function() {
    cameraSensor.width = cameraView.videoWidth;
    cameraSensor.height = cameraView.videoHeight;
    cameraSensor.getContext("2d").drawImage(cameraView, 0, 0);
    cameraOutput.src = cameraSensor.toDataURL("image/jpeg");
    cameraOutput.classList.add("taken");
};

window.addEventListener("load", startApp, false);
