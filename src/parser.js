/**
 * Parser class, loop token dari lexer jadi lebih mendalam
 * return array intruksi buat class interpreter nanti
 */

const {
    NodeAngka,
    NodeString,
    NodeOperasiBinary,
    NodeOperatorMinus,
    DaftarNode,
    NodeAksesVariabel,
    NodeBuatVariabel,
    NodeEditVariabel,
    NodeIndeks,
    NodeIF,
    NodeFor,
    NodeWhile,
    NodeBuatFungsi,
    NodePanggil,
    NodeReturn,
    NodeLanjutkan,
    NodeBerhenti,
    NodeTernary,
    NodeCoba,
    ObjekNode,
    NodeEkspor,
    NodeKelas
} = require("../lib/nodes");
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
    TokenEOF,
    Konstruktor,
    TokenTernary,
    TokenTernaryBagi,
    TokenTitikIndeks,
    TokenXOR,
    TokenKurungKurawaKiri,
    TokenKurungKurawaKanan
} = require("../lib/enums");
const { SintaksSalah } = require("../lib/errors");
const { HasilParse } = require("../lib/HasilParse");

class Parser {
    constructor(tokens) {
        this.tokens = tokens
        this.token_indeks = -1
        this.maju()
    }

    maju() {
        this.token_indeks += 1
        this.perbarui_tokenSkrg()
        return this.tokenSkrg
    }

    balik(jumlah = 1) {
        this.token_indeks -= jumlah
        this.perbarui_tokenSkrg()
        return this.tokenSkrg
    }

    perbarui_tokenSkrg() {
        if (this.token_indeks >= 0 && this.token_indeks < this.tokens.length) {
            this.tokenSkrg = this.tokens[this.token_indeks]
        }
    }

    parse() {
        var res = this.statements()
        if (!res.error && this.tokenSkrg.tipe != TokenEOF) {
            return res.gagal(
                new SintaksSalah(
                    this.tokenSkrg.posisi_awal,
                    this.tokenSkrg.posisi_akhir,
                    "Akhir input yang tidak terduga", //Harus berupa sintaks '+', '-', '*', '/', '^', '%'
                )
            )
        }
        return res
    }

    statements() {
        var res = new HasilParse()
        var statements = []
        var posisi_awal = this.tokenSkrg.posisi_awal.salin()

        while (this.tokenSkrg.tipe == TokenLineBaru) {
            res.daftar_kemajuan()
            this.maju()
        }

        var statement = res.daftar(this.statement())
        if (res.error) return res;
        statements.push(statement)

        var statements_lebih = true

        while (true) {
            var jumlah_newline = 0
            while (this.tokenSkrg.tipe == TokenLineBaru) {
                res.daftar_kemajuan()
                this.maju()
                jumlah_newline += 1
            }
            if (jumlah_newline == 0) statements_lebih = false

            if (!statements_lebih) break;
            var statement = res.coba_daftar(this.statement())
            if (!statement) {
                //console.log(xstatmnt.error.details, xstatmnt.error.posisi_awal.indeks,  xstatmnt.error.posisi_akhir.indeks)
                this.balik(res.perhitungan_balik)
                statements_lebih = false
                continue
            }
            statements.push(statement)
        }

        return res.berhasil(new DaftarNode(
            statements,
            posisi_awal,
            this.tokenSkrg.posisi_akhir.salin()
        ))
    }

    statement() {
        var res = new HasilParse()
        var posisi_awal = this.tokenSkrg.posisi_awal.salin()

        if (this.tokenSkrg.sama_dengan(TokenKeyword, "kembali")) {
            res.daftar_kemajuan()
            this.maju()

            var expr = res.coba_daftar(this.expr())
            if (!expr) this.balik(res.perhitungan_balik)
            return res.berhasil(new NodeReturn(expr, posisi_awal, this.tokenSkrg.posisi_awal.salin()))
        }

        if (this.tokenSkrg.sama_dengan(TokenKeyword, "ekspor")) {
            res.daftar_kemajuan()
            this.maju()

            var expr = res.coba_daftar(this.expr())
            if (!expr) this.balik(res.perhitungan_balik)
            return res.berhasil(new NodeEkspor(expr, posisi_awal, this.tokenSkrg.posisi_awal.salin()))
        }

        if (this.tokenSkrg.sama_dengan(TokenKeyword, "lanjutkan")) {
            res.daftar_kemajuan()
            this.maju()
            return res.berhasil(new NodeLanjutkan(posisi_awal, this.tokenSkrg.posisi_awal.salin()))
        }

        if (this.tokenSkrg.sama_dengan(TokenKeyword, "berhenti")) {
            res.daftar_kemajuan()
            this.maju()
            return res.berhasil(new NodeBerhenti(posisi_awal, this.tokenSkrg.posisi_awal.salin()))
        }

        var expr = res.daftar(this.expr())
        if (res.error)
            return res.gagal(
                res.error || new SintaksSalah(
                    this.tokenSkrg.posisi_awal,
                    this.tokenSkrg.posisi_akhir,
                    res.error.details
                    || "Harus memiliki lanjutkan, kembali, berhenti, int, float, lokal, '+', '-' atau parentesis",
                )
            )

        return res.berhasil(expr)
    }

