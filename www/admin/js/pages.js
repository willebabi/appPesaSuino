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

var vlimpaDados = () => {
    if (confirm('Confirma a limpeza dos dados?')) {
        spinner(1);
        for (var vo in vtb) {
            if (vtb[vo].clear) {
                eval(`db._allTables['${vtb[vo].tab}'].clear();`);
            }
        }
        spinner(0);

        $("#m2").click();
    }

    return false;
}

var vpesquisa = (vtipo) => {
    $("#vpalavrachave").on("keyup", function() {
        var value = $(this).val().toLowerCase();
        //console.log(this); 
        $("#accordionFlushExample div.accordion-item ").filter(function() {                        
            $(this).toggle( $(this).text().toLowerCase().indexOf(value) > -1 );
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
                    <h2 class="accordion-header" id="flush-headingOne">
                        <div class="accordion-button collapsed p-2" type="button"
                            data-bs-toggle="collapse" data-bs-target="#flush-collapseOne${vtipo[vi].tps_codigo}"
                            aria-expanded="true" aria-controls="flush-collapseOne${vtipo[vi].tps_codigo}">
                            ${vtipo[vi].tps_descr}
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

        vcont += `</tbody>
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

/*---- Form de pesagem incial ----*/
async function iniciaPesagem (vprodutor){
    $(document).ready(async function() {
        var vdados_tprodcli = await db._allTables['tprodcli'].where({'tps_codigo_ori': vprodutor.tps_codigo}).toArray();

        vdados_tprodcli.forEach(async function (vtprodcli) {
            var vdados_clifor   = await db._allTables['clifor'].where({'tps_codigo': vtprodcli.tps_codigo_des}).toArray();

            console.log(vdados_clifor);

            vdados_clifor.forEach(function(clifor) {
                var element = document.createElement("option")
                element.innerText = clifor.cli_codigo + " - " + clifor.cli_razsoc
                $('#id_cliente').append(element);
            });
        });

        $('.combo_cliente_dest').select2();
        
    });
    
   let vform = `
    <div class= "container d-flex align-items-center justify-content-center">
        <div class="col-sm ">
            <div class="row row-cols-1">
                <div class="row row-cols-1">
                    <h5> Iniciar a Pesagem na origem: </h5>
                    <h6> ${vprodutor.cli_fantasi} </h6>
                </div>
            </div>
            <div class="bg-light rounded h-2 p-2 mt-2">
                <div class="centralize-pad">
                    <div class="row row-cols-1">
                        <div class="col form-floating mb-2">
                            <input type="date" class="form-control" id="data_pesagem">
                            <label for="data_pesagem">Data da Pesagem:</label>
                        </div>
                    </div>

                    <div class="row row-cols-1">
                        <div class="col form-floating mb-2">
                            <select class="combo_cliente_dest form-select" name="cliente" id="id_cliente">
                                <option selected></option>
                            </select>
                            <label for="id_granja">Destino:</label>
                        </div>
                    </div>
                    <div class="row row-cols-2">
                        <div class="col form-floating mb-2">
                            <input type="text" class="form-control" id="id_placa">
                            <label for="peso_min">Placa:</label>
                        </div>
                        <div class="col form-floating mb-2">
                            <input type="number" step="any" class="form-control" id="peso_venda">
                            <label for="peso_min">Peso Venda:</label>
                        </div>
                    </div>
                    <div class="row row-cols-1">
                        <div class="col form-floating mb-2">
                            <select class="combo_cliente_dest form-select" name="granja" id="id_granja" onchange="adicionarGalpaoELote()">
                                <option selected></option>
                            </select>
                            <label for="id_granja">Granja:</label>
                        </div>
                    </div>
                    <div class="row row-cols-2">
                        <div class="col form-floating mb-2">
                            <input type="text" class="form-control" id="id_galpao" disabled>
                            <label for="peso_min">Galpão:</label>
                        </div>
                        <div class="col form-floating mb-2">
                            <input type="text" class="form-control" id="id_lote" disabled>
                            <label for="peso_min">Lote:</label>
                        </div>
                    </div>
                    <div class="row row-cols-1">
                        <div class="col form-floating mb-2">
                            <select class="form-select" id="tipo_ave">
                                <option selected></option>
                                <option value="1">Frango</option>
                                <option value="2">Refugo</option>
                                <option value="3">Galeto</option>
                                <option value="4">Matriz</option>
                            </select>
                            <label for="tipo_ave">Tipo de Ave:</label>
                        </div>
                    </div>
                    <div class="row row-cols-2">
                        <div class="col form-floating mb-2">
                            <input type="number" value="6" class="form-control" id="id_qtaves">
                            <label for="peso_min">Qtaves P/C:</label>
                        </div>
                        <div class="col form-floating mb-2">
                            <input type="number" step="any" class="form-control" id="id_pesomed">
                            <label for="peso_min">Peso Médio</label>
                        </div>
                    </div>
                    <button type="button" class="btn btn-outline-primary" onclick="criarPesagemAvulsa()">Salvar</button>
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

/*---- Lista lotes em aberto ----*/
var lotes = async (vped) => {
    console.log(vped);

    vpedidoselecao = {ped: vped};

    spinner(1);

    $("#titlemodal").text("Pedido: " + vped.ped_codigo + 
                          " - Cliente: " + vped.cli_nome +
                          " - Selecione o lote para iniciar o atendimento");

    console.log($("#titlemodal").text());
    var varr = await db._allTables['prodaves'].orderBy('pra_data').toArray();

    var vcont = `
    <table class="table text-start align-middle table-bordered table-hover mb-0">
        <thead>
            <tr class="text-dark">
                <th scope="col">Produtor</th>
                <th scope="col">Galpão</th>
                <th scope="col">Lote</th>
                <th scope="col">Alojamento</th>
                <th scope="col">Aves Alojadas</th>
                <th scope="col">Idade</th>
                <th scope="col">Aves Caixa</th>
                <th scope="col">Peso Med.</th>
                <th scope="col"></th>
            </tr>
        </thead>
        <tbody>
    `;
    for (var vlt in varr) {
        var vcli = await getReg('clifor', {cli_codigo: varr[vlt].cli_codigo});

        varr[vlt].nome_produtor = varr[vlt].cli_codigo + " - " + vcli.cli_fantasi;

        var vstr = stringify(varr[vlt]);

        vcont += `<tr>
                    <td>${varr[vlt].nome_produtor}</td>
                    <td>${varr[vlt].gpp_codigo}</td>
                    <td>${varr[vlt].gpp_lote}</td>
                    <td>${dateFormat(varr[vlt].pra_data)}</td>
                    <td>${numberFormat(varr[vlt].pra_qtde,0)}</td>
                    <td>${numberFormat(getIdade(varr[vlt].pra_data),0)}</td>
                    <td><input type="number" id="avecaixa" value="6" style="width: 100px" /></td>
                    <td><input type="number" id="pesomed" value="" style="width: 100px" /></td>
                    <td><button type="button" class="btn btn-outline-primary m-2" onclick='vatendimento(${vstr})'><i class="fa fa-cub me-2"></i>Iniciar</button></td>
                </tr>`;
    }

    vcont += `</tbody>
            </table>`;

    $("#page_modal").html(vcont);

    $('#hourModal').modal('show');

    spinner(0);

    return false;
};

var limpamenu = () => {
    $(".active").each((i, e) => {
        $(e).removeClass("active");
    });
};

var vatendimento = async (vlote) => {
    console.log(vlote);

    vpedidoselecao.lote = vlote;

    spinner(1);

    $("#titlemodal").text("Atendimento do Pedido: " + vpedidoselecao.ped.ped_codigo + 
                          " - Cliente: " + vpedidoselecao.ped.cli_nome +
                          " - Produtor: " + vlote.nome_produtor +
                          " - Galp/Lote: " + vlote.gpp_codigo + "/" + vlote.gpp_lote);

    var vform = `
    <div class="col-sm-12 col-xl-6">
        <div class="bg-light rounded h-100 p-4">
            <h6 class="mb-4">Floating Label</h6>
            <div class="form-floating mb-3">
                <input type="email" class="form-control" id="floatingInput"
                    placeholder="name@example.com">
                <label for="floatingInput">Email address</label>
            </div>
            <div class="form-floating mb-3">
                <input type="password" class="form-control" id="floatingPassword"
                    placeholder="Password">
                <label for="floatingPassword">Password</label>
            </div>
            <div class="form-floating mb-3">
                <select class="form-select" id="floatingSelect"
                    aria-label="Floating label select example">
                    <option selected>Open this select menu</option>
                    <option value="1">One</option>
                    <option value="2">Two</option>
                    <option value="3">Three</option>
                </select>
                <label for="floatingSelect">Works with selects</label>
            </div>
            <div class="form-floating">
                <textarea class="form-control" placeholder="Leave a comment here"
                    id="floatingTextarea" style="height: 150px;"></textarea>
                <label for="floatingTextarea">Comments</label>
            </div>
        </div>
    </div>

    <div class="col-sm-12 col-xl-6">
        <div class="bg-light rounded h-100 p-4">
            <h6 class="mb-4">Resumo</h6>
        </div>
    </div>
    `;

    var varr = await db._allTables['hispsexp'].orderBy('pes_dtprod').reverse().toArray();

    var vcont = `
    <table class="table text-start align-middle table-bordered table-hover mb-0">
        <thead>
            <tr class="text-dark">
                <th scope="col">Produtor</th>
                <th scope="col">Galpão</th>
                <th scope="col">Lote</th>
                <th scope="col">Alojamento</th>
                <th scope="col">Aves Alojadas</th>
                <th scope="col">Idade</th>
                <th scope="col">Aves Caixa</th>
                <th scope="col">Peso Med.</th>
                <th scope="col"></th>
            </tr>
        </thead>
        <tbody>
    `;
    for (var vlt in varr) {
        var vcli = await getReg('clifor', {cli_codigo: varr[vlt].cli_codigo});

        vcont += `<tr>
                    <td>${varr[vlt].cli_codigo + " - " + vcli.cli_fantasi}</td>
                    <td>${varr[vlt].gpp_codigo}</td>
                    <td>${varr[vlt].gpp_lote}</td>
                    <td>${dateFormat(varr[vlt].pra_data)}</td>
                    <td>${numberFormat(varr[vlt].pra_qtde,0)}</td>
                    <td>${numberFormat(getIdade(varr[vlt].pra_data),0)}</td>
                    <td><input type="number" id="avecaixa" value="6" style="width: 100px" /></td>
                    <td><input type="number" id="pesomed" value="" style="width: 100px" /></td>
                    <td><button type="button" class="btn btn-outline-primary m-2" onclick='vatendimento(${varr[vlt]})'><i class="fa fa-cub me-2"></i>Iniciar</button></td>
                </tr>`;
    }

    vcont += `</tbody>
            </table>`;

    $("#page_modal").html(vform + vcont);

    $('#hourModal').modal('show');

    spinner(0);

    return false;
};

var vrotas = (vopcao, vo) => {
    /*=== Controla active do menu ===*/
    limpamenu();
    $('#'+vo).parent().addClass("active");

    $(vconteudo).html(eval(vopcao));
}

var iniHome = async () => {
    var vnumrom    = await getCount('romaneio');
    console.log('iniHome',vnumrom);
    if (vnumrom > 0) {
        $("#m1").click();
    } else {
        //sincroniza();
        $("#m2").click();
    }
};