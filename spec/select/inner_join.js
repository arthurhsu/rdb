/** @type {!DatabaseConnection} */
var db;

/** @type {ITable} */
var tableA;

/** @type {ITable} */
var tableB;

// Implicit inner join.
var q1 =
  db.select(tableA['key'], tableA['value'], tableB['timestamp'])
    .from(tableA, tableB)
    .where(tableA['key'].eq(tableB['key']));

// Explicit inner join.
var q2 =
  db.select(tableA['key'], tableA['value'], tableB['timestamp'])
    .from(tableA)
    .innerJoin(tableB, tableA['key'].eq(tableB['key']));
