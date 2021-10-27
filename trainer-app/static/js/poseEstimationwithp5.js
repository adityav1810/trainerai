let detector;
let poses;
let video;
let wv=1280; //the default input size of the camera
let hv=720;
let w=640; //the size of the canvas
let h=480;
let f=4;  //the amount we want to scale down the video input

async function init() {
  const detectorConfig = {
    modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
  };
  detector = await poseDetection.createDetector(
    poseDetection.SupportedModels.MoveNet,
    detectorConfig
  );
  //detector.initCropRegion(w,h); //not callable

}

async function videoReady() {
  console.log("Capture loaded... or has it?");
  console.log("Capture: " + video.width + ", " + video.height);
  console.log("Video element: " + video.elt.videoWidth + ", " + video.elt.videoHeight);
  
  wv = video.elt.videoWidth;
  hv = video.elt.videoHeight;
  
  console.log("video ready");
  await getPoses();
}

async function setup() {
  let myCanvas=createCanvas(w, h);
  myCanvas.parent('videostream');
  
  video = createCapture(VIDEO, videoReady);
  video.size(wv/f,hv/f); //resize the input
  video.hide();
  await init();
  
}

async function getPoses() {
  if(detector){
    poses = await detector.estimatePoses(video.elt);
  
  }
       
  //console.log(poses);
  requestAnimationFrame(getPoses);
}

function draw() {
  background(220);
  image(video, 0, 0, w, h);

  if (poses && poses.length > 0) {
    
    text('nose x: ' + poses[0].keypoints[0].x.toFixed(2) + ' ' + (100 * poses[0].keypoints[0].x / video.width).toFixed(1) + '%', 10,10);
    text('nose y: ' + poses[0].keypoints[0].y.toFixed(2) + ' ' + (100 * poses[0].keypoints[0].y / video.height).toFixed(1) + '%', 10,20);
    text('nose s: ' + poses[0].keypoints[0].score.toFixed(2), 10,30);
    for (let kp of poses[0].keypoints) {
      const { x, y, score } = kp;
      if (score > 0.5) {
        fill(255);
        stroke(0);
        strokeWeight(4);
        circle(x*w/wv,y*h/hv, 16); //would expect wf/f to be full input width but not the case, video is cropped/ clipped
        //circle(x,y, 16);
      }
    }
  }
}