let pedido = [];
const TAXA_ENTREGA = 5;


// Função para adicionar produto

function adicionarProduto(nome, preco) {

    alterarQuantidade(nome, preco, 1);
}

function alterarQuantidade(nome, preco, variacao) {

    const produto = pedido.find(function (item) {
        return item.nome === nome;
    });

    if (produto) {
        produto.quantidade += variacao;
    } else if (variacao > 0) {
        pedido.push({
            nome: nome,
            preco: preco,
            quantidade: variacao
        });
    }

    if (produto && produto.quantidade <= 0) {
        pedido.splice(pedido.indexOf(produto), 1);
    }

    atualizarPedido();
}


// Atualiza o carrinho na tela

function atualizarPedido() {

    const listaPedido = document.getElementById("lista-pedido");

    const totalElemento = document.getElementById("total");


    // Limpa a lista atual

    listaPedido.innerHTML = "";

    document.querySelectorAll(".controle-quantidade span").forEach(function (contador) {
        contador.textContent = "0";
    });


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

        const contador = document.querySelector(
            `.controle-quantidade[data-produto="${produto.nome}"] span`
        );

        contador.textContent = produto.quantidade;

        item.textContent =
            `${produto.quantidade}x ${produto.nome} - R$ ${(produto.preco * produto.quantidade).toFixed(2)}`;


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

        total += produto.preco * produto.quantidade;
    });


    // Mostra o total

    totalElemento.textContent = total.toFixed(2);
}


function validarEndereco() {

    const formulario = document.getElementById("endereco-entrega");
    const erro = document.getElementById("erro-pedido");
    const tipoPedido = document.querySelector("input[name='tipo-pedido']:checked");

    if (!tipoPedido) {
        erro.textContent = "Escolha entre retirada ou entrega.";
        erro.classList.add("visivel");
        return null;
    }

    const camposObrigatorios = [
        ...formulario.querySelectorAll(".dados-cliente input[required]")
    ];

    if (tipoPedido.value === "Entrega") {
        camposObrigatorios.push(
            ...formulario.querySelectorAll("#campos-entrega input[required]")
        );
    }
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
        erro.textContent = tipoPedido.value === "Entrega"
            ? "Preencha o endereço, os dados do cliente e informe um CPF válido."
            : "Preencha os dados do cliente e informe um CPF válido.";
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
        tipoPedido: tipoPedido.value,
        rua: (dados.get("rua") || "").trim(),
        numero: (dados.get("numero") || "").trim(),
        bairro: (dados.get("bairro") || "").trim(),
        cidade: (dados.get("cidade") || "").trim(),
        cep: (dados.get("cep") || "").trim(),
        complemento: (dados.get("complemento") || "").trim(),
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

function configurarTipoPedido() {

    const opcoesTipoPedido = document.querySelectorAll("input[name='tipo-pedido']");
    const camposEntrega = document.getElementById("campos-entrega");
    const taxaEntrega = document.getElementById("taxa-entrega");

    opcoesTipoPedido.forEach(function (opcao) {
        opcao.addEventListener("change", function () {
            const entregaSelecionada = opcao.value === "Entrega" && opcao.checked;
            camposEntrega.classList.toggle("oculto", !entregaSelecionada);
            taxaEntrega.classList.toggle("visivel", entregaSelecionada);
        });
    });
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

function configurarMascaraCPF() {

    const campoCPF = document.querySelector("input[name='cpf']");

    campoCPF.addEventListener("input", function () {
        const numeros = campoCPF.value.replace(/\D/g, "").slice(0, 11);

        campoCPF.value = numeros
            .replace(/(\d{3})(\d)/, "$1.$2")
            .replace(/(\d{3})(\d)/, "$1.$2")
            .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    });
}

configurarPagamento();
configurarTipoPedido();
configurarMascaraCPF();


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
            `${produto.quantidade}x ${produto.nome} - R$ ${(produto.preco * produto.quantidade).toFixed(2)}%0A`;
    });


    let total = pedido.reduce(function (soma, produto) {

        return soma + produto.preco * produto.quantidade;

    }, 0);

    if (endereco.tipoPedido === "Entrega") {
        total += TAXA_ENTREGA;
    }


    mensagem +=
        `%0ATotal: R$ ${total.toFixed(2)}%0A%0A` +
        `${endereco.tipoPedido}:`;

    if (endereco.tipoPedido === "Entrega") {
        mensagem +=
            `%0A${endereco.rua}, ${endereco.numero}%0A` +
            `${endereco.bairro} - ${endereco.cidade}%0A` +
            `CEP: ${endereco.cep}`;

        if (endereco.complemento) {
            mensagem += `%0AComplemento: ${endereco.complemento}`;
        }

        mensagem += `%0ATaxa de entrega: R$ ${TAXA_ENTREGA.toFixed(2)}`;
    }

    mensagem +=
        `%0A%0A` +
        `Cliente: ${endereco.nome}%0A` +
        `CPF: ${endereco.cpf}%0A` +
        `Pagamento: ${endereco.pagamento}`;

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