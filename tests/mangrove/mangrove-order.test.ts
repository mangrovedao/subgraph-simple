import {
  assert,
  describe,
  test,
  clearStore,
  beforeEach,
  afterEach
} from "matchstick-as/assembly/index"
import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts"
import { handleOfferFail, handleOfferRetract, handleOfferSuccess, handleOfferWrite, handleOrderStart, handleSetActive } from "../../src/mangrove";
import { createOfferFailEvent, createOfferSuccessEvent, createOfferWriteEvent, createOrderStartEvent, createSetActiveEvent } from "./mangrove-utils";
import { createNewOwnedOfferEvent, createMangroveOrderStartEvent, createSetExpiryEvent } from "./mangrove-order-utils";
import { handleNewOwnedOffer, handleMangroveOrderStart, handleSetExpiry } from "../../src/mangrove-order";
import { createDummyOffer, createOffer, getEventUniqueId, getOfferId } from "../../src/helpers";
import { Stack, LimitOrder, Order } from "../../generated/schema";
import { createOfferRetractEvent } from "./mangrove-utils";

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

const token0 = Address.fromString("0x0000000000000000000000000000000000000000");
const token1 = Address.fromString("0x0000000000000000000000000000000000000001");
const maker = Address.fromString("0x0000000000000000000000000000000000000002")
const taker = Address.fromString("0x0000000000000000000000000000000000000003")
const owner = Address.fromString("0x0000000000000000000000000000000000000004")
const mgv = Address.fromString("0x0000000000000000000000000000000000000005");
const olKeyHash01 = Bytes.fromHexString(token0.toHex() + token1.toHex());
const olKeyHash10 = Bytes.fromHexString(token1.toHex() + token0.toHex());


