// Open database named 'hr'.
// If the named instance does not exist, create an empty database instance.
// Otherwise, open the existing database named 'hr'.
var db;

function connect() {
  return navigator.db.open('hr').then(function(instance) {
    db = instance;

    // version is a read-only number that is for reference only.
    if (db.version == 0) {
      // This is an empty database.
      return setUpNewDb();
    } else if (db.version < 2) {
      // Version is smaller than expected, perform upgrades.
      return upgradeDb();
    }
  });
}

function setUpNewDb() {
  var tx = db.createTransaction('readwrite');
  var q1 = db.createTable('Dept')
             .column(/* column_name */ 'id',
                     /* column_type */ 'String',
                     /* not_null */ true)
             .column('name', 'String', true)
             .column('desc', 'String')
             .primaryKey([{'name': 'id'}]);

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
  var q3 = db.setVersion(2);

  tx.append([q1, q2, q3]);
  return tx.commit();
}

function upgradeDb() {
  return db.alterTable('Dept').addColumn('desc', 'String').commit();
}

connect().then(function() {
  // Real work starts here.
});
