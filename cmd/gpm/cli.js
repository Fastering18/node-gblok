#!/usr/bin/env node
const prog = require('caporal');
const readline = require("readline")
const warna = require("../warna");
const compiler = require("../../main");
const utility = require("../utility");

prog
  .name("GPM [GBLK Package Manager]")
  .version('0.0.1')
  .command('init', 'Create example project')
  .argument('[filepath]', 'File path to be written', prog.STRING)
  .action(function (args) {
    if (args.filepath) {
      utility.putExampleFile(args.filepath.endsWith(".gblk") ? args.filepath : args.filepath + ".gblk")
    } else {
      utility.putExampleFile("index.gblk")
    }
  })


  prog.parse(process.argv);