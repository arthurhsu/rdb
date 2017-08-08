let dbConnection;
function getOrderList() {
  let order = dbConnection.schema().table('Order');
  let archive = dbConnection.schema().table('ArchivedOrder');
  return dbConnection
      .select(order.item, order.amount)
      .from(order)
      .where(order.category.eq('Clothing'))
      .union(dbConnection
          .select(archive.item, archive.amount)
          .from(archive)
          .where(archive.category.eq('Clothing')))
      .commit();
}
