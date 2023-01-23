//Função colocada como valor no onclick do botão superior direito, que abre a sidebar, assim como no overlay, pra recolher o sidebar
function toggleSidebar() {
    const sidebar = document.querySelector(".sidebar");
    sidebar.classList.toggle("ativo");

    const overlay = document.querySelector(".overlay");
    overlay.classList.toggle("ativo");

    document.body.classList.toggle("body-overlay");

    if ( !(document.querySelector(".overlay").classList.contains("ativo"))) {
        inputMensagem.focus();
    }
}

const overlayFora = document.querySelector(".overlay-fora");

overlayFora.addEventListener("click",toggleSidebar);

//************Axios*************

let nomeUsuario;
let nomeNovoUsuario;
let objetoUsuario;

const inputEntrar = document.querySelector("input.input-login");

inputEntrar.addEventListener('keydown', function (event) {
    if ( event.keyCode === 13 && document.querySelector(".input-login").value != "" ) {
        logarUsuario();
    }
});

inputEntrar.value = "";
inputEntrar.focus();


function logarUsuario() {

    //SE input-login é não-vazio
    if (document.querySelector(".input-login").value != "") {
        const novoUsuario = {
            name: `${document.querySelector('.input-login').value}`
        };

        nomeNovoUsuario = novoUsuario.name;

        if (nomeNovoUsuario === "Todos") {
            loginFalha();
            return;
        }

        console.log(novoUsuario)

        const promessa = axios.post('https://mock-api.driven.com.br/api/v6/uol/participants', novoUsuario);
        promessa.then(loginSucesso);
        promessa.catch(loginFalha);

    //SE input-login é vazio
    } else {
        alert("Digite o nome de usuário");
    }

    //trocar o conjunto input+button pelo gif de loading
    document.querySelector("div.overlay-entrada > div:last-child").innerHTML = `
    <img class="spinner" src="./img/spinner.gif"><p>Entrando...</p>
    `;

}

function loginSucesso(response) {
    console.log(response);
    console.log("login feito com sucesso");
    nomeUsuario = nomeNovoUsuario;
    objetoUsuario = {
        name: `${nomeUsuario}`
    };

    //trocar o conjunto input+button pelo gif + bem vindo, usuário
    document.querySelector("div.overlay-entrada > div:last-child").innerHTML = `
    <img class="spinner" src="./img/spinner.gif"><p>Bem-vindo(a), ${nomeUsuario}!</p>
    `;

    //coloca o tempo de loading da overlay de entrada como o maior dos delays de processamento,
    //pra que a overlay só seja liberada quando do término do carregamento do conteúdo
    setTimeout(function() {
        const overlayEntrada = document.querySelector('.overlay-entrada');
        overlayEntrada.classList.add("login-ok");
    }, Math.max(delayEstouOnline, delayBuscarParticipantes, delayBuscarMensagens));
    
    inputMensagem.focus();

    estouOnline();
    buscarMensagens();
    buscarParticipantes();
    
    mantemConexao();
}

function loginFalha(response) {
    console.log("falha");
    console.log(response);
    alert(`"${nomeNovoUsuario}" não está disponível.\nInsira outro nome de usuário.`);
    window.location.reload();
}

let delayEstouOnline = 5000;
let delayBuscarParticipantes = 10000;
let delayBuscarMensagens = 3000;

function mantemConexao() {
    let interval = setInterval(estouOnline, delayEstouOnline);
    let interval3 = setInterval(buscarParticipantes, delayBuscarParticipantes);
    let interval2 = setInterval(buscarMensagens, delayBuscarMensagens);
    
}

function estouOnline() {
    const promise = axios.post('https://mock-api.driven.com.br/api/v6/uol/status', objetoUsuario);
    promise.then(function(){console.log('continuo online')});
    promise.catch(function(){console.log('agora estou offline')});
}

function buscarMensagens() {
    const promise = axios.get('https://mock-api.driven.com.br/api/v6/uol/messages');
    promise.then(retornaRespostaAPI);
}

let respostaAPI;

function retornaRespostaAPI(response) {
    console.log("resposta API abaixo (response)")
    console.log(response);
    respostaAPI = [...response.data];
    jogarMensagensNoHTML(respostaAPI);
}

function erroRespostaAPI(response) {
    console.log(response);
    return response;
}

let mensagens = document.querySelector('main');

