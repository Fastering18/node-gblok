/**
 * 
 *  TOKEN, keyword (if, else, ...)
 * 
**/

const enums = {};

enums.TokenInteger = "INT"
enums.TokenFloat = "FLOAT"
enums.TokenString = "STRING"
enums.TokenIdentifier = "IDENTIFIER"     // e.g lokal <identifier>
enums.TokenKeyword = "KEYWORD"           // e.g jika ...
enums.TokenTambah = "TAMBAH"             // e.g n + n
enums.TokenKurang = "KURANG"             // e.g n - n
enums.TokenKali = "KALI"                 // e.g n * n
enums.TokenBagi = "BAGI"                 // e.g n / n
enums.TokenPangkat = "PANGKAT"           // e.g n ^ n
enums.TokenModulo = "MODULUS"            // e.g n % n
enums.TokenParentesisKiri = "PKiri"      // e.g (  Parenthesis kiri
enums.TokenParentesisKanan = "PKanan"    // e.g )  Parenthesis kanan
enums.TokenKotakKiri = "KKiri"           // e.g [  Kotak kiri / left bracket
enums.TokenKotakKanan = "KKanan"         // e.g ]  Kotak kanan / right bracket
enums.TokenSama = "EQ"                   // e.g =
enums.TokenSamaSama = "SAMASAMA"         // e.g ==
enums.TokenTidakSama = "GKSAMA"          // e.g !=
enums.TokenKurangDari = "KURANGDARI"     // e.g >
enums.TokenLebihDari = "LEBIHDARI"       // e.g <
enums.TokenKurangAtauSama = "SAMAKURANG" // e.g >=
enums.TokenLebihAtauSama = "LEBIHKURANG" // e.g <=
enums.TokenKoma = "KOMA"                 // e.g ,
enums.TokenPanah = "PANAH"               // e.g ->
//enums.TokenKotakIndeksKiri = "KKINDEKS"  // e.g data[x]        
//enums.TokenKotakIndeksKanan = "KRINDEKS" // e.g data[x]
enums.TokenTitikIndeks = "TITIKINDEKS"   // e.g data.x
enums.TokenTernary = "TERNARYTANYA"      // e.g <kondisi> ? <expr1> : <expr0>
enums.TokenTernaryBagi = "TERNARYBAGI"   // sm kyk diatas ^ (:)
enums.TokenXOR = "BITWISEXOR"            // bitwise XOR: ~1 = -2, ~123 = -124 (tambah satu dari kebalikan)
enums.TokenKurungKurawaKiri = "TokenKurungKurawaKiri"   //   {
enums.TokenKurungKurawaKanan = "TokenKurungKurawaKanan" //   }
enums.TokenLineBaru = "NEWLINE"          // e.g \n atau ; akhir dari statement
enums.TokenEOF = "EOF"                   // Kosong, akhir dari code (end of file / code)

enums.Konstruktor = [
	"lokal",      // lokal anjay = "anjay"
	"dan",        // <kondisi1> dan <kondisi2>
	"atau",       // <kondisi1> atau <kondisi2>
	"bukan",      // not true == false
	"jika",       // jika [kondisi] maka
	"maka",       // then [expr]
	"jikatidak",  // else [expr]
	"kalau",      // elseif [kondisi] [expr]
	"untuk",      // untuk i = 0 ke 5
	"ke",         // untuk indeks = 0 ke 10
	"langkah",    // untuk indeks = 8 ke -5 langkah -1
	"lakukan",    // untuk indeks = 8 ke -5 langkah -1 lakukan
	"tipe",       // typeof <expr>
	"fungsi",     // function
	"selama",     // while
	"tutup",      // end (menutup blok statement)
	"kembali",    // return
	"lanjutkan",  // continue
	"coba",       // try catch
	"tangkap",    // catch
	"berhenti",   // break
	"ekspor"      // module.exports = <expr>
]


module.exports = enums;