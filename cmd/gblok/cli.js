#!/usr/bin/env node
const prog = require('caporal');
const readline = require("readline")
const warna = require("../warna");
const compiler = require("../../main");
const utility = require("../utility");

prog
  .name("gblok [GBLK Compiler]")
  .version('0.0.225')
  .command('run', 'Execute a gblk program')
  .argument('<filepath>', 'File path to run', prog.STRING)
  .option("--tanpa <komponen>", "Opsi untuk menghilangkan beberapa komponen", prog.REPEATABLE, [], false)
  .action(function (args, options, logger) {
    if (typeof (options.tanpa) != "object") options.tanpa = [options.tanpa];
    const mulai = Date.now();
    var hasErr = false
    compiler.executeFile(args.filepath).then(out => {
      //console.log(out.hasil.value);
    }).catch(err => {
      hasErr = true
      console.log(`\n${warna.Ungu("Terdapat error saat mengesekusi file:")}\n\t${warna.Merah(err.toString())}`)
    }).finally((_) => {
      if (!options.tanpa.includes("waktu") && !hasErr) console.log(warna.Bold(`\tScript telah mengabiskan waktu: ${new Date(new Date() - mulai).getMilliseconds()}ms`))
    })
  })
  .command('repl', 'Run gblk in REPL mode')
  .action(function () {
    const rinput = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return compiler.REPLMode(rinput)
  })



prog.parse(process.argv);