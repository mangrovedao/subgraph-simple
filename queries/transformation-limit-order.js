function(resp) {
  if (resp != null && resp.data != null && (resp.data.limitOrders != null && resp.data.limitOrders.length > 0)) {
     return 1
  }
  return 0
}
