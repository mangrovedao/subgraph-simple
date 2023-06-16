import {
  assert,
  describe,
  test,
  clearStore,
  beforeEach,
  afterEach
} from "matchstick-as/assembly/index"
import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts"
import { handleOfferWrite, handleOrderComplete, handleOrderStart, handleSetActive, handleSetGasbase } from "../../src/mangrove";
import { createOfferWriteEvent, createOrderCompleteEvent, createOrderStartEvent, createSetActiveEvent, createSetGasbaseEvent } from "./mangrove-utils";
import { createNewOwnedOfferEvent, createOrderSummaryEvent, createSetExpiryEvent } from "./mangrove-order-utils";
import { handleNewOwnedOffer, handleOrderSummary, handleSetExpiry } from "../../src/mangrove-order";
import { createDummyOffer, createOffer, getEventUniqueId, getOfferId } from "../../src/helpers";
import { Context, LimitOrder, Offer, Order } from "../../generated/schema";

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

const token0 = Address.fromString("0x0000000000000000000000000000000000000000");
const token1 = Address.fromString("0x0000000000000000000000000000000000000001");
const maker = Address.fromString("0x0000000000000000000000000000000000000002")
const taker = Address.fromString("0x0000000000000000000000000000000000000003")
const owner = Address.fromString("0x0000000000000000000000000000000000000004")
const mgv = Address.fromString("0x0000000000000000000000000000000000000005");

