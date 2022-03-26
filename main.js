const { Lexer } = require("./src/lexer");
const { Parser } = require("./src/parser");
const { Interpreter, TabelSimbol, Konteks } = require("./src/interpreter");
const childProcess = require("child_process");
const TipeData = require("./lib/TipeData");
const fs = require("fs");
const path = require("path");
const { HasilRuntime } = require("./lib/Runtime");

// inti
var global_tabel_simbol = new TabelSimbol()
global_tabel_simbol.tulis("salah", TipeData.BooLean.salah)
global_tabel_simbol.tulis("benar", TipeData.BooLean.benar)
global_tabel_simbol.tulis("nil", TipeData.Angka.nil)
global_tabel_simbol.tulis("print", TipeData.BuiltInFungsi.tulis)
global_tabel_simbol.tulis("input", TipeData.BuiltInFungsi.input)
global_tabel_simbol.tulis("tunggu", TipeData.BuiltInFungsi.tunggu)
global_tabel_simbol.tulis("eval", TipeData.BuiltInFungsi.eval)
global_tabel_simbol.tulis("impor", TipeData.BuiltInFungsi.import)
global_tabel_simbol.tulis("proses", new TipeData.Objek({
    argumen: new TipeData.Daftar(process.argv.map(d=>new TipeData.Str(d))),
    mati: TipeData.BuiltInFungsi.mati,
    binding: TipeData.BuiltInFungsi.binding
}))

// module matematika
global_tabel_simbol.tulis("mtk", new TipeData.Objek({
    jumlah: TipeData.buatFungsi("penjumlahan", ["array_angka"], function penjumlahan(konteks) {
        var res = new HasilRuntime()
        let daftarAngka = konteks.TabelSimbol.dapat("array_angka")

        TipeData.assertTipe(res, daftarAngka, TipeData.Daftar, 1)
        if (res.harus_return()) return res;

        let jumlah = daftarAngka.nilai.reduce((a,b)=>a+b.nilai,0)
        return res.berhasil(new TipeData.Angka(jumlah))
    }),
    akar2: TipeData.buatFungsi("akar_kuadrat", ["angka"], function penjumlahan(konteks) {
        var res = new HasilRuntime()
        let angka = konteks.TabelSimbol.dapat("angka")

        TipeData.assertTipe(res, angka, TipeData.Angka, 1)
        if (res.harus_return()) return res;

        let jumlah = Math.sqrt(angka.nilai)
        return res.berhasil(new TipeData.Angka(jumlah))
    }),
    pangkat: TipeData.buatFungsi("pangkat2", ["angka", "pangkat"], function penjumlahan(konteks) {
        var res = new HasilRuntime()
        let angka = konteks.TabelSimbol.dapat("angka"),
            pangkat = konteks.TabelSimbol.dapat("pangkat");

        TipeData.assertTipe(res, angka, TipeData.Angka, 1)
        if (res.harus_return()) return res;
        TipeData.assertTipe(res, pangkat, TipeData.Angka, 2)
        if (res.harus_return()) return res;

        let jumlah = angka.nilai ** pangkat.nilai
        return res.berhasil(new TipeData.Angka(jumlah))
    })
}))

function buatKonteks(nkontek, lokasifile) {
    var konteks = new Konteks(typeof nkontek == "string" ? nkontek : "<program>")
    konteks.TabelSimbol = global_tabel_simbol
    konteks.lokasi = lokasifile
    return konteks
}

function terminal(shell, ...opts) {
    return new Promise((trima) => {
        childProcess.exec(shell, ...opts, (stderr, stdout, err) => {
            //console.log(stderr, stdout, err);
            return trima((stderr || stdout || err).toString());
        })
    })
}

function esekusiLangsung(script, nama_program) {
    const lex = new Lexer(typeof (nama_program) == "string" ? path.basename(nama_program) : "<stdin>", script)
    var { hasil, error } = lex.buatToken()
    if (error) return { error, hasil }

    hasil = new Parser(hasil).parse()
    if (hasil.error) return { error: hasil.error, hasil: null }

    var interpreter = new Interpreter()
    var konteks = buatKonteks("<main>", nama_program)
    hasil = interpreter.kunjungi(hasil.node, konteks)
    if (hasil.error) return { error: hasil.error, hasil: null }

    return { error: null, hasil: hasil }
}

function esekusiFile(fn) {
    if (!fs.existsSync(fn)) return Error("File tidak ditemukan");
    const isi = fs.readFileSync(fn).toString()
    const hasil = esekusiLangsung(isi, fn)
    return hasil
}
function esekusiFileTidakLangsung(fn) {
    return new Promise((trima, tolak) => {
        if (!fs.existsSync(fn)) return tolak(Error("File tidak ditemukan"))
        fs.readFile(fn, (err, isi) => {
            if (err) return tolak(err);
            return trima(esekusiLangsung(isi.toString(), fn))
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

const execute = async (script, cbAtauNama, cb) => {
    if (typeof (cbAtauNama) == "function") {
        const hasil = esekusiLangsung(script, typeof cb == "string" ? cb : "<stdin>");
        //if (hasil.error) return cb({ error: hasil.error, hasil: null })
        return cbAtauNama(hasil)
    } else if (typeof (cbAtauNama) == "string" && typeof (cb) != "function") {
        return new Promise((trima, tolak) => {
            const hasil = esekusiLangsung(script, typeof cb == "string" ? cb : "<stdin>")
            if (hasil.error) return tolak(hasil.error);
            return trima(hasil);
        })
    } else if (typeof (cbAtauNama) == "string" && typeof (cb) == "function") {
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
    return new Promise((y, n) => fs.writeFile(path, konten, (err) => { if (err) n(err); y() }))//terminal(`echo "${konten}" > ${path}`)
}

function runTerminal(script, path = "./index.gblk", opt = {}) {
    return new Promise((trima, tolak) => {
        buatFile(path, script).then(() => {
            terminal(`${opt.npx ? "npx " : ""}gblok run ${path} ${opt.waktu == false ? "--tanpa waktu" : ""}`, opt.runArgs || {}).then(out => {
                terminal(`rm ${path}`);
                return trima(out)
            }).catch(tolak)
        })
    })
}

function REPLMode(readlineInterface, { xKonteks = buatKonteks(), xInterpreter = new Interpreter() } = {}) {
    //if (!xKonteks) xKonteks = buatKonteks();
    readlineInterface.question("gblk> ", function (script) {
        const lex = new Lexer("<stdin>", script.toString())
        const tokens = lex.buatToken()
        if (tokens.error) return repeatREPL({readlineInterface, xKonteks, xInterpreter, hasil: tokens})

        const nodes = new Parser(tokens.hasil).parse()
        if (nodes.error) return repeatREPL({readlineInterface, xKonteks, xInterpreter, hasil: nodes})

        const hasil = xInterpreter.kunjungi(nodes.node, xKonteks)
        return repeatREPL({readlineInterface, xKonteks, xInterpreter, hasil})

        //return 
    })
}

function repeatREPL({readlineInterface, xKonteks, xInterpreter, hasil}) {
    if (hasil.err || hasil.error) console.log((hasil.err || hasil.error).toString())
    return REPLMode(readlineInterface, {xKonteks, xInterpreter})
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
    REPLMode,
    dataType: TipeData,
    globalSymbolTable: global_tabel_simbol
}