describe("Describe entity assertions", () => {
  beforeEach(() => {
    const setActiveEvent = createSetActiveEvent(olKeyHash01, token0, token1, BigInt.fromI32(1), true);
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
      olKeyHash01,
    )

    const newOwnerOffer = createNewOwnedOfferEvent(
      olKeyHash01,
      id,
      owner,
    );
    handleNewOwnedOffer(newOwnerOffer);

    const offerId = getOfferId(olKeyHash01, id);

    assert.fieldEquals('Offer', offerId, 'owner', owner.toHex());
  });

  //TODO: would like to test negative case, where the offer does not exist. How?

  test("LimitOrder, handleMangroveOrderStart, posting resting order", () => {
    let setActiveEvent = createSetActiveEvent(olKeyHash01, token0, token1, BigInt.fromI32(1), true);
    handleSetActive(setActiveEvent);
    assert.entityCount("Market", 1);

    const id = BigInt.fromI32(1);
    createDummyOffer(
      id,
      olKeyHash01,
    )
      ;

    const tick = BigInt.fromI32(1000);
    const fillVolume = BigInt.fromI32(2000);
    const fillOrKill = false;
    const fillWants = false;
    const restingOrder = true;

    const orderStartEvent = createMangroveOrderStartEvent(
      olKeyHash01,
      taker,
      fillOrKill,
      tick,
      fillVolume,
      fillWants,
      restingOrder,
      id,
    );
    handleMangroveOrderStart(orderStartEvent);

    const limitOrderId = getEventUniqueId(orderStartEvent);

    assert.fieldEquals('LimitOrder', limitOrderId, 'isOpen', 'false');
    assert.fieldEquals('LimitOrder', limitOrderId, 'realTaker', taker.toHex());
    assert.fieldEquals('LimitOrder', limitOrderId, 'fillOrKill', 'false');
    assert.fieldEquals('LimitOrder', limitOrderId, 'restingOrder', 'true');
    assert.fieldEquals('LimitOrder', limitOrderId, 'creationDate', '1');
    assert.fieldEquals('LimitOrder', limitOrderId, 'latestUpdateDate', '1');

    assert.fieldEquals('Account', taker.toHex(), 'latestInteractionDate', orderStartEvent.block.timestamp.toI32().toString());
  });

  //TODO: would like to test negative path, where the offer does not exist. How?

  test("LimitOrder, handleMangroveOrderStart, not posting resting order", () => {
    const setActiveEvent = createSetActiveEvent(olKeyHash01, token0, token1, BigInt.fromI32(1), true);
    handleSetActive(setActiveEvent);
    assert.entityCount("Market", 1);

    const id = BigInt.fromI32(0);
    const tick = BigInt.fromI32(1000);
    const fillVolume = BigInt.fromI32(2000);
    const fillOrKill = true;
    const fillWants = true;
    const restingOrder = false;

    const mangroveOrderStartEvent = createMangroveOrderStartEvent(
      olKeyHash01,
      taker,
      fillOrKill,
      tick,
      fillVolume,
      fillWants,
      restingOrder,
      id,
    );
    handleMangroveOrderStart(mangroveOrderStartEvent);

    const limitOrderId = getEventUniqueId(mangroveOrderStartEvent);

    assert.fieldEquals('LimitOrder', limitOrderId, 'isOpen', 'false');
    assert.fieldEquals('LimitOrder', limitOrderId, 'realTaker', taker.toHex());
    assert.fieldEquals('LimitOrder', limitOrderId, 'fillOrKill', 'true');
    assert.fieldEquals('LimitOrder', limitOrderId, 'restingOrder', 'false');
    assert.fieldEquals('LimitOrder', limitOrderId, 'creationDate', '1');
    assert.fieldEquals('LimitOrder', limitOrderId, 'latestUpdateDate', '1');

    const limitOrder = LimitOrder.load(limitOrderId)!
    assert.assertTrue(limitOrder.offer === null)
  });

  test("LimitOrder, handleSetExpiry, setting expiry date", () => {
    const offerId = getOfferId(Bytes.fromHexString(token0.toHex() + token1.toHex()), BigInt.fromI32(1));
    const limitOrder = new LimitOrder(offerId)
    limitOrder.realTaker = taker;
    limitOrder.expiryDate = BigInt.fromI32(0);
    limitOrder.fillOrKill = false;
    limitOrder.restingOrder = true;
    limitOrder.offer = offerId;
    limitOrder.creationDate = BigInt.fromI32(0);
    limitOrder.latestUpdateDate = BigInt.fromI32(0);
    limitOrder.order = "order";
    limitOrder.save();

    const setExpiryEvent = createSetExpiryEvent(olKeyHash01, BigInt.fromI32(1), BigInt.fromI32(1000));
    handleSetExpiry(setExpiryEvent);

    assert.fieldEquals('LimitOrder', offerId, 'expiryDate', '1000');
    assert.fieldEquals('LimitOrder', offerId, 'latestUpdateDate', '1');
  })

  test("LimitOrder, handleMangroveOrderStart, posting resting order with success", () => {
    const setActiveEvent = createSetActiveEvent(olKeyHash01, token0, token1, BigInt.fromI32(1), true);
    handleSetActive(setActiveEvent);
    assert.entityCount("Market", 1);

    const id = BigInt.fromI32(1);
    createDummyOffer(
      id,
      olKeyHash01
    )
    const tick = BigInt.fromI32(0);
    const fillVolume = BigInt.fromI32(2000);
    const fillOrKill = false;
    const fillWants = false;
    const restingOrder = true;

    const mangroveOrderStartEvent = createMangroveOrderStartEvent(
      olKeyHash01,
      taker,
      fillOrKill,
      tick,
      fillVolume,
      fillWants,
      restingOrder,
      id,
    );
    handleMangroveOrderStart(mangroveOrderStartEvent);

    const limitOrderId = getEventUniqueId(mangroveOrderStartEvent);

    assert.fieldEquals('LimitOrder', limitOrderId, 'isOpen', 'false');
    assert.fieldEquals('LimitOrder', limitOrderId, 'realTaker', taker.toHex());
    assert.fieldEquals('LimitOrder', limitOrderId, 'fillOrKill', 'false');
    assert.fieldEquals('LimitOrder', limitOrderId, 'restingOrder', 'true');
    assert.fieldEquals('LimitOrder', limitOrderId, 'creationDate', '1');
    assert.fieldEquals('LimitOrder', limitOrderId, 'latestUpdateDate', '1');

    const orderStart =  createOrderStartEvent(
      olKeyHash01,
      taker,
      BigInt.fromI32(40),
      BigInt.fromI32(1),
      false,
    );
    handleOrderStart(orderStart);

    const offerWrite = createOfferWriteEvent(
      olKeyHash01,
      maker,
      tick,
      fillVolume,
      BigInt.fromI32(0),
      BigInt.fromI32(0),
      id,
    );
    handleOfferWrite(offerWrite);

    const newOwnedOfferEvent =  createNewOwnedOfferEvent(olKeyHash01, id, maker);
    handleNewOwnedOffer(newOwnedOfferEvent);

    const takerWants = fillVolume;
    const takerGives = fillVolume

    const offerSuccess = createOfferSuccessEvent(olKeyHash01, id, taker, takerWants, takerGives);
    handleOfferSuccess(offerSuccess);

    const offerId = getOfferId(olKeyHash01, id);
    assert.fieldEquals('LimitOrder', limitOrderId, 'isOpen', 'false');
    assert.fieldEquals('Offer', offerId, 'isFilled', 'true');
    assert.fieldEquals('Offer', offerId, 'isFailed', 'false');
    assert.fieldEquals('Offer', offerId, 'isRetracted', 'false');
  });

  test("LimitOrder, handleMangroveOrderStart, posting resting order with retract", () => {
    const setActiveEvent = createSetActiveEvent(olKeyHash01, token0, token1, BigInt.fromI32(1), true);
    handleSetActive(setActiveEvent);
    assert.entityCount("Market", 1);

    const id = BigInt.fromI32(1);
    createDummyOffer(
      id,
      olKeyHash01
    )
    const tick = BigInt.fromI32(1000);
    const fillVolume = BigInt.fromI32(2000);
    const fillOrKill = false;
    const fillWants = false;
    const restingOrder = true;


    const mangroveOrderStartEvent = createMangroveOrderStartEvent(
      olKeyHash01,
      taker,
      fillOrKill,
      tick,
      fillVolume,
      fillWants,
      restingOrder,
      id,
    );
    handleMangroveOrderStart(mangroveOrderStartEvent);

    const limitOrderId = getEventUniqueId(mangroveOrderStartEvent);

    assert.fieldEquals('LimitOrder', limitOrderId, 'isOpen', 'false');
    assert.fieldEquals('LimitOrder', limitOrderId, 'realTaker', taker.toHex());
    assert.fieldEquals('LimitOrder', limitOrderId, 'fillOrKill', 'false');
    assert.fieldEquals('LimitOrder', limitOrderId, 'restingOrder', 'true');
    assert.fieldEquals('LimitOrder', limitOrderId, 'realTaker', taker.toHex());
    assert.fieldEquals('LimitOrder', limitOrderId, 'creationDate', '1');
    assert.fieldEquals('LimitOrder', limitOrderId, 'latestUpdateDate', '1');


    const offerWrite = createOfferWriteEvent(
      olKeyHash01,
      maker,
      tick,
      fillVolume,
      BigInt.fromI32(0),
      BigInt.fromI32(0),
      id,
    );
    handleOfferWrite(offerWrite);

    const offerRetract = createOfferRetractEvent(olKeyHash01, maker, id, false);
    handleOfferRetract(offerRetract);

    assert.fieldEquals('LimitOrder', limitOrderId, 'isOpen', 'false');
    const offerId = getOfferId(olKeyHash01, id);
    assert.fieldEquals('Offer', offerId, 'isFilled', 'false');
    assert.fieldEquals('Offer', offerId, 'isFailed', 'false');
    assert.fieldEquals('Offer', offerId, 'isRetracted', 'true');
  });

  test("LimitOrder, handleMangroveOrderStart, posting resting order with fail", () => {
    const setActiveEvent = createSetActiveEvent(olKeyHash01, token0, token1, BigInt.fromI32(1), true);
    handleSetActive(setActiveEvent);
    assert.entityCount("Market", 1);

    const id = BigInt.fromI32(1);
    createDummyOffer(
      id,
      olKeyHash01
    )
    const tick = BigInt.fromI32(1000);
    const fillVolume = BigInt.fromI32(2000);
    const fillOrKill = false;
    const fillWants = false;
    const restingOrder = true;

    const mangroveOrderStartEvent = createMangroveOrderStartEvent(
      olKeyHash01,
      taker,
      fillOrKill,
      tick,
      fillVolume,
      fillWants,
      restingOrder,
      id,
    );
    handleMangroveOrderStart(mangroveOrderStartEvent);

    const limitOrderId = getEventUniqueId(mangroveOrderStartEvent);

    assert.fieldEquals('LimitOrder', limitOrderId, 'isOpen', 'false');
    assert.fieldEquals('LimitOrder', limitOrderId, 'realTaker', taker.toHex());
    assert.fieldEquals('LimitOrder', limitOrderId, 'fillOrKill', 'false');
    assert.fieldEquals('LimitOrder', limitOrderId, 'restingOrder', 'true');
    assert.fieldEquals('LimitOrder', limitOrderId, 'creationDate', '1');
    assert.fieldEquals('LimitOrder', limitOrderId, 'latestUpdateDate', '1');

    const orderStart =  createOrderStartEvent(
      olKeyHash01,
      taker,
      BigInt.fromI32(40),
      BigInt.fromI32(1),
      false,
    );
    handleOrderStart(orderStart);

    const offerWrite = createOfferWriteEvent(
      olKeyHash01,
      maker,
      tick,
      fillVolume,
      BigInt.fromI32(0),
      BigInt.fromI32(0),
      id,
    );
    handleOfferWrite(offerWrite);

    const newOwnedOfferEvent =  createNewOwnedOfferEvent(olKeyHash01, id, maker);
    handleNewOwnedOffer(newOwnedOfferEvent);

    const failedReason = Bytes.fromUTF8("Test");
    const offerFail = createOfferFailEvent(olKeyHash01, id, taker, BigInt.fromI32(10), BigInt.fromI32(10), BigInt.fromI32(10), failedReason, Bytes.fromHexString("0x00"), BigInt.fromI32(1), BigInt.fromI32(1));
    handleOfferFail(offerFail);

    assert.fieldEquals('LimitOrder', limitOrderId, 'isOpen', 'false');
    const offerId = getOfferId(olKeyHash01, id);
    assert.fieldEquals('Offer', offerId, 'isFilled', 'false');
    assert.fieldEquals('Offer', offerId, 'isFailed', 'true');
    assert.fieldEquals('Offer', offerId, 'failedReason', failedReason.toHex());
    assert.fieldEquals('Offer', offerId, 'isRetracted', 'false');
  });

  test("LimitOrder partially filled, with fail", () => {
    const setActiveEvent = createSetActiveEvent(olKeyHash01, token0, token1, BigInt.fromI32(1), true);
    handleSetActive(setActiveEvent);
    assert.entityCount("Market", 1);

    const id = BigInt.fromI32(1);
    createDummyOffer(
      id,
      olKeyHash01
    )
    const tick = BigInt.fromI32(1000);
    const fillVolume = BigInt.fromI32(2000);
    const fillOrKill = false;
    const fillWants = false;
    const restingOrder = true;

    const mangroveOrderStartEvent = createMangroveOrderStartEvent(
      olKeyHash01,
      taker,
      fillOrKill,
      tick,
      fillVolume,
      fillWants,
      restingOrder,
      id,
    );
    handleMangroveOrderStart(mangroveOrderStartEvent);

    
    
    assert.fieldEquals('Account', taker.toHex(), 'creationDate', mangroveOrderStartEvent.block.timestamp.toI32().toString());
    assert.fieldEquals('Account', taker.toHex(), 'latestInteractionDate', mangroveOrderStartEvent.block.timestamp.toI32().toString());
    
    const limitOrderId = getEventUniqueId(mangroveOrderStartEvent);
    
    assert.fieldEquals('LimitOrder', limitOrderId, 'isOpen', 'false');
    assert.fieldEquals('LimitOrder', limitOrderId, 'realTaker', taker.toHex());
    assert.fieldEquals('LimitOrder', limitOrderId, 'fillOrKill', 'false');
    assert.fieldEquals('LimitOrder', limitOrderId, 'restingOrder', 'true');
    assert.fieldEquals('LimitOrder', limitOrderId, 'creationDate', '1');
    assert.fieldEquals('LimitOrder', limitOrderId, 'latestUpdateDate', '1');

    const orderStart =  createOrderStartEvent(
      olKeyHash01,
      taker,
      BigInt.fromI32(40),
      BigInt.fromI32(1),
      false,
    );
    handleOrderStart(orderStart);

    const offerWrite = createOfferWriteEvent(
      olKeyHash01,
      maker,
      tick,
      fillVolume,
      BigInt.fromI32(0),
      BigInt.fromI32(0),
      id,
    );
    handleOfferWrite(offerWrite);

    const newOwnedOfferEvent =  createNewOwnedOfferEvent(olKeyHash01, id, maker);
    handleNewOwnedOffer(newOwnedOfferEvent);

    assert.fieldEquals('Account', maker.toHex(), 'creationDate', offerWrite.block.timestamp.toI32().toString());
    assert.fieldEquals('Account', maker.toHex(), 'latestInteractionDate', offerWrite.block.timestamp.toI32().toString());

    const offerSuccess = createOfferSuccessEvent(olKeyHash01, id, taker, fillVolume, tick);
    handleOfferSuccess(offerSuccess);

    assert.fieldEquals('LimitOrder', limitOrderId, 'isOpen', 'false');
    const offerId = getOfferId(olKeyHash01, id);
    assert.fieldEquals('Offer', offerId, 'isFilled', 'true');
    assert.fieldEquals('Offer', offerId, 'isFailed', 'false');
    assert.fieldEquals('Offer', offerId, 'isRetracted', 'false');
    assert.fieldEquals('Offer', offerId, 'limitOrder', limitOrderId);

    const offerWrite2 = createOfferWriteEvent(
      olKeyHash01,
      maker,
      tick,
      fillVolume,
      BigInt.fromI32(0),
      BigInt.fromI32(0),
      id,
    );
    offerWrite2.block.timestamp = offerWrite2.block.timestamp.plus(BigInt.fromI32(1));
    handleOfferWrite(offerWrite2);

    assert.fieldEquals('LimitOrder', limitOrderId, 'isOpen', 'true');
    assert.fieldEquals('Account', maker.toHex(), 'creationDate', offerWrite.block.timestamp.toI32().toString());
    assert.fieldEquals('Account', maker.toHex(), 'latestInteractionDate', offerWrite2.block.timestamp.toI32().toString());

  });
  //TODO: would like to test negative path, where the LimitOrder does not exist. How?
});
