var gulp = require("gulp");
var sass = require("gulp-sass");
var header = require("gulp-header");
var cleanCSS = require("gulp-clean-css");
var rename = require("gulp-rename");
var uglify = require("gulp-uglify");
var pkg = require("./package.json");
var browserSync = require("browser-sync");
var gutil = require("gulp-util");
var babel = require("gulp-babel");
var htmlmin = require("gulp-htmlmin");
const imagemin = require("gulp-imagemin");
var fs = require("fs");
var cache = require("gulp-cache");
var del = require("del");
var runSequence = require("run-sequence");
var gulpIf = require("gulp-if");
var cssnano = require("gulp-cssnano");
var useref = require("gulp-useref");

var vendors = [
    "bootstrap",
    "font-awesome",
    "jquery",
    "jquery.easing",
    "popper.js",
    "three"
];

// Development Tasks
// -----------------

// Start browserSync server
gulp.task("browserSync", function() {
    browserSync({
        server: {
            baseDir: "app"
        }
    });
});

// Copy third party libraries from /node_modules into /vendor
gulp.task("vendor", function() {
    vendors.forEach(vendor => {
        if (fs.existsSync("./node_modules/" + vendor + "/dist")) {
            gulp
                .src([
                    "./node_modules/" + vendor + "/dist/**/*",
                    "!./node_modules/" + vendor + "/dist/css/bootstrap-grid*",
                    "!./node_modules/" + vendor + "/dist/css/bootstrap-reboot*"
                ])
                .pipe(gulp.dest("./app/vendor/" + vendor));
        } else {
            gulp
                .src([
                    "./node_modules/" + vendor + "/**/*",
                    "!./node_modules/" + vendor + "/{less,less/*}",
                    "!./node_modules/" + vendor + "/{scss,scss/*}",
                    "!./node_modules/" + vendor + "/.*",
                    "!./node_modules/" + vendor + "/*.{txt,json,md}",
                    "!./node_modules/" + vendor + "/dist/core.js"
                ])
                .pipe(gulp.dest("./app/vendor/" + vendor));
        }
    });
});
// Copy third party libraries from /node_modules into /vendor
gulp.task("vendor-dist", function() {
    vendors.forEach(vendor => {
        if (fs.existsSync("./node_modules/" + vendor + "/dist")) {
            gulp
                .src([
                    "./node_modules/" + vendor + "/dist/**/*",
                    "!./node_modules/" + vendor + "/dist/css/bootstrap-grid*",
                    "!./node_modules/" + vendor + "/dist/css/bootstrap-reboot*"
                ])
                .pipe(gulp.dest("./dist/vendor/" + vendor));
        } else {
            gulp
                .src([
                    "./node_modules/" + vendor + "/**/*",
                    "!./node_modules/" + vendor + "/{less,less/*}",
                    "!./node_modules/" + vendor + "/{scss,scss/*}",
                    "!./node_modules/" + vendor + "/.*",
                    "!./node_modules/" + vendor + "/*.{txt,json,md}",
                    "!./node_modules/" + vendor + "/dist/core.js"
                ])
                .pipe(gulp.dest("./dist/vendor/" + vendor));
        }
    });
});

gulp.task("sass", function() {
    return gulp
        .src("app/scss/**/*.scss") // Gets all files ending with .scss in app/scss and children dirs
        .pipe(sass().on("error", sass.logError)) // Passes it through a gulp-sass, log errors to console
        .pipe(gulp.dest("app/css")) // Outputs it in the css folder
        .pipe(
            browserSync.reload({
                // Reloading with Browser Sync
                stream: true
            })
        );
});

// Watchers
gulp.task("watch", function() {
    gulp.watch("app/scss/**/*.scss", ["sass"]);
    gulp.watch("app/*.html", browserSync.reload);
    gulp.watch("app/js/**/*.js", browserSync.reload);
});
gulp.task("js:minify", function() {
    return gulp
        .src(["./app/js/**/*.js", "!./app/js/**/*.min.js"])
        .pipe(
            babel({
                presets: ["es2015"]
            })
        )
        .pipe(uglify())
        .on("error", function(err) {
            gutil.log(gutil.colors.red("[Error]"), err.toString());
        })
        .pipe(
            rename({
                suffix: ".min"
            })
        )
        .pipe(gulp.dest("./app/js"))
        .pipe(browserSync.stream());
});

// JS
gulp.task("js", ["js:minify"]);

// Optimization Tasks
// ------------------
// Optimizing CSS and JavaScript
gulp.task("useref", function() {
    return gulp
        .src("app/*.html")
        .pipe(useref())
        .pipe(
            gulpIf(
                "*.js",
                babel({
                    presets: ["es2015"]
                })
            )
        )
        .pipe(gulpIf("*.js", uglify()))
        .pipe(gulpIf("*.css", cssnano()))
        .pipe(gulp.dest("dist"));
});
// Optimizing Images
gulp.task("images", function() {
    return (
        gulp
            .src("app/img/**/*.+(png|jpg|jpeg|gif|svg)")
            // Caching img that ran through imagemin
            .pipe(
                cache(
                    imagemin({
                        interlaced: true
                    })
                )
            )
            .pipe(gulp.dest("dist/img"))
    );
});
gulp.task("pdf", function() {
    return (
        gulp
            .src("app/img/**/*.pdf")
            .pipe(gulp.dest("dist/img"))
    );
});

// Copying fonts
gulp.task("fonts", function() {
    return gulp.src("app/fonts/**/*").pipe(gulp.dest("dist/fonts"));
});
// Cleaning
gulp.task("clean", function() {
    return del.sync("dist").then(function(cb) {
        return cache.clearAll(cb);
    });
});

gulp.task("clean:dist", function() {
    return del.sync(["dist/**/*", "!dist/images", "!dist/images/**/*"]);
});

// HTML
gulp.task("html", ["html:minify"]);

gulp.task("html:minify", function() {
    return gulp
        .src(["./dist/*.html"])
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(gulp.dest("dist"))
        .pipe(browserSync.stream());
});

gulp.task("cluon", function() {
    return gulp
        .src(["./app/js/libcluon-*.js", "./app/js/opendlv-standard-message-set-*"])
        .pipe(gulp.dest("./dist/js"))
});

// Build Sequences
// ---------------

gulp.task("default", function(callback) {
    runSequence(["vendor", "sass"], "browserSync", "watch", callback);
});

gulp.task("build", function(callback) {
    runSequence(
        "clean:dist",
        "sass",
        "vendor-dist",
        ["useref", "images","pdf", "fonts"],
        "html",
        "cluon",
        callback
    );
});
