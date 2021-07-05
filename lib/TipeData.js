const { RTError } = require("./errors")
const { HasilRuntime, Konteks, TabelSimbol } = require("./Runtime")
//const { Interpreter } = require("../src/interpreter")

function convert_tipe(data) {
  var hasil;
  switch (typeof data) {
    case "string":
      hasil = new Str(data)
      break;
    case "number":
      hasil = new Angka(data)
      break
    case "undefined":
      hasil = new Nil()
      break
    default:
      hasil = new Nil()
  }
  return hasil;
}

class Isi {
  constructor() {
    this.atur_posisi()
    this.atur_konteks()
  }

  atur_posisi(posisi_awal, posisi_akhir) {
    Object.defineProperty(this, "posisi_awal", {
      value: posisi_awal, enumerable: false, writable: true
    })
    Object.defineProperty(this, "posisi_akhir", {
      value: posisi_akhir, enumerable: false, writable: true
    })
    return this
  }

  atur_konteks(konteks) {
    Object.defineProperty(this, "konteks", {
      value: konteks, enumerable: false, writable: true
    })
    return this
  }

  tambah_ke(lain) {
    return { hasil: null, err: this.operasi_illegal(lain) }
  }

  kurangi_oleh(lain) {
    return { hasil: null, err: this.operasi_illegal(lain) }
  }

  kali_oleh(lain) {
    return { hasil: null, err: this.operasi_illegal(lain) }
  }

  bagi_oleh(lain) {
    return { hasil: null, err: this.operasi_illegal(lain) }
  }

  pangkat_oleh(lain) {
    return { hasil: null, err: this.operasi_illegal(lain) }
  }

  modulus_oleh(lain) {
    return { hasil: null, err: this.operasi_illegal(lain) }
  }

  perbandingan_persamaan(lain) {
    return { hasil: null, err: this.operasi_illegal(lain) }
  }

  perbandingan_tidak_sama(lain) {
    return { hasil: null, err: this.operasi_illegal(lain) }
  }

  perbandingan_kurang_dari(lain) {
    return { hasil: null, err: this.operasi_illegal(lain) }
  }

  perbandingan_lebih_dari(lain) {
    return { hasil: null, err: this.operasi_illegal(lain) }
  }

  perbandingan_sama_kurang_dari(lain) {
    return { hasil: null, err: this.operasi_illegal(lain) }
  }

  perbandingan_sama_lebih_dari(lain) {
    return { hasil: null, err: this.operasi_illegal(lain) }
  }

  dan_oleh(lain) {
    return { hasil: null, err: this.operasi_illegal(lain) }
  }

  atau_oleh(lain) {
    return { hasil: null, err: this.operasi_illegal(lain) }
  }

  bukan(lain) {
    return { hasil: null, err: this.operasi_illegal(lain) }
  }

  apakah_benar() {
    return false
  }

  salin() {
    throw new Error("Metode salin tidak diperbolehkan")
  }

  get publik() {
    return ""
  }

  operasi_illegal(lain) {
    if (!lain) lain = this;

    return new RTError(
      this.posisi_awal, lain.posisi_akhir, "Operasi Illegal", this.konteks
    )
  }
}

class Nil extends Isi {
  constructor() {
    super()
    this.nilai = 0
  }

  tambah_ke(dataLain) {
    if (dataLain instanceof Angka) {
      return { hasil: dataLain.salin(), err: null }
    } else if (dataLain instanceof Str) {
      return { hasil: new Str("nil" + dataLain.nilai), err: null }
    }
    return { hasil: this.salin(), err: null }
  }

  kurangi_oleh(dataLain) {
    if (dataLain instanceof Angka) {
      return { hasil: new Angka(-dataLain.nilai), err: null }
    }
    return { hasil: this.salin(), err: null }
  }

  kali_oleh(dataLain) {
    if (dataLain instanceof Angka) {
      return { hasil: new Angka(this.nilai * dataLain.nilai), err: null }
    }
    return { hasil: this.salin(), err: null }
  }

  bagi_oleh(lain) {
    if (dataLain instanceof Angka) {
      return { hasil: new Angka(this.nilai / dataLain.nilai), err: null }
    }
    return { hasil: this.salin(), err: null }
  }

