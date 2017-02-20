let dbConnection;
let dept = dbConnection.schema().table('Dept');
function insertData() {
    let deptData = [
        { 'id': 'HR', 'name': 'Human Resources', 'desc': 'Rock stars' },
        { 'id': 'ENG', 'name': 'Engineering', 'desc': 'Hard workers' },
        { 'id': 'NADA', 'name': 'Non existing' },
        { 'id': 'L', 'name': 'Leadership' }
    ];
    return dbConnection.insert().into(dept).values(deptData).commit();
}

function updateData() {
    return dbConnection
        .update(dept)
        .set(dept['desc'], 'Master minds')
        .where(dept['id'].eq('L'))
        .commit();
}

function deleteData() {
    return dbConnection
        .delete()
        .from(dept)
        .where(dept['id'].eq('NADA'))
        .commit();
}

function selectData() {
    return dbConnection.select().from(dept).commit();
}

insertData().then(function () {
    return updateData();
}).then(function () {
    return deleteData();
}).then(function () {
    return selectData();
}).then(function (rows) {
    // Expected returns:
    // [{'id': 'HR', 'name': 'Human Resources', 'desc': 'Rock stars'},
    //  {'id': 'ENG', 'name': 'Engineering', 'desc': 'Hard workers'},
    //  {'id': 'L', 'name': 'Leadership', 'desc': 'Master minds'}]
    console.log(rows);
});