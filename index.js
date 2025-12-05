const fs = require('fs');
const convert = require('xml-js');
const protobuf = require('protobufjs');

// Charger Protobuf
const root = protobuf.loadSync('employee.proto');
const EmployeeList = root.lookupType('Employees');

// Données
const employees = [
  { id: 1, name: 'Employee1', salary: 9000 },
  { id: 2, name: 'Employee2', salary: 22000 },
  { id: 3, name: 'Employee3', salary: 23000 }
];

let jsonObject = { employee: employees };

const options = {
  compact: true,
  ignoreComments: true,
  spaces: 0
};

/* ============================================================
   JSON : Encodage + Décodage + Taille
   ============================================================ */

// ---------- JSON : encodage ----------
console.time('JSON encode');
let jsonData = JSON.stringify(jsonObject);
console.timeEnd('JSON encode');

// ---------- JSON : décodage ----------
console.time('JSON decode');
let jsonDecoded = JSON.parse(jsonData);
console.timeEnd('JSON decode');


/* ============================================================
   XML : Encodage + Décodage + Taille
   ============================================================ */

// ---------- XML : encodage ----------
console.time('XML encode');
let xmlData = "<root>\n" + convert.json2xml(jsonObject, options) + "\n</root>";
console.timeEnd('XML encode');

// ---------- XML : décodage ----------
console.time('XML decode');
let xmlJson = convert.xml2json(xmlData, { compact: true });
let xmlDecoded = JSON.parse(xmlJson);
console.timeEnd('XML decode');


/* ============================================================
   Protobuf : Encodage + Décodage + Taille
   ============================================================ */

// Vérification du schéma (optionnel)
let errMsg = EmployeeList.verify(jsonObject);
if (errMsg) throw Error(errMsg);

// ---------- Protobuf : encodage ----------
console.time('Protobuf encode');
let message = EmployeeList.create(jsonObject);
let buffer = EmployeeList.encode(message).finish();
console.timeEnd('Protobuf encode');

// ---------- Protobuf : décodage ----------
console.time('Protobuf decode');
let decodedMessage = EmployeeList.decode(buffer);
let protoDecoded = EmployeeList.toObject(decodedMessage);
console.timeEnd('Protobuf decode');


/* ============================================================
   Sauvegarde + tailles
   ============================================================ */

fs.writeFileSync('data.json', jsonData);
fs.writeFileSync('data.xml', xmlData);
fs.writeFileSync('data.proto', buffer);

console.log(`Taille de 'data.json' : ${fs.statSync('data.json').size} octets`);
console.log(`Taille de 'data.xml'  : ${fs.statSync('data.xml').size} octets`);
console.log(`Taille de 'data.proto': ${fs.statSync('data.proto').size} octets`);
