class Posisi {
	constructor(indeks, baris, kolom, namafile, fileteks) {
		this.indeks = indeks
		this.baris = baris
		this.kolom = kolom
		this.namafile = namafile
		this.fileteks = fileteks
    }

	maju(karakterSkrg=null) {
		this.indeks += 1
		this.kolom += 1

		if (karakterSkrg == "\n") {
			this.baris += 1
			this.kolom = 0
        }

		return this
    }

    mundur(karakterSkrg=null) {
        this.indeks -= 1
		this.kolom -= 1

        if (karakterSkrg == "\n" || karakterSkrg == "\r") {
			this.baris -= 1
			this.kolom = 0
        }
    }
    
	salin() {
		return new Posisi(this.indeks, this.baris, this.kolom, this.namafile, this.fileteks)
    }
}

module.exports = {
    Posisi
}