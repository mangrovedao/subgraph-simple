function(resp) {
  if (resp != null && resp.limitOrders != null && (resp.limitOrders != null && resp.limitOrders.length > 0)) {
     return 1
  }
  return 0
}