    expr() {
        var res = new HasilParse()

        if (this.tokenSkrg.sama_dengan(TokenKeyword, "lokal")) {
            res.daftar_kemajuan()
            this.maju()

            if (this.tokenSkrg.tipe != TokenIdentifier) {
                return res.gagal(
                    new SintaksSalah(
                        this.tokenSkrg.posisi_awal,
                        this.tokenSkrg.posisi_akhir,
                        "Harus memiliki nama variabel",
                    )
                )
            }

            var nama_variabel = this.tokenSkrg
            res.daftar_kemajuan()
            this.maju()

            if (this.tokenSkrg.tipe != TokenSama) {
                return res.gagal(
                    new SintaksSalah(
                        this.tokenSkrg.posisi_awal,
                        this.tokenSkrg.posisi_akhir,
                        "Harus memiliki '=' untuk mendeklarasikan variabel",
                    )
                )
            }

            res.daftar_kemajuan()
            this.maju()
            var expr = res.daftar(this.expr())
            if (res.error) return res
            return res.berhasil(new NodeBuatVariabel(nama_variabel, expr))
        }

        var node = res.daftar(
            this.binary_operator(
                "perbandingan_expr", [[TokenKeyword, "dan"], [TokenKeyword, "atau"]]
            )
        )

        if (res.error)
            return res.gagal(
                res.error || new SintaksSalah(
                    this.tokenSkrg.posisi_awal,
                    this.tokenSkrg.posisi_akhir,
                    res.error.details
                    || "Harus memiliki int, float, lokal, '+', '-' atau parentesis",
                )
            )

        return res.berhasil(node)
    }

    skip_nl() {
        while (this.tokenSkrg.tipe == TokenLineBaru)
            this.maju()
    }

    binary_operator(fungsiA, option, fungsiB) {
        if (!fungsiB) fungsiB = fungsiA;

        var hasil = new HasilParse()
        var kiri = hasil.daftar(this[fungsiA]())
        if (hasil.error) return hasil;

        /*typeof(e) == "array" ? e.includes(this.tokenSkrg.tipe) : e == this.tokenSkrg.tipe*/
        /*option.find((e) => typeof (e) == "array" ? e[0] == this.tokenSkrg.tipe : e == this.tokenSkrg.tipe)*/
        while (option.includes(this.tokenSkrg.tipe) || option.find((e) => e[0] == this.tokenSkrg.tipe && e[1] == this.tokenSkrg.value)) {
            var operator_token = this.tokenSkrg
            hasil.daftar_kemajuan()
            this.maju()
            //console.log(fungsiB,operator_token)
            var kanan = hasil.daftar(this[fungsiB]())
            if (hasil.error) return hasil
            kiri = new NodeOperasiBinary(kiri, operator_token, kanan)
            //console.log(operator_token.tipe)
        }
        return hasil.berhasil(kiri)
    }

    perbandingan_expr() {
        var res = new HasilParse()

        if (this.tokenSkrg.sama_dengan(TokenKeyword, "bukan")) {
            var operator_token = this.tokenSkrg
            res.daftar_kemajuan()
            this.maju()

            var node = res.daftar(this.perbandingan_expr())
            if (res.error) return res;
            return res.berhasil(new NodeOperatorMinus(operator_token, node))
        }
        var node = res.daftar(
            this.binary_operator(
                "arith_expr",
                [
                    TokenSamaSama,
                    TokenTidakSama,
                    TokenKurangDari,
                    TokenLebihDari,
                    TokenKurangAtauSama,
                    TokenLebihAtauSama,
                    TokenPanah
                ]
            )
        )

        if (res.error)
            return res.gagal(
                res.error
                || new SintaksSalah(
                    this.tokenSkrg.posisi_awal,
                    this.tokenSkrg.posisi_akhir,
                    "Harus memiliki int, float, lokal, '+', '-', 'bukan', atau parentesis",
                )
            )

        return res.berhasil(node)
    }

    arith_expr() {
        return this.binary_operator("term", [TokenTambah, TokenKurang])
    }

    term() {
        return this.binary_operator("faktor", [TokenKali, TokenBagi, TokenModulo])
    }

    faktor() {
        var res = new HasilParse()
        var tokenskrg = this.tokenSkrg

        if (([TokenTambah, TokenKurang, TokenXOR]).includes(tokenskrg.tipe)) {
            res.daftar_kemajuan()
            this.maju()
            var faktor = res.daftar(this.faktor())
            if (res.error) return res
            return res.berhasil(new NodeOperatorMinus(tokenskrg, faktor))
        } else if (tokenskrg.tipe == TokenTitikIndeks) {
            res.daftar_kemajuan()
            this.maju()
            var faktor = res.daftar(this.faktor())
            if (res.error) return res;
            if (!faktor) return res.gagal(new SintaksSalah(tokenskrg.posisi_awal, this.tokenSkrg.posisi_akhir, "Akhir input yang tidak terduga"));

            return res.berhasil(new NodeOperatorMinus(tokenskrg, faktor))
        } else if (tokenskrg.sama_dengan(TokenKeyword, "tipe")) {
            res.daftar_kemajuan()
            this.maju()
            var faktor = res.daftar(this.faktor())
            if (res.error) return res;
            if (!faktor) return res.gagal(new SintaksSalah(tokenskrg.posisi_awal, this.tokenSkrg.posisi_akhir, "`tipe` keyword harus disertai data"));

            return res.berhasil(new NodeOperatorMinus(tokenskrg, faktor))
        }
        return this.power()
    }

    power() {
        return this.binary_operator("panggilAtoIndeks", [TokenPangkat], ["faktor"])
    }

