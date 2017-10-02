var gulp = require('gulp'); // Require gulp

// Sass dependencies
var sass = require('gulp-sass'); // Compile Sass into CSS
var minifyCSS = require('gulp-minify-css'); // Minify the CSS

// Minification dependencies
var minifyHTML = require('gulp-minify-html'); // Minify HTML
var concat = require('gulp-concat'); // Join all JS files together to save space
var stripDebug = require('gulp-strip-debug'); // Remove debugging stuffs
var uglify = require('gulp-uglify'); // Minify JavaScript
var imagemin = require('gulp-imagemin'); // Minify images

// Other dependencies
var size = require('gulp-size'); // Get the size of the project
var browserSync = require('browser-sync'); // Reload the browser on file changes
var jshint = require('gulp-jshint'); // Debug JS files
var stylish = require('jshint-stylish'); // More stylish debugging


//Custom
var include = require('gulp-include'); //JS include
var appRoot = require('app-root-path'); //Get root-path
var chokidar = require('chokidar'); //custom watcher
var clean = require('gulp-clean');

//My PATH
var path = {
    build: { //Where put ready files
        html: 'build/',
        js: 'build/scripts/',
        css: 'build/css/',
        img: 'build/images/',
        fonts: 'build/fonts/'
    },
    app: { //Where get files to work
        html: 'app/*.html', //All .html files from root
        js: 'app/js/main.js',
        css: 'app/sass/main.scss',
        img: 'app/images/**/*.*', //All images
        fonts: 'app/fonts/**/*.*' //All fonts
    },
    watch: { //Where watch changes
        html: 'app/*.*',
        js: 'app/scripts/**/*.*',
        style: 'app/sass/**/*.*',
        img: 'app/images/**/*',
        fonts: 'app/fonts/**/*.*'
    },
    approot: './app',
    buildroot: './build'
};

// Tasks -------------------------------------------------------------------- >


// Task to compile Sass file into CSS, and minify CSS into build directory
gulp.task('styles', function () {
    gulp.src(path.app.css)
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./app/css'))
        .pipe(minifyCSS())
        .pipe(gulp.dest(path.build.css))
        .pipe(browserSync.reload({
            stream: true,
        }));
});

// Task to minify new or changed HTML pages
gulp.task('html', function () {
    gulp.src(path.app.html)
    // .pipe(minifyHTML())
        .pipe(gulp.dest(path.build.html))
        .pipe(browserSync.reload({
            stream: true,
        }));
});

// Task to run JS hint
gulp.task('jshint', function () {
    gulp.src('./app/scripts/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'));
});

// Task to concat, strip debugging and minify JS files
gulp.task('scripts', function () {
    gulp.src(['./app/scripts/libs.js', './app/scripts/main.js'])
        .pipe(concat('main.js'))
        .pipe(include({
            includePaths: [
                appRoot + "/node_modules",
                appRoot + "/bower_components",
                appRoot + "/app/scripts"
            ]
        }))
        .on('error', console.log)
        // .pipe(stripDebug()) //Bad idea
        //.pipe(uglify()) //Minyfy JS files
        .pipe(gulp.dest(path.build.js))
        .pipe(browserSync.reload({
            stream: true,
        }));
});

// Task to minify images into build
gulp.task('images', function () {
    gulp.src(path.app.img)
        .pipe(imagemin({
            interlaced: true,
            progressive: true,
            optimizationLevel: 5,
            svgoPlugins: [{removeViewBox: true}]
        }))
        .pipe(gulp.dest(path.build.img))
        .pipe(browserSync.reload({
            stream: true,
        }));
});

//Fonts build
gulp.task('fonts', function () {
    gulp.src(path.app.fonts)
        .pipe(gulp.dest(path.build.fonts))
        .pipe(browserSync.reload({
            stream: true,
        }));
});


// Task to get the size of the source
gulp.task('size', function () {
    gulp.src(path.approot)
        .pipe(size({
            showFiles: true,
        }));
});

// Task to get the size of the build project
gulp.task('build-size', function () {
    gulp.src(path.buildroot)
        .pipe(size({
            showFiles: true,
        }));
});

//Clean build path
gulp.task('clean', function () {
    return gulp.src(path.buildroot, {read: false})
        .pipe(clean());
});

// Serve application
gulp.task('serve', ['styles', 'html', 'scripts', 'images', 'jshint', 'size', 'fonts'], function () {
    browserSync.init({
        server: {
            baseDir: path.buildroot,
        },
    });
});

// Run all Gulp tasks and serve application
gulp.task('default', ['serve', 'styles'], function () {
    chokidar.watch(path.watch.style, {ignored: /(^|[\/\\])\../}).on('all', (event, path) => {
        console.log(event,path);
        gulp.start('styles')
    });
    chokidar.watch(path.watch.html, {ignored: /(^|[\/\\])\../}).on('all', (event, path) => {
        console.log(event,path);
        gulp.start('html')
    });
    chokidar.watch(path.watch.js, {ignored: /(^|[\/\\])\../}).on('all', (event, path) => {
        console.log(event,path);
        gulp.start('scripts')
    });
    chokidar.watch(path.watch.img, {ignored: /(^|[\/\\])\../}).on('all', (event, path) => {
        console.log(event,path);
        gulp.start('images')
    });
    chokidar.watch(path.watch.fonts, {ignored: /(^|[\/\\])\../}).on('all', (event, path) => {
        console.log(event,path);
        gulp.start('fonts')
    });
});