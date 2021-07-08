# Getting Started

## Install using NPM/Yarn 

> Make sure to downloaded Node.js latest version  
> Check out [node.js](https://nodejs.org/en/download/) for installation  
> 
> Verify using `node` and `npm` command in terminal by  
> `node -v && npm -v`  

### Install package globally  
**Using NPM**
`npm i -g node-gblk`  
**Using Yarn**
`yarn global add node-gblk`  

### Check `gblok` command in terminal
```bash
gblok -V
```
#### Expected output <!-- {docsify-ignore} --> 
![gblk-version-test](https://i.gyazo.com/baa416517f912a18d59ff51e520fcb50.png)

<br>

## Run your first GBLK code  
Create folder for our working directory and create file `index.gblk`  
> Note: you can name file to anything   

#### Our setup file in VSCode  
![first-setup-vscode](https://i.gyazo.com/3fb21d4410c110bf9e2efadd40620d14.png)  

### Hello-world GBLK code  
Your first `hello world!` print using GBLK!  
Paste following code into your `index.gblk` file
```gblk
lokal str = "Hello world!"
print(str)
```

#### Run code  
Run our `index.gblk` file using cli command below:  
```bash
gblok run index.gblk
```

#### Expected output <!-- {docsify-ignore} --> 
![hello-world-output](https://i.gyazo.com/1ad1ec10f2d92f9b40ab887294d78115.png)  

#### Run command options  
If you want to remove time measuring, use `--tanpa waktu` options  
An example to run our latest index.gblk using options:  
```bash
gblok run index.gblk --tanpa waktu
```