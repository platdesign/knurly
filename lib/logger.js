'use strict';

const gutil = require('gulp-util');
const R = require('ramda');


module.exports = R.curry((bundlerName, configName, content) => {
	gutil.log(gutil.colors.yellow(`[${bundlerName} - ${configName}]`), content);
});
