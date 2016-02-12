/**
 * @license
 * Copyright 2016 The Lovefield Project Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */



/** @constructor */
var Resolver = function() {
  /** @type {!Function} */
  this.resolve;

  /** @type {!Function} */
  this.reject;

  /** @type {!Promise} */
  this.promise = new Promise((function(res, rej) {
    this.resolve = res;
    this.reject = rej;
  }).bind(this));
};


/** @type {number} */
var startTime;


/** @type {IDBDatabase} */
var db = null;


/** @enum {string} */
var TABLE = {
  ACTOR: 'actor',
  DIRECTOR: 'director',
  MOVIE: 'movie',
  MOVIE_ACTOR: 'movieactor',
  MOVIE_DIRECTOR: 'moviedirector',
  MOVIE_GENRE: 'moviegenre'
};

// When the page loads.
$(function() {
  startTime = Date.now();
  main().then(function() {
    selectAllMovies();
  });
});

function openDb() {
  var resolver = new Resolver();
  db = window.openDatabase('mvdb', '1.0', 'MovieDB', 5 * 1024 * 1024);
  db.transaction(function(tx) {
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS movie(' +
      '  id INTEGER PRIMARY KEY,' +
      '  title TEXT,' +
      '  year INTEGER,' +
      '  rating TEXT,' +
      '  company TEXT);');
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS actor(' +
      '  id INTEGER PRIMARY KEY,' +
      '  lastName TEXT,' +
      '  firstName TEXT,' +
      '  sex TEXT,' +
      '  dateOfBirth INTEGER,' +
      '  dateOfDeath INTEGER);');
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS director(' +
      '  id INTEGER PRIMARY KEY,' +
      '  lastName TEXT,' +
      '  firstName TEXT,' +
      '  dateOfBirth INTEGER,' +
      '  dateOfDeath INTEGER);');
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS moviegenre(' +
      '  movieId INTEGER,' +
      '  genre STRING,' +
      '  FOREIGN KEY(movieId) REFERENCES Movie(id));');
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS moviedirector(' +
      '  movieId INTEGER,' +
      '  directorId INTEGER,' +
      '  FOREIGN KEY(movieId) REFERENCES Movie(id),' +
      '  FOREIGN KEY(directorId) REFERENCES Director(id));');
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS movieactor(' +
      '  movieId INTEGER,' +
      '  actorId INTEGER,' +
      '  role TEXT,' +
      '  FOREIGN KEY(movieId) REFERENCES Movie(id),' +
      '  FOREIGN KEY(actorId) REFERENCES Actor(id));', [], function() {
        resolver.resolve();
      }, function(e) {
        console.log('ERROR:', e);
        resolver.reject(e);
      });
  });

  return resolver.promise;
}

function main() {
  return openDb().then(function() {
    return checkForExistingData();
  }).then(function(dataExist) {
    return dataExist > 0 ? Promise.resolve() : addSampleData();
  });
}


/**
 * Adds sample data to the database.
 * @return {!IThenable}
 */
function addSampleData() {
  return Promise.all([
    insertData('actor.json', TABLE.ACTOR),
    insertData('director.json', TABLE.DIRECTOR),
    insertData('movie.json', TABLE.MOVIE),
    insertData('moviegenre.json', TABLE.MOVIE_GENRE)
  ]).then(function() {
    return Promise.all([
      insertData('movieactor.json', TABLE.MOVIE_ACTOR),
      insertData('moviedirector.json', TABLE.MOVIE_DIRECTOR),
    ]);
  });
}


/**
 * Inserts data in the database.
 * @param {string} fileName The name of the file holding JSON data.
 * @param {string} tableName The name of the table.
 * @return {!IThenable}
 */
function insertData(fileName, tableName) {
  return getSampleData(fileName).then(
      function(data) {
        var statements = data.map(function(obj) {
          var values = [];
          for (var v in obj) {
            if (v == 'id' || v == 'year' || v.indexOf('Id') != -1 ||
                v.indexOf('date') != -1) {
              values.push(obj[v] || 0);
            } else {
              values.push('"' + obj[v] + '"');
            }
          }
          var valueString = values.join(',');
          return 'INSERT OR REPLACE INTO ' + tableName + ' VALUES(' +
              valueString + ');';
        });
        var resolver = new Resolver();

        db.transaction(function(tx) {
          for (var i = 0; i < statements.length - 2; ++i) {
            console.log(statements[i]);
            tx.executeSql(statements[i]);
          }
          tx.executeSql(statements[statements.length - 1], [], function() {
            resolver.resolve();
          }, function(e) {
            resolver.reject(e);
          });
        });
        return resolver.promise;
      });
}


