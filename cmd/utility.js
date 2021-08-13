const fs = require("fs")
const warna = require("./warna")
const path = require("path")

function safe_path(pth) {
    return path.join(require.main.path, pth)
} 

module.exports.putExampleFile = function(pth) {
    try {
        fs.writeFileSync(pth, fs.readFileSync(safe_path("./example.gblk")));
        console.log(`${warna.Hijau("Success created")} ${warna.Bold(pth)} ${warna.Hijau("file!")}`)
    } catch(err) {
        console.log(err);
        console.log(`An exception happened during creating file, please report this bug!`)
    }
}