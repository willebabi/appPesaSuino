var vtb = [
            {"tab":"supesocapa","desc": "E. Pesagens","tipo": "E","paramurl":"class=wsn200ln&method=setPesagens"},
            {"tab":"pfidpalm","desc": "B. Dados usuários","tipo": "B","paramurl":"class=wsn200ln&method=getPfidpalm", clear: false},
            {"tab":"clifor","desc": "B. Dados Produtores","tipo": "B","paramurl":"class=wsn200ln&method=getPessoas", clear: true},
            {"tab":"tprodsui","desc": "B. Tipos de Criação","tipo": "B","paramurl":"class=wsn200ln&method=getTprodsui", clear: true},
            {"tab":"tprodcli","desc": "B. Produtores e criação","tipo": "B","paramurl":"class=wsn200ln&method=getTprodcli", clear: true}
          ];

var vpedidoselecao = null;
let vstatus = {0: '<i class="fa fa-edit me-2" style="color: green;"></i>Aberta', 
               1: '<i class="fa fa-check-square me-2" style="color: orange;"></i>Encerrada',
               2: '<i class="fa fa-sync me-2" style="color: blue;"></i>Sincronizada',
               3: '<i class="fa fa-trash me-2" style="color: red;"></i>Cancelada'};

function sair () {
    navigator.app.exitApp();
}

function getValue(vnm) {
    if ($(`#${vnm}`).length > 0) {
        if ($(`#${vnm}`).val() !== undefined) {
            return $(`#${vnm}`).val();
        } else 
            return '';
    } else {
        return '';
    }
}

var vretorna_tela = '';

function msgsnack(tipo, msg) {
    var vcor = 'SteelBlue';
    var vico = '';
    if (tipo == 'S') {
        vcor = 'DarkGreen';
        vico = '<i class="fas fa-check-circle" style="color: LawnGreen;"></i> ';
    } else if (tipo == 'E') {
        vcor = 'DarkRed';
        vico = '<i class="fas fa-exclamation-triangle" style="color: Yellow;"></i> ';
    } else if (tipo == 'A') {
        vcor = 'DarkOrange';
        vico = '<i class="fas fa-exclamation-circle" style="color: Bisque;"></i> ';
    }
    Snackbar.show({
        text: vico + msg,
        pos: 'top-right',
        backgroundColor: vcor,
        textColor: '#FFFFFF',
        actionText: "Ok"
    });
}

async function dialogo(vtitle, vicon, voptions){
    
    await Swal.fire({
        title: vtitle,
        icon: vicon,
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        cancelButtonText: "Não",
        confirmButtonText: "Sim"
      }).then(async (result) => {

        if (result.isConfirmed && voptions) {
            await voptions.exec();
            await Swal.fire(voptions);
        }
    });    
}

function dialogoPadrao(vmsg, vicon){
    Swal.fire({
        title: vmsg,
        icon: vicon,
        draggable: true
    });
}

var spinner = async function (vtipo) {
    if (vtipo == 1)
        $('#spinner').addClass('show');
    else
        $('#spinner').removeClass('show');
};

var vdataAtual = () => {
    const dataAtual = new Date();

    const dia = String(dataAtual.getDate()).padStart(2, '0');
    const mes = String(dataAtual.getMonth() + 1).padStart(2, '0'); // Mês é 0-indexado
    const ano = dataAtual.getFullYear();

    const dataFormatada = `${ano}-${mes}-${dia}`;
    console.log("Formato dd/mm/yyyy:", dataFormatada); // Ex: "03/07/2025"
    return dataFormatada;
};

var vlimpaDados = async () => {
    let voptions = {
        title: "Limpeza dos dados!",
        text: "Os dados foram limpos com sucesso.",
        icon: "success",
        showConfirmButton: false,
        timer: 1500,
        exec: async function () {
            spinner(1);
            for (var vo in vtb) {
                if (vtb[vo].clear) {
                    eval(`db._allTables['${vtb[vo].tab}'].clear();`);
                }
            }
            db.delete();
            localStorage.clear();
            document.location.href = '../index.html';
            spinner(0);

            $("#m1").click();
        }
    }

    dialogo('Confirma a limpeza dos dados?', 'warning', voptions);

    return false;
}

var vpesquisa = (vtipo) => {
    $("#vpalavrachave").on("keyup", function() {
        var value = $(this).val().toLowerCase();
        //console.log(this); 
        $("#accordionFlushExample div.accordion-item").filter(function() {       
            $(this).toggle( $(this).text().toLowerCase().indexOf(value) > -1 );
            $("#accordionFlushExample div.accordion-item table tbody tr").filter(function() {
                $(this).toggle( $(this).text().toLowerCase().indexOf(value) > -1 );
            });
        });
    });
};

