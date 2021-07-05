/**
 * lexer class, scan teks dan split jadi array lalu loop
 */

const {
    TokenInteger,
    TokenFloat,
    TokenString,
    TokenIdentifier,
    TokenKeyword,
    TokenTambah,
    TokenKurang,
    TokenKali,
    TokenBagi,
    TokenPangkat,
    TokenModulo,
    TokenParentesisKiri,
    TokenParentesisKanan,
    TokenKotakKiri,
    TokenKotakKanan,
    TokenSama,
    TokenSamaSama,
    TokenTidakSama,
    TokenKurangDari,
    TokenLebihDari,
    TokenKurangAtauSama,
    TokenLebihAtauSama,
    TokenKoma,
    TokenPanah,
    TokenLineBaru,
    TokenKotakIndeksKiri,
    TokenKotakIndeksKanan,
    TokenTitikIndeks,
    TokenEOF,
    Konstruktor
} = require("../lib/enums")

const { KarakterSalah, KarakterYangDibutuhkan } = require("../lib/errors");
const { Token } = require("../lib/tokens");
const { Posisi } = require("../lib/posisi");
const { DigitString, HurufString, hurufdigitgabung, DaftarEscapeKarakter } = require("../regexp.js")

class Lexer {
    constructor(nama_file, teks) {
        this.teks = teks
        this.posisi = new Posisi(-1, 0, -1, nama_file, teks)
        this.namafile = nama_file
        this.karakterSkrg = null
        this.maju()
    }

    maju() {
        this.posisi.maju(this.karakterSkrg)
        this.karakterSkrg = this.posisi.indeks < this.teks.length ? this.teks[this.posisi.indeks] : null;
    }

    mundur() {
        this.posisi.mundur(this.karakterSkrg)
        this.karakterSkrg = this.posisi.indeks < this.teks.length ? this.teks[this.posisi.indeks] : null;
    }

    buatToken(sampai) {
        var tokens = []
        //var karakter = this.karakterSkrg;
        while (this.karakterSkrg) {
            if ((" \t").includes(this.karakterSkrg)) {
                this.maju()
            } else if ((";\n\r").includes(this.karakterSkrg)) {
                tokens.push(new Token(TokenLineBaru, this.karakterSkrg, this.posisi))
                this.maju()
            } else if (DigitString.includes(this.karakterSkrg)) {
                tokens.push(this._buatAngka())
            } else if (HurufString.includes(this.karakterSkrg.toLowerCase())) {
                tokens.push(this._daftarlokal(tokens))
            } else if ('"\''.includes(this.karakterSkrg)) {
                tokens.push(this._buatString())
            } else if (this.karakterSkrg == "+") {
                tokens.push(new Token(TokenTambah, null, this.posisi))
                this.maju()
            } else if (this.karakterSkrg == "-") {
                const minusorpanah = this.buat_minus_atau_panah_atau_komentar();
                if (minusorpanah.token instanceof Token) {
                    tokens.push(minusorpanah.token)
                } else if (minusorpanah.error) {
                    return {hasil: null, err: minusorpanah.error}
                }
            } else if (this.karakterSkrg == "*") {
                tokens.push(new Token(TokenKali, null, this.posisi))
                this.maju()
            } else if (this.karakterSkrg == "/") {
                tokens.push(new Token(TokenBagi, null, this.posisi))
                this.maju()
            } else if (this.karakterSkrg == "^") {
                tokens.push(new Token(TokenPangkat, null, this.posisi))
                this.maju()
            } else if (this.karakterSkrg == "%") {
                tokens.push(new Token(TokenModulo, null, this.posisi))
                this.maju()
            } else if (this.karakterSkrg == "(") {
                tokens.push(new Token(TokenParentesisKiri, null, this.posisi))
                this.maju()
            } else if (this.karakterSkrg == ")") {
                tokens.push(new Token(TokenParentesisKanan, null, this.posisi))
                this.maju()
            } else if (this.karakterSkrg == "[") {
                tokens.push(new Token(TokenKotakKiri, null, this.posisi))
                this.maju()
            } else if (this.karakterSkrg == "]") {
                tokens.push(new Token(TokenKotakKanan, null, this.posisi))
                this.maju()
            } else if (this.karakterSkrg == "!") {
                var {token, error} = this.buat_tidak_sama()
                if (error) return [], error
                tokens.push(token)
            } else if (this.karakterSkrg == "=") {
                tokens.push(this.buat_kesamaan())
            } else if (this.karakterSkrg == ">") {
                tokens.push(this.buat_lebih_dari())
            } else if (this.karakterSkrg == "<") {
                tokens.push(this.buat_kurang_dari())
            } else if (this.karakterSkrg == ",") {
                tokens.push(new Token(TokenKoma, null, this.posisi))
                this.maju()
            /*} else if (this.karakterSkrg == ".") {
                tokens.push(new Token(TokenTitikIndeks, null, this.posisi))
                this.maju()*/
            } else {
                var posisi_awal = this.posisi.salin()
                var karakter = this.karakterSkrg
                this.maju()
                console.log(karakter)
                return {hasil: null, err: new KarakterSalah(posisi_awal, this.posisi, '"' + karakter + '"')}
            }
        }

        tokens.push(new Token(TokenEOF, null, this.posisi))
        return {hasil: tokens, err: null}//, null
    }

