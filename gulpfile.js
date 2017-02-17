const fs = require('fs-extra');
const gulp = require('gulp');
const gulpConnect = require('gulp-connect');
const dom = require('jsdom');
const nopt = require('nopt');
const path = require('path');
const webidl2 = require('webidl2');

const log = console.log;

gulp.task('default', () => {
  log('Usage: ');
  log('  gulp debug [--port <port number>]');
  log('      Start a debug server (default is test at port 8000)');
  log('  gulp lint');
  log('      Check WebIDL is sane');
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
    let includeFile = path.resolve(path.join(
        baseDir,
        line.match(/{{include:(.*?)}}/)[1].trim()));
    let lines = fs.readFileSync(includeFile, 'utf8').split('\n');
    copyLines(lines, contents, path.dirname(includeFile));
  } catch (e) {
    console.log('Error parsing: ', line);
  }
}

function generateIndex() {
  console.log('Regenerating index.html ...');
  fs.ensureDirSync(getOutputPath());
  let lines = fs.readFileSync(path.resolve(
        path.join(__dirname, 'spec/main.html')), 'utf8').split('\n');
  let contents = [];
  copyLines(lines, contents, path.resolve(path.join(__dirname, 'spec')));
  fs.writeFileSync(
      path.resolve(path.join(__dirname, 'out/index.html')),
      contents.join('\n'),
      'utf8');
  fs.copySync(
      path.resolve(path.join(__dirname, 'spec/style.css')),
      path.resolve(path.join(__dirname, 'out/style.css')));
}

gulp.task('watch', () => {
  gulp.watch('spec/**/*').on('change', generateIndex);
});

gulp.task('debug', ['watch'], () => {
  let knownOpts = {
    'port': [Number, null]
  };

  let options = nopt(knownOpts);
  let port = options.port || 8000;

  generateIndex();
  gulpConnect.server({
    livereload: true,
    port: port,
    root: getOutputPath()
  });
});

gulp.task('idl', (cb) => {
  generateIndex();
  dom.env('./out/index.html', (errors, window) => {
    let elements = window.document.getElementsByClassName('idl');
    let idl = Array.from(elements).map(e => {
      let lines = e.innerHTML.split('\n');
      let spaces = lines[0].search(/\S|$/);
      for (let i = 0; i < lines.length; ++i) {
        lines[i] = lines[i].substring(spaces)
                           .replace('&lt; ', '<')
                           .replace(' &gt;', '>');
      }
      return lines.join('\n');
    }).join('\n\n');
    fs.writeFileSync('./out/rdb.idl', idl, {encoding: 'utf8'});
    cb();
  });
});

gulp.task('lint', ['idl'], () => {
  let idl = fs.readFileSync('./out/rdb.idl', {encoding: 'utf8'});
  try {
    let tree = webidl2.parse(idl);
  } catch(e) {
    console.error('ERROR:', e);
  }

  log('OK: IDL validated');
});
