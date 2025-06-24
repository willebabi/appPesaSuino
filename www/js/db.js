var VersaoAPP = "1.0.0";
var idApp = "com.agrosys.apppesasuino";
var db = new Dexie('basestd');

async function buscaBase (vtp) {
    if (vtp == undefined) {
        if (localStorage.getItem("APPbaseSessao") == null) {
            load.show("Aguarde... Buscando base de dados");
            getDados({type: "POST"
                ,params: `class=wpf200ln5&method=setDataBase&basenova=true`
                ,buscabase: true
                ,dataType: "html"
                ,exec: (vretorno) => {
                    console.log(vretorno);
                    if (vretorno.dados != "") {
                        try {
                            eval(vretorno);
                            localStorage.setItem('APPbaseSessao',vretorno);
                            load.hide();
                        } catch (e) {
                            console.log(e);
                            msg('E','Erro ao tentar executar a base de dados, favor comunicar agrosys.');
                            load.hide();
                        }
                    } else {
                        db.open();
                        if (db.pfidpalm == undefined) {
                            db.close();
                        }
                        load.hide();
                    }
                }
            }); 
        } else {
            if (db.isOpen() == false)
                eval(localStorage.getItem("APPbaseSessao"));
        }
    } else {
        if (db.isOpen() == false)
            await db.open();
    }
}

async function getReg (vtb, vobj) {
    if (db._allTables[vtb]) {
        return await db._allTables[vtb].get(vobj);
    } 
    return null;
}

async function getCount (vtb) {
    if (db._allTables[vtb]) {
        return (await db._allTables[vtb].toArray()).length;
    } 
    return 0;
}

async function getBuscaDados (vtb, vobj) {
    if (db._allTables[vtb]) {
        if (vobj != null)
            return await db._allTables[vtb].where(vobj).toArray();
        else
            return await db._allTables[vtb].toArray();
    } 
    return null;
}

async function getSomaCampos (vtb, vobj, vcampos) {
    var arr = await getBuscaDados(vtb, vobj);

    for (var vo in arr) {
        for (var vc in vcampos) {
            vcampos[vc] +=  arr[vo][vc];
        }
    }

    return vcampos;
}

//=== Substitui strings ===
function replaceAll(str, needle, replacement) {
  if (str.split(needle).length > 1) {
      return str.split(needle).join(replacement);
  } else {
      return str;
  }
}
//=== Funcao para buscar campos de um formulario html ===
function getDadosForm (vform) {
  var vcampos = "";
  if (vform != "") {
      $(vform + ' input,' + vform + ' select,' + vform + ' textarea').each(function (vindex,velement) {
          var vnm = $(this).prop("id");
          if (vnm === null || vnm === undefined || vnm === '') {
              vnm = $(this).prop("name");
          }
          if ($(this).prop("type") == "checkbox") {
              vcampos += vnm + '=' + $(this).prop('checked') + "&";
          } else {
              vcampos += vnm + '=' + escape($(this).val()) + "&";
          }
      });
  } else {
      $('input, select ,textarea').each(function (vindex,velement) {                
          if ($(this).prop("type") == "checkbox") {
              vcampos += $(this).prop("id") + '=' + $(this).prop('checked') + "&";
          } else {
              vcampos += $(this).prop("id") + '=' + $(this).val() + "&";
          }
      });
  }
  vcampos = replaceAll(vcampos + '|','&|','');
  return vcampos;
}

function getValue (vnm) {
    if ($(vnm).val() != undefined) {
      return $(vnm).val();
    }
    
    return "";
}

function msg (tipo, msg, proc) {
    if (proc == "WF")
        inAppBrowserRef.hide();

    Snackbar.show({
        text: msg,
        pos: 'top-right',
        backgroundColor: (tipo == "E" ? '#990000' : '#1c226e'), /*'#1c226e'*/
        textColor: '#FFFFFF',
        actionText: "Ok",
        actionTextColor: '#FFFFFF',
        onClose: function(){
            load.hide();

            if (proc == "WF")
                inAppBrowserRef.show();
        }
    });
}

