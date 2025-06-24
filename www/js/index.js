var vtokenMobile = "";
var vtokenAut = "";

var inAppBrowserRef = cordova.InAppBrowser;

document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    load.show('Aguarde... Validando token do dispositivo');

    document.addEventListener("backbutton", function (e) {
        e.preventDefault();
    }, false );

    if(device.platform == "iOS"){
        StatusBar.overlaysWebView(false);
        StatusBar.styleLightContent();
        StatusBar.backgroundColorByHexString("#073751");
        StatusBar.show();
    }

    /* //verificando permissões
    cordova.plugins.firebase.messaging.requestPermission({forceShow: true}).then(function() {
        console.log("Push messaging is allowed");
    });
    //Verificando o token do dispositivo
    cordova.plugins.firebase.messaging.getToken().then(function(token) {
        console.log("Got device token: ", token);
        vtokenMobile = token;

        //Verifica se possui codigo de acesso já informado para acessar o app automaticamente
        validaAcessoOpenApp();
    },function(verrtoken){
        console.log("ERRO token");
        
        document.getElementById("Login").style.display = "none";
        document.getElementById("ErroToken").style.display = "flex";
        load.hide();
    });

    //Recebimento da notificação
    cordova.plugins.firebase.messaging.onBackgroundMessage(function(payload) {
        console.log("New background FCM message");
        AgroMsg.custom("info",payload.title,payload.body,function(isConfirmed){
            if (isConfirmed == true){
                cordova.plugins.firebase.messaging.clearNotifications();
            }
        },'Ok');
    });
    cordova.plugins.firebase.messaging.onMessage(function(payload) {
        console.log("New foreground FCM message");
        AgroMsg.custom("info",payload.title,payload.body,function(isConfirmed){
            if (isConfirmed == true){
                cordova.plugins.firebase.messaging.clearNotifications();
            }
        },'Ok');
    }); */

    //navigator.splashscreen.hide();
    validaAcessoOpenApp();
};

function validaAcessoOpenApp(){
    if(localStorage.getItem('APPenderExterno') != null){
        $("#CodAcesso").val(localStorage.getItem('APPenderCod'));
        goAcessar();
    }else{
        load.hide();
    }
}

function getNewToken(){
    load.show('Aguarde... Validando token do dispositivo');

    cordova.plugins.firebase.messaging.getToken().then(function(token) {
        console.log("Got device token: ", token);
        vtokenMobile = token;

        //Habilita tela para preencher codigo de acesso
        msg("S","Token obtido com sucesso");
        document.getElementById("Login").style.display = "flex";
        document.getElementById("ErroToken").style.display = "none";
        load.hide();
    },function(verrtoken){
        console.log("ERRO token");
        load.hide();
    });
}

