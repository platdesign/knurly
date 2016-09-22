'use strict';

const R = require('ramda');
const watch = require('gulp-watch');



module.exports = R.curry(function(gulp, config, runConfig) {

	if(runConfig.watch) {
		return gulp.src(config.src)
			.pipe(watch(config.src))
			.pipe(gulp.dest(config.dest));
	} else {
		return gulp.src(config.src)
			.pipe(gulp.dest(config.dest));
	}

});
