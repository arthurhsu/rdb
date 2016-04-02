var rdb = {};

/** @typedef {ArrayBuffer|boolean|Date|number|string|Object} */
rdb.ValueType;


/** @enum {string} */
rdb.TransactionMode = {
  READONLY: 'readonly',
  READWRITE: 'readwrite'
};



/**
 * @constructor
 */
function IRelationalDatabase() {}


/** @const {!IDatabaseFunctionProvider} */
IRelationalDatabase.prototype.fn;


/**
 * @param {string} name
 * @param {rdb.OpenDatabaseOptions=} opt_options
 * @return {!Promise<DatabaseConnection>}
 */
IRelationalDatabase.prototype.open;


/**
 * @param {string} name
 * @return {!Promise}
 */
IRelationalDatabase.prototype.drop;


/** @enum {string} */
rdb.RDBStorageType = {
  PERSISTENT: 'persistent',
  TEMPORARY: 'temporary'
};


/** @typedef {{storageType: rdb.RDBStorageType}} */
rdb.OpenDatabaseOptions;


/** @type {!IRelationalDatabase} */
Navigator.prototype.db;



/** @interface */
function IDatabaseConnection () {}


/**
 * @param {rdb.TransactionMode=} opt_mode
 * @return {!ITransaction}
 */
IDatabaseConnection.prototype.createTransaction;


/** @return {!Promise} */
IDatabaseConnection.prototype.close;


/**
 * @param {number} index
 * @return {!IBindableValue}
 */
IDatabaseConnection.prototype.bind;



/**
 * @constructor
 * @implements {IDatabaseConnection}
 * @implements {IDatabaseObserver}
 * @implements {IDatabaseSerialization}
 * @implements {IDataQueryProvider}
 * @implements {ISchemaQueryProvider}
 */
function DatabaseConnection() {}


/** @const {string} */
DatabaseConnection.prototype.name;



/** @interface */
function IDatabaseSerialization() {}


/** @return {!Promise<Object>} */
IDatabaseSerialization.prototype.export;


/**
 * @param {!Object} data
 * @return {!Promise}
 */
IDatabaseSerialization.prototype.import;



/** @interface */
function IDatabaseObserver() {}


/**
 * @param {!ISelectQuery} query
 * @param {!function(!Array<Object>)} callback
 * @return {string}
 */
IDatabaseObserver.prototype.observe;


/** @param {string} key */
IDatabaseObserver.prototype.unobserve;



/** @enum {string} */
rdb.ColumnType = {
  BLOB: 'blob',
  BOOLEAN: 'boolean',
  DATE: 'date',
  NUMBER: 'number',
  STRING: 'string',
  OBJECT: 'object'
};


/** @enum {string} */
rdb.Order = {
  ASC: 'asc',
  DESC: 'desc'
};


/**
 * @typedef {{
 *   name: string,
 *   version: number,
 *   table: !Array<!rdb.TableSpec>
 * }}
 */
rdb.Schema;


/**
 * @typedef {{
 *   name: string,
 *   column: !Array<!rdb.ColumnSpec>,
 *   constraint: (undefined|rdb.ConstraintSpec),
 *   index: (undefined|!Array<!rdb.IndexSpec>)
 * }}
 */
rdb.TableSpec;


/**
 * @typedef {{
 *   name: string,
 *   type: !rdb.ColumnType,
 *   notNull: (undefined|boolean)
 * }}
 */
rdb.ColumnSpec;


/** @typedef {string|!Array<string>|!Array<!rdb.IndexedColumnSpec>} */
rdb.IndexedColumnDefinition;


/**
 * @typedef {{
 *   name: string,
 *   column: rdb.IndexedColumnDefinition,
 *   type: (undefined|rdb.IndexType),
 *   unique: (undefined|boolean)
 * }}
 */
rdb.IndexSpec;


/** @enum {string} */
rdb.IndexType = {
  BTREE: 'btree',
  HASH: 'hash'
};


/**
 * @typedef {{
 *   name: string,
 *   order: (undefined|rdb.Order)
 * }}
 */
rdb.IndexedColumnSpec;


/** @typedef {rdb.IndexedColumnDefinition|rdb.PrimaryKeySpec} */
rdb.PrimaryKeyDefinition;


/**
 * @typedef {{
 *   primaryKey: (undefined|!rdb.PrimaryKeyDefinition),
 *   foreignKey: (undefined|!rdb.ForeignKeySpec),
 *   unique: (undefined|!rdb.UniqueSpec),
 *   notNull: (undefined|string|!Array<string>)
 * }}
 */
rdb.ConstraintSpec;


/**
 * @typedef {{
 *   name: string,
 *   column: rdb.IndexedColumnDefinition
 * }}
 */
