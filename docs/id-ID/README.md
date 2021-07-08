# Memulai

## Install dengan NPM/Yarn 

> Pastikan telah memiliki command Node.js versi terbaru  
> Kunjungi [node.js](https://nodejs.org/en/download/) untuk petunjuk instalasi  
> 
> Cek command `node` dan `npm` di terminal dengan:  
> `node -v && npm -v`  

### Install package global  
**Dengan NPM**
`npm i -g node-gblk`  
**Dengan Yarn**
`yarn global add node-gblk`  

### Cek `gblok` command di terminal  
```bash
gblok -V
```
#### Output yg muncul <!-- {docsify-ignore} --> 
![gblk-version-test](https://i.gyazo.com/baa416517f912a18d59ff51e520fcb50.png)

<br>

## Jalankan program dengan `gblok` CLI  
Buat folder untuk tempat test dan file dengan nama `index.gblk`  
> Note: kamu dapat mengganti nama dengan apapun   

#### Struktur folder di VSCode  
![first-setup-vscode](https://i.gyazo.com/3fb21d4410c110bf9e2efadd40620d14.png)  

### Hello-world GBLK code  
Kode pertama `hello world!` print dengan GBLK!  
Copy kode dibawah dan paste ke file `index.gblk` 
```gblk
lokal str = "Hello world!"
print(str)
```

#### Run command  
Jalankan program `index.gblk` file dengan CLI command dibawah:  
```bash
gblok run index.gblk
```

#### Output <!-- {docsify-ignore} --> 
![hello-world-output](https://i.gyazo.com/1ad1ec10f2d92f9b40ab887294d78115.png)  

#### Run command options  
Jika kamu ingin menghilangkan perhitungan waktu, pakai opsi `--tanpa waktu`  
Contoh menjalankan program sebelumnya dengan options:  
```bash
gblok run index.gblk --tanpa waktu
```