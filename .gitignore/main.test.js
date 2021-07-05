const { inspect } = require("util")
const { Lexer } = require("./src/lexer")
const { Parser } = require("./src/parser")
const { Interpreter, TabelSimbol, Konteks } = require("./src/interpreter")
const { BooLean } = require("./lib/TipeData")
const { executeFileSync, executeSync, runTerminal } = require("./main")

//var hasil = executeFileSync("./test/index.gblk")
//if (hasil.error) console.log(hasil.error.toString());

//executeSync("print('hai')", "ae.gblk")
const skrip = "print('tes')"
runTerminal(skrip, "./indeks.gblk").then(console.log)

/*const lex = new Lexer("<program>", "benar == benarr")
var {hasil, err} = lex.buatToken()
if (err) console.log(err.toString());

const parser = new Parser(hasil)
hasil = parser.parse()
if (hasil.error) console.log(hasil.error.toString());

var global_tabel_simbol = new TabelSimbol()
global_tabel_simbol.tulis("salah", BooLean.salah)
global_tabel_simbol.tulis("benar", BooLean.benar)

var interpreter = new Interpreter()
var konteks = new Konteks("<program>")
konteks.TabelSimbol = global_tabel_simbol
hasil = interpreter.kunjungi(hasil.node, konteks)

if (hasil.error) console.log(hasil.error.toString())
console.log(hasil.value)*/