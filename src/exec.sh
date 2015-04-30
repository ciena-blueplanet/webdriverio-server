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


set -e
set -u

echo '-INPUT VARIABLES---------------'
echo '.'
echo $0 'WHAT IS THIS?'
echo '.'
echo build-index: $1
echo '.'
echo tarball: $2
echo '.'
echo entry-point: $3
echo '.'
echo timestamp: $4
echo '.'
echo '-------------------------------'
echo '.'

BUILD_INDEX=$1
TARBALL=$2
ENTRY_POINT=$3
TIMESTAMP=$4
TEST_CONFIG='spec/e2e/test-config.json'
NODE_SPECS=spec/e2e
JASMINE_NODE_OPTS='--captureExceptions --verbose'

# -----------------------------------------------------------------------
# -                          Testing function                           -
# -----------------------------------------------------------------------


function testIt {
    echo Testing...

    TEST_PORT=$(perl -MSocket -le 'socket S, PF_INET, SOCK_STREAM,getprotobyname("tcp"); $$port = int(rand(1080))+1080; ++$$port until bind S, sockaddr_in($$port,inet_aton("127.1")); print $$port')
	kill $(lsof -t -i:$TEST_PORT) 2>/dev/null || echo ''
	./node_modules/.bin/http-server -s -c-1 -p $TEST_PORT &
	echo '{ "seleniumServer": "localhost", "url": "http://'$HOSTNAME:$TEST_PORT/$ENTRY_POINT'" }' > $TEST_CONFIG
	echo "Running jasmine-node tests on port $TEST_PORT"
    TEST_STATUS=0
    ./node_modules/.bin/jasmine-node $JASMINE_NODE_OPTS $NODE_SPECS || TEST_STATUS=1
	kill $(lsof -t -i:$TEST_PORT) || echo 'ERROR killing http-server'
}

# -----------------------------------------------------------------------
# -                                main                                 -
# -----------------------------------------------------------------------

# start at the root of the project
cd $DIR/..

echo Processing $TARBALL...
mkdir -p uploads/run
mkdir -p screenshots
#cp -a build build-${TIMESTAMP}
mv build-$BUILD_INDEX build-${TIMESTAMP}

cd build-${TIMESTAMP} # IN BUILD DIRECTORY =============================
tar -xzf ../uploads/$TARBALL
testIt
tar -cf ../screenshots/${TIMESTAMP}.tar spec/e2e/screenshots
cd - # IN ROOT DIRECTORY ==================================
rm -rf build-${TIMESTAMP}/demo
rm -rf build-${TIMESTAMP}/spec
mv build-$TIMESTAMP build-$BUILD_INDEX

if [[ $TEST_STATUS != 0 ]]; then exit $TEST_STATUS; fi
