var vurle = localStorage.getItem('APPenderExterno');
var vurli = localStorage.getItem('APPenderInterno');
var vsinc = null;
var vurlvalida = null;
var vprograma = "webpro/webpost/wsn200s1";

async function validaUrl (vurl) {
  // Retorne uma nova Promise para encapsular a chamada baseada em callback
  return new Promise((resolve, reject) => { //
    cordova.plugin.http.setRequestTimeout(10);
    cordova.plugin.http.get(vurl,
                              {},
                              {'ContentType': 'text/plain; charset=iso-8859-1'},
      function (vresult) { // Callback de sucesso
        if (vurl.substr(vurl.length - 1,vurl.length) == "/") {
          vurlvalida = vurl;
        } else {
          vurlvalida = vurl + "/";               
        }
        resolve(); // Resolve a Promise quando a URL é validada com sucesso
      }, 
      function(er) { // Callback de erro
        if (vsinc == null) {
          vsinc = 'E';
          // Chamada recursiva para validaUrl(vurle)
          // É importante que esta chamada TAMBÉM seja aguardada
          // ou que seu erro seja propagado.
          // Para simplificar, vou assumir que você quer resolver/rejeitar esta Promise
          // dependendo do resultado da chamada externa.
          // Se vsinc = 'E' significa que houve um erro interno, talvez seja melhor rejeitar.
          vsinc = null;
          validaUrl(vurle)
            .then(() => resolve()) // Se a URL externa validar, resolva esta
            .catch((innerError) => reject(innerError)); // Se a externa falhar, rejeite esta
        } else {
          vsinc = null;
          // Se já houve uma tentativa e falhou, rejeite esta Promise
          reject(er); //
        }
      }
    );
  });
}

function isoToUtf8(isoString) {
  const decoder = new TextDecoder('iso-8859-1');
  const uint8Array = new Uint8Array(isoString.length);

  for (let i = 0; i < isoString.length; i++) {
    uint8Array[i] = isoString.charCodeAt(i);
  }

  const utf8String = decoder.decode(uint8Array);
  return utf8String;
}

function descomprime(strdata) {
  let vstring = strdata;

  try {
    if (vstring.substring(0,6) == "[COMP]") {
      const str = isoToUtf8(`${vstring}`.replace('[COMP]', ''));

      vdata = window.atob(String(str).trim());
      const charData = vdata.split('').map((c) => c.charCodeAt(0));
      const binData = new Uint8Array(charData);
      const inflate = new Zlib.Inflate(binData);
      const decoder = new TextDecoder("utf-8");

      const vdescop = inflate.decompress();
      vstring = decoder.decode(new Uint8Array(vdescop));
      //console.log(isoToUtf8(vstring));
      return vstring;
      //return vstring; // Retorna a string descomprimida
    } else {
      //console.log(isoToUtf8(vstring));
      return isoToUtf8(vstring);
      //return vstring; // Retorna a string original se não estiver comprimida
    }
  } catch (error) {
      console.log(error);
      console.log(`${vstring}`);
  }
}

async function getDados (vobj) {
  try {
    if (vurlvalida == null) 
      await validaUrl(vurli); // Esta linha agora realmente esperará a validação
    
    console.log(vurlvalida);
    const params = new URLSearchParams(vobj.params);
    const paramObject = Object.fromEntries(params.entries());

    // ... restante do seu código para cordova.plugin.http.post ...
    await new Promise((resolve, reject) => { // Promisificando a chamada post também
        cordova.plugin.http.setRequestTimeout(20);
        cordova.plugin.http.post(
            vurlvalida + vprograma, 
            paramObject,
            {'ContentType': vobj.dataType},
            function (vresult) { // Callback de sucesso
                try {
                    if (!vresult.dados)
                      vresult.dados = vresult.data;

                    if (vobj.buscabase) {
                        vobj.exec(vresult);
                    } else {
                        console.log(typeof vresult.data);
                        vresult = descomprime(vresult.data); // descomprime is async, you should await it if needed
                        if (typeof vresult == 'string') {
                            vretorno = JSON.parse(vresult);
                        } else {
                            vretorno = vresult;
                        }
                        vobj.exec(vretorno);
                    }
                    resolve(); // Resolve a Promise para o post
                } catch (e) {
                    vurlvalida = null;
                    console.log(e);
                    vobj.exec({status: 0, msg: "Erro no ajax no retorno dos dados (" + vresult + ")"});
                    load.hide();
                    reject(e); // Rejeita em caso de erro no processamento do sucesso
                }
            },
            function(error){ // Callback de erro
                vurlvalida = null;
                msg("E","Ocorreram problemas ao realizar acesso. Verifique sua conexão e tente novamente! " + vurlvalida);        
                vobj.exec({status: 0, msg: "Erro no ajax (" + error + ")"});
                load.hide();
                reject(error); // Rejeita em caso de erro na requisição
            }
        );
    });

  } catch (error) {
    // Lide com erros de validaUrl ou cordova.plugin.http.post aqui
    vurlvalida = null;
    console.error("Erro em getDados:", error);
    msg("E","Ocorreram problemas na validação da URL ou na requisição de dados.");
    vobj.exec({status: 0, msg: "Erro geral na operação (" + error + ")"});
    load.hide();
  }
}

//{type: "POST", params: "vusu=teste&vteste=weweew", dataType: "html", exec: (vretorno) => {} }
/*
async function getDados (vobj) {
  await validaUrl(vurli);
  //debugger;
  //console.log(vurlvalida);

  $.ajax({
    type: vobj.type,
    contentType: 'Content-type: text/plain; charset=iso-8859-1',
    beforeSend: function(jqXHR) {
        jqXHR.overrideMimeType('text/html;charset=iso-8859-1');
    },
    url: vurlvalida + vprograma,
    data: vobj.params,
    dataType: vobj.dataType,
    success: async function(vresult){
      try {
        if (vobj.buscabase) {
          vobj.exec(vresult);
        } else {
          console.log(typeof vresult);
          vresult = await descomprime(vresult);
          if (typeof vresult == 'string') {
            vretorno = JSON.parse(vresult);
          } else {
            vretorno = vresult;
          }
          
          vobj.exec(vretorno);
        }
      } catch (e) {
        console.log(e);
        vobj.exec({status: 0, msg: "Erro no ajax no retorno dos dados (" + vresult + ")"});
        load.hide();
      }
    },
    error: function(error){
        msg("E","Ocorreram problemas ao realizar acesso. Verifique sua conexão e tente novamente!");        
        vobj.exec({status: 0, msg: "Erro no ajax (" + error.getMessage() + ")"});
        load.hide();
    }
  });
}
  */