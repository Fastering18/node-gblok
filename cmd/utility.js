const fs = require("fs")
const warna = require("./warna")
const path = require("path")

const exampleFile1 = path.resolve("./cmd/example.gblk")

module.exports.putExampleFile = function(pth) {
    try {
        fs.writeFileSync(pth, fs.readFileSync(exampleFile1));
        console.log(`${warna.Hijau("Success created")} ${warna.Bold(pth)} ${warna.Hijau("file!")}`)
    } catch(err) {
        console.log(err);
        console.log(`An exception happened during creating file, please report this bug!`)
    }
}