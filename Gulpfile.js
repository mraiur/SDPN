var notifier        = require('node-notifier');
//var marked          = require('marked');
//var markdown        = require('markdown').markdown;
var showdown        = require('showdown');
var mdConverter     = new showdown.Converter({
    simplifiedAutoLink: true
});
var dot             = require('dot-object');
var async           = require('async');
var fs              = require('fs');
var _               = require('lodash');
var gulp            = require('gulp');
var gulpConcat      = require('gulp-concat');
var gulpMinifyCss   = require('gulp-minify-css');
var gulpSourceMaps  = require('gulp-sourcemaps');
var gulpSass        = require('gulp-sass');
var gulpIf          = require('gulp-if');
var gulpEjs         = require('gulp-ejs');

var dirLib          = require('./lib/dir');
var Config          = require('./lib/config');
var Theme           = Config.get('theme');

var tplData = {};
var development = true;

gulp.task('theme-images', function(){
    gulp.src('./theme/'+Theme+'/img/**/*{png,gif,jpg,jpeg}').pipe( gulp.dest( __dirname+'/build/img') );
});

gulp.task('images', function(){
    gulp.src('./information/img/**/*{png,gif,jpg,jpeg}').pipe( gulp.dest( __dirname+'/build/images') );
});

gulp.task('theme-fonts', function(){
    gulp.src('./theme/'+Theme+'/fonts/**/*{ttf,woff,eof,svg}').pipe( gulp.dest( __dirname+'/build/fonts') );
});

gulp.task('theme-sass', function () {
    var startTime = Date.now();

    var stream = gulp.src('./theme/'+Theme+'/sass/app.scss')
        .pipe( gulpIf( development, gulpSourceMaps.init( __dirname+'/build/stylesheets' ) ))
        .pipe( gulpSass().on( 'error', gulpSass.logError) )
        .pipe( gulpIf( development, gulpSourceMaps.write() ) )
		.pipe( gulp.dest( __dirname+'/build/stylesheets' ) );

		stream.on("end", function(){
            var endTime = Date.now() - startTime;
            notifier.notify({
                title: 'SASS',
                message: endTime+'ms'
            });
		});
});

gulp.task('tplData', function(next){
    var dirData = dirLib.mapTree('./information');
    var informationFiles = dot.dot( dirData );
    var markdownList = [];
    var i;

    function toMarkdown(callback){
        var me = this;
        /*var options = {
          renderer: new marked.Renderer(),
          gfm: true,
          tables: true,
          breaks: false,
          pedantic: false,
          sanitize: false,
          smartLists: true,
          smartypants: false
        };
        marked( me.mk, options, function (err, content) {
            if(!err){
                tplData[me.key] = content;
            } else {
                console.warn("markdown error", me.key, err);
                tplData[me.key] = null;
            }
            callback();
        });*/

        //tplData[me.key] = markdown.toHTML( me.mk );


         tplData[me.key]      = mdConverter.makeHtml( me.mk );
        fs.writeFileSync("./mk-tmp/"+me.key, tplData[me.key]);
        callback();
    }

    for( i in informationFiles )
    {

        if( i.substr(-3) === ".md")
        {
            var key = i.substr(0, i.length-3);
            var markdownString = fs.readFileSync(informationFiles[i], 'utf8');

            markdownList.push( toMarkdown.bind({ key:key, mk: markdownString }) );
        }
    }

    async.parallel(markdownList, function(){
        if( dirLib.fileExists( "./information/information.json") ){
            tplData = _.merge(tplData, require("./information/information.json") );
        }
        console.log("tplData", tplData);

        dot.object(tplData);
        next();
    });
});

gulp.task('theme-views', ['tplData'], function(next){

    gulp.src('./theme/'+Theme+'/view/*.ejs')
    	.pipe( gulpEjs( tplData, {
            ext: '.html'
        }))
    	.pipe( gulp.dest(__dirname+'/build/') );

    next();
});

gulp.task('watch', function(){
    gulp.watch('./theme/'+Theme+'/sass/**/*.scss', ['theme-sass']);
    gulp.watch('./theme/'+Theme+'/view/**/*.ejs', ['theme-views']);
    gulp.watch('./theme/'+Theme+'/img/**/*.{png,gif,jpg,jpeg}', ['theme-images']);
    gulp.watch('./theme/'+Theme+'/fonts/**/*.{ttf,woff,eof,svg}', ['theme-fonts']);
    gulp.watch('./information/**/*.*', ['theme-views']);
    gulp.watch('./information/**/*.{png,gif,jpg,jpeg}', ['images']);
});

gulp.task('default', ['theme-sass', 'theme-fonts', 'images', 'theme-images', 'theme-views']);
