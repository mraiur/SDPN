var notifier        = require('node-notifier');
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

console.log("Building theme", Theme );

var tplData = {};
var development = true;
var tasks = ['theme-sass', 'theme-fonts', 'images', 'theme-images', 'theme-views'];

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
    tplData = dirLib.mapTree( './information', "information");
    if( development )
    {
        fs.writeFileSync( './build/tplData.json', JSON.stringify(tplData, null, " ") );
    }
    next();
});

gulp.task('theme-views', ['tplData'], function(next){

    gulp.src('./theme/'+Theme+'/view/*.ejs')
    	.pipe( gulpEjs( tplData, {
            ext: '.html'
        }))
    	.pipe( gulp.dest(__dirname+'/build/') );

    next();
});

gulp.task('watch', tasks, function(){
    gulp.watch('./theme/'+Theme+'/sass/**/*.scss', ['theme-sass']);
    gulp.watch('./theme/'+Theme+'/view/**/*.ejs', ['theme-views']);
    gulp.watch('./theme/'+Theme+'/img/**/*.{png,gif,jpg,jpeg}', ['theme-images']);
    gulp.watch('./theme/'+Theme+'/fonts/**/*.{ttf,woff,eof,svg}', ['theme-fonts']);
    gulp.watch('./information/**/*.*', ['theme-views']);
    gulp.watch('./information/**/*.{png,gif,jpg,jpeg}', ['images']);
});

gulp.task('default', tasks);
