var through = require('through');
var jade = require('pug');

module.exports = function(file, options) {

  if (!/\.pug|\.jade$/i.test(file)) {
    return through();
  }

  var data = '';

  function write(buf) {
    data += buf;
  }

  function end() {
    var that = this;

    options.filename = file;

    var result;

    try {
      result = jade.compileClientWithDependenciesTracked(data, {filename:file});
    } catch(e) {
      that.emit('error', e);
      return;
    }

    result.dependencies.forEach(function(dep) {
      that.emit('file', dep);
    });

    var content = result.body + ';;\n';
    content += 'module.exports = template();';

    that.queue(content);
    that.queue(null);

  }

  return through(write, end);
};
