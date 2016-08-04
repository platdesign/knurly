'use strict';

const through = require('through');
const pug = require('pug');

module.exports = function(file, options) {

  if (!/\.pug|\.jade$/i.test(file)) {
    return through();
  }

  let config = options.pug;
  config.compileDebug = false;

  let data = '';

  function write(buf) {
    data += buf;
  }

  function End() {
    let result;
    config.filename = file;


    try {
      result = pug.compileClientWithDependenciesTracked(data, config);
    } catch(e) {
      this.emit('error', e);
      return;
    }

    result.dependencies.forEach((dep) => this.emit('file', dep));

    let render = new Function([], result.body + ';;\nreturn template();');
    let content = 'module.exports = decodeURIComponent("' + encodeURIComponent(render()) + '");';

    this.queue(content);
    this.queue(null);

  }

  return through(write, End);
};
