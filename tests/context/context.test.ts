import { assert, describe, test, clearStore, beforeEach, afterEach } from "matchstick-as/assembly/index";
import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { Order } from "../../generated/schema";
import { addOrderToStack, getLatestOrderFromStack, removeLatestOrderFromStack } from "../../src/stack";
// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

const taker = Address.fromString("0x0000000000000000000000000000000000000003");

describe("Describe entity assertions", () => {
  beforeEach(() => {});

  afterEach(() => {
    clearStore();
  });

  test("Test order queue", () => {
    const order1 = new Order("order1");
    order1.transactionHash = Bytes.fromUTF8("0x0");
    order1.creationDate = BigInt.fromI32(1);
    order1.fillVolume = BigInt.fromI32(1);
    order1.fillWants = false;
    order1.maxTick = BigInt.fromI32(1);
    order1.takerGot = BigInt.fromI32(1);
    order1.takerGave = BigInt.fromI32(1);
    order1.penalty = BigInt.fromI32(1);
    order1.feePaid = BigInt.fromI32(1);
    order1.taker = taker;

    const order2 = new Order("order2");
    order2.transactionHash = Bytes.fromUTF8("0x1");
    order2.creationDate = BigInt.fromI32(2);
    order2.fillVolume = BigInt.fromI32(1);
    order2.fillWants = false;
    order2.maxTick = BigInt.fromI32(1);
    order2.takerGot = BigInt.fromI32(1);
    order2.takerGave = BigInt.fromI32(1);
    order2.penalty = BigInt.fromI32(1);
    order2.feePaid = BigInt.fromI32(1);
    order2.taker = taker;

    order1.save();
    order2.save();

    addOrderToStack(order1);
    let currentOrder = getLatestOrderFromStack(true);

    assert.assertTrue(order1.id.toString() == currentOrder.id.toString());

    addOrderToStack(order2);
    currentOrder = getLatestOrderFromStack(true);

    assert.assertTrue(currentOrder.id.toString() == order2.id.toString());

    currentOrder = getLatestOrderFromStack(true);
    removeLatestOrderFromStack();

    currentOrder = getLatestOrderFromStack(true);
    assert.assertTrue(currentOrder.id.toString() == order1.id.toString());
    removeLatestOrderFromStack;

    const lastOrder = getLatestOrderFromStack(true);
    assert.assertTrue(lastOrder.id.toString() == order1.id.toString());
  });
});
