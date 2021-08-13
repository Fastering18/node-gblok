#command -v pkg >/dev/null 2>&1 || { echo >&2 "I require foo but it's not installed.  Aborting."; exit 1; }
#!/bin/bash

if ! command -v pkg &> /dev/null
then
    echo "`pkg` NPM package belum terinstall, menjalankan `npm install pkg -g`"
    npm install -g pkg
fi
echo "Terdapat `pkg` package, melanjutkan"

# build dgn pkg
#pkg .

ping -n 8 127.0.0.1 >nul
