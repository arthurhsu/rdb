var tx = db.createTransaction('readwrite');
var q1 = db.createTable('Dept')
           .column(/* column_name */ 'id',
                   /* column_type */ 'String',
                   /* not_null */ true)
           .column('name', 'String', true)
           .primaryKey([{'name': 'id'}]);
tx.append(q1);

var q2 = db.createTable('Emp')
           .column('id', 'Number', true)
           .column('name', 'String', true)
           .column('deptId', 'String', true)
           .column('title', 'String')
           .primaryKey([{name: 'id', order: 'asc'}])
           .unique(['name'])
           .index('idx_Desc', [{name: 'desc', order: 'asc'}])
           .foreignKey({
             'name': 'fk_DeptId',
             'local': 'deptId',
             'remote': 'Dept.id',
             'action': 'restrict',
             'timing': 'immediate'
           });
q2.attachTo(tx);

tx.commit().then(...);
