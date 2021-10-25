var ifWebcamtrue = false;



const detect = async (net) => {
    const pose = await net.estimatePoses(video);
    // console.log(pose[0].keypoints);
    return pose[0].keypoints;
  };

function drawonCanvas(keypoints){
  var canvas=document.getElementById('canvas');
  var ctx = canvas.getContext('2d')
 
  






  keypoints.map((item) => {
    var jointname=item.name;
    var score=item.score;
    var scoreThreshold=0.2;

    if (score >= scoreThreshold && jointname =='nose') {
      const circle = new Path2D();
      circle.arc(item.x, item.y, 5, 0, 2 * Math.PI);
      
      ctx.fill(circle);
      ctx.stroke(circle);
      console.log(item.name);
    }









   
  })






}



const runMovenet = async () => {
  if (ifWebcamtrue) {
    const detectorConfig = {
      modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
    };
    const net = await poseDetection.createDetector(
      poseDetection.SupportedModels.MoveNet,
      detectorConfig
    );

   setInterval(async() => {
        if(ifWebcamtrue){
            //detect keypoint
            var keypoints=await detect(net);
            // console.log(keypoints);
            //plot keypoints on canvas
            drawonCanvas(keypoints);


            //repition counter

            //display repition counter

        }
      
    }, 100);
 



  }

};

var start = function () {
  ifWebcamtrue = true;

  var video = document.getElementById("video"),
    vendorURL = window.URL || window.webkitURL;
  

  if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then(function (stream) {
        video.srcObject = stream;
        runMovenet(video);
      })
      .catch(function (error) {
        console.log("Something went wrong");
      });
  }
};



var StopWebCam = function () {
    ifWebcamtrue=false;
    // var stream = video.srcObject;
    // var tracks = stream.getTracks();




    video.pause();
    video.srcObject.getTracks()[0].stop();

  
    // for (var i = 0; i < tracks.length; i++) {
    //   var track = tracks[i];
    //   track.stop();
    // }
    // video.srcObject = null;

  };
