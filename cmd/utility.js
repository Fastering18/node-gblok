const fs = require("fs");
const warna = require("./warna");
const path = require("path");
const chalk = require('chalk');
const ora = require('ora');

// some library used to modernify output

function safe_path(pth) {
    return path.join(require.main.path, pth)
} 

module.exports.putExampleFile = function(pth) {
    const spinner = ora('Creating file...').start()
    const dotAnim = setInterval(() => spinner.text = spinner.text.length >= 16 ? "Creating file" : spinner.text.length >= 15 ? "Creating file..." : spinner.text.length >= 14 ? "Creating file.." : "Creating file.", 200)
    try {
        fs.writeFileSync(pth, fs.readFileSync(safe_path("./example.gblk")));
        //console.log(`${warna.Hijau("Success created")} ${warna.Bold(pth)} ${warna.Hijau("file")} ✅`)
    } catch(err) {
        console.log(err);
        clearInterval(dotAnim)
        spinner.fail(`An exception happened during creating file, please report this bug \uD83D\uDE33`)
    } finally {
       if (spinner.isSpinning) setTimeout(() => {clearInterval(dotAnim); spinner.succeed(`Success created ${chalk.blue.bold(pth)} project`)}, 100);
    }
}