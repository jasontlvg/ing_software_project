const express= require("express");
const app= express();
// const serverx= app.listen(8000, '192.168.1.64'); // const server= app.listen(3000, '192.168.0.3');
const serverx= app.listen(8000, '192.168.0.4'); // const server= app.listen(3000, '192.168.0.3');
// WebSocket Socket.IO Code
const SocketIO = require("socket.io");
const io= SocketIO(serverx);

let Arduino;
let arduinoConnected=false; 

app.use(express.static("./public"));

app.set("views", "./views");
app.set("view engine", "pug");

app.get("/", (req, res) => {
    
});

io.on("connection", (socket) => {
    console.log("websocket new connection, "+ socket.id);
    if(arduinoConnected){
        Arduino.sendUTF("newWebsocketConnected");
    }

    // socket.on("clientMotor1Value", (message) => {
    //     console.log("Mensaje Recibido: " + message);

    //     io.sockets.emit("calcetin", 'Gundam');

    //     if(arduinoConnected){
    //         Arduino.sendUTF(message);
    //     }
    // });
});






///// Original

var WebSocketServer = require('websocket').server;
var http = require('http');
 
var server = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});
server.listen(3000, function() {  // En la direccion ipv4
    console.log((new Date()) + ' Server is listening on port 3000');
});
 
wsServer = new WebSocketServer({
    httpServer: server,
    // You should not use autoAcceptConnections for production 
    // applications, as it defeats all standard cross-origin protection 
    // facilities built into the protocol and the browser.  You should 
    // *always* verify the connection's origin and decide whether or not 
    // to accept it. 
    autoAcceptConnections: false
});
 
function originIsAllowed(origin) {
  // put logic here to detect whether the specified origin is allowed. 
  return true;
}
 
wsServer.on('request', function(request) {
	// Solo se ejecuta la primera vez que el ESP32 manda el primer mensaje
    if (!originIsAllowed(request.origin)) {
      // Make sure we only accept requests from an allowed origin 
      request.reject();
      console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
      return;
    }
    
    var connection = request.accept('arduino', request.origin);
    console.log((new Date()) + ' Connection accepted.');
    
	connection.on('message', function(message) {
        if (message.type === 'utf8') {
            // console.log(message.utf8Data);
            let obj= JSON.parse(message.utf8Data);
            if(obj.id == "WStype_CONNECTED"){
                console.log(obj)
                io.sockets.emit("WStype_CONNECTED", obj);
            }
            else if(obj.id == "fromArduinoNewWebSocketDataForClient"){
                // Un nuevo Cliente se conecto, mandamos un mensaje al ESP32 para avisarle y este nos responde con la info de los sensores para actualizar
                // la pantalla del Cliente que se acaba de conectar
                console.log("fromArduinoNewWebSocketDataForClient Nuevooo: " + obj);
                io.sockets.emit("fromArduinoNewWebSocketDataForClient", obj);
            }

            else{
                if(obj.id == "temperaturaValue"){
                    console.log(obj)
                    io.sockets.emit("temperaturaValueFromServer", obj);
                }

                else if(obj.id == "humedadValue"){
                    console.log(obj)
                    io.sockets.emit("humedadValueFromServer", obj);
                }

                else if(obj.id == "humoValue"){
                    console.log(obj)
                    io.sockets.emit("humoValueFromServer", obj);
                }

                else if(obj.id == "lluviaValue"){
                    console.log(obj)
                    io.sockets.emit("lluviaValueFromServer", obj);
                }

                else if(obj.id == "luzValue"){
                    console.log(obj)
                    io.sockets.emit("luzValueFromServer", obj);
                }
                


            }
        }
        else if (message.type === 'binary') {
            console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
            
           //connection.sendBytes(message.binaryData);
        }
    });
    
    // Se a perdido la conexion con el Arduino, entonces el arduino manda un mensaje de que ya no hay conexion
	connection.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
        arduinoConnected= false;
        io.sockets.emit("close", {heart: 0});
    });
    
    // Esto solo se ejecuta la Primera Vez que conectamos el ESP32
    connection.sendUTF("Hallo Client!");
    Arduino= connection;
    arduinoConnected= true;
});