/**
 * Reads the sample data from a JSON file.
 * @param {string} filename The name of the JSON file to be loaded.
 * @return {!IThenable}
 */
function getSampleData(filename) {
  return /** @type {!IThenable} */ ($.getJSON('data/' + filename));
}


/**
 * @return {!IThenable.<boolean>} Whether the DB is already populated with
 * sample data.
 */
function checkForExistingData() {
  var resolver = new Resolver();
  db.transaction(function(tx) {
    tx.executeSql('SELECT COUNT(*) FROM movie;', [], function(tx2, results) {
      resolver.resolve(results.rows.item(0)['COUNT(*)']);
    }, function(tx2, e) {
      resolver.reject(e);
    });
  });
  return resolver.promise;
}


/**
 * Selects all movies.
 */
function selectAllMovies() {
  db.transaction(function(tx) {
    tx.executeSql('SELECT * FROM movie;', [], function(tx2, rawResults) {
      var results = new Array(rawResults.rows.length);
      for (var i = 0; i < results.length; ++i) {
        results[i] = rawResults.rows.item(i);
      }
      var elapsed = Date.now() - startTime;
      $('#load_time').text(elapsed.toString() + 'ms');
      $('#master').bootstrapTable('load', results).
          on('click-row.bs.table', function(e, row, $element) {
            startTime = Date.now();
            generateDetails(row.id);
          });
    });
  });
}


/**
 * Display details results for selected movie.
 * @param {string} id
 */
function generateDetails(id) {
  var resolvers = [new Resolver(), new Resolver(), new Resolver()];
  var promises = resolvers.map(function(resolver) {
    return resolver.promise;
  });

  var details = {};
  db.transaction(function(tx) {
    tx.executeSql('SELECT title, year, rating, company ' +
        'FROM movie WHERE movie.id = ' + id.toString(), [],
        function(tx2, results) {
          var row = results.rows.item(0);
          details['title'] = row['title'];
          details['year'] = row['year'];
          details['rating'] = row['rating'];
          details['company'] = row['company'];
          resolvers[0].resolve();
        }, function(tx2, e) {
          resolvers[0].reject(e);
        });
  });
  db.transaction(function(tx) {
    tx.executeSql('SELECT a.lastName, a.firstName ' +
        'FROM actor a, movieactor ma ' +
        'WHERE a.id = ma.actorId AND ma.movieId = ' + id.toString() + 
        ' ORDER BY lastName;', [],
        function(tx2, results) {
          var rows = new Array(results.rows.length);
          for (var i = 0; i < rows.length; ++i) {
            var row = results.rows.item(i);
            rows[i] = row['lastName'] + ', ' + row['firstName'];
          }
          details['actors'] = rows.join('<br/>');
          resolvers[1].resolve();
        }, function(tx2, e) {
          resolvers[1].reject(e);
        });
  });
  db.transaction(function(tx) {
    tx.executeSql('SELECT d.lastName, d.firstName ' +
        'FROM director d, moviedirector md ' +
        'WHERE d.id = md.directorId AND md.movieId = ' + id.toString() + 
        ' ORDER BY lastName;', [],
        function(tx2, results) {
          var rows = new Array(results.rows.length);
          for (var i = 0; i < rows.length; ++i) {
            var row = results.rows.item(i);
            rows[i] = row['lastName'] + ', ' + row['firstName'];
          }
          details['directors'] = rows.join('<br/>');
          resolvers[2].resolve();
        }, function(tx2, e) {
          resolvers[2].reject(e);
        });
  });
  Promise.all(promises).then(function() {
    displayDetails(details);
  });
}


/**
 * @param {!Object} details
 */
function displayDetails(details) {
  var elapsed = Date.now() - startTime;
  $('#slave p').first().text('Query time: ' + elapsed.toString() + ' ms');

  var bootstrapData = Object.keys(details).map(
      function(key) {
        return {key: key, value: details[key]};
      });
  $('#slave table').bootstrapTable('load', bootstrapData);
}
