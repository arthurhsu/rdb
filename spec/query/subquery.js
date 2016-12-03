/** @type {!DatabaseConnection} */
var db;

function getDepartmentsWithFounders() {
  /** @type {{id: !IColumn, name: !IColumn}} */
  var dept = db.schema().table('Department');

  /** @type {{id: !IColumn, name: !IColumn, deptId: !IColumn}} */
  var emp = db.schema().table('Employee');

  return db.select(dept.name)
           .from(dept)
           .where(dept.id.in(
               db.select(emp.deptId)
                 .from(emp)
                 .where(emp.id.lt(12))))
           .commit();
}