    panggilAtoIndeks() {
        var res = new HasilParse()
        var atom = res.daftar(this.atom())
        if (res.error) return res;

        if (this.tokenSkrg.tipe == TokenParentesisKiri) {
            res.daftar_kemajuan()
            this.maju()
            this.skip_nl()
            var node_parameter = []

            if (this.tokenSkrg.tipe == TokenParentesisKanan) {
                res.daftar_kemajuan()
                this.maju()
            } else {
                node_parameter.push(res.daftar(this.expr()))
                if (res.error)
                    return res;

                while (this.tokenSkrg.tipe == TokenKoma) {
                    res.daftar_kemajuan()
                    this.maju()
                    this.skip_nl()

                    node_parameter.push(res.daftar(this.expr()))
                    if (res.error) return res;
                }

                if (this.tokenSkrg.tipe != TokenParentesisKanan) {
                    return res.gagal(
                        new SintaksSalah(
                            this.tokenSkrg.posisi_awal,
                            this.tokenSkrg.posisi_akhir,
                            "Dibutuhkan ',' atau ')' untuk menutup daftar parameter",
                        )
                    )
                }

                res.daftar_kemajuan()
                this.maju()
            }
            return res.berhasil(new NodePanggil(atom, node_parameter))
        } else if (this.tokenSkrg.tipe == TokenKotakKiri) {
            res.daftar_kemajuan()
            this.maju()

            var expr = res.daftar(this.expr()) // isi indeks
            if (res.error) return res;

            if (this.tokenSkrg.tipe != TokenKotakKanan) return res.gagal(new SintaksSalah(
                this.tokenSkrg.posisi_awal, this.tokenSkrg.posisi_akhir,
                `Dibutuhkan ']' untuk menutup indeks`
            ));

            res.daftar_kemajuan()
            this.maju()

            if (this.tokenSkrg.tipe == TokenSama) {
                res.daftar_kemajuan()
                this.maju()
                var isiBaru = res.daftar(this.expr())
                if (res.error) return res
                return res.berhasil(new NodeIndeks(atom, expr, isiBaru))
            }
            return res.berhasil(new NodeIndeks(atom, expr))
        } else if (this.tokenSkrg.tipe == TokenTitikIndeks) {
            res.daftar_kemajuan()
            this.maju()

            if (this.tokenSkrg.tipe != TokenIdentifier) return res.gagal(new SintaksSalah(
                this.tokenSkrg.posisi_awal, this.tokenSkrg.posisi_akhir,
                `Dibutuhkan nama properti untuk indeks (setelah titik)`
            ));
            var indeks = new NodeString(this.tokenSkrg);

            res.daftar_kemajuan()
            this.maju()

            if (this.tokenSkrg.tipe == TokenSama) {
                res.daftar_kemajuan()
                this.maju()
                var isiBaru = res.daftar(this.expr())
                if (res.error) return res
                return res.berhasil(new NodeIndeks(atom, indeks, isiBaru))
            }
            return res.berhasil(new NodeIndeks(atom, indeks))
        } else if (this.tokenSkrg.tipe == TokenTernary) {
            res.daftar_kemajuan()
            this.maju()

            var pilihanPertama = res.daftar(this.expr());
            if (res.error) return res;

            if (this.tokenSkrg.tipe != TokenTernaryBagi) return res.gagal(new SintaksSalah(
                this.tokenSkrg.posisi_awal, this.tokenSkrg.posisi_akhir,
                `Dibutuhkan ':' untuk pilihan kedua ternary operator`
            ));

            res.daftar_kemajuan()
            this.maju()

            var pilihanKedua = res.daftar(this.expr())
            if (res.error) return res;

            return res.berhasil(new NodeTernary(atom, pilihanPertama, pilihanKedua))
        }
        return res.berhasil(atom)
    }

    atom() {
        var res = new HasilParse()
        var tokenskrg = this.tokenSkrg //selama ae < 10 lakukan lokal ae = ae + 1 tulis(ae);

        if (([TokenInteger, TokenFloat]).includes(tokenskrg.tipe)) {
            res.daftar_kemajuan()
            this.maju()
            return res.berhasil(new NodeAngka(tokenskrg))

        } else if (tokenskrg.tipe == TokenString) {
            res.daftar_kemajuan()
            this.maju()
            return res.berhasil(new NodeString(tokenskrg))

        } else if (tokenskrg.tipe == TokenIdentifier) {
            res.daftar_kemajuan()
            this.maju()
            var node_akses_ato_edit = res.daftar(this.akses_ato_edit(tokenskrg))
            if (res.error) return res;
            return res.berhasil(node_akses_ato_edit) //new NodeAksesVariabel(tokenskrg))

        } else if (tokenskrg.tipe == TokenParentesisKiri) {
            res.daftar_kemajuan()
            this.maju()
            var expr = res.daftar(this.expr())
            if (res.error) return res
            if (this.tokenSkrg.tipe == TokenParentesisKanan) {
                res.daftar_kemajuan()
                this.maju()
                return res.berhasil(expr)
            } else {
                return res.gagal(
                    new SintaksSalah(
                        this.tokenSkrg.posisi_awal,
                        this.tokenSkrg.posisi_akhir,
                        "Dibutuhkan ')'",
                    )
                )
            }
        } else if (tokenskrg.tipe == TokenKotakKiri) {
            var daftar_expr = res.daftar(this.daftar_expr())
            if (res.error) return res;
            return res.berhasil(daftar_expr)

        } else if (tokenskrg.tipe == TokenKurungKurawaKiri) {
            var objek_expr = res.daftar(this.objek_expr())
            if (res.error) return res;
            return res.berhasil(objek_expr)

        } else if (tokenskrg.sama_dengan(TokenKeyword, "jika")) {
            var if_expr = res.daftar(this.if_expr())
            if (res.error) return res;
            return res.berhasil(if_expr)

        } else if (tokenskrg.sama_dengan(TokenKeyword, "untuk")) {
            var for_expr = res.daftar(this.for_expr())
            if (res.error) return res;
            return res.berhasil(for_expr)

        } else if (tokenskrg.sama_dengan(TokenKeyword, "selama")) {
            var while_expr = res.daftar(this.while_expr())
            if (res.error) return res;
            return res.berhasil(while_expr)

        } else if (tokenskrg.sama_dengan(TokenKeyword, "fungsi")) {
            var fungsi = res.daftar(this.buat_fungsi())
            if (res.error) return res;
            return res.berhasil(fungsi)
        } else if (tokenskrg.sama_dengan(TokenKeyword, "coba")) {
            var cobaan = res.daftar(this.buat_try_catch())
            if (res.error) return res;
            return res.berhasil(cobaan)
        } /*else if (tokenskrg.sama_dengan(TokenKeyword, "kelas")) {
            var kelas = res.daftar(this.buat_kelas())
            if (res.error) return res;
            return res.berhasil(kelas)
        }*/
        //console.log(this.tokenSkrg.tipe)
        if (this.tokenSkrg.sama_dengan("EOF")) return res.berhasil(null);


        return res.gagal(
            new SintaksSalah(
                tokenskrg.posisi_awal,
                tokenskrg.posisi_akhir,
                "Akhir input yang tidak terduga",
            )
        )
    }

