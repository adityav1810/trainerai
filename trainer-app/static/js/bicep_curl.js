const ScoreThreshold = 0.4;

let detector;
let poses;
let video;
let screenAspect;
let videoAspect;
let total_reps;

root = document.documentElement;
// let vw, vh;
// var master_width=1900;
var master_width=screen.width;
// var master_height=930;
var master_height=screen.height;
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
function getrepitioncount() {
	 total_reps = prompt('Enter Total Repitions','10');
  }
async function setup() {
	getrepitioncount();


	var canvas=	createCanvas(master_width,master_height);
	canvas.parent('videoStream');
	screenAspect = windowWidth / windowHeight;

	console.log("dimensions",master_height,master_width);
	textSize(16);
	textAlign(CENTER, CENTER);

	await init();

	video = createCapture(VIDEO, videoReady);
	// video.resize(windowWidth,windowHeight);
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
  



 Shoulder=getKeypointForEdgeVertex(poses[0].keypoints,arm[1]);
 Elbow=getKeypointForEdgeVertex(poses[0].keypoints,arm[2]);
 Hand=getKeypointForEdgeVertex(poses[0].keypoints,arm[3]);
	if (Shoulder && Elbow && Hand ){	  
    ShoulderAngle=toDegrees(angle(Shoulder,Elbow,Hand));
	scaledAngle=Math.trunc((ShoulderAngle/180)*100);




// console.log(dataID);





	var angleprogressbar=document.getElementById('jointAngleprogressbar');
	console.log(angleprogressbar.getAttribute('data-value'));
	angleprogressbar.setAttribute('data-value',scaledAngle)
	document.getElementById('jointAnglevalue').innerHTML=100-scaledAngle;
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
	//curlcounter display here
	console.log(curlCounter);
	document.getElementById('repcount').innerHTML=Math.trunc(curlCounter);
	document.getElementById('posecheck').innerHTML='OK';


	// document.getElementById("progressbar").style.width=(100*(Math.trunc(curlCounter)/total_reps))+"%";
  }
  else{
	document.getElementById('posecheck').innerHTML='Not Visible';
  }

}



function draw() {

	$(".progress").each(function() {
  
		var value = $(this).attr('data-value');
		var left = $(this).find('.progress-left .progress-bar');
		var right = $(this).find('.progress-right .progress-bar');
	
		if (value > 0) {
		  if (value <= 50) {
			right.css('transform', 'rotate(' + percentageToDegrees(value) + 'deg)')
			left.css('transform', 'rotate(' + percentageToDegrees(0) + 'deg)')

		  } else {
			right.css('transform', 'rotate(180deg)')
			left.css('transform', 'rotate(' + percentageToDegrees(value - 50) + 'deg)')
		  }
		}
	
	  })

	  function percentageToDegrees(percentage) {
	
		return percentage / 100 * 360
	
	  }




	if (first) {
		console.log("drawing");
		first = false;
	}
	background(220);
	if (video ) {
		let vw, vh;
		// This isn't valid during setup() for some reason
	//   videoAspect = video.width / video.height;
	videoAspect==screenAspect;
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
		translate(-master_width, 0);
		image(video, 0, 0, master_width,master_height);
		pop();

		
		if (poses && poses.length > 0) {
		      drawKeypoints(master_width,master_height);
	  rightArmpoints=['rightArm',6,8,10]
	  leftArmpoints=['leftArm',5,7,9]
	 checkArm(rightArmpoints);
	//  checkArm(leftArmpoints);

	 


				}

	}
	
	
}