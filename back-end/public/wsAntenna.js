let socket= io();
let firstConnectionArduino= true;
let WStype_CONNECTED= true;

function changeViewStatus(rainStatus, lightStatus){
    if(rainStatus == false){
        card.rain= false
        if(lightStatus < 2000){
            card.sunnyIcon=false;
            card.partlyCloudyIcon= true;
            card.statusClima= "Parcialmente Nublado";
        }else{
            card.sunnyIcon=true;
            card.partlyCloudyIcon= false;
            card.statusClima= "Soleado";
        }

    }else{
        console.log("Lloveraaa")
        card.rain= true;
        card.sunnyIcon= false;
        card.partlyCloudyIcon= false;
        card.statusClima= "Actualmente Lloviendo";
    }
}

function putDataFirstConnections(temperatureValueFromArduino, humidityValueFromArduino, smokeValueFromArduino,lightValueFromArduino=0,rainValueFromArduino){
    card.temperature= temperatureValueFromArduino;
    card.humidity= humidityValueFromArduino;
    card.smoke= smokeValueFromArduino;
    card.light= lightValueFromArduino;
    card.rain= rainValueFromArduino;

    if(smokeValueFromArduino < 2000){
        card.smoke= false;
    }else{
        card.smoke= true;
    }

    changeViewStatus(rainValueFromArduino, lightValueFromArduino);

}



socket.on("WStype_CONNECTED", (data) => {
    if(firstConnectionArduino){
        header.arduinoConnected= true;
        console.log(data);

        if(data.lluviaValue == 1){
            data.lluviaValue= false;
        }else{
            data.lluviaValue=true;
        }

        putDataFirstConnections(data.temperaturaValue,data.humedadValue, data.humoValue, data.luzValue, data.lluviaValue)
        firstConnectionArduino=false;
        WStype_CONNECTED=false;
    }
});

socket.on("fromArduinoNewWebSocketDataForClient", (data) => {
    if(WStype_CONNECTED){
        header.arduinoConnected= true;
        console.log(data);

        if(data.lluviaValue == 1){
            data.lluviaValue= false;
        }else{
            data.lluviaValue=true;
        }

        putDataFirstConnections(data.temperaturaValue,data.humedadValue, data.humoValue, data.luzValue, data.lluviaValue)
        firstConnectionArduino=false; 
        WStype_CONNECTED=false;
    }
    
});

socket.on("temperaturaValueFromServer", (data) => {
    console.log(data)
    card.temperature= data.value;
});

socket.on("humedadValueFromServer", (data) => {
    console.log(data)
    card.humidity= data.value;
});

socket.on("humoValueFromServer", (data) => {
    console.log(data)
    if(data.value < 2000){
        card.smoke= false;
    }else{
        card.smoke= true;
    }
});

socket.on("lluviaValueFromServer", (data) => {
    console.log(data)

    if(data.value == 1){
        data.value= false;
    }else{
        data.value=true;
    }

    card.rain= data.value;
    changeViewStatus(card.rain, card.light)
});

socket.on("luzValueFromServer", (data) => {
    console.log(data)
    console.log(card.rain)
    card.light= data.value;
    changeViewStatus(card.rain,data.value)
});

socket.on("close", (data) => {
    header.arduinoConnected= false;
});

{/* <script src="/socket.io/socket.io.js"></script>
<script type="text/javascript" src="main.bundle.js"></script>
<script src="wsAntenna.js"></script> */}