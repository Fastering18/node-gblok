/**
 * Interpreter class, esekusi array perintah dijalankan oleh nodejs
 * interpreted language
 */

const {
    HasilRuntime,
    Konteks,
    TabelSimbol
} = require("../lib/Runtime");

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
    TokenXOR,
    TokenTitikIndeks
} = require("../lib/enums");
const { RTError } = require("../lib/errors")

const { Lexer } = require("./lexer")
const { Parser } = require("./parser");

class Interpreter {
    kunjungi(node, konteks) {
        if (!node) return new HasilRuntime().berhasil(null)

        var nama_metode = `kunjungi_${node.constructor.name}`
        //console.log("stack: ", nama_metode) //debugging call stack fungsi
        if (!this[nama_metode]) this.tidak_nemu(node, konteks);
        return this[nama_metode](node, konteks)
    }

    tidak_nemu(node, konteks) {
        console.log(node)
        console.log("Beta, mungkin belum jadi")
        throw new Error(`GK nemu \`kunjungi_${node.constructor.name}\``, konteks)
    }

    kunjungi_NodeAksesVariabel(node, konteks) {
        var res = new HasilRuntime()
        var nama_var = node.nama_token_variabel.value
        var isi = konteks.TabelSimbol.dapat(nama_var)

        //console.log(konteks.TabelSimbol)
        if (isi == undefined)
            return res.gagal(
                new RTError(
                    node.posisi_awal,
                    node.posisi_akhir,
                    `variabel '${nama_var}' tidak dideklarasikan`,
                    konteks,
                )
            )

        isi = isi.salin().atur_posisi(node.posisi_awal, node.posisi_akhir).atur_konteks(konteks)
        return res.berhasil(isi)
    }

    kunjungi_NodeBuatVariabel(node, konteks) {
        var res = new HasilRuntime()
        var nama_var = node.nama_token_variabel.value
        var isi = res.daftar(this.kunjungi(node.isi_node, konteks))
        if (res.harus_return()) return res;

        konteks.TabelSimbol.tulis(nama_var, isi)
        return res.berhasil(isi)
    }

    kunjungi_NodeEditVariabel(node, konteks) {
        var res = new HasilRuntime()
        var nama_var = node.nama_token_variabel.value
        var isi = res.daftar(this.kunjungi(node.isi_node, konteks))
        if (res.harus_return()) return res;

        if (konteks.TabelSimbol.dapat(nama_var) == undefined)
            return res.gagal(
                new RTError(
                    node.posisi_awal,
                    node.posisi_akhir,
                    `variabel '${nama_var}' belum dideklarasikan`,
                    konteks,
                )
            )
        konteks.TabelSimbol.tulis(nama_var, isi, true)
        return res.berhasil(isi)
    }

    /*kunjungi_NodeIndeksVariabel(node, konteks) {
        var res = new HasilRuntime();
        var nama_var = node.nama_token_variabel.value
        var indeks = res.daftar(this.kunjungi(node.indeks, konteks))
        if (res.harus_return()) return res;
        var dataYgDiIndeks = konteks.TabelSimbol.dapat(nama_var)
         
        if (dataYgDiIndeks == undefined)
            return res.gagal(
                new RTError(
                    node.posisi_awal,
                    node.posisi_akhir,
                    `variabel '${nama_var}' tidak dideklarasikan`,
                    konteks,
                )
            )
        
        if (dataYgDiIndeks.constructor.name != "Daftar")
            return res.gagal(new RTError(
                node.posisi_awal,
                node.posisi_akhir,
                `variabel '${nama_var}' bukan sebuah array`,
                konteks,
            ))

        var isi = dataYgDiIndeks.isi[indeks.constructor.name == "Angka" ? indeks.nilai - 1 : indeks.nilai]
        return res.berhasil(isi || new Nil())
    }*/

