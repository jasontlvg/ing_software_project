/*
 * WebSocketClient.ino
 *
 *  Created on: 24.05.2015
 *
 */

#include "DHT.h"  
#define DHTPIN 12 
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE); 

#include <Arduino.h>

#include <WiFi.h>
#include <WiFiMulti.h>
#include <WiFiClientSecure.h>

#include <WebSocketsClient.h>


WiFiMulti WiFiMulti;
WebSocketsClient webSocket;

#define USE_SERIAL Serial
// Variables de los Sensores de Temperatura, Humedad, Humo, Luz, Lluvia
int temperaturaValue=0, humedadValue=0, humoValue=0, luzValue=0;
boolean lluviaValue=1;
String temperaturaValue_String, humedadValue_String, humoValue_String, luzValue_String, lluviaValue_String;
String S1,S2,S3,S4,S5,S6,S7,S8,S9;

// Flags de las Variables
int temperaturaValue_Flag=0, humedadValue_Flag=0, humoValue_Flag=0, luzValue_Flag=0;
boolean lluviaValue_Flag=1;

// Pines
int pinSensorTemperaturaHumedad=12,  pinSensorHumo=32, pinSensorLuz=33, pinSensorLluvia=14;

boolean checkEnviarNoHayHumo=1, checkEnviarHayHumo=1, checkEnviarLuz=1, checkNoEnviarLuz=1;

// Dejar Intacto
String sendObj;
unsigned long startTime;
String str;
boolean masterAutorization= true;

void hexdump(const void *mem, uint32_t len, uint8_t cols = 16) {
	const uint8_t* src = (const uint8_t*) mem;
	USE_SERIAL.printf("\n[HEXDUMP] Address: 0x%08X len: 0x%X (%d)", (ptrdiff_t)src, len, len);
	for(uint32_t i = 0; i < len; i++) {
		if(i % cols == 0) {
			USE_SERIAL.printf("\n[0x%08X] 0x%08X: ", (ptrdiff_t)src, i);
		}
		USE_SERIAL.printf("%02X ", *src);
		src++;
	}
	USE_SERIAL.printf("\n");
}

void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {

	switch(type) {
		case WStype_DISCONNECTED:
			USE_SERIAL.printf("[WSc] Disconnected!\n");
			break;
		case WStype_CONNECTED:
			USE_SERIAL.printf("[WSc] Connected to url: %s\n", payload);
      temperaturaValue=dht.readTemperature();
      humedadValue=dht.readHumidity();
      humoValue=analogRead(pinSensorHumo);
      lluviaValue=digitalRead(pinSensorLluvia);
      luzValue=analogRead(pinSensorLuz);
     
      S1= "{\"id\":\"WStype_CONNECTED\",";
      S2= "\"value\":true";
      S3= ", \"temperaturaValue\":";
      S4= ", \"humedadValue\":";
      S5= ", \"humoValue\":";
      S6= ", \"luzValue\":";
      S7= ", \"lluviaValue\":";
      S8= "}";

      temperaturaValue_String= (String) temperaturaValue;
      humedadValue_String= (String) humedadValue;
      humoValue_String= (String) humoValue;
      luzValue_String= (String) luzValue;
      lluviaValue_String= (String) lluviaValue;

      // Si primero abrimos la pagina web, antes de haber conectado el ESP32, pues el nWSC no se mando, entonces si conectamos el ESP32 con la
      // pagina ya abierta, la pagina no se actualizara al menos que presionemos F5, para arreglar esto, siempre que conectamos por primera vez
      // el ESP32, este "case WStype_CONNECTED:" se ejecuta automaticamente y una sola vez, entonces aprovechamos eso y mandamos un objeto con
      // los datos de los sensores para que la pagina se actualice
      
      webSocket.sendTXT(S1 + S2 + S3 + temperaturaValue_String + S4 + humedadValue_String + S5 + humoValue_String + S6 + luzValue_String + S7 + lluviaValue_String + S8);

      
			// send message to server when Connected
//			webSocket.sendTXT("Connected");
			break;
		case WStype_TEXT:
      // Mensajes del Servidor
			USE_SERIAL.printf("[WSc] get text: %s\n", payload);
      str = (char*) payload;
      // Si ya tenemos conectado el ESP32 y un cliente nuevo abre la pagina, recibimos este mensaje del Servidor
      if( str == "newWebsocketConnected"){ // nWSC
        
       
        S1= "{\"id\":\"fromArduinoNewWebSocketDataForClient\",";
        S2= "\"value\": true";
        S3= ", \"temperaturaValue\": ";
        S4= ", \"humedadValue\": ";
        S5= ", \"humoValue\": ";
        S6= ", \"luzValue\": ";
        S7= ", \"lluviaValue\": ";
        S8= "}";
  
        temperaturaValue_String= (String) temperaturaValue;
        humedadValue_String= (String) humedadValue;
        humoValue_String= (String) humoValue;
        luzValue_String= (String) luzValue;
        lluviaValue_String= (String) lluviaValue;

        webSocket.sendTXT(S1 + S2 + S3 + temperaturaValue_String + S4 + humedadValue_String + S5 + humoValue_String + S6 + luzValue_String + S7 + lluviaValue_String + S8);
      }
			// send message to server
			// webSocket.sendTXT("message here");
			break;
		case WStype_BIN:
			USE_SERIAL.printf("[WSc] get binary length: %u\n", length);
			hexdump(payload, length);

			// send data to server
			// webSocket.sendBIN(payload, length);
			break;
		case WStype_ERROR:			
		case WStype_FRAGMENT_TEXT_START:
		case WStype_FRAGMENT_BIN_START:
		case WStype_FRAGMENT:
		case WStype_FRAGMENT_FIN:
			break;
	}

}

