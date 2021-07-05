class HasilParse {
	constructor() {
		this.error = null
		this.node = null
		this.jumlah_kemajuan_terdaftar = 0
		this.jumlah_maju = 0
		this.perhitungan_balik = 0
    }

	daftar_kemajuan() {
		this.jumlah_kemajuan_terdaftar = 1
		this.jumlah_maju += 1
    }

	daftar(hasil) {
		this.jumlah_kemajuan_terdaftar = hasil.jumlah_maju
		this.jumlah_maju += hasil.jumlah_maju
		if (hasil.error) this.error = hasil.error;
		return hasil.node
    }
	
	coba_daftar(hasil) {
		if (hasil.error) {
			this.perhitungan_balik = hasil.jumlah_maju
			return null;
        }
		return this.daftar(hasil)
    }

	berhasil(node) {
		this.node = node
		return this
    }

	gagal(error) {
		if (!this.error || this.jumlah_kemajuan_terdaftar == 0) this.error = error;
		return this
    }
}


module.exports = {
    HasilParse
}