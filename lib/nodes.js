/**
 * Node, tipe-tipe data / statements
 * ===========================================
 */


class BaseData {
    constructor(anytoken) {
        this.token = anytoken || {}
    }
    publik() {
        return this.token.value || ""
    }
}

/**
 * NodeAngka, tipe data angka
 * =
 */
class NodeAngka extends Number {
    constructor(token) {
        super(token.value)
        this.token = token
        this.posisi_awal = this.token.posisi_awal
        this.posisi_akhir = this.token.posisi_akhir
    }

    publik() {
        return this.token.value.toString()
    }
}

/**
 * NodeString, tipe data string
 * =
 */
class NodeString extends String {
    constructor(token) {
        super(token.value)
        this.token = token
        this.posisi_awal = this.token.posisi_awal
        this.posisi_akhir = this.token.posisi_akhir
    }

    publik() {
        return `"${this.token.value}"`
    }
}

/**
 * NodeOperasiBinary, 1 + 2,   (N_kiri, <operator>, N_kanan)
 * -
 */
class NodeOperasiBinary extends String {
    constructor(node_kiri, operator_token, node_kanan) {
        super(`(${node_kiri}, ${operator_token}, ${node_kanan})`)
        this.node_kiri = node_kiri
        this.operator_token = operator_token
        this.node_kanan = node_kanan

        this.posisi_awal = this.node_kiri.posisi_awal
        this.posisi_akhir = this.node_kanan.posisi_akhir
    }
}

/**
 * NodeOperatorMinus, i.e minus / unary (-1, -5, -12, ...)
 * -
 */
class NodeOperatorMinus extends String {
    constructor(operator_token, node) {
        super(`(${operator_token}, ${node})`)
        this.operator_token = operator_token
        this.node = node

        this.posisi_awal = this.operator_token.posisi_awal
        this.posisi_akhir = node.posisi_akhir
    }
}

/**
 * DaftarNode, tipe data Array / List
 * -
 */
class DaftarNode {
    constructor(isi_daftar, posisi_awal, posisi_akhir) {
        this.isi_daftar = isi_daftar

        this.posisi_awal = posisi_awal
        this.posisi_akhir = posisi_akhir
    }
}

/**
 * ObjekNode, tipe data Object / Hash
 * -
 */
 class ObjekNode {
    constructor(isi_objek, posisi_awal, posisi_akhir) {
        this.isi_objek = isi_objek

        this.posisi_awal = posisi_awal
        this.posisi_akhir = posisi_akhir
    }
}

/**
 * NodeAksesVariabel, Akses ke variabel 
 * -
 */
class NodeAksesVariabel {
    constructor(nama_token_variabel) {
        this.nama_token_variabel = nama_token_variabel

        this.posisi_awal = this.nama_token_variabel.posisi_awal
        this.posisi_akhir = this.nama_token_variabel.posisi_akhir
    }
}

/**
 * NodeBuatVariabel, buat variabel e.g (lokal <identifier> = <isi_node>)
 * -
 */
class NodeBuatVariabel extends String {
    constructor(nama_variabel_token, isi_node) {
        super(`lokal ${nama_variabel_token.value} = ${isi_node}`)
        this.nama_token_variabel = nama_variabel_token
        this.isi_node = isi_node

        this.posisi_awal = this.nama_token_variabel.posisi_awal
        this.posisi_akhir = this.nama_token_variabel.posisi_akhir
    }
}

/**
 * NodeEditVariabel, setelah deklarasi, setidaknya pasti di edit e.g (<identifier> = <isi_node_terbaru>)
 * -
 */
 class NodeEditVariabel extends String {
    constructor(nama_variabel_token, isi_node) {
        super(`${nama_variabel_token.value} = ${isi_node}`)
        this.nama_token_variabel = nama_variabel_token
        this.isi_node = isi_node

        this.posisi_awal = this.nama_token_variabel.posisi_awal
        this.posisi_akhir = this.nama_token_variabel.posisi_akhir
    }
}

/**
 * NodeIF, if statement class yg berisi block statements, i.e (jika, kalau, jikatidak)
 * -
 */
class NodeIF {
    constructor(cases, else_case) {
        this.cases = cases
        this.else_case = else_case

        this.posisi_awal = this.cases[0][0].posisi_awal
        this.posisi_akhir = (
            this.else_case || this.cases[this.cases.length - 1]
        )[0].posisi_akhir
    }
}

/**
 * NodeFor, looping forloop e.g (untuk <nama_token_variabel> = <node_mulai_nilai> ke <node_akhir_nilai> step <node_step_nilai> lakukan <isi> tutup
 * -
 */
class NodeFor {
    constructor(
        namalokal_token,
        node_mulai_nilai,
        node_akhir_nilai,
        node_step_nilai,
        isi_node,
        harus_return_null
    ) {
        this.nama_token_variabel = namalokal_token
        this.node_mulai_nilai = node_mulai_nilai
        this.node_akhir_nilai = node_akhir_nilai
        this.node_step_nilai = node_step_nilai
        this.isi_node = isi_node
        this.harus_return_null = harus_return_null

        this.posisi_awal = this.nama_token_variabel.posisi_awal
        this.posisi_akhir = this.isi_node.posisi_akhir
    }
}

