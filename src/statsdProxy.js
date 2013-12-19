var url = require('url'),
    statsd = require('statsd-client');

function StatsdProxy(requestUrl, requestReferer, options) {
    this.url = requestUrl;
    this.referer = requestReferer;
    this.options = options;
    this.querystring = url.parse(this.url, true).query;

    this.SDC = new statsd({
        host: this.options.statsDHost,
        port: this.options.statsDPort
    });
}

StatsdProxy.prototype.run = function () {
    if (!this.validate()) {
        return false;
    }

    this.update();
    return true;
}

StatsdProxy.prototype.update = function () {
    if (this.querystring.t === 'c') {
        this.SDC.increment(this.querystring.b, this.querystring.v);
    } else if (this.querystring.t === 't') {
        this.SDC.timing(this.querystring.b, this.querystring.v);
    } else if (this.querystring.t === 'g') {
        this.SDC.gauge(this.querystring.b, this.querystring.v);
    }
    this.SDC.increment('js_proxy.requests');
}

StatsdProxy.prototype.validate = function () {
    if (!this.url.match(/^\/transparent\.gif/gi)) {
        this.log("Invalid request");
        return false;
    }
    if (!this.checkReferer()) {
        this.log("Invalid referer: " + this.referer);
        return false;
    }
    if (
        !this.querystring.b ||
        !this.querystring.t ||
        !this.querystring.v
    ) {
        this.log("Invalid querysting: " . this.querystring);
        return false;
    }
    if (['c','g','t'].indexOf(this.querystring.t) === -1) {
        this.log("Invalid stat type: " . this.querystring.t);
        return false;
    }

    return true;
}

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
}

StatsdProxy.prototype.log = function (msg) {
    if (this.options.logging) {
        console.log(msg);
    }
}

module.exports = StatsdProxy;