    kunjungi_NodeIndeks(node, konteks) {
        var res = new HasilRuntime();
        var isi_untuk_diindeks = res.daftar(
            this.kunjungi(node.node_untuk_indeks, konteks)
        )
        if (res.harus_return()) return res;
        isi_untuk_diindeks = isi_untuk_diindeks.salin().atur_posisi(
            node.posisi_awal, node.posisi_akhir
        )

        var prevIdx;
        for (var i=0; i<node.indeks.length-1; i++) { 
            var kunciIndeks = node.interp_indeks? res.daftar(this.kunjungi(node.indeks[i], konteks)) : node.indeks[i]
            if (res.harus_return()) return res;
            if (kunciIndeks instanceof Angka) kunciIndeks.nilai -= 1 
            else if (typeof(kunciIndeks.value) == "number") kunciIndeks.value -= 1;

            var idx = kunciIndeks.nilai !== undefined ? kunciIndeks.nilai : kunciIndeks.value
            isi_untuk_diindeks = (isi_untuk_diindeks.metode["metode_" + idx] || (isi_untuk_diindeks.nilai ? isi_untuk_diindeks.nilai[idx] : Angka.nil));

            if (!isi_untuk_diindeks || isi_untuk_diindeks instanceof Nil) return res.gagal(new RTError(
                node.posisi_awal,
                node.posisi_akhir,
                `Tidak dapat mengakses nil (dari: ${prevIdx} -> ${idx})`,
                konteks,
            ))
            prevIdx = idx;
        }

        var kunciIndeks = node.interp_indeks? res.daftar(this.kunjungi(node.indeks[node.indeks.length-1], konteks)) : node.indeks[i]
        if (res.harus_return()) return res;

        if (kunciIndeks instanceof Angka) kunciIndeks.nilai -= 1 
            else if (typeof(kunciIndeks.value) == "number") kunciIndeks.value -= 1

        if (node.editIndeks) {
            if (!["Objek", "Daftar"].includes(isi_untuk_diindeks.constructor.name)) return res.gagal(new RTError(
                node.posisi_awal,
                node.posisi_akhir,
                `${node.node_untuk_indeks.nama_token_variabel ? node.node_untuk_indeks.nama_token_variabel.value : "Nilai tengah (...)()"} Tidak dapat merubah properti non objek/array`,
                konteks,
            ))
            var isiBaru = res.daftar(this.kunjungi(node.editIndeks, konteks))
            if (res.harus_return()) return res;

            if (isiBaru instanceof Nil) {
                if (isi_untuk_diindeks instanceof Daftar) {
                    isi_untuk_diindeks.nilai.splice(kunciIndeks.nilai || kunciIndeks.value, 1)
                    return res.berhasil(Angka.nil)
                } else {
                    isi_untuk_diindeks.nilai[kunciIndeks.nilai || kunciIndeks.value] = undefined
                    return res.berhasil(Angka.nil)
                }
            }
            isi_untuk_diindeks.nilai[kunciIndeks.nilai || kunciIndeks.value] = isiBaru; //isi_untuk_diindeks.nilai[node.interp_indeks? (kunciIndeks.constructor.name == "Angka" ? kunciIndeks.nilai - 1 : kunciIndeks.nilai) : kunciIndeks.value] = isiBaru;
            return res.berhasil(isiBaru || Angka.nil)
        } else {
            //if (isi_untuk_diindeks.constructor.name == "Daftar") {
                var idx = kunciIndeks.nilai !== undefined ? kunciIndeks.nilai : kunciIndeks.value
                var isiData = (isi_untuk_diindeks.metode["metode_" + idx] || (isi_untuk_diindeks.nilai ? isi_untuk_diindeks.nilai[idx] : Angka.nil));
                return res.berhasil(isiData || Angka.nil)
        //    }
        }
    }

    kunjungi_NodeAngka(node, konteks) {
        return new HasilRuntime().berhasil(
            new Angka(node.token.value)
                .atur_konteks(konteks)
                .atur_posisi(node.posisi_awal, node.posisi_akhir)
        )
    }

    kunjungi_NodeString(node, konteks) {
        return new HasilRuntime().berhasil(
            new Str(node.token.value)
                .atur_konteks(konteks)
                .atur_posisi(node.posisi_awal, node.posisi_akhir)
        )
    }

    kunjungi_DaftarNode(node, konteks) {
        var res = new HasilRuntime()
        var isian = []

        for (var i = 0; i < node.isi_daftar.length; i++) {
            isian.push(res.daftar(this.kunjungi(node.isi_daftar[i], konteks)))
            if (res.harus_return()) return res
        }

        return res.berhasil(
            new Daftar(isian)
                .atur_konteks(konteks)
                .atur_posisi(node.posisi_awal, node.posisi_akhir)
        )
    }

