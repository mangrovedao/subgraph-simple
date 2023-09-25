import {
  assert,
  describe,
  test,
  clearStore,
  beforeEach,
  afterEach
} from "matchstick-as/assembly/index"
import { BigInt, Bytes } from "@graphprotocol/graph-ts"
import { Order } from "../../generated/schema";
import { addOrderToStack, currentOrderIsSnipe, getLastOrder, getOrderFromStack, getOrderStack, removeOrderFromStack } from "../../src/helpers";
// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeEach(() => {
  })

  afterEach(() => {
    clearStore()
  });

  test("Test order queue", () => {
    const order1 = new Order("order1");
    order1.transactionHash = Bytes.fromUTF8("0x0");
    order1.creationDate = BigInt.fromI32(1);

    const order2 = new Order("order2");
    order2.transactionHash = Bytes.fromUTF8("0x1");
    order2.creationDate = BigInt.fromI32(2);

    order1.save();
    order2.save();

    addOrderToStack(order1);
    let currentOrder = getOrderFromStack();

    assert.assertTrue(order1.id.toString() == currentOrder.id.toString());

    addOrderToStack(order2);
    currentOrder = getOrderFromStack();

    assert.assertTrue(currentOrder.id.toString() == order2.id.toString());

    currentOrder = getOrderFromStack();
    removeOrderFromStack();

    currentOrder = getOrderFromStack();
    assert.assertTrue(currentOrder.id.toString() == order1.id.toString());
    removeOrderFromStack();

    const lastOrder = getLastOrder();
    assert.assertTrue(lastOrder.id.toString() == order1.id.toString());

    const orderStack = getOrderStack();
    orderStack.nextIsSnipe = true;
    orderStack.save();

    const order3 = new Order("order3");
    order3.transactionHash = Bytes.fromUTF8("0x2");
    order3.creationDate = BigInt.fromI32(3);
    addOrderToStack(order3);

    assert.assertTrue(currentOrderIsSnipe());
  });


});