  pangkat_oleh(lain) {
    if (dataLain instanceof Angka) {
      return { hasil: new Angka(this.nilai ^ dataLain.nilai), err: null }
    }
    return { hasil: this.salin(), err: null }
  }

  modulus_oleh(lain) {
    if (dataLain instanceof Angka) {
      return { hasil: new Angka(this.nilai % dataLain.nilai), err: null }
    }
    return { hasil: this.salin(), err: null }
  }

  dan_oleh(lain) {
    var hasil = this.nilai && lain.nilai
    return { hasil: convert_tipe(hasil).atur_konteks(this.konteks), err: null }
  }

  atau_oleh(lain) {
    var hasil = this.nilai || lain.nilai
    return { hasil: convert_tipe(hasil).atur_konteks(this.konteks), err: null }
  }

  bukan() {
    return { hasil: new Angka(this.nilai == 0 ? 1 : 0).atur_konteks(this.konteks), err: null }
  }

  salin() {
    var salinan = new Nil()
    salinan.atur_konteks(this.konteks)
    salinan.atur_posisi(this.posisi_awal, this.posisi_akhir)
    return salinan
  }

  get publik() {
    return "nil"
  }
}

class Angka extends Isi {
  constructor(nilai) {
    super()
    this.nilai = Number(nilai)
  }

  tambah_ke(lain) {
    if (lain instanceof Str) {
      return { hasil: new Str(this.nilai + lain.nilai).atur_konteks(this.konteks), err: null }
    } else if (lain instanceof Angka) {
      return { hasil: new Angka(this.nilai + lain.nilai), err: null }
    } else {
      return { hasil: new Nil().atur_konteks(this.konteks), err: null }
    }
  }

  kurangi_oleh(lain) {
    if (lain instanceof Angka) {
      return { hasil: new Angka(this.nilai - lain.nilai).atur_konteks(this.konteks), err: null }
    } else {
      return { hasil: new Nil().atur_konteks(this.konteks), err: null }
    }
  }

  kali_oleh(lain) {
    if (lain instanceof Angka) {
      return { hasil: new Angka(this.nilai * lain.nilai).atur_konteks(this.konteks), err: null }
    } else {
      return { hasil: new Nil().atur_konteks(this.konteks), err: null }
    }
  }

  bagi_oleh(lain) {
    if (lain instanceof Angka) {
      return { hasil: new Angka(this.nilai / lain.nilai).atur_konteks(this.konteks), err: null }
    } else {
      return { hasil: new Nil().atur_konteks(this.konteks), err: null }
    }
  }

  pangkat_oleh(lain) {
    if (lain instanceof Angka) {
      return { hasil: new Angka(this.nilai ^ lain.nilai).atur_konteks(this.konteks), err: null }
    } else {
      return { hasil: new Nil().atur_konteks(this.konteks), err: null }
    }
  }

  modulus_oleh(lain) {
    if (lain instanceof Angka) {
      return { hasil: new Angka(this.nilai % lain.nilai).atur_konteks(this.konteks), err: null }
    } else {
      return { hasil: new Nil().atur_konteks(this.konteks), err: null }
    }
  }

  perbandingan_persamaan(lain) {
    var hasil = new BooLean(this.nilai == lain.nilai).atur_konteks(this.konteks)
    return { hasil: hasil, err: null }
  }

  perbandingan_tidak_sama(lain) {
    var hasil = new BooLean(this.nilai != lain.nilai).atur_konteks(this.konteks)
    return { hasil: hasil, err: null }
  }

  perbandingan_kurang_dari(lain) {
    var hasil = new BooLean(this.nilai < lain.nilai).atur_konteks(this.konteks)
    return { hasil: hasil, err: null }
  }

  perbandingan_lebih_dari(lain) {
    var hasil = new BooLean(this.nilai > lain.nilai).atur_konteks(this.konteks)
    return { hasil: hasil, err: null }
  }

  perbandingan_sama_kurang_dari(lain) {
    var hasil = new BooLean(this.nilai <= lain.nilai).atur_konteks(this.konteks)
    return { hasil: hasil, err: null }
  }

