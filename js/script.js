//************Layout*************

/*const textarea = document.querySelector("textarea");
textarea.addEventListener("keyup", e => {
    textarea.style.height = "auto";
    let scHeight = e.target.scrollHeight;
    console.log(scHeight);
    textarea.style.height = `${scHeight}px`;
});
*/
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

const inputEntrar = document.querySelector("input.input-login");

inputEntrar.addEventListener('keydown', function (event) {
    if ( event.keyCode === 13 && document.querySelector(".input-login").value != "" ) {
        logarUsuario();
    }
});


function logarUsuario() {

    //SE input-login é não-vazio
    if (document.querySelector(".input-login").value != "") {
        const novoUsuario = {
            name: `${document.querySelector('.input-login').value}`
        };
        console.log(novoUsuario)
        const promessa = axios.post('https://mock-api.driven.com.br/api/v6/uol/participants', novoUsuario);
        promessa.then(loginSucesso);
        promessa.catch(loginFalha);
    //SE input-login é vazio
    } else {
        alert("Digite o nome de usuário");
    }
        
}

function loginSucesso(response) {
    console.log(response);
    console.log("login feito com sucesso");
    nomeUsuario = document.querySelector('.input-login').value;
    objetoUsuario = {
        name: `${nomeUsuario}`
    };
    //trocar o conjunto input+button pelo gif de loading
    document.querySelector("div.overlay-entrada > div:last-child").innerHTML = `
    <img class="spinner" src="./img/spinner.gif">
    `;

    setTimeout(function() {
        const overlayEntrada = document.querySelector('.overlay-entrada');
        overlayEntrada.classList.add("login-ok");
    }, Math.max(delayEstouOnline, delayBuscarParticipantes, delayBuscarMensagens));
 
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

let delayEstouOnline = 5000;
let delayBuscarParticipantes = 10000;
let delayBuscarMensagens = 3000;

function mantemConexao() {
    let interval = setInterval(estouOnline, delayEstouOnline);
    let interval3 = setInterval(buscarParticipantes, delayBuscarParticipantes);
    let interval2 = setInterval(buscarMensagens, delayBuscarMensagens);
    
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

const inputMensagem = document.querySelector("textarea.input-message");

inputMensagem.addEventListener('keydown', function (event) {
    if ( event.keyCode === 13 && document.querySelector(".input-message").value != "" ) {
        enviarMensagem();
    }
});

inputMensagem.addEventListener('keyup', function (event) {
    if ( event.keyCode === 13 && document.querySelector(".input-message").value != "" ) {
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
        promessa.then(function () {console.log("mensagem enviada")});
        promessa.catch(function () {console.log("mensagem não enviada")});

    }

}

function tipoDeMensagem() {
    if (document.querySelector(".privacy.public.selected") !== null) {
        return "message";
    } else {
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

        

    //Se o destinatário antigo e o novo forem != "Todos"
    } else if (nomeDestinatario !== "Todos" && destinatarioClicado.querySelector("p").innerHTML !== "Todos") {

        //Remover classe .selected do destinatário antigo
        document.querySelector(".participant.selected").classList.remove("selected");

        //Adicionar classe .selected ao destinatário novo
        destinatarioClicado.classList.add("selected");

        //variável nome do destinatário com valor do novo botão
        nomeDestinatario = "" + destinatarioClicado.querySelector("p").innerHTML;
    
    //Se  o destinatário antigo for != "Todos" e o novo for == "Todos"
    } else if (nomeDestinatario !== "Todos" && destinatarioClicado.querySelector("p").innerHTML === "Todos") {
        
        //Desabilitar o botão Reservadamente
        document.querySelector(".privacy.reserved").classList.add("gray-disabled");

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
    }

}


/* JUNKYARD

    if ( document.querySelector(".participant.selected") === null ) {
        if (document.querySelector(".all.selected") !== null) {
            document.querySelector(".all.selected").classList.remove("selected");
        }
        destinatarioClicado.classList.add("selected");

        if (document.querySelector(".participant.selected > p") !== null) {
            nomeDestinatario = document.querySelector(".participant.selected > p").innerHTML;
        } else {
            nomeDestinatario = "Todos";
        }
        
    } else if ( destinatarioClicado.classList.contains("selected") ) {
        destinatarioClicado.classList.remove("selected");
        document.querySelector(".all").classList.add("selected");
        nomeDestinatario = "Todos";
        //ADICIONAR DISABLED RESERVADAMENTE
        document.querySelector(".privacy.reserved").classList.add("gray-disabled");


    } else if ( document.querySelector(".participant.selected") !== null) {
        document.querySelector(".participant.selected").classList.remove("selected");
        destinatarioClicado.classList.add("selected");

        if (document.querySelector(".participant.selected > p") !== null) {
            nomeDestinatario = document.querySelector(".participant.selected > p").innerHTML;
        }

        if (document.querySelector(".all.selected > p") !== null) {
            nomeDestinatario = "Todos";
            //ADICIONAR DISABLED RESERVADAMENTE
            document.querySelector(".privacy.reserved").classList.add("gray-disabled");
        }
    }

    
}*/

function avaliaPrivacidade() {
    //se TODOS
        //se não PUBLICO
            //adicionar PUBLICO
        //se RESERVADAMENTE
            //remover RESERVADAMENTE
    //se não TODOS
        //



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
    /*
    // se não TODOS
    } else {
        //se não PUBLICO
        if (document.querySelector(".privacy.public.selected") === null) {
            //se PUBLICO
            if (document.querySelector(".privacy.public.selected") !== null) {
                //REMOVER PUBLICO
                document.querySelector(".privacy.public").classList.remove("selected");
                // se RESERVADAMETE
                if (document.querySelector(".privacy.reserved.selected") !== null) {
                    document.querySelector(".privacy.reserved").classList.remove("gray-disabled");
                }
            }
            if (document.querySelector(".privacy.reserved.selected") === null) {
                document.querySelector(".privacy.reserved").classList.add("selected");
            }
        } else {
            if (document.querySelector(".privacy.public.selected") !== null) {
                document.querySelector(".privacy.public").classList.remove("selected");

                if (document.querySelector(".privacy.reserved") !== null) {
                    document.querySelector(".privacy.reserved").classList.remove("gray-disabled");
                }
            }
            if (document.querySelector(".privacy.reserved.selected") === null) {
                document.querySelector(".privacy.reserved").classList.add("selected");
            }
        }
    }*/
}
    
function selecionaPrivacidade() {
    if (nomeDestinatario !== "Todos") {
        document.querySelector(".privacy.reserved").classList.toggle("selected");
        document.querySelector(".privacy.public").classList.toggle("selected")
        //REMOVER DISABLED RESERVADAMENTE
        if (document.querySelector(".privacy.reserved.gray-disabled") !== null) {
            document.querySelector(".privacy.reserved").classList.remove("gray-disabled");
        }
    }
}   