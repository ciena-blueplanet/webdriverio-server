echo Processing $1...
mkdir -p uploads/run
mkdir -p screenshots
cd uploads/run/build
tar -xzf ../../$1
make e2e-test
rc=$?
rm -rf demo
tar -cf ../../../screenshots/$2.tar spec/e2e/screenshots
rm -rf spec
cd -
if [[ $rc != 0 ]]; then exit $rc; fi
