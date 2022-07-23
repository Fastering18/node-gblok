const fs = require("fs");
const readline = require("readline")
const tar = require('tar')
const streamifier = require('streamifier');
const { unzipSync } = require('zlib');
const ProjekLib = require("./projek")
const warna = require("./warna");
const compiler = require("../main");

const path = require("path");
const chalk = require('chalk');
const ora = require('ora');

// some library used to modernify output

function safe_path(pth) {
    return path.join(require.main.path, pth)
}

function getCacheData() {
    const lok = safe_path("../config/cache.json")
    const content = fs.readFileSync(lok)
    return JSON.parse(content.toString())
}

function tanya(q, cb, rinput = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})) {
    rinput.question(q, cb)
}

function _putProjek(nama_projek, pth, rinput) {
    const spinner = ora('Creating file...').start()
    const dotAnim = setInterval(() => spinner.text = spinner.text.length >= 16 ? "Creating file" : spinner.text.length >= 15 ? "Creating file..." : spinner.text.length >= 14 ? "Creating file.." : "Creating file.", 200)
    const cwdFolder = path.join(process.cwd(), pth || ".");
    const contohPaket = require("./_contoh/paket.json");

    contohPaket.nama = nama_projek || "nama-module"
    fs.mkdirSync(cwdFolder, { recursive: true })
    //this.getPackageFromDirectory(cwdFolder)
    try {
        fs.writeFileSync(path.join(cwdFolder, "/module1.gblk"), fs.readFileSync(safe_path("../_contoh/module1.gblk")));
        fs.writeFileSync(path.join(cwdFolder, "/index.gblk"), fs.readFileSync(safe_path("../_contoh/index.gblk")));
        fs.writeFileSync(path.join(cwdFolder, "/paket.json"), JSON.stringify(contohPaket, null, 3));
        //console.log(`${warna.Hijau("Success created")} ${warna.Bold(pth)} ${warna.Hijau("file")} ✅`)
    } catch (err) {
        console.log(err);
        clearInterval(dotAnim)
        spinner.fail(`An exception happened during creating file, please report this bug \uD83D\uDE33`)
    } finally {
        if (rinput) rinput.close();
        if (spinner.isSpinning) setTimeout(() => { clearInterval(dotAnim); spinner.succeed(`Success created ${chalk.blue.bold(nama_projek || pth || "example")} project`) }, 100);
        //if (rinput) rinput.close();
    }
}

module.exports.runProjectAtauFile = function() {
    
}

module.exports.putExampleFile = function (pth, opt = {}) {
    if (opt.skip) return _putProjek(null, pth);

    const rinput = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })
    tanya("Apa nama projek nya? ", (txt) => _putProjek(txt, pth, rinput), rinput)
}

module.exports.getPackageFromDirectory = function (lokdir) {
    const paketlok = path.join(lokdir, "paket.json")

    //console.log("\n",projectdir, paketlok)
    var projectInfo;
    //console.log(paketlok)
    try {
        projectInfo = new ProjekLib.Projek(require(paketlok))
        projectInfo.lokasi = paketlok
    } catch (err) {
        //console.log(err)
        return null
    }
    //console.log(projectInfo.json)
    return projectInfo
}

module.exports.compressTar = function (pth = process.cwd(), out = ".", projek = path.basename(out)) {
    return new Promise((y, n) => {
        const fslist = fs.readdirSync(pth).filter(n => n != out && n != "gblk_modules")//.map(d => path.resolve(pth, d))
        //console.log(fslist, pth)
        tar.c({
            gzip: true,
            file: out,
            cwd: pth
            //C: projek
        },
            fslist
            //fs.readdirSync(pth).map(d => path.resolve(pth, d))
            //[pth]
        ).then(() => y())
    })
}

module.exports.uncompressTar = function (pth = ".", out = ".") {
    tar.x({
        file: pth,
        C: out
    }).then((b) => {
        //console.log(b)
    })
}

module.exports.installModule = async function (nama, versi, _lokd) {
    const cwdFolder = path.join(process.cwd(), _lokd || ".");
    const gblk_modules_dir = path.join(cwdFolder, "./gblk_modules")
    const projek_dir = path.join(gblk_modules_dir, nama)
    const projek_deskriptor = this.getPackageFromDirectory(cwdFolder)
    const spinner = ora(`Downloading ${chalk.blue.bold(nama)} module...`).start()

    var startTime = Date.now()

    if (!fs.existsSync(gblk_modules_dir)) fs.mkdirSync(gblk_modules_dir, { recursive: true });
    ProjekLib.downloadModule(nama, versi).then(d => {
        //console.log(d.data)
        spinner.info(`Module '${chalk.blue.bold(nama)}' downloaded`)
        spinner.text = "Extracting files..."
        if (!fs.existsSync(projek_dir)) fs.mkdirSync(projek_dir, {recursive: true});
        const trak = streamifier.createReadStream(unzipSync(d.data))
            .pipe(tar.x({ C: projek_dir}))
            .on("finish", () => {
                projek_deskriptor.tambahModule([nama, versi])
                spinner.succeed(`Success installed ${chalk.blue.bold(nama)} module ${chalk.white.bgBlack.bold("[⏳+" + ((Date.now() - startTime) / 1000).toFixed(3) + "s]")}`)
                //trak.end()
            })
    }).catch(e => {
        if (e.response) {
            spinner.fail(`Failed to install the module, ${JSON.parse(e.response.data.toString()).message}`)
        } else {
            if (e.statusText) spinner.fail(`Failed to install the module, ${e.statusText}`)
            else spinner.fail(e.message);
        }
        spinner.warn("If this is a bug, try updating node-gblk to 'latest'.")
    })
}

module.exports.publishModule = async function (lokdir) {
    const config = getCacheData()
    const lokdircwd = lokdir ? path.resolve(process.cwd(), lokdir) : process.cwd()
    if (!config["api_key"]) return console.log(`you haven't logined yet.\n> use command ${chalk.bold("gpm login")}`)

    const spinner = ora('Looking for project paket.json').start()
    const project = this.getPackageFromDirectory(lokdircwd)
    //console.log(project)
    if (!project) {
        spinner.fail(`No paket.json found in ${lokdircwd}`)
        return
    }

    const tarballNama = `${project.nama}-${project.versi}.tgz`

    console.log(`\n> Found project ${chalk.blue.bold(project.nama)}`)
    spinner.text = "Generating tarball project..."
    await this.compressTar(lokdircwd, tarballNama)
    console.log(`> Tarball ${chalk.green.bold(tarballNama)} generated`)

    spinner.text = "Uploading tarball to server..."
    project.upload(config["api_key"]).then(d => {
        console.log(d.data)
    }).catch(e => {
        console.log(e.response)
    }).finally(() => {
        spinner.succeed("idk")
    })
}