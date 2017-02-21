'use strict';

const R = require('ramda');
const watch = require('gulp-watch');
const path = require('path');

const extend 		= require('extend');
const imagemin 	= require('gulp-imagemin');
const pngquant	= require('imagemin-pngquant');
const gutil = require('gulp-util');
const newer = require('gulp-newer');
const Logger = require('../logger')('GFX');
const filter = require('gulp-filter');
const del = require('del');

module.exports = R.curry(function(gulp, config, runConfig) {

	function errorCb(err) {
		if(err) {
			console.log(err);
		}
	}

	const log = Logger(config.name);



	return (runConfig.watch ? watch(config.src, { ignoreInitial: false }) : gulp.src(config.src))
		.pipe(filter(file => {

			let filename = path.basename(file.path)

			if(filename.substr(0, 1) === '.') {
				return false;
			}

			if(file.event === 'unlink') {
				let destFile = path.resolve(config.dest, path.relative(file.base, file.path));
				del.sync(destFile);
				log(`File deleted "./${path.relative(file.base, file.path)}"`);
				return false;
			}
			return true;
		}))
		.pipe(newer(config.dest))
		.on('data', (file) => {
			log(`Processing file (${file.event}) "./${path.relative(file.base, file.path)}"`);
		})
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
		.on('end', () => {
			log('... ready');
		});



	// if(runConfig.watch) {
	// 	return gulp.src(config.src)
	// 		.pipe(watch(config.src))
	// 		.pipe(gulp.dest(config.dest));
	// } else {
	// 	console.log('GFX |', config.name, ':', 'bundling ...');
	// 	return gulp.src(config.src)
	// 		.pipe(imagemin(
	// 			[
	// 				imagemin.gifsicle(),
	// 				imagemin.jpegtran(),
	// 				imagemin.optipng(),
	// 				imagemin.svgo(),
	// 				pngquant()
	// 			],
	// 			extend(true, {
	// 				progressive: true,
	// 				svgoPlugins: [{removeViewBox: false}],
	// 			}, config.imagemin)
	// 		))
	// 		.on('error', errorCb)
	// 		.pipe(gulp.dest(config.dest))
	// 		.on('error', errorCb)
	// 		.on('end', errorCb);
	// }

});