var vconteudo = $("#conteudo_page");

/*---- inicio Page Home Dashboard ----*/
var home = async () => {
    spinner(1);
    vpesquisa(1);

    let vcont = `
    <!-- Recent Sales Start -->
    <div class="row pt-2 px-2">
        <div class="bg-light rounded h-100 p-2">
            <h6 class="mb-4">Tipos de Produção</h6>
            <div class="accordion accordion-flush" id="accordionFlushExample">`;

    let vtipo = await db._allTables['tprodsui'].orderBy('tps_codigo').toArray();

    for (let vi in vtipo) { 
        let vclidors = await db._allTables['clifor'].where({tps_codigo: vtipo[vi].tps_codigo}).toArray();

        let vnump = vclidors.length;

        if (vnump == 0)
            continue;

        vcont += `<div class="accordion-item p-2">
                    <h2 class="accordion-header" id="flush-headingOne${vtipo[vi].tps_codigo}">
                        <div class="accordion-button collapsed p-2" type="button"
                            data-bs-toggle="collapse" data-bs-target="#flush-collapseOne${vtipo[vi].tps_codigo}"
                            aria-expanded="true" aria-controls="flush-collapseOne${vtipo[vi].tps_codigo}">
                            ${vtipo[vi].tps_descr}
                            <input type="hidden" id="tps_codigo${vtipo[vi].tps_codigo}" value="${vnump}">
                        </div>
                    </h2>
                    <div id="flush-collapseOne${vtipo[vi].tps_codigo}" class="accordion-collapse collapse"
                        aria-labelledby="flush-headingOne" data-bs-parent="#accordionFlushExample">
                        <div class="accordion-body p-2">
                            <table class="table text-start align-middle table-bordered table-hover mb-0 p-0">
                                <thead>
                                    <tr class="text-dark">
                                        <th scope="col">Produtor</th>
                                        <th scope="col"></th>
                                    </tr>
                                </thead>
                                <tbody>`;
        for (let vcli in vclidors) {
                let vstr = stringify(vclidors[vcli]);

                vcont += `<tr>
                            <td>${vclidors[vcli].cli_codigo} - ${vclidors[vcli].cli_fantasi}</td> 
                            <td>
                                <div style="display: flex; flex-direction: column;">
                                    <button type="button" class="btn btn-outline-primary m-2" onclick='iniciaPesagem(${vstr})'>
                                        <i class="fa fa-paper-plane me-2"></i>
                                        Pesar
                                    </button>
                                <div>
                            <td>
                        </tr>`;
        }

        vcont += `          </tbody>
                          </table>
                        </div>
                    </div>
                </div>`;
    }
    vcont += `
            </div>
        </div>
    </div>
    <!-- Recent Sales End -->
    `;
    
    $("#conteudo_page").html(vcont);

    spinner(0);

    return false;
};
/*---- final Page Home Dashboard ----*/

function calcularPesoMedio() {
    var peso = parseFloat($("#peso").val());
    if (isNaN(peso)) {
        peso = 0;
    }
    var tara = parseFloat($("#tara").val());
    if (isNaN(tara)) {
        tara = 0;
    }
    var quantidade = parseFloat($("#quantidade").val());
    if (isNaN(quantidade)) {
        quantidade = 1;
    }
    if (!isNaN(peso) && !isNaN(tara) && !isNaN(quantidade) && quantidade > 0) {
        var pesoMedio = (peso - tara) / quantidade;
        $("#peso_medio").val(pesoMedio.toFixed(2));
    } else {
        $("#peso_medio").val("");
    }
}

async function encerrarPesagem (vobj, vstatus) {
    if (!vobj && getValue('sup_id') != '') {
        vobj = {id: parseInt(getValue('sup_id'))};
    }

    let voptions = {
        title: (vstatus == 1 ? "Encerrar":"Cancelar") + " Pesagem!",
        text: `Pesagem ${(vstatus == 1 ? "encerrada":"cancelada")} com sucesso.`,
        icon: "success",
        showConfirmButton: false,
        timer: 1500,
        exec: async function () {
            let vdados = {acl_nrlote: vstatus};

            await db._allTables['supesocapa'].bulkUpdate([
                {key: vobj.id, changes: vdados}
            ]).then(() => {
                console.log(`supesocapa update`);
            }).catch(error => {
                console.log(`Erro supesocapa update ` + error.name);
            });

            await listaPesagens();
        }
    }

    await dialogo(`Confirma o ${(vstatus == 1 ? "Encerramento":"Cancelamento")} da pesagem?`, 'warning', voptions);
}