    kunjungi_ObjekNode(node, konteks) {
        var res = new HasilRuntime()
        var obj_hasil = {}
        //console.log(Object.entries(node.isi_objek))

        for (var k in node.isi_objek) {
            let kunci = res.daftar(this.kunjungi(node.isi_objek[k][0]))
            if (res.harus_return()) return res;
            //console.log(kunci)
            obj_hasil[kunci.nilai] = res.daftar(this.kunjungi(node.isi_objek[k][1], konteks))
            if (res.harus_return()) return res
        }

        return res.berhasil(new Objek(obj_hasil).atur_konteks(konteks)
        .atur_posisi(node.posisi_awal, node.posisi_akhir))
    }

    kunjungi_NodeOperasiBinary(node, konteks) {
        var res = new HasilRuntime()
        var kiri = res.daftar(this.kunjungi(node.node_kiri, konteks))
        if (res.harus_return()) return res;
        var kanan = res.daftar(this.kunjungi(node.node_kanan, konteks))
        if (res.harus_return()) return res;
        // print(kiri)
        // print(node.operator_token.value)
        var jawaban, error;
        if (node.operator_token.tipe == TokenTambah) {
            var { hasil, err } = kiri.tambah_ke(kanan);
            jawaban = hasil;
            error = err;
        } else if (node.operator_token.tipe == TokenKurang) {
            var { hasil, err } = kiri.kurangi_oleh(kanan)
            jawaban = hasil;
            error = err;
        } else if (node.operator_token.tipe == TokenKali) {
            var { hasil, err } = kiri.kali_oleh(kanan)
            jawaban = hasil;
            error = err;
        } else if (node.operator_token.tipe == TokenBagi) {
            var { hasil, err } = kiri.bagi_oleh(kanan)
            jawaban = hasil;
            error = err;
        } else if (node.operator_token.tipe == TokenPangkat) {
            var { hasil, err } = kiri.pangkat_oleh(kanan)
            jawaban = hasil;
            error = err;
        } else if (node.operator_token.tipe == TokenModulo) {
            var { hasil, err } = kiri.modulus_oleh(kanan)
            jawaban = hasil;
            error = err;
        } else if (node.operator_token.tipe == TokenSamaSama) {
            var { hasil, err } = kiri.perbandingan_persamaan(kanan)
            jawaban = hasil;
            error = err;
        } else if (node.operator_token.tipe == TokenTidakSama) {
            var { hasil, err } = kiri.perbandingan_tidak_sama(kanan)
            jawaban = hasil;
            error = err;
        } else if (node.operator_token.tipe == TokenKurangDari) {
            var { hasil, err } = kiri.perbandingan_kurang_dari(kanan)
            jawaban = hasil;
            error = err;
        } else if (node.operator_token.tipe == TokenLebihDari) {
            var { hasil, err } = kiri.perbandingan_lebih_dari(kanan)
            jawaban = hasil;
            error = err;
        } else if (node.operator_token.tipe == TokenKurangAtauSama) {
            var { hasil, err } = kiri.perbandingan_sama_kurang_dari(kanan)
            jawaban = hasil;
            error = err;
        } else if (node.operator_token.tipe == TokenLebihAtauSama) {
            var { hasil, err } = kiri.perbandingan_sama_lebih_dari(kanan)
            jawaban = hasil;
            error = err;
        } else if (node.operator_token.sama_dengan(TokenKeyword, "dan")) {
            var { hasil, err } = kiri.dan_oleh(kanan)
            jawaban = hasil;
            error = err;
        } else if (node.operator_token.sama_dengan(TokenKeyword, "atau")) {
            var { hasil, err } = kiri.atau_oleh(kanan)
            jawaban = hasil;
            error = err;
        } else if (node.operator_token.tipe == TokenPanah) {
            //console.log(kanan)
            var { hasil, err } = kiri.akses(kanan)
            jawaban = hasil;
            error = err;
        } else {
            //console.log(node.operator_token)
        }

        if (error) {
            return res.gagal(error)
        } else {
            return res.berhasil(
                jawaban.atur_posisi(node.posisi_awal, node.posisi_akhir)
            )
        }
    }

