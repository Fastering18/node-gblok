#!/usr/bin/env node
const prog = require('caporal');
const readline = require("readline")
const warna = require("../warna");
const compiler = require("../../main");
const utility = require("../utility");
const akunManager = require("../akun");

prog
  .name("GPM [GBLK Package Manager]")
  .version('0.0.1')
  .command('init', 'Create example project')
  .argument('[filePath]', 'File path to be written', prog.STRING)
  .option("-y", "Skip pertanyaan")
  .action(function (args, opt) {
    //if (args.filepath) {
      //console.log(args)
      //console.log(opt)
      utility.putExampleFile(args.filePath, {skip: opt.y})
  })
  .command('compress', 'kompres sebelum upload ke gblkpm')
  .argument('[direktori]', 'Directory path to be compressed', prog.STRING, prog.REQUIRED)
  .option("-o", "Output lokasi direktori")
  .action(function(args, opt) {
    utility.compressTar(args.direktori, opt.o)
  })
  .command('uncompress', 'ekstrak setelah download dari gblkpm')
  .argument('[direktori]', 'Directory path to be uncompressed', prog.STRING, prog.REQUIRED)
  .option("-o", "Output lokasi direktori")
  .action(function(args, opt) {
    utility.uncompressTar(args.direktori, opt.o)
  })
  .command('install', 'install module dari https://gblkpm.herokuapp.com')
  .argument('[module]', 'module yang akan di install', prog.STRING, prog.REQUIRED)
  .option("-o", "Project working directory path")
  .action(function(args, opt) {
    const [nama_module, versi] = args.module.split(":")
    utility.installModule(nama_module, versi, opt.o)
  })
  .command('login', 'login akun dari https://gblkpm.herokuapp.com')
  .action(function(args, opt) {
    akunManager.loginInput()
  })
  .command('register', 'register akun ke https://gblkpm.herokuapp.com')
  .action(function(args, opt) {
    akunManager.registerAkun()
  })
  .command('publish', 'upload module ke https://gblkpm.herokuapp.com')
  .argument('[direktori]', 'Project working directory path')
  .action(function(args, opt) {
    utility.publishModule(args.direktori)
  })


  prog.parse(process.argv);