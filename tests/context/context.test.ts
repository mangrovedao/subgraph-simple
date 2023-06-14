import {
  assert,
  describe,
  test,
  clearStore,
  beforeEach,
  afterEach
} from "matchstick-as/assembly/index"
import { Bytes } from "@graphprotocol/graph-ts"
import { Order } from "../../generated/schema";
import { addOrderToQueue, getOrderFromQueue, removeOrderFromQueue } from "../../src/helpers";
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
    const order2 = new Order("order2");
    order2.transactionHash = Bytes.fromUTF8("0x1");

    order1.save();
    order2.save();

    addOrderToQueue(order1);
    let currentOrder = getOrderFromQueue();

    assert.assertTrue(order1.id.toString() == currentOrder.id.toString());

    addOrderToQueue(order2);
    currentOrder = getOrderFromQueue();

    assert.assertTrue(currentOrder.id.toString() == order2.id.toString());

    currentOrder = getOrderFromQueue();
    removeOrderFromQueue();

    currentOrder = getOrderFromQueue();
    assert.assertTrue(currentOrder.id.toString() == order1.id.toString());
    removeOrderFromQueue();
  });


});
