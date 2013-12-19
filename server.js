var http = require('http'),
    fs = require('fs'),
    nconf = require('nconf'),
    StatsdProxy = require('./src/statsdProxy'),
    log = function (msg) {
        if (nconf.get('logging')) {
            console.log(msg);
        }
    },
    gif;

nconf.argv().file('config.json').file('whitelist', 'whitelist.json');
nconf.defaults({
    // Enable logging to the console
    "logging": false,
    
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
});
gif = fs.readFileSync('./transparent.gif');

http.createServer(function (req, res) {
    var statsdProxy = new StatsdProxy(req.url, req.headers['referer'], nconf.get());
    log(req.url);
    try {
        statsdProxy.run();
        res.setHeader('Content-Type', 'image/gif');
        res.end(gif, 'binary');
    } catch (err) {
        log(err.message);
        res.writeHead(404, {"Content-Type": "text/plain"});
        res.write("404 Not Found");
        res.end();
    }
    log('---');
}).listen(nconf.get('serverPort'), nconf.get('serverHost'));
