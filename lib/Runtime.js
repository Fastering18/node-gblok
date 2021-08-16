class HasilRuntime {
	constructor() {
		this.reset()
    }
	
	reset() {
		this.value = null;
		this.error = null;
		Object.defineProperty(this, "isi_returned_fungsi", {
			value: null, enumerable: false, writable: true
		});
		Object.defineProperty(this, "loop_lanjutkan", {
			value: false, enumerable: false, writable: true
		});
		Object.defineProperty(this, "loop_break", {
			value: false, enumerable: false, writable: true
		});
		Object.defineProperty(this, "modules", {
			value: null, enumerable: true, writable: true
		});
    }

	daftar(res) {
		this.error = res.error
		this.isi_returned_fungsi = res.isi_returned_fungsi
		this.modules = res.modules
		this.loop_lanjutkan = res.loop_lanjutkan
		this.loop_break = res.loop_break
		return res.value
    }

	berhasil(hasil) {
		this.reset()
		this.value = hasil
		return this
    }

	berhasil_return(hasil) {
		this.reset()
		this.isi_returned_fungsi = hasil
		return this
    }

	berhasil_return_module(hasil) {
		this.reset()
		this.modules = hasil
		return this
	}

	berhasil_lanjutkan() {
		this.reset()
		this.loop_lanjutkan = true
		return this
    }

	berhasil_break() {
		this.reset()
		this.loop_break = true
		return this
    }

	gagal(error) {
		this.reset()
		this.error = error
		return this
    }

	harus_return() {
		return this.error || this.modules || this.isi_returned_fungsi || this.loop_lanjutkan || this.loop_break
    }
}

// Konteks
class Konteks {
	constructor(display_nama, induk, posisi_urutan_induk, lokasi) {
		this.display_nama = display_nama
		this.induk = induk
		this.posisi_urutan_induk = posisi_urutan_induk
		this.lokasi = lokasi
		this.TabelSimbol = null
	}
}

// Table Symbol / Symbol table, penyimpanan data-variabel
class TabelSimbol {
	constructor(induk) {
		this.simbol = {}
		this.induk = induk
	}

	dapat(nama) {
		var isi = this.simbol[nama]
		if (!isi && this.induk) return this.induk.dapat(nama)
		return isi
	}

	tulis(nama, isi, edit = false) {
		if (edit && !this.simbol[nama] && this.induk) {
            this.induk.tulis(nama, isi, edit)
		} else {
		    this.simbol[nama] = isi
		}
	}

	hapus(nama) {
		delete this.simbol[nama]
	}
}

module.exports = {
	HasilRuntime,
	Konteks,
	TabelSimbol
}