function ValidaCodAcesso(){
    if($("#CodAcesso").val() == "" || $("#CodAcesso").val() == null){
        msg("E", "Preencha o Código de Acesso!");
    }else{
        load.show('Aguarde... Validando código de acesso');

        let codacesso = replaceAll($("#CodAcesso").val(),"1242","");
        localStorage.setItem('APPenderCod',$("#CodAcesso").val());

        //limpando dados armazenados
        localStorage.removeItem('APPenderExterno');
        localStorage.removeItem('APPenderInterno');
        localStorage.setItem('APPnovoLoginApp','true');


        //AQUI VALIDAR NO WEBSERVICE O CODIGO E CASO EXISTA TRAZER O ENDEREÇO E GRAVAR NO LOCALSTORAGE
        cordova.plugin.http.post("https://sca.agrosys.com.br/agrophp/configapps/rest.php?class=ApplicationAuthenticationRestService&method=getToken", 
            {login: 'user',password: 'agrosys',tokenapp: vtokenMobile},
            {'Authorization': 'Basic 1b0caa627397bbd260a4a2999893f1cb'},
        function (data){
            try {
                var vstr = data.data.replace('\n','');
                var obj = JSON.parse(vstr);                
                vtokenAut = obj.data;
                
                //aqui verifica se cliente possui liberação para acesso ao app e-Agrosys
                cordova.plugin.http.get('https://sca.agrosys.com.br/agrophp/configapps/rest.php',
                                        {class: 'EmpresasRestService',
                                        method: 'getEmpresas',
                                        //tipo: '0', 1-Homologação 0-Produção 
                                        chave: idApp,
                                        id_ini: '1'},
                                        {'Authorization': 'Bearer ' + vtokenAut},
                function (ret) {
                    console.log(ret);

                    try {
                        var vstrEmp = ret.data.replace('\n','');
                        var objEmp = JSON.parse(vstrEmp);

                        //percorrer objeto e validar se código informado existe nele
                        if(objEmp.data == null || objEmp.data == undefined || objEmp.data.length == 0){
                            msg("E",'Erro ao obter dados. Entre em contato com o suporte Agrosys. (get Empresas x APP)');
                        }else{
                            let vselEmp = objEmp.data.find(o => o.id == codacesso.toString());
                            if(vselEmp != null && vselEmp != undefined)
                                getDadosAcesso();
                            else{
                                load.hide();
                                msg("E",'Código inválido ou app e-Agrosys não parâmetrizado em sua empresa. (get Empresas x APP)');
                            }
                        }
                    } catch (erC) {
                        console.log(erC);
                        load.hide();
                        msg("E",'Erro de conversão dos dados. (get Empresas)');
                    }                
                }, 
                function(er){
                    console.error(er);
                    load.hide();
                    msg("E", "Erro ao buscar informações. Verifique sua conexão com a internet. (get Empresas)");
                });
                
            } catch (e) {
                console.log(e);
                load.hide();
                msg("E",'Erro de conversão dos dados. (get vtokenAut)');
            }
        },
        function(error){
            console.error(error);
            load.hide();
            msg("E", "Erro ao buscar dados. Verifique se você possui conexão com a internet. (get vtokenAut)");
        });
    }
}

function getDadosAcesso(){
    let conface = false;
    let codacesso = replaceAll($("#CodAcesso").val(),"1242","");

    cordova.plugin.http.get('https://sca.agrosys.com.br/agrophp/configapps/rest.php',
                            {class: 'AppParamsRestService',
                            method: 'getConfig',
                            idapp: idApp,
                            id_empresa: codacesso},
                            {'Content-Type': 'application/json','Authorization': 'Bearer ' + vtokenAut},
    function(vresult){
        vresult = JSON.parse(vresult.data);
    
        function percorreResult(vid){
            if(vid < vresult.data.length){
                if(vresult.data[vid].par_sigla == "WEBE"){
                    localStorage.setItem('APPenderExterno',vresult.data[vid].par_param);
                    conface = true;
                }

                if(vresult.data[vid].par_sigla == "WEBI"){
                    localStorage.setItem('APPenderInterno',vresult.data[vid].par_param);
                }
                
                percorreResult(vid+1);
            }else{
                if (conface == false){
                    msg("E", "Endereços de acesso para app e-Agrosys não cadastrados em sua empresa. (get DadosAcesso)");
                }else{
                    goAcessar();
                }
            }
        }

        if(vresult.data != undefined && vresult.data.length==0)                        
            msg("E", "Código de acesso inválido."); 
        else
            percorreResult(0);
    },function(e){
        console.log(e);
        load.hide();
        msg("E",'Erro de conversão dos dados');
    });
}

function goAcessar(){
    openBrowser();
}

function openBrowser(){    
    let vIPuser = "";

    document.location.href = "./LogineAgrosys.html?_ch=" + (Date.now);
}

function CloseBrowser(){
    ClearData.cache();

    $("#CodAcesso").val('');
    localStorage.removeItem('APPenderCod');
    localStorage.removeItem('APPenderExterno');
    localStorage.removeItem('APPenderInterno');
    localStorage.setItem('APPnovoLoginApp','true');

    inAppBrowserRef.close();
}








function FechaApp(){
    navigator.app.exitApp();
}

function getLocalizacao() {
    navigator.geolocation.getCurrentPosition(onSuccessLocal, onErrorLocal, {maximumAge: 3000,timeout: 5000,enableHighAccuracy: true});
}

