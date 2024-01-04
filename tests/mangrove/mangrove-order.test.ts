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
import { createNewOwnedOfferEvent, createMangroveOrderStartEvent, createSetRenegingEvent, createMangroveOrderCompleteEvent } from "./mangrove-order-utils";
import { handleNewOwnedOffer, handleMangroveOrderStart, handleSetReneging, mangroveOrderSetIsOpen, handleMangroveOrderComplete } from "../../src/mangrove-order";
import { createDummyOffer, createOffer, getEventUniqueId, getOfferId } from "../../src/helpers";
import { Stack, MangroveOrder, Order } from "../../generated/schema";
import { createOfferRetractEvent } from "./mangrove-utils";
import { getLatestMangroveOrderFromStack } from "../../src/stack";
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

  test("MangroveOrder, mangroveOrderSetIsOpen, id is null", () => {
    mangroveOrderSetIsOpen(null, true); // should not throw
  })

  test("MangroveOrder, mangroveOrderSetIsOpen, id is not null, id does not exist", () => {
    mangroveOrderSetIsOpen("MangroveOrder1", true); // should not throw
  })

  test("MangroveOrder, mangroveOrderSetIsOpen, id is not null, id exists", () => {
    const mangroveOrder = new MangroveOrder("mangroveOrder");
    mangroveOrder.isOpen = false;
    mangroveOrder.creationDate = BigInt.fromI32(0);
    mangroveOrder.latestUpdateDate = BigInt.fromI32(0);
    mangroveOrder.orderType = 0;
    mangroveOrder.order = "";
    mangroveOrder.save();

    mangroveOrderSetIsOpen("mangroveOrder", true);

    assert.fieldEquals('MangroveOrder', "mangroveOrder", 'isOpen', 'true');
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
      BigInt.fromI32(0),
      BigInt.fromI32(0),
      false,
      id,
      BigInt.fromI32(0),
      Address.zero(),
      Address.zero(),
    )
    handleMangroveOrderStart(orderStartEvent);

    const newOwnerOffer = createNewOwnedOfferEvent(
      olKeyHash01,
      id,
      owner,
    );
    handleNewOwnedOffer(newOwnerOffer);

    const offerId = getOfferId(olKeyHash01, id);
    const mangroveOrderId = getEventUniqueId(orderStartEvent);

    assert.fieldEquals('Offer', offerId, 'owner', owner.toHex());
    assert.fieldEquals('Offer', offerId, 'mangroveOrder', mangroveOrderId);
    assert.fieldEquals('MangroveOrder', mangroveOrderId, 'offer', offer.id);
    assert.fieldEquals('MangroveOrder', mangroveOrderId, 'isOpen', 'true');
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

  test("MangroveOrder, handleMangroveOrderStart, posting resting order", () => {
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
      id,
      orderType,
      takerGivesLogic,
      takerWantsLogic,
    );
    handleMangroveOrderStart(orderStartEvent);

    const mangroveOrderId = getEventUniqueId(orderStartEvent);

    assert.fieldEquals('MangroveOrder', mangroveOrderId, 'isOpen', 'false');
    assert.fieldEquals('MangroveOrder', mangroveOrderId, 'realTaker', taker.toHex());
    assert.fieldEquals('MangroveOrder', mangroveOrderId, 'orderType', '0');
    assert.fieldEquals('MangroveOrder', mangroveOrderId, 'creationDate', '1');
    assert.fieldEquals('MangroveOrder', mangroveOrderId, 'latestUpdateDate', '1');

    assert.fieldEquals('Account', taker.toHex(), 'latestInteractionDate', orderStartEvent.block.timestamp.toI32().toString());
  });

  test("MangroveOrder, handleMangroveOrderComplete", () => {
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
      takerWantsLogic,
    );
    handleMangroveOrderStart(orderStartEvent);

    const mangroveOrder = getLatestMangroveOrderFromStack();
    assert.assertTrue(mangroveOrder!.id == getEventUniqueId(orderStartEvent));

    const orderCompleteEvent = createMangroveOrderCompleteEvent()
    handleMangroveOrderComplete(orderCompleteEvent);

    assert.assertNull(getLatestMangroveOrderFromStack());
  });

  test("MangroveOrder, handleSetExpiry, setting expiry date", () => {
    const mangroveOrderStartEvent = createMangroveOrderStartEvent(
      olKeyHash01,
      taker,
      BigInt.fromI32(0),
      BigInt.fromI32(0),
      false,
      BigInt.fromI32(1),
      BigInt.fromI32(0),
      Address.zero(),
      Address.zero(),
    )

    handleMangroveOrderStart(mangroveOrderStartEvent);

    const setExpiryEvent = createSetRenegingEvent(olKeyHash01, BigInt.fromI32(1), BigInt.fromI32(1000), BigInt.fromI32(0));
    handleSetReneging(setExpiryEvent);

    const mangroveOrderId = getEventUniqueId(mangroveOrderStartEvent);
    assert.fieldEquals('MangroveOrder', mangroveOrderId, 'expiryDate', '1000');
    assert.fieldEquals('MangroveOrder', mangroveOrderId, 'latestUpdateDate', '1');
  })

  //TODO: would like to test negative path, where the MangroveOrder does not exist. How?
});
