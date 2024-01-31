import {
  assert,
  describe,
  test,
  clearStore,
  beforeEach,
  afterEach
} from "matchstick-as/assembly/index"
import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts"
import { handleOfferFail, handleOfferRetract, handleOfferSuccess, handleOfferWrite, handleOrderComplete, handleOrderStart, handleSetActive } from "../../src/mangrove";
import { createOfferFailEvent, createOfferSuccessEvent, createOfferWriteEvent, createOrderCompleteEvent, createOrderStartEvent, createSetActiveEvent } from "./mangrove-utils";
import { createNewOwnedOfferEvent, createMangroveOrderStartEvent, createSetExpiryEvent, createMangroveOrderCompleteEvent } from "./mangrove-order-utils";
import { handleNewOwnedOffer, handleMangroveOrderStart, handleSetExpiry, limitOrderSetIsOpen, handleMangroveOrderComplete } from "../../src/mangrove-order";
import { createDummyOffer, createOffer, getEventUniqueId, getOfferId } from "../../src/helpers";
import { Stack, LimitOrder, Order } from "../../generated/schema";
import { createOfferRetractEvent } from "./mangrove-utils";
import { getLatestLimitOrderFromStack } from "../../src/stack";
import { prepareERC20 } from "./helpers";

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

const token0 = Address.fromString("0x0000000000000000000000000000000000000000");
const token1 = Address.fromString("0x0000000000000000000000000000000000000001");
prepareERC20(token0, "token0", "tkn0", 18);
prepareERC20(token1, "token1", "tkn1", 6);

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

  test("LimitOrder, limitOrderSetIsOpen, id is null", () => {
    limitOrderSetIsOpen(null, true); // should not throw
  })

  test("LimitOrder, limitOrderSetIsOpen, id is not null, id does not exist", () => {
    limitOrderSetIsOpen("limitOrder1", true); // should not throw
  })

  test("LimitOrder, limitOrderSetIsOpen, id is not null, id exists", () => {
    const limitOrder = new LimitOrder("limitOrder");
    limitOrder.isOpen = false;
    limitOrder.creationDate = BigInt.fromI32(0);
    limitOrder.latestUpdateDate = BigInt.fromI32(0);
    limitOrder.fillOrKill = false;
    limitOrder.restingOrder = false;
    limitOrder.order = "";
    limitOrder.save();

    limitOrderSetIsOpen("limitOrder", true);

    assert.fieldEquals('LimitOrder', "limitOrder", 'isOpen', 'true');
  })

  test("Offer, handleNewOwnedOffer, offer exists", () => {
    const id = BigInt.fromI32(1);
    const offer = createDummyOffer(
      id,
      olKeyHash01,
    )

    const orderStartEvent = createMangroveOrderStartEvent(
      olKeyHash01,
      taker,
      false,
      BigInt.fromI32(0),
      BigInt.fromI32(0),
      false,
      false,
      id,
    )
    handleMangroveOrderStart(orderStartEvent);

    const newOwnerOffer = createNewOwnedOfferEvent(
      olKeyHash01,
      id,
      owner,
    );
    handleNewOwnedOffer(newOwnerOffer);

    const offerId = getOfferId(olKeyHash01, id);
    const limitOrderId = getEventUniqueId(orderStartEvent);

    assert.fieldEquals('Offer', offerId, 'owner', owner.toHex());
    assert.fieldEquals('Offer', offerId, 'limitOrder', limitOrderId);
    assert.fieldEquals('LimitOrder', limitOrderId, 'offer', offer.id);
    assert.fieldEquals('LimitOrder', limitOrderId, 'isOpen', 'true');
  });

  // test("Offer, handleNewOwnedOffer, limit order does exist", () => {
  //   const id = BigInt.fromI32(1);
  //   createDummyOffer(
  //     id,
  //     olKeyHash01,
  //   )

  //   const newOwnerOffer = createNewOwnedOfferEvent(
  //     olKeyHash01,
  //     id,
  //     owner,
  //   );
  //   let error = false;
  //   try {
  //     handleNewOwnedOffer(newOwnerOffer);
  //   } catch (error) {
  //     error = true;
  //   }
  //   assert.assertTrue(error); // should have thrown

  // });

  //TODO: would like to test negative case, where the offer does not exist. And where limit order does not exists How?

  test("LimitOrder, handleMangroveOrderStart, posting resting order", () => {
    let setActiveEvent = createSetActiveEvent(olKeyHash01, token0, token1, BigInt.fromI32(1), true);
    handleSetActive(setActiveEvent);
    assert.entityCount("Market", 1);

    const id = BigInt.fromI32(1);
    createDummyOffer(
      id,
      olKeyHash01,
    );

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

  test("LimitOrder, handleMangroveOrderComplete", () => {
    let setActiveEvent = createSetActiveEvent(olKeyHash01, token0, token1, BigInt.fromI32(1), true);
    handleSetActive(setActiveEvent);
    assert.entityCount("Market", 1);


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
      BigInt.fromI32(0),
    );
    handleMangroveOrderStart(orderStartEvent);

    const limitOrder = getLatestLimitOrderFromStack(true);
    assert.assertTrue(limitOrder!.id == getEventUniqueId(orderStartEvent));

    const orderCompleteEvent = createMangroveOrderCompleteEvent()
    handleMangroveOrderComplete(orderCompleteEvent);

    assert.assertNull(getLatestLimitOrderFromStack(true));
  });

  test("LimitOrder, handleSetExpiry, setting expiry date", () => {
    const mangroveOrderStartEvent = createMangroveOrderStartEvent(
      olKeyHash01,
      taker,
      false,
      BigInt.fromI32(0),
      BigInt.fromI32(0),
      false,
      false,
      BigInt.fromI32(1),
    )

    handleMangroveOrderStart(mangroveOrderStartEvent);

    const setExpiryEvent = createSetExpiryEvent(olKeyHash01, BigInt.fromI32(1), BigInt.fromI32(1000));
    handleSetExpiry(setExpiryEvent);

    const limitOrderId = getEventUniqueId(mangroveOrderStartEvent);
    assert.fieldEquals('LimitOrder', limitOrderId, 'expiryDate', '1000');
    assert.fieldEquals('LimitOrder', limitOrderId, 'latestUpdateDate', '1');
  })

  //TODO: would like to test negative path, where the LimitOrder does not exist. How?
});
