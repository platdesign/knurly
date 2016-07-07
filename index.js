'use strict';

const ComponentTranspiler = require('./lib/component-transpiler');

module.exports = function (gulp) {


	const transpiler = new (ComponentTranspiler(gulp));

	return {
		transpiler: transpiler,
		registerDefaultTasks: function() {

			gulp.task('watch', function() {

				return transpiler.run({
					watch: true
				});

			});


			gulp.task('build', function() {

				return transpiler.run({
					build: true
				});

			});

		}
	};

};
