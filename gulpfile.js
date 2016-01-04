var gulp = require('gulp');
var gulpConnect = require('gulp-connect');
var nopt = require('nopt');
var path = require('path');

gulp.task('default', function() {
  log('Usage: ');
  log('  gulp debug [--port <port number>]');
  log('      Start a debug server (default is test at port 8000)');
});


gulp.task('debug', function() {
  var knownOpts = {
    'port': [Number, null]
  };

  var options = nopt(knownOpts);
  var port = options.port || 8000;

  gulpConnect.server({
    livereload: true,
    port: port,
    root: path.resolve(__dirname)
  });
});