async function listaPesagens() {
    spinner(1);
    $("#form_pesquisa").addClass("d-none");

    let vcapa = await db._allTables['supesocapa']
                        .reverse()
                        .sortBy('sup_id');

    let vlinhas = "";
    for (let vi in vcapa) {
        let vitems = await db._allTables['supesoitem']
                            .where('sup_id')
                            .equals(vcapa[vi].sup_id)
                            .reverse()
                            .sortBy('sui_id');
        vcapa[vi].items = vitems;
        vcapa[vi].vclio = await db._allTables['clifor'].where('cli_codigo').equals(parseInt(vcapa[vi].cli_codigo_ori)).first();
        vcapa[vi].vclid = await db._allTables['clifor'].where('cli_codigo').equals(parseInt(vcapa[vi].cli_codigo_des)).first();

        if (!vcapa[vi].vclio || !vcapa[vi].vclid) continue;

        let vusu = await getBuscaDados('pfidpalm',{idpalm: parseInt(vcapa[vi].idpalm)});

        vcapa[vi].qtdes = 0;
        vcapa[vi].pesos = 0;
        for (let vite in vitems) {
            vcapa[vi].qtdes += vitems[vite].sui_qtde;
            vcapa[vi].pesos += vitems[vite].sui_pesototal;
        }
        console.log(vcapa[vi]);
        vlinhas += `<div class="card text-center">
                        <div class="card-header">
                            <h5 class="card-title"> Origem: ${vcapa[vi].vclio.cli_fantasi} </h5>
                        </div>
                        <div class="card-body" style="text-align: left;">
                            <h6 class="card-title">Destino: ${vcapa[vi].vclid.cli_fantasi}</h6>
                            <p class="card-text">Data: ${dateFormat(vcapa[vi].sup_data + 'T00:00:00')} - Status: ${vstatus[vcapa[vi].acl_nrlote]}</p>
                            <p class="card-text">Usuário: ${(vusu ? vusu[0].usu_usuario : '')}</p>
                            <p class="card-text">Quantidade: ${vcapa[vi].qtdes}</p>
                            <p class="card-text">Peso: ${vcapa[vi].pesos.toFixed(2)}</p>
                            <p class="card-text">Ps.Médio: ${(vcapa[vi].pesos / vcapa[vi].qtdes).toFixed(2)}</p>
                        </div>
                        <div class="card-footer text-body-secondary">
                            <div style="display: ${(vcapa[vi].acl_nrlote == 0 ? 'flex': 'none')}; flex-direction: column;">
                                <button type="button" class="btn btn-outline-primary m-2" onclick='iniciaPesagem(${stringify(vcapa[vi].vclio)}, ${stringify(vcapa[vi])})'>
                                    <i class="fa fa-balance-scale me-2"></i>
                                    Pesar
                                </button>

                                <button type="button" class="btn btn-outline-primary m-2" onclick='encerrarPesagem(${stringify(vcapa[vi])},1)'>
                                    <i class="fa fa-check-square-o me-2"></i>
                                    Encerrrar
                                </button>

                                <button type="button" class="btn btn-outline-primary m-2" onclick='encerrarPesagem(${stringify(vcapa[vi])},3)'>
                                    <i class="fa fa-trash me-2"></i>
                                    Cancelar
                                </button>
                            </div>

                            <div style="display: ${(vcapa[vi].acl_nrlote == 0 ? 'none;': 'flex')}; flex-direction: column;">
                                <button type="button" class="btn btn-outline-primary m-2" onclick='iniciaPesagem(${stringify(vcapa[vi].vclio)}, ${stringify(vcapa[vi])})'>
                                    <i class="fa fa-eye me-2"></i>
                                    Visualizar
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="bg-light rounded h-100 p-3"></div>`;
    }

    var vcont = `
    
    <div class="col-12">
        <div class="bg-light rounded h-100 p-1">
            <h6 class="mb-4">Lista de Pesagens</h6>
            <div class="table-responsive">
                ${vlinhas}
            </div>
        </div>
    </div>
    `;
    
    $("#conteudo_page").html(vcont);

    spinner(0);

    return false;
}

async function removeItem (id) {
    let voptions = {
        title: "Excluir Item Pesagem!",
        text: `Item da Pesagem excluida com sucesso.`,
        icon: "success",
        showConfirmButton: false,
        timer: 1500,
        exec: async function () {
            let vdados = {acl_nrlote: vstatus};

            await db._allTables['supesoitem'].delete(id).then(() => {
                console.log(`supesocapa deletado`);
            }).catch(error => {
                console.log(`Erro supesocapa delete ` + error.name);
            });

            await listaItemPesagem();
        }
    }

    await dialogo(`Confirma a exclusão desse item da pesagem?`, 'warning', voptions);
} 

