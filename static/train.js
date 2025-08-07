function showFileName() {
      const input = document.getElementById('real-file');
      const fileNameDiv = document.getElementById('file-name');
      if (input.files.length > 0) {
        fileNameDiv.textContent = `Selected file: ${input.files[0].name}`;
      } else {
        fileNameDiv.textContent = 'Upload File';
      }
    }



var socket = io();

socket.on('connect', function() {
    socket.emit('frontend_connected',"saying hi from frontend!!");    
});

socket.on("backend_connected",(data)=>{
    console.log(data);
})

const ctxR = document.getElementById('myRegressionChart').getContext('2d');

const dataR = {

  datasets: [{
    type:"scatter",
    label: 'Scatter Dataset',
    data: [],
    order: 2,
    backgroundColor: 'rgb(5, 43, 231,0.5)'
  },{
    type: 'line',
    label: 'Line Dataset',
    data: [],
    pointRadius: 0,
    borderColor: 'red',
    borderWidth: 3,
    order: 1,
    parsing: false,
  }],
};

const configR = {
  data: dataR,
  options: {
    plugins: {
      legend: {
        display: false
      }
    },
    animation:{
      duration:0,
    },
    scales: {
      x: {
        type: 'linear',
        position: 'bottom',
        title: {
          display: true,
          text: 'X-axis',
          font: {
            size: 14
          }
        }
      },
      y:{
        title: {
          display: true,
          text: 'Y-axis',  // 👈 X-axis label
          font: {
            size: 14
          }
        }
      }
    }
  }
};
const myRegChart = new Chart(ctxR, configR);


const ctxC = document.getElementById('myCostChart').getContext('2d');

const dataC = {
  datasets: [{
    type:"line",
    label: 'lineDataset',
    data: [],
    tension: 0.4,
    pointRadius: 0,
    borderColor: 'rgb(5, 43, 231,1)'
  }],
};

const configC = {
  data: dataC,
  options: {
    plugins: {
      legend: {
        display: false  // 👈 Hides the legend!
      }
    },
    animation:{
      duration:0,
    },
    scales: {
      x: {
        type: 'linear',
        position: 'bottom',
        title: {
          display: true,
          text: 'iterations',  // 👈 X-axis label
          font: {
            size: 14
          }
        }
      },
      y:{
        title: {
          display: true,
          text: 'Cost',  
          font: {
            size: 14
          }
        }
      }
    }
  }
};
const myCostChart = new Chart(ctxC, configC);

const ctxTst = document.getElementById('myTestChart').getContext('2d');

const dataTst = {

  datasets: [{
    type:"scatter",
    label: 'Scatter Dataset',
    data: [],
    order: 2,
    backgroundColor: 'rgb(5, 43, 231,0.5)'
  },{
    type: 'line',
    label: 'Line Dataset',
    data: [],
    pointRadius: 0,
    borderColor: 'red',
    borderWidth: 3,
    order: 1,
    parsing: false,
  }],
};

const configTst = {
  data: dataTst,
  options: {
    plugins: {
      legend: {
        display: false
      }
    },
    animation:{
      duration:0,
    },
    scales: {
      x: {
        type: 'linear',
        position: 'bottom',
        title: {
          display: true,
          text: 'X-axis',
          font: {
            size: 14
          }
        }
      },
      y:{
        title: {
          display: true,
          text: 'Y-axis',  // 👈 X-axis label
          font: {
            size: 14
          }
        }
      }
    }
  }
};
const myTstChart = new Chart(ctxTst, configTst);



let weight = 1;
let bias = 0;
let xaxis = "";
let yaxis = "";

document.addEventListener("DOMContentLoaded",async ()=>{
    try{

        const response = await fetch("/get_scatter_data",{
            method:"GET"
        });
        const scatter_data = await response.json();
        myRegChart.data.datasets[0].data = scatter_data.data;
        const predInput = document.getElementById("predInput");
        
        xaxis = scatter_data.axis[0];
        yaxis = scatter_data.axis[1];
        predInput.placeholder = "enter " + xaxis;

        myRegChart.options.scales.x.title.text = xaxis;
        myTstChart.options.scales.x.title.text = xaxis;
        myRegChart.options.scales.y.title.text = yaxis;
        myTstChart.options.scales.y.title.text = yaxis;
        myRegChart.update()

    }catch(error){
        console.error(error);
    }
})