rdb.UniqueSpec;


/**
 * @typedef {{
 *   name: string,
 *   autoIncrement: boolean
 * }}
 */
rdb.PrimaryKeySpec;


/**
 * @typedef {{
 *   name: string,
 *   local: string,
 *   remote: string,
 *   action: (undefined|rdb.ForeignKeyAction),
 *   timing: (undefined|rdb.ForeignKeyTiming)
 * }}
 */
rdb.ForeignKeySpec;


/** @enum {string} */
rdb.ForeignKeyAction = {
  RESTRICT: 'restrict',
  CASCADE: 'cascade'
};


/** @enum {string} */
rdb.ForeignKeyTiming = {
  DEFERRABLE: 'deferrable',
  IMMEDIATE: 'immediate'
};



/** @interface */
function ISchemaQueryProvider() {}


/** @return {!IExecutionContext} */
ISchemaQueryProvider.prototype.exportSchema;


/**
 * @param {!rdb.Schema} schema
 * @return {!IExecutionContext}
 */
ISchemaQueryProvider.prototype.create;


/**
 * @param {number} version
 * @return {!IExecutionContext}
 */
ISchemaQueryProvider.prototype.setVersion;


/** @return {!IDatabaseSchema} */
ISchemaQueryProvider.prototype.schema;


/** @return {!ITableBuilder} */
ISchemaQueryProvider.prototype.createTable;


/** @return {!ITableChanger} */
ISchemaQueryProvider.prototype.alterTable;



/** @constructor */
function IDatabaseSchema() {}


/** @const {string} */
IDatabaseSchema.prototype.name;


/** @const {number} */
IDatabaseSchema.prototype.version;


/**
 * @param {string} name
 * @return {!ITable}
 */
IDatabaseSchema.prototype.table;



/**
 * @constructor
 * @implements {IExecutionContext}
 */
function ITableBuilder() {}


/**
 * @param {string} name
 * @param {!rdb.ColumnType} type
 * @param {boolean=} opt_notNull
 * @return {!ITableBuilder}
 */
ITableBuilder.prototype.column;


/**
 * @param {!rdb.PrimaryKeyDefinition} pk
 * @return {!ITableBuilder}
 */
ITableBuilder.prototype.primaryKey;


/**
 * @param {!rdb.ForeignKeySpec} fk
 * @return {!ITableBuilder}
 */
ITableBuilder.prototype.foreignKey;


/**
 * @param {string} name
 * @param {!rdb.IndexedColumnDefinition} columns
 * @return {!ITableBuilder}
 */
ITableBuilder.prototype.unique;


/**
 * @param {string} name
 * @param {!rdb.IndexedColumnDefinition} columns
 * @return {!ITableBuilder}
 */
ITableBuilder.prototype.index;



/**
 * @constructor
 * @implements {IExecutionContext}
 */
function ITableChanger() {}


/**
 * @param {string} name
 * @return {!ITableChanger}
 */
ITableChanger.prototype.rename;


/**
 * @param {string} name
 * @param {!rdb.ColumnType} type
 * @param {boolean=} opt_notNull
 * @return {!ITableChanger}
 */
ITableChanger.prototype.addColumn;


/**
 * @param {string} name
 * @return {!ITableChanger}
 */
ITableChanger.prototype.dropColumn;


/**
 * @param {string} name
 * @return {!IColumnChanger}
 */
ITableChanger.prototype.setColumn;



// TODO(arthurhsu): design disable constraints, otherwise alter will fail.
// TODO(arthurhsu): this interface seems unnecessary
/** @interface */
function IColumnChanger() {}


/**
 * @param {string} newName
 * @param {!rdb.ColumnType} type
 * @param {boolean=} opt_notNull
 * @return {!ITableChanger}
 */
IColumnChanger.prototype.set;



/** @constructor */
function ITable() {}


/** @const {string} */
ITable.prototype.name;


/**
 * @param {string} alias
 * @return {!ITable}
 */
ITable.prototype.as;



/**
 * @constructor
 * @implements {IPredicate}
 */
function IColumn() {}


/** @const {string} */
IColumn.prototype.name;


/** @const {!rdb.ColumnType} */
IColumn.prototype.type;


/** @const {boolean} */
IColumn.prototype.nullable;


/**
 * @param {string} alias
 * @return {!IColumn}
 */
IColumn.prototype.as;


/** @typedef {void|!Array<!Object>} */
rdb.TransactionResults;



/** @interface */
function IExecutionContext() {}


/** @return {!Promise<rdb.TransactionResults>} */
IExecutionContext.prototype.commit;


/** @return {!Promise} */
IExecutionContext.prototype.rollback;



/**
 * @constructor
 * @implements {IExecutionContext}
 */
