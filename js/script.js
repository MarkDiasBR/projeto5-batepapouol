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
    const promessa1 = axios.post('https://mock-api.driven.com.br/api/v6/uol/participants', novoUsuario);
    promessa1.then(loginSucesso);
    promessa1.catch(loginFalha);
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
    const promessa3 = axios.post('https://mock-api.driven.com.br/api/v6/uol/participants', novoUsuario);
    promessa3.then(loginSucesso);
    promessa3.catch(loginFalha);
}

function mantemConexao() {
    let interval = setInterval(estouOnline, 5000);
}

function estouOnline() {
    const promessa2 = axios.post('https://mock-api.driven.com.br/api/v6/uol/status', objetoUsuario);
    promessa2.then(function(){console.log('continuo online')}).catch(function(){console.log('agora estou offline')});
}