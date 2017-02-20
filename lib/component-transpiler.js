'use strict';


const path = require('path');
const mergeStreams = require('merge-stream');
const R = require('ramda');
const fs = require('fs');
const gutil = require('gulp-util');


module.exports = R.curry(function(gulp) {


	const bundleJs 		= require('./bundlers/js')(gulp);
	const bundleCss 	= require('./bundlers/scss')(gulp);
	const bundleGfx 	= require('./bundlers/gfx')(gulp);
	const bundleFonts 	= require('./bundlers/fonts')(gulp);
	const bundleHtml 	= require('./bundlers/html')(gulp);


	return function ComponentTranspiler() {

		var queue = [];


		/**
		 * Add scss config to queue
		 * @param  {Object} config src,dest
		 */
		this.scss = function(config) {
			if(Array.isArray(config)) {
				return config.forEach(this.scss.bind(this));
			}
			queue.push(bundleCss(config));
		};


		/**
		 * Add js config to queue
		 * @param  {Object} config src,dest
		 */
		this.js = function(config) {
			if(Array.isArray(config)) {
				return config.forEach(this.js.bind(this));
			}
			queue.push(bundleJs(config));
		};


		/**
		 * Add gfx config to queue
		 * @param  {Object} config src,dest
		 */
		this.gfx = function(config) {
			if(Array.isArray(config)) {
				return config.forEach(this.gfx.bind(this));
			}
			queue.push(bundleGfx(config));
		};



		/**
		 * Add font(s) config to queue
		 * @param  {Object} config src,dest
		 */
		this.font = function(config) {
			if(Array.isArray(config)) {
				return config.forEach(this.fonts.bind(this));
			}
			queue.push(bundleFonts(config));
		};



		this.html = function(config) {
			if(Array.isArray(config)) {
				return config.forEach(this.fonts.bind(this));
			}
			queue.push(bundleHtml(config));
		};



		/**
		 * Run queues with runConfig
		 * @param  {Object} runConfig watch,build
		 * @return {Stream}           merged stream form all queue-streams
		 */
		this.run = function(runConfig) {

			var streams = queue.map(function(compiler) {
				return compiler(runConfig);
			});

			return mergeStreams(streams);
		};


		/**
		 * Load component config file (gulp.js) from directory
		 * @param  {String} dir path to component
		 */
		this.loadComponent = function(dir, filename) {
			var file = path.join(dir, filename || 'knurly.js');

			if(fs.statSync(dir).isDirectory()) {
				if( fs.existsSync(file) ) {
					console.log(`Loading component from: ${file}`);
					var conf = require(file);
					conf.apply(this);
				} else {
					console.log('No config file found in', dir);
				}
			}
		};

	};


});


