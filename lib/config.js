var _               = require('lodash');
var dot             = require('dot-object');
var path            = require('path');
var defaultConfig   = require('./../config.default.json');
var dirLib          = require('./../lib/dir');
var config          = defaultConfig;

if( dirLib.fileExists('./../config.json') )
{
    config = _.merge(config, require('./../config.json'));
}

var Config = {
    get: function( key ){
        var value = dot.pick(key, config);
        if( value ) {
            return value;
        }
        return defaultValue || null;
    },
};

module.exports = Config;
