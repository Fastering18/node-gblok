const fs = require("fs");
const readline = require("readline")
const child_process = require("child_process")
const path = require("path");
const chalk = require('chalk');
const ora = require('ora');
const axios = require("axios");
const enumItems = require("../lib/enums");
const { PKGManager } = require("../lib/enums");

function safe_path(pth) {
    return path.join(require.main.path, pth)
}

function saveCacheData(dt = {}) {
    const lok = safe_path("../config/cache.json")
    const cacheFile = fs.readFileSync(lok)
    const newdt = {
        ...JSON.parse(cacheFile.toString()),
        ...dt
    }
    fs.writeFileSync(lok, JSON.stringify(newdt, null, 3))
    return true
}

function loginPost(email, password) {
    return new Promise((y, gk) => {
        axios.post(`${enumItems.PKGManager.baseURL}${enumItems.PKGManager.loginURL}`, {
            email, password
        }, { headers: { "content-type": "application/json" } }).then(d => {
            y(d.data)
        }).catch(err => {
            //console.log(err.response.data)
            if (err.code === "ENOTFOUND") return gk({ status: "unknown", message: "Failed to login, check your connection and try again" })
            gk(err.response.data)
        })
    })
}

module.exports.loginInput = function (rinput = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})) {
    rinput._writeToOutput = function _writeToOutput(stringToWrite) {
        if (rinput.stdoutMuted)
            rinput.output.write("\x1B[2K\x1B[200D" + rinput.query + "[" + "*".repeat(rinput.line.length) + "]");
        else
            rinput.output.write(stringToWrite);
    };

    rinput.question("Email: ", function (email) {
        rinput.stdoutMuted = true;
        rinput.query = "Password: "
        rinput.question(rinput.query, function (password) {
            rinput.close()
            console.log()

            //console.log(email, password)
            const spinner = ora('Logining...').start()
            const dotAnim = setInterval(() => spinner.text = spinner.text.length >= 16 ? "Logining" : spinner.text.length >= 15 ? "Logining..." : spinner.text.length >= 14 ? "Logining.." : "Logining.", 200)
            loginPost(email, password).then(d => {
                clearInterval(dotAnim)
                spinner.succeed(`[${d.status}] Success logined as ${chalk.green.bold(d.data.username)} ✨`)

                console.log(d.data)
                saveCacheData({ api_key: d.data.api_key, username: d.data.username })
            }).catch(err => {
                clearInterval(dotAnim)
                spinner.fail(`[${err.status}] ${err.message} ☹️`)
            }).finally(() => {
                if (spinner.isSpinning) setTimeout(() => { clearInterval(dotAnim); spinner.succeed(`Success created ${chalk.blue.bold(nama_projek || pth || "example")} project`) }, 100);
                if (rinput) rinput.close();
            })
        })
    })
}

module.exports.registerAkun = function() {
    const spinner = ora('Opening chrome...').start()
    child_process.exec(`${process.platform.startsWith("win") ? "start" : "open"} chrome ${enumItems.PKGManager.baseURL}${enumItems.PKGManager.browserLoginURL}`, function(err, stdo, stderr) {
        if (err) return spinner.fail(err.message);
        if (stderr) {
            spinner.fail("Unable to launch chrome to register")
        } else {
            spinner.succeed("Chrome browser opened to register")
        }
    });
}