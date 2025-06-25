const PERSONAGEM_CIMA = 0;
const PERSONAGEM_DIREITA = 1;
const PERSONAGEM_ESQUERDA = 2;
const PERSONAGEM_BAIXO = 3;
const PERSONAGEM_IDLE = 4;

function Carioca(context, teclado, imagem) {
    this.context = context;
    this.teclado = teclado;
    this.imagem = imagem;
    this.x = 10;
    this.y = 165 - (imagem.height / 5);
    this.velocidade = 5;
    this.pulando = false;
    this.velocidadePulo = -10;
    this.gravidade = 0.7;
    this.velocidadeX = 9;
    this.velocidadeXA = 7;
    this.velocidadeY = 0;

    // Aqui passamos um array com o número de colunas para cada linha
    this.sheet = new Spritesheet(context, imagem, 4, [2, 4, 4, 4]);
    this.sheet.intervalo = 120;

    this.animacoes = {
    [PERSONAGEM_ESQUERDA]: { 
        linha: 0, 
        frames: 2, 
        emLoop: true,
        intervalo: 250
    },
    [PERSONAGEM_DIREITA]: { 
        linha: 1, 
        frames: 4, 
        emLoop: true,
        intervalo: 55
    },
    [PERSONAGEM_CIMA]: { 
        linha: 2, 
        frames: 5, 
        emLoop: false,
        intervalo: 90
    },
    [PERSONAGEM_BAIXO]: { 
        linha: 3, 
        frames: 4, 
        emLoop: false,
        intervalo: 100
    },
    [PERSONAGEM_IDLE]: { 
        linha: 1, // Usa a mesma linha da animação de corrida para direita
        frames: 4, 
        emLoop: true,
        intervalo: 100 // Mesmo intervalo da animação de corrida
    }
    };
    this.estadoAtual = PERSONAGEM_IDLE;
    this.velocidadeBase = 9; // Adicione esta linha

    this.rolamentoDisponivel = true;
    this.tempoUltimoRolamento = 0;
    this.cooldownRolamento = 500; // 3 segundos em milissegundos
}

Carioca.prototype = {
    atualizar: function() {
        const tempoAtual = Date.now();
        
        // Verifica se o cooldown do rolamento acabou
        if (!this.rolamentoDisponivel && tempoAtual - this.tempoUltimoRolamento >= this.cooldownRolamento) {
            this.rolamentoDisponivel = true;
        }

        const larguraPersonagem = this.imagem.width / Math.max(...this.sheet.numColunasPorLinha);
        const LIMITE_ESQUERDO = 0;
        const LIMITE_DIREITO = canvas.width - larguraPersonagem;

        // Pulo
        if (this.pulando) {
            this.velocidadeY += this.gravidade;
            this.y += this.velocidadeY;
            if (this.y >= 165 - (this.imagem.height / 5)) {
                this.y = 165 - (this.imagem.height / 5);
                this.pulando = false;
                this.velocidadeY = 0;
                this.mudarEstado(PERSONAGEM_IDLE);
            }
        } 
        // Inicia pulo
        else if (this.teclado.pressionada(SETA_CIMA)) {
            this.pulando = true;
            this.velocidadeY = this.velocidadePulo;
            this.mudarEstado(PERSONAGEM_CIMA);
        }

        // Movimento horizontal (só se não estiver pulando)
        if (!this.pulando) {
            const teclaDireitaPressionada = this.teclado.pressionada(SETA_DIREITA);
            const teclaEsquerdaPressionada = this.teclado.pressionada(SETA_ESQUERDA);
            const teclaBaixoPressionada = this.teclado.pressionada(SETA_BAIXO);

            // --- Lógica para voltar ao IDLE quando soltar as teclas ---
            // (Exceto se estiver no meio de uma animação sem loop)
            const animacaoAtual = this.animacoes[this.estadoAtual];
            const animacaoConcluida = !animacaoAtual.emLoop && (this.sheet.coluna === animacaoAtual.frames - 1);

            // Se soltou a tecla direita e não está em uma animação bloqueante
            if (this.estadoAtual === PERSONAGEM_DIREITA && !teclaDireitaPressionada && 
                (animacaoAtual.emLoop || animacaoConcluida)) {
                this.mudarEstado(PERSONAGEM_IDLE);
            }
            // Se soltou a tecla esquerda e não está em uma animação bloqueante
            else if (this.estadoAtual === PERSONAGEM_ESQUERDA && !teclaEsquerdaPressionada && 
                    (animacaoAtual.emLoop || animacaoConcluida)) {
                this.mudarEstado(PERSONAGEM_IDLE);
            }

            // --- Movimentos ---
            // Direita
            if (teclaDireitaPressionada) {
                if (this.x + this.velocidadeXA < LIMITE_DIREITO) {
                    this.x += this.velocidadeXA;
                } else {
                    this.x = LIMITE_DIREITO;
                }
                this.mudarEstado(PERSONAGEM_DIREITA);
            } 
            // Esquerda
            else if (teclaEsquerdaPressionada) {
                if (this.x - this.velocidadeX > LIMITE_ESQUERDO) {
                    this.x -= 4;
                } else {
                    this.x = LIMITE_ESQUERDO;
                }
                this.mudarEstado(PERSONAGEM_ESQUERDA);
            } 
            // Rolamento (baixo)
            else if (teclaBaixoPressionada && this.rolamentoDisponivel) {
                this.mudarEstado(PERSONAGEM_BAIXO);
                this.rolamentoDisponivel = false;
                this.tempoUltimoRolamento = tempoAtual;
            }
            // Se não está fazendo nada e a animação atual permitir voltar ao IDLE
            else if (this.estadoAtual !== PERSONAGEM_IDLE && 
                    (animacaoAtual.emLoop || animacaoConcluida)) {
                this.mudarEstado(PERSONAGEM_IDLE);
            }
        }

        this.sheet.proximoQuadro();
    },

    mudarEstado: function(novoEstado) {
        const animacao = this.animacoes[novoEstado];

        if (this.estadoAtual !== novoEstado) {
            this.estadoAtual = novoEstado;
            this.sheet.linha = animacao.linha;
            this.sheet.coluna = 0;
            this.sheet.resetarTempo(); // <<<<< Adiciona isso aqui
        }

        // Sempre atualize o intervalo (mesmo se o estado não mudou)
        this.sheet.intervalo = animacao.intervalo;
    },

    desenhar: function() {
        this.sheet.desenhar(this.x, this.y);
    },
    trocarSpriteSheet: function(novaImagem) {
    if (!novaImagem || !novaImagem.complete) {
        console.error("Imagem inválida ou não carregada");
        return false;
    }

    // Salva o estado atual antes da troca
    const estadoAnterior = this.estadoAtual;
    const colunaAnterior = this.sheet.coluna;
    const tempoAnterior = this.sheet.ultimoTempo;

    // Cria nova spritesheet
    this.sheet = new Spritesheet(this.context, novaImagem, 4, [2, 4, 4, 4]);
    
    // Restaura o estado
    this.estadoAtual = estadoAnterior;
    this.sheet.linha = this.animacoes[estadoAnterior].linha;
    this.sheet.coluna = colunaAnterior % this.sheet.numColunasPorLinha[this.sheet.linha];
    this.sheet.ultimoTempo = tempoAnterior;
    this.sheet.intervalo = this.animacoes[estadoAnterior].intervalo;

    // Ajusta posição Y para nova altura
    const novaAltura = novaImagem.height / 5; // Assumindo 5 linhas
    this.y = 165 - novaAltura;

    return true;
    }
};