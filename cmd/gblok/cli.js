#!/usr/bin/env node
const prog = require('caporal');
const readline = require("readline")
const path = require("path")
const chalk = require("chalk");
const compiler = require("../../main");
const utility = require("../utility");
const langinfo = require("../../package.json")

prog
  .name("gblok [GBLK Compiler]")
  .version(langinfo.version)
  .command('run', 'Execute a gblk program')
  .argument('[filepath]', 'File path to run', prog.STRING)
  .option("--tanpa <komponen>", "Opsi untuk menghilangkan beberapa komponen", prog.REPEATABLE, [], false)
  .action(function (args, options, logger) {
    if (typeof (options.tanpa) != "object") options.tanpa = [options.tanpa];
    const mulai = Date.now();
    var hasErr = false
    var projek = utility.getPackageFromDirectory(path.join(process.cwd(), args.filepath || "."))
    compiler.executeFile(projek ? path.join(projek.lokasi, "..", projek.script) : args.filepath).then(out => {
      //console.log(out.hasil.modules);
    }).catch(err => {
      hasErr = true
      console.log(`\n${chalk.magenta.bold("Terdapat error saat mengesekusi file:")}\n\t${chalk.red(err.toString())}`)
    }).finally((_) => {
      if (!options.tanpa.includes("waktu") && !hasErr) console.log(chalk.bold(`\tScript telah mengabiskan waktu: ${new Date(new Date() - mulai).getMilliseconds()}ms`))
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