var tokenMobile = "";
var ipMobile = "";
var VersaoAPP = "";
var vlogout = false;

function RecebeTokenMobile(token, vipUser, versao){
    tokenMobile = token;
    ipMobile = vipUser;
    VersaoAPP = versao;
}

document.addEventListener('deviceready', async () => {
    console.log('DOM loaded, initializing database...');
    window.addEventListener('resize', function(event){
        let varea_dados = document.getElementById('menu_area_body');
        if(varea_dados.scrollHeight > varea_dados.clientHeight){
            varea_dados.scrollTop += 1000;
        }
    });

    if(localStorage.getItem('APPusuLogout') != null)
        var vlogout = true;
    
    if(localStorage.getItem('APPusuLogin') != null && localStorage.getItem('APPpassLogin') != null){
        $("#vusuario").val(localStorage.getItem('APPusuLogin'));
        $("#vsenha").val(localStorage.getItem('APPpassLogin'));
        document.getElementById('vdadosAT').checked = true;
        
        if(!vlogout){
            fkillSessao();
        }
    }

    buscaBase();
});

async function fkillSessao(){
    if (db.pfidpalm == undefined) {
        buscaBase();
    }

    load.show("Aguarde... Realizando login");

    if (getValue("#vusuario") == "" || getValue("#vsenha") == "") {
        msg('E','Usuário e senha deve ser informado.');
        $("#vusuario").focus();
        load.hide();
    } else {

        var vusu = await getReg('pfidpalm',{usu_usuario: getValue("#vusuario"), pal_senha: getValue("#vsenha")});
        
        if (vusu && vusu.id >= 0) {
            load.show("Aguarde... Realizando login");

            localStorage.setItem('APPidpalm',vusu.idpalm);
            localStorage.setItem('APPnomeuser',vusu.usu_nome);
            if (document.getElementById('vdadosAT').checked) {
                localStorage.setItem('APPusuLogin',getValue("#vusuario"));
                localStorage.setItem('APPpassLogin',getValue("#vsenha"));
            }

            window.location.replace('./admin/index.html');
        } else {
            getDados({type: "POST"
                    ,params: `class=wpf200ln5&method=getPfidpalm&vusuario=${getValue("#vusuario")}&vsenha=${getValue("#vsenha")}`
                    ,dataType: "html"
                    ,exec: async (vretorno) => {
                        console.log(vretorno);
                        if (vretorno.status == 1) {
                            load.show("Aguarde... Realizando login");

                            if (vusu && vusu.id >= 0) {
                                db.pfidpalm.bulkUpdate([
                                    {key: vusu.id, changes: vretorno.resultado.pfidpalm[0]}
                                ]).then(() => {
                                    console.log("Pfidpalm update");
                                }).catch(error => {
                                    console.log("Erro Pfidpalm update " + error.name);
                                });
                                localStorage.setItem('APPidpalm',vusu.idpalm);
                                localStorage.setItem('APPnomeuser',vusu.usu_nome);
                            } else {
                                db.pfidpalm.bulkAdd(vretorno.resultado.pfidpalm).then(() => {
                                    console.log("Pfidpalm add");
                                }).catch(error => {
                                    console.log("Erro Pfidpalm add " + error.name);
                                });
                                localStorage.setItem('APPidpalm',vretorno.resultado.pfidpalm[0].idpalm);
                                localStorage.setItem('APPnomeuser',vretorno.resultado.pfidpalm[0].usu_nome);
                            }

                            
                            if (document.getElementById('vdadosAT').checked) {
                                localStorage.setItem('APPusuLogin',getValue("#vusuario"));
                                localStorage.setItem('APPpassLogin',getValue("#vsenha"));
                            }

                            window.location.replace('./admin/index.html');
                        } else {
                            msg('E','Erro: ' + vretorno.msg);
                        }
                        load.hide();
                    }
            });
        }
    }
}

function ReturnToLogin(){
    document.getElementById("ContainerPendente").style.height = "0px";
    document.getElementById("ContainerNegado").style.height = "0px";
}

function VisuSenha(){
    var DigiPasswd = document.getElementById("vsenha");
    if (DigiPasswd.type == 'text') 
        DigiPasswd.type = 'password';
    else 
        DigiPasswd.type = 'text';
}

