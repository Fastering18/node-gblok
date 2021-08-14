## node.js fully hand written gblk interpreter  

```gblk
executeSync("print('hello world')", "program.gblk")
```  
**executeSync(script, name?)**  

### Changed keyword in `0.0.265`  
> **untuk ... maka** changed to **untuk ... lakukan**  `(for loop)`  
> **saat ... maka** changed to **selama ... lakukan**  `(while loop)`  

### New dot notation, string method and ternary operator \[BETA\] `0.0.27`  
> lokal str = "abcd"  
> print((str.besar)())  

### Added eval function \[BETA\] `0.0.273`  
> lokal str = "got em"  
> lokal res = eval("str") --return the str   value  
> print(res)  

### Added try catch block `0.0.276`  
```gblk
coba
    print(sos)
tangkap(err)
    print(err)
tutup
```  

### Added object type data \[BETA\] `0.0.2778`  
```gblk
lokal obj = {sus: benar, nama: "red"}
print(obj)
print(obj.nama)
```  

### API  
| Functions      | Description |
| ----------- | ----------- |
| executeFile      | parameter: file path, program name. Can be used to compile script from file. returns Promise       |
| executeFileSync   | parameter: file path, program name. (Syncronous)       |
| execute   | parameter: script, program name. Can be used to compile script directly. returns Promise        |
| executeSync   | parameter: script, program name. (Syncronous)        |  

`runTerminal` added new function to get output as string (Promise)  

### CLI usage  
Install package as global `npm i -g node-gblk`  
Run command `gblok run <filepath>`  

### node-gblk  

