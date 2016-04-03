/** @type {DatabaseConnection} */
var db;
var tx = db.createTransaction('readwrite');
var q1 = db.createTable('Dept')
           .column(/* column_name */ 'id',
                   /* column_type */ 'string',
                   /* not_null */ true)
           .column('name', 'string', true)
           .primaryKey([{'name': 'id'}]);
tx.append(q1);

var q2 = db.createTable('Emp')
           .column('id', 'number', true)
           .column('name', 'string', true)
           .column('deptId', 'string', true)
           .column('title', 'string')
           .primaryKey([{'name': 'id', 'order': 'asc'}])
           .unique(['name'])
           .index('idx_Desc', [{'name': 'desc', 'order': 'asc'}])
           .foreignKey({
             'name': 'fk_DeptId',
             'local': 'deptId',
             'remote': 'Dept.id',
             'action': 'restrict',
             'timing': 'immediate'
           });
q2.attachTo(tx);

tx.commit().then(function() {
  // Table created, do something here.
});
