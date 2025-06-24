var vurle = localStorage.getItem('APPenderExterno');
var vurli = localStorage.getItem('APPenderInterno');
var vsinc = null;
var vurlvalida = null;
var vprograma = "webpro/weball/wsn200s1";

async function validaUrl (vurl) {
  await cordova.plugin.http.get(vurl,
                            {},
                            {'ContentType': 'text/plain; charset=iso-8859-1'},
    function (vresult) {
      if (vurl.substr(vurl.length - 1,vurl.length) == "/")
        vurlvalida = vurl;
      else
        vurlvalida = vurl + "/";               
    }, 
    function(er){
      if (vsinc == null) {
        vsinc = 'E';
        validaUrl(vurle);
      }
    }
  );
}

async function descomprime(strdata) {
  try {
    if (strdata.substring(0,6) == "[COMP]") {
      const str = `${strdata}`.replace('[COMP]', '');

      vdata = window.atob(String(str).trim());
      const charData = vdata.split('').map((c) => c.charCodeAt(0));
      const binData = new Uint8Array(charData);
      const inflate = new Zlib.Inflate(binData);
      const decoder = new TextDecoder("utf-8");

      var vdescop = inflate.decompress();
      const string = decoder.decode(new Uint8Array(vdescop));
      return string;
    } else {
      return strdata;
    }
  } catch (error) {
      console.log(error);
      console.log(`${strdata}`);
  }
}

async function getDados (vobj) {
  await validaUrl(vurli);
  //debugger;
  console.log(vurlvalida);
  const params = new URLSearchParams(vobj.params);
  const paramObject = Object.fromEntries(params.entries());

  await cordova.plugin.http.post(
    vurlvalida + vprograma, 
    paramObject,
    {'ContentType': vobj.dataType},
    (vresult) => {
      try {
        if (vobj.buscabase) {
          vobj.exec(vresult);
        } else {
          console.log(typeof vresult);
          vresult = descomprime(vresult);
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
    function(error){
      msg("E","Ocorreram problemas ao realizar acesso. Verifique sua conexão e tente novamente!");        
      vobj.exec({status: 0, msg: "Erro no ajax (" + error + ")"});
      load.hide();
    }
  );
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