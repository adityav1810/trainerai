var StopWebCam = function () {
    var stream = video.srcObject;
    var tracks = stream.getTracks();

    for (var i = 0; i < tracks.length; i++) {
        var track = tracks[i];
        track.stop();
    }
    video.srcObject = null;
return;
}



const runMovenet= async()=>{
const detectorConfig = {modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING};
const net = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, detectorConfig);
setInterval(()=>{
detect(net);

},100)
};
const detect = async(net)=>{
const pose = await net.estimatePoses(video);
console.log(pose[0].keypoints);


}


var start = function () {
    var video = document.getElementById("video"),
        vendorURL = window.URL || window.webkitURL;


    if (navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(function (stream) {
                video.srcObject = stream;
                runMovenet(video);

               
            }).catch(function (error) {
                console.log("Something went wrong");
            });
    }

    
}