  perbandingan_sama_lebih_dari(lain) {
    var hasil = new BooLean(this.nilai >= lain.nilai).atur_konteks(this.konteks)
    return { hasil: hasil, err: null }
  }

  dan_oleh(lain) {
    var hasil = convert_tipe(this.nilai && lain.nilai).atur_konteks(this.konteks)
    return { hasil: hasil, err: null }
  }

  atau_oleh(lain) {
    var hasil = convert_tipe(this.nilai || lain.nilai).atur_konteks(this.konteks)
    return { hasil: hasil, err: null }
  }

  bukan() {
    return { hasil: new BooLean(this.nilai == 0 ? 1 : 0).atur_konteks(this.konteks), err: null }
  }

  salin() {
    var salin = new Angka(this.nilai)
    salin.atur_konteks(this.konteks)
    salin.atur_posisi(this.posisi_awal, this.posisi_akhir)
    return salin
  }

  apakah_benar() {
    return this.nilai != 0
  }

  get publik() {
    return this.nilai.toString()
  }
}
Angka.nil = new Nil()

class Str extends Isi {
  constructor(nilai) {
    super()
    this.nilai = nilai
  }

  tambah_ke(lain) {
    if (lain instanceof Angka) {
      return { hasil: new Str(this.nilai + lain.nilai.toString()), err: null }
    } else if (lain instanceof Str) {
      return { hasil: new Str(this.nilai + lain.nilai), err: null }
    } else if (lain instanceof Nil) {
      return { hasil: new Str(this.nilai + "nil"), err: null }
    } else if (lain instanceof BooLean) {
      return { hasil: new Str(this.nilai + lain.publik), err: null }
    } else {
      return { hasil: new Nil(), err: null }
    }
  }

  kali_oleh(lain) {
    if (lain instanceof Angka) {
      return { hasil: new Str(this.nilai.repeat(lain.nilai)), err: null }
    } else {
      return { hasil: new Nil(), err: null }
    }
  }

  bagi_oleh(lain) {
    return { hasil: new Nil().atur_konteks(this.konteks), err: null }
  }

  pangkat_oleh(lain) {
    return { hasil: new Nil().atur_konteks(this.konteks), err: null }
  }

  modulus_oleh(lain) {
    return { hasil: new Nil().atur_konteks(this.konteks), err: null }
  }

  perbandingan_persamaan(lain) {
    var hasil = new BooLean(this.nilai == lain.nilai).atur_konteks(this.konteks)
    return { hasil: hasil, err: null }
  }

  perbandingan_tidak_sama(lain) {
    var hasil = new BooLean(this.nilai != lain.nilai).atur_konteks(this.konteks)
    return { hasil: hasil, err: null }
  }

  perbandingan_kurang_dari(lain) {
    var hasil = new BooLean(this.nilai < lain.nilai).atur_konteks(this.konteks)
    return { hasil: hasil, err: null }
  }

  perbandingan_lebih_dari(lain) {
    var hasil = new BooLean(this.nilai > lain.nilai).atur_konteks(this.konteks)
    return { hasil: hasil, err: null }
  }

  perbandingan_sama_kurang_dari(lain) {
    var hasil = new BooLean(this.nilai <= lain.nilai).atur_konteks(this.konteks)
    return { hasil: hasil, err: null }
  }

  perbandingan_sama_lebih_dari(lain) {
    var hasil = new BooLean(this.nilai >= lain.nilai).atur_konteks(this.konteks)
    return { hasil: hasil, err: null }
  }

  dan_oleh(lain) {
    var hasil = convert_tipe(this.nilai && lain.nilai).atur_konteks(this.konteks)
    return { hasil: hasil, err: null }
  }

  atau_oleh(lain) {
    var hasil = convert_tipe(this.nilai || lain.nilai).atur_konteks(this.konteks)
    return { hasil: hasil, err: null }
  }

  bukan() {
    return { hasil: new BooLean(this.nilai != "" ? 1 : 0).atur_konteks(this.konteks), err: null }
  }