describe("Describe entity assertions", () => {
  beforeEach(() => {
    const setActiveEvent = createSetActiveEvent(token0, token1, true);
    handleSetActive(setActiveEvent);
    assert.entityCount("Market", 1);
  })

  afterEach(() => {
    clearStore()
  });

  test("Offer, handleNewOwnedOffer, offer exists", () => {
    const id = BigInt.fromI32(1);
    createDummyOffer(
      id,
      token1,
      token0,
    )

    const newOwnerOffer = createNewOwnedOfferEvent(
      mgv,
      token0,
      token1,
      id,
      owner,
    );
    handleNewOwnedOffer(newOwnerOffer);

    const offerId = getOfferId(token0, token1, id);

    assert.fieldEquals('Offer', offerId, 'owner', owner.toHex());
  });

  //TODO: would like to test negative case, where the offer does not exist. How?

  test("LimitOrder, handleOrderSummary, posting resting order", () => {
    let setActiveEvent = createSetActiveEvent(token0, token1, true);
    handleSetActive(setActiveEvent);
    assert.entityCount("Market", 1);
    
    const id = BigInt.fromI32(1);
    createDummyOffer(
      id,
      token1,
      token0,
    )
    const orderId ="orderId"
    const order = new Order(orderId);
    order.transactionHash = Bytes.fromUTF8("0x0");
    order.save();
    
    const context = new Context('context')
    context.ids = ""
    context.last = order.id;
    context.save();
    
    const takerWants = BigInt.fromI32(1000); 
    const takerGave = BigInt.fromI32(500);
    const takerGives = BigInt.fromI32(2000);
    const takerGot = BigInt.fromI32(1000);
    const expiryDate = BigInt.fromI32(1686754719);

    const orderSummaryEvent = createOrderSummaryEvent(
      mgv,
      token1,
      token0,
      taker,
      false,
      takerWants, // takerWants,
      takerGives, // takerGives
      false,
      true, 
      expiryDate,
      takerGot, // takerGot
      takerGave, // takerGave
      BigInt.fromI32(0),
      BigInt.fromI32(0),
      id,
    );
    handleOrderSummary(orderSummaryEvent);

    const offerId = getOfferId(token0, token1, id);
    assert.fieldEquals('Order', orderId, 'limitOrder', offerId);
    assert.fieldEquals('LimitOrder', offerId, 'wants', takerWants.toString());
    assert.fieldEquals('LimitOrder', offerId, 'gives', takerGives.toString());
    assert.fieldEquals('LimitOrder', offerId, 'realTaker', taker.toHex());
    assert.fieldEquals('LimitOrder', offerId, 'expiryDate', expiryDate.toI32().toString());
    assert.fieldEquals('LimitOrder', offerId, 'fillOrKill', 'false');
    assert.fieldEquals('LimitOrder', offerId, 'fillWants', 'false');
    assert.fieldEquals('LimitOrder', offerId, 'restingOrder', 'true');
    assert.fieldEquals('LimitOrder', offerId, 'offer', offerId);
    assert.fieldEquals('LimitOrder', offerId, 'realTaker', taker.toHex());

  });

  //TODO: would like to test negative path, where the offer does not exist. How?

  test("LimitOrder, handleOrderSummary, not posting resting order", () => {
    let setActiveEvent = createSetActiveEvent(token0, token1, true);
    handleSetActive(setActiveEvent);
    assert.entityCount("Market", 1);
    
    const id = BigInt.fromI32(0);

    const orderId ="orderId"
    const order = new Order(orderId);
    order.transactionHash = Bytes.fromUTF8("0x0");
    order.save();
    
    const context = new Context('context')
    context.ids = ""
    context.last = order.id;
    context.save();
    
    const takerWants = BigInt.fromI32(1000); 
    const takerGave = BigInt.fromI32(500);
    const takerGives = BigInt.fromI32(2000);
    const takerGot = BigInt.fromI32(1000);
    const expiryDate = BigInt.fromI32(0);

    const orderSummaryEvent = createOrderSummaryEvent(
      mgv,
      token1,
      token0,
      taker,
      true,
      takerWants, // takerWants,
      takerGives, // takerGives
      true,
      false, 
      expiryDate,
      takerGot, // takerGot
      takerGave, // takerGave
      BigInt.fromI32(0),
      BigInt.fromI32(0),
      id,
    );
    handleOrderSummary(orderSummaryEvent);
    
    const limitOrderId = getEventUniqueId(orderSummaryEvent);
    const offerId = getOfferId(token0, token1, id);
    assert.fieldEquals('Order', orderId, 'limitOrder', limitOrderId);
    assert.fieldEquals('LimitOrder', limitOrderId, 'wants', takerWants.toString());
    assert.fieldEquals('LimitOrder', limitOrderId, 'gives', takerGives.toString());
    assert.fieldEquals('LimitOrder', limitOrderId, 'realTaker', taker.toHex());
    assert.fieldEquals('LimitOrder', limitOrderId, 'expiryDate', expiryDate.toI32().toString());
    assert.fieldEquals('LimitOrder', limitOrderId, 'fillOrKill', 'true');
    assert.fieldEquals('LimitOrder', limitOrderId, 'fillWants', 'true');
    assert.fieldEquals('LimitOrder', limitOrderId, 'restingOrder', 'false');
    assert.fieldEquals('LimitOrder', limitOrderId, 'realTaker', taker.toHex());
    const limitOrder = LimitOrder.load(limitOrderId)!
    assert.assertTrue(limitOrder.offer === null)
  });

  

  test("LimitOrder, handleSetExpiry, setting expiry date", () => {
    const offerId = getOfferId(token0, token1, BigInt.fromI32(1));
    const limitOrder = new LimitOrder(offerId)
    limitOrder.wants = BigInt.fromI32(1000);
    limitOrder.gives = BigInt.fromI32(500);
    limitOrder.realTaker = taker;
    limitOrder.expiryDate = BigInt.fromI32(0);
    limitOrder.fillOrKill = false;
    limitOrder.fillWants = false;
    limitOrder.restingOrder = true;
    limitOrder.offer = offerId;
    limitOrder.save();

    const setExpiryEvent = createSetExpiryEvent(token0, token1, BigInt.fromI32(1), BigInt.fromI32(1000));
    handleSetExpiry(setExpiryEvent);

    assert.fieldEquals('LimitOrder', offerId, 'expiryDate', '1000');

  })

  //TODO: would like to test negative path, where the LimitOrder does not exist. How?

});