/*---- Form de pesagem incial ----*/
async function listaItemPesagem() {
    let vid = parseInt($('#sup_id').val());

    let vcapa = await db._allTables['supesocapa']
                        .where('id')
                        .equals(vid)
                        .reverse()
                        .sortBy('sup_id');

    if (!vcapa || vcapa.length == 0)
        vcapa = null;

    let vitems = await db._allTables['supesoitem']
                            .where('sup_id')
                            .equals(vcapa[0].sup_id)
                            .reverse()
                            .sortBy('sui_id');
                            
    let valor = [0, 0, 0]; // [qtde, peso, tara]
    $('#lista_pesagem').html('');
    let vcont = `<div class="table-responsive" style="font-size: 1.1em;">
                <table class="table">
                    <thead>
                        <tr>
                            <th scope="col">Seq</th>
                            <th scope="col">Qtde</th>
                            <th scope="col">Peso</th>
                            <th scope="col">Tara</th>
                            <th scope="col">Peso Médio</th>
                            <th style="display: ${vcapa && vcapa[0].acl_nrlote == 0 ? 'flex':'none'};">&nbsp</th>
                        </tr>
                    </thead>
                    <tbody id="tabitepeso">`;
    for (let vite in vitems) {
        vcont += `<tr>
                    <td>${vitems[vite].sui_id}</td>
                    <td>${vitems[vite].sui_qtde}</td>
                    <td>${vitems[vite].sui_pesototal.toFixed(2)}</td>
                    <td>${vcapa ? vcapa[0].sup_tara : ''}</td>
                    <td>${((vitems[vite].sui_pesototal - (vcapa ? vcapa[0].sup_tara : 0)) / vitems[vite].sui_qtde).toFixed(2)}</td>
                    <td style="display: ${vcapa && vcapa[0].acl_nrlote == 0 ? 'flex':'none'};">
                        <button type="button" id="btncancel" class="btn btn-outline-primary" onclick='removeItem(${vitems[vite].id})'>
                            <i class="fa fa-trash" style="color: red;"></i>
                        </button>
                    </td>
                </tr>`;
        valor[0] += parseInt(vitems[vite].sui_qtde);
        valor[1] += parseFloat(vitems[vite].sui_pesototal);
        valor[2] += parseInt(vcapa[0].sup_tara);
    }

    if (isNaN(valor[2])) {
        valor[2] = '';
    }

    if (valor[0] > 0)
        vcont += `<tr style="background-color: darkseagreen; color: white;">
                    <td></td>
                    <td>${valor[0]}</td>
                    <td>${valor[1].toFixed(2)}</td>
                    <td>${valor[2]}</td>
                    <td>${((valor[1] - valor[2]) / valor[0]).toFixed(2)}</td>
                    <td style="display: ${vcapa && vcapa[0].acl_nrlote == 0 ? 'flex':'none'};"></td>
                </tr>`;

    vcont += `</tbody></table></div>`;

    $('#lista_pesagem').html(vcont);
}