    _buatAngka() {
        var angkaString = ""
		var ada_titik = false
		var ada_e = false
		var posisi_awal = this.posisi.salin()

		while (this.karakterSkrg && (DigitString + ".e").includes(this.karakterSkrg)) {
			if (this.karakterSkrg == "e") {
				if (ada_e) break;
				ada_e = true;
            } else if (this.karakterSkrg == ".") {
				if (ada_titik) break;
				ada_titik = true;
			} 
			angkaString += this.karakterSkrg;
            
			this.maju()
        }

		if (!ada_titik) {
			return new Token(TokenInteger, Number(angkaString), posisi_awal, this.posisi)
        } else {
			return new Token(TokenFloat, Number(angkaString), posisi_awal, this.posisi)
        }
    }

    _buatString() {
        var str = ""
		var konstruktor = this.karakterSkrg
		var posisi_awal = this.posisi.salin()
		var escape_karakter = false
		this.maju()

        //DaftarEscapeKarakter
        while (this.karakterSkrg && (this.karakterSkrg != konstruktor || escape_karakter)) {
            if (escape_karakter) {
                str += DaftarEscapeKarakter[this.karakterSkrg] || this.karakterSkrg
                escape_karakter = false
            } else {
                if (this.karakterSkrg == "\\") {
					escape_karakter = true
				} else {
					str += this.karakterSkrg
                }
            }
            this.maju()
        }

        this.maju()
		return new Token(TokenString, str, posisi_awal, this.posisi)
    }

    _daftarlokal(tokens) {
        var identitas_string = "" // i.e nama variabel / keywords
		var posisi_awal = this.posisi.salin()

        while (this.karakterSkrg && (hurufdigitgabung + "_").includes(this.karakterSkrg.toLowerCase())) {
			identitas_string += this.karakterSkrg;
			this.maju()
        }

		var tipe_token = Konstruktor.includes(identitas_string) ? TokenKeyword : TokenIdentifier //TokenKeyword if identitas_string in Konstruktor else TokenIdentifier
		
        //while (" \t".includes(this.karakterSkrg)) this.maju();
        
        /*if (tipe_token == TokenIdentifier && this.karakterSkrg == "[") {
            console.log(this.karakterSkrg)
            tokens.push(TokenKotakIndeksKiri)
        }*/

		return new Token(tipe_token, identitas_string, posisi_awal, this.posisi)
    }

    buat_minus_atau_panah_atau_komentar() {
        var tipe_token = TokenKurang
		var posisi_awal = this.posisi.salin()
		this.maju()

        if (this.karakterSkrg == ">" ) {
			this.maju()
			tipe_token = TokenPanah
        } else if (this.karakterSkrg == "-") {
			const {error} = this.skip_komentar()
			if (error) return {token: null, error}
            return {}
        }

		return {token: new Token(tipe_token, posisi_awal, this.posisi), error: null}
    }

    buat_tidak_sama() {
        var posisi_awal = this.posisi.salin()
		this.maju()

		if (this.karakterSkrg == "=") {
			this.maju()
            return {token: new Token(TokenTidakSama, posisi_awal, this.posisi), error: null}
        }

        this.maju()
        return {token: null, error: KarakterYangDibutuhkan(posisi_awal, this.posisi, "'=' (setelah '!') operator")}
    }

    buat_kesamaan() {
        var tipe_token = TokenSama
		var posisi_awal = this.posisi.salin()
		this.maju()

		if (this.karakterSkrg == "=") {
			this.maju()
			tipe_token = TokenSamaSama
        }

		return new Token(tipe_token, null, posisi_awal, this.posisi)
    }

    buat_kurang_dari() {
        var tipe_token = TokenKurangDari
		var posisi_awal = this.posisi.salin()
		this.maju()

		if (this.karakterSkrg == "=") {
			this.maju()
			tipe_token = TokenKurangAtauSama
        }

		return new Token(tipe_token, null, posisi_awal, this.posisi)
    }

    buat_lebih_dari() {
        var tipe_token = TokenLebihDari
		var posisi_awal = this.posisi.salin()
		this.maju()

		if (this.karakterSkrg == "=") {
			this.maju()
			tipe_token = TokenLebihAtauSama
        }

		return new Token(tipe_token, null, posisi_awal, this.posisi)
    }

    skip_komentar() {
        var komen_blok = false
		var posisi_awal = this.posisi.salin()
		this.maju()

		if (this.karakterSkrg == "[") {
			komen_blok = true
			this.maju()
			if (this.karakterSkrg == "[") {
				while (this.karakterSkrg != ']' && this.karakterSkrg) this.maju();
				this.maju()
				if (this.karakterSkrg != "]") {
					return {token: null, error: KarakterYangDibutuhkan(
						posisi_awal, this.posisi, "Dibutuhkan ']'"
					)}
                }
            }
        } else {
			while (this.karakterSkrg != '\n' && this.karakterSkrg) this.maju();
        }
		this.maju()
        return {token: null, error: null}
    }
}

module.exports = {
    Lexer
};