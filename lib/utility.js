const cp = require("child_process");
const path = require("path")

function tunggu(s) {
    var osname = process.platform.toLowerCase();
    // must create different file because exec cannot execute bash if statement
    return cp.execSync(`bash ${path.resolve("./bash/wait.sh")} ${s}`)
}

function sleep(s) {
    var osname = process.platform.toLowerCase();
    var cmd = osname == "linux" ? `sleep ${s}` : osname.startsWith("win") ? `ping -n ${s} 127.0.0.1 >nul` : null;
    if (cmd) {
        return cp.execSync(cmd)
    } else {
        return cp.execSync(`
        if ! command -v sleep &> /dev/null
        then
            echo 'sleep' command is not found to use 'wait' function && exit 1
        fi
        sleep ${s}
        `)
    }
}

module.exports = {
    tunggu,
    sleep
}