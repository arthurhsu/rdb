// Create a database using predefined JSON schema.
var hrSchema = {
  'name': 'hr',
  'version': 2,
  'table': [
    {
      'name': 'Dept',
      'column': [
        {'name': 'id', 'type': 'String'},
        {'name': 'name', 'type': 'String'}
      ],
      'constraint': {
        'primaryKey': [{'name': 'id'}],
        'notNull': ['name']
      }
    },
    {
      'name': 'Emp',
      'column': [
        {'name': 'id', 'type': 'Number'},
        {'name': 'name', 'type': 'String'},
        {'name': 'deptId', 'type': 'String'},
        {'name': 'title', 'type': 'String'}
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
        'unique': ['name'],
        'notNull': ['id', 'name', 'deptId']
      }
    }
  ]
};

db.create(hrSchema).commit().then(function(instance) {
  // Instance is the connected instance.
}, function(e) {
  // e is the DOMError if any, e.g. AlreadyExists.
});