async function salvarPesagem() {
    spinner(1);

    if (getValue('data_pesagem') == '') {        
        msgsnack('E', 'Data da pesagem deve ser informada!');
        spinner(0);
        return false;
    }

    if (getValue('cli_codigo_ori') == '') {        
        msgsnack('E', 'Cliente origem não encontrado !');
        spinner(0);
        return false;
    }

    if (getValue('id_cliente') == '') {        
        msgsnack('E', 'Selecione o cliente de destino!');
        spinner(0);
        return false;
    }

    if (getValue('cli_codigo_ori') == '') {        
        msgsnack('E', 'Cliente origem não encontrado !');
        spinner(0);
        return false;
    }

    if (getValue('peso') == '') {
        msgsnack('E', 'Peso deve ser informado!');
        spinner(0);
        return false;
    }

    if (getValue('quantidade') == '') {
        msgsnack('E', 'Quantidade deve ser informado!');
        spinner(0);
        return false;
    }

    let vcria = true;
    
    let maxItem = 1;
    let vcapa = await db._allTables['supesocapa']
                            .orderBy('sup_id')
                            .reverse()
                            .first();
    let maxCapa = 1;

    if (vcapa) {
        maxCapa = parseInt(vcapa.sup_id) + 1;
    }

    if (parseInt($('#sup_id').val()) > 0) {
        maxCapa = parseInt($('#sup_id').val());
        vcapa = await db._allTables['supesocapa'].get(maxCapa);
        vcria = false;
        maxCapa = vcapa.sup_id;
    }

    /*=== Cria a capa da pesagem e atualiza ===*/
    var vdados = {
        acl_nrlote: 0,  
        cli_codigo_des: parseInt($('#id_cliente').val()),
        cli_codigo_ori: parseInt($('#cli_codigo_ori').val()),
        sup_data: $('#data_pesagem').val(),
        sup_id: maxCapa,
        sup_tara: $('#tara').val(),
        sup_usado: false,
        idpalm: parseInt(localStorage.getItem('APPidpalm'))
    };

    if (!vcria) {
        await db._allTables['supesocapa'].bulkUpdate([
            {key: vcapa.id, changes: vdados}
        ]).then(() => {
            console.log(`supesocapa update`);
        }).catch(error => {
            console.log(`Erro supesocapa update ` + error.name);
        });

        $('#sup_id').val(vcapa.id);
    } else {
        let vretorno = await db._allTables['supesocapa'].bulkAdd([vdados], { allKeys: true });

        console.log(vretorno);
        if (vretorno.length > 0) {
            $('#sup_id').val(vretorno[0]);
            $('.combo_cliente_dest').prop('disabled', true);
            $('#data_pesagem').prop('disabled', true);
            $('#quantidade').prop('disabled', false);
            $('#peso').prop('disabled', false);
            $('#tara').prop('disabled', true);
            $('#peso_medio').prop('disabled', true);
            $('#btnencerra').show();
            $('#btncancel').show();
        }
    }

    /*=== Cria o item da pesagem e atualiza ===*/
    vcria = true;
    let vitem = await db._allTables['supesoitem']
                        .where('sup_id')
                        .equals(maxCapa)
                        .reverse()
                        .sortBy('sui_id');
                            
    if (vitem && vitem.length > 0) {
        maxItem = parseInt(vitem[0].sui_id) + 1;
    }

    var vdados = {
        sui_id: maxItem,
        sui_pesototal: parseFloat($('#peso').val()),
        sui_qtde: parseInt($('#quantidade').val()),
        sup_id: maxCapa
    };

    if (!vcria) {
        await db._allTables['supesoitem'].bulkUpdate([
            {key: vitem.id, changes: vdados}
        ]).then(() => {
            console.log(`supesocapa update`);
        }).catch(error => {
            console.log(`Erro supesocapa update ` + error.name);
        });
    } else {
        let vretorno = await db._allTables['supesoitem'].bulkAdd([vdados], { allKeys: true });
    }

    listaItemPesagem();

    msgsnack('S', 'Pesagem salva com sucesso!');

    spinner(0);
}

