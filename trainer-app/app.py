from flask import Flask,render_template,Response
import cv2
import os
app=Flask(__name__)

app.secret_key = 'this_is_a_secret_key'

@app.route("/bicepcurl_js")
def bicepcurl_js():
    return render_template("/js/bicep_curl.js")
@app.route("/squats_js")
def squats_js():
    return render_template("/js/squats.js")


@app.route('/')
@app.route('/home')
def home():
    return render_template('home.html')

@app.route('/squats')
def squats():
    return render_template('squats.html')    


@app.route('/workout_loader')
def workout_loader():
    return render_template('workout_loader.html')


@app.route('/bicep_curl')
def bicep_curl():
    return render_template('bicep_curl.html')


    
if __name__ == "__main__":
    app.debug = True
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port, threaded=True)