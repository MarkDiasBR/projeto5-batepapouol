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

function logarUsuario() {
    const novoUsuario = {
                            name: `${document.querySelector('.input-login').value}`
                        };
    alert(novoUsuario)
    const promessa = axios.post('https://mock-api.driven.com.br/api/v6/uol/participants', novoUsuario);
    promessa.then(loginSucesso);
    promessa.catch(loginFalha);
}

function loginSucesso(response) {
    alert("sucesso");
    const overlayEntrada = document.querySelector('.overlay-entrada');
    overlayEntrada.classList.add("login-ok");
    console.log(response);
    
}

function loginFalha(response) {
    alert("falha");
    console.log(response);
}

function buscarMensagens() {
    const promessa = axios.post('https://mock-api.driven.com.br/api/v6/uol/participants', novoUsuario);
    promessa.then(loginSucesso);
    promessa.catch(loginFalha);
}

function mantemConexao() {

}