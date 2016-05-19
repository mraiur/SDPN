var httpServer      = require('http-server');
var path            = require('path');
var Config          = require('./lib/config');
var root = path.join( __dirname, 'build');

var server = httpServer.createServer({
    root: root,
    robots: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': 'true'
    }
  });

  server.listen( Config.get('port') );