function jogarMensagensNoHTML(response) {
    
    mensagens.innerHTML = "";
    response.forEach(mensagem => {
        if (mensagem.type === "status") {
            mensagens.innerHTML += `
        <div data-test="message" class="mensagem entrada-saida status">
            <p><span class="horario">(${mensagem.time})</span><span class="usuario">${mensagem.from}</span><span class="conteudo-mensagem">${mensagem.text}</span></p>
        </div>
        `;
        } else if (mensagem.type === "private_message" && (mensagem.to === nomeUsuario || mensagem.from === nomeUsuario)) {
            mensagens.innerHTML += `
        <div data-test="message" class="mensagem reservadamente">
            <p><span class="horario">(${mensagem.time})</span><span class="usuario">${mensagem.from}</span><span class="tipo-mensagem"></span> reservadamente para </span><span class="usuario">${mensagem.to}</span><span class="dois-pontos">:</span><span class="conteudo-mensagem">${mensagem.text}</span></p>
        </div>
        `;
        } else if (mensagem.type === "message") { //mensagem.type === "message"
            mensagens.innerHTML += `
        <div data-test="message" class="mensagem"> 
            <p><span class="horario">(${mensagem.time})</span><span class="usuario">${mensagem.from}</span><span class="tipo-mensagem"> para </span><span class="usuario">${mensagem.to}</span>:<span class="conteudo-mensagem">${mensagem.text}</span></p>
        </div>
        `;
        }
    });
    
    document.querySelector('main > div:last-child').scrollIntoView();
}

const inputMensagem = document.querySelector("textarea.input-message");

inputMensagem.addEventListener('keydown', function (event) {
    if ( event.keyCode === 13 && document.querySelector(".input-message").value != "" ) {
        enviarMensagem();
    }
});

inputMensagem.addEventListener('keyup', function (event) {
    if ( event.keyCode === 13) {
        document.querySelector('.input-message').value = "";
    }
});

function enviarMensagem() {
    //Se input menxagem não está vazio
    if (document.querySelector('.input-message').value != "") {

        const novaMensagem = {
            from: nomeUsuario,
            to: nomeDestinatario,
            text: document.querySelector('.input-message').value,
            type: tipoDeMensagem() // ou "private_message" para o bônus
        };
        const promessa = axios.post('https://mock-api.driven.com.br/api/v6/uol/messages', novaMensagem);
        promessa.then(function () {
            buscarMensagens();
            buscarParticipantes();
            console.log("mensagem enviada")});
        promessa.catch(function () {console.log("mensagem não enviada")});
    }
}

