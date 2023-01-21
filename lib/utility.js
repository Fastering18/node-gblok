const cp = require("child_process");
const path = require("path")
const deasync = require('deasync');

function tunggu(ms) {
    // var osname = process.platform.toLowerCase();
    // must create different file because exec cannot execute bash if statement
    // return cp.execSync(`bash ${path.resolve("./bash/wait.sh")} ${s}`)

    return deasync(new Promise((y) => setTimeout(y, ms)))
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

function deepEqual(objA, objB, map = new WeakMap()) {
    objA = objA.nilai
    objB = objB.nilai
    
    // P1
    if (Object.is(objA, objB)) return true;

    // P2
    if (objA instanceof Date && objB instanceof Date) {
        return objA.getTime() === objB.getTime();
    }
    if (objA instanceof RegExp && objB instanceof RegExp) {
        return objA.toString() === objB.toString();
    }

    // P3
    if (
        typeof objA !== 'object' ||
        objA === null ||
        typeof objB !== 'object' ||
        objB === null
    ) {
        return false;
    }

    // P4
    if (map.get(objA) === objB) return true;
    map.set(objA, objB);

    // P5
    const keysA = Reflect.ownKeys(objA);
    const keysB = Reflect.ownKeys(objB);

    if (keysA.length !== keysB.length) {
        return false;
    }

    for (let i = 0; i < keysA.length; i++) {
        if (
            !Reflect.has(objB, keysA[i]) ||
            !deepEqual(objA[keysA[i]], objB[keysA[i]], map)
        ) {
            return false;
        }
    }

    return true;
};

module.exports = {
    tunggu,
    sleep,
    deepEqual
}