<div align="center">
<p>
<h2>GBLK language written in Node.js</h2>
<img src="https://cdn.discordapp.com/attachments/783614662960349236/882809593963634698/android-chrome-192x192.png" alt="gblk-icon">
</p>
<p>
<a href="https://www.npmjs.com/package/node-gblk"><img src="https://img.shields.io/travis/Fastering18/Membuat-Bahasa-Pemrograman/main?label=test" alt="travisci-test"></a> 
<a href="https://www.npmjs.com/package/node-gblk"><img src="https://img.shields.io/npm/dt/node-gblk.svg?maxAge=3600" alt="npm-download"></a>
<a href="https://www.npmjs.com/package/node-gblk"><img src="https://img.shields.io/npm/v/node-gblk.svg?maxAge=3600&label=versi" alt="npm-versi"></a>
<a href="https://gblkpm.herokuapp.com"><img alt="Website" src="https://img.shields.io/website?maxAge=3600&down_message=Down&label=package%20manager&up_message=Aktif&url=https%3A%2F%2Fgblkpm.herokuapp.com"></a>
</p> 

<p>GBLK language is interpreted language written in node.js<br><a href="https://gblk-lang.glitch.me/">Online interpreter</a> &nbsp;| &nbsp;<a href="https://fastering18.github.io/node-gblok/#/">Get started</a></p>
</div>

> **🚨 We're currently working on gblk edition-2 as compiled language!  
> join our discord server for more information.**

<hr>

<h2>Examples</h2>
<details>
<summary><bold>#1 Fibonacci function</bold></summary>
<br>
Recursive fibonacci function written in GBLK  
<br><br>
<pre>
lokal fibbonaci = fungsi(x) 
    jika x < 2 maka
        kembali 1;
    jikatidak
        kembali fibbonaci(x-2) + fibbonaci(x-1);
    tutup
tutup

print(fibbonaci(7)) -- 21
</pre>
</details>

<details>
<summary><bold>#2 Pyramid function</bold></summary>
<br>
Terminal output text shape with loops  
<br><br>
<pre>
lokal piramid = fungsi(r)
    jika r < 3 maka kembali "row must higher than 2" tutup
    lokal hasil = ""
    untuk i = 0 ke r lakukan
        hasil = hasil + (" " * (r - i)) + ("* " * (i)) + "\n"
    tutup
    kembali hasil
tutup

print(piramid(10))
</pre>
</details>

<details>
<summary><bold>#3 Dynamic objects</bold></summary>
<br>
A node.js-like objects  
<br><br>
<pre>
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
</pre>
</details>

<br/>

## API  
```js
const gblk = require("node-gblk")

const skrip = `print("Hello world")`
gblk.runTerminal(skrip, "./indeks.gblk").then(console.log)
```  

<br/>

## CLI Usage  
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

## Package Manager (beta)  
[https://package.gblk.ga/](https://package.gblk.ga/)  
Register an account, publish packages

<br>

Maintained by Fastering18  
[Discord](https://discord.gg/FHVjsSg7jU)&nbsp;&nbsp;|&nbsp;&nbsp;[Github](https://github.com/Fastering18)
