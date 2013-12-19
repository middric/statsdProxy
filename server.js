var http = require('http'),
    fs = require('fs'),
    nconf = require('nconf'),
    StatsdProxy = require('./src/statsdProxy'),
    gif;

nconf.argv().file('config.json').file('whitelist', 'whitelist.json');
nconf.defaults({
    "logging": true,
    "imagePath": "./transparent.gif",
    "serverHost": "localhost",
    "serverPort": 3202,
    "statsDHost": "localhost",
    "statsDPort": 3200,
    "whitelist": ['.*']
});
gif = fs.readFileSync(nconf.get('imagePath'));

http.createServer(function (req, res) {
    var statsdProxy = new StatsdProxy(req, res, nconf.get());
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
