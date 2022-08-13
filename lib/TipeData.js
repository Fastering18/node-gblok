const { RTError } = require("./errors")
const { HasilRuntime, Konteks, TabelSimbol } = require("./Runtime")
const { tunggu, sleep } = require("./utility")
const { getPackageFromDirectory } = require("../cmd/projek")
var readlineSync = require('readline-sync');
const fs = require("fs")
const path = require("path")
//const { Lexer, Parser, Interpreter} = require("../main")

//var XORAngka = (n) => n * -1 - 1
const DataTypes = [
  "Objek", "Angka", "Str",
  "Boolean", "Daftar", "Function",
  "Nil"
];

function convert_tipe(data) {
  var hasil;
  switch (typeof data) {
    case "boolean":
      hasil = new BooLean(data)
      break;
    case "string":
      hasil = new Str(data)
      break;
    case "number":
      hasil = new Angka(data)
      break
    case "undefined":
      hasil = new Nil()
      break
    case "object":
      if (Array.isArray(data)) hasil = new Daftar(data);
      else hasil = new Objek(data);
      break
    default:
      hasil = new Nil()
  }
  return hasil;
}

function convert_to_nodejs(data) {
  if (data === undefined) return;

  var hasil;
  switch (data.constructor.name) {
    case "BooLean":
      hasil = !!data.nilai
      break;
    case "Str":
      hasil = data.nilai
      break;
    case "Angka":
      hasil = data.nilai
      break
    case "Nil":
      hasil = null
      break
    case "Objek":
      hasil = {}
      for (var k in data.nilai) hasil[k] = convert_to_nodejs(data.nilai[k]);
      break
    case "Daftar":
      hasil = data.nilai.map(convert_to_nodejs)
      break
    case "Fungsi":
      hasil = convert_tofunction_nodejs(data)
      break
    default:
      hasil = new Nil()
  }
  return hasil;
}

function convert_tofunction_nodejs(fn) {
  var hasil = (...params) => {
    let gblkparams = params.map(convert_to_nodejs)
    let fnresult = data.esekusi(gblkparams)
    return convert_to_nodejs(fnresult.value)
  }
}

function defaultTabelSimbol() {
  var tbsimbol = new TabelSimbol()
  tbsimbol.tulis("salah", BooLean.salah)
  tbsimbol.tulis("benar", BooLean.benar)
  tbsimbol.tulis("nil", Angka.nil)

  // I/O funcs
  tbsimbol.tulis("print", BuiltInFungsi.tulis)
  tbsimbol.tulis("input", BuiltInFungsi.input)
  tbsimbol.tulis("tunggu", BuiltInFungsi.tunggu)

  // Arrays
  tbsimbol.tulis("panjang", BuiltInFungsi.panjang)

  // Utility
  tbsimbol.tulis("eval", BuiltInFungsi.eval)
  tbsimbol.tulis("impor", BuiltInFungsi.import)
  tbsimbol.tulis("proses", new Objek({
    argumen: new Daftar(process.argv.map(d => new Str(d))),
    mati: BuiltInFungsi.mati,
    binding: BuiltInFungsi.binding
  }))

  // module matematika
  tbsimbol.tulis("mtk", new Objek({
    jumlah: buatFungsi("penjumlahan", ["array_angka"], function penjumlahan(konteks) {
      var res = new HasilRuntime()
      let daftarAngka = konteks.TabelSimbol.dapat("array_angka")

      assertTipe(res, daftarAngka, Daftar, 1)
      if (res.harus_return()) return res;

      let jumlah = daftarAngka.nilai.reduce((a, b) => a + b.nilai, 0)
      return res.berhasil(new Angka(jumlah))
    }),
    akar2: buatFungsi("akar_kuadrat", ["angka"], function penjumlahan(konteks) {
      var res = new HasilRuntime()
      let angka = konteks.TabelSimbol.dapat("angka")

      assertTipe(res, angka, Angka, 1)
      if (res.harus_return()) return res;

      let jumlah = Math.sqrt(angka.nilai)
      return res.berhasil(new Angka(jumlah))
    }),
    pangkat: buatFungsi("pangkat2", ["angka", "pangkat"], function penjumlahan(konteks) {
      var res = new HasilRuntime()
      let angka = konteks.TabelSimbol.dapat("angka"),
        pangkat = konteks.TabelSimbol.dapat("pangkat");

      assertTipe(res, angka, Angka, 1)
      if (res.harus_return()) return res;
      assertTipe(res, pangkat, Angka, 2)
      if (res.harus_return()) return res;

      let jumlah = angka.nilai ** pangkat.nilai
      return res.berhasil(new Angka(jumlah))
    })
  }))

  return tbsimbol
}