const predContainer = document.getElementById("predContainer")
const evalContainer = document.getElementById("evalContainer")
const predBtn = document.getElementById("predBtn")
const trainingData = document.getElementById("trainingData")
const testingData = document.getElementById("testingData")
const evalTraining = document.getElementById("evalTraining")
const evalTesting = document.getElementById("evalTesting")
const costMSE = document.getElementById("costMSE")

predBtn.addEventListener("click",()=>{
  const predInput = document.getElementById("predInput");
  const predOutput = document.getElementById("predOutput");
  const prediction = (predInput.value * weight) + bais
  console.log(weight,bais);
  predOutput.innerText = "Predicted " + yaxis + " : " + (Math.round(prediction*100)/100);

})
const regStarter = document.getElementById("trainButton");
regStarter.addEventListener("click",()=>{
    evalTraining.style.display = "none";
    costMSE.style.display = "block";
    predContainer.style.display = "none";
    evalContainer.style.display ="none";
    myRegChart.data.datasets[1].data = []
    myRegChart.update()
    myCostChart.data.datasets[0].data = [];
    myCostChart.update();

    const iterations = document.getElementById("iterations");
    const learning_rate = document.getElementById("learning_rate")
    socket.emit("start_regression",{iterations:iterations.value,learning_rate:learning_rate.value})
})
socket.on("change_regression_line",([w,b,minX,scaledMaxX])=>{

  myRegChart.data.datasets[1].data =[{x:minX,y:(minX * w) + b},{x:scaledMaxX,y:(scaledMaxX * w) + b}]
          
  myRegChart.update()
})
socket.on("add_to_cost_line",([cost,iteration])=>{
  myCostChart.data.datasets[0].data.push({x:iteration,y:cost});
  myCostChart.update();
})
const r2Abs = document.getElementById("r2Abs")
const r2Percent = document.getElementById("r2Percent")
const r2yAxis = document.getElementById("r2yAxis")
const r2xAxis = document.getElementById("r2xAxis")
const MSE = document.getElementById("MSE")
const tStat = document.getElementById("tStat")
const tStat_pvalue = document.getElementById("tStat-pvalue")
const tStat_xaxis = document.getElementById("tStat-xaxis")
const tStat_signif = document.getElementById("tStat-signif")
socket.on("regression_done",([w,b,metrics])=>{
  weight = w;
  bais = b;
  predContainer.style.display = "block";
  evalContainer.style.display="block";
  costMSE.style.display = "none";
  evalTraining.style.display = "block";
  r2Abs.innerText = metrics.r_sq;
  r2Percent.innerText = (metrics.r_sq * 100) + "%";
  r2yAxis.innerText = yaxis;
  r2xAxis.innerText = xaxis;
  MSE.innerText = metrics.mse;
  tStat.innerText = metrics.t_stat;
  tStat_pvalue.innerText = metrics.p_val >= 0.0001 ? metrics.p_val : "≈ 0";
  tStat_xaxis.innerText = xaxis;
  if (metrics.p_val > 0.05) {
    tStat_signif.innerText = "not"
  }
  else {
    tStat_signif.innerText = ""
  }

})


const r2AbsTst = document.getElementById("r2AbsTst")
const r2PercentTst = document.getElementById("r2PercentTst")
const r2yAxisTst = document.getElementById("r2yAxisTst")
const r2xAxisTst = document.getElementById("r2xAxisTst")
const MSEtst = document.getElementById("MSEtst")

async function submitEvalForm(event){
  event.preventDefault();
  const evalForm = event.target;
  const formdata = new FormData(evalForm);
  try{
    const response = await fetch("/evaluate_test_data",{
      method:"POST",
      body:formdata
    })
    const data = await response.json()


    myTstChart.data.datasets[0].data = data.scatter_data;
    myTstChart.data.datasets[1].data =[{x:data.minX,y:(data.minX * weight) + bais},{x:data.scaledMaxX,y:(data.scaledMaxX * weight) + bais}]
    myTstChart.update()

    r2AbsTst.innerText = data.r_sq;
    r2PercentTst.innerText = (data.r_sq * 100) + "%";
    r2yAxisTst.innerText = yaxis;
    r2xAxisTst.innerText = xaxis;
    MSEtst.innerText = data.mse;
    testingData.style.display="block";
    evalTesting.style.display = "block";

  }catch(error){
    console.error(error)
  }
}


function updateValue(event){
    const slider = event.target;
    const value = slider.value;
    const container = slider.closest(".slider-group");
    const span = container.querySelector(".value");
    span.textContent = value;

}

