var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    gulpif = require('gulp-if'),
    gulputil = require('gulp-util'),
    estream = require('event-stream'),
    minifyHTML = require('gulp-minify-html'),
    imagemin = require('gulp-imagemin'),
    connect = require('gulp-connect'),
    browserify = require('gulp-browserify'),
    sass = require('gulp-ruby-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    sourcemaps = require('gulp-sourcemaps'),
    concat = require('gulp-concat');
    compass = require("gulp-compass"),
    less = require("gulp-less"),
    rename = require("gulp-rename"),
    autoprefixLess = require("less-plugin-autoprefix");
    
var jsSource, 
    environment,
    htmlSource,
    outputFolder,
    sassSources,
    lessautoprefix,
    fileStyle;
   
environment = "development";
lessautoprefix = new autoprefixLess({ browsers: ['last 2 versions'] });

jsSource1 = [
    'src/jqloader.js',
    'src/TweenMax.min.js',
    'src/myscript.js']; 

jsSource2 = ['jquery.scrollmagic.min.js'];

htmlSource = [outputFolder + '*.html'];
sassSources = ['sass/**/*.scss'];

if(environment === 'development') {
    outputFolder = 'builds/development/';
    fileStyle = 'expanded';
}else if(environment === 'production') {
    outputFolder = 'builds/production/';
    fileStyle = 'compressed';
}

//compass task, NB: no gulp.dest() required
gulp.task('compass', function () {
   gulp.src(sassSources)
       .pipe(compass({
            sass: 'sass',
            css: outputFolder + 'css',
            image: outputFolder + 'images',
            sourcemap: true,
            style: fileStyle,
            require: ['susy', 'breakpoint']
   }))
        .on('error', gulputil.log)
        .pipe(autoprefixer({
                browsers: ['last 2 versions'],
                cascade: false
            }))
        .pipe(sourcemaps.write())
        .pipe(connect.reload());
});

/*
 * Rename and save .html to .php
 */
gulp.task('renameToPHP', function() {
    gulp.src('index.html', { base: process.cwd() })
            .pipe(minifyHTML())
            .pipe(rename({
                dirname: '.',
                basename: 'index',
                extname: '.php'
            }))
            .pipe(gulp.dest(outputFolder));
});

/*
 * Compiling Less
 */
gulp.task('less', function() {
   gulp.src('less/**/*.less')
           .pipe(sourcemaps.init())
           .pipe(less({
                plugins: [lessautoprefix],
                sourcemap: true,
                compress: true,
                env: environment
            }))
           .pipe(sourcemaps.write())
           .pipe(gulp.dest(outputFolder + 'less'));
});

//Note this sass task syntax must return.
/*gulp.task('sass', function () {
   return sass(sassSources, {
       sourcemap: true,
       style: fileStyle
   })
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(autoprefixer({
        browsers: ['last 2 versions'],
        cascade: false
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(outputFolder + 'css'))
    .pipe(connect.reload());
});*/

/*combine media-queries
gulp.task('eatcmqs', function () {
   gulp.src(outputFolder + 'css/**//*.css') 
        .pipe(cmq({
            log: true
        }))
        .pipe(gulpif(environment === "production",
                gulp.dest(outputFolder + 'cmqcss')));
});*/

gulp.task('moveImages', function () {
   gulp.src('builds/development/images/**/*.*')
           .pipe(gulpif(environment === 'production', imagemin()))
           .pipe(gulpif(environment === 'production', 
            gulp.dest(outputFolder + 'images')) );
});

gulp.task('js', function () {
    var js1 = gulp.src(jsSource1);
    var js2 = gulp.src(jsSource2);
    
    return estream.merge(js1, js2)
            .pipe(concat('myscript.js'))
            .pipe(browserify())
            .on('error', gulputil.log)
            .pipe(gulpif(environment === 'production', uglify()))
            .pipe(gulp.dest(outputFolder + 'js'))
            .pipe(connect.reload());
});

gulp.task('watch', function () {
    gulp.watch('src/*.js', ['js']);
    //gulp.watch('sass/**/*.scss', ['sass']);
    gulp.watch(['sass/**/*.scss', 'sass/*.scss'], ['compass']);
    gulp.watch('builds/development/*.html', ['html']);
});

gulp.task('html', function () {
    gulp.src('builds/development/*.html')
            .pipe(gulpif(environment === 'production', minifyHTML()))
            .pipe(gulpif(environment === 'production', gulp.dest(outputFolder)))
            .pipe(connect.reload());
});

gulp.task('connect', function () {
    connect.server({
        root: outputFolder,
        livereload: true
    });
});

//let watch task run last
gulp.task('default', ['js', 'html', 'renameToPHP', 'compass', 'less', 'moveImages', 'connect', 'watch']);