function tipoDeMensagem() {
    if (document.querySelector(".privacy.public.selected") !== null) {
        return "message";
    } else if (document.querySelector(".privacy.reserved.selected") !== null) {
        return "private_message";
    }
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
    if (document.querySelector(".all.selected > p") !== null || !(participantes.includes(nomeDestinatario)) ) {
        nomeSelecionado = "Todos";
        //Se o parágrafo do Input for Reservadamente
        if (document.querySelector(".input-message-privacidade.selected").innerHTML === "reservadamente") {

            //Modificar o paragrafo do Input
            document.querySelectorAll(".input-message-privacidade").forEach(elem=>elem.classList.toggle("selected"));
        }
    } else if (document.querySelector(".participant.selected > p") !== null) {
        nomeSelecionado = document.querySelector(".participant.selected > p").innerHTML; //Copiar valor, não referencia
    } else {
        nomeSelecionado = "Todos";
        //Se o parágrafo do Input for Reservadamente
        if (document.querySelector(".input-message-privacidade.selected").innerHTML === "reservadamente") {

            //Modificar o paragrafo do Input
            document.querySelectorAll(".input-message-privacidade").forEach(elem=>elem.classList.toggle("selected"));
        }
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
    nomeDestinatario = nomeSelecionado;
    avaliaPrivacidade();
}

function selecionaDestinatario(destinatarioClicado) {

    //Se o destinatário antigo = "Todos" e o destinatário selecionado != "Todos"
    if (nomeDestinatario === "Todos" && destinatarioClicado.querySelector("p").innerHTML !== "Todos") {

        //Habilita o botão Reservadamente
        document.querySelector(".privacy.reserved").classList.remove("gray-disabled");

        //Remove classe .selected do botão antigo "Todos"
        document.querySelector(".all.selected").classList.remove("selected");

        //Adiciona classe .selected no novo botão
        destinatarioClicado.classList.add("selected");

        //variável nome do destinatário com valor do novo botão
        nomeDestinatario = destinatarioClicado.querySelector("p").innerHTML;

        //muda o footer pro nome do novo destinatário
        document.querySelector("span.input-message-destinatario").innerHTML = nomeDestinatario;

    //Se o destinatário antigo for o mesmo que o selecionado, sendo ele DIFERENTE de "Todos", o programa vai retirar a seleção atual e voltar o valor inicial "Todos"
    } else if (destinatarioClicado.classList.contains("selected") && destinatarioClicado.querySelector("p").innerHTML !== "Todos") {

        //Desabilitar o botão Reservadamente
        document.querySelector(".privacy.reserved").classList.add("gray-disabled");

        //Se o botão Reservadamente está selecionado
        if ( document.querySelector(".privacy.reserved.selected") !== null ) {

            //Desselecionar o botão Reservadamente
            document.querySelector(".privacy.reserved").classList.toggle("selected");

            //Selecionar o botão Público
            document.querySelector(".privacy.public").classList.toggle("selected");
        }
        
        //Adiciona classe .selected no botão "Todos"
        document.querySelector(".all").classList.add("selected");

        //remove classe .selected do botão antigo
        destinatarioClicado.classList.remove("selected");

        //variável nome do destinatário com valor padrão "Todos"
        nomeDestinatario = "Todos";        

        //muda o footer pro nome do novo destinatário
        document.querySelector("span.input-message-destinatario").innerHTML = "Todos";

    //Se o destinatário antigo e o novo forem != "Todos"
    } else if (nomeDestinatario !== "Todos" && destinatarioClicado.querySelector("p").innerHTML !== "Todos") {

        //Remover classe .selected do destinatário antigo
        document.querySelector(".participant.selected").classList.remove("selected");

        //Adicionar classe .selected ao destinatário novo
        destinatarioClicado.classList.add("selected");

        //variável nome do destinatário com valor do novo botão
        nomeDestinatario = "" + destinatarioClicado.querySelector("p").innerHTML;

        //muda o footer pro nome do novo destinatário
        document.querySelector("span.input-message-destinatario").innerHTML = nomeDestinatario;
    
    //Se  o destinatário antigo for != "Todos" e o novo for == "Todos"
    } else if (nomeDestinatario !== "Todos" && destinatarioClicado.querySelector("p").innerHTML === "Todos") {
        
        //Desabilitar o botão Reservadamente
        document.querySelector(".privacy.reserved").classList.add("gray-disabled");

        //Se o parágrafo do Input for Reservadamente
        if (document.querySelector(".input-message-privacidade.selected").innerHTML === "reservadamente") {

            //Modificar o paragrafo do Input
            document.querySelectorAll(".input-message-privacidade").forEach(elem=>elem.classList.toggle("selected"));
        }
        
        //Se o botão Reservadamente está selecionado
        if ( document.querySelector(".privacy.reserved.selected") !== null ) {

            //Desselecionar o botão Reservadamente
            document.querySelector(".privacy.reserved").classList.toggle("selected");

            //Selecionar o botão Público
            document.querySelector(".privacy.public").classList.toggle("selected");
        }

        //Remover classe .selected do destinatário antigo
        document.querySelector(".participant.selected").classList.remove("selected");

        //Adiciona classe .selected no botão "Todos"
        document.querySelector(".all").classList.add("selected");

        //variável nome do destinatário com valor padrão "Todos"
        nomeDestinatario = "Todos";  

        //muda o footer pro nome do novo destinatário
        document.querySelector("span.input-message-destinatario").innerHTML = "Todos";
    }

}

function avaliaPrivacidade() {

    //se TODOS
    if (nomeDestinatario === "Todos") {
        //se não PUBLICO
        if (document.querySelector(".privacy.public.selected") === null) {
            //ADICIONAR PUBLICO
            document.querySelector(".privacy.public").classList.add("selected");
        }

        //se RESERVADAMENTE
        if (document.querySelector(".privacy.reserved.selected") !== null) {
            //REMOVER RESERVADAMENTE
            document.querySelector(".privacy.reserved").classList.remove("selected");
        }

        //ADICIONAR DISABLED RESERVADAMENTE
        document.querySelector(".privacy.reserved").classList.add("gray-disabled");
    //se não TODOS
    } else {
        //REMOVER DISABLED RESERVADAMENTE
        if (document.querySelector(".privacy.reserved.gray-disabled") !== null) {
            document.querySelector(".privacy.reserved").classList.remove("gray-disabled");
        }
        
    }

}
    
function selecionaPrivacidade() {

    if (nomeDestinatario !== "Todos") {

        document.querySelector(".privacy.reserved").classList.toggle("selected");
        document.querySelector(".privacy.public").classList.toggle("selected");
        document.querySelectorAll(".input-message-privacidade").forEach(elem=>elem.classList.toggle("selected"));

        //REMOVER DISABLED RESERVADAMENTE
        if (document.querySelector(".privacy.reserved.gray-disabled") !== null) {
            document.querySelector(".privacy.reserved").classList.remove("gray-disabled");
        }
    }
}   