function onSuccessLocal(position) {
    var positionObject = {};

    if ('coords' in position) {
        positionObject.coords = {};

        if ('latitude' in position.coords) {
            positionObject.coords.latitude = position.coords.latitude;
        }
        if ('longitude' in position.coords) {
            positionObject.coords.longitude = position.coords.longitude;
        }
        if ('accuracy' in position.coords) {
            positionObject.coords.accuracy = position.coords.accuracy;
        }
        if ('altitude' in position.coords) {
            positionObject.coords.altitude = position.coords.altitude;
        }
        if ('altitudeAccuracy' in position.coords) {
            positionObject.coords.altitudeAccuracy = position.coords.altitudeAccuracy;
        }
        if ('heading' in position.coords) {
            positionObject.coords.heading = position.coords.heading;
        }
        if ('speed' in position.coords) {
            positionObject.coords.speed = position.coords.speed;
        }
    }

    if ('timestamp' in position) {
        positionObject.timestamp = position.timestamp;
    }

    inAppBrowserRef.executeScript({ code: 'getRetornoLocalApp(\''+JSON.stringify(positionObject)+'\',"1");' }, function(par){});
}

function onErrorLocal(error) {
    var positionObject = {};

    if ('code' in error) {
        positionObject.code = error.code;
    }

    if ('message' in error) {
        positionObject.message = error.message;
    }

    inAppBrowserRef.executeScript({ code: 'getRetornoLocalApp(\''+JSON.stringify(positionObject)+'\',"0");' }, function(par){});
}



function getCamera() {
    //setando estado padrao do icon flash
    $('#Camera_Flash_off').show();
    $('#Camera_Flash_on').hide();

    document.getElementById("CameraContainer").classList.add("divshowCamera");
        
    /* setTimeout(() => {
        inAppBrowserRef.hide();
    }, 500); */

    let options = {
        x: 0,
        y: 0,
        width: window.innerWidth,
        height: (window.innerHeight *0.80),
        camera: CameraPreview.CAMERA_DIRECTION.BACK,
        toBack: false,
        tapPhoto: false,
        tapFocus: true,
        previewDrag: false,
        storeToFile: false,
        disableExifHeaderStripping: false
    };
    
    CameraPreview.startCamera(options,function(succ){
        inAppBrowserRef.hide();
    },function(err){
        inAppBrowserRef.executeScript({ code: 'getRetornoCamApp(\'Erro ao abrir Camera. Tente novamente.\',"0");' }, function(par){});
        inAppBrowserRef.show();
        fpad_fechaCamera();
    });

    setTimeout(() => {
        CameraPreview.setPreviewSize({width: window.innerWidth, height: (window.innerHeight *0.80)});
    }, 1000);
}
function onSuccessCamera() {
    CameraPreview.takePicture({width:1200, height:1200, quality: 65}, function(base64PictureData) {
        inAppBrowserRef.executeScript({ code: 'getRetornoCamApp(\''+base64PictureData[0]+'\',"1");' }, function(par){});
        inAppBrowserRef.show();
        fpad_fechaCamera();
    },function(err){
        inAppBrowserRef.executeScript({ code: 'getRetornoCamApp(\'Erro ao capturar foto. Tente novamente.\',"0");' }, function(par){});
        inAppBrowserRef.show();
        fpad_fechaCamera();
    });
}
function CloseCamera(){
    inAppBrowserRef.show();
    fpad_fechaCamera();
}
function LigarFlash(){
    //setando estado padrao do icon flash
    $('#Camera_Flash_off').hide();
    $('#Camera_Flash_on').show();

    CameraPreview.setFlashMode(CameraPreview.FLASH_MODE.ON);
}
function DesligarFlash(){
    //setando estado padrao do icon flash
    $('#Camera_Flash_off').show();
    $('#Camera_Flash_on').hide();

    CameraPreview.setFlashMode(CameraPreview.FLASH_MODE.OFF);
}
function fpad_fechaCamera(){
    try {
        CameraPreview.stopCamera();

        let CameraBoxes = document.querySelectorAll('.divshowCamera');
        CameraBoxes.forEach(box => {
            box.classList.remove("divshowCamera");
        });          
    } catch (err) {
        CameraPreview.stopCamera();
        msg("E","Erro ao fechar camera");
    }
}

function readyFile(data,ext){
    //showLoad();

    window.requestFileSystem(LocalFileSystem.TEMPORARY, 0, function (fs) {
        saveFile(fs.root, data, "anexoeAgrosys." + ext, ext);
    }, function error(){
        inAppBrowserRef.executeScript({ code: 'getRetornoMsgeAgro("E","Erro ao abrir o anexo selecionado (readyFile)");' }, function(par){});
        //msg("E","Erro ao abrir o anexo selecionado (readyFile).","WF");
    });
}

