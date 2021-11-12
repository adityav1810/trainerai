from flask import Flask,render_template,Response
import cv2
import os
app=Flask(__name__)

app.secret_key = 'this_is_a_secret_key'

@app.route('/')
@app.route('/home')
def home():
    return render_template('home.html')

@app.route('/pushups')
def pushups():
    return render_template('pushups.html')    


@app.route('/workout_loader')
def workout_loader():
    return render_template('workout_loader.html')


@app.route('/bicep_curl')
def bicep_curl():
    return render_template('bicep_curl.html')
if __name__ == "__main__":
    app.debug = True
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port, threaded=True,ssl_context="adhoc")