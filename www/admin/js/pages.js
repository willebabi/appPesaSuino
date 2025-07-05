var vtb = [{"tab":"pfidpalm","desc": "Buscar Dados usuários","paramurl":"class=wsn200ln&method=getPfidpalm", clear: true},
    {"tab":"clifor","desc": "Buscar Dados Produtores","paramurl":"class=wsn200ln&method=getPessoas", clear: true},
    {"tab":"tprodsui","desc": "Buscar Dados tipos de Criação","paramurl":"class=wsn200ln&method=getTprodsui", clear: true},
    {"tab":"tprodcli","desc": "Buscar Dados itens Produtores e criação","paramurl":"class=wsn200ln&method=getTprodcli", clear: true}]; /*,
    {"tab":"supesocapa","desc": "Buscar Dados produtor e clientes","paramurl":"class=wsn200ln&method=getPessoas", clear: true},
    {"tab":"supesoitem","desc": "Buscar Itens dos pedidos","paramurl":"class=wsn200ln&method=getPedidos&tipo=item", clear: true}];
*/
    //pfidpalm,tp_clifor,tprodsui,tprodcli,supesocapa,supesoitem

var vpedidoselecao = null;

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

var vlimpaDados = () => {
    if (confirm('Confirma a limpeza dos dados?')) {
        spinner(1);
        for (var vo in vtb) {
            if (vtb[vo].clear) {
                eval(`db._allTables['${vtb[vo].tab}'].clear();`);
            }
        }
        spinner(0);

        $("#m1").click();
    }

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

async function encerrarPesagem (vobj) {
    let vdados = {acl_nrlote: 'E'};

    await db._allTables['supesocapa'].bulkUpdate([
        {key: vobj.id, changes: vdados}
    ]).then(() => {
        console.log(`supesocapa update`);
    }).catch(error => {
        console.log(`Erro supesocapa update ` + error.name);
    });

    listaPesagens();
}

async function listaPesagens() {
    spinner(1);
    let vstatus = {'': 'Aberta', 'E': 'Encerrada', 'S': 'Sincronizada', 'C': 'Cancelada'}; 
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

        vcapa[vi].qtdes = 0;
        vcapa[vi].pesos = 0;
        for (let vite in vitems) {
            vcapa[vi].qtdes += vitems[vite].sui_qtde;
            vcapa[vi].pesos += vitems[vite].sui_pesototal;
        }
        console.log(vcapa[vi]);
        vlinhas += `<div class="card text-center" style="width: 22rem;">
                        <div class="card-header">
                            <h5 class="card-title"> Origem: ${vcapa[vi].vclio.cli_fantasi} </h5>
                        </div>
                        <div class="card-body">
                            <h6 class="card-title">Destino: ${vcapa[vi].vclid.cli_fantasi}</h6>
                            <p class="card-text">Data: ${vcapa[vi].sup_data} - Status: ${vstatus[vcapa[vi].acl_nrlote]}</p>
                            <p class="card-text">Quantidade: ${vcapa[vi].qtdes} - Peso: ${vcapa[vi].pesos}</p>
                        </div>
                        <div class="card-footer text-body-secondary" style="${(vcapa[vi].acl_nrlote == '' ? '': 'display:none;')}">
                            <div style="display: flex; flex-direction: column;">
                                <button type="button" class="btn btn-outline-primary m-2" onclick='iniciaPesagem(${stringify(vcapa[vi].vclio)}, ${stringify(vcapa[vi])})'>
                                    <i class="fa fa-balance-scale me-2"></i>
                                    Pesar
                                </button>

                                <button type="button" class="btn btn-outline-primary m-2" onclick='encerrarPesagem(${stringify(vcapa[vi])})'>
                                    <i class="fa fa-check-square-o me-2"></i>
                                    Encerrrar
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

/*---- Form de pesagem incial ----*/
async function listaItemPesagem() {
    let vsup_id = parseInt($('#sup_id').val());

    let vcapa = await db._allTables['supesocapa']
                        .where('sup_id')
                        .equals(vsup_id)
                        .reverse()
                        .sortBy('sup_id');

    let vitems = await db._allTables['supesoitem']
                            .where('sup_id')
                            .equals(vsup_id)
                            .reverse()
                            .sortBy('sui_id');
                            
    let valor = [0, 0, 0]; // [qtde, peso, tara]
    $('#lista_pesagem').html('');
    let vcont = `<div class="table-responsive">
                <table class="table">
                    <thead>
                        <tr>
                            <th scope="col">Seq</th>
                            <th scope="col">Qtde</th>
                            <th scope="col">Peso</th>
                            <th scope="col">Tara</th>
                            <th scope="col">Peso Mádio</th>
                        </tr>
                    </thead>
                    <tbody id="tabitepeso">`;
    for (let vite in vitems) {
        vcont += `<tr>
                    <td>${vitems[vite].sui_id}</td>
                    <td>${vitems[vite].sui_qtde}</td>
                    <td>${(vitems[vite].sui_pesototal / vitems[vite].sui_qtde).toFixed(2)}</td>
                    <td>${vcapa[0].sup_tara}</td>
                    <td>${vitems[vite].sui_pesototal.toFixed(2)}</td>
                </tr>`;
        valor[0] += parseInt(vitems[vite].sui_qtde);
        valor[1] += parseFloat(vitems[vite].sui_pesototal);
        valor[2] += parseInt(vcapa[0].sup_tara);
    }

    if (isNaN(valor[2])) {
        valor[2] = '';
    }

    if (valor[0] > 0)
        vcont += `<tr>
                    <td></td>
                    <td>${valor[0]}</td>
                    <td>${(valor[1] / valor[0]).toFixed(2)}</td>
                    <td>${valor[2]}</td>
                    <td>${valor[1].toFixed(2)}</td>
                </tr>`;

    vcont += `</tbody></table></div>`;

    $('#lista_pesagem').html(vcont);
}

async function salvarPesagem() {
    spinner(1);

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
    }

    /*=== Cria a capa da pesagem e atualiza ===*/
    var vdados = {
        acl_nrlote: '',  
        cli_codigo_des: parseInt($('#id_cliente').val()),
        cli_codigo_ori: parseInt($('#cli_codigo_ori').val()),
        sup_data: $('#data_pesagem').val(),
        sup_id: maxCapa,
        sup_tara: $('#tara').val(),
        sup_usado: ''
    };

    if (!vcria) {
        await db._allTables['supesocapa'].bulkUpdate([
            {key: vcapa.id, changes: vdados}
        ]).then(() => {
            console.log(`supesocapa update`);
        }).catch(error => {
            console.log(`Erro supesocapa update ` + error.name);
        });
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

    spinner(0);
}

async function iniciaPesagem (vprodutor, vpesagem = null) {
    spinner(1);
    //vpesquisa(1);

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

            listaItemPesagem();
        }
        
    });
    
   let vform = `
    <div class= "container d-flex align-items-center justify-content-center">
        <div class="col-sm ">
            <div class="row row-cols-1">
                <div class="row row-cols-1">
                    <h5> Iniciar a Pesagem na origem: </h5>
                    <h6> ${vprodutor.cli_fantasi} </h6>
                    <input type="hidden" id="cli_codigo_ori" value="${vprodutor.cli_codigo}">
                </div>
            </div>
            <div class="bg-light rounded h-2 p-2 mt-2">
                <div class="centralize-pad">
                    <input type="hidden" id="sup_id" value="${(vpesagem.id ? vpesagem.id : '')}">
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
                            <input type="number" step="any" class="form-control" onkeyup="calcularPesoMedio()" id="quantidade">
                            <label for="quantidade">Quantidade:</label>
                        </div>
                        <div class="col form-floating mb-2">
                            <input type="number" step="any" class="form-control" onkeyup="calcularPesoMedio()" id="peso">
                            <label for="peso">Peso Balança:</label>
                        </div>
                    </div>
                    <div class="row row-cols-2">
                        <div class="col form-floating mb-2">
                            <input type="number" step="any" class="form-control" onkeyup="calcularPesoMedio()" id="tara">
                            <label for="tara">Peso Tara:</label>
                        </div>
                        <div class="col form-floating mb-2">
                            <input type="number" step="any" readonly class="form-control" id="peso_medio">
                            <label for="peso_medio">Peso Médio:</label>
                        </div>
                    </div>
                    
                    <button type="button" class="btn btn-outline-primary" onclick="salvarPesagem()">Salvar</button>
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
    if (confirm("Confirma iniciar sincronização?")) {
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
            await getDados({type: "POST"
                ,params: vtb[vo].paramurl + "&vcomp=true&vidpalm=" + localStorage.getItem('APPidpalm')
                ,dataType: "html"
                ,exec: async (vretorno) => {
                    var vdados = vretorno.resultado;

                    try {
                        for (var vtable in vdados) {
                            for (var vdd in vdados[vtable]) {                            
                                await vupbase(vtable, vdados[vtable][vdd]);
                            }
                        }
                    } catch (e) {
                        console.error(e);
                        console.log(vdados);
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
                    
                    if (vo + 1 < vtb.length) {
                        await vsinc(vo + 1);
                    } else {
                        spinner(0);
                    }
                }
            });
        }

        await vsinc(0);
    }
};

var sincroniza = () => {
    spinner(1);

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

var vrotas = (vopcao, vo) => {
    /*=== Controla active do menu ===*/
    limpamenu();
    $('#'+vo).parent().addClass("active");
    document.querySelector('.sidebar-toggler').click();

    if (vo == 'm1') {
        $("#form_pesquisa").removeClass("d-none");
    } else {
        $("#form_pesquisa").addClass("d-none");
    }

    $(vconteudo).html(eval(vopcao));
}

var iniHome = async () => {
    var vnump    = await getCount('clifor');
    console.log('iniHome',vnump);
    if (vnump > 0) {
        $("#m1").click();
    } else {
        //sincroniza();
        $("#m3").click();
    }
};