function saveFile(dirEntry, fileData, fileName, extFile) {
    dirEntry.getFile(fileName, { create: true, exclusive: false }, function (fileEntry) {
        writeFile(fileEntry, fileData, extFile);
    }, function error(){
        inAppBrowserRef.executeScript({ code: 'getRetornoMsgeAgro("E","Erro ao abrir o anexo selecionado (saveFile)");' }, function(par){});
        //msg("E","Erro ao abrir o anexo selecionado (saveFile).","WF");
    });
}

function writeFile(fileEntry, fileData, extFile) {

    var b64toBlob = (b64Data, contentType='', sliceSize=512) => {
        var byteCharacters = atob(b64Data);
        var byteArrays = [];

        for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            var slice = byteCharacters.slice(offset, offset + sliceSize);

            var byteNumbers = new Array(slice.length);

            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }

            var byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }

        var blob = new Blob(byteArrays, {type: contentType});
        return blob;
    }

    try {
        var contentType = getContentType(extFile);
        var blob = b64toBlob(fileData, contentType);

        fileEntry.createWriter(function (fileWriter) {
            fileWriter.onwriteend = function() {
                cordova.plugins.fileOpener2.open(fileEntry.nativeURL, contentType, {
                    error: function error(err) {
                        inAppBrowserRef.executeScript({ code: 'getRetornoMsgeAgro("E","Erro ao abrir o anexo selecionado (writeFile)");' }, function(par){});
                        //msg("E","Erro ao abrir o anexo selecionado (writeFile).","WF");
                    },
                    success: function success() {
                        inAppBrowserRef.executeScript({ code: 'getRetornoMsgeAgro("S","");' }, function(par){});
                        /* console.log("success with opening the file");
                        inAppBrowserRef.show();
                        setTimeout(() => {
                            document.getElementById("ContainerLoadGeral").style.height = "0px";
                        }, 2000); */
                    }
                });
            };

            fileWriter.onerror = function(e) {
                inAppBrowserRef.executeScript({ code: 'getRetornoMsgeAgro("E","Erro ao abrir o anexo selecionado (writeFile)");' }, function(par){});
                //msg("E","Erro ao abrir o anexo selecionado (writeFile).","WF");
            };

            fileWriter.write(blob);
        });
    } catch (error) {
        inAppBrowserRef.executeScript({ code: 'getRetornoMsgeAgro("E","Erro ao abrir o anexo selecionado (writeFile)");' }, function(par){});
        //msg("E","Erro ao abrir o anexo selecionado (writeFile).","WF");
    }
}

