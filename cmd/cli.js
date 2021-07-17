#!/usr/bin/env node
const prog = require('caporal');
const warna = require("./warna");
const compiler = require("../main");
const utility = require("./utility")

prog
  .name("gblok cmd")
  .version('0.0.225')
  .command('run', 'Execute a gblk program')
  .argument('<filepath>', 'File path to run', prog.STRING)
  .option("--tanpa <komponen>", "Opsi untuk menghilangkan beberapa komponen", prog.REPEATABLE)
  .action(function(args, options, logger) {
    if (typeof(options.tanpa) != "object") options.tanpa = [options.tanpa];
    const mulai = Date.now();
    compiler.executeFile(args.filepath).then(out => {
        //console.log(out.hasil.value);
    }).catch(err => {
        console.log(`\n${warna.Ungu("Terdapat error saat mengesekusi file:")}\n${warna.Merah(err.toString())}`)
    }).finally((_) => {
        if (!options.tanpa.includes("waktu")) console.log(warna.Bold(`\tScript telah mengabiskan waktu: ${new Date(new Date() - mulai).getMilliseconds()}ms`))
    })
  })
  .command('init', 'Create example file')
  .argument('[filename]', 'File name to be written', prog.STRING)
  .action(function(args) {
    if (args.filename) {
      utility.putExampleFile(args.filename.endsWith(".gblk") ? args.filename : args.filename + ".gblk")
    } else {
      utility.putExampleFile("index.gblk")
    }
  })



prog.parse(process.argv);