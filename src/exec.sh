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

TEST_CONFIG='spec/e2e/test-config.json'
NODE_SPECS=spec/e2e
JASMINE_NODE_OPTS='--captureExceptions --verbose'

TARBALL=$1
ENTRY_POINT=$2
TIMESTAMP=$3

echo '-INPUT VARIABLES---------------'
echo tarball: $TARBALL
echo entry-point: $ENTRY_POINT
echo timestamp: $TIMESTAMP
echo '-------------------------------'


# -----------------------------------------------------------------------
# -                         port lookup function                        -
# -----------------------------------------------------------------------

function getOpenPort {
    perl -MSocket -le 'socket S, PF_INET, SOCK_STREAM,getprotobyname("tcp"); $$port = int(rand(1080))+1080; ++$$port until bind S, sockaddr_in($$port,inet_aton("127.1")); print $$port'
}

# -----------------------------------------------------------------------
# -                          Testing function                           -
# -----------------------------------------------------------------------


function testIt {
    echo Testing...

    HTTP_PORT=$(getOpenPort)
	kill $(lsof -t -i:$HTTP_PORT) 2>/dev/null || echo ''
	./node_modules/.bin/http-server -s -c-1 -p $HTTP_PORT &

    SELENIUM_PORT=$(getOpenPort)
	kill $(lsof -t -i:$SELENIUM_PORT) 2>/dev/null || echo ''
	./node_modules/.bin/webdriver-manager start --seleniumPort $SELENIUM_PORT > /dev/null 2>&1 &

    ../bin/replace.js $TEST_CONFIG \
        selenium.host:localhost \
        selenium.port:$SELENIUM_PORT \
        http.host:localhost \
        http.port:$HTTP_PORT \
        http.entryPoint:$ENTRY_POINT

	echo "Running jasmine-node tests with http port $HTTP_PORT and selenium port $SELENIUM_PORT"
    TEST_STATUS=0
    ./node_modules/.bin/jasmine-node $JASMINE_NODE_OPTS $NODE_SPECS || TEST_STATUS=1

	kill $(lsof -t -i:$HTTP_PORT) || echo 'ERROR killing http-server'
	kill $(lsof -t -i:$SELENIUM_PORT) || echo 'ERROR killing selenium server'
}

# -----------------------------------------------------------------------
# -                                main                                 -
# -----------------------------------------------------------------------

# start at the root of the project
cd $DIR/..

echo Processing ${TARBALL}...
mkdir build-${TIMESTAMP}
ln -s build/node_modules build-${TIMESTAMP}/node_modules

cd build-${TIMESTAMP} # IN BUILD DIRECTORY =============================
tar -xzf ../uploads/$TARBALL
testIt
tar -cf ../screenshots/${TIMESTAMP}.tar spec/e2e/screenshots
cd - # IN ROOT DIRECTORY ==================================
rm -rf build-${TIMESTAMP}

if [[ $TEST_STATUS != 0 ]]; then exit $TEST_STATUS; fi
