let dbConnection;
let tableA = dbConnection.schema().table('A');
let tableB = dbConnection.schema().table('B');
// Implicit inner join.
let q1 = dbConnection
    .select(tableA['key'], tableA['value'], tableB['timestamp'])
    .from(tableA, tableB)
    .where(tableA['key'].eq(tableB['key']));
// Explicit inner join.
let q2 = dbConnection
    .select(tableA['key'], tableA['value'], tableB['timestamp'])
    .from(tableA)
    .innerJoin(tableB, tableA['key'].eq(tableB['key']));