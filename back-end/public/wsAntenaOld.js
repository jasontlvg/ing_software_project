socket.on("newWebSocketArduinoConfirmation", (data) => {
    console.log("Valor recibido del motor value: " + data.motor1data);
    grid_container.server_status_data= "Connected";
    grid_container.motor1_data= data.motor1data;
    let btn= document.getElementById("thumb_btn");
    let thumb_motor1= document.getElementById("thumb_motor--1");
    if(data.motor1data > 0){
        stop_state(btn, thumb_motor1);
    }else{
        run_state(btn, thumb_motor1);
    }

    // Borrar
    chart.data.datasets[0].data[0]= data.count_color1;
    chart.data.datasets[0].data[1]= data.count_color2;
    chart.data.datasets[0].data[2]= data.count_color3;
    chart.update();

    // Variable
    servidorConectado= true;
});
socket.on("WStype_CONNECTED", (data) => {
    if(firstArduinoConnection){
        console.log(data);
        // console.log("Valor recibido del motor value: " + data.value);
        grid_container.server_status_data= "Connected";
        grid_container.motor1_data= data.value;
        let btn= document.getElementById("thumb_btn");
        let thumb_motor1= document.getElementById("thumb_motor--1");
        if(data.value > 0){
            stop_state(btn, thumb_motor1);
        }else{
            run_state(btn, thumb_motor1);
        }

        chart.data.datasets[0].data[0]= data.count_color1;
        chart.data.datasets[0].data[1]= data.count_color2;
        chart.data.datasets[0].data[2]= data.count_color3;
        chart.update();

        // Variables
        servidorConectado= true;
        firstArduinoConnection= false;
    }
});

socket.on("emergencyStopFromArduino", (data) => {
    let btn= document.getElementById("thumb_btn");
    let thumb_motor1= document.getElementById("thumb_motor--1");
    run_state(btn, thumb_motor1);
    grid_container.motor1_data=0;
    btn.classList.remove("stop");
    btn.classList.add("run");
    thumb_motor1.classList.add("disabled");
    console.log("El Arduino a Parado todo");
    M.toast({html: 'El Arduino a Parado todo'})
});

socket.on("colorFromArduino", (data) => {
    console.log(data);
    let led_1= document.getElementById("led_1");
    let led_2= document.getElementById("led_2");
    let led_3= document.getElementById("led_3");
    if(data.colorValue == "color_1"){
        led_1.classList.add("on");
        led_2.classList.remove("on");
        led_3.classList.remove("on");
        chart.data.datasets[0].data[0]= data.count;
        chart.update();
    }else if(data.colorValue == "color_2"){
        led_2.classList.add("on");
        led_1.classList.remove("on");
        led_3.classList.remove("on");
        chart.data.datasets[0].data[1]= data.count;
        chart.update();
    }else if(data.colorValue == "color_3"){
        led_3.classList.add("on");
        led_2.classList.remove("on");
        led_1.classList.remove("on");
        chart.data.datasets[0].data[2]= data.count;
        chart.update();
    }else{
        leds_off();
    }
});

socket.on("runAuthorizationFromArduino", (data) => {
    let btn= document.getElementById("thumb_btn");
    let thumb_motor1= document.getElementById("thumb_motor--1");
    // Separador
    grid_container.btn_status_data= "S T O P";
    btn.classList.remove("run");
    btn.classList.add("stop");
    thumb_motor1.classList.toggle("disabled");
    firstTimeSendAutorizationSupervisor=true;
    console.log("Autorizacion Recibida");
    M.toast({html: 'Autorizacion del Supervisor Recibida'});
    M.toast({html: 'Motor en Marcha'});
});


socket.on("close", (data) => {
    let btn= document.getElementById("thumb_btn");
    let thumb_motor1= document.getElementById("thumb_motor--1");
    firstArduinoConnection= true;
    close_state(btn, thumb_motor1);
    let led_1= document.getElementById("led_1");
    let led_2= document.getElementById("led_2");
    let led_3= document.getElementById("led_3");
    led_1.classList.remove("on");
    led_2.classList.remove("on");
    led_3.classList.remove("on");
});