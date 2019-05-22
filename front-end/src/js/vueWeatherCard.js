export function vueWeatherCard(){
    // let io= function(){
    //     return {
    //         emit: function(x,y){
    //             return 'Hola';
    //         }
    //     }
    // }
    // const socket= io();
    card = new Vue({
        el: '#card',
        data: {
            message: 'Hello Vue!',
            temperature: 0,
            humidity: 0,
            smoke: false,
            light: 0,
            rain: false,
            sunnyIcon: true,
            partlyCloudyIcon:false,
            statusClima: "Desconocido",
            
        },
        methods: {
            
        },
        computed: {
            
        }
    });
    // socket.emit("clientMotor1Value", 800)
}