  salin() {
    var salin = new Str(this.nilai)
    salin.atur_konteks(this.konteks)
    salin.atur_posisi(this.posisi_awal, this.posisi_akhir)
    return salin
  }

  apakah_benar() {
    return this.nilai != ""
  }

  get publik() {
    return this.nilai
  }

  get publik2() {
    return `"${this.nilai}"`
  }
}

class BooLean extends Isi {
  constructor(n) {
    super()
    this.nilai = n;
  }

  perbandingan_persamaan(lain) {
    var hasil = new BooLean(this.nilai == lain.nilai).atur_konteks(this.konteks)
    return { hasil: hasil, err: null }
  }

  perbandingan_tidak_sama(lain) {
    var hasil = new BooLean(this.nilai != lain.nilai).atur_konteks(this.konteks)
    return { hasil: hasil, err: null }
  }

  perbandingan_kurang_dari(lain) {
    var hasil = new BooLean(this.nilai < lain.nilai).atur_konteks(this.konteks)
    return { hasil: hasil, err: null }
  }

  perbandingan_lebih_dari(lain) {
    var hasil = new BooLean(this.nilai > lain.nilai).atur_konteks(this.konteks)
    return { hasil: hasil, err: null }
  }

  perbandingan_sama_kurang_dari(lain) {
    var hasil = new BooLean(this.nilai <= lain.nilai).atur_konteks(this.konteks)
    return { hasil: hasil, err: null }
  }

  perbandingan_sama_lebih_dari(lain) {
    var hasil = new BooLean(this.nilai >= lain.nilai).atur_konteks(this.konteks)
    return { hasil: hasil, err: null }
  }

  dan_oleh(lain) {
    var hasil = convert_tipe(this.nilai && lain.nilai).atur_konteks(this.konteks)
    return { hasil: hasil, err: null }
  }

  atau_oleh(lain) {
    var hasil = convert_tipe(this.nilai || lain.nilai).atur_konteks(this.konteks)
    return { hasil: hasil, err: null }
  }

  bukan() {
    return { hasil: new BooLean(!this.nilai).atur_konteks(this.konteks), err: null }
  }

  apakah_benar() {
    return this.nilai
  }

  salin() {
    var salin = new BooLean(this.nilai)
    salin.atur_konteks(this.konteks)
    salin.atur_posisi(this.posisi_awal, this.posisi_akhir)
    return salin
  }

  get publik() {
    return this.nilai ? "benar" : "salah"
  }
}
BooLean.salah = new BooLean(0);
BooLean.benar = new BooLean(1);

class Daftar extends Isi {
  constructor(isi_elemen) {
    super()
    this.isi = isi_elemen
  }

  tambah_ke(lain) {
    var daftar_baru = this.salin()
    daftar_baru.isi.push(lain)
    return { hasil: daftar_baru, err: null }
  }

  braket_akses(indeks) {
    return this.isi[indeks.nilai] || Angka.nil
  }

  salin() {
    var salin = new Daftar(this.isi)
    salin.atur_konteks(this.konteks)
    salin.atur_posisi(this.posisi_awal, this.posisi_akhir)
    return salin
  }

  get publik() {
    return `[${this.isi.map(e => e.publik2 || e.publik).join(", ")}]`
  }
}

class BaseFungsi extends Isi {
  constructor(nama) {
    super()
    this.nama = nama || "<fungsi tanpa nama>"
  }

  buat_konteks_baru() {
    var konteks_baru = new Konteks(this.nama, this.konteks, this.posisi_awal)
    konteks_baru.TabelSimbol = new TabelSimbol(konteks_baru.induk.TabelSimbol)

    return konteks_baru
  }

  cek_parameter(nama_parameter, parameter) {
    var res = new HasilRuntime()

    if (parameter.length > nama_parameter.length) {
      var list_sementara = parameter
      while (list_sementara.length > nama_parameter.length) {
        list_sementara.pop()
      }
      parameter = list_sementara
    }

    if (parameter < nama_parameter) {
      var list_sementara = parameter
      while (list_sementara.length < nama_parameter.length)
        list_sementara.push(
          new Nil()
            .atur_konteks(this.konteks)
            .atur_posisi(this.posisi_awal, this.posisi_akhir)
        )
      parameter = list_sementara
    }

    return res.berhasil(parameter)
  }

