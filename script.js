class NaoTerminal {
    constructor(simbolo, producoes){
        this.simbolo = simbolo;
        this.producoes = producoes;
    }
}

class Producao {
    constructor(naoTerminal, primeiros, producao){
        this.naoTerminal = naoTerminal;
        this.primeiros = primeiros;
        this.producao = producao;
    }
}

const epsilon = "ε";

let contadorIteracoes = 0;
let pilha = "$S";
let entrada = "";
let parsingFinalizado = false;
let tabelaProducoes = [];
let campoEntrada = document.getElementById("tokenInput");
let tabelaResolucao = document.getElementById("resolutionTable");

function gerarSentenca(simbolo, profundidade = 0) {
    if(profundidade > 20) return "";

    if(simbolo.match(/^[a-z]$/) || simbolo === "$") return simbolo;

    if(simbolo === epsilon) return "";

    const naoTerminal = tabelaProducoes.find(nt => nt.simbolo === simbolo);
    if(!naoTerminal) return "";

    const listaProducoes = naoTerminal.producoes;
    const indiceAleatorio = Math.floor(Math.random() * listaProducoes.length);
    const producaoSelecionada = listaProducoes[indiceAleatorio].producao;

    if(producaoSelecionada === epsilon) return "";

    let resultado = "";
    for (const caracter of producaoSelecionada) {
        resultado += gerarSentenca(caracter, profundidade + 1);
    }

    return resultado;
}

function inicializarSentenca(){
    let sentencaGerada = "";
    let tentativas = 0;
    const MIN_LEN = 5;
    const MAX_LEN = 20;
    
    do {
        sentencaGerada = gerarSentenca("S");
        tentativas++;
        if(tentativas > 50) { // evita loop infinito
            break;
        }
    } while(sentencaGerada.length < MIN_LEN || sentencaGerada.length > MAX_LEN);

    campoEntrada.value = sentencaGerada;
    inicializarAnalisador();
}


function inicializarAnalisador(){
    limparTabela();

    const cabecalho = tabelaResolucao.createTHead();
    const linha = cabecalho.insertRow(-1);

    linha.appendChild(criarCelula("th", "Pilha"));
    linha.appendChild(criarCelula("th", "Entrada"));
    linha.appendChild(criarCelula("th", "Ação"));
}

function criarProducao(simboloNaoTerminal, primeiros, producao) {
    let existe = false;
    let naoTerminal;

    for(let i = 0; i < tabelaProducoes.length; i++) {
        naoTerminal = tabelaProducoes[i];
        if(naoTerminal.simbolo === simboloNaoTerminal) {
            tabelaProducoes.splice(i, 1);
            existe = true;
            break;
        }
    }

    if(!existe){
        naoTerminal = new NaoTerminal(simboloNaoTerminal, []);
    }

    naoTerminal.producoes.push(new Producao(naoTerminal, primeiros, producao));
    return naoTerminal;
}

function buscarProducao(pilhaTopo, simboloEntrada) {
    for(const naoTerminal of tabelaProducoes) {
        if(naoTerminal.simbolo === pilhaTopo) {
            for(const producao of naoTerminal.producoes) {
                if(producao.naoTerminal.simbolo === pilhaTopo && producao.primeiros.includes(simboloEntrada)){
                    return producao;
                }
            }
        }
    }
    return false;
}

function executarProximoPasso() {
    if(campoEntrada.value.length === 0){
        parsingFinalizado = true;
        return;
    }

    if(parsingFinalizado){
        inicializarAnalisador();
    }

    if(!entrada){
        entrada = campoEntrada.value + "$";
    }

    let acao = "";
    const topoPilha = pilha.slice(-1);
    const estadoPilhaAntes = pilha;
    const estadoEntradaAntes = entrada;
    pilha = pilha.slice(0, -1);

    contadorIteracoes++;

    if(topoPilha === entrada.charAt(0) && topoPilha === "$"){
        acao = `Aceito em ${contadorIteracoes} iterações`;
        parsingFinalizado = true;
    } else if(topoPilha && topoPilha === topoPilha.toUpperCase()) {
        const producaoEncontrada = buscarProducao(topoPilha, entrada.charAt(0));
        if(producaoEncontrada){
            acao = `${producaoEncontrada.naoTerminal.simbolo} → ${producaoEncontrada.producao}`;
            if(producaoEncontrada.producao !== epsilon){
                pilha += producaoEncontrada.producao.split('').reverse().join('');
            }
        } else {
            acao = `Erro em ${contadorIteracoes} iterações!`;
            parsingFinalizado = true;
        }
    } else if(topoPilha && topoPilha === entrada.charAt(0)) {
        acao = `Lê '${entrada.charAt(0)}'`;
        entrada = entrada.substring(1);
    } else {
        acao = `Erro em ${contadorIteracoes} iterações!`;
        parsingFinalizado = true;
    }

    inserirLinha(estadoPilhaAntes, estadoEntradaAntes, acao);
    return acao;
}

function executarTudo() {
    inicializarAnalisador();
    while(!parsingFinalizado){
        executarProximoPasso();
    }
}

function criarCelula(tipo, texto, classeCss){
    const celula = document.createElement(tipo);
    if(classeCss) celula.className = classeCss;
    celula.innerHTML = texto;
    return celula;
}

function inserirLinha(pilhaEstado, entradaEstado, acao) {
    const linha = tabelaResolucao.insertRow(-1);
    linha.appendChild(criarCelula("td", pilhaEstado));
    linha.appendChild(criarCelula("td", entradaEstado));
    linha.appendChild(criarCelula("td", acao));
}

function limparTabela(){
    contadorIteracoes = 0;
    pilha = "$S";
    entrada = "";
    parsingFinalizado = false;

    while(tabelaResolucao.hasChildNodes()){
        tabelaResolucao.removeChild(tabelaResolucao.lastChild);
    }
}

function alternarDropdown(){
    const dropdown = document.getElementById('dropdown');
    dropdown.classList.toggle('open');
}

// Inicialização das produções
inicializarAnalisador();

tabelaProducoes.push(criarProducao("S", ["a"], "aAc"));
tabelaProducoes.push(criarProducao("S", ["c"], "cB"));
tabelaProducoes.push(criarProducao("S", ["d"], "dCc"));

tabelaProducoes.push(criarProducao("A", ["b"], "bDd"));
tabelaProducoes.push(criarProducao("A", ["c"], epsilon));

tabelaProducoes.push(criarProducao("B", ["c"], "cBc"));
tabelaProducoes.push(criarProducao("B", ["d"], "dDa"));

tabelaProducoes.push(criarProducao("C", ["d"], "dC"));
tabelaProducoes.push(criarProducao("C", ["a"], "aAc"));

tabelaProducoes.push(criarProducao("D", ["b"], "bD"));
tabelaProducoes.push(criarProducao("D", ["c"], "cB"));
tabelaProducoes.push(criarProducao("D", ["d", "a"], epsilon));

function resetarAnalisador(){
  contadorIteracoes = 0;
  pilha = "$S";
  entrada = "";
  parsingFinalizado = false;

  while(tabelaResolucao.hasChildNodes()){
    tabelaResolucao.removeChild(tabelaResolucao.lastChild);
  }

  inicializarAnalisador();

  campoEntrada.value = "";
}