async function iniciaPesagem (vprodutor, vpesagem = null) {
    spinner(1);
    $("#form_pesquisa").addClass("d-none");

    $(document).ready(async function() {
        var vdados_tprodcli = await db._allTables['tprodcli'].where({'tps_codigo_ori': vprodutor.tps_codigo}).toArray();

        vdados_tprodcli.forEach(async function (vtprodcli) {
            var vdados_clifor   = await db._allTables['clifor'].where({'tps_codigo': vtprodcli.tps_codigo_des}).toArray();

            console.log(vdados_clifor);

            vdados_clifor.forEach(function(clifor) {
                var element = document.createElement("option")
                element.value = clifor.cli_codigo;
                element.innerText = clifor.cli_codigo + " - " + clifor.cli_razsoc;
                if (vpesagem && parseInt(vpesagem.cli_codigo_des) == clifor.cli_codigo) {
                    element.setAttribute("selected", "selected");
                }
                
                $('#id_cliente').append(element);
            });
        });

        $('.combo_cliente_dest').select2();

        if (vpesagem !== null) {
            console.log("Pesagem Selecionada", vpesagem);
            $('#sup_id').val(vpesagem.id);
            $('#cli_codigo_ori').val(vprodutor.cli_codigo);
            $('#data_pesagem').val(vpesagem.sup_data);
            $('#data_pesagem').prop('disabled', true);
            $('.combo_cliente_dest').val(parseInt(vpesagem.cli_codigo_des)).trigger('change');
            $('.combo_cliente_dest').prop('disabled', true);
            $('#tara').val(vpesagem.sup_tara);
            $('#tara').prop('disabled', true);
            $('#peso_medio').prop('disabled', true);
            $('#quantidade').prop('disabled', false);
            $('#peso').prop('disabled', false);

            if (vpesagem.acl_nrlote == 0) {
                $('#btnencerra').show();
            }
            if (vpesagem.acl_nrlote <= 1) {
                $('#btncancel').show();
            }

            listaItemPesagem();
        }

        const camposNumericos = document.querySelectorAll('.no-decimals');

        camposNumericos.forEach(function(campo) {
            campo.addEventListener('keydown', function(event) {
                const keyCode = event.key;
                console.log(keyCode);
                // Impede a vírgula (,) e o ponto (.)
                if (keyCode === ',' || keyCode === '.') {
                    event.preventDefault();
                }
            });
            campo.addEventListener('input', function() {
                this.value = this.value.replace(/[,.]/g, '');
            });
        });
        
    });
    
   let vform = `
    <div class= "container d-flex align-items-center justify-content-center">
        <div class="col-sm ">
            <div class="row row-cols-2">
                <div class="row row-cols-1 col-2" style="display: ${(vretorna_tela != '' ? 'flex' : 'display')}; align-self: anchor-center;" onclick="${vretorna_tela}">
                    <i class="fa fa-chevron-left me-2"></i>
                </div>

                <div class="row row-cols-1 col-10">
                    <h5> Iniciar a Pesagem na origem: </h5>
                    <h6> ${vprodutor.cli_fantasi} ${(vpesagem ? `(Status: ${vstatus[vpesagem.acl_nrlote]})` : ``)}</h6>
                    <input type="hidden" id="cli_codigo_ori" value="${vprodutor.cli_codigo}">
                </div>
            </div>
            <div class="bg-light rounded h-2 p-2 mt-2">
                <div class="centralize-pad">
                    <input type="hidden" id="sup_id" value="${(vpesagem ? vpesagem.id : '')}">
                    <div class="row row-cols-1">
                        <div class="col form-floating mb-2">
                            <input type="date" class="form-control" id="data_pesagem" value="${vdataAtual()}">
                            <label for="data_pesagem">Data da Pesagem:</label>
                        </div>
                    </div>

                    <div class="row row-cols-1">
                        <div class="col form-floating mb-2">
                            <select class="combo_cliente_dest form-select" name="cliente" id="id_cliente">
                                <option selected></option>
                            </select>
                            <label for="id_cliente">Destino:</label>
                        </div>
                    </div>
                    <div class="row row-cols-2">
                        <div class="col form-floating mb-2">
                            <input type="number" step="1" min="0" class="form-control no-decimals" onkeyup="calcularPesoMedio()" id="quantidade">
                            <label for="quantidade">Quantidade:</label>
                        </div>
                        <div class="col form-floating mb-2">
                            <input type="number" step="1" min="0" class="form-control no-decimals" onkeyup="calcularPesoMedio()" id="peso">
                            <label for="peso">Peso Balança:</label>
                        </div>
                    </div>
                    <div class="row row-cols-2">
                        <div class="col form-floating mb-2">
                            <input type="number" step="1" min="0" class="form-control no-decimals" onkeyup="calcularPesoMedio()" id="tara">
                            <label for="tara">Peso Tara:</label>
                        </div>
                        <div class="col form-floating mb-2">
                            <input type="number" step="any" min="0" readonly class="form-control no-decimals" id="peso_medio">
                            <label for="peso_medio">Peso Médio:</label>
                        </div>
                    </div>
                    ${(vpesagem && vpesagem.acl_nrlote !== 0 ? `` : `
                                <button type="button" id="btnsalva" class="btn btn-outline-primary" onclick="salvarPesagem()">
                                    <i class="fa fa-edit me-2"></i>
                                    Salvar
                                </button>
                                <button type="button" id="btnencerra" style="display: none;" class="btn btn-outline-primary" onclick='encerrarPesagem(${stringify(vpesagem)},1)'>
                                    <i class="fa fa-check-square me-2"></i>
                                    Encerrar
                                </button>
                                `)}
                    <button type="button" id="btncancel" style="display: none;" class="btn btn-outline-primary" onclick='encerrarPesagem(${stringify(vpesagem)},3)'>
                        <i class="fa fa-trash me-2" style="color: red;"></i>
                        Cancelar
                    </button>
                </div>
                <div class="mb-5"></div>
                <div class="centralize-pad" id="lista_pesagem">
                </div>
            </div>
        </div> 
    </div>`;
    
    $("#conteudo_page").html(vform);

    spinner(0);
}

