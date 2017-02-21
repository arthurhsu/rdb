let dbConnection;
let tx = dbConnection.createTransaction('readwrite');
let q1 = dbConnection
    .createTable('Dept')
    .column(/* name */ 'id', /* column_type */ 'string', /* not_null */ true)
    .column('name', 'string', true)
    .primaryKey('id');
let q2 = dbConnection
    .createTable('Emp')
    .column('id', 'number', true)
    .column('name', 'string', true)
    .column('deptId', 'string', true)
    .column('title', 'string')
    .primaryKey('id')
    .index('idx_Desc', { 'name': 'desc', 'order': 'desc' })
    .foreignKey('fk_DeptId', 'deptId', 'Dept.id');
tx.exec([q1, q2]).then(() => {
    // Table created, do something here.
});