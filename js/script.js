//************Layout*************

const textarea = document.querySelector("textarea");
textarea.addEventListener("keyup", e => {
    textarea.style.height = "auto";
    let scHeight = e.target.scrollHeight;
    console.log(scHeight);
    textarea.style.height = `${scHeight}px`;
});

function toggleSidebar() {
    const sidebar = document.querySelector(".sidebar");
    sidebar.classList.toggle("ativo");

    const overlay = document.querySelector(".overlay");
    overlay.classList.toggle("ativo");

    document.body.classList.toggle("body-overlay");
}

const overlayFora = document.querySelector(".overlay-fora");

overlayFora.addEventListener("click",toggleSidebar);

//************Axios*************

let nomeUsuario;
let objetoUsuario;

function logarUsuario() {
    const novoUsuario = {
        name: `${document.querySelector('.input-login').value}`
    };
    console.log(novoUsuario)
    const promessa = axios.post('https://mock-api.driven.com.br/api/v6/uol/participants', novoUsuario);
    promessa.then(loginSucesso);
    promessa.catch(loginFalha);
}

function loginSucesso(response) {
    console.log(response);
    console.log("login feito com sucesso");
    nomeUsuario = document.querySelector('.input-login').value;
    objetoUsuario = {
        name: `${nomeUsuario}`
    };
    const overlayEntrada = document.querySelector('.overlay-entrada');
    overlayEntrada.classList.add("login-ok");
    estouOnline();
    buscarMensagens();
    buscarParticipantes();
    mantemConexao();
}

function loginFalha(response) {
    console.log("falha");
    console.log(response);
}

function buscarMensagens() {
    const promessa = axios.post('https://mock-api.driven.com.br/api/v6/uol/participants', novoUsuario);
    promessa.then(loginSucesso);
    promessa.catch(loginFalha);
}

function mantemConexao() {
    let interval = setInterval(estouOnline, 5000);
    let interval2 = setInterval(buscarMensagens, 5000);
    let interval3 = setInterval(buscarParticipantes, 5000);
}

function estouOnline() {
    const promessa = axios.post('https://mock-api.driven.com.br/api/v6/uol/status', objetoUsuario);
    promessa.then(function(){console.log('continuo online')});
    promessa.catch(function(){console.log('agora estou offline')});
}

function buscarMensagens() {
    const promessa = axios.get('https://mock-api.driven.com.br/api/v6/uol/messages');
    promessa.then(jogarMensagensNoHTML);
    promessa.catch(function (){console.log('erro ao buscar mensagens')});
}

let mensagens = document.querySelector('main');

function jogarMensagensNoHTML(response) {
    
    console.log('mensagens buscadas com sucesso');
    console.log(response);
    console.log(response.data);
    mensagens.innerHTML = "";
    response.data.forEach(mensagem => {
        if (mensagem.type === "status") {
            mensagens.innerHTML += `
        <div data-test="message" class="mensagem entrada-saida">
            <p><span class="horario">(${mensagem.time})</span><span class="usuario">${mensagem.from}</span><span class="conteudo-mensagem">${mensagem.text}</span></p>
        </div>
        `;
        } else if (mensagem.type === "private_message" && (mensagem.to === nomeUsuario || mensagem.from === nomeUsuario)) {
            mensagens.innerHTML += `
        <div data-test="message" class="mensagem reservadamente">
            <p><span class="horario">(${mensagem.time})</span><span class="usuario">${mensagem.from}</span><span class="tipo-mensagem"></span> reservadamente para </span><span class="usuario">${mensagem.to}</span><span class="dois-pontos">:</span><span class="conteudo-mensagem">${mensagem.text}</span></p>
        </div>
        `;
        } else { //mensagem.type === "message"
            mensagens.innerHTML += `
        <div data-test="message" class="mensagem"> 
            <p><span class="horario">(${mensagem.time})</span><span class="usuario">${mensagem.from}</span><span class="tipo-mensagem"> para </span><span class="usuario">${mensagem.to}</span>:<span class="conteudo-mensagem">${mensagem.text}</span></p>
        </div>
        `;
        }
    });
    console.log("fim loop");
}

