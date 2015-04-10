# -----------------------------------------------------------------------
# -                                Setup                                -
# -----------------------------------------------------------------------

set -e
set -u

echo '-INPUT VARIABLES---------------'
echo $1
echo $2
echo $3
echo '-------------------------------'

TARBALL=$1
ENTRY_POINT=$2
TIME_STAMP=$3
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


echo Processing $TARBALL...
mkdir -p uploads/run
mkdir -p screenshots

cd build # IN BUILD DIRECTORY =============================
tar -xzf ../uploads/$TARBALL
testIt
rm -rf demo
tar -cf ../screenshots/$TIME_STAMP.tar spec/e2e/screenshots
rm -rf spec
cd - # IN ROOT DIRECTORY ==================================

if [[ $TEST_STATUS != 0 ]]; then exit $TEST_STATUS; fi
