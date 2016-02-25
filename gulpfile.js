var fs = require('fs-extra');
var gulp = require('gulp');
var gulpConnect = require('gulp-connect');
var gulpForEach = require('gulp-foreach');
var closureCompiler = require('gulp-closure-compiler');
var nopt = require('nopt');
var path = require('path');
var temp = require('temp');

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
    if (line.match(/\/\*\* @/) == null) {  // Skip Closure annotations
      if (line.match(/{{.*?}}/)) {
        expandLine(line, contents, baseDir);
      } else {
        contents.push(line);
      }
    }
  });
}

function expandLine(line, contents, baseDir) {
  try {
    var includeFile = path.resolve(path.join(
        baseDir, 
        line.match(/{{include:(.*?)}}/)[1].trim()));
    var lines = fs.readFileSync(includeFile, 'utf8').split('\n');
    copyLines(lines, contents, path.dirname(includeFile));
  } catch (e) {
    console.log('Error parsing: ', line);
  }
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

gulp.task('lint', function() {
  var ccPath = path.resolve(path.join(__dirname,
      'node_modules/google-closure-compiler/compiler.jar'));
  var ccOptions = {
    // gulp-closure-compiler does not support checks only.
    //'checks-only': true,
    'jscomp_error': [
      'accessControls',
      'ambiguousFunctionDecl',
      'checkDebuggerStatement',
      'checkRegExp',
      'checkTypes',
      'checkVars',
      'const',
      'constantProperty',
      'duplicate',
      'es5Strict',
      'externsValidation',
      'fileoverviewTags',
      'globalThis',
      'invalidCasts',
      'missingProperties',
      'missingReturn',
      'nonStandardJsDocs',
      'strictModuleDepCheck',
      'suspiciousCode',
      'undefinedNames',
      'undefinedVars',
      'unknownDefines',
      'uselessCode',
      'visibility'
    ],
    'externs': path.resolve(path.join(__dirname, 'tools/externs.js')),
    'jscomp_off': 'deprecated',
    'language_in': 'ECMASCRIPT5_STRICT',
    'warning_level': 'VERBOSE'
  };

  return gulp.src('contents/**/*.js')
             .pipe(gulpForEach(function(stream, file) {
               return stream.pipe(closureCompiler({
                 compilerPath: ccPath,
                 fileName: temp.path({'suffix': '.js'}),
                 compilerFlags: ccOptions
               }));
             }));
});
