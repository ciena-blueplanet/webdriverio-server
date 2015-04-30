#!/bin/bash

# =================================================================================================================
# Begin snippet taken from http://stackoverflow.com/a/246128 to figure out where the script lives
# =================================================================================================================
SOURCE="${BASH_SOURCE[0]}"
while [ -h "$SOURCE" ]; do # resolve $SOURCE until the file is no longer a symlink
  DIR="$( cd -P "$( dirname "$SOURCE" )" && pwd )"
  SOURCE="$(readlink "$SOURCE")"
  # if $SOURCE was a relative symlink, we need to resolve it relative to the path where the symlink file was located
  [[ $SOURCE != /* ]] && SOURCE="$DIR/$SOURCE"
done
DIR="$( cd -P "$( dirname "$SOURCE" )" && pwd )"
# =================================================================================================================
# End snippet from stackoverflow
# =================================================================================================================

cd $DIR/../build
npm install
cd ..
mkdir build-1
mkdir build-2
mkdir build-3
mkdir build-4
ln -s ../build/node_modules build-1/node_modules
ln -s ../build/node_modules build-2/node_modules
ln -s ../build/node_modules build-3/node_modules
ln -s ../build/node_modules build-4/node_modules