    daftar_expr() {
        var res = new HasilParse()
        var isi_elemen = []
        var posisi_awal = this.tokenSkrg.posisi_awal.salin()

        if (this.tokenSkrg.tipe != TokenKotakKiri)
            return res.gagal(
                new SintaksSalah(
                    this.tokenSkrg.posisi_awal,
                    this.tokenSkrg.posisi_akhir,
                    "Dibutuhkan '['",
                )
            )

        res.daftar_kemajuan()
        this.maju()

        if (this.tokenSkrg.tipe == TokenKotakKanan) {
            res.daftar_kemajuan()
            this.maju()
        } else {
            isi_elemen.push(res.daftar(this.expr()))
            if (res.error)
                return res

            while (this.tokenSkrg.tipe == TokenKoma) {
                res.daftar_kemajuan()
                this.maju()

                isi_elemen.push(res.daftar(this.expr()))
                if (res.error) return res;
            }

            if (this.tokenSkrg.tipe != TokenKotakKanan)
                return res.gagal(
                    new SintaksSalah(
                        this.tokenSkrg.posisi_awal,
                        this.tokenSkrg.posisi_akhir,
                        "Dibutuhkan ',' atau ']'",
                    )
                )

            res.daftar_kemajuan()
            this.maju()
        }

        return res.berhasil(
            new DaftarNode(isi_elemen, posisi_awal, this.tokenSkrg.posisi_akhir.salin())
        )
    }

    objek_expr() {
        var res = new HasilParse()
        var isi_obj = []
        var posisi_awal = this.tokenSkrg.posisi_awal.salin()

        if (this.tokenSkrg.tipe != TokenKurungKurawaKiri)
            return res.gagal(
                new SintaksSalah(
                    this.tokenSkrg.posisi_awal,
                    this.tokenSkrg.posisi_akhir,
                    "Dibutuhkan '{'",
                )
            )

        res.daftar_kemajuan()
        this.maju()
        this.skip_nl()

        if (this.tokenSkrg.tipe == TokenKurungKurawaKanan) {
            res.daftar_kemajuan()
            this.maju()
        } else {
            //console.log(this.partial_objek_expr())
            let [x_res, x_kunci, x_isi] = this.partial_objek_expr()
            if (x_res.error) return x_res;

            isi_obj.push([x_kunci, x_isi]);
            //this.maju()
            this.skip_nl()
            while (this.tokenSkrg.tipe == TokenKoma) {
                res.daftar_kemajuan()
                this.maju()
                this.skip_nl()

                let [x_res, x_kunci, x_isi] = this.partial_objek_expr()
                //console.log(x_res.error)
                if (x_res.error) return x_res;
                //console.log(x_kunci)
                isi_obj.push([x_kunci, x_isi]);
            }

            res.daftar_kemajuan()
            this.skip_nl()
            if (this.tokenSkrg.tipe !== TokenKurungKurawaKanan)
                return res.gagal(
                    new SintaksSalah(
                        this.tokenSkrg.posisi_awal,
                        this.tokenSkrg.posisi_akhir,
                        "Dibutuhkan ',' atau '}'",
                    )
                )

            res.daftar_kemajuan()
            this.maju()
        }

        return res.berhasil(new ObjekNode(isi_obj, posisi_awal, this.tokenSkrg.posisi_akhir.salin()))
    }

