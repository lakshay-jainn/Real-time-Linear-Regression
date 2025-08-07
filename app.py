from flask import Flask,render_template,jsonify,request
from flask_socketio import SocketIO,emit
import numpy as np
import pandas as pd
import time
from scipy.stats import t


#initializing
app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app,cors_allowed_origins="*")

linear_data = None
final_scatter_data = None
weight = 1
bais = 0
# learning_rate = None
# iterations = None
def mean_sq_error(X,Y,w,b):
    fx = (X*w)+b
    m = len(X)
    return (1/(2*m)) * np.sum((fx-Y)**2)

def r_squared(X,Y,w,b):
    fx =( X *w ) + b
    ss_reg = np.sum((fx - Y)**2)
    ss_mean = np.sum((np.mean(Y) - Y)**2)


    return  (1 - (ss_reg/ss_mean))

def t_statistic(X,Y,w,b):
    fx = X *w + b
    m = len(X)
    MSE = (1/ (m-2)) * (np.sum((fx - Y)**2))
    SSX = np.sum((X - np.mean(X))**2)
    SE  = (MSE/SSX)**(1/2)
    T_STAT = w / SE
    df = m - 2
    P_VAL =2 * t.sf(abs(T_STAT), df)
    return T_STAT,P_VAL
#trying socketio out
@socketio.on("connect")
def connection_msg():
    emit("backend_connected","saying hi from backend!!")

@socketio.on("frontend_connected")
def frontend_success(data):
    print(data)

@socketio.on("start_regression")
def train_regression(data):
    global linear_data,weight,bais
    print(data)
    w = 1
    b = 0

    X = linear_data.iloc[:,0].to_numpy()
    Y = linear_data.iloc[:,1].to_numpy()
    m = len(X)
    print(m)
    epochs = int(data["iterations"])
    learning_rate = float(data["learning_rate"])
    print(epochs)
    print(learning_rate)
    minX = np.min(X)
    maxX = np.max(X)
    scaledMaxX = maxX + ((maxX - minX) * 0.1)


    for i in range(epochs):
        fx= (X*w)+b
        w_derevative = (1/m) * np.sum((fx - Y)*X) 
        b_derevative = (1/m) * np.sum((fx - Y)) 

        w = w - (learning_rate * w_derevative)
        b = b - (learning_rate * b_derevative)

        if(i%10==0):
            time.sleep(0.03)
            socketio.emit("change_regression_line",[w,b,int(minX),int(scaledMaxX)])
            socketio.emit("add_to_cost_line",[mean_sq_error(X,Y,w,b),i])

    #regression metrics
    r_sq = r_squared(X,Y,w,b)
    t_stat,p_val = t_statistic(X,Y,w,b)
    mse = mean_sq_error(X,Y,w,b)

    weight = w
    bais = b
    socketio.emit("regression_done",[w,b,{"r_sq":np.round(r_sq,2),"t_stat":np.round(t_stat,2),"p_val":p_val,"mse":np.round(mse,2)}])

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/upload_csv", methods = ['POST'])
def upload_csv():
    global linear_data,final_scatter_data
   
    csvFile = request.files['file']
    newData = pd.read_csv(csvFile)
    linear_data = newData.copy()
    if (newData.shape[1] != 2):
        return jsonify({"error","feature dimension doesnt match"}),400
    newData.columns = ["x","y"]
    
    finalData = list(newData.T.to_dict().values())
    final_scatter_data = finalData
    return jsonify({"redirect_url":"/train"})

@app.route("/evaluate_test_data",methods=["POST"])
def evaluate_test_data():
    global weight,bais
    csvFile = request.files["file"]
    newData = pd.read_csv(csvFile)

    if (newData.shape[1] != 2):
        return jsonify({"error","feature dimension doesnt match"}),400
    
    X = newData.iloc[:,0].to_numpy()
    Y = newData.iloc[:,1].to_numpy()
    minX = np.min(X)
    maxX = np.max(X)
    scaledMaxX = maxX + ((maxX - minX) * 0.05)
    mse = mean_sq_error(X,Y,weight,bais)
    r_sq = r_squared(X,Y,weight,bais)
    
    newData.columns = ["x","y"]
    scatter_data = list(newData.T.to_dict().values())

    return jsonify({"scatter_data":scatter_data,"mse":np.round(mse,2),"r_sq":np.round(r_sq,2),"minX":minX,"scaledMaxX":scaledMaxX})



@app.route("/train")
def train():
    return render_template("train.html") 

@app.route("/get_scatter_data",methods=["GET"])
def send_scatter_data():
    global final_scatter_data,linear_data
    return jsonify({"data":final_scatter_data,"axis":list(linear_data.columns)})

if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000)
