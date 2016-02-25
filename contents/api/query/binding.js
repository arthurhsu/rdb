/** @type {!DatabaseConnection} */
var db;

/** @type {!ISelectQuery} */
var query;

function init() {
  /** @type {{id: !IColumn, name: !IColumn}} */
  var dept = db.schema().table('Department');

  /** @type {{id: !IColumn, name: !IColumn, deptId: !IColumn}} */
  var emp = db.schema().table('Employee');
  query = db.select(emp.name.as('ename'), dept.name)
            .from(dept, emp)
            .where(dept.id.eq(emp.deptId).and(
                   emp.id.eq(db.bind(0))));
}

function updateModel(employeeId) {
  query.bind(employeeId).commit().then(function(rows) {
    console.log(rows[0]['ename'], rows[0]['Department.name']);
  });
}
