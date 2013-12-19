# statsdProxy

A Node.js application for proxying HTTP requests to statsD. Inspired by [js proxy by Swizec](https://github.com/Swizec/personal-dashboard/blob/master/collectors/js_proxy/server.js).

## How it works
statsdProxy works by listening for HTTP requests and forwarding them on to statsD using [node-statsd-client](https://github.com/msiebuhr/node-statsd-client).

To do this requests must be made to the proxy in the following format:

`http://serverHost:serverPort/transparent.gif?b=<bucket>&t=<type>&v=<value>`

Bucket is the metric name you wish to update. Type can be one of c (counter), t (timer), or g (gauge). Finally value is the value you wish to send.

## To Start
```bash
$ npm install
$ node server.js
```

## Configuration
Configuration options and their defaults
```js
{
    // Enable logging to the console
    "logging": true,
    
    // Hostname to use for the proxy server
    "serverHost": "localhost",
    
    // Port for the proxy server
    "serverPort": 3202,
    
    // StatsD hostname
    "statsDHost": "localhost",
    
    // StatsD port
    "statsDPort": 3200,
    
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
