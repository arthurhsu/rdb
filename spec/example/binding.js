let dbConnection;
let query;
function init() {
    let dept = dbConnection.schema().table('Dept');
    let emp = dbConnection.schema().table('Employee');
    query = dbConnection
        .select(emp['name'].as('ename'), dept['name'])
        .from(dept, emp)
        .where(dept['id'].eq(emp['id']).and(emp['id'].eq(dbConnection.bind(0))));
}

function updateModel(employeeId) {
    query.bind(employeeId).commit().then(rows => {
        console.log(rows[0]['ename'], rows[0]['Department.name']);
    });
}
