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
        }
    });
    console.log("fim loop");
}