/**
 * NodeWhile, looping while e.g (saat <kondisi> lakukan <isi_node> tutup)
 * -
 */
class NodeWhile {
    constructor(kondisi, isi_node, harus_return_null) {
        this.kondisi = kondisi
        this.isi_node = isi_node
        this.harus_return_null = harus_return_null

        this.posisi_awal = this.kondisi.posisi_awal
        this.posisi_akhir = this.isi_node.posisi_akhir
    }
}

/**
 * NodeBuatFungsi, class untuk menyimpan fungsi dan mendeskipsikan pembuatannya
 * -
 */
class NodeBuatFungsi {
    constructor(namalokal_token, nama_parameter_token, isi_node, harus_return_null) {
        this.nama_token_variabel = namalokal_token
        this.nama_parameter_token = nama_parameter_token
        this.isi_node = isi_node
        this.harus_return_null = harus_return_null

        if (this.nama_token_variabel) {
            this.posisi_awal = this.nama_token_variabel.posisi_awal
        } else if (this.nama_parameter_token.length > 0) {
            this.posisi_awal = this.nama_parameter_token[0].posisi_awal
        } else {
            this.posisi_awal = this.isi_node.posisi_awal
        }

        this.posisi_akhir = this.isi_node.posisi_akhir
    }
}

/**
 * NodePanggil, class untuk memanggil fungsi dan mendeskripsikan parameternya
 * -
 */
class NodePanggil {
    constructor(node_untuk_panggil, node_parameter) {
        //this.nama_fungsi = namafungsi || "<tidak diketahui>"
        this.node_untuk_panggil = node_untuk_panggil
        this.node_parameter = node_parameter

        this.posisi_awal = this.node_untuk_panggil.posisi_awal

        if (this.node_parameter.length > 0) {
            this.posisi_akhir = this.node_parameter[
                this.node_parameter.length - 1
            ].posisi_akhir
        } else {
            this.posisi_akhir = this.node_untuk_panggil.posisi_akhir
        }
    }
}

class NodeCoba {
    constructor(ygDiCoba, nama_var_error, errorCallback) {
        this.yg_di_coba = ygDiCoba
        this.nama_var_error = nama_var_error
        this.error_callback = errorCallback

        this.posisi_awal = this.yg_di_coba.posisi_awal
        this.posisi_akhir = this.error_callback.posisi_akhir
    }
}

/**
 * NodeIndeks, indeks untuk mengakses isi dari array / object
 * -
 */
 class NodeIndeks {
    constructor(node_untuk_indeks, indeks, editIndeks = null) {
        this.node_untuk_indeks = node_untuk_indeks
        this.indeks = indeks
        this.editIndeks = editIndeks

        this.posisi_awal = this.node_untuk_indeks.posisi_awal
        this.posisi_akhir = this.indeks.posisi_akhir
    }
}

/**
 * NodeTernary, Ternary operator e.g, `<kondisi>` ? `<expr1>` : `<expr0>`
 * -
 */
 class NodeTernary {
    constructor(kondisi, pilihan1, pilihan2) {
        this.kondisi = kondisi
        this.pilihan_satu = pilihan1
        this.pilihan_dua = pilihan2

        this.posisi_awal = this.kondisi.posisi_awal
        this.posisi_akhir = this.pilihan_dua.posisi_akhir
    }
}

/**
 * NodeReturn, mengembalikan data dari block statement, e.g `kembali <node_untuk_return>`
 * -
 */
class NodeReturn {
    constructor(node_to_return, poisi_awal, poisi_akhir) {
        this.node_untuk_return = node_to_return

        this.posisi_awal = poisi_awal
        this.posisi_akhir = poisi_akhir
    }
}

/**
 * NodeLanjutkan, skip loop 1x, ekuivalen dengan `continue`
 * -
 */
class NodeLanjutkan {
    constructor(poisi_awal, poisi_akhir) {
        this.posisi_awal = poisi_awal
        this.posisi_akhir = poisi_akhir
    }
}

/**
 * NodeBerhenti, menghentikan loop (berhenti), ekuivalen dengan `break`
 * -
 */
class NodeBerhenti {
    constructor(poisi_awal, poisi_akhir) {
        this.posisi_awal = poisi_awal
        this.posisi_akhir = poisi_akhir
    }
}


module.exports = {
    NodeAngka,
    NodeString,
    NodeOperasiBinary,
    NodeOperatorMinus,
    NodeTernary,
    DaftarNode,
    ObjekNode,
    NodeAksesVariabel,
    NodeBuatVariabel,
    NodeEditVariabel,
    NodeIndeks,
    NodeIF,
    NodeFor,
    NodeWhile,
    NodeBuatFungsi,
    NodePanggil,
    NodeCoba,
    NodeReturn,
    NodeLanjutkan,
    NodeBerhenti
}