let dbConnection;
function getDepartmentsWithFounders() {
    let dept = dbConnection.schema().table('Department');
    let emp = dbConnection.schema().table('Employee');
    return dbConnection
        .select(dept.name)
        .from(dept)
        .where(dept['id'].in(
            dbConnection
                .select(emp['deptId'])
                .from(emp)
                .where(emp['id'].lt(12))))
        .commit();
}
