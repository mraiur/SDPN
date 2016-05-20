var fs          = require('fs');
var path        = require('path');
var dot         = require('dot-object');
var _           = require('lodash');
var markdown        = require('node-markdown').Markdown;

function fileExists( filePath ){
    try{
        fs.statSync(filePath);
    }catch(err){
        if(err.code == 'ENOENT') return false;
    }
    return true;
}

function dirTree(filename) {
    var stats = fs.lstatSync(filename),
        info = {
            path: filename,
            name: path.basename(filename)
        };

    if (stats.isDirectory()) {
        info.type = "folder";
        info.children = fs.readdirSync(filename).map(function(child) {
            return dirTree(filename + '/' + child);
        });
    } else {
        // Assuming it's a file. In real life it could be a symlink or
        // something else!
        info.type = "file";
    }
    return info;
}
var allowedExtensions = /.json|.md/i;

var allowedTags = 'p|strong|span|a|img';
var restrinctHtmlTags = false;
var allowedAttributes = {
    'a':'href|style',
    'img': 'src',
    '*': 'title|style'
};

function _mapTree (object, exclude){

    function loop( object, map ){
        map = map || {};
        if( object.type == 'folder')
        {
            for( var i in object.children )
            {
                var item = object.children[i];
                loop( item, map);
            }
        } else if( object.path.search(allowedExtensions) > -1 ){
            var pathName = object.path;


            while( ['.', '/'].indexOf(pathName.substr(0, 1)) > -1 )
            {
                pathName = pathName.substr(1);
            }
            if( pathName.substr(0, exclude.length) == exclude){
                pathName = pathName.substr(exclude.length+1);
            }

            if(pathName)
            {
                if( fileExists(object.path ) )
                {
                    if( object.path.substr(-3) === ".md"){
                        var content = fs.readFileSync(object.path, 'utf8');
                        var mdContent = markdown( content, restrinctHtmlTags, allowedTags, allowedAttributes );
                        var keyPath = pathName.replace(/.md/i, '').split("/");
                        var obj = map;

                        for( var cnt = 0; cnt < keyPath.length; cnt++ )
                        {
                            if(!obj[keyPath[cnt]]){
                                obj[keyPath[cnt]] = {};
                            }

                            if( cnt == keyPath.length-1 )
                            {
                                obj[keyPath[cnt]] = mdContent;
                            }
                            obj = obj[keyPath[cnt]];
                        }
                    }
                    else if( object.path.substr(-5) === ".json" )
                    {
                        var temp = require( __dirname+'/../'+object.path );
                        _.merge(map, temp);
                    }

                }
            }
        }

        return map;
    }
    var result = {};
    for( var locale in object.children ){
        loop( object.children[locale], result);
    }

    return result;
}

module.exports = {
    fileExists: fileExists,
    tree      : dirTree,
    mapTree   : function( filename, exclude){
        return _mapTree( dirTree(filename), exclude);
    }
};
