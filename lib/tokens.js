/**
 * Class Token, subclass dri string karna gak sama kyk python
 */

class Token extends String {
	constructor(tipe_, value, posisi_awal, posisi_akhir) {
        super(tipe_)
		this.tipe = tipe_
		this.value = value

		if (posisi_awal) {
			this.posisi_awal = posisi_awal.salin()
			this.posisi_akhir = posisi_awal.salin()
			this.posisi_akhir.maju()
        }
		if (posisi_akhir) {
			this.posisi_akhir = posisi_akhir.salin()
        }
    }
    
	sama_dengan(tipe_, value) {
		return this.tipe == tipe_ && this.value == value
    }

    isi() {
        if (this.value) {
			return `${this.tipe}:${this.value}`
        }
		return `${this.tipe}`
    }
} 

module.exports = {
    Token
}