int incomingByte = 1;
uint8_t * buf;
size_t buf_len;

void setup() {
	// USE_SERIAL.begin(921600);
	USE_SERIAL.begin(115200);

	Serial.setDebugOutput(true);
	USE_SERIAL.setDebugOutput(true);

	USE_SERIAL.println();
	USE_SERIAL.println();
	USE_SERIAL.println();

	for(uint8_t t = 4; t > 0; t--) {
		USE_SERIAL.printf("[SETUP] BOOT WAIT %d...\n", t);
		USE_SERIAL.flush();
		delay(1000);
	}

	WiFiMulti.addAP("ARRIS-8522", "XLO90OP088-");
//  WiFiMulti.addAP("INFINITUM31EA83", "1D27CE075B");
//  WiFiMulti.addAP("MotoGPlay1649", "82085ba3236f");
	//WiFi.disconnect();
	while(WiFiMulti.run() != WL_CONNECTED) {
		delay(100);
	}

	// server address, port and URL
//	webSocket.begin("192.168.0.4", 3000, "/");
  webSocket.begin("134.209.0.233", 3000, "/");

	// event handler
	webSocket.onEvent(webSocketEvent);

	// use HTTP Basic Authorization this is optional remove if not needed
	webSocket.setAuthorization("user", "Password");


  pinMode(pinSensorTemperaturaHumedad, INPUT); // pinSensorTemperaturaHumedad
  pinMode(pinSensorLluvia, INPUT); // pinSensorLluvia

  // No Borrar
  startTime = millis();
  dht.begin(); //Se inicia el sensor
}

void loop() {
  webSocket.loop();


  if(masterAutorization){
    
    temperaturaValue= dht.readTemperature();
    delay(100);
    
    humedadValue= dht.readHumidity();
    delay(100);

    humoValue= analogRead(pinSensorHumo);
    delay(100);
    
    lluviaValue= digitalRead(pinSensorLluvia);
    delay(100);
    
    luzValue= analogRead(pinSensorLuz);
    delay(100);
    
    if(temperaturaValue != temperaturaValue_Flag){
      temperaturaValue_Flag= temperaturaValue;
      temperaturaValue_String= (String) temperaturaValue;
      sendObj= "{\"id\": \"temperaturaValue\", \"value\":" + temperaturaValue_String + "}";
      webSocket.sendTXT(sendObj);
    }

    if(humedadValue != humedadValue_Flag){
      humedadValue_Flag= humedadValue;
      humedadValue_String= (String) humedadValue;
      sendObj= "{\"id\": \"humedadValue\", \"value\":" + humedadValue_String + "}";
      webSocket.sendTXT(sendObj);
    }

    // boolean checkEnviarNoHayHumo=1, checkEnviarHayHumo=1;
    
    if(humoValue != humoValue_Flag){
      humoValue_Flag= humoValue;

      if(humoValue < 2000){
        if(checkEnviarNoHayHumo){
          humoValue_String= (String) humoValue;
          sendObj= "{\"id\": \"humoValue\", \"value\":" + humoValue_String + "}";
          webSocket.sendTXT(sendObj);
          // Flags
          checkEnviarHayHumo=1;
          checkEnviarNoHayHumo=0;
        }
        
        
      }else{
        if(checkEnviarHayHumo){
          humoValue_String= (String) humoValue;
          sendObj= "{\"id\": \"humoValue\", \"value\":" + humoValue_String + "}";
          webSocket.sendTXT(sendObj);
          // Flags
          checkEnviarHayHumo=0;
          checkEnviarNoHayHumo=1;
        }
      }
      


      
    }
    
    if(lluviaValue != lluviaValue_Flag){
      lluviaValue_Flag= lluviaValue;
      lluviaValue_String= (String) lluviaValue;
      sendObj= "{\"id\": \"lluviaValue\", \"value\":" + lluviaValue_String + "}";
      webSocket.sendTXT(sendObj);
    }

    // boolean checkEnviarLuz=1, checkNoEnviarLuz=1;
    if(luzValue != luzValue_Flag){
      luzValue_Flag= luzValue;
      
      if(luzValue <2000){
        // Hay Nubes

        if(checkNoEnviarLuz){
          luzValue_String= (String) luzValue;
          sendObj= "{\"id\": \"luzValue\", \"value\":" + luzValue_String + "}";
          webSocket.sendTXT(sendObj);
//          Serial.println("Machinima");
          checkNoEnviarLuz=0;
          checkEnviarLuz=1;
        }
        
      }else{
        if(checkEnviarLuz){
          luzValue_String= (String) luzValue;
          sendObj= "{\"id\": \"luzValue\", \"value\":" + luzValue_String + "}";
          webSocket.sendTXT(sendObj);
//          Serial.println("TGN");
          checkEnviarLuz=0;
          checkNoEnviarLuz=1;
        }
      }
    }
    
    
    


    Serial.print("Temperatura :"); 
    Serial.println(temperaturaValue);
    Serial.print("Humedad: ");
    Serial.println(humedadValue);
    Serial.print("Humo: ");
    Serial.println(humoValue);
    Serial.print("Lluvia: ");
    Serial.println(lluviaValue);
    Serial.print("Luz: ");
    Serial.println(luzValue);
    
    Serial.println("--------------------------------------------------------------");
  }


  
  // HeartBite No Borrar
  if (millis() - startTime >= 5000) {
      // 5 seconds have elapsed. ... do something interesting ...
      delay(0);
      webSocket.sendBIN(buf, buf_len);
      startTime = millis();
   }
}
