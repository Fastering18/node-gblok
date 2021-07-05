const { Lexer } = require("./src/lexer");
const { Parser } = require("./src/parser");
const { Interpreter, TabelSimbol, Konteks } = require("./src/interpreter");
const childProcess = require("child_process");
const TipeData = require("./lib/TipeData");
const fs = require("fs");
const path = require("path")

var global_tabel_simbol = new TabelSimbol()
global_tabel_simbol.tulis("salah", TipeData.BooLean.salah)
global_tabel_simbol.tulis("benar", TipeData.BooLean.benar)
global_tabel_simbol.tulis("print", TipeData.BuiltInFungsi.tulis)

function terminal(shell) {
    return new Promise((trima) => {
        childProcess.exec(shell, (stderr,stdout,err)=>{
            //console.log(stderr, stdout, err);
            return trima((stderr||stdout||err).toString());
        })
    })
}

function esekusiLangsung(script, nama_program) {
    const lex = new Lexer(typeof(nama_program) == "string" ? path.basename(nama_program) : "<stdin>", script)
    var { hasil, err } = lex.buatToken()
    if (err) return { error: err, hasil: null }

    hasil = new Parser(hasil).parse()
    if (hasil.error) return { error: hasil.error, hasil: null }

    var interpreter = new Interpreter()
    var konteks = new Konteks("<program>")
    konteks.TabelSimbol = global_tabel_simbol
    hasil = interpreter.kunjungi(hasil.node, konteks)
    if (hasil.error) return { error: hasil.error, hasil: null }

    return { error: null, hasil: hasil }
}

function esekusiFile(fn) {
    if (!fs.existsSync(fn)) return Error("File tidak ditemukan");
    const isi = fs.readFileSync(fn).toString()
    const hasil = esekusiLangsung(isi, path.basename(fn))
    return hasil
}
function esekusiFileTidakLangsung(fn) {
    return new Promise((trima, tolak) => {
        if (!fs.existsSync(fn)) return tolak(Error("File tidak ditemukan"))
        fs.readFile(fn, (err, isi) => {
            if (err) return tolak(err);
            return trima(esekusiLangsung(isi.toString(), path.basename(fn)))
        })
    })
}

const executeFile = async (fn, cb) => {
    if (cb) {
        const hasil = esekusiFileTidakLangsung(fn).then(cb).catch(cb)
        //if (hasil.error) return cb({ error: hasil.error, hasil: null })
        //return cb(hasil)
    } else {
        return new Promise((trima, tolak) => {
            esekusiFileTidakLangsung(fn).then(hasil => {
                if (hasil.error) return tolak(hasil.error);
                return trima(hasil);
            }).catch(tolak)
        })
    }
}

const execute = async(script, cbAtauNama, cb) => {
    if (typeof(cbAtauNama) == "function") {
        const hasil = esekusiLangsung(script, typeof cb == "string" ? cb : "<stdin>");
        //if (hasil.error) return cb({ error: hasil.error, hasil: null })
        return cbAtauNama(hasil)
    } else if (typeof(cbAtauNama) == "string" && typeof(cb) != "function") {
        return new Promise((trima, tolak) => {
            const hasil = esekusiLangsung(script, typeof cb == "string" ? cb : "<stdin>")
            if (hasil.error) return tolak(hasil.error);
            return trima(hasil);
        })
    } else if (typeof(cbAtauNama) == "string" && typeof(cb) == "function") {
        const hasil = esekusiLangsung(script, cbAtauNama);
        return cb(hasil)
    } else {
        return new Promise((trima, tolak) => {
            const hasil = esekusiLangsung(script)
            if (hasil.error) return tolak(hasil.error);
            return trima(hasil);
        })
    }
}

async function buatFile(path, konten) {
    return terminal(`echo ${konten} > ${path}`)
}

function runTerminal(script, path="./index.gblk") {
    return new Promise((trima, tolak) => {
    buatFile(path, script).then(() => {
        terminal(`gblok run ${path} --tanpa waktu`).then(out => {
            terminal(`rm ${path}`);
            return trima(out)
        }).catch(tolak)
    })
    })
}


module.exports = {
    Lexer,
    Parser,
    Interpreter,
    Konteks,
    TabelSimbol,
    executeFile,
    executeFileSync: esekusiFile,
    execute,
    executeSync: esekusiLangsung,
    runTerminal: runTerminal,
    dataType: TipeData,
    globalSymbolTable: global_tabel_simbol
}