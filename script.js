let pedido = [];


// Função para adicionar produto

function adicionarProduto(nome, preco) {

    pedido.push({
        nome: nome,
        preco: preco
    });

    atualizarPedido();
}


// Atualiza o carrinho na tela

function atualizarPedido() {

    const listaPedido = document.getElementById("lista-pedido");

    const totalElemento = document.getElementById("total");


    // Limpa a lista atual

    listaPedido.innerHTML = "";


    // Se não tiver produtos

    if (pedido.length === 0) {

        listaPedido.innerHTML =
            "<p>Nenhum produto adicionado.</p>";

        totalElemento.textContent = "0.00";

        return;
    }


    // Total da compra

    let total = 0;


    // Percorre os produtos

    pedido.forEach(function (produto, indice) {

        const item = document.createElement("p");

        item.textContent =
            `${produto.nome} - R$ ${produto.preco.toFixed(2)}`;


        // Cria botão de excluir

        const botaoExcluir = document.createElement("button");

        botaoExcluir.textContent = "❌";


        // Quando clicar no botão

        botaoExcluir.onclick = function () {

            pedido.splice(indice, 1);

            atualizarPedido();
        };


        // Coloca o botão junto do produto

        item.appendChild(botaoExcluir);

        listaPedido.appendChild(item);


        // Soma o preço

        total += produto.preco;
    });


    // Mostra o total

    totalElemento.textContent = total.toFixed(2);
}


function validarEndereco() {

    const formulario = document.getElementById("endereco-entrega");
    const erro = document.getElementById("erro-pedido");
    const camposObrigatorios = formulario.querySelectorAll("input[required]:not([type='radio'])");
    let enderecoValido = true;

    camposObrigatorios.forEach(function (campo) {

        const preenchido = campo.value.trim() !== "";
        const cepValido = campo.name !== "cep" || /^[0-9]{5}-?[0-9]{3}$/.test(campo.value.trim());
        const cpfValido = campo.name !== "cpf" || validarCPF(campo.value);
        const campoValido = preenchido && cepValido && cpfValido;

        campo.classList.toggle("invalido", !campoValido);

        if (!campoValido) {
            enderecoValido = false;
        }
    });

    if (!enderecoValido) {
        erro.textContent = "Preencha o endereço, os dados do cliente e informe um CPF válido.";
        erro.classList.add("visivel");
        return null;
    }

    const pagamento = formulario.querySelector("input[name='pagamento']:checked");
    const tipoMaquina = formulario.querySelector("input[name='tipo-maquina']:checked");

    if (!pagamento || (pagamento.value === "Na máquina" && !tipoMaquina)) {
        erro.textContent = pagamento && pagamento.value === "Na máquina"
            ? "Escolha débito, crédito ou Pix."
            : "Escolha uma forma de pagamento.";
        erro.classList.add("visivel");
        return null;
    }

    erro.textContent = "";
    erro.classList.remove("visivel");

    const dados = new FormData(formulario);

    return {
        rua: dados.get("rua").trim(),
        numero: dados.get("numero").trim(),
        bairro: dados.get("bairro").trim(),
        cidade: dados.get("cidade").trim(),
        cep: dados.get("cep").trim(),
        complemento: dados.get("complemento").trim(),
        nome: dados.get("nome").trim(),
        cpf: dados.get("cpf").trim(),
        pagamento: pagamento.value,
        tipoMaquina: tipoMaquina ? tipoMaquina.value : ""
    };
}

function validarCPF(cpf) {

    const numeros = cpf.replace(/\D/g, "");

    if (numeros.length !== 11 || /^([0-9])\1{10}$/.test(numeros)) {
        return false;
    }

    let soma = 0;

    for (let indice = 0; indice < 9; indice++) {
        soma += Number(numeros[indice]) * (10 - indice);
    }

    let primeiroDigito = (soma * 10) % 11;
    primeiroDigito = primeiroDigito === 10 ? 0 : primeiroDigito;

    if (primeiroDigito !== Number(numeros[9])) {
        return false;
    }

    soma = 0;

    for (let indice = 0; indice < 10; indice++) {
        soma += Number(numeros[indice]) * (11 - indice);
    }

    let segundoDigito = (soma * 10) % 11;
    segundoDigito = segundoDigito === 10 ? 0 : segundoDigito;

    return segundoDigito === Number(numeros[10]);
}

function configurarPagamento() {

    const opcoesPagamento = document.querySelectorAll("input[name='pagamento']");
    const opcoesMaquina = document.getElementById("opcoes-maquina");
    const tiposMaquina = document.querySelectorAll("input[name='tipo-maquina']");

    opcoesPagamento.forEach(function (opcao) {
        opcao.addEventListener("change", function () {
            const maquinaSelecionada = opcao.value === "Na máquina" && opcao.checked;
            opcoesMaquina.classList.toggle("visivel", maquinaSelecionada);
            tiposMaquina.forEach(function (tipo) {
                tipo.required = maquinaSelecionada;
                if (!maquinaSelecionada) {
                    tipo.checked = false;
                }
            });
        });
    });
}

configurarPagamento();


// Envia pedido para WhatsApp

function enviarWhatsApp() {

    if (pedido.length === 0) {

        alert("Adicione algum produto ao pedido.");

        return;
    }

    const endereco = validarEndereco();

    if (endereco === null) {
        return;
    }


    let mensagem =
        "Olá! Gostaria de fazer um pedido:%0A%0A";


    pedido.forEach(function (produto) {

        mensagem +=
            `1x ${produto.nome} - R$ ${produto.preco.toFixed(2)}%0A`;
    });


    let total = pedido.reduce(function (soma, produto) {

        return soma + produto.preco;

    }, 0);


    mensagem +=
        `%0ATotal: R$ ${total.toFixed(2)}%0A%0A` +
        `Endereço de entrega:%0A` +
        `${endereco.rua}, ${endereco.numero}%0A` +
        `${endereco.bairro} - ${endereco.cidade}%0A` +
        `CEP: ${endereco.cep}%0A%0A` +
        `Cliente: ${endereco.nome}%0A` +
        `CPF: ${endereco.cpf}%0A` +
        `Pagamento: ${endereco.pagamento}`;

    if (endereco.complemento) {
        mensagem += `%0AComplemento: ${endereco.complemento}`;
    }

    if (endereco.tipoMaquina) {
        mensagem += `%0ATipo: ${endereco.tipoMaquina}`;
    }


    // Número do WhatsApp da empresa

    const telefone = "5551992125860";


    // Abre o WhatsApp

    window.open(
        `https://wa.me/${telefone}?text=${mensagem}`,
        "_blank"
    );
}