    kunjungi_NodeOperatorMinus(node, konteks) {
        var hasil = new HasilRuntime()
        var angka = hasil.daftar(this.kunjungi(node.node, konteks))
        if (hasil.harus_return()) return hasil;

        var error;

        if (node.operator_token.tipe == TokenKurang) {
            if (angka.constructor.name == "Angka") {
                var newangka = angka.kali_oleh(new Angka(-1))
                error = newangka.err;
                angka = newangka.hasil;
            } else {
                angka = Angka.nil.atur_konteks(konteks)
            }
        } else if (node.operator_token.tipe == TokenXOR) {
            var newangka = angka.XOR()
            error = newangka.err;
            angka = newangka.hasil;
        } else if (node.operator_token.tipe == TokenTitikIndeks) {
            if (angka.constructor.name == "Angka") {
                var newangka = angka.jadi_koma()
                error = newangka.err;
                angka = newangka.hasil;
            } else {
                //console.log(angka)
            }
        } else if (node.operator_token.sama_dengan(TokenKeyword, "bukan")) {
            var newangka = angka.bukan()
            error = newangka.err;
            angka = newangka.hasil;
        } else if (node.operator_token.sama_dengan(TokenKeyword, "tipe")) {
            angka = new Str(angka.tipe || angka.constructor.name)
        }

        if (error) {
            return hasil.gagal(error)
        } else {
            return hasil.berhasil(
                angka.atur_posisi(node.posisi_awal, node.posisi_akhir)
            )
        }
    }

    kunjungi_NodeTernary(node, konteks) {
        var hasil = new HasilRuntime()
        var kondisi = hasil.daftar(this.kunjungi(node.kondisi, konteks))
        if (hasil.harus_return()) return hasil;
        var data;

        if (kondisi.apakah_benar()) {
            data = hasil.daftar(this.kunjungi(node.pilihan_satu, konteks))
            if (hasil.harus_return()) return res;
        } else {
            data = hasil.daftar(this.kunjungi(node.pilihan_dua, konteks))
            if (hasil.harus_return()) return res;
        }

        return hasil.berhasil(data)
    }

    kunjungi_NodeIF(node, konteks) {
        var res = new HasilRuntime()

        for (var i = 0; i < node.cases.length; i++) {
            var [kondisi, expr, harus_return_null] = node.cases[i];
            var kondisi_value = res.daftar(this.kunjungi(kondisi, konteks))
            if (res.harus_return()) return res;

            if (kondisi_value.apakah_benar()) {
                var isi_expr = res.daftar(this.kunjungi(expr, konteks))
                if (res.harus_return()) return res;
                return res.berhasil(harus_return_null ? Angka.nil : isi_expr)
            }
        }

        if (node.else_case) {
            var [expr, harus_return_null] = node.else_case
            var isi_else = res.daftar(this.kunjungi(expr, konteks))
            if (res.harus_return()) return res;
            return res.berhasil(harus_return_null ? Angka.nil : isi_else)
        }

        return res.berhasil(Angka.nil)
    }

    kunjungi_NodeFor(node, konteks) {
        var res = new HasilRuntime()
        var isi = []
        var step_value = new Angka(1)

        var isi_awal = res.daftar(this.kunjungi(node.node_mulai_nilai, konteks))
        if (res.harus_return()) return res;

        var isi_akhir = res.daftar(this.kunjungi(node.node_akhir_nilai, konteks))
        if (res.harus_return()) return res;

        if (node.node_step_nilai) {
            step_value = res.daftar(this.kunjungi(node.node_step_nilai, konteks))
            if (res.harus_return()) return res;
        }

        var i = isi_awal.nilai
        var kondisi;

        if (step_value.nilai >= 0) {
            kondisi = () => i < isi_akhir.nilai
        } else {
            kondisi = () => i > isi_akhir.nilai
        }

        while (kondisi()) {
            konteks.TabelSimbol.tulis(node.nama_token_variabel.value, new Angka(i))
            i += step_value.nilai

            var isinode = res.daftar(this.kunjungi(node.isi_node, konteks))
            if (res.harus_return() && res.loop_lanjutkan == false && res.loop_break == false) return res;

            if (res.loop_lanjutkan) continue;

            if (res.loop_break) break;

            isi.push(isinode)
        }

        return res.berhasil(node.harus_return_null ? Angka.nil : new Daftar(isi).atur_konteks(konteks).atur_posisi(node.posisi_awal, node.posisi_akhir))
    }

    kunjungi_NodeWhile(node, konteks) {
        var res = new HasilRuntime()
        var isi = []

        while (true) {
            var kondisi = res.daftar(this.kunjungi(node.kondisi, konteks))
            if (res.harus_return()) return res;

            if (!kondisi.apakah_benar() && res.loop_lanjutkan == false && res.loop_break == false) break;

            var isinode = res.daftar(this.kunjungi(node.isi_node, konteks))
            if (res.harus_return()) return res;

            if (res.loop_lanjutkan) continue;

            if (res.loop_break) break;

            isi.push(isinode)
        }

        return res.berhasil(node.harus_return_null ? Angka.nil : new Daftar(isi).atur_konteks(konteks).atur_posisi(node.posisi_awal, node.posisi_akhir))
    }


