const { inspect } = require("util")
const { Lexer } = require("./src/lexer")
const { Parser } = require("./src/parser")
const { Interpreter, TabelSimbol, Konteks } = require("./src/interpreter")
const { BooLean } = require("./lib/TipeData")
const { executeFileSync, executeSync, runTerminal } = require("./main")
//const glfw = require('glfw-raub');

var hasil = executeFileSync("./test/index.gblk")
if (hasil.error) console.log(hasil.error.toString());

//executeSync("print('hai')", "ae.gblk")
//const skrip = `print("Hello world")`
//runTerminal(skrip, "./indeks.gblk", {runArgs: {"timeout": 1000}}).then(console.log).catch(console.error)


//const tcc = require('node-tinycc');
// create a code generator
//let gen = tcc.CodeGenerator();


/* cek jumlah baris
const fs = require("fs");
const pt = require("path")
function getss(fin) {
    var nl = 0
fs.readdirSync(fin).forEach((v,i) => {
    if (v.endsWith(".js")) {
        nl += fs.readFileSync(pt.join(fin, v)).toString().split("").length
    } else if (["cmd","lib","src","test"].includes(v)) {
        nl += getss(v)
    }
})
return nl
}

console.log(getss("."))
*/