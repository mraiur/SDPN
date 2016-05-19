var fs          = require('fs');
var path        = require('path');

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

function _mapTree (object){
    function loop(path, object, map ){
        map = map || {};
        if( object.type == 'folder'){
            for( var locale in object.children ){
                var item = object.children[locale];
                if( item.type == 'folder' ){
                    loop(path+'.'+item.name, item, map);
                } else {
                    loop(path+'.'+item.name.replace('.json', ''), item, map);
                }
            }
        } else {
            var pathName = path;
            if( pathName.substr(0, 1) == '.' ){
                pathName = pathName.substr(1);
            }
            if(pathName)
            {
                map[pathName] = object.path;
            }
        }

        return map;
    }
    var result = {};
    for( var locale in object.children ){
        result[object.children[locale].name] = loop('', object.children[locale], {});
    }
    return result;
}

module.exports = {
    fileExists: fileExists,
    tree      : dirTree,
    mapTree   : function( filename ){
        return _mapTree( dirTree(filename) );
    }
};
