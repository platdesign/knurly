'use strict';

const path = require('path');
const browserify = require('browserify');
const watchify = require('watchify');
const uglify = require('gulp-uglify');
const buffer = require('vinyl-buffer');
const source = require('vinyl-source-stream');
const glob = require('glob');
const gutil = require('gulp-util');
const resolutions = require('browserify-resolutions');
const collapse = require('bundle-collapser/plugin');
const plainJade = require('./lib/transform-plain-jade');
const R = require('ramda');
const mergeStreams = require('merge-stream');
const ngAnnotate = require('gulp-ng-annotate');
const babelify = require('babelify');
const babelEs2015 = require('babel-preset-es2015');
const Logger = require('../logger')('JS');

module.exports = R.curry(function(gulp, config, runConfig) {

  const destDir = path.dirname(config.dest);
  const destFileName = path.basename(config.dest);

  const log = Logger(config.name);



  return mergeStreams(
    glob.sync(config.src)
    .map(function(filename) {

      filename = path.resolve(process.cwd(), filename);

      var bundler = browserify(config.browserify);

      if (runConfig.watch) {
        bundler = watchify(bundler);

        bundler.on('update', function() {
          compile();
        });
      }



      // transform jade files to plain jade
      bundler.transform({
        global: true,
        pug: config.pug || {}
      }, plainJade);



      if (config.external) {
        bundler.external(config.external);
      }

      if (config.require) {
        bundler.require(config.require);
      }


      // replace douplex modules
      bundler.plugin(resolutions, config.resolutions || ['*']);


      // transform es2015
      bundler.transform(babelify, {
        presets: [
          babelEs2015
        ]
      });


      // replace relative paths to numbers on build
      if (runConfig.build) {
        bundler.plugin(collapse);
      }



      bundler.add(filename, {
        entry: filename
      });

      return compile();



      function onCompileReady(err) {
        if (err) {
          return console.log(err.stack ? err.stack : err);
        }
        log('... ready');
      }



      function compile() {
        log('bundling ...');

        return bundler
          .bundle()
          .on('error', onCompileReady)
          .pipe(source(destFileName))
          .pipe(buffer())
          .pipe(ngAnnotate())
          .pipe(runConfig.build ? uglify(config.uglify) : gutil.noop())
          .pipe(gulp.dest(destDir))
          .on('end', onCompileReady);
      }



    })
  );


});
