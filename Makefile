#
# Makefile for webdriverio-server
# Copyright (c) 2015 . All rights reserved.
#

GITHUB_HOST := github.com
REPO := cyaninc/webdriverio-server
NODE_COVERAGE_DIR := coverage

-include node_modules/beaker/make/common.mk
-include node_modules/beaker/make/gh-pages.mk
-include node_modules/beaker/make/node-targets.mk

.PHONY: install clean test coverage release ghp-update

install:
	$(HIDE)npm install

clean:
	$(HIDE)rm -rf $(NODE_COVERAGE_DIR)

test: node-test

coverage: node-coverage

release:
	$(HIDE)echo "Publishing version $(VERSION)"
	$(HIDE)npm publish .

ghp-update: ghp-clean ghp-checkout ghp-copy-node ghp-publish
