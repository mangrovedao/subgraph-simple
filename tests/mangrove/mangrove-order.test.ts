import {
  assert,
  describe,
  test,
  clearStore,
  beforeEach,
  afterEach
} from "matchstick-as/assembly/index"
import { Address, BigInt } from "@graphprotocol/graph-ts"
import { handleOfferWrite, handleOrderComplete, handleOrderStart, handleSetActive } from "../../src/mangrove";
import { createOfferWriteEvent, createOrderCompleteEvent, createOrderStartEvent, createSetActiveEvent } from "./mangrove-utils";
import { createNewOwnedOfferEvent, createOrderSummaryEvent } from "./mangrove-order-utils";
import { handleNewOwnedOffer, handleOrderSummary } from "../../src/mangrove-order";
import { getOfferId } from "../../src/helpers";

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
    let setActiveEvent = createSetActiveEvent(token0, token1, true);
    handleSetActive(setActiveEvent);
    assert.entityCount("Market", 1);
  })

  afterEach(() => {
    clearStore()
  });

  test("New owned offer", () => {
    let setActiveEvent = createSetActiveEvent(token0, token1, true);
    handleSetActive(setActiveEvent);
    assert.entityCount("Market", 1);

    const id = BigInt.fromI32(0);
    let offerWrite = createOfferWriteEvent(
      token0, 
      token1,
      maker,
      BigInt.fromI32(1000), // wants
      BigInt.fromI32(2000), // gives
      BigInt.fromI32(0),
      BigInt.fromI32(0),
      id,
      BigInt.fromI32(0),
    );
    handleOfferWrite(offerWrite);

    const newOwnerOffer = createNewOwnedOfferEvent(
      token0,
      token0,
      token1,
      id,
      owner,
    );
    handleNewOwnedOffer(newOwnerOffer);

    const offerId = getOfferId(token0, token1, id);

    assert.fieldEquals('Offer', offerId, 'owner', owner.toHex());
  });

  test("Limit order with part of the order posted to the book", () => {
    let setActiveEvent = createSetActiveEvent(token0, token1, true);
    handleSetActive(setActiveEvent);
    assert.entityCount("Market", 1);

    const id = BigInt.fromI32(0);

    const totalWants = BigInt.fromI32(1000); 
    const postWants = BigInt.fromI32(500);

    const totalGives = BigInt.fromI32(2000);
    const postGives = BigInt.fromI32(1000);

    const orderStart = createOrderStartEvent();
    handleOrderStart(orderStart);

    const orderComplete = createOrderCompleteEvent(
      token0,
      token1,
      taker,
      totalGives.minus(postGives),
      totalWants.minus(postWants),
      BigInt.fromI32(0),
      BigInt.fromI32(0),
    );

    handleOrderComplete(orderComplete);

    let offerWrite = createOfferWriteEvent(
      token0, 
      token1,
      maker,
      postWants, // wants
      postGives, // gives
      BigInt.fromI32(0),
      BigInt.fromI32(0),
      id,
      BigInt.fromI32(0),
    );
    handleOfferWrite(offerWrite);

    const newOwnerOffer = createNewOwnedOfferEvent(
      mgv,
      token0,
      token1,
      id,
      owner,
    );
    handleNewOwnedOffer(newOwnerOffer);

    const orderSummaryEvent = createOrderSummaryEvent(
      mgv,
      token1,
      token0,
      taker,
      false,
      totalWants, // takerWants,
      totalGives, // takerGives
      false,
      true,
      BigInt.fromI32(1686754719),
      postGives, // takerGot
      postWants, // takerGave
      BigInt.fromI32(0),
      BigInt.fromI32(0),
      id,
    );
    handleOrderSummary(orderSummaryEvent);

    const offerId = getOfferId(token0, token1, id);
    assert.fieldEquals('Offer', offerId, 'owner', owner.toHex());

    assert.fieldEquals('Offer', offerId, 'initialWants', totalWants.toString());
    assert.fieldEquals('Offer', offerId, 'wants', postWants.toString());

    assert.fieldEquals('Offer', offerId, 'initialGives', totalGives.toString());
    assert.fieldEquals('Offer', offerId, 'gives', postGives.toString());

    const orderId = `${orderStart.transaction.hash.toHex()}-${orderStart.logIndex.toHex()}`;

    assert.fieldEquals('Order', orderId, 'offer', offerId);
    assert.fieldEquals('Order', orderId, 'type', 'LIMIT');
  });

});
