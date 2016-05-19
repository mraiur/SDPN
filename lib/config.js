var _               = require('lodash');
var dot             = require('dot-object');
var path            = require('path');
var defaultConfig   = require(__dirname+'/../config.default.json');
var dirLib          = require(__dirname+'/../lib/dir');
var config          = defaultConfig;

if( dirLib.fileExists( __dirname+'/../config.json') )
{
    config = _.merge(config, require(__dirname+'/../config.json'));
}

var Config = {
    get: function( key ){
        var value = dot.pick(key, config);
        if( value ) {
            return value;
        }
        return defaultValue || null;
    },
    debug: function(){
        console.log("CONFIG", config);
    }
};

module.exports = Config;
