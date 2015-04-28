#
# Makefile for test environment
# Copyright (c) 2015 Cyan, Inc. All rights reserved.
#

HIDE := @

.PHONY: install

install:
	$(HIDE)npm install
	# The karma-jasmine-jquery package doesn't do postinstall properly when a peer dependency,
	# so we need to do it's postinstall step again manually
	$(HIDE)cd node_modules/karma-jasmine-jquery && node install.js
	$(HIDE)./node_modules/.bin/webdriver-manager update --standalone