/*---- inicio Page Sincronização ----*/
var vclicksinc = async () => {
    let voptions = {
        title: "Sincronização!",
        text: "Sincronização encerrada com sucesso.",
        icon: "success",
        showConfirmButton: false,
        timer: 1500,
        exec: async function () {
            spinner(1);

            //limpa registros ===
            for (var vo in vtb) {
                $("#msg" + vtb[vo].tab).html("")            
                $("#nrg" + vtb[vo].tab).html("");
            }

            var vupbase = async (vtt, vdados) => {
                var vp = null;

                //console.log(vtt, vp, vdados);

                try {
                    switch (vtt) {
                        case 'pfidpalm':
                            vp = await getReg(vtt, {idpalm: vdados.idpalm});
                            break;
                        case 'tprodcli':
                            vp = await getReg(vtt, {tps_codigo_des: vdados.tps_codigo_des
                                                ,tps_codigo_ori: vdados.tps_codigo_ori});
                            break;
                        case 'tprodsui':
                            vp = await getReg(vtt, {tps_ani: vdados.tps_ani
                                                ,tps_codigo: vdados.tps_codigo
                                                ,tps_tpgranja: vdados.tps_tpgranja});
                            break;
                        case 'clifor':
                            vp = await getReg(vtt, {cli_codigo: vdados.cli_codigo});
                            break;

                        case 'supesocapa':
                            vp = await getReg(vtt, {id: vdados.id});
                            break;
                        case 'supesoitem':
                            vp = await getReg(vtt, {id: vdados.id});
                            break;
                    }

                    if (vp != null) {
                        await db._allTables[vtt].bulkUpdate([
                            {key: vp.id, changes: vdados}
                        ]).then(() => {
                            console.log(`${vtt} update`);
                        }).catch(error => {
                            console.log(`Erro ${vtt} update ` + error.name);
                        });
                    } else {
                        await db._allTables[vtt].bulkAdd([vdados]).then(() => {
                            console.log(`${vtt} add`);
                        }).catch(error => {
                            console.log(`Erro ${vtt} add ` + error.name);
                            console.error(error);
                        });
                    }
                } catch (e) {
                    console.error(e);
                    console.log(vtt, vdados);
                }
            };

            var vsinc = async (vo) => {
                if (vtb[vo].tipo == 'E') {

                    let vcapa = await db._allTables['supesocapa']
                                                .where('acl_nrlote')
                                                .equals(1)
                                                .reverse()
                                                .sortBy('sup_id');
                    let vitem = [];

                    for (let vcap in vcapa) {
                        let vite = await db._allTables['supesoitem']
                                    .where('sup_id')
                                    .equals(vcapa[vcap].sup_id)
                                    .reverse()
                                    .sortBy('sui_id');
                        vitem.push(...vite);
                    }

                    if (vcapa.length > 0) {
                        vtb[vo].paramurl += "&supesocapa=" + btoa(JSON.stringify(vcapa))
                                          + "&supesoitem=" + btoa(JSON.stringify(vitem));

                        await getDados({type: "POST"
                            ,params: vtb[vo].paramurl + "&vcomp=false&vidpalm=" + localStorage.getItem('APPidpalm')
                            ,dataType: "html"
                            ,exec: async (vretorno) => {
                                var vdados = vretorno.resultado.params;

                                try {
                                    for (var vi in vdados) {                                        
                                        for (var vtab in vdados[vi]) {
                                            console.log(vtab, vdados[vi][vtab]);
                                            for (var vdd in vdados[vi][vtab]) {

                                                if (vtab == 'supesocapa') {
                                                    vdados[vi][vtab][vdd].acl_nrlote = 2;
                                                }

                                                await vupbase(vtab, vdados[vi][vtab][vdd]);
                                            }
                                        }
                                    }
                                } catch (e) {
                                    console.error(e);
                                    console.log(vdados);
                                }

                                try {
                                    if(vretorno.status == 1) {
                                        console.log("Sincronização " + vtb[vo].tab + " realizada com sucesso!");
                                        console.log(vretorno, vtb, vo);
                                        $("#msg" + vtb[vo].tab).html("Sucesso!")
                                        $("#nrg" + vtb[vo].tab).html("");
                                    } else {
                                        $("#msg" + vtb[vo].tab).html("Erro ao enviar os dados!")
                                        $("#msg" + vtb[vo].tab).attr("title", JSON.stringify(vretorno));
                                    }
                                } catch (e) {
                                    $("#msg" + vtb[vo].tab).html("Erro ao enviar os dados!")
                                    $("#msg" + vtb[vo].tab).attr("title", JSON.stringify(e));
                                }
                                
                                if (vo + 1 < vtb.length) {
                                    await vsinc(vo + 1);
                                } else {
                                    spinner(0);
                                }
                            }
                        });
                    } else {
                        $("#msg" + vtb[vo].tab).html("Sem dados para enviar!")
                        $("#msg" + vtb[vo].tab).attr("title", "Sem dados para enviar!");
                        await vsinc(vo + 1);
                    }
                } else {
                    await getDados({type: "POST"
                        ,params: vtb[vo].paramurl + "&vcomp=false&vidpalm=" + localStorage.getItem('APPidpalm')
                        ,dataType: "html"
                        ,exec: async (vretorno) => {
                            try {
                                var vdados = vretorno.resultado;

                            
                                for (var vtable in vdados) {
                                    for (var vdd in vdados[vtable]) {
                                        await vupbase(vtable, vdados[vtable][vdd]);
                                    }
                                }

                                if(vretorno.status == 1) {
                                    console.log("Sincronização " + vtb[vo].tab + " realizada com sucesso!");
                                    console.log(vretorno, vtb, vo);
                                    $("#msg" + vtb[vo].tab).html("Sucesso!")
                                    //$("#msg" + vtb[vo].tab).attr("title", JSON.stringify(vretorno));
                                    $("#nrg" + vtb[vo].tab).html(vretorno.resultado[vtb[vo].tab].length);
                                } else {
                                    $("#msg" + vtb[vo].tab).html("Erro ao receber os dados!")
                                    $("#msg" + vtb[vo].tab).attr("title", JSON.stringify(vretorno));
                                }
                            } catch (e) {
                                console.error(e);
                                console.log(vdados);
                                $("#msg" + vtb[vo].tab).html("Erro ao receber os dados!")
                                $("#msg" + vtb[vo].tab).attr("title", JSON.stringify(vretorno));
                            }
                            
                            if (vo + 1 < vtb.length) {
                                await vsinc(vo + 1);
                            } else {
                                spinner(0);
                            }
                        }
                    });
                }
            }

            await vsinc(0);
        }
    }

    await dialogo('Iniciar sincronização?', 'warning', voptions);
};

