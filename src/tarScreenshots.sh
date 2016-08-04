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
TIMESTAMP=$2
DIRNAME=$3

cd $DIR/..
mv ${TARBALL} build-${TIMESTAMP}/screenshots
cd build-${TIMESTAMP}/screenshots
tar -xvf ${TARBALL}
rm ${TARBALL}
cd ${DIRNAME}
rsync -a screenshots/* ../
cd ..
rm -rf ${DIRNAME}

exit 0