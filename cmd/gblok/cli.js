#!/usr/bin/env node
const prog = require('caporal');
const readline = require("readline")
const path = require("path")
const chalk = require("chalk");
const compiler = require("../../main");
const utility = require("../utility");
const langinfo = require("../../package.json");
const statsinfo = require("../statistics");
const { isBooleanObject } = require('util/types');

/**
 * pipe output to file
 * gblok run file.gblk -s -v > out.txt
 */

prog
  .name("gblok [GBLK Compiler]")
  .version(langinfo.version)
  .command('run', 'Execute a gblk program')
  .argument('[filepath]', 'File path to run', prog.STRING)
  .argument('[program-args...]', 'Additional args to be passed into program')
  .option("-s, --stats", "Opsi untuk menampilkan informasi performa")
  .action(function (args, options, logger) {
    //if (typeof (options.tanpa) != "object") options.tanpa = [options.tanpa];
    const mulai = Date.now();
    var hasErr = false;
    var projek = utility.getPackageFromDirectory(path.join(process.cwd(), args.filepath || "."));
    var endTime;
    compiler.executeFile(projek ? path.join(projek.lokasi, "..", projek.script) : args.filepath).then(out => {
      //console.log(out.hasil.modules);
      endTime = Date.now();
      if (logger.transports.caporal.level == "debug") {
        var dataStats = statsinfo.countDataTypes(out.hasil);

        console.log("\n");
        console.log(chalk.white.bold("──────────── DEBUG ────────────"));
        console.log(chalk.green(`Program successfuly interpreted [${mulai}⟶ ${endTime}]`));
        console.log(chalk.white("> Data Type Count"));
        console.table(
          dataStats.reduce((a, b, i) => { return {...{[statsinfo.DataTypes[i]]: b }, ...a} }, {})
        )
        console.log(chalk.white.bold(`─────── ${statsinfo.getFormattedDate()} ───────`));
      }
    }).catch(err => {
      hasErr = true
      console.log(`\n${chalk.magenta.bold("Terdapat error saat mengesekusi file:")}\n\t${chalk.red(err.toString())}`)
    }).finally((_) => {
      if (options.stats && !hasErr) {
        console.log(chalk.bold(`└──→ Script telah mengabiskan waktu: ${endTime - mulai}ms`))
      }
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