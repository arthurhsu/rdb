let dbConnection;
let version = dbConnection.schema().version;
if (version < 2) {
    // Need DB upgrade.
    let tx = dbConnection.createTransaction('readwrite');
    // BEGIN TRANSACTION equivalent in RDB.
    tx.begin().then(() => {
        return tx.attach(dbConnection.setVersion(2));
    }).then(() => {
        let q = dbConnection
            .createTable('NewTable')
            .column('id', 'string', true)
            .column('name', 'string', true);
        return tx.attach(q);
    }).then(() => {
        let q = dbConnection
            .alterTable('Emp')
            .addColumn('location', 'string', true, 'LAX')
            .setColumn('title').set('title', true) // Change to NOT NULL
            .addIndex('idx_location', 'location');
        return tx.attach(q);
    }).then(() => {
        return tx.attach(dbConnection.dropTable('Foo'));
    }).then(() => {
        // COMMIT current transaction.
        return tx.commit();
    }).then(() => {
        // Schema change has finished, start work here.
    });
}
