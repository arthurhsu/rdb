/** @type {DatabaseConnection} */
var db;
var d = db.schema().table('Dept');

function insertData() {
  var deptData = [
    {'id': 'HR', 'name': 'Human Resources', 'desc': 'Rock stars'},
    {'id': 'ENG', 'name': 'Engineering', 'desc': 'Hard workers'},
    {'id': 'NADA', 'name': 'Non existing'},
    {'id': 'L', 'name': 'Leadership'}
  ];
  return db.insert().into(d).values(deptData).commit();
}

function updateData() {
  return db.update(d).set(d.desc, 'Master minds').where(d.id.eq('L')).commit();
}

function deleteData() {
  return db.delete().from(d).where(d.id.eq('NADA')).commit();
}

function selectData() {
  return db.select().from(d).commit();
}

insertData().then(function() {
  return updateData();
}).then(function() {
  return deleteData();
}).then(function() {
  return selectData();
}).then(function(rows) {
  // Expected returns:
  // [{'id': 'HR', 'name': 'Human Resources', 'desc': 'Rock stars'},
  //  {'id': 'ENG', 'name': 'Engineering', 'desc': 'Hard workers'},
  //  {'id': 'L', 'name': 'Leadership', 'desc': 'Master minds'}]
  console.log(rows);
});
