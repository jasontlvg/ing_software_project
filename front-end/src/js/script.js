export function headerTime(){
    
    header = new Vue({
        el: '#header',
        data: {
            message: 'Hello Vue!',
            fecha: 'Jason TOrres',
            arduinoConnected: false
        },
        methods: {
            currentDate: function(){
                let d = new Date();
                let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                return `${days[d.getDay()]}, ${d.getDate()}th ${d.getFullYear()}`
            }
        },
        computed: {
            nombreCompleto: function () {
                var d = new Date();
                return d;
            }
        }
    });
}

