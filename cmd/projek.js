const contohPaket = require("./_contoh/paket.json")
const fs = require("fs")
const path = require("path")
const FormData = require('form-data');
const axios = require("axios")

class Projek {
    constructor({ lokasi, nama, versi, deskripsi, script, modules } = {}) {
        this.nama = nama || "nama-module"
        this.lokasi = lokasi
        this.versi = versi || "0.0.1"
        this.deskripsi = deskripsi || ""
        this.script = script
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

    upload(tokn) {
        const form = new FormData();
        form.append('file', fs.createReadStream(`${this.nama}-${this.versi}.tgz`));

        return axios({
            method: "post",
            url: "https://planetscaledb-testing.fastering181.repl.co/api/v1/new/package",
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
            modules: this.modules
        }
    }
}


module.exports = {
    Projek
}