  hitung_parameter(nama_parameters, parameters, konteks) {
    for (var i = 0; i < parameters.length; i++) {
      var nama_parameter = nama_parameters[i]
      var isi_parameter = parameters[i]
      isi_parameter.atur_konteks(konteks)
      konteks.TabelSimbol.tulis(nama_parameter, isi_parameter)
    }
  }

  cek_dan_hitung_parameter(nama_parameter, parameter, konteks) {
    var res = new HasilRuntime()
    parameter = res.daftar(this.cek_parameter(nama_parameter, parameter))
    if (res.harus_return()) return res
    this.hitung_parameter(nama_parameter, parameter, konteks)
    return res.berhasil(null)
  }

  get publik() {
    return "<fungsi " + this.nama + ">"
  }
}

class Fungsi extends BaseFungsi {
  constructor(nama, isi_node, nama_parameter, harus_return_null) {
    super(nama)
    this.isi_node = isi_node
    this.nama_parameter = nama_parameter
    Object.defineProperty(this, "harus_return_null", {
      value: harus_return_null, enumerable: false, writable: true
    })
  }

  esekusi(parameter, interp) {
    var res = new HasilRuntime()
    var interpreter = new interp()
    var konteks_baru = this.buat_konteks_baru()

    res.daftar(
      this.cek_dan_hitung_parameter(this.nama_parameter, parameter, konteks_baru)
    )
    if (res.harus_return()) return res;

    var nilai = res.daftar(interpreter.kunjungi(this.isi_node, konteks_baru))
    if (res.harus_return() && !(res.isi_returned_fungsi)) return res;

    var isi_yg_direturn = (this.harus_return_null ? nilai : null) || res.isi_returned_fungsi || Angka.nil
    return res.berhasil(isi_yg_direturn)
  }

  salin() {
    var salinan = new Fungsi(this.nama, this.isi_node, this.nama_parameter, this.harus_return_null)
    salinan.atur_konteks(this.konteks)
    salinan.atur_posisi(this.posisi_awal, this.posisi_akhir)
    return salinan
  }
}

class BuiltInFungsi extends BaseFungsi {
  constructor(nama) {
    super(nama)
  }

  esekusi(params) {
    var res = new HasilRuntime()
    var konteks_esekusi = this.buat_konteks_baru()

    var nama_metode = `esekusi_${this.nama}`
    if (!this[nama_metode]) this.tidak_nemu(node, konteks);

    res.daftar(
      this.cek_dan_hitung_parameter(
        this[nama_metode].nama_parameter, params, konteks_esekusi
      )
    )
    if (res.harus_return()) return res;

    var hasil = res.daftar(this[nama_metode](konteks_esekusi))
    if (res.harus_return()) return res;
    return res.berhasil(hasil)
  }

  tidak_nemu(node, konteks) {
    throw new Error(`GK nemu built in fungsi: \`kunjungi_${node.constructor.name}`, konteks)
  }

  salin() {
    var salinan = new BuiltInFungsi(this.nama)
    salinan.atur_konteks(this.konteks)
    salinan.atur_posisi(this.posisi_awal, this.posisi_akhir)
    return salinan
  }

  /* Built in fungsi, handler */

  esekusi_print(konteks_esekusi) {
    var data = konteks_esekusi.TabelSimbol.dapat("isi")
    console.log(data.publik || data.nilai || data.isi || "nil")
    return new HasilRuntime().berhasil(Angka.nil)
  }
  esekusi_eval(konteks_esekusi) {
      new Interpre
  }
}
BuiltInFungsi.prototype.esekusi_print.nama_parameter = ["isi"];
BuiltInFungsi.prototype.esekusi_eval.nama_parameter = ["str"];

/**
 * Daftar built in fungsi
 */
BuiltInFungsi.tulis = new BuiltInFungsi("print")


module.exports = {
  Isi,
  Nil,
  Angka,
  Str,
  BooLean,
  Daftar,
  BaseFungsi,
  Fungsi,
  BuiltInFungsi
}