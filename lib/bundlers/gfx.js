'use strict';

const R = require('ramda');
const watch = require('gulp-watch');

var extend 		= require('extend');
var imagemin 	= require('gulp-imagemin');
var pngquant	= require('imagemin-pngquant');

module.exports = R.curry(function(gulp, config, runConfig) {

	function errorCb(err) {
		console.log(err);
	}


	if(runConfig.watch) {
		return gulp.src(config.src)
			.pipe(watch(config.src))
			.pipe(gulp.dest(config.dest));
	} else {
		console.log('GFX |', config.name, ':', 'bundling ...');
		return gulp.src(config.src)
			.pipe(imagemin(
				[
					imagemin.gifsicle(),
					imagemin.jpegtran(),
					imagemin.optipng(),
					imagemin.svgo(),
					pngquant()
				],
				extend(true, {
					progressive: true,
					svgoPlugins: [{removeViewBox: false}],
				}, config.imagemin)
			))
			.on('error', errorCb)
			.pipe(gulp.dest(config.dest))
			.on('error', errorCb)
			.on('end', errorCb);
	}

});
