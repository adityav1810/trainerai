from flask import Flask,render_template,Response
import cv2
import os
app=Flask(__name__)

app.secret_key = 'this_is_a_secret_key'
def generate_frames():
    camera=cv2.VideoCapture(0)
    while True:

            
        ## read the camera frame
        success,frame=camera.read()
        if not success:
            break
        else:
            ret,buffer=cv2.imencode('.jpg',frame)
            frame=buffer.tobytes()

        yield(b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')


@app.route('/')
@app.route('/home')
def home():
    return render_template('home.html')
@app.route('/bicep_curls')
def bicep_curls():
    return render_template('bicep_curls.html')
@app.route('/pushups')
def pushups():
    return render_template('pushups.html')    

@app.route('/video')
def video():
    return Response(generate_frames(),mimetype='multipart/x-mixed-replace; boundary=frame')
@app.route('/workout_loader')
def workout_loader():
    return render_template('workout_loader.html')


@app.route('/clientside')
def clientside():
    return render_template('client_video_stream.html')
if __name__ == "__main__":
    app.debug = True
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port, threaded=True)