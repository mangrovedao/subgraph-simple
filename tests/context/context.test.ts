import {
  assert,
  describe,
  test,
  clearStore,
  beforeEach,
  afterEach
} from "matchstick-as/assembly/index"
import { Address, BigInt, Bytes, log } from "@graphprotocol/graph-ts"
import { Order } from "../../generated/schema";
import { addMarketOrderDataToStack, addOrderToStack, getLastOrder, getMarketOrderDataFromStack, getOrderFromStack, removeMarketOrderDataFromStack, removeOrderFromStack } from "../../src/helpers";
import { createMarketOrderCall } from "../mangrove/mangrove-utils";
// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

let token0 = Address.fromString("0x0000000000000000000000000000000000000000");
let token1 = Address.fromString("0x0000000000000000000000000000000000000001");

describe("Describe entity assertions", () => {
  beforeEach(() => {
  })

  afterEach(() => {
    clearStore()
  });

  test("Test order queue", () => {
    const order1 = new Order("order1");
    order1.transactionHash = Bytes.fromUTF8("0x0");
    order1.type = "LIMIT";

    const order2 = new Order("order2");
    order2.transactionHash = Bytes.fromUTF8("0x1");
    order2.type = "MARKET";

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
  });

  test("Market Order stack", () => {
    const takerWants = BigInt.fromI32(100);
    const takerGives = BigInt.fromI32(200);

    const marketOrderData = createMarketOrderCall(
      token0,
      token1,
      takerWants,
      takerGives,
    );

    addMarketOrderDataToStack(marketOrderData.inputs);

    let data = getMarketOrderDataFromStack();

    assert.booleanEquals(false, data.nodata); 

    assert.stringEquals(
      data.takerGives.toString(), 
      takerGives.toString()
    );

    assert.stringEquals(
      data.takerWants.toString(), 
      takerWants.toString()
    );

    const takerWants2 = BigInt.fromI32(150);
    const takerGives2 = BigInt.fromI32(300);

    const marketOrderData2 = createMarketOrderCall(
      token0,
      token1,
      takerWants2,
      takerGives2,
    );

    addMarketOrderDataToStack(marketOrderData2.inputs);

    data = getMarketOrderDataFromStack();

    assert.booleanEquals(false, data.nodata); 

    assert.stringEquals(
      data.takerGives.toString(), 
      takerGives2.toString()
    );

    assert.stringEquals(
      data.takerWants.toString(), 
      takerWants2.toString()
    );

    removeMarketOrderDataFromStack();

    data = getMarketOrderDataFromStack();

    assert.booleanEquals(false, data.nodata); 

    assert.stringEquals(
      data.takerGives.toString(), 
      takerGives.toString()
    );

    assert.stringEquals(
      data.takerWants.toString(), 
      takerWants.toString()
    );

    removeMarketOrderDataFromStack();

    data = getMarketOrderDataFromStack();
    assert.booleanEquals(true, data.nodata); 
  });

});
