// Create a database using predefined JSON schema.
var hrSchema = {
  'name': 'hr',
  'version': 2,
  'table': [
    {
      'name': 'Dept',
      'column': [
        {'name': 'id', 'type': 'string'},
        {'name': 'name', 'type': 'string', 'notNull': true}
      ],
      'constraint': {
        'primaryKey': 'id'
      }
    },
    {
      'name': 'Emp',
      'column': [
        {'name': 'id', 'type': 'number'},
        {'name': 'name', 'type': 'string'},
        {'name': 'deptId', 'type': 'string'},
        {'name': 'title', 'type': 'string'}
      ],
      'constraint': {
        'primaryKey': [{'name': 'id', 'order': 'desc'}],
        'foreignKey': [{
          'name': 'fk_DeptId',
          'local': 'deptId',
          'remote': 'Dept.id',
          'action': 'restrict',
          'timing': 'immediate'
        }],
        'unique': [{
          'name': 'uq_Name',
          'column': [{'name': 'name', 'order': 'desc'}]
        }],
        'notNull': ['id', 'name', 'deptId']
      },
      'index': [
        {
          'name': 'idx_Title',
          'column': [{'name': 'title', 'order': 'asc'}]
        }
      ]
    }
  ]
};

var db;
navigator.db.open('hr').then(function(connection) {
  db = connection;
  var version = db.schema().version;
  if (version == 0) {
    return db.create(hrSchema).commit();
  }
  return Promise.resolve();
}).then(function() {
  // Database created, do something here.
});
