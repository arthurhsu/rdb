/** @type {DatabaseConnection} */
var db;
var version = db.schema().version();

if (version < 2) {
  // Need DB upgrade.
  var tx = db.createTransaction('readwrite');
  var q1 = db.setVersion(2);
  var q2 = db.createTable('NewTable')
             .column('id', 'string', true)
             .column('name', 'string', true);
  var q3 = db.alterTable('Emp')
             .addColumn('location', 'string', true, 'LAX')
             .setColumn('title').set('title', true)  // Change to NOT NULL
             .addIndex('idx_location', 'location');
  var q4 = db.dropTable('Foo');
  tx.exec([q1, q2, q3, q4]).then(function() {
    // Update data after schema has changed.
  });
}
