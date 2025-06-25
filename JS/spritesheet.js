function Spritesheet(context, imagem, numLinhas, numColunasPorLinha) {
    this.context = context;
    this.imagem = imagem;
    this.numLinhas = numLinhas;
    this.numColunasPorLinha = numColunasPorLinha; // Agora pode ser um array ou número
    this.intervalo = 0;
    this.linha = 0;
    this.coluna = 0;
    this.ultimoTempo = 0;
    this.quandoTerminaAnimacao = null;
}

Spritesheet.prototype = {
    proximoQuadro: function() {
        const agora = Date.now();

        if (agora - this.ultimoTempo < this.intervalo) return;
        this.ultimoTempo = agora;
    
        this.coluna++;

        const numColunas = Array.isArray(this.numColunasPorLinha) 
            ? this.numColunasPorLinha[this.linha] 
            : this.numColunasPorLinha;

        if (this.coluna >= numColunas) {
            this.coluna = 0;

        // Dispara callback se a animação não for em loop
        if (this.quandoTerminaAnimacao) {
            this.quandoTerminaAnimacao(this.linha);
        }
    }
    },

    desenhar: function(x, y) {
    const numColunas = Array.isArray(this.numColunasPorLinha) 
        ? this.numColunasPorLinha[this.linha] 
        : this.numColunasPorLinha;

    const larguraQuadro = this.imagem.width / Math.max(...this.numColunasPorLinha);
    const alturaQuadro = this.imagem.height / this.numLinhas;

    // Arredonda as coordenadas para evitar subpixels
    const xArredondado = Math.round(x);
    const yArredondado = Math.round(y);

    // Desliga a suavização
    this.context.imageSmoothingEnabled = false;

    this.context.drawImage(
        this.imagem,
        Math.floor(larguraQuadro * this.coluna), // Garante que pegue o quadro correto
        Math.floor(alturaQuadro * this.linha),
        Math.floor(larguraQuadro),
        Math.floor(alturaQuadro),
        xArredondado, 
        yArredondado,
        Math.floor(larguraQuadro),
        Math.floor(alturaQuadro)
    );
    },
    resetarTempo: function() {
    this.ultimoTempo = 0;
    }
};