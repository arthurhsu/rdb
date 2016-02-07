var fs = require('fs-extra');
var gulp = require('gulp');
var gulpConnect = require('gulp-connect');
var nopt = require('nopt');
var path = require('path');

gulp.task('default', function() {
  log('Usage: ');
  log('  gulp debug [--port <port number>]');
  log('      Start a debug server (default is test at port 8000)');
});

function getOutputPath() {
  return path.resolve(path.join(__dirname, 'out'));
}

function copyLines(lines, contents, baseDir) {
  lines.forEach(function(line) {
    if (line.match(/{{.*?}}/)) {
      expandLine(line, contents, baseDir);
    } else {
      contents.push(line);
    }
  });
}

function expandLine(line, contents, baseDir) {
  var includeFile = path.resolve(path.join(
        baseDir, 
        line.match(/{{include:(.*?)}}/)[1].trim()));
  var lines = fs.readFileSync(includeFile, 'utf8').split('\n');
  copyLines(lines, contents, path.dirname(includeFile));
}

function generateIndex() {
  console.log('Regenerating index.html ...');
  fs.ensureDirSync(getOutputPath());
  var lines = fs.readFileSync(path.resolve(
        path.join(__dirname, 'contents/main.html')), 'utf8').split('\n');
  var contents = [];
  copyLines(lines, contents, path.resolve(path.join(__dirname, 'contents')));
  fs.writeFileSync(
      path.resolve(path.join(__dirname, 'out/index.html')),
      contents.join('\n'),
      'utf8');
}

gulp.task('watch', function() {
  gulp.watch('contents/**/*').on('change', generateIndex);
});

gulp.task('debug', ['watch'], function() {
  var knownOpts = {
    'port': [Number, null]
  };

  var options = nopt(knownOpts);
  var port = options.port || 8000;

  generateIndex();
  gulpConnect.server({
    livereload: true,
    port: port,
    root: getOutputPath()
  });
});