function ITransaction() {}


/** @return {!Promise} */
ITransaction.prototype.begin;


/**
 * @param {!IExecutionContext} query
 * @return {!Promise<rdb.TransactionResults>}
 */
ITransaction.prototype.attach;



/**
 * @constructor
 * @implements {IExecutionContext}
 */
function IQuery() {}


/** @return {!Promise<string>} */
IQuery.prototype.explain;


/**
 * @param {*} values
 * @return {!IQuery}
 */
IQuery.prototype.bind;


/** @param {!ITransaction} tx */
IQuery.prototype.attachTo;


/** @return {string} */
IQuery.prototype.toSql;



/** @constructor */
function IBindableValue() {}


/** @const {*} */
IBindableValue.prototype.value;



/** @interface */
function IDataQueryProvider() {}


/**
 * @param {...IColumn} columns
 * @return {!ISelectQuery}
 */
IDataQueryProvider.prototype.select;


/** @return {!IInsertQuery} */
IDataQueryProvider.prototype.insert;


/** @return {!IInsertQuery} */
IDataQueryProvider.prototype.insertOrReplace;


/**
 * @param {!ITable} table
 * @return {!IUpdateQuery}
 */
IDataQueryProvider.prototype.update;


/** @return {!IDeleteQuery} */
IDataQueryProvider.prototype.delete;



/**
 * @constructor
 * @extends {IQuery}
 */
function ISelectQuery() {}


/**
 * @param {...ITable} tables
 * @return {!ISelectQuery}
 */
ISelectQuery.prototype.from;


/**
 * @param {!IPredicate} searchCondition
 * @return {!ISelectQuery}
 */
ISelectQuery.prototype.where;


/**
 * @param {!ITable} table
 * @param {!IPredicate} onCondition
 * @return {!ISelectQuery}
 */
ISelectQuery.prototype.innerJoin;


/**
 * @param {!ITable} table
 * @param {!IPredicate} onCondition
 * @return {!ISelectQuery}
 */
ISelectQuery.prototype.leftOuterJoin;


/**
 * @param {number|!IBindableValue} numberOfRows
 * @return {!ISelectQuery}
 */
ISelectQuery.prototype.limit;


/**
 * @param {number|!IBindableValue} numberOfRows
 * @return {!ISelectQuery}
 */
ISelectQuery.prototype.skip;


/**
 * @param {!IColumn} column
 * @param {rdb.Order=} opt_order
 * @return {!ISelectQuery}
 */
ISelectQuery.prototype.orderBy;


/**
 * @param {...IColumn} column
 * @return {!ISelectQuery}
 */
ISelectQuery.prototype.groupBy;


/**
 * @constructor
 * @extends {IQuery}
 */
function IInsertQuery() {}


/**
 * @param {!ITable} table
 * @return {!IInsertQuery}
 */
IInsertQuery.prototype.into;


/**
 * @param {!Object|!Array<!Object>|IBindableValue|!Array<!IBindableValue>}
 *     values
 * @return {!IInsertQuery}
 */
IInsertQuery.prototype.values;



/**
 * @constructor
 * @extends {IQuery}
 */
function IUpdateQuery() {}


/**
 * @param {!IColumn} column
 * @param {rdb.ValueType} value
 * @return {!IUpdateQuery}
 */
IUpdateQuery.prototype.set;


/**
 * @param {!IPredicate} searchCondition
 * @return {!IUpdateQuery}
 */
IUpdateQuery.prototype.where;



/**
 * @constructor
 * @extends {IQuery}
 */
function IDeleteQuery() {}


/**
 * @param {!ITable} table
 * @return {!IDeleteQuery}
 */
IDeleteQuery.prototype.from;


/**
 * @param {!IPredicate} searchCondition
 * @return {!IDeleteQuery}
 */
IDeleteQuery.prototype.where;



/** @typedef {boolean|Date|number|string} */
rdb.IndexableValueType;


/** @typedef {rdb.IndexableValueType|IBindableValue} */
rdb.ComparableValueType;



/** @interface */
function IPredicate() {}


/**
 * @param {!rdb.ComparableValueType} value
 * @return {!IPredicate}
 */
IPredicate.prototype.eq;


/**
 * @param {!rdb.ComparableValueType} value
 * @return {!IPredicate}
 */
IPredicate.prototype.neq;


/**
 * @param {!rdb.ComparableValueType} value
 * @return {!IPredicate}
 */
IPredicate.prototype.lt;


/**
 * @param {!rdb.ComparableValueType} value
 * @return {!IPredicate}
 */
IPredicate.prototype.lte;


/**
 * @param {!rdb.ComparableValueType} value
 * @return {!IPredicate}
 */
IPredicate.prototype.gt;