    partial_objek_expr() {
        var res = new HasilParse()

        let xKunci = this.tokenSkrg;
        let xIsiData = null;

        if (xKunci.tipe === TokenKotakKiri) {
            res.daftar_kemajuan()
            this.maju()

            xKunci = res.daftar(this.expr())
            if (res.error)
                return [res, null, null];

            //res.daftar_kemajuan()
            //this.maju()

            if (this.tokenSkrg.tipe !== TokenKotakKanan) return [res.gagal(new SintaksSalah(
                this.tokenSkrg.posisi_awal,
                this.tokenSkrg.posisi_akhir, "Kunci data harus ditutup dengan ']'")), null, null]
        } else {
            xKunci = new NodeString(xKunci)
        }

        //console.log(xKunci)
        /*if (![TokenIdentifier, TokenString, TokenInteger, TokenFloat].includes(xKunci.tipe)) return [res.gagal(new SintaksSalah(
            this.tokenSkrg.posisi_awal,
            this.tokenSkrg.posisi_akhir, "Kunci data harus berupa identifier, string atau angka")), null, null]*/

        res.daftar_kemajuan()
        this.maju()

        //console.log(this.tokenSkrg.tipe)
        if (this.tokenSkrg.tipe !== TokenTernaryBagi) return [res.gagal(new SintaksSalah(
            this.tokenSkrg.posisi_awal,
            this.tokenSkrg.posisi_akhir, "Kunci data harus diikuti dengan titik dua")), null, null]

        res.daftar_kemajuan()
        this.maju()
        //this.skip_nl()

        xIsiData = res.daftar(this.expr())
        if (res.error)
            return [res, null, null];

        res.daftar_kemajuan()
        this.skip_nl()

        return [res, xKunci, xIsiData]
    }

    akses_ato_edit(nama_var) {
        var res = new HasilParse();
        //console.log(this.tokenSkrg.tipe, TokenSama)
        if (this.tokenSkrg.tipe == TokenSama) {
            res.daftar_kemajuan()
            this.maju()
            var expr = res.daftar(this.expr())
            if (res.error) return res;
            return res.berhasil(new NodeEditVariabel(nama_var, expr))
        } else {
            return res.berhasil(new NodeAksesVariabel(nama_var))
        }
    }

    if_expr() {
        var res = new HasilParse()
        var all_cases = res.daftar(this.if_expr_cases('jika'))
        if (res.error) return res;
        //var { cases, else_case } = all_cases
        return res.berhasil(new NodeIF(all_cases[0], all_cases[1]))
    }

    if_expr_cases(case_keyword) {
        var res = new HasilParse()
        var cases = []
        var else_case = null

        if (!(this.tokenSkrg.sama_dengan(TokenKeyword, case_keyword)))
            return res.gagal(new SintaksSalah(
                this.tokenSkrg.posisi_awal, this.tokenSkrg.posisi_akhir,
                `Dibutuhkan '${case_keyword}'`
            ))

        res.daftar_kemajuan()
        this.maju()

        var kondisi = res.daftar(this.expr())
        if (res.error) return res;

        if (!(this.tokenSkrg.sama_dengan(TokenKeyword, 'maka')))
            return res.gagal(new SintaksSalah(
                this.tokenSkrg.posisi_awal, this.tokenSkrg.posisi_akhir,
                "Dibutuhkan 'maka' untuk melanjutkan if"
            ))

        res.daftar_kemajuan()
        this.maju()
        if (this.tokenSkrg.tipe == TokenLineBaru) {
            res.daftar_kemajuan()
            this.maju()

            var statements = res.daftar(this.statements())
            if (res.error) return res;
            cases.push([kondisi, statements, true])

            if (this.tokenSkrg.sama_dengan(TokenKeyword, 'tutup')) {
                res.daftar_kemajuan()
                this.maju()
            } else {
                var all_cases = res.daftar(this.if_else_atau_elseif())
                if (res.error) return res;
                else_case = all_cases[1]
                cases = cases.concat(all_cases[0])
            }
        } else {
            var expr = res.daftar(this.statement())
            if (res.error) return res;
            cases.push([kondisi, expr, false])

            var all_cases = res.daftar(this.if_else_atau_elseif())
            if (res.error) return res;
            else_case = all_cases[1]
            cases = cases.concat(all_cases[0])

            if (this.tokenSkrg.tipe == TokenLineBaru) {
                res.daftar_kemajuan()
                this.maju()
            }

            if (!(this.tokenSkrg.sama_dengan(TokenKeyword, 'tutup')))
                return res.gagal(new SintaksSalah(
                    this.tokenSkrg.posisi_awal, this.tokenSkrg.posisi_akhir,
                    "Dibutuhkan 'tutup' untuk menutup if statement"
                ))

            res.daftar_kemajuan()
            this.maju()
        }

        return res.berhasil([cases, else_case])
    }

    if_else_atau_elseif() {
        var res = new HasilParse()
        var cases = [], else_case = null

        if (this.tokenSkrg.sama_dengan(TokenKeyword, 'kalau')) {
            var all_cases = res.daftar(this.if_expr_elseif())
            if (res.error) return res;
            cases = all_cases[0]
            else_case = all_cases[1]
        } else {
            else_case = res.daftar(this.if_expr_c())
            if (res.error) return res;
        }
        return res.berhasil([cases, else_case])
    }

    if_expr_elseif() {
        return this.if_expr_cases('kalau')
    }

    if_expr_c() {
        var res = new HasilParse()
        var else_case = null

        if (this.tokenSkrg.sama_dengan(TokenKeyword, 'jikatidak')) {
            res.daftar_kemajuan()
            this.maju()

            if (this.tokenSkrg.tipe == TokenLineBaru) {
                res.daftar_kemajuan()
                this.maju()

                var statements = res.daftar(this.statements())
                if (res.error) return res;
                else_case = [statements, true]

                if (this.tokenSkrg.sama_dengan(TokenKeyword, 'tutup')) {
                    res.daftar_kemajuan()
                    this.maju()
                } else {
                    return res.gagal(new SintaksSalah(
                        this.tokenSkrg.posisi_awal, this.tokenSkrg.posisi_akhir,
                        "Dibutuhkan 'tutup' untuk menutup if statements"
                    ))
                }
            } else {
                var expr = res.daftar(this.statement())
                if (res.error) return res;
                else_case = [expr, false]
            }
        }

        return res.berhasil(else_case)
    }

