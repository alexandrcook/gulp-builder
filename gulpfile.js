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
        html: 'app/**/*.*',
        js: 'app/scripts/**/*.*',
        style: 'app/sass/**/*.*',
        img: 'app/images/**/*.*',
        fonts: 'app/fonts/**/*.*'
    },
    approot: './build'
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
        .pipe(gulp.dest(path.build.img));
});


//Fonts build
gulp.task('fonts', function () {
    gulp.src(path.app.fonts)
        .pipe(gulp.dest(path.build.fonts))
        .pipe(browserSync.reload({
            stream: true,
        }));
});


// Task to get the size of the app project
gulp.task('size', function () {
    gulp.src('./app/**')
        .pipe(size({
            showFiles: true,
        }));
});

// Task to get the size of the build project
gulp.task('build-size', function () {
    gulp.src('./build/**')
        .pipe(size({
            showFiles: true,
        }));
});

// Serve application
gulp.task('serve', ['styles', 'html', 'scripts', 'images', 'jshint', 'size', 'fonts'], function () {
    browserSync.init({
        server: {
            baseDir: 'build',
        },
    });
});

// Run all Gulp tasks and serve application
gulp.task('default', ['serve', 'styles'], function () {
    gulp.watch(path.watch.style, ['styles']);
    gulp.watch(path.watch.html, ['html']);
    gulp.watch(path.watch.js, ['scripts']);
    gulp.watch(path.watch.img, ['images']);
    gulp.watch(path.watch.fonts, ['fonts']);
});