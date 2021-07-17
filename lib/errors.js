const { panaherror } = require("./PanahError")

class Error extends String {
	constructor(posisi_awal, posisi_akhir, nama, detail) {
        super(`${nama}: ${detail}`)
		this.posisi_awal = posisi_awal
		this.posisi_akhir = posisi_akhir
		this.nama_error = nama
		this.details = detail
    }

	toString() {
		var string_error = `${this.nama_error}: ${this.details}`
		string_error += (
			`\nFile ${this.posisi_awal.namafile}, baris ${this.posisi_awal.baris + 1}`
		)
		string_error += "\n\n" + panaherror(
			this.posisi_awal.fileteks, this.posisi_awal, this.posisi_akhir
		)
		return string_error
    }
}
Error.prototype.jadiString = Error.prototype.toString

class KarakterSalah extends Error {
    constructor(posisi_awal, posisi_akhir, detail) {
        super(posisi_awal, posisi_akhir, "Kesalahan Karakter", detail)
    }
}
class KarakterYangDibutuhkan extends Error {
    constructor(posisi_awal, posisi_akhir, detail) {
        super(posisi_awal, posisi_akhir, "Dibutuhkan Karakter", detail)
    }
}
class SintaksSalah extends Error {
    constructor(posisi_awal, posisi_akhir, detail) {
        super(posisi_awal, posisi_akhir, "Kesalahan Syntax", detail)
    }
}

class RTError extends Error {
	constructor(posisi_awal, posisi_akhir, detail, konteks) {
		super(posisi_awal, posisi_akhir, "Runtime Error", detail)
		this.konteks = konteks
    }

	toString() {
		//console.log(this.details)
		var hasil_error = this.buat_traceback()
		hasil_error += `${this.nama_error}: ${this.details}`
		hasil_error += "\n\n" + panaherror(
			this.posisi_awal.fileteks, this.posisi_awal, this.posisi_akhir
		)
		return hasil_error
    }

	buat_traceback() {
		var hasil = ""
		var konteks = this.konteks

		while (konteks) {
			hasil = `  File ${this.posisi_awal.namafile}, baris ${this.posisi_awal.baris + 1}, di ${konteks.display_nama}\n` + hasil
			konteks = konteks.induk
        }

		return "Traceback (panggilan fungsi terakhir):\n" + hasil
    }
}
RTError.prototype.jadiString = RTError.prototype.toString

module.exports = {
    Error,
    KarakterSalah,
    KarakterYangDibutuhkan,
    SintaksSalah,
    RTError
}