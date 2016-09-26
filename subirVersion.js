var DOMParser = require('xmldom').DOMParser;
var fs = fs || require('fs');
var XMLSerializer = require('xmldom').XMLSerializer;
var pom = "";
var fromVersion = "";
var toVersion = "";
var xmlPlain = "";
subirVersion(process.argv[2]);

function subirVersion(version) {
    console.log("Obteniendo lista de poms...");
    var poms = walkSync("./", []); //obtengo la lista de todos los poms.xml
    console.log("Subiendo versión de " + poms.length + " poms.xml ...");
    for (var i = 0; i < poms.length; i++) {
        pom = poms[i];
        var data = fs.readFileSync(pom, "utf-8");
        var doc = new DOMParser().parseFromString(data, 'text/xml');
        var versions = doc.getElementsByTagName('version').item(0).childNodes;
        for (var j = 0; j < versions.length; j++) {
            var currentVersion = versions[j];
            if (currentVersion.nodeValue.indexOf("SNAPSHOT") > -1) {
                var newVersion = replaceVersionSnapshot(currentVersion.nodeValue, version);
                currentVersion.data = newVersion;
              if (i == versions.length - 1) {
                    xmlPlain = new XMLSerializer().serializeToString(doc);
                }
            }
        }
        fs.writeFile(pom, xmlPlain, 'utf8', (err) => {
            if (err) throw err;
        });
    }
    console.log("Versión actualizada from " + fromVersion + " to: " + toVersion);

}



function replaceVersionSnapshot(currentVersion, newVersion){
  var lastDot = currentVersion.lastIndexOf(".");
  var lastGuion = currentVersion.lastIndexOf("-");
  var currentVersionInt = parseInt(currentVersion.substring(lastDot + 1,lastGuion));
  if(isNaN(newVersion))
    throw "La versión tiene que ser un número.";
  if(parseInt(newVersion) < 0)
    throw "La versión tiene que ser un número positivo.";

  if(newVersion == undefined){
    var newVersion = currentVersionInt + 1;
  }
  fromVersion = currentVersion;
  currentVersion = currentVersion.replace(currentVersionInt, newVersion);
  toVersion = currentVersion;
  return currentVersion;
}

function editVersion(version){

}


function walkSync(dir, filelist) {
  files = fs.readdirSync(dir, "buffer");
  filelist = filelist || [];
  files.forEach(function(file) {
    if (fs.statSync(dir + file).isDirectory()) {
      filelist = walkSync(dir + file + '/', filelist);
    }
    else {
      if(file.indexOf('pom.xml') > -1)
        filelist.push(dir + file + '/');
    }
  });
  return filelist;
};
