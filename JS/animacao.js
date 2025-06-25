function Animacao(context) {
    this.context = context;
    this.sprites = [];
    this.obstaculos = [];
    this.ligado = false;
    this.offsetChao = 0;
    this.tempoInicio = Date.now();
    this.scrollX = 0;   
    this.scrollSpeed = 3;
    this.cenarioCurrentFrame = 0;
    this.totalFramesCenario = 4; 
    this.ultimaMudancaFrame = Date.now();
    this.cariocaImgs = [];
    this.obstaculoPularSheet = null;
    this.obstaculoRolarSheet = null;
    this.frameWidthCastelo = 48;
    this.frameHeightCastelo = 51;
    this.frameWidthPipa = 64;
    this.frameHeightPipa = 22;
    this.frameAtualObstaculo = 0;
    this.personagem = null;
    
    // Constantes da animação
    this.ALTURA_CHAO = 160;
    this.VELOCIDADE_JOGO = 8;
    this.TEMPO_POR_FRAME_OBSTACULO = 60000; // 5 segundos em milissegundos
}

Animacao.prototype = {
    novoSprite: function(sprite) {
        this.sprites.push(sprite);
        if (sprite instanceof Carioca) {
            this.personagem = sprite;
        }
    },

    ligar: function() {
        this.ligado = true;
        this.gerarObstaculo();
        this.tempoInicio = Date.now();
        this.proximoFrame();
    },

    desligar: function() {
        this.ligado = false;
    },

    proximoFrame: function() {
    if (!this.ligado) return;

    const agora = Date.now();
    if (agora - this.ultimaMudancaFrame >= 60000) {
    // Verifica se estamos no último frame
    if (this.cenarioCurrentFrame === this.totalFramesCenario - 1) {
        // Reinicia a página
        location.reload();
        return; // interrompe a execução para evitar erros
    }

    this.cenarioCurrentFrame = (this.cenarioCurrentFrame + 1) % this.totalFramesCenario;
    this.frameAtualObstaculo = this.cenarioCurrentFrame;
    this.ultimaMudancaFrame = agora;

        if (this.sprites.length > 0 && this.cariocaImgs[this.cenarioCurrentFrame]) {
            const novaImagem = this.cariocaImgs[this.cenarioCurrentFrame];
        
            if (novaImagem.complete) {
                this.sprites[0].trocarSpriteSheet(novaImagem);
            } else {
                novaImagem.onload = () => {
                    if (this.cenarioCurrentFrame === (this.cariocaImgs.indexOf(novaImagem))) {
                        this.sprites[0].trocarSpriteSheet(novaImagem);
                    }
                };
            }
        }
    }

    this.limparTela();

    for (let i in this.sprites) this.sprites[i].atualizar();

    for (let i = this.obstaculos.length - 1; i >= 0; i--) {
        this.obstaculos[i].x -= this.VELOCIDADE_JOGO;
        if (this.obstaculos[i].x + this.obstaculos[i].largura < 0) {
            this.obstaculos.splice(i, 1);
        }
    }

    if (this.personagem) {
        for (let o of this.obstaculos) {
            const hitbox = o.hitbox;
            const ox = o.x + hitbox.x;
            const oy = o.y + hitbox.y;
            const ow = hitbox.largura;
            const oh = hitbox.altura;

            if (
                this.personagem.x < ox + ow &&
                this.personagem.x + 32 > ox &&
                this.personagem.y < oy + oh &&
                this.personagem.y + 48 > oy
            ) {
                // Colisão detectada - reinicia automaticamente
                this.resetarJogo();
                return;
            }
        }
    }

    this.desenharObstaculos();
    for (let i in this.sprites) this.sprites[i].desenhar();

    let animacao = this;
    requestAnimationFrame(function() {
        animacao.proximoFrame();
    });
},

    limparTela: function() {
        const frameWidth = 640;
        const frameHeight = 192;
        
        this.scrollX -= this.scrollSpeed;
        if (this.scrollX <= -frameWidth) this.scrollX = 0;

        if (cenarioImg.complete) {
            this.context.drawImage(
                cenarioImg,
                this.cenarioCurrentFrame * frameWidth, 0, frameWidth, frameHeight,
                this.scrollX, 0, canvas.width, canvas.height
            );
            
            if (this.scrollX < 0) {
                this.context.drawImage(
                    cenarioImg,
                    this.cenarioCurrentFrame * frameWidth, 0, frameWidth, frameHeight,
                    this.scrollX + frameWidth, 0, canvas.width, canvas.height
                );
            }
        }
    },

    desenharObstaculos: function() {
    this.obstaculos.forEach(obs => {
    if (obs.spritesheet && obs.spritesheet.complete) {
        this.context.drawImage(
            obs.spritesheet,
            this.frameAtualObstaculo * obs.frameWidth,
            0,
            obs.frameWidth,
            obs.frameHeight,
            obs.x,
            obs.y,
            obs.largura,
            obs.altura
        );
    }
    });
    },

    gerarObstaculo: function () {
    const distanciaMinima = 135;
    const distanciaAleatoria = Math.floor(Math.random() * 120); // Até 120px adicionais
    const distanciaTotal = distanciaMinima + distanciaAleatoria;

    // Verifica se o último obstáculo ainda está muito próximo
    if (this.obstaculos.length > 0) {
        const ultimo = this.obstaculos[this.obstaculos.length - 1];
        if (ultimo.x + ultimo.largura + distanciaTotal > canvas.width) {
            // Tenta novamente após um tempo
            setTimeout(() => this.gerarObstaculo(), 300);
            return;
        }
    }

    const tipoPular = Math.random() > 0.5;

    const obstaculo = tipoPular
        ? {
            tipo: 'PULAR',
            x: canvas.width,
            y: 127,
            largura: this.frameWidthCastelo,
            altura: this.frameHeightCastelo,
            spritesheet: this.obstaculoPularSheet,
            frameWidth: this.frameWidthCastelo,
            frameHeight: this.frameHeightCastelo,
            hitbox: { x: 5, y: 10, largura: 48, altura: 51 }
        }
        : {
            tipo: 'ROLAR',
            x: canvas.width,
            y: 91,
            largura: this.frameWidthPipa,
            altura: this.frameHeightPipa,
            spritesheet: this.obstaculoRolarSheet,
            frameWidth: this.frameWidthPipa,
            frameHeight: this.frameHeightPipa,
            hitbox: { x: 8, y: 0, largura: 64, altura: 22 }
        };

    this.obstaculos.push(obstaculo);

    // Define o próximo intervalo com base na distância total (mais espaço = mais tempo)
    const tempoBase = 800;
    const tempoAleatorio = Math.floor(Math.random() * 1000); // de 0 a 1000ms

    setTimeout(() => this.gerarObstaculo(), tempoBase + tempoAleatorio);
    },


    resetarJogo: function() {
    this.desligar(); // Primeiro desliga a animação
    
    // Reseta todos os parâmetros
    this.obstaculos = [];
    this.cenarioCurrentFrame = 0;
    this.frameAtualObstaculo = 0;
    this.ultimaMudancaFrame = Date.now();
    
    if (this.personagem) {
        this.personagem.x =  10;
        this.personagem.y = this.ALTURA_CHAO - (this.personagem.imagem.height / 5);
        this.personagem.pulando = false;
        this.personagem.velocidadeY = 0;
        
        // Volta para a primeira imagem do personagem
        if (this.cariocaImgs[0] && this.cariocaImgs[0].complete) {
            this.personagem.trocarSpriteSheet(this.cariocaImgs[0]);
        }
        
        // Muda o estado do personagem para ESQUERDA
        this.personagem.mudarEstado(PERSONAGEM_ESQUERDA);
    }
    
    // Pequeno delay antes de reiniciar para dar tempo do jogador perceber a colisão
    setTimeout(() => {
        this.ligar();
    }, 100);
    }
};