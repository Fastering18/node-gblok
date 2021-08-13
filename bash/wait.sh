#!/bin/bash

if [ -z "$1" ];
then
    echo "first parameter is wait in second"
    echo "USAGE: sleep [second]"
    exit 1
fi

if command -v sleep &> /dev/null
then
    sleep $1
elif command -v ping &> /dev/null
then
    ping -n $1 127.0.0.1 >nul
else
    echo "'sleep' and 'ping' command was not found, aborting.."
    exit 1
fi
   