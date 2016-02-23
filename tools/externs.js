var rdb = {};


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


/**
 * TODO(arthurhsu): this should move to connection
 * @param {number} index
 * @return {!IBindableValue}
 */
IRelationalDatabase.prototype.bind;


/** @enum {string} */
rdb.RDBStorageType = {
  PERSISTENT: 'persistent',
  TEMPORARY: 'temporary'
};


/** @typedef {{storageType: rdb.RDBStorageType}} */
rdb.OpenDatabaseOptions;


/** @type {!IRelationalDatabase} */
Navigator.prototype.db;



/**
 * @interface
 */
function IDatabaseConnection {};


/**
 * @param {rdb.TransactionMode=} opt_mode
 * @return {!ITransaction}
 */
IDatabaseConnection.prototype.createTransaction;


/** @return {!Promise} */
IDatabaseConnection.prototype.close;



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
 *   type: (undefined|rdb.IndexedType),
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
 *   name: string
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
 * @return {!ITableChange}
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



// TODO(arthurhsu): fix ITransaction definition in spec.
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



