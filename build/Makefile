#
# Makefile for cy-layout-widget
# Copyright (c) 2014, 2015 Cyan, Inc. All rights reserved.
#

GITHUB_HOST := github.cyanoptics.com
REPO := UI/cy-layout-widget
NODE_SPECS ?= spec/e2e
JASMINE_NODE_OPTS ?= --captureExceptions --verbose
TEST_PORT := $(shell perl -MSocket -le 'socket S, PF_INET, SOCK_STREAM,getprotobyname("tcp"); $$port = int(rand(1080))+1080; ++$$port until bind S, sockaddr_in($$port,inet_aton("127.1")); print $$port')
TEST_CONFIG := spec/e2e/test-config.json
HOSTNAME ?= $(shell hostname)

.PHONY: \
	webpack-test \
	webpack-coverage \
	webdriver \
	kill-httpserver \
	start-httpserver \
	e2e-test


-include node_modules/beaker/make/common.mk

.PHONY: install clean test coverage report-coverage release ghp-update

install:
	# NOTE: install target will not have loaded the include above
	# from beaker, so you don't have the ENV or SHELL variables set
	$(eval ENV := source env.sh && )
	$(eval SHELL := bash)
	$(HIDE)npm install
	# The karma-jasmine-jquery package doesn't do postinstall properly when a peer dep,
	# So we do it's postinstall step again at the end
	$(HIDE)cd node_modules/karma-jasmine-jquery && node install.js

clean:
	$(HIDE)rm -rf coverage demo/bundle

test: webpack-test e2e-test

coverage: webpack-coverage

report-coverage:
	$(HIDE)echo "Reporting Coverage not implemented yet"

release:
	$(HIDE)echo "Publishing version $(VERSION)"
	$(HIDE)npm publish .

ghp-update: build ghp-clean ghp-checkout ghp-copy-common ghp-copy-webpack ghp-publish

#######################################################################
#                          e2e test targets                           #
#######################################################################

webdriver:
	$(ENV)webdriver-manager start

kill-httpserver:
	$(ENV)kill $$(lsof -t -i:$(TEST_PORT)) || echo 'nothing to kill'

start-httpserver:
	$(ENV)http-server -s -c-1 -p $(TEST_PORT) &

create-config:
	$(HIDE)echo '{ "seleniumServer": "michelangelo", "url": "http://$(HOSTNAME):$(TEST_PORT)/demo" }' > $(TEST_CONFIG)

create-config-local: create-config
	$(HIDE) sed -i -e "s/michelangelo/localhost/g" $(TEST_CONFIG)
	$(HIDE) rm -f $(TEST_CONFIG)-e

do-e2e-test:
	$(HIDE)echo "Running jasmine-node tests on port $(TEST_PORT)"
	$(ENV)jasmine-node $(JASMINE_NODE_OPTS) $(NODE_SPECS) || ($(ENV)kill $$(lsof -t -i:$(TEST_PORT)) && false)
	$(ENV)kill $$(lsof -t -i:$(TEST_PORT)) || echo 'nothing to kill'

e2e-test: kill-httpserver start-httpserver create-config do-e2e-test
e2e-test-local: kill-httpserver start-httpserver create-config-local do-e2e-test
