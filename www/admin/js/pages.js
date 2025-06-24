var vtb = [{"tab":"pfidpalm","desc": "Buscar Dados usuários","paramurl":"class=wpf200ln5&method=getPfidpalm"},
    {"tab":"romaneio","desc": "Buscar Dados romaneio","paramurl":"class=wpf200ln5&method=getRomaneio&tipo=romaneio&dias=0", clear: true},
    {"tab":"pedido","desc": "Buscar Dados pedidos","paramurl":"class=wpf200ln5&method=getPedidos&tipo=pedido&dias=0", clear: true},
    {"tab":"pedidoitem","desc": "Buscar Dados itens dos pedidos","paramurl":"class=wpf200ln5&method=getPedidos&tipo=pedidoitem&dias=0", clear: true},
    {"tab":"clifor","desc": "Buscar Dados produtor e clientes","paramurl":"class=wpf200ln5&method=getPessoas", clear: true},
    {"tab":"item","desc": "Buscar Itens dos pedidos","paramurl":"class=wpf200ln5&method=getPedidos&tipo=item", clear: true},
    {"tab":"galpprod","desc": "Buscar Dados galpão","paramurl":"class=wpf200ln5&method=getDadosLotes&tipo=galpprod", clear: true},
    {"tab":"prodaves","desc": "Buscar Dados lotes","paramurl":"class=wpf200ln5&method=getDadosLotes&tipo=lotes", clear: true},
    {"tab":"hispsexp","desc": "Buscar Dados já pesados","paramurl":"class=wpf200ln5&method=getRomaneio&tipo=hispsexp", clear: true}];

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

    var vnumrom    = await getCount('romaneio');
    var vnumpedido = await getCount('pedido');
    var vqtpedidos = await getSomaCampos('pedidoitem',null,{pit_qtpedi:0, pit_pspedi: 0, pit_qtatendi:0, pit_psatendi: 0});
    
    vpesquisa(1);

    var vcont = `
    <div class="row g-4">
        <div class="col-sm-6 col-xl-3">
            <div class="bg-light rounded d-flex align-items-center justify-content-between p-4">
                <i class="fa fa-chart-line fa-3x text-primary"></i>
                <div class="ms-3">
                    <p class="mb-2">Romaneios</p>
                    <h6 class="mb-0" id="numrom">${vnumrom}</h6>
                </div>
            </div>
        </div>
        <div class="col-sm-6 col-xl-3">
            <div class="bg-light rounded d-flex align-items-center justify-content-between p-4">
                <i class="fa fa-chart-bar fa-3x text-primary"></i>
                <div class="ms-3">
                    <p class="mb-2">Pedidos</p>
                    <h6 class="mb-0" id="numped">${vnumpedido}</h6>
                </div>
            </div>
        </div>
        <div class="col-sm-6 col-xl-3">
            <div class="bg-light rounded d-flex align-items-center justify-content-between p-4">
                <i class="fa fa-chart-area fa-3x text-primary"></i>
                <div class="ms-3">
                    <p class="mb-2">Qtd Pedido</p>
                    <h6 class="mb-0" id="qtdped">${vqtpedidos['pit_qtpedi']}</h6>
                </div>
            </div>
        </div>
        <div class="col-sm-6 col-xl-3">
            <div class="bg-light rounded d-flex align-items-center justify-content-between p-4">
                <i class="fa fa-chart-pie fa-3x text-primary"></i>
                <div class="ms-3">
                    <p class="mb-2">Peso Pedido</p>
                    <h6 class="mb-0" id="psped">${numberFormat(vqtpedidos['pit_pspedi'],2)}</h6>
                </div>
            </div>
        </div>        
    </div>
    `;

    /*=== Quantidade pedida ===*/
    var vqtdp = (vped) => {
        var vqtd = 0;
        for (var vpi in vped.itens) {
            vqtd += vped.itens[vpi].pit_qtpedi;
        }
        return vqtd;
    };

    /*=== Aqui separa os pedidos por cliente ===*/
    var vclis = [];
    var varr = await db._allTables['pedido'].orderBy('ped_entrega').toArray();

    for (var vo in varr) {
        var vdados = varr[vo];
        var vret = vclis.find(ve => ve.cli_codigo == vdados.cli_codigo);
        var vcli = await getReg('clifor', {cli_codigo: vdados.cli_codigo});
        var vites = await db._allTables['pedidoitem'].where({emp_empresa: vdados.emp_empresa
                                                            ,uni_unidade: vdados.uni_unidade
                                                            ,ped_codigo: vdados.ped_codigo}).toArray();

        vdados.itens = vites;

        if (!vret) {
            vdados.vnump = 1;
            vdados.cli_nome = vcli.cli_razsoc;
            vdados.peds = [vdados];
            vclis.push(vdados);
        } else {
            vret.vnump += 1;
            vret.peds.push(vdados);
        }
    }
    //console.log(vclis);

    vcont += `
    <!-- Recent Sales Start -->
    <div class="row pt-2 px-2">
        <div class="bg-light rounded h-100 p-4">
            <h6 class="mb-4">Cliente e Pedidos</h6>
            <div class="accordion accordion-flush" id="accordionFlushExample">`;

    for (var vi in vclis) {
        vcont += `<div class="accordion-item">
                    <h2 class="accordion-header" id="flush-headingOne">
                        <div class="accordion-button collapsed" type="button"
                            data-bs-toggle="collapse" data-bs-target="#flush-collapseOne${vclis[vi].ped_codigo}"
                            aria-expanded="true" aria-controls="flush-collapseOne${vclis[vi].ped_codigo}">
                            ${vclis[vi].cli_nome} - Num.Pedidos: ${vclis[vi].vnump}
                        </div>
                    </h2>
                    <div id="flush-collapseOne${vclis[vi].ped_codigo}" class="accordion-collapse collapse"
                        aria-labelledby="flush-headingOne" data-bs-parent="#accordionFlushExample">
                        <div class="accordion-body">
                            <table class="table text-start align-middle table-bordered table-hover mb-0">
                                <thead>
                                    <tr class="text-dark">
                                        <th scope="col">Empresa</th>
                                        <th scope="col">Unidade</th>
                                        <th scope="col">Pedido</th>
                                        <th scope="col">Romaneio</th>
                                        <th scope="col">Emissão</th>
                                        <th scope="col">Entrega</th>
                                        <th scope="col">Qtde Pedido</th>
                                        <th scope="col"></th>
                                    </tr>
                                </thead>
                                <tbody>`;
        for (var vpes in vclis[vi].peds) {
            var vstr = stringify(vclis[vi].peds[vpes]);
            
            vcont += `<tr>
                        <td>${vclis[vi].peds[vpes].emp_empresa}</td>
                        <td>${vclis[vi].peds[vpes].uni_unidade}</td>
                        <td>${vclis[vi].peds[vpes].ped_codigo}</td>
                        <td>${vclis[vi].peds[vpes].rom_codigo}</td>
                        <td>${dateFormat(vclis[vi].peds[vpes].ped_emissao)}</td>
                        <td>${dateFormat(vclis[vi].peds[vpes].ped_entrega)}</td>
                        <td>${vqtdp(vclis[vi].peds[vpes])}</td>
                        <td><button type="button" class="btn btn-outline-primary m-2" onclick='lotes(` + vstr + `)'><i class="fa fa-paper-plane me-2"></i>Atender Pedido</button></td>
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
                    case 'romaneio':
                        vp = await getReg(vtt, {emp_empresa: vdados.emp_empresa
                                               ,uni_unidade: vdados.uni_unidade
                                               ,rom_codigo: vdados.rom_codigo});
                        break;
                    case 'pedido':
                        vp = await getReg(vtt, {emp_empresa: vdados.emp_empresa
                                               ,uni_unidade: vdados.uni_unidade
                                               ,ped_codigo: vdados.ped_codigo});
                        break;
                    case 'pedidoitem':
                        vp = await getReg(vtt, {emp_empresa: vdados.emp_empresa
                                               ,uni_unidade: vdados.uni_unidade
                                               ,ped_codigo: vdados.ped_codigo
                                               ,ite_codigo: vdados.ite_codigo
                                               ,pit_seq: vdados.pit_seq});
                        break;
                    case 'clifor':
                        vp = await getReg(vtt, {cli_codigo: vdados.cli_codigo});
                        break;
                    case 'item':
                        vp = await getReg(vtt, {ite_codigo: vdados.ite_codigo});
                        break;
                    case 'galpprod':
                        vp = await getReg(vtt, {cli_codigo: vdados.cli_codigo
                                               ,gpp_codigo: vdados.gpp_codigo});
                        break;
                    case 'prodaves':
                        vp = await getReg(vtt, {cli_codigo: vdados.cli_codigo
                                               ,gpp_codigo: vdados.gpp_codigo
                                               ,gpp_lote: vdados.gpp_lote});
                        break;
                    /* case 'hispsexp':
                        vp = await getReg(vtt, {emp_empresacli_codigo: vdados.cli_codigo, gpp_codigo: vdados.gpp_codigo, gpp_lote: vdados.gpp_lote});
                        break; */
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
                ,params: vtb[vo].paramurl + "&vcomp=true&vidpalm=" + localStorage.getItem('STDAidpalm')
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