function defaultKonteks(nama, tbsimbol) {
  if (!tbsimbol) {
    tbsimbol = global_tabel_simbol
  }

  var konteks = new Konteks(typeof nama == "string" ? nama : "<program>")
  konteks.TabelSimbol = tbsimbol
  return konteks
}

class Isi {
  constructor() {
    this.atur_posisi()
    this.atur_konteks()
    this.metode = {}
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

  akses(lain) {
    return { hasil: null, err: this.operasi_illegal(lain) }
  }

  apakah_benar() {
    return false
  }

  XOR() {
    return { hasil: new Angka(-1), err: null }
  }

  salin() {
    throw new Error("Metode salin tidak diperbolehkan")
  }

  get publik() {
    return ""
  }

  operasi_error(lain, err = "Error") {
    if (!lain) lain = this;

    return new RTError(
      this.posisi_awal, lain.posisi_akhir, err, this.konteks
    )
  }

  operasi_illegal(lain) {
    return this.operasi_error(lain, "Operasi Illegal")
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

    this.metode.metode_teks = new BuiltInMetode("jadiString", this)
  }

  jadi_koma() {
    if (this.nilai % 1 != 0) {
      return { hasil: null, err: this.operasi_error(null, "Titik koma yang tidak terduga") }
    }
    return { hasil: new Angka(this.nilai >= 0 ? this.nilai / (10 ** this.nilai.toString().length) : this.nilai), err: null };
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

  XOR() {
    // var xor = (n) => n * -1 + (n >= -1 ? -1 : 1)
    return { hasil: new Angka(this.nilai * -1 - 1).atur_konteks(this.konteks), err: null }
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

    this.metode.metode_teks = new BuiltInMetode("jadiString", this)
    this.metode.metode_kecil = new BuiltInMetode("kecil", this)
    this.metode.metode_besar = new BuiltInMetode("besar", this)
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
      if (lain.nilai < 0) return { hasil: null, err: this.operasi_error(lain, "Angka kedua tidak boleh kurang dari 0") }
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
    return `${this.nilai}`
  }
}

class BooLean extends Isi {
  constructor(n) {
    super()
    this.nilai = n;

    //this.metode.metode_jadiString = new BuiltInMetode("jadiString", this)
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
    //console.log(hasil, this.nilai, lain.nilai)
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
    this.nilai = isi_elemen

    this.metode.metode_teks = new BuiltInMetode("jadiString", this)
  }

  static inspek(daft) {
    return `[${daft.nilai.map(e => e instanceof Str ? `"${e.nilai}"` : e.publik).join(", ")}]`
  }

  tambah_ke(lain) {
    var daftar_baru = this.salin()
    daftar_baru.nilai.push(lain)
    return { hasil: daftar_baru, err: null }
  }

  akses(lain) {
    if (typeof (lain) == "string" || typeof (lain) == "number") return { hasil: this.nilai[lain], err: null }
    else if (!(lain instanceof Str) && !(lain instanceof Angka)) return { hasil: Angka.nil, err: null }
    else return { hasil: this.nilai[lain instanceof Angka ? lain.nilai - 1 : lain.nilai] || Angka.nil, err: null };
  }

  salin() {
    var salin = new Daftar(this.nilai)
    salin.atur_konteks(this.konteks)
    salin.atur_posisi(this.posisi_awal, this.posisi_akhir)
    return salin
  }

  get publik() {
    return Daftar.inspek(this)
  }
}

class Objek extends Isi {
  constructor(isi_objek) {
    super()
    this.nilai = isi_objek;
  }

  static inspek(objk) {
    var obj = objk.nilai;
    return `{${Object.keys(obj).map((v) => `${v}: ${obj[v] instanceof Str ? `"${obj[v].nilai}"` : obj[v].publik || obj[v].nilai}`).join(", ")}}`
  }

  tambah_ke(lain) {
    if (lain instanceof Objek) return { hasil: new Objek(Object.assign(this.nilai, lain.nilai)), err: null };
    return { hasil: Angka.nil, err: null }
  }

  akses(lain) {
    if (!(lain instanceof Str) && !(lain instanceof Angka)) return { hasil: Angka.nil, err: null };
    return { hasil: this.nilai[lain instanceof Angka ? lain.nilai - 1 : lain.nilai] || Angka.nil, err: null }
  }

  salin() {
    var salin = new Objek(this.nilai)
    salin.atur_konteks(this.konteks)
    salin.atur_posisi(this.posisi_awal, this.posisi_akhir)
    return salin
  }

  get publik() {
    return Objek.inspek(this)
  }
}

class BaseFungsi extends Isi {
  constructor(nama, originKonteks) {
    super()
    this.nama = nama || "<fungsi tanpa nama>"
    this.originKonteks = originKonteks
  }

  buat_konteks_baru() {
    var konteks_baru = new Konteks(this.nama, this.originKonteks || this.konteks, this.posisi_awal) //this.konteks
    konteks_baru.TabelSimbol = new TabelSimbol(konteks_baru.induk ? konteks_baru.induk.TabelSimbol : undefined)
    konteks_baru.lokasi = this.konteks ? this.konteks.lokasi : ""
    //console.log(konteks_baru.display_nama, konteks_baru.TabelSimbol,)

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

  daftar_parameter(nama_parameters, parameters, konteks) {
    for (var i = 0; i < parameters.length; i++) {
      var nama_parameter = nama_parameters[i]
      var isi_parameter = parameters[i]
      //console.log(isi_parameter)
      isi_parameter.atur_konteks(konteks)
      konteks.TabelSimbol.tulis(nama_parameter, isi_parameter)
    }
  }

  daftar_variadic(parameters, konteks) {
    var argumen = new Daftar([])
    for (var i = 0; i < parameters.length; i++) {
      argumen.nilai.push(parameters[i])
    }
    //console.log(argumen, "argumen")
    konteks.TabelSimbol.tulis("argumen", argumen)
  }

  cek_dan_hitung_parameter(nama_parameter, old_parameter, konteks) {
    var res = new HasilRuntime()
    this.daftar_variadic(old_parameter, konteks)

    var parameter = res.daftar(this.cek_parameter(nama_parameter, old_parameter))
    if (res.harus_return()) return res;

    this.daftar_parameter(nama_parameter, parameter, konteks)
    return res.berhasil(null)
  }

  get publik() {
    return "<fungsi " + this.nama + ">"
  }
}

class Fungsi extends BaseFungsi {
  constructor(nama, isi_node, nama_parameter, harus_return_null, originKonteks) {
    super(nama, originKonteks)
    this.isi_node = isi_node
    this.nama_parameter = nama_parameter
    Object.defineProperty(this, "harus_return_null", {
      value: harus_return_null, enumerable: false, writable: true
    })
  }

  esekusi(parameter, { Interpreter }) {
    var res = new HasilRuntime()
    var interpreter = new Interpreter()
    var konteks_baru = this.buat_konteks_baru()
    //console.log("ori", this.originKonteks)

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
    var salinan = new Fungsi(this.nama, this.isi_node, this.nama_parameter, this.harus_return_null, this.originKonteks)
    salinan.atur_konteks(this.konteks)
    salinan.atur_posisi(this.posisi_awal, this.posisi_akhir)
    return salinan
  }
}

class BuiltInFungsi extends BaseFungsi {
  constructor(nama, NATIVE = false) {
    super(nama)
    this.native = NATIVE
  }

  esekusi(params, { Interpreter, Parser, Lexer, konteks }) {
    var res = new HasilRuntime()
    var konteks_esekusi = this.buat_konteks_baru()

    var nama_metode = `esekusi_${this.nama}`
    if (!this[nama_metode]) this.tidak_nemu(nama_metode, konteks_esekusi);

    res.daftar(
      this.cek_dan_hitung_parameter(
        this[nama_metode].nama_parameter, params, konteks_esekusi
      )
    )
    if (res.harus_return()) return res;

    var hasil = res.daftar(this[nama_metode](konteks_esekusi, { Lexer, Parser, Interpreter, konteks }))
    if (res.harus_return()) return res;
    return res.berhasil(hasil)
  }

  tidak_nemu(node, konteks) {
    throw new Error(`GK nemu built in fungsi: \`kunjungi_${node}`, konteks)
  }

  salin() {
    var salinan = new BuiltInFungsi(this.nama, this.native)
    salinan.atur_konteks(this.konteks)
    salinan.atur_posisi(this.posisi_awal, this.posisi_akhir)
    return salinan
  }

  /* Built in fungsi, handler */

  esekusi_print(konteks_esekusi) {
    var argumen = konteks_esekusi.TabelSimbol.dapat("argumen")

    console.log(argumen.nilai.map(d => d.publik || d.nilai || d.isi || "nil").join("\t"));

    //console.log(typeof (data.publik) == "string" ? data.publik : (data.nilai || data.isi || "nil"))
    return new HasilRuntime().berhasil(Angka.nil)
  }
  esekusi_eval(konteks_esekusi, { Lexer, Parser, Interpreter, konteks }) {
    //console.log(konteks_esekusi.TabelSimbol.dapat("script"))
    if (!(konteks_esekusi.TabelSimbol.dapat("script") instanceof Str)) return new HasilRuntime().berhasil(konteks_esekusi.TabelSimbol.dapat("script"))

    const lex = new Lexer("eval", konteks_esekusi.TabelSimbol.dapat("script").nilai)
    var { hasil, err } = lex.buatToken()
    if (err) return new HasilRuntime().gagal(err)

    hasil = new Parser(hasil).parse()
    if (hasil.error) return new HasilRuntime().gagal(hasil.error)

    var interpreter = new Interpreter()
    hasil = interpreter.kunjungi(hasil.node, konteks)
    if (hasil.error) return new HasilRuntime().gagal(hasil.error);

    //console.log(hasil, hasil.value.nilai[hasil.value.nilai.length-1])
    return new HasilRuntime().berhasil(hasil.value.nilai[hasil.value.nilai.length - 1] || Angka.nil)
  }

  esekusi_tunggu(konteks_esekusi) {
    var detik = (konteks_esekusi.TabelSimbol.dapat("detik") || { nilai: 1 }).nilai
    try {
      tunggu(detik);
    } catch (e) {
      try {
        sleep(detik)
      } catch (er) {
        return new HasilRuntime().berhasil(Angka.nil)
      }
    }
    return new HasilRuntime().berhasil(Angka.nil)
  }

  esekusi_panjang(konteks_esekusi) {
    var res = new HasilRuntime()
    var data = konteks_esekusi.TabelSimbol.dapat("data")
    if (!(data instanceof Daftar) && !(data instanceof Str))
      return res.gagal(Angka.nil);

    return res.berhasil(new Angka(data.nilai.length))
  }

  esekusi_impor(konteks_esekusi, { Lexer, Parser, Interpreter, konteks }) {
    var res = new HasilRuntime()
    var nama_module = konteks_esekusi.TabelSimbol.dapat("module_path")

    if (!(nama_module instanceof Str)) return res.gagal(new RTError(
      this.posisi_awal, this.posisi_akhir, "Lokasi file harus berupa string", this.konteks
    ))

    var proj = getPackageFromDirectory(path.resolve(process.cwd(), konteks.lokasi, "..", "gblk_modules", nama_module.nilai))

    var abs_path_modul = proj ? path.join(proj.lokasi, "..", proj.script) : path.resolve(process.cwd(), konteks.lokasi, "..", nama_module.nilai)
    //console.log(abs_path_modul, "\n", process.cwd(), konteks.lokasi, nama_module.nilai)

    if (!fs.existsSync(abs_path_modul) && !proj) return res.gagal(new RTError(
      this.posisi_awal, this.posisi_akhir, `File ${nama_module.nilai} tidak ditemukan`, this.konteks
    ))
    var isi_script = fs.readFileSync(abs_path_modul)
    const lex = new Lexer(proj ? proj.nama : path.basename(abs_path_modul), isi_script.toString())
    var { hasil, err } = lex.buatToken()
    if (err) return res.gagal(err)

    hasil = new Parser(hasil).parse()
    if (hasil.error) return res.gagal(hasil.error)

    var interpreter = new Interpreter()
    var nkonteks = defaultKonteks("module")
    nkonteks.lokasi = abs_path_modul
    hasil = interpreter.kunjungi(hasil.node, nkonteks)
    if (hasil.error) return res.gagal(hasil.error);

    //console.log(hasil)
    return res.berhasil(hasil.modules || Angka.nil)
  }

  esekusi_mati_proses(konteks_esekusi) {
    var kode_exit = (konteks_esekusi.TabelSimbol.dapat("exit_code") || { nilai: 0 }).nilai;
    process.exit(kode_exit)
  }

  esekusi_input(konteks_esekusi) {
    var label = konteks_esekusi.TabelSimbol.dapat("label")
    var jwb = readlineSync.question(label ? label.nilai : undefined)
    return new HasilRuntime().berhasil(new Str(jwb))
  }

  esekusi_binding(konteks_esekusi, { konteks }) {
    // unsafe
    var res = new HasilRuntime()
    var modfile = konteks_esekusi.TabelSimbol.dapat("file")

    assertTipe(res, modfile, Str, 1)
    if (res.harus_return()) return res;

    var modfilepath = path.resolve(process.cwd(), konteks.lokasi || ".", "..", modfile.nilai)

    try {
      var mod = require(modfilepath)
    } catch (err) {
      return res.gagal(new RTError(
        this.posisi_awal, this.posisi_akhir, `Lokasi file '${modfilepath}' tidak ditemukan`, this.konteks
      ))
    }

    let gblkVar = nativeBindingVariable(mod)

    return res.berhasil(gblkVar)
  }
}
BuiltInFungsi.prototype.esekusi_print.nama_parameter = [];
BuiltInFungsi.prototype.esekusi_input.nama_parameter = ["label"]
BuiltInFungsi.prototype.esekusi_eval.nama_parameter = ["script"];
BuiltInFungsi.prototype.esekusi_tunggu.nama_parameter = ["detik"];
BuiltInFungsi.prototype.esekusi_panjang.nama_parameter = ["data"]
BuiltInFungsi.prototype.esekusi_impor.nama_parameter = ["module_path"];
BuiltInFungsi.prototype.esekusi_mati_proses.nama_parameter = ["exit_code"]
BuiltInFungsi.prototype.esekusi_binding.nama_parameter = ["file"]


/**
 * Daftar built in fungsi
 */
BuiltInFungsi.tulis = new BuiltInFungsi("print")
BuiltInFungsi.input = new BuiltInFungsi("input")
BuiltInFungsi.tunggu = new BuiltInFungsi("tunggu")
BuiltInFungsi.panjang = new BuiltInFungsi("panjang")
BuiltInFungsi.eval = new BuiltInFungsi("eval")
BuiltInFungsi.import = new BuiltInFungsi("impor")
BuiltInFungsi.mati = new BuiltInFungsi("mati_proses")
BuiltInFungsi.binding = new BuiltInFungsi("binding")


const isClass = fn => /^\s*class/.test(fn.toString());

// public
function nativeBindingVariable(v) {
  // warning: bind nodejs native variables into gblk

  if (Array.isArray(v)) {
    return convert_tipe(v.map(d => nativeBindingVariable(d)))
  } else if (typeof v == "function") {
    return nativeBindingFunction(v)
  } else if (typeof v == "object" && v) {
    let newobj = {}
    for (var k of Object.getOwnPropertyNames(v)) newobj[k] = nativeBindingVariable(v[k]);
    //for (var kProto of Object.getOwnPropertyNames(v.constructor.prototype)) newobj[kProto] = nativeBindingVariable(v.constructor.prototype[kProto]);
    return convert_tipe(newobj)
  }
  return convert_tipe(v)
}

function nativeBindingFunction(fn, filename = "native_") {
  const paramSignatures = ["__basecls", ...new Array(fn.length).fill().map((_, i) => filename + fn.name + i)]
  return buatFungsi(fn.name, paramSignatures, function (konteks) {
    var res = new HasilRuntime()

    let [basecls, ...params] = paramSignatures.map(n => {
      let d = konteks.TabelSimbol.dapat(n)
      return convert_to_nodejs(d)
    })

    //console.log(basecls, params, paramSignatures)
    let fnres = isClass(fn) ? new fn(basecls, ...params) : fn.bind(basecls)(...params);

    return res.berhasil(nativeBindingVariable(fnres))
  }, true)
}

function buatFungsi(nama, parameters, fn, isNative) {
  var signature = "esekusi_" + nama
  var res = BuiltInFungsi.prototype[signature] = fn
  res.nama_parameter = parameters

  return new BuiltInFungsi(nama, isNative)
}

function assertTipe(res, data, tipe, nomer = "?") {
  //console.log(data.posisi_awal)
  if (!(data instanceof tipe)) return res.gagal(new RTError(
    data.posisi_awal, data.posisi_akhir, `Parameter #${nomer} harus berupa ${tipe.name}`, this.konteks
  ))
  return true
}

//on working
class BuiltInMetode extends BaseFungsi {
  constructor(nama, node) {
    super(nama)
    this.isiDefault = node
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

    var hasil = res.daftar(this[nama_metode](this.isiDefault, konteks_esekusi))
    if (res.harus_return()) return res;
    return res.berhasil(hasil)
  }

  tidak_nemu(node, konteks) {
    throw new Error(`GK nemu built in fungsi: \`kunjungi_${node.constructor.name}`, konteks)
  }

  salin() {
    var salinan = new BuiltInMetode(this.nama, this.isiDefault)
    salinan.atur_konteks(this.konteks)
    salinan.atur_posisi(this.posisi_awal, this.posisi_akhir)
    return salinan
  }

  /* Built in metode, handler */

  esekusi_print(self, konteks_esekusi) {
    console.log(self.publik || self.nilai || self.isi || "nil")
    return new HasilRuntime().berhasil(Angka.nil)
  }

  esekusi_kecil(self, konteks_esekusi) {
    //var data = konteks_esekusi.TabelSimbol.dapat("isi")
    return new HasilRuntime().berhasil(new Str(self.nilai.toLowerCase()))
  }

  esekusi_besar(self, konteks_esekusi) {
    //var data = konteks_esekusi.TabelSimbol.dapat("isi")
    return new HasilRuntime().berhasil(new Str(self.nilai.toUpperCase()))
  }

  esekusi_jadiString(self, konteks_esekusi) {
    return new HasilRuntime().berhasil(new Str(self.publik || self.nilai.toString()))
  }
}
BuiltInMetode.prototype.esekusi_print.nama_parameter = [];
BuiltInMetode.prototype.esekusi_kecil.nama_parameter = [];
BuiltInMetode.prototype.esekusi_besar.nama_parameter = [];
BuiltInMetode.prototype.esekusi_jadiString.nama_parameter = ["baseN"];


var global_tabel_simbol = defaultTabelSimbol()


module.exports = {
  Isi,
  Nil,
  Angka,
  Str,
  BooLean,
  Daftar,
  Objek,
  BaseFungsi,
  Fungsi,
  BuiltInFungsi,
  BuiltInMetode,

  nativeBindingVariable,
  nativeBindingFunction,
  buatFungsi,
  assertTipe,
  defaultKonteks,
  defaultTabelSimbol,

  global_tabel_simbol,
  DataTypes
}