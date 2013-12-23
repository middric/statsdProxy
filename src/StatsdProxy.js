"use strict";

var url = require('url'),
    statsd = require('node-statsd').StatsD,
    InvalidRequestError = require('./errors/InvalidRequestError.js'),
    InvalidRefererError = require('./errors/InvalidRefererError.js'),
    InvalidQuerystringError = require('./errors/InvalidQuerystringError.js'),
    InvalidSampleRateError = require('../src/errors/InvalidSampleRateError.js');

function StatsdProxy(requestUrl, requestReferer, options) {
    this.url = requestUrl;
    this.referer = requestReferer;
    this.options = options;
    this.querystring = url.parse(this.url, true).query;

    this.SDC = new statsd({
        host: this.options.statsdHost,
        port: this.options.statsdPort
    });
}

StatsdProxy.prototype.run = function () {
    if (!this.validate()) {
        return false;
    }

    this.update();
    return true;
};

StatsdProxy.prototype.update = function () {
    if (!this.querystring.s) {
        this.querystring.s = 1;
    }

    switch (this.querystring.t) {
        case 'decrement':
            this.SDC.decrement(this.querystring.b, this.querystring.d, this.querystring.s);
            break;
        case 'gauge':
            this.SDC.gauge(this.querystring.b, this.querystring.d, this.querystring.s);
            break;
        case 'increment':
            this.SDC.increment(this.querystring.b, this.querystring.d, this.querystring.s);
            break;
        case 'timer':
            this.SDC.timing(this.querystring.b, this.querystring.d, this.querystring.s);
            break;
    }
    this.SDC.increment('js_proxy.requests');
};

StatsdProxy.prototype.validate = function () {
    if (!this.url.match(/^\/transparent\.gif/gi)) {
        throw new InvalidRequestError('URL invalid: ' + this.url);
    }
    if (this.options.refererCheck && !this.checkReferer()) {
        throw new InvalidRefererError('Referer invalid: ' + this.referer);
    }
    if (
        !this.querystring.b ||
        !this.querystring.t ||
        !this.querystring.d
    ) {
        throw new InvalidQuerystringError('Querystring invalid: ' + this.querystring);
    }
    if (['gauge','timer','increment','decrement'].indexOf(this.querystring.t) === -1) {
        throw new InvalidQuerystringError('Querystring type invalid: ' + this.querystring.t);
    }
    if (this.querystring.s && !parseFloat(this.querystring.s)) {
        throw new InvalidSampleRateError('Sample rate must be a float: ' + this.querystring.s);
    }

    return true;
};

StatsdProxy.prototype.checkReferer = function () {
    var whitelist = this.options.whitelist,
        referer = this.referer,
        regex;

    if(!referer) {
        return false;
    }

    for (var i = whitelist.length - 1; i >= 0; i--) {
        regex = new RegExp(whitelist[i]);
        if (referer.match(regex)) {
            return true;
        }
    }

    return false;
};

module.exports = StatsdProxy;
