#
# Makefile for webdriverio-server
# Copyright (c) 2015 . All rights reserved.
#

GITHUB_HOST := "github.com"
REPO := "/webdriverio-server"
NODE_COVERAGE_DIR := coverage

-include node_modules/cy-toolkit/files/make/common.mk
-include node_modules/cy-toolkit/files/make/gh-pages.mk
-include node_modules/cy-toolkit/files/make/node-targets.mk

.PHONY: install test coverage report-coverage release version-bumped bump-version docs ghp-update

install:
	$(HIDE)npm install

test: node-test

coverage: node-coverage

report-coverage:
	$(HIDE)echo "Reporting Coverage not implemented yet"

release:
	$(HIDE)echo "Publishing version $(VERSION)"
	$(HIDE)npm publish .

ghp-update: jsdoc ghp-clean ghp-checkout ghp-copy-node ghp-publish
