function(resp) {
  if (resp != null && resp.data != null && (resp.data.orders != null && resp.data.orders.length > 0)) {
     return 1
  }
  return 0
}
