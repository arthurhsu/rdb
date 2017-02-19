/** @type {!DatabaseConnection} */
var db;

function getOrderList() {
  /** @type {{item: !IColumn, amount: !IColumn, category: !IColumn}} */
  var order = db.schema().table('Order');

  /** @type {{item: !IColumn, amount: !IColumn, category: !IColumn}} */
  var archive = db.schema().table('ArchivedOrder');

  /** @type {!ISelectQuery} */
  var query = db.select(order.item, order.amount)
                .from(order)
                .where(order.category.eq('Clothing'))
                .union(db.select(archive.item, archive.amount)
                         .from(archive)
                         .where(archive.category.eq('Clothing')));
}
