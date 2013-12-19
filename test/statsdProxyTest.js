var assert = require('assert'),
    url = require('url'),
    StatsdProxy = require('../src/StatsdProxy'),
    InvalidRequestError = require('../src/errors/InvalidRequestError.js'),
    InvalidRefererError = require('../src/errors/InvalidRefererError.js'),
    InvalidQuerystringError = require('../src/errors/InvalidQuerystringError.js');

describe('statsdProxy', function () {
    var options = {
            statsdHost: 'localhost',
            statsdPort: 1234,
            whitelist: ['.*'],
            logging: true,
            refererCheck: true
        },
        expected = {
            host: 'localhost',
            port: 1234,
            prefix: ''
        }
        statsdProxy = new StatsdProxy('url', 'referer', options);
    it('should contain a SDC instance', function () {
        assert.deepEqual(statsdProxy.SDC.options, expected);
    });

    it('validates a correct request', function () {
        statsdProxy.url = '/transparent.gif?b=test&t=c&v=1';
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

    it('throws on an invalid referer', function () {
        statsdProxy.url ='/transparent.gif?b=test&t=c&v=1';
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
        statsdProxy.url = '/transparent.gif?b=test&t=z&v=1';
        statsdProxy.querystring = url.parse(statsdProxy.url, true).query;

        assert.throws(function() {
            statsdProxy.validate();
        }, function(err) {
            return (err.name === 'InvalidQuerystringError');
        });
    });

    it('can disable the referer check', function () {
        statsdProxy.url ='/transparent.gif?b=test&t=c&v=1';
        statsdProxy.querystring = url.parse(statsdProxy.url, true).query;
        statsdProxy.referer = null;
        statsdProxy.options.refererCheck = false;

        var valid = statsdProxy.validate();
        assert.ok(valid);
    });
})
