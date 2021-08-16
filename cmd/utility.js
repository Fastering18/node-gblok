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
    const cwdFolder = path.join(process.cwd(), pth || ".")

    fs.mkdirSync(cwdFolder, {recursive: true})
    try {
        fs.writeFileSync(path.join(cwdFolder, "/module1.gblk"), fs.readFileSync(safe_path("./module1.gblk")));
        fs.writeFileSync(path.join(cwdFolder, "/index.gblk"), fs.readFileSync(safe_path("./index.gblk")));
        fs.writeFileSync(path.join(cwdFolder, "/paket.json"), fs.readFileSync(safe_path("./paket.json")));
        //console.log(`${warna.Hijau("Success created")} ${warna.Bold(pth)} ${warna.Hijau("file")} ✅`)
    } catch(err) {
        console.log(err);
        clearInterval(dotAnim)
        spinner.fail(`An exception happened during creating file, please report this bug \uD83D\uDE33`)
    } finally {
       if (spinner.isSpinning) setTimeout(() => {clearInterval(dotAnim); spinner.succeed(`Success created ${chalk.blue.bold(pth ? pth : "example")} project`)}, 100);
    }
}