/**
 * @param {!rdb.ComparableValueType} value
 * @return {!IPredicate}
 */
IPredicate.prototype.gte;


/**
 * @param {!IBindableValue|!RegExp} value
 * @return {!IPredicate}
 */
IPredicate.prototype.match;


/**
 * @param {!rdb.ComparableValueType} v1
 * @param {!rdb.ComparableValueType} v2
 * @return {!IPredicate}
 */
IPredicate.prototype.between;


/**
 * @param {!Array<!rdb.ComparableValueType>|!IBindableValue} values
 * @return {!IPredicate}
 */
IPredicate.prototype.in;


/** @return {!IPredicate} */
IPredicate.prototype.isNull;


/** @return {!IPredicate} */
IPredicate.prototype.isNotNull;


/**
 * @param {!IPredicate} child
 * @return {!IPredicate}
 */
IPredicate.prototype.not;


/**
 * @param {...IPredicate} children
 * @return {!IPredicate}
 */
IPredicate.prototype.and;


/**
 * @param {...IPredicate} child
 * @return {!IPredicate}
 */
IPredicate.prototype.or;



/** @interface */
function IAggregateFunction() {}


/**
 * @param {!IColumn} col
 * @return {!IColumn}
 */
IAggregateFunction.prototype.avg;


/**
 * @param {IColumn=} opt_col
 * @return {!IColumn}
 */
IAggregateFunction.prototype.count;


/**
 * @param {!IColumn} col
 * @return {!IColumn}
 */
IAggregateFunction.prototype.geomean;


/**
 * @param {!IColumn} col
 * @return {!IColumn}
 */
IAggregateFunction.prototype.max;


/**
 * @param {!IColumn} col
 * @return {!IColumn}
 */
IAggregateFunction.prototype.min;


/**
 * @param {!IColumn} col
 * @return {!IColumn}
 */
IAggregateFunction.prototype.stddev;


/**
 * @param {!IColumn} col
 * @return {!IColumn}
 */
IAggregateFunction.prototype.sum;


/**
 * @param {!IColumn} col
 * @return {!IColumn}
 */
IAggregateFunction.prototype.var;



/**
 * @interface
 * @extends {IAggregateFunction}
 */
function IDatabaseFunctionProvider() {}


// TODO(arthurhsu): check if this needs to be in its own interface.
/**
 * @param {...IColumn} col
 * @return {!IColumn}
 */
IDatabaseFunctionProvider.prototype.distinct;


///////////////////////////////////////////////////////////////////////////////
// Useless section, just to make compiler happy.
/** @override */ DatabaseConnection.prototype.alterTable;
/** @override */ DatabaseConnection.prototype.bind;
/** @override */ DatabaseConnection.prototype.close;
/** @override */ DatabaseConnection.prototype.create;
/** @override */ DatabaseConnection.prototype.createTable;
/** @override */ DatabaseConnection.prototype.createTransaction;
/** @override */ DatabaseConnection.prototype.delete;
/** @override */ DatabaseConnection.prototype.export;
/** @override */ DatabaseConnection.prototype.exportSchema;
/** @override */ DatabaseConnection.prototype.import;
/** @override */ DatabaseConnection.prototype.insert;
/** @override */ DatabaseConnection.prototype.insertOrReplace;
/** @override */ DatabaseConnection.prototype.observe;
/** @override */ DatabaseConnection.prototype.schema;
/** @override */ DatabaseConnection.prototype.select;
/** @override */ DatabaseConnection.prototype.setVersion;
/** @override */ DatabaseConnection.prototype.unobserve;
/** @override */ DatabaseConnection.prototype.update;

/** @override */ ITableBuilder.prototype.commit;
/** @override */ ITableBuilder.prototype.rollback;
/** @override */ ITableChanger.prototype.commit;
/** @override */ ITableChanger.prototype.rollback;
/** @override */ ITransaction.prototype.commit;
/** @override */ ITransaction.prototype.rollback;
/** @override */ IQuery.prototype.commit;
/** @override */ IQuery.prototype.rollback;

/** @override */ IColumn.prototype.and;
/** @override */ IColumn.prototype.between;
/** @override */ IColumn.prototype.eq;
/** @override */ IColumn.prototype.gt;
/** @override */ IColumn.prototype.gte;
/** @override */ IColumn.prototype.in;
/** @override */ IColumn.prototype.isNotNull;
/** @override */ IColumn.prototype.isNull;
/** @override */ IColumn.prototype.lt;
/** @override */ IColumn.prototype.lte;
/** @override */ IColumn.prototype.match;
/** @override */ IColumn.prototype.neq;
/** @override */ IColumn.prototype.not;
/** @override */ IColumn.prototype.or;