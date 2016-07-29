# -----------------------------------------------------------------------
# -                                Setup                                -
# -----------------------------------------------------------------------

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

set -x
set -e
set -u

TARBALL=$1
ENTRY_POINT=$2
TIMESTAMP=$3
TESTS_FOLDER=$4

TEST_CONFIG="$TESTS_FOLDER/test-config.json"
NODE_SPECS=$TESTS_FOLDER


echo '-INPUT VARIABLES---------------'
echo tarball: $TARBALL
echo entry-point: $ENTRY_POINT
echo timestamp: $TIMESTAMP
echo '-------------------------------'

cd $DIR/..
echo Processing ${TARBALL}...
mkdir build-${TIMESTAMP}
ln -s ../build/node_modules build-${TIMESTAMP}/node_modules
ln -s ../testUtils build-${TIMESTAMP}/testUtils

cd build-${TIMESTAMP} # IN BUILD DIRECTORY =============================
tar -xzf ../uploads/$TARBALL
cd $TESTS_FOLDER
find . -type d -maxdepth 1 -mindepth 1 -exec tar cf {}.tar {}  \;