var sincroniza = () => {
    spinner(1);

    $("#form_pesquisa").addClass("d-none");

    var vlinhas = "";
    var vi = 1;
    for (var vo in vtb) {
        vlinhas += `<tr>
                        <th scope="row">${vi}</th>
                        <td>${vtb[vo].tab}</td>
                        <td>${vtb[vo].desc}</td>
                        <td id="msg${vtb[vo].tab}" title="${vtb[vo].paramurl}"></td>
                        <td id="nrg${vtb[vo].tab}"></td>
                    </tr>`;
        vi++;
    }

    var vcont = `
    <div class="col-12">
        <div class="bg-light rounded h-100 p-4">
            <h6 class="mb-4">Sincronizar os dados</h6>
            <div class="table-responsive">
                <table class="table">
                    <thead>
                        <tr>
                            <th scope="col">#</th>
                            <th scope="col">Tabela</th>
                            <th scope="col">Descrição</th>
                            <th scope="col">Mensagem</th>
                            <th scope="col">Números</th>
                        </tr>
                    </thead>
                    <tbody id="tabsinc">
                        ${vlinhas}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td scope="row" colspan="5">
                                <button type="button" class="btn btn-outline-primary m-2" onclick="vclicksinc()"><i class="fa fa-sync me-2"></i>Sinconizar</button>
                            </td>
                        </tr>
                    </tfoot>                    
                </table>
            </div>
        </div>
    </div>
    `;
    
    $("#conteudo_page").html(vcont);

    spinner(0);

    return false;
};
/*---- final Page Sincronização ----*/

var limpamenu = () => {
    $(".active").each((i, e) => {
        $(e).removeClass("active");
    });
};

var vrotas = (vopcao, vo, vtp = null) => {
    /*=== Controla active do menu ===*/
    limpamenu();
    $('#'+vo).parent().addClass("active");

    if (vtp == null) {
        document.querySelector('.sidebar-toggler').click();

        if (vo == 'm1') {
            $("#form_pesquisa").removeClass("d-none");
        } else {
            $("#form_pesquisa").addClass("d-none");
        }
    }

    vretorna_tela = `vrotas('${vopcao}','${vo}','return')`;

    $(vconteudo).html(eval(vopcao));
}

var iniHome = async () => {
    var vnump    = await getCount('clifor');
    var vnums    = await getCount('supesocapa', {acl_nrlote: 1});

    console.log('iniHome',vnump);

    if (vnums > 0) {
        msgsnack('A', 'Atenção: Existe pesagens pendentes de sincronização.');
    }

    if (vnump > 0) {
        $("#m1").click();
    } else {
        //sincroniza();
        $("#m3").click();
    }
};