function enviarMensagem() {
    const novaMensagem = {
        from: nomeUsuario,
        to: nomeDestinatario,
        text: document.querySelector('.input-message').value,
        type: tipoMensagem // ou "private_message" para o bônus
    };
    const promessa = axios.post('https://mock-api.driven.com.br/api/v6/uol/messages', novaMensagem);
    promessa.then(function () {console.log("mensagem enviada")});
    promessa.catch(function () {console.log("mensagem não enviada")});
}

let participantes = []; // Lembrar de incluir TODOS entre participantes

function buscarParticipantes() {
    const promessa = axios.get('https://mock-api.driven.com.br/api/v6/uol/participants');
    promessa.then(function(response) {
        participantes = [];
        response.data.forEach(element => {
            participantes.push(element.name);
        });
        participantes = participantes.filter(elem=>elem !== nomeUsuario);
    });
    console.log(participantes);
    jogarParticipantesNoHTML();
}

let nomeDestinatario = "Todos";
let nomeSelecionado;
const participantesHTML = document.querySelector(".wrapper-participants");

function jogarParticipantesNoHTML() {
    if (document.querySelector(".all.selected > p") !== null) {
        nomeSelecionado = "Todos";
    } else if (document.querySelector(".participant.selected > p") !== null) {
        nomeSelecionado = document.querySelector(".participant.selected > p").innerHTML; //Copiar valor, não referencia
    } else {
        nomeSelecionado = "Todos";
    }

    if (nomeSelecionado === "Todos") {
        participantesHTML.innerHTML = `
        <div data-test="all" class="botao-sidebar selected all" onclick="selecionaDestinatario(this)">
            <ion-icon name="people"></ion-icon>
            <p>Todos</p>
            <ion-icon data-test="check" name="checkmark-outline"></ion-icon>
        </div>
        `;
        nomeDestinatario = "Todos";
    } else {
        participantesHTML.innerHTML = `
        <div data-test="all" class="botao-sidebar all" onclick="selecionaDestinatario(this)">
            <ion-icon name="people"></ion-icon>
            <p>Todos</p>
            <ion-icon data-test="check" name="checkmark-outline"></ion-icon>
        </div>
        `;

    }

    participantes.forEach(element => {
        if (element === nomeSelecionado) {
            participantesHTML.innerHTML += `
            <div data-test="participant" class="botao-sidebar participant selected" onclick="selecionaDestinatario(this)">
                <ion-icon name="person-circle"></ion-icon>
                <p>${element}</p>
                <ion-icon data-test="check" name="checkmark-outline"></ion-icon>
            </div>
            `;
            nomeDestinatario = nomeSelecionado.innerHTML;

        } else {
            participantesHTML.innerHTML += `
            <div data-test="participant" class="botao-sidebar participant" onclick="selecionaDestinatario(this)">
                <ion-icon name="person-circle"></ion-icon>
                <p>${element}</p>
                <ion-icon data-test="check" name="checkmark-outline"></ion-icon>
            </div>
            `;
        }
    });
}



function selecionaDestinatario(destinatarioClicado) {
    if ( document.querySelector(".participant.selected") === null ) {
        if (document.querySelector(".all.selected") !== null) {
            document.querySelector(".all.selected").classList.remove("selected");
        }
        destinatarioClicado.classList.add("selected");

    } else if ( destinatarioClicado.classList.contains("selected") ) {
        destinatarioClicado.classList.remove("selected");
        document.querySelector(".all").classList.add("selected");
    } else if ( document.querySelector(".participant.selected") !== null) {
        document.querySelector(".participant.selected").classList.remove("selected");
        destinatarioClicado.classList.add("selected");
    }
}