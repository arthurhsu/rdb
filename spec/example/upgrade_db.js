let dbConnection;
let version = dbConnection.schema().version;
if (version < 2) {
  // Need DB upgrade.
  let tx = dbConnection.createTransaction('readwrite');
  let setVersion = dbConnection.setVersion(2);
  let createNewTable = dbConnection
      .createTable('NewTable')
      .column('id', 'string', true)
      .column('name', 'string', true);

  let alterTable = dbConnection
      .alterTable('Emp')
      .addColumn('location', 'string', true, 'LAX')
      .setColumn('title').set('title', true) // Change to NOT NULL
      .addIndex('idx_location', 'location');

  let dropTable = dbConnection.dropTable('Foo');

  // MUST use exec() instead of attach().
  return tx
      .exec([setVersion, createNewTable, alterTable, dropTable])
      .then(() => {
        // Schema change has finished, start work here.
      });
}
