#!/bin/bash

# Build gblk compiler into standalone 
# executable using pkg
# https://www.npmjs.com/package/pkg

if ! command -v pkg &> /dev/null
then
    echo "`pkg` NPM package belum terinstall, menjalankan `npm install pkg -g`"
    npm install -g pkg
fi
echo "Terdapat `pkg` package, melanjutkan"

# build dgn pkg
pkg .



#ping -n 2 127.0.0.1 >nul
