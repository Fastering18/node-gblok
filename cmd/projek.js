const contohPaket = require("./_contoh/paket.json");
const fs = require("fs");
const path = require("path");
const FormData = require('form-data');
const axios = require("axios");
const util = require("util")
const enumItems = require("../lib/enums")

class Projek {
    constructor({ lokasi, nama, versi, deskripsi, script, lisensi, author, modules } = {}) {
        this.nama = nama || "nama-module"
        this.lokasi = lokasi
        this.versi = versi || "0.0.1"
        this.deskripsi = deskripsi || ""
        this.script = script
        this.lisensi = lisensi || "MIT"
        this.author = author
        this.modules = modules || {}
    }

    update() {
        return fs.writeFileSync(this.lokasi, this.json)
    }

    gantiNama(xNama) {
        this.nama = xNama
        this.update()
    }

    gantiVersi(v) {
        this.versi = v
        this.update()
    }

    gantiDeskripsi(des) {
        this.deskripsi = des
        this.update()
    }

    gantiScript(xScript) {
        this.script = xScript
        this.update()
    }

    tambahModule([nama, versi]) {
        this.modules[nama] = versi
        this.update()
    }

    buatProjek() {

    }

    upload(tokn, baseURL = enumItems.PKGManager.baseURL) {
        const form = new FormData();
        form.append('file', fs.createReadStream(`${this.nama}-${this.versi}.tgz`));

        return axios({
            method: "post",
            url: `${baseURL}${enumItems.PKGManager.publishPackageURL}`,
            data: form,
            headers: { ...form.getHeaders(), Authorization: tokn }
        })
    }

    get json() {
        return JSON.stringify(this.objek, null, 3)
    }

    get objek() {
        return {
            nama: this.nama,
            versi: this.versi,
            deskripsi: this.deskripsi,
            script: this.script,
            lisensi: this.lisensi,
            author: this.author,
            modules: this.modules
        }
    }
}

function downloadModule(nama, versi) {
    return axios({
        method: "GET",
        responseType: "arraybuffer", //'arraybuffer',
        url: `${enumItems.PKGManager.baseURL}${util.format(enumItems.PKGManager.installPackageURL, nama, versi)}`,
    })
}

function getPackageFromDirectory(lokdir) {
    const paketlok = path.join(lokdir, "paket.json")

    //console.log("\n",projectdir, paketlok)
    var projectInfo;
    //console.log(paketlok)
    try {
        projectInfo = new Projek(require(paketlok))
        projectInfo.lokasi = paketlok
    } catch (err) {
        //console.log(err)
        return null
    }
    //console.log(projectInfo.json)
    return projectInfo
}

module.exports = {
    Projek,
    downloadModule,
    getPackageFromDirectory
}