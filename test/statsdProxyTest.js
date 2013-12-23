var assert = require('assert'),
    url = require('url'),
    StatsdProxy = require('../src/StatsdProxy'),
    InvalidRequestError = require('../src/errors/InvalidRequestError.js'),
    InvalidRefererError = require('../src/errors/InvalidRefererError.js'),
    InvalidQuerystringError = require('../src/errors/InvalidQuerystringError.js'),
    InvalidSampleRateError = require('../src/errors/InvalidSampleRateError.js');

describe('statsdProxy', function () {
    var options = {
            statsdHost: 'localhost',
            statsdPort: 1234,
            whitelist: ['.*'],
            logging: true,
            refererCheck: true,
            prefix: 'prefix',
            suffix: 'suffix'
        },
        expected = {
            host: 'localhost',
            port: 1234,
            prefix: 'prefix',
            suffix: 'suffix'
        }
        statsdProxy = new StatsdProxy('url', 'referer', options);
    it('should contain a SDC instance', function () {
        assert.equal(statsdProxy.SDC.host, expected.host);
        assert.equal(statsdProxy.SDC.port, expected.port);
        assert.equal(statsdProxy.SDC.prefix, expected.prefix);
        assert.equal(statsdProxy.SDC.suffix, expected.suffix);
    });

    it('validates a correct request', function () {
        statsdProxy.url = '/transparent.gif?b=test&t=increment&d=1';
        statsdProxy.querystring = url.parse(statsdProxy.url, true).query;
        var valid = statsdProxy.validate();

        assert.ok(valid);
    });

    it('throws on an invalid request', function () {
        statsdProxy.url = '/anyoldurl';
        statsdProxy.querystring = url.parse(statsdProxy.url, true).query;

        assert.throws(function() {
            statsdProxy.validate();
        }, function(err) {
            return (err.name === 'InvalidRequestError');
        });
    });

    it('can send all types', function () {
        var valid = false;

        statsdProxy.url ='/transparent.gif?b=test&t=gauge&d=1';
        statsdProxy.querystring = url.parse(statsdProxy.url, true).query;
        valid = statsdProxy.validate();
        assert.ok(valid);

        statsdProxy.url ='/transparent.gif?b=test&t=timer&d=1';
        statsdProxy.querystring = url.parse(statsdProxy.url, true).query;
        valid = statsdProxy.validate();
        assert.ok(valid);

        statsdProxy.url ='/transparent.gif?b=test&t=increment&d=1';
        statsdProxy.querystring = url.parse(statsdProxy.url, true).query;
        valid = statsdProxy.validate();
        assert.ok(valid);

        statsdProxy.url ='/transparent.gif?b=test&t=decrement&d=1';
        statsdProxy.querystring = url.parse(statsdProxy.url, true).query;
        valid = statsdProxy.validate();
        assert.ok(valid);
    });

    it('can send sample rate', function () {
        var valid = false;

        statsdProxy.url = '/transparent.gif?b=test&t=increment&d=1&s=0.25';
        statsdProxy.querystring = url.parse(statsdProxy.url, true).query;
        valid = statsdProxy.validate();
        assert.ok(valid);
    });

    it('throws on an invalid sample rate', function () {
        var valid = false;

        statsdProxy.url = '/transparent.gif?b=test&t=increment&d=1&s=test';
        statsdProxy.querystring = url.parse(statsdProxy.url, true).query;

        assert.throws(function() {
            statsdProxy.validate();
        }, function(err) {
            return (err.name === 'InvalidSampleRateError');
        });
    })

    it('throws on an invalid referer', function () {
        statsdProxy.url ='/transparent.gif?b=test&t=increment&d=1';
        statsdProxy.querystring = url.parse(statsdProxy.url, true).query;
        statsdProxy.options.whitelist = ['test'];

        assert.throws(function() {
            statsdProxy.validate();
        }, function(err) {
            return (err.name === 'InvalidRefererError');
        });
    });

    it('throws on an invalid querystring', function () {
        statsdProxy.url = '/transparent.gif?test=1';
        statsdProxy.querystring = url.parse(statsdProxy.url, true).query;
        statsdProxy.options.whitelist = ['.*'];

        assert.throws(function() {
            statsdProxy.validate();
        }, function(err) {
            return (err.name === 'InvalidQuerystringError');
        });
    });

    it('throws on an invalid querystring on bad type', function () {
        statsdProxy.url = '/transparent.gif?b=test&t=invalid&d=1';
        statsdProxy.querystring = url.parse(statsdProxy.url, true).query;

        assert.throws(function() {
            statsdProxy.validate();
        }, function(err) {
            return (err.name === 'InvalidQuerystringError');
        });
    });

    it('can disable the referer check', function () {
        statsdProxy.url ='/transparent.gif?b=test&t=increment&d=1';
        statsdProxy.querystring = url.parse(statsdProxy.url, true).query;
        statsdProxy.referer = null;
        statsdProxy.options.refererCheck = false;

        var valid = statsdProxy.validate();
        assert.ok(valid);
    });
})
