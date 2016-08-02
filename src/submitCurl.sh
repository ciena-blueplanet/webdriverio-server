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

TIMESTAMP=$1
TESTS_FOLDER=$2
TARBALL=$3
TEST=$4
ENTRY_POINT=$5
SERVER=$6

cd $DIR/../build-${TIMESTAMP}/$TESTS_FOLDER
curl -s -F "tarball=@${TARBALL}" -F "entry-point=${ENTRY_POINT}" -F "tests-folder=${TEST}" ${SERVER}

exit 0