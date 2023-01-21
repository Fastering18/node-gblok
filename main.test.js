const { Lexer } = require("./src/lexer")
const { Parser } = require("./src/parser")
const { Interpreter, TabelSimbol, Konteks } = require("./src/interpreter")
const { BooLean } = require("./lib/TipeData")
const { executeFileSync, executeSync, runTerminal } = require("./main")
const { downloadModule } = require("./cmd/projek")
const utility = require("./cmd/utility");

const fs = require("fs")
const path = require("path")
const chalk = require("chalk")
const { inspect } = require("util")

const TESTFOLDER = "./test"
//const glfw = require('glfw-raub');
//var hasil = executeFileSync("./test/index.gblk")
//if (hasil.error) console.log(hasil.error.toString());

var testResults = []

fs.readdir(TESTFOLDER, (err, files) => {
    if (err) return;
    console.log(files)

    files.forEach(file => {
        var filepath = path.resolve(TESTFOLDER, file)
        var projek = utility.getPackageFromDirectory(filepath);
        var hasil = executeFileSync(projek ? path.join(projek.lokasi, "..", projek.script) : filepath)
        if (hasil.error) console.log(hasil.error.toString());
        testResults.push({ filepath, hasil })
    })

    console.log("========= TEST =========")
    testResults.forEach((test, i) => {
        console.log(i + 1 + ".", test.filepath, "\t", test.hasil.error ? chalk.red("Fail ❌") : chalk.green("Success ✔️"))
    })

});




//executeSync("print('hai')", "ae.gblk")
//const skrip = `print("Hello world")`
//runTerminal(skrip, "./indeks.gblk", {runArgs: {"timeout": 1000}}).then(console.log).catch(console.error)

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