var AgroMsg = {
    confirma: function(vicon,vtitle,vhtml,fcallback){
        if(vicon == "" || vicon == null || vicon == undefined)
            vicon = 'warning';
        
        Swal.fire({
            toast: true,
            title: vtitle,
            html: vhtml,
            icon: vicon,
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'Confirmar',
            cancelButtonColor: '#d33',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed)
                fcallback(true);
            else 
                fcallback(false);
        })
    },
    alerta: function(tipo,vhtml){
        Swal.fire({
            toast: true,
            title: (tipo=="E"?'Atenção':'Sucesso'),
            html: vhtml,
            icon: (tipo=="E"?'warning':'success'),
            showDenyButton: true,
            showConfirmButton:false,
            denyButtonColor: '#3085d6',
            denyButtonText: 'Fechar',
            customClass: {
                denyButton: 'denyAgro'
            }
        })
    },
    custom: function(vtipo,vtitle,vhtml,fcallback,titleButton){
        /*======= Icons Dispon�veis =======*/
        /* success, error, warning, info, question */
        
        Swal.fire({
            toast: true,
            title: vtitle,
            html: vhtml,
            icon: vtipo,
            //allowOutsideClick: false,
            showDenyButton: true,
            showConfirmButton:false,
            denyButtonColor: '#3085d6',
            denyButtonText: (titleButton == undefined ? 'Fechar' : titleButton),
            customClass: {
                denyButton: 'denyAgro'
            }
        }).then((result) => {
            if (result.isDenied){
                if(fcallback != null && fcallback != undefined) fcallback(true);
            }else{
                if(fcallback != null && fcallback != undefined) fcallback(false);
            }
        })
    }
}

var load = {
    show: function (msg) {
        if (msg == undefined) {
            msg = "Aguarde...";
        }
        
        document.getElementById("EAGROload").style.display = "initial";
        document.getElementById("EAGROloadText").innerText = msg;
    },
    hide: function () {
        document.getElementById("EAGROload").style.display = "none";
        document.getElementById("EAGROloadText").innerText = "";
    }
};

function replaceAll(str, needle, replacement) {
    if (str.split(needle).length > 1) {
        return str.split(needle).join(replacement);
    } else {
        return str;
    }
}

/*=== Substitui��o dos caracteres especiais por hexadecimais ===*/
var agroHex = function (code, length) {
    var result = code.toString(16);
    while (result.length < length) result = '0' + result;
    return result;
};

/*=== Substitui��o dos caracteres especiais por hexadecimais ===*/
function agroEscape(string) {
    var str = string.toString();
    var result = '';
    var length = str.length;
    var index = 0;
    var chr, code;
    var raw = /[\w*\-./@]/;

    while (index < length) {
        chr = str.charAt(index++);
        if (raw.exec(chr)) {
            result += chr;
        } else {
            code = chr.charCodeAt(0);

            if (code < 256) {
                result += '%' + agroHex(code, 2).toUpperCase();
            } else {
                result += '%u' + agroHex(code, 4).toUpperCase();
            }
        }
    } return result;
}
/*=== FUNCOES GERAIS DA PAGINA ===*/
function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
        c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
        }
    }
    return "";
}

function ExitApp(){
    AgroMsg.confirma('warning','Atenção','Confirma fechar tela de login? ',function(vresp){
        if(vresp){
            localStorage.clear();
            document.location.href = './index.html';
        }
    });
}

function numberFormat (vn, vd) {
    return Intl.NumberFormat('pt-br', {minimumFractionDigits: vd, maximumFractionDigits: vd}).format(vn);
    //return Number.parseFloat(vn).toFixed(vd);
}

function dateFormat (vdt) {
    var vdt = new Date(vdt);

    return vdt.toLocaleDateString("pt-BR");
}

function getIdade (vdt) {
    var vdt = new Date(vdt);
    var vda = new Date();
    var vdif = vda - vdt;

    return (vdif / (1000 * 60 * 60 * 24));
}

function stringify(obj) {
    let cache = [];
    let str = JSON.stringify(obj, function(key, value) {
      if (typeof value === "object" && value !== null) {
        if (cache.indexOf(value) !== -1) {
          // Circular reference found, discard key
          return;
        }
        // Store value in our collection
        cache.push(value);
      }
      return value;
    });
    cache = null; // reset the cache
    return str;
}