function getContentType(ext) {

    var auxType = "";

    switch (ext.toLowerCase()) {
        case "aac":
            auxType = "audio/aac";
            break;
        case "abw":
            auxType = "application/x-abiword";
            break;
        case "arc":
            auxType = "application/octet-stream";
            break;
        case "avi":
            auxType = "video/x-msvideo";
            break;
        case "azw":
            auxType = "application/vnd.amazon.ebook";
            break;
        case "bin":
            auxType = "application/octet-stream";
            break;
        case "bz":
            auxType = "application/x-bzip";
            break;
        case "bz2":
            auxType = "application/x-bzip2";
            break;
        case "csh":
            auxType = "application/x-csh";
            break;
        case "css":
            auxType = "text/css";
            break;
        case "csv":
            auxType = "text/csv";
            break;
        case "txt":
            auxType = "text/plain";
            break;
        case "doc":
            auxType = "application/msword";
            break;
        case "docx":
            auxType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            break;
        case "odt":
            auxType = "application/vnd.oasis.opendocument.text";
            break;
        case "eot":
            auxType = "application/vnd.ms-fontobject";
            break;
        case "epub":
            auxType = "application/epub+zip";
            break;
        case "gif":
            auxType = "image/gif";
            break;
        case "bmp":
            auxType = "image/bmp";
            break;
        case "htm":
            auxType = "text/html";
            break;
        case "html":
            auxType = "text/html";
            break;
        case "ico":
            auxType = "image/x-icon";
            break;
        case "ics":
            auxType = "text/calendar";
            break;
        case "jar":
            auxType = "application/java-archive";
            break;
        case "jpeg":
            auxType = "image/jpeg";
            break;
        case "jpg":
            auxType = "image/jpeg";
            break;
        case "js":
            auxType = "application/javascript";
            break;
        case "json":
            auxType = "application/json";
            break;
        case "mid":
            auxType = "audio/midi";
            break;
        case "midi":
            auxType = "audio/midi";
            break;
        case "mpeg":
            auxType = "video/mpeg";
            break;
        case "mpkg":
            auxType = "application/vnd.apple.installer+xml";
            break;
        case "odp":
            auxType = "application/vnd.oasis.opendocument.presentation";
            break;
        case "ods":
            auxType = "application/vnd.oasis.opendocument.spreadsheet";
            break;
        case "oga":
            auxType = "audio/ogg";
            break;
        case "ogv":
            auxType = "video/ogg";
            break;
        case "ogx":
            auxType = "application/ogg";
            break;
        case "otf":
            auxType = "font/otf";
            break;
        case "png":
            auxType = "image/png";
            break;
        case "pdf":
            auxType = "application/pdf";
            break;
        case "ppt":
            auxType = "application/vnd.ms-powerpoint";
            break;
        case "pptx":
            auxType = "application/vnd.openxmlformats-officedocument.presentationml.presentation";
            break;
        case "rar":
            auxType = "application/x-rar-compressed";
            break;
        case "rtf":
            auxType = "application/rtf";
            break;
        case "sh":
            auxType = "application/x-sh";
            break;
        case "svg":
            auxType = "image/svg+xml";
            break;
        case "swf":
            auxType = "application/x-shockwave-flash";
            break;
        case "tar":
            auxType = "application/x-tar";
            break;
        case "tif":
            auxType = "image/tiff";
            break;
        case "tiff":
            auxType = "image/tiff";
            break;
        case "ts":
            auxType = "application/typescript";
            break;
        case "ttf":
            auxType = "font/ttf";
            break;
        case "vsd":
            auxType = "application/vnd.visio";
            break;
        case "wav":
            auxType = "audio/x-wav";
            break;
        case "weba":
            auxType = "audio/webm";
            break;
        case "webm":
            auxType = "video/webm";
            break;
        case "webp":
            auxType = "image/webp";
            break;
        case "woff":
            auxType = "font/woff";
            break;
        case "woff2":
            auxType = "font/woff2";
            break;
        case "xhtml":
            auxType = "application/xhtml+xml";
            break;
        case "xls":
            auxType = "application/vnd.ms-excel";
            break;
        case "xlsx":
            auxType = "application/vnd.ms-excel";
            break;
        case "xml":
            auxType = "application/xml";
            break;
        case "xul":
            auxType = "application/vnd.mozilla.xul+xml";
            break;
        case "zip":
            auxType = "application/zip";
            break;
        case "3gp":
            auxType = "audio/video";
            break;
        case "3g2":
            auxType = "audio/video";
            break;
        case "7z":
            auxType = "application/x-7z-compressed auxType =";
            break;
        default:
            auxType = "application/octet-stream";
    }

    return auxType;
}



/*=== FUNCOES GERAIS DA PAGINA ===*/
function OpenExternalLink(vlink){
    if (device.platform.toUpperCase() === 'ANDROID') {
        navigator.app.loadUrl(vlink, { openExternal: true });
    }
    else if (device.platform.toUpperCase() === 'IOS') {
        window.open(vlink, '_system');
    }
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
        /*======= Icons Disponíveis =======*/
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

var load = {
    show: function (msg) {
        if (msg == undefined) {
            msg = "Aguarde...";
        }
        
        document.getElementById("APPload").style.display = "initial";
        document.getElementById("APPloadText").innerText = msg;
    },
    hide: function () {
        document.getElementById("APPload").style.display = "none";
        document.getElementById("APPloadText").innerText = "";
    }
};

function replaceAll(str, needle, replacement) {
    if (str.split(needle).length > 1) {
        return str.split(needle).join(replacement);
    } else {
        return str;
    }
}

/*=== Função para bloquear texto em campos inteiro ===*/
$(document).ready(function() {
    $('.AgroNumber, .AgroNumber_hora').on('input', function() {
        let vval =  $(this).val().replace(/[^0-9.,-]/g, "");
        $(this).val(vval);
    });
});