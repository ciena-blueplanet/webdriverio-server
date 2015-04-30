/**
 * @author Adam Meadows [job13er](https://github.com/job13er)
 * @copyright 2015 Cyan Inc. All rights reserved.
 */

/* eslint-disable max-nested-callbacks */

'use strict';

var childProcess = require('child_process');
var t = require('beaker').transplant(__dirname);
var processUpload = t.require('./process-upload');

describe('process-upload', function () {
    var child;
    beforeEach(function () {
        child = {
            on: jasmine.createSpy('child.on'),
            stdout: jasmine.createSpyObj('child.stdout', ['on']),
            stderr: jasmine.createSpyObj('child.stderr', ['on']),
        };
        spyOn(childProcess, 'spawn').and.returnValue(child);
        spyOn(console, 'log');
    });

    describe('.newFile()', function () {
        var res, seconds;
        beforeEach(function () {
            childProcess.spawn('bash', ['echo', 'hi']);
            res = jasmine.createSpyObj('res', ['send', 'end']);
            seconds = Math.floor(new Date().getTime() / 1000);
            processUpload.newFile('filename', 'entry-point', res);
        });

        it('spawns a new process', function () {
            expect(childProcess.spawn).toHaveBeenCalledWith('bash', [
                processUpload.scriptPath,
                1,
                'filename',
                'entry-point',
                seconds,
            ]);
        });

        it('listens for data on stdout', function () {
            expect(child.stdout.on).toHaveBeenCalledWith('data', jasmine.any(Function));
        });

        it('listens for data on stderr', function () {
            expect(child.stderr.on).toHaveBeenCalledWith('data', jasmine.any(Function));
        });

        it('listens for exit of child', function () {
            expect(child.on).toHaveBeenCalledWith('exit', jasmine.any(Function));
        });

        describe('when child exits', function () {
            beforeEach(function () {
                child.stdout.on.calls.argsFor(0)[1]('some-stdout-data');
                child.stderr.on.calls.argsFor(0)[1]('some-stderr-data');
                child.on.calls.argsFor(0)[1](13);
            });

            it('sends response', function () {
                expect(res.send).toHaveBeenCalledWith(seconds.toString());
            });
        });
    });
});
