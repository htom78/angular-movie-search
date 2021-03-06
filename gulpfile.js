var gulp       = require('gulp');
var jshint     = require('gulp-jshint');
var uglify     = require('gulp-uglify');
var concat     = require('gulp-concat');
var usemin     = require('gulp-usemin');
var source     = require('vinyl-source-stream');
var buffer     = require('vinyl-buffer');
var clean      = require('gulp-clean');
var browserify = require('browserify');
var ngAnnotate = require('gulp-ng-annotate');
var sass       = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var minifyCss  = require('gulp-minify-css');
var minifyHtml = require('gulp-minify-html');
var webserver  = require('gulp-webserver');
var karma      = require('gulp-karma');
var babel      = require('gulp-babel');
var babelify   = require('babelify');

var config = {
    app: 'app'
};

// Server
// ----------------------------------------
gulp.task('server', function() {
    return gulp.src('./dist')
        .pipe(webserver({
            livereload: true
        }))
});

// Styles
// ----------------------------------------
gulp.task('styles', function() {
    return gulp.src('app/styles/**/*.scss')
        .pipe(sourcemaps.init())
            .pipe(sass())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('app/styles'));
});

// Linting
// ----------------------------------------
gulp.task('lint', ['styles'], function () {
    return gulp.src('app/scripts/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'));
});

// BrowserSync
// ----------------------------------------
gulp.task('browserSync', function () {
    browserSync({
        server: {
            baseDir: 'dist'
        }
    });
});

// Clean
// ----------------------------------------
gulp.task('clean', function () {
    return gulp.src('dist')
        .pipe(clean());
});

// Vendor js
// ----------------------------------------
gulp.task('vendorjs', ['clean', 'styles'], function () {
    return gulp.src('./app/*.html')
        .pipe(usemin({
            html: [minifyHtml()],
            vendorjs: [uglify()]
        }))
        .pipe(gulp.dest('dist'));
});

// Pipeline - styles, lint, browserify
// ----------------------------------------
gulp.task('pipeline', ['lint', 'vendorjs'], function () {
   
    gulp.src(['./app/views/**', './app/styles/font/**', './app/images/**'], {base: './app'})
        .pipe(gulp.dest('dist'));

    return browserify('./app/scripts/init.js')
        .bundle()
        .pipe(source('init.js'))
        .pipe(buffer())
        .pipe(uglify())
        .pipe(gulp.dest('dist/scripts'));
});

// Test
// ----------------------------------------
gulp.task('test', function() {
    return gulp.src('./tests')
        .pipe(karma({
            configFile: 'test/karma.conf.js',
            action: 'watch'
        })).on('error', function(err) {
            this.emit('end'); //instead of erroring the stream, end it
        });
});

// -------------------------------------------------
// Watchers
// -------------------------------------------------
gulp.task('watch', ['server'], function() {
    gulp.watch([
        'app/scripts/**/*.js',
        'app/styles/**/*.scss'
    ], ['pipeline']);
});

