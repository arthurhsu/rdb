// Open database named 'hr'.
// If the named instance does not exist, create an empty database instance.
// Otherwise, open the existing database named 'hr'.
let dbConnection;
function connect() {
    let rdb = navigator['db'];
    return rdb.open('hr').then((connection) => {
        dbConnection = connection;
        // version is a read-only number that is for reference only.
        if (dbConnection.schema().version == 0) {
            // This is an empty database.
            return createDB();
        }
        else if (dbConnection.schema().version < 2) {
            // Version is smaller than expected, perform upgrades.
            return upgradeDB();
        }
        return dbConnection;
    });
}

function createDB() {
    let tx = dbConnection.createTransaction('readwrite');
    let q1 = dbConnection
        .createTable('Dept')
        .column(/* name */ 'id', /* type */ 'string', /* not null */ true)
        .column('name', 'string', true)
        .column('desc', 'string')
        .primaryKey('id');
    let q2 = dbConnection
        .createTable('Emp')
        .column('id', 'number', true)
        .column('name', 'string', true)
        .column('deptId', 'string', true)
        .column('title', 'string')
        .primaryKey('id')
        .index('idx_name', 'name', /* unique */ true)
        .index('idx_desc', { name: 'desc', order: 'desc' })
        .foreignKey({
            'name': 'fk_DeptId',
            'local': 'deptId',
            'remote': 'Dept.id',
            'action': 'restrict',
            'timing': 'immediate'
        });
    let q3 = dbConnection.setVersion(2);
    return tx.exec([q1, q2, q3]).then(() => { return dbConnection; });
}

function upgradeDB() {
    return dbConnection
        .alterTable('Dept')
        .addColumn('desc', 'string')
        .addIndex('idx_desc', { name: 'desc', order: 'desc' })
        .commit()
        .then(() => { return dbConnection; });
}

connect().then(() => {
    // Real work starts here.
});