'use strict';

const R = require('ramda');
const pug = require('gulp-pug');
const watch = require('gulp-watch');


module.exports = R.curry(function(gulp, config, runConfig) {

	if(runConfig.watch) {
		return gulp.src(config.src)
			.pipe(watch(config.src))
			.pipe(pug({
				pretty: true
 			}))
			.pipe(gulp.dest(config.dest));
	} else {
		return gulp.src(config.src)
			.pipe(pug({
				// Your options in here.
			}))
			.pipe(gulp.dest(config.dest));
	}

});
