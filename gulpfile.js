const gulp = require("gulp");
const browserSync = require("browser-sync").create();
const sass = require("gulp-sass");
const uglify = require("gulp-uglify");

function style() {
	return gulp
		.src("site/scss/*.scss")
		.pipe(sass({ outputStyle: "compressed" }).on("error", sass.logError))
		.pipe(gulp.dest("site/dist/css"))
		.pipe(browserSync.stream());
}

function script() {
	return gulp.src("site/js/*.js").pipe(uglify()).pipe(gulp.dest("site/dist/js")).pipe(browserSync.stream());
}

function watch() {
	browserSync.init({
		server: {
			baseDir: "./site/",
		},
	});
	gulp.watch("site/scss/*.scss", style);
	gulp.watch("site/js/*.js", script);
	gulp.watch("site/*.html").on("change", browserSync.reload);
}

exports.style = style;
exports.script = script;
exports.watch = watch;
