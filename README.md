<p align="center">
<h2>GBLK language written in Node.js</h2>
<br>
<img src="https://cdn.discordapp.com/attachments/783614662960349236/882809593963634698/android-chrome-192x192.png" alt="gblk-icon">
<br>
<img src="https://api.travis-ci.org/Fastering18/Membuat-Bahasa-Pemrograman.svg?branch=main" alt="travisci-test">  

<p>GBLK language is interpreted language written in node.js<br><a href="https://gblk-lang.glitch.me/">Online interpreter</a> &nbsp;| &nbsp;<a href="https://fastering18.github.io/node-gblok/#/">Get started</a></p>
</p>


<hr>

> Fibbonaci function  
```gblk
lokal fibbonaci = fungsi(x) 
    jika x < 2 maka
        kembali 1;
    jikatidak
        kembali fibbonaci(x-2) + fibbonaci(x-1);
    tutup
tutup

print(fibbonaci(7)) -- 7! = 21
```  

> Pyramid function  
```gblk
lokal piramid = fungsi(r)
    jika r < 3 maka kembali "row must higher than 2" tutup
    lokal hasil = ""
    untuk i = 0 ke r lakukan
        hasil = hasil + (" " * (r - i)) + ("* " * (i)) + "\n"
    tutup
    kembali hasil
tutup

print(piramid(10))
```

> Dynamic objects  
```gblk
lokal obj = {
    "sus": benar,
    nama: "amogus",
    isSus: fungsi() -> benar,
    suspect: ["red", "white"]
}

print(obj -> suspect -> 1)
print(obj -> suspect -> 2)
print(obj -> nama)
print(obj)
```

### Compile with node.js  
```js
const gblk = require("node-gblk")

const skrip = `print("Hello world")`
gblk.runTerminal(skrip, "./indeks.gblk").then(console.log)
```  

### CLI usage  
Install package as global `npm i -g node-gblk`  
Run command `gblok run <filepath>`  

`gblok`: command to run files  
> - **gblok help**                Show list commands  
> - **gblok run index.gblk**      Run gblk file  
> - **gblok repl**                Run gblk in REPL mode (directly compile in stdin)  

<hr>

`gpm`: command to install and manage packages  
> - **gpm help**                  Show list commands  
> - **gpm init**                  Initialize sample project folder  
> - **gpm login**                 Login to our package manager  
> - **gpm install module:versi**  Install module with specified version  
> - **gpm publish**               Publish module to our package manager  

> **Make sure to install this package globally to use CLI commands**  

<br>

### Package Manager (beta)  
[https://gblkpm.herokuapp.com/](https://gblkpm.herokuapp.com/)  
Create account to publish packages

<br>

Maintained by Fastering18  
[Discord](https://discord.gg/FHVjsSg7jU)&nbsp;&nbsp;|&nbsp;&nbsp;[Github](https://github.com/Fastering18)
