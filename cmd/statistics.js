const Runtime = require("../lib/Runtime");
const TipeData = require("../lib/TipeData")

const months = [ "𝒥𝒶𝓃𝓊𝒶𝓇𝒾", "𝐹𝑒𝒷𝓇𝓊𝒶𝓇𝒾", "𝑀𝒶𝓇𝑒𝓉", "𝒜𝓅𝓇𝒾𝓁", "𝑀𝑒𝒾", "𝒥𝓊𝓃𝒾", "𝒥𝓊𝓁𝒾", "𝒜𝑔𝓊𝓈𝓉𝓊𝓈", "𝒮𝑒𝓅𝓉𝑒𝓂𝒷𝑒𝓇", "𝒪𝓀𝓉𝑜𝒷𝑒𝓇", "𝒩𝑜𝓋𝑒𝓂𝒷𝑒𝓇", "𝒟𝑒𝓈𝑒𝓂𝒷𝑒𝓇" ];

/**
 * Count how many data types used in program
 * @param {Runtime.HasilRuntime} res - HasilRuntime result by node-gblk interpreter's
 */
function countDataTypes(res) {    
    return countDataTypesInArray(res.value);
}

/**
 * Count how many data types used in GBLK Array's
 * @param {Runtime.Daftar} res - GBLK Daftar
 */
function countDataTypesInArray(arr) {
    var c_obj = 0, c_num = 0, c_str = 0, c_bool = 0, c_daftar = 0, c_func = 0, c_nil = 0;

    arr.nilai.forEach(function(expr, _i) {        
        if (expr instanceof TipeData.Objek) {
            c_obj++;

            var content = countDataTypesInObject(expr);
            c_obj += content[0];
            c_num += content[1];
            c_str += content[2];
            c_bool += content[3];
            c_daftar += content[4];
            c_func += content[5];
            c_nil += content[6];
        }
        else if (expr instanceof TipeData.Daftar) {
            c_daftar++;

            var content = countDataTypesInArray(expr);
            c_obj += content[0];
            c_num += content[1];
            c_str += content[2];
            c_bool += content[3];
            c_daftar += content[4];
            c_func += content[5];
            c_nil += content[6];
        }
        else if (expr instanceof TipeData.Angka) c_num++;
        else if (expr instanceof TipeData.Str) c_str++;
        else if (expr instanceof TipeData.BooLean) c_bool++;
        else if (expr instanceof TipeData.Fungsi) c_func++;
        else if (expr instanceof TipeData.Nil) c_nil++;
    });

    return [
        c_obj, c_num, c_str,
        c_bool, c_daftar, c_func,
        c_nil
    ];
}

/**
 * Count how many data types in GBLK Object's
 * including keys { number | string }
 * @param {TipeData.Objek} obj - GBLK Object
 */
function countDataTypesInObject(obj) {
    const actualObj = obj.nilai;
    var c_obj = 0, c_num = 0, c_str = 0, c_bool = 0, c_daftar = 0, c_func = 0, c_nil = 0;

    Object.entries(actualObj).forEach(function([key, expr]) {
        if (expr instanceof TipeData.Objek) {
            c_obj++;
            
            var content = countDataTypesInObject(expr);
            c_obj += content[0];
            c_num += content[1];
            c_str += content[2];
            c_bool += content[3];
            c_daftar += content[4];
            c_func += content[5];
            c_nil += content[6];
        }
        else if (expr instanceof TipeData.Daftar) {
            c_daftar++;

            var content = countDataTypesInArray(expr);
            c_obj += content[0];
            c_num += content[1];
            c_str += content[2];
            c_bool += content[3];
            c_daftar += content[4];
            c_func += content[5];
            c_nil += content[6];
        }
        else if (expr instanceof TipeData.Angka) c_num++;
        else if (expr instanceof TipeData.Str) c_str++;
        else if (expr instanceof TipeData.BooLean) c_bool++;
        else if (expr instanceof TipeData.Fungsi) c_func++;
        else if (expr instanceof TipeData.Nil) c_nil++;

        if (typeof key == "number") c_num++;
        else if (typeof key == "string") c_str++;
    });

    return [
        c_obj, c_num, c_str,
        c_bool, c_daftar, c_func,
        c_nil
    ];
}


/**
 * Formatted Date in Latin (Indonesia)
 * @param {Date} dt - JS Object Date
 */
function getFormattedDate(dt = new Date()) {
    return `${dt.getDate()} ${months[dt.getMonth()]} ${dt.getFullYear()}`;
}

module.exports = {
    countDataTypes,
    countDataTypesInArray,
    countDataTypesInObject,

    getFormattedDate,

    DataTypes: TipeData.DataTypes
}