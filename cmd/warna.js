const TEBAL = "\033[1m"
const UNGU = "\033[95m"
const MERAH = '\033[0;31m'
const warnaDefault = '\033[0m'

function warnai(txt, warna) {
    return `${warna}${txt}${warnaDefault}`
}


module.exports.Bold = (txt) => warnai(txt, TEBAL);
module.exports.Merah = (txt) => warnai(txt, MERAH);
module.exports.Ungu = (txt) => warnai(txt, UNGU);