'use strict';

const Hoek = require('hoek');
const plumber = require('gulp-plumber');
const livereload = require('gulp-livereload');
const autoprefixer = require('gulp-autoprefixer');
const gutil = require('gulp-util');
const minifyCss = require('gulp-minify-css');
const sass = require('gulp-sass');
const rename = require('gulp-rename');
const path = require('path');
const watch = require('gulp-watch');
const sassGraph = require('sass-graph');
const colors = require('colors');
const R = require('ramda');
const Logger = require('../logger')('CSS');



module.exports = R.curry(function(gulp, config, runConfig) {

	const log = Logger(config.name);


	var defaults = {
		sass:{
			outputStyle: 'nested',
			includePaths: [ 'node_modules', 'bower_components' ],
		},
		minify: {
			processImport: true,
			keepSpecialComments: 0
		}
	};

	config = Hoek.applyToDefaults(defaults, config);


	if(runConfig.watch) {

		livereload.listen();

		var watchStream = watch(config.src, function(stream) {
			watchGraph();
			return compile();
		});
		watchGraph();
		return compile();
	} else {
		return compile();
	}


	function watchGraph() {
		var graph = sassGraph.parseFile(config.src, {
			loadPaths: config.sass.includePaths
		});

		Object.keys(graph.index).forEach(function(key) {
			watchStream.add(key);
		});
	}


	function compile() {

		var stream = gulp.src(config.src);

		var extName = path.extname(config.dest);
		var baseName = path.basename(config.dest, extName);
		var dirname = path.dirname(config.dest);

		var start = Date.now();

		var cb = function(err) {
			if(err) {
				return console.log(err.toString());
			}
			var duration = Date.now() - start;

			log(`... ready! (${Math.round(duration/1000*100)/100}s)`);

		};

		log('Bundling ...');

		return stream
			.pipe( plumber() )
			.pipe( rename({
				basename: baseName,
				extname: extName
			}) )
			.pipe( sass( config.sass || {} ) )
			.pipe( autoprefixer( config.autoprefixer || 'last 3 versions', '> 1%', 'ie 8') )
			.pipe( runConfig.build ? minifyCss(config.minify) : gutil.noop())
			.pipe( plumber.stop() )
			.pipe( gulp.dest( dirname ) )
			.pipe( runConfig.watch ? livereload(config.livereload||{}) : gutil.noop() )
			.on('end', cb);

	}

});
