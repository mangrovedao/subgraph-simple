import { assert, describe, test, clearStore, beforeEach, afterEach, newMockCall, newMockEvent } from "matchstick-as/assembly/index";
import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { handleOfferWrite, handleSetActive } from "../../src/mangrove";
import { createOfferWriteEvent, createSetActiveEvent, createSetRouteLogicEvent } from "./mangrove-utils";
import { createNewOwnedOfferEvent, createMangroveOrderStartEvent, createSetRenegingEvent, createMangroveOrderCompleteEvent } from "./mangrove-order-utils";
import { handleNewOwnedOffer, handleMangroveOrderStart, handleSetReneging, limitOrderSetIsOpen, handleMangroveOrderComplete } from "../../src/mangrove-order";
import { createDummyOffer } from "../../src/helpers";
import { getEventUniqueId, getOfferId } from "../../src/helpers/ids";
import { LimitOrder, Offer } from "../../generated/schema";
import { getLatestLimitOrderFromStack } from "../../src/stack";
import { prepareERC20, mockOfferList } from "./helpers";
import { handleSetRouteLogic } from "../../src/smart-router-proxy";
import { saveLimitOrder, saveOffer } from "../../src/helpers/save";

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

const token0 = Address.fromString("0x4300000000000000000000000000000000000003");
const token1 = Address.fromString("0x4300000000000000000000000000000000000004");
prepareERC20(token0, "token0", "tkn0", 18);
prepareERC20(token1, "token1", "tkn1", 6);

mockOfferList(Address.fromString("0x26fD9643Baf1f8A44b752B28f0D90AEBd04AB3F8"));

const maker = Address.fromString("0x0000000000000000000000000000000000000002");
const taker = Address.fromString("0x0000000000000000000000000000000000000003");
const owner = Address.fromString("0x0000000000000000000000000000000000000004");
const mgv = Address.fromString("0x0000000000000000000000000000000000000005");
const olKeyHash01 = Bytes.fromHexString("0x" + token0.toHex().slice(2) + token1.toHex().slice(2));
const olKeyHash10 = Bytes.fromHexString("0x" + token1.toHex().slice(2) + token0.toHex().slice(2));

const inboundLogic = Address.fromString("0x0000000000000000000000000000000000000006");
const outboundLogic = Address.fromString("0x0000000000000000000000000000000000000007");