    for_expr() {
        var res = new HasilParse()
        var isi_step = null

        if (!(this.tokenSkrg.sama_dengan(TokenKeyword, "untuk")))  // for 
            return res.gagal(
                new SintaksSalah(
                    this.tokenSkrg.posisi_awal,
                    this.tokenSkrg.posisi_akhir,
                    "Dibutuhkan 'untuk'",
                )
            )

        res.daftar_kemajuan()
        this.maju()

        if (this.tokenSkrg.tipe != TokenIdentifier)
            return res.gagal(
                new SintaksSalah(
                    this.tokenSkrg.posisi_awal,
                    this.tokenSkrg.posisi_akhir,
                    "Dibutuhkan variabel pengenal",
                )
            )

        var nama_variabel = this.tokenSkrg
        res.daftar_kemajuan()
        this.maju()

        if (this.tokenSkrg.tipe != TokenSama)
            return res.gagal(
                new SintaksSalah(
                    this.tokenSkrg.posisi_awal,
                    this.tokenSkrg.posisi_akhir,
                    "Dibutuhkan '='",
                )
            )

        res.daftar_kemajuan()
        this.maju()

        var isi_awal = res.daftar(this.expr())
        if (res.error) return res

        if (!(this.tokenSkrg.sama_dengan(TokenKeyword, "ke")))  // for ... to
            return res.gagal(
                new SintaksSalah(
                    this.tokenSkrg.posisi_awal,
                    this.tokenSkrg.posisi_akhir,
                    "Dibutuhkan 'ke'",
                )
            )

        res.daftar_kemajuan()
        this.maju()

        var isi_akhir = res.daftar(this.expr())
        if (res.error) return res;

        if (this.tokenSkrg.sama_dengan(TokenKeyword, "langkah")) {  // untuk ... ke ... langkah ...
            res.daftar_kemajuan()
            this.maju()

            isi_step = res.daftar(this.expr())
            if (res.error) return res;
        }

        if (!(this.tokenSkrg.sama_dengan(TokenKeyword, "lakukan")))  // untuk ... ke ... langkah ... lakukan
            return res.gagal(
                new SintaksSalah(
                    this.tokenSkrg.posisi_awal,
                    this.tokenSkrg.posisi_akhir,
                    "Dibutuhkan 'lakukan' untuk meneruskan for loop",
                )
            )

        res.daftar_kemajuan()
        this.maju()

        if (this.tokenSkrg.tipe == TokenLineBaru) {
            res.daftar_kemajuan()
            this.maju()

            var isi = res.daftar(this.statements())
            if (res.error) return res

            if (!(this.tokenSkrg.sama_dengan(TokenKeyword, 'tutup')))
                return res.gagal(new SintaksSalah(
                    this.tokenSkrg.posisi_awal, this.tokenSkrg.posisi_akhir,
                    "Dibutuhkan 'tutup'"
                ))

            res.daftar_kemajuan()
            this.maju()

            return res.berhasil(new NodeFor(nama_variabel, isi_awal, isi_akhir, isi_step, isi, true))
        }

        var isi = res.daftar(this.statement())
        if (res.error) return res;

        return res.berhasil(new NodeFor(nama_variabel, isi_awal, isi_akhir, isi_step, isi, false))
    }

    while_expr() {
        var res = new HasilParse()

        if (!(this.tokenSkrg.sama_dengan(TokenKeyword, "selama")))  // while
            return res.gagal(
                new SintaksSalah(
                    this.tokenSkrg.posisi_awal,
                    this.tokenSkrg.posisi_akhir,
                    "Dibutuhkan 'selama'",
                )
            )

        res.daftar_kemajuan()
        this.maju()

        var kondisi = res.daftar(this.expr())
        if (res.error) return res;

        if (!(this.tokenSkrg.sama_dengan(TokenKeyword, "lakukan")))  //# while ... do
            return res.gagal(
                new SintaksSalah(
                    this.tokenSkrg.posisi_awal,
                    this.tokenSkrg.posisi_akhir,
                    "Dibutuhkan 'lakukan'",
                )
            )

        res.daftar_kemajuan()
        this.maju()

        if (this.tokenSkrg.tipe == TokenLineBaru) {
            res.daftar_kemajuan()
            this.maju()

            var isi = res.daftar(this.statements())
            if (res.error) return res;

            if (!(this.tokenSkrg.sama_dengan(TokenKeyword, 'tutup')))
                return res.gagal(new SintaksSalah(
                    this.tokenSkrg.posisi_awal, this.tokenSkrg.posisi_akhir,
                    "Dibutuhkan 'tutup'"
                ))

            res.daftar_kemajuan()
            this.maju()

            return res.berhasil(new NodeWhile(kondisi, isi, true))
        }

        var isi = res.daftar(this.statement())
        if (res.error) return res;

        return res.berhasil(new NodeWhile(kondisi, isi, false))
    }

