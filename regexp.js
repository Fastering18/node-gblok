const regxutil = {}

regxutil.Digit = /[0-9]/
regxutil.Huruf = /[A-Za-z_]/
regxutil.Huruf_ato_Digit = /[A-Za-z0-9_]/

regxutil.DigitString = "0123456789"
regxutil.HurufString = "abcdefghijklmnopqrstuvwxyz"
regxutil.hurufdigitgabung = regxutil.DigitString + regxutil.HurufString;

regxutil.DaftarEscapeKarakter = {"n": "\n", "t": "\t", "r": "\r"}

module.exports = regxutil;