# statsdProxy

A Node.js application for proxying HTTP requests to statsD. Inspired by [js proxy by Swizec](https://github.com/Swizec/personal-dashboard/blob/master/collectors/js_proxy/server.js).

[![Build Status](https://travis-ci.org/middric/statsdProxy.png)](https://travis-ci.org/middric/statsdProxy)

## How it works
statsdProxy works by listening for HTTP requests and forwarding them on to statsD using [node-statsd](https://github.com/sivy/node-statsd).

To do this requests must be made to the proxy in the following format:

`http://serverHost:serverPort/transparent.gif?b=<bucket>&t=<type>&d=<delta>&s=<sample rate>`

Bucket is the metric name you wish to update. Type can be one of `decrement`, `increment`, `gauge`, or `timer`.  Value is the value you wish to send. Finally sample rate is optional and represents the sampling rate - should be a float between 0 and 1.

## To Start
```bash
$ npm install
$ npm start
```

## Configuration
Configuration options and their defaults
```js
{
    // Enable logging to the console
    "logging": false,

    // Check referer header against whitelist
    "refererCheck": true,
    
    // Hostname to use for the proxy server
    "serverHost": "localhost",
    
    // Port for the proxy server
    "serverPort": 3202,
    
    // StatsD hostname
    "statsdHost": "localhost",
    
    // StatsD port
    "statsdPort": 3200,
    
    // Whitelist of referral address to accept
    "whitelist": ['.*']
}
```

To override configuration create a config.json file in the project root with the options to override. Options can also be overridden when starting the server:

```bash
node server.js --logging true
```

## Referral whitelisting
statsdProxy does some simple header referral checking to minimize spam to statsd - this is not foolproof and is easy to by pass but does offer some protection. By default statsdProxy will allow all referers but a whitelist.json file can be provided in the root directory to override this setting. whitelist.json should contain an array of regular expressions to check against, for example:

```json
{
    "whitelist": [
        ".*\\.myhostname\\.com.*",
        ".*\\.myhostname\\.co\\.uk.*"
    ]
}
```
