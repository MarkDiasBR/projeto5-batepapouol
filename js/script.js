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
    });
    console.log(participantes);
}