    parse_parameter() {
        var res = new HasilParse()
        var nama_token_parameter = []

        if (this.tokenSkrg.tipe != TokenParentesisKiri)
            return [null, res.gagal(
                new SintaksSalah(
                    this.tokenSkrg.posisi_awal,
                    this.tokenSkrg.posisi_akhir,
                    "Dibutuhkan '('",
                )
            )]

        res.daftar_kemajuan()
        this.maju()

        if (this.tokenSkrg.tipe == TokenIdentifier) {
            nama_token_parameter.push(this.tokenSkrg)
            res.daftar_kemajuan()
            this.maju()

            while (this.tokenSkrg.tipe == TokenKoma) {
                res.daftar_kemajuan()
                this.maju()

                if (this.tokenSkrg.tipe != TokenIdentifier)
                    return [null, res.gagal(
                        new SintaksSalah(
                            this.tokenSkrg.posisi_awal,
                            this.tokenSkrg.posisi_akhir,
                            "Dibutuhkan pengenal variabel atau '('",
                        )
                    )]

                nama_token_parameter.push(this.tokenSkrg)
                res.daftar_kemajuan()
                this.maju()
            }

            if (this.tokenSkrg.tipe != TokenParentesisKanan)
                return [null, res.gagal(
                    new SintaksSalah(
                        this.tokenSkrg.posisi_awal,
                        this.tokenSkrg.posisi_akhir,
                        "Dibutuhkan ',' atau ')'",
                    )
                )]
        } else {
            if (this.tokenSkrg.tipe != TokenParentesisKanan)
                return [null, res.gagal(
                    new SintaksSalah(
                        this.tokenSkrg.posisi_awal,
                        this.tokenSkrg.posisi_akhir,
                        "Dibutuhkan ',' atau ')' untuk meneruskan daftar parameter",
                    )
                )]
        }

        res.daftar_kemajuan()
        this.maju()

        return [nama_token_parameter, res]
    }

    buat_fungsi() {
        var res = new HasilParse()
        var token_nama_variabel = null

        if (!(this.tokenSkrg.sama_dengan(TokenKeyword, "fungsi")))
            return res.gagal(
                new SintaksSalah(
                    this.tokenSkrg.posisi_awal,
                    this.tokenSkrg.posisi_akhir,
                    "Dibutuhkan 'fungsi'",
                )
            )

        res.daftar_kemajuan()
        this.maju()

        if (this.tokenSkrg.tipe == TokenIdentifier) {
            token_nama_variabel = this.tokenSkrg
            res.daftar_kemajuan()
            this.maju()

            if (this.tokenSkrg.tipe != TokenParentesisKiri)
                return res.gagal(
                    new SintaksSalah(
                        this.tokenSkrg.posisi_awal,
                        this.tokenSkrg.posisi_akhir,
                        "Dibutuhkan '(' untuk parameter fungsi",
                    )
                )
        } else {
            if (this.tokenSkrg.tipe != TokenParentesisKiri)
                return res.gagal(
                    new SintaksSalah(
                        this.tokenSkrg.posisi_awal,
                        this.tokenSkrg.posisi_akhir,
                        "Dibutuhkan nama fungsi atau '('",
                    )
                )
        }

        res.daftar_kemajuan()
        this.maju()
        var nama_token_parameter = []

        if (this.tokenSkrg.tipe == TokenIdentifier) {
            nama_token_parameter.push(this.tokenSkrg)
            res.daftar_kemajuan()
            this.maju()

            while (this.tokenSkrg.tipe == TokenKoma) {
                res.daftar_kemajuan()
                this.maju()

                if (this.tokenSkrg.tipe != TokenIdentifier)
                    return res.gagal(
                        new SintaksSalah(
                            this.tokenSkrg.posisi_awal,
                            this.tokenSkrg.posisi_akhir,
                            "Dibutuhkan pengenal variabel atau '('",
                        )
                    )

                nama_token_parameter.push(this.tokenSkrg)
                res.daftar_kemajuan()
                this.maju()
            }

            if (this.tokenSkrg.tipe != TokenParentesisKanan)
                return res.gagal(
                    new SintaksSalah(
                        this.tokenSkrg.posisi_awal,
                        this.tokenSkrg.posisi_akhir,
                        "Dibutuhkan ',' atau ')'",
                    )
                )
        } else {
            if (this.tokenSkrg.tipe != TokenParentesisKanan)
                return res.gagal(
                    new SintaksSalah(
                        this.tokenSkrg.posisi_awal,
                        this.tokenSkrg.posisi_akhir,
                        "Dibutuhkan ',' atau ')' untuk meneruskan daftar parameter",
                    )
                )
        }

        res.daftar_kemajuan()
        this.maju()

        if (this.tokenSkrg.tipe == TokenPanah) {
            res.daftar_kemajuan()
            this.maju()

            var isifungsi = res.daftar(this.expr())
            if (res.error) return res;

            return res.berhasil(
                new NodeBuatFungsi(token_nama_variabel, nama_token_parameter, isifungsi, true)
            )
        }

        /*if (this.tokenSkrg.tipe != TokenLineBaru)
            return res.gagal(
                new SintaksSalah(
                    this.tokenSkrg.posisi_awal,
                    this.tokenSkrg.posisi_akhir,
                    "Dibutuhkan '->' atau baris baru \"\\n\"",
                )
            )

        res.daftar_kemajuan()
        this.maju()*/

        var isistatement = res.daftar(this.statements())
        if (res.error) return res;

        if (!(this.tokenSkrg.sama_dengan(TokenKeyword, 'tutup')))
            return res.gagal(new SintaksSalah(
                this.tokenSkrg.posisi_awal, this.tokenSkrg.posisi_akhir,
                "Dibutuhkan 'tutup' untuk menutup block fungsi"
            ))

        res.daftar_kemajuan()
        this.maju()

        return res.berhasil(
            new NodeBuatFungsi(token_nama_variabel, nama_token_parameter, isistatement, false)
        )
    }

