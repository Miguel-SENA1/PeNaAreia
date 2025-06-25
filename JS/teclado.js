let SETA_CIMA = 38;
let SETA_ESQUERDA = 37;
let SETA_BAIXO = 40;
let SETA_DIREITA = 39;
let ESPACO = 32;

function Teclado(elemento) {
    this.elemento = elemento;

    //Array de teclas pressionadas
    this.pressionadas = [];

    //Array de teclas disparadas
    this.disparadas = [];

    //Funções de disparo
    this.funcoesDisparo = [];

    //Registrando o estado das teclas no array
    let teclado = this;
    elemento.addEventListener('keydown',
        function(evento) {
            let tecla = evento.keyCode;
            teclado.pressionadas[tecla] = true;

            //Disparar somente se for o primeiro keydown da tecla
            if(teclado.funcoesDisparo[tecla] && !teclado.disparadas[tecla]) {
                teclado.disparadas[tecla] = true;
            teclado.funcoesDisparo[tecla]();
            setTimeout(() => teclado.disparadas[tecla] = false, 100); // Delay de 200ms
            }
        })
    elemento.addEventListener('keyup',
        function(evento) {
            teclado.pressionadas[evento.keyCode] = false;
            teclado.disparadas[evento.keyCode] = false;
        })
}
Teclado.prototype = {
    pressionada: function(tecla) {
        return this.pressionadas[tecla];
    }
}