describe("Describe entity assertions", () => {
  beforeEach(() => {
    const setActiveEvent = createSetActiveEvent(olKeyHash01, token0, token1, BigInt.fromI32(1), true);
    handleSetActive(setActiveEvent);
    assert.entityCount("Market", 1);
  });

  afterEach(() => {
    clearStore();
  });

  test("LimitOrder, limitOrderSetIsOpen, id is null", () => {
    limitOrderSetIsOpen(null, true, newMockEvent().block); // should not throw
  });

  test("LimitOrder, limitOrderSetIsOpen, id is not null, id does not exist", () => {
    limitOrderSetIsOpen("LimitOrder1", true, newMockEvent().block); // should not throw
  });

  test("LimitOrder, limitOrderSetIsOpen, id is not null, id exists", () => {
    const limitOrder = new LimitOrder("limitOrder");
    limitOrder.isOpen = false;
    limitOrder.creationDate = BigInt.fromI32(0);
    limitOrder.latestUpdateDate = BigInt.fromI32(0);
    limitOrder.orderType = 0;
    limitOrder.tick = BigInt.fromI32(0);
    limitOrder.fillVolume = BigInt.fromI32(0);
    limitOrder.fillWants = false;
    limitOrder.fillWants = false;
    limitOrder.order = "";
    limitOrder.realTaker = taker;
    limitOrder.inboundRoute = Address.zero();
    limitOrder.outboundRoute = Address.zero();
    saveLimitOrder(limitOrder, newMockEvent().block);

    limitOrderSetIsOpen("limitOrder", true, newMockEvent().block);

    assert.fieldEquals("LimitOrder", "limitOrder", "isOpen", "true");
  });

  test("Offer, handleNewOwnedOffer, offer exists", () => {
    const id = BigInt.fromI32(1);
    const offer = createDummyOffer(id, olKeyHash01, newMockEvent().block);

    const orderStartEvent = createMangroveOrderStartEvent(
      olKeyHash01,
      taker,
      BigInt.fromI32(0),
      BigInt.fromI32(0),
      false,
      id,
      BigInt.fromI32(0),
      inboundLogic,
      outboundLogic
    );
    handleMangroveOrderStart(orderStartEvent);

    const newOwnerOffer = createNewOwnedOfferEvent(olKeyHash01, id, owner);
    handleNewOwnedOffer(newOwnerOffer);

    const offerId = getOfferId(olKeyHash01, id);
    const limitOrderId = getEventUniqueId(orderStartEvent);

    assert.fieldEquals("Offer", offerId, "realMaker", owner.toHex());
    assert.fieldEquals("Offer", offerId, "limitOrder", limitOrderId);
    assert.fieldEquals("LimitOrder", limitOrderId, "offer", offer.id);
    assert.fieldEquals("LimitOrder", limitOrderId, "isOpen", "true");
  });

  //TODO: would like to test negative case, where the offer does not exist. And where limit order does not exists How?

  test("LimitOrder, handleMangroveOrderStart, posting resting order", () => {
    let setActiveEvent = createSetActiveEvent(olKeyHash01, token0, token1, BigInt.fromI32(1), true);
    handleSetActive(setActiveEvent);
    assert.entityCount("Market", 1);

    const id = BigInt.fromI32(1);
    createDummyOffer(id, olKeyHash01, newMockEvent().block);

    const tick = BigInt.fromI32(1000);
    const fillVolume = BigInt.fromI32(2000);
    const fillWants = false;
    const orderType = BigInt.fromI32(0);
    const takerGivesLogic = Address.zero();
    const takerWantsLogic = Address.zero();

    const orderStartEvent = createMangroveOrderStartEvent(olKeyHash01, taker, tick, fillVolume, fillWants, id, orderType, takerGivesLogic, takerWantsLogic);
    handleMangroveOrderStart(orderStartEvent);

    const limitOrderId = getEventUniqueId(orderStartEvent);

    assert.fieldEquals("LimitOrder", limitOrderId, "isOpen", "false");
    assert.fieldEquals("LimitOrder", limitOrderId, "realTaker", taker.toHex());
    assert.fieldEquals("LimitOrder", limitOrderId, "orderType", "0");
    assert.fieldEquals("LimitOrder", limitOrderId, "creationDate", "1");
    assert.fieldEquals("LimitOrder", limitOrderId, "latestUpdateDate", "1");
    assert.fieldEquals("LimitOrder", limitOrderId, "tick", "1000");
    assert.fieldEquals("LimitOrder", limitOrderId, "fillVolume", "2000");
    assert.fieldEquals("LimitOrder", limitOrderId, "fillWants", "false");
    assert.fieldEquals("LimitOrder", limitOrderId, "inboundRoute", takerGivesLogic.toHex());
    assert.fieldEquals("LimitOrder", limitOrderId, "outboundRoute", takerWantsLogic.toHex());

    assert.fieldEquals("Account", taker.toHex(), "latestUpdateDate", orderStartEvent.block.timestamp.toI32().toString());
  });

  test("LimitOrder, handleMangroveOrderComplete", () => {
    let setActiveEvent = createSetActiveEvent(olKeyHash01, token0, token1, BigInt.fromI32(1), true);
    handleSetActive(setActiveEvent);
    assert.entityCount("Market", 1);

    const tick = BigInt.fromI32(1000);
    const fillVolume = BigInt.fromI32(2000);
    const fillWants = false;
    const orderType = BigInt.fromI32(0);
    const takerGivesLogic = Address.zero();
    const takerWantsLogic = Address.zero();

    const orderStartEvent = createMangroveOrderStartEvent(
      olKeyHash01,
      taker,
      tick,
      fillVolume,
      fillWants,
      BigInt.fromI32(0),
      orderType,
      takerGivesLogic,
      takerWantsLogic
    );
    handleMangroveOrderStart(orderStartEvent);

    const limitOrder = getLatestLimitOrderFromStack();
    assert.assertTrue(limitOrder!.id == getEventUniqueId(orderStartEvent));

    const orderCompleteEvent = createMangroveOrderCompleteEvent();
    handleMangroveOrderComplete(orderCompleteEvent);

    assert.assertNull(getLatestLimitOrderFromStack());
  });

  test("LimitOrder, handleSetExpiry, setting expiry date", () => {
    const limitOrderStartEvent = createMangroveOrderStartEvent(
      olKeyHash01,
      taker,
      BigInt.fromI32(0),
      BigInt.fromI32(0),
      false,
      BigInt.fromI32(1),
      BigInt.fromI32(0),
      Address.zero(),
      Address.zero()
    );

    handleMangroveOrderStart(limitOrderStartEvent);

    const setExpiryEvent = createSetRenegingEvent(olKeyHash01, BigInt.fromI32(1), BigInt.fromI32(1000), BigInt.fromI32(2000));
    handleSetReneging(setExpiryEvent);

    const limitOrderId = getEventUniqueId(limitOrderStartEvent);
    assert.fieldEquals("LimitOrder", limitOrderId, "expiryDate", "1000");
    assert.fieldEquals("LimitOrder", limitOrderId, "maxVolume", "2000");
    assert.fieldEquals("LimitOrder", limitOrderId, "latestUpdateDate", "1");
  });

  test("LimitOrder, handleSetRouteLogic, setting route logics", () => {
    // random logic addresses
    const logic1 = Address.fromString("0x0000000000000000000000000000000000000012");
    const logic2 = Address.fromString("0x0000000000000000000000000000000000000234");

    const offerId = BigInt.fromI32(1);

    const offerWriteEvent = createOfferWriteEvent(olKeyHash01, maker, BigInt.fromI32(0), BigInt.fromI32(10), BigInt.fromI32(0), BigInt.fromI32(0), offerId);

    handleOfferWrite(offerWriteEvent);

    const offerIdString = getOfferId(olKeyHash01, offerId);

    const offer = Offer.load(offerIdString)!;

    const limitOrderStartEvent = createMangroveOrderStartEvent(
      olKeyHash01,
      taker,
      BigInt.fromI32(0),
      BigInt.fromI32(0),
      false,
      offerId,
      BigInt.fromI32(0),
      Address.zero(),
      Address.zero()
    );

    handleMangroveOrderStart(limitOrderStartEvent);

    const limitOrderId = getEventUniqueId(limitOrderStartEvent);
    offer.limitOrder = limitOrderId;

    saveOffer(offer, newMockEvent().block);

    const setRouteLogicEvent1 = createSetRouteLogicEvent(olKeyHash01, token0, offerId, logic1);
    handleSetRouteLogic(setRouteLogicEvent1);

    const setRouteLogicEvent2 = createSetRouteLogicEvent(olKeyHash01, token1, offerId, logic2);
    handleSetRouteLogic(setRouteLogicEvent2);

    assert.fieldEquals("LimitOrder", limitOrderId, "outboundRoute", logic1.toHex());
    assert.fieldEquals("LimitOrder", limitOrderId, "inboundRoute", logic2.toHex());
  });

  //TODO: would like to test negative path, where the LimitOrder does not exist. How?
});