    buat_kelas() {
        var res = new HasilParse()
        var namaclass;
        var metodeclass = [];

        if (!(this.tokenSkrg.sama_dengan(TokenKeyword, "kelas")))
            return res.gagal(
                new SintaksSalah(
                    this.tokenSkrg.posisi_awal,
                    this.tokenSkrg.posisi_akhir,
                    "Dibutuhkan 'coba'",
                )
            )

        res.daftar_kemajuan()
        this.maju()

        if (this.tokenSkrg.tipe != TokenIdentifier)
            return res.gagal(
                new SintaksSalah(
                    this.tokenSkrg.posisi_awal,
                    this.tokenSkrg.posisi_akhir,
                    "Dibutuhkan nama untuk kelas",
                )
            )

        namaclass = this.tokenSkrg
        res.daftar_kemajuan()
        this.maju()
        this.skip_nl()

        while ([TokenIdentifier, TokenKeyword].includes(this.tokenSkrg.tipe)&&!this.tokenSkrg.sama_dengan(TokenKeyword,"tutup")) {
            let nama_fungsi, method_statik, method_dapat, method_terap;
            if (this.tokenSkrg.sama_dengan(TokenKeyword, "statik")) {
                method_statik = true
                res.daftar_kemajuan()
                this.maju()
            }
            if (this.tokenSkrg.sama_dengan(TokenKeyword, "dapat")) {
                method_dapat = true
                res.daftar_kemajuan()
                this.maju()
            } else if (this.tokenSkrg.sama_dengan(TokenKeyword, "terap")) {
                method_terap = true
                res.daftar_kemajuan()
                this.maju()
            }

            if (this.tokenSkrg.tipe != TokenIdentifier)
                return res.gagal(
                    new SintaksSalah(
                        this.tokenSkrg.posisi_awal,
                        this.tokenSkrg.posisi_akhir,
                        "Dibutuhkan nama untuk fungsi/metode class",
                    )
                )

            nama_fungsi = this.tokenSkrg

            res.daftar_kemajuan()
            this.maju()

            var [nama_parameter, res_x] = this.parse_parameter()
            res.daftar(res_x)
            if (res.error) return res;

            var isistatement = res.daftar(this.statements())
            if (res.error) return res;

            if (!(this.tokenSkrg.sama_dengan(TokenKeyword, 'tutup')))
                return res.gagal(new SintaksSalah(
                    this.tokenSkrg.posisi_awal, this.tokenSkrg.posisi_akhir,
                    "Dibutuhkan 'tutup' untuk menutup block fungsi"
                ))

            res.daftar_kemajuan()
            this.maju()
            this.skip_nl()
            metodeclass.push(new NodeBuatFungsi(nama_fungsi, nama_parameter, isistatement, false))
        }
        console.log(metodeclass)

        if (!(this.tokenSkrg.sama_dengan(TokenKeyword, 'tutup')))
            return res.gagal(new SintaksSalah(
                this.tokenSkrg.posisi_awal, this.tokenSkrg.posisi_akhir,
                "Dibutuhkan 'tutup' untuk menutup block fungsi"
            ))
        res.daftar_kemajuan()
        this.maju()

        return res.berhasil(new NodeKelas(namaclass, metodeclass))
    }

    buat_try_catch() {
        var res = new HasilParse()
        var error_variabel = null

        if (!(this.tokenSkrg.sama_dengan(TokenKeyword, "coba")))
            return res.gagal(
                new SintaksSalah(
                    this.tokenSkrg.posisi_awal,
                    this.tokenSkrg.posisi_akhir,
                    "Dibutuhkan 'coba'",
                )
            )

        res.daftar_kemajuan()
        this.maju()

        var ygDiCoba = res.daftar(this.statements())
        if (res.error) return res;

        if (!(this.tokenSkrg.sama_dengan(TokenKeyword, 'tangkap')))
            return res.gagal(new SintaksSalah(
                this.tokenSkrg.posisi_awal, this.tokenSkrg.posisi_akhir,
                "Dibutuhkan 'tangkap' untuk untuk error handler"
            ))

        res.daftar_kemajuan()
        this.maju()

        if (this.tokenSkrg.tipe == TokenParentesisKiri) {
            res.daftar_kemajuan()
            this.maju()

            if (this.tokenSkrg.tipe == TokenIdentifier) {
                error_variabel = this.tokenSkrg
                res.daftar_kemajuan()
                this.maju()
            };

            if (this.tokenSkrg.tipe != TokenParentesisKanan) return res.gagal(
                new SintaksSalah(
                    this.tokenSkrg.posisi_awal,
                    this.tokenSkrg.posisi_akhir,
                    "Dibutuhkan ',' atau ')' untuk meneruskan daftar parameter",
                )
            )
        } else if (this.tokenSkrg.tipe == TokenIdentifier) {
            error_variabel = this.tokenSkrg;
        } else {
            return res.gagal(
                new SintaksSalah(
                    this.tokenSkrg.posisi_awal,
                    this.tokenSkrg.posisi_akhir,
                    "Dibutuhkan pengenal variabel atau '('",
                )
            )
        }

        res.daftar_kemajuan()
        this.maju()

        var errorHandler = res.daftar(this.statements());
        if (res.error) return res;

        if (!(this.tokenSkrg.sama_dengan(TokenKeyword, 'tutup')))
            return res.gagal(new SintaksSalah(
                this.tokenSkrg.posisi_awal, this.tokenSkrg.posisi_akhir,
                "Dibutuhkan 'tutup' untuk menutup block coba"
            ))

        res.daftar_kemajuan()
        this.maju()

        return res.berhasil(new NodeCoba(ygDiCoba, error_variabel, errorHandler))
    }
}


module.exports = {
    Parser
}