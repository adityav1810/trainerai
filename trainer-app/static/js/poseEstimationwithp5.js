const ScoreThreshold = 0.4;

let detector;
let poses;
let video;
let screenAspect;
let videoAspect;
let vw, vh;


async function init() {
	console.log("initializing");
	const detectorConfig = {
		modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
	};
	detector = await poseDetection.createDetector(
		poseDetection.SupportedModels.MoveNet,
		detectorConfig
	);
}

async function videoReady() {
	console.log("video ready");
	await getPoses();
}

async function setup() {
	var canvas=	createCanvas(windowWidth, windowHeight);
	canvas.parent('videoStream');
	screenAspect = windowWidth / windowHeight;
	textSize(16);
	textAlign(CENTER, CENTER);

	await init();

	video = createCapture(VIDEO, videoReady);
	videoAspect = video.width / video.height;
	video.hide();

	//createButton('pose').mousePressed(getPoses)
	console.log("setup complete");
}

async function getPoses() {
	poses = await detector.estimatePoses(video.elt);
	setTimeout(getPoses, 30);
}

let first = true;

function mouseClicked() {
	console.log(poses);
}

// A list of pairs of either keypoint indices or sub lists of keypoint indicies
// Each pair defines an edge in the skeleton "graph"
// When a pair contains a sublist, that is meant to represent the average of two keypoints
const skeleton = [
	[0, 1],
	[0, 2],
	[1, 3],
	[2, 4],
	[0, [6, 5]],
	[6, 5],
	[5, 7],
	[6, 8],
	[7, 9],
	[8, 10],
	[
		[5, 6],
		[11, 12]
	],
	[
		[11, 12], 11
	],
	[
		[11, 12], 12
	],
	[11, 13],
	[12, 14],
	[13, 15],
	[14, 16],
];

function getKeypointForEdgeVertex(keypoints, vertex) {
	if (typeof vertex === "number") {
		const {
			x,
			y,
			score
		} = keypoints[vertex];
		if (score > ScoreThreshold) {
			return { x, y };
		}
	} else if (vertex instanceof Array) {
		const points = vertex.map(v => keypoints[v]);
		if (points.every(kp => kp.score > ScoreThreshold)) {
			const { x, y } =
						// Average the points
						points.reduce(
							(acc, v) => ({
								x: (acc.x * acc.w + v.x) / (acc.w + 1),
								y: (acc.y * acc.w + v.y) / (acc.w + 1),
								w: acc.w + 1
							}),
							{ x: 0, y: 0, w: 0 }
						);
		  return { x, y };
		}
	}
}

function mouseClicked() {
	console.log(`screen aspect ${screenAspect.toFixed(2)}`);
	console.log(`video aspect ${videoAspect.toFixed(2)}`);
	debugger;
}


function drawKeypoints(vw,vh){

  const mapX = (x) => map(x, 0, video.width, vw, 0);
  const mapY = (y) => map(y, 0, video.height, 0, vh);

  stroke('#ADD8E6');
  strokeWeight(5);
  
  for (let edge of skeleton) {
    let start = getKeypointForEdgeVertex(poses[0].keypoints, edge[0]);
    let end = getKeypointForEdgeVertex(poses[0].keypoints, edge[1]);

    if (start && end) {
      line(
        mapX(start.x),
        mapY(start.y),
        mapX(end.x),
        mapY(end.y)
      );
    }
  }

  for (let i = 0; i < poses[0].keypoints.length; i++) {
    const {
      x,
      y,
      score
    } = poses[0].keypoints[i];
    
    if (score > ScoreThreshold) {
      fill('ADD8E6');
      stroke('ADD8E6');
      strokeWeight(5);
      circle(mapX(x), mapY(y), 9);

      push();
      fill('#ADD8E6');
      noStroke();
     
      pop();
    }
  }

}




function p(x, y) {return {x,y}}

function normaliseToInteriorAngle(angle) {
	if (angle < 0) {
		angle += (2*Math.PI)
	}
	if (angle > Math.PI) {
		angle = 2*Math.PI - angle
	}
	return  angle;
}

function angle(p1, center, p2) {
	const transformedP1 = p(p1.x - center.x, p1.y - center.y)
	const transformedP2 = p(p2.x - center.x, p2.y - center.y)

	const angleToP1 = Math.atan2(transformedP1.y, transformedP1.x)
	const angleToP2 = Math.atan2(transformedP2.y, transformedP2.x)

	return  normaliseToInteriorAngle(angleToP2 - angleToP1)
}

function toDegrees(radians) {
	var todeg=360 * radians / (2 * Math.PI)
	return Math.trunc(todeg);
}


var curlCounter=0;
var dir=0;
function checkArm(arm){
  var curlThreshold=30;



  Shoulder=getKeypointForEdgeVertex(poses[0].keypoints, arm[1]);
  Elbow=getKeypointForEdgeVertex(poses[0].keypoints, arm[2]);
  Hand=getKeypointForEdgeVertex(poses[0].keypoints, arm[3]);

  if (Shoulder && Elbow && Hand){

    ShoulderAngle=toDegrees(angle(Shoulder,Elbow,Hand));
	scaledAngle=Math.trunc((ShoulderAngle/180)*100);
	if (scaledAngle>=70){
		if(dir==0){
			curlCounter =curlCounter +0.5;
			dir=1;
		}
	}

	if (scaledAngle<=35){
		if(dir==1){
			curlCounter =curlCounter +0.5;
			dir=0;
		}
	}
	console.log(arm[0],curlCounter,scaledAngle,dir);
	textSize(32);
    text(scaledAngle, 400,400);
    textSize(32);
    text(Math.trunc(curlCounter), 500,500);


  }

}


var alternatearms=1;

function draw() {
	if (first) {
		console.log("drawing");
		first = false;
	}
	background(220);
	if (video) {
		let vw, vh;
		// This isn't valid during setup() for some reason
	  videoAspect = video.width / video.height;
		if (screenAspect >= videoAspect) {
			// The screen is wider than the video
			vh = height;
			vw = height * videoAspect;
		} else {
			// The video is wider than the screen
			vw = width;
			vh = width / videoAspect;
		}
		push();
		// Mirror the video
		scale(-1, 1);
		translate(-vw, 0);
		image(video, 0, 0, vw, vh);
		pop();

		
		if (poses && poses.length > 0) {
		      drawKeypoints(vw,vh);
	  rightArmpoints=['rightArm',6,8,10]
	  leftArmpoints=['leftArm',5,7,9]
	  if (alternatearms%2==0){
		checkArm(rightArmpoints);
		
	  }
	  else{
		  checkArm(leftArmpoints);
	  }
	  alternatearms=alternatearms+1;
      

		}
	}
}