    kunjungi_NodeBuatFungsi(node, konteks) {
        var res = new HasilRuntime()

        var nama_fungsi = node.nama_token_variabel ? node.nama_token_variabel.value : null;
        var isi_node = node.isi_node
        var nama_parameter = node.nama_parameter_token.map(m => m.value)
        var isi_fungsi = new Fungsi(nama_fungsi, isi_node, nama_parameter, node.harus_return_null, konteks)
        .atur_konteks(konteks)
        .atur_posisi(node.posisi_awal, node.posisi_akhir)

        if (node.nama_token_variabel) konteks.TabelSimbol.tulis(nama_fungsi, isi_fungsi)

        return res.berhasil(isi_fungsi)
    }

    kunjungi_NodePanggil(node, konteks) {
        var res = new HasilRuntime()
        var parameters = []

        var isi_untuk_dipanggil = res.daftar(
            this.kunjungi(node.node_untuk_panggil, konteks)
        )
        if (res.harus_return()) return res;
        isi_untuk_dipanggil = isi_untuk_dipanggil.salin().atur_posisi(
            node.posisi_awal, node.posisi_akhir
        )

        for (var i = 0; i < node.node_parameter.length; i++) {
            parameters.push(res.daftar(this.kunjungi(node.node_parameter[i], konteks)))
            if (res.harus_return()) return res;
        }

        if (!(["BuiltInFungsi", "Fungsi", "BuiltInMetode"].includes(isi_untuk_dipanggil.constructor.name))) return res.gagal(new RTError(
            node.posisi_awal,
            node.posisi_akhir,
            `${node.node_untuk_panggil.nama_token_variabel ? node.node_untuk_panggil.nama_token_variabel.value : "Nilai tengah (...)()"} bukan sebuah fungsi`,
            konteks,
        ))
        var hasil = res.daftar(isi_untuk_dipanggil.esekusi(parameters, { Interpreter, Lexer, Parser, konteks }))
        if (res.harus_return()) return res;
        
        hasil = hasil.salin().atur_posisi(node.posisi_awal, node.posisi_akhir).atur_konteks(konteks)
        return res.berhasil(hasil)
    }

    kunjungi_NodeCoba(node, konteks) {
        var res = new HasilRuntime()
        var dicoba = res.daftar(this.kunjungi(node.yg_di_coba, konteks))
        var error_cb = new Fungsi("<tangkap>", node.error_callback, node.nama_var_error ? [node.nama_var_error.value] : []).atur_konteks(konteks).atur_posisi(node.posisi_awal, node.posisi_akhir);

        if (res.error) {
            res.daftar(error_cb.esekusi([new Str(`${res.error.nama_error}: ${res.error.details}`)], { Interpreter, Lexer, Parser, konteks }));
            if (res.harus_return()) return res;
        }

        return res.berhasil(Angka.nil);
    }

    kunjungi_NodeReturn(node, konteks) {
        var res = new HasilRuntime()
        var isi = Angka.nil

        if (node.node_untuk_return) {
            isi = res.daftar(this.kunjungi(node.node_untuk_return, konteks))
            if (res.harus_return()) return res;
        }

        //console.log("ketemu return ", isi)
        return res.berhasil_return(isi)
    }

    kunjungi_NodeEkspor(node, konteks) {
        var res = new HasilRuntime()
        var isi = Angka.nil

        if (node.node_untuk_ekspor) {
            isi = res.daftar(this.kunjungi(node.node_untuk_ekspor, konteks))
            if (res.harus_return()) return res;
        }

        //console.log("export", isi)
        return res.berhasil_return_module(isi)
    }

    kunjungi_NodeLanjutkan(node, konteks) {
        //console.log("ketemu continue")
        return new HasilRuntime().berhasil_lanjutkan()
    }

    kunjungi_NodeBerhenti(node, context) {
        // print("ketemu break")
        return new HasilRuntime().berhasil_break()
    }
}

const {
    Angka,
    Str,
    BooLean,
    Daftar,
    Fungsi,
    Nil,
    Objek
} = require("../lib/TipeData");


module.exports = {
    Interpreter,
    Konteks,
    TabelSimbol
}