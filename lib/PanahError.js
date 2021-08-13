function panaherror(teks, posisi_awal, posisi_akhir) {
    var hasil = "";

    var idx_awal =  Math.max(teks.lastIndexOf("\n",posisi_awal.indeks), 0);
    //idx_awal =idx_awal > posisi_awal.index ? posisi_awal.indeks : idx_awal, 0);
    var idx_akhir = teks.indexOf('\n', idx_awal + 1);
    if (idx_akhir < 0) idx_akhir = teks.length;
    
    var line_count = posisi_akhir.baris - posisi_awal.baris + 1;
    
    for (var i=0; i < line_count; i++) {
        // Hitung kolom baris
        line = teks.substring(idx_awal, idx_akhir);
        //console.log(idx_awal, idx_akhir, line_count, line)
        col_start = i == 0 ? posisi_awal.kolom : 0;
        col_end = i == (line_count - 1) ? posisi_akhir.kolom : line.length - 1;

        // Masukkan hasil
        hasil += line + '\n';
        hasil += ' '.repeat(col_start) + '^'.repeat(col_end - col_start);

        // Menghitung ulang indeks
        idx_awal = idx_akhir;
        idx_akhir = teks.indexOf('\n', idx_awal + 1);
        if (idx_akhir < 0) idx_akhir = teks.length;
    }

    return hasil.replace(/\t/g, '')
}

module.exports = {
    panaherror
}