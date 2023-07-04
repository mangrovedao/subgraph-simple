function(resp) {
  if (resp != null && resp.orders != null && (resp.orders != null && resp.orders.length > 0)) {
     return 1
  }
  return 0
}
