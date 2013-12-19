var http = require('http'),
    fs = require('fs'),
    nconf = require('nconf'),
    StatsdProxy = require('./src/statsdProxy'),
    gif;

nconf.argv().file('config.json').file('whitelist', 'whitelist.json');
nconf.defaults({
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
});
gif = fs.readFileSync('./transparent.gif');

http.createServer(function (req, res) {
    var statsdProxy = new StatsdProxy(req.url, req.headers['referer'], nconf.get());
    statsdProxy.log(req.url);
    if (statsdProxy.run()) {
        res.setHeader('Content-Type', 'image/gif');
        res.end(gif, 'binary');
    } else {
        res.writeHead(404, {"Content-Type": "text/plain"});
        res.write("404 Not Found");
        res.end();
    }
    statsdProxy.log('---');
}).listen(nconf.get('serverPort'), nconf.get('serverHost'));
