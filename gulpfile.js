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
    sourcemaps = require('gulp-sourcemaps'),
    concat = require('gulp-concat');
    
var jsSource, 
    environment,
    htmlSource,
    outputFolder,
    fileStyle;
   
environment = "development";

jsSource1 = [
    'src/jqloader.js',
    'src/TweenMax.min.js',
    'src/myscript.js']; 

jsSource2 = ['jquery.scrollmagic.min.js'];

htmlSource = [outputFolder + '*.html'];

if(environment === 'development') {
    outputFolder = 'builds/development/';
    fileStyle = 'expanded';
}else if(environment === 'production') {
    outputFolder = 'builds/production/';
    fileStyle = 'compressed';
}

//Note this sass task syntax must return.
gulp.task('sass', function () {
   return sass('sass/**/*.scss', {
       sourcemap: true,
       style: fileStyle
   })
    .on('error', gulputil.log)
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(outputFolder + 'css'))
    .pipe(connect.reload());
});

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
            .pipe(gulpif(environment === 'development', uglify()))
            .pipe(gulp.dest(outputFolder + 'js'))
            .pipe(connect.reload());
});

gulp.task('watch', function () {
    gulp.watch('src/*.js', ['js']);
    gulp.watch('sass/**/*.scss', ['sass']);
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
gulp.task('default', ['js', 'html', 'sass', 'moveImages', 'connect', 'watch']);