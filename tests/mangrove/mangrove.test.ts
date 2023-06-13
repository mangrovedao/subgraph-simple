import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll,
  beforeEach,
  afterEach
} from "matchstick-as/assembly/index"
import { Address, BigInt, Bytes, log } from "@graphprotocol/graph-ts"
import { handleOfferFail, handleOfferRetract, handleOfferSuccess, handleOfferWrite, handleOrderComplete, handleOrderStart, handleSetActive } from "../../src/mangrove"
import { createOfferFailEvent, createOfferRetractEvent, createOfferSuccessEvent, createOfferWriteEvent, createOrderCompleteEvent, createOrderStartEvent, createSetActiveEvent } from "./mangrove-utils"
import { Market, Offer } from "../../generated/schema";
import { getMarketId, getOfferId } from "../../src/helpers";

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

let token0 = Address.fromString("0x0000000000000000000000000000000000000000");
let token1 = Address.fromString("0x0000000000000000000000000000000000000001");
let maker = Address.fromString("0x0000000000000000000000000000000000000002")
let taker = Address.fromString("0x0000000000000000000000000000000000000003")

describe("Describe entity assertions", () => {
  beforeAll(() => {

  })

  afterEach(() => {
    clearStore()
  })

  test("Market created and stored", () => {
    let setActiveEvent = createSetActiveEvent(token0, token1, true);
    handleSetActive(setActiveEvent);
    assert.entityCount("Market", 1);

    const marketId = getMarketId(token0, token1)
    let market = Market.load(marketId);
    assert.assertNotNull(market);

    assert.fieldEquals('Market', marketId, 'active', 'true');

    setActiveEvent = createSetActiveEvent(token0, token1, false);
    handleSetActive(setActiveEvent);
    
    assert.fieldEquals('Market', marketId, 'active', 'false');
    assert.entityCount("Market", 1);
  });

  test("Offer created, stored, retracted", () => {
    let setActiveEvent = createSetActiveEvent(token0, token1, true);
    handleSetActive(setActiveEvent);
    assert.entityCount("Market", 1);

    const id = BigInt.fromI32(0);
    let offerWrite = createOfferWriteEvent(
      token0, 
      token1,
      maker,
      BigInt.fromI32(1000),
      BigInt.fromI32(2000),
      BigInt.fromI32(0),
      BigInt.fromI32(0),
      id,
      BigInt.fromI32(0),
    );
    handleOfferWrite(offerWrite);

    let offerId = getOfferId(token0, token1, id);
    assert.fieldEquals('Offer', offerId, 'isOpen', 'true');

    let offerRetract = createOfferRetractEvent(
      token0,
      token1,
      id,
      false
    );
    handleOfferRetract(offerRetract);
    offerId = `${offerId}-${offerRetract.transaction.hash.toHex()}-${offerRetract.logIndex.toHex()}`;

    assert.fieldEquals('Offer', offerId, 'isOpen', 'false');
    assert.entityCount("Offer", 1);
  });

  test("Offer created, failed", () => {
    let setActiveEvent = createSetActiveEvent(token0, token1, true);
    handleSetActive(setActiveEvent);
    assert.entityCount("Market", 1);

    const id = BigInt.fromI32(0);
    let offerWrite = createOfferWriteEvent(
      token0, 
      token1,
      maker,
      BigInt.fromI32(1000),
      BigInt.fromI32(2000),
      BigInt.fromI32(0),
      BigInt.fromI32(0),
      id,
      BigInt.fromI32(0),
    );
    handleOfferWrite(offerWrite);

    let offerId = getOfferId(token0, token1, id);
    assert.fieldEquals('Offer', offerId, 'isOpen', 'true');

    let offerFail = createOfferFailEvent(
      token0,
      token1,
      id,
      taker,
      BigInt.fromI32(2000),
      BigInt.fromI32(1000),
      Bytes.fromUTF8("Failed"),
    );
    handleOfferFail(offerFail);
    offerId = `${offerId}-${offerFail.transaction.hash.toHex()}-${offerFail.logIndex.toHex()}`;

    assert.fieldEquals('Offer', offerId, 'isOpen', 'false');
    assert.entityCount("Offer", 1);
  });

  test("Offer created, partially filled, fully filled", () => {
    let setActiveEvent = createSetActiveEvent(token0, token1, true);
    handleSetActive(setActiveEvent);
    assert.entityCount("Market", 1);

    const order = createOrderStartEvent();
    handleOrderStart(order);

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

    let offerSuccess = createOfferSuccessEvent(token0, token1, id, taker, BigInt.fromI32(10), BigInt.fromI32(20));
    handleOfferSuccess(offerSuccess);

    let offerId = getOfferId(token0, token1, id);

    assert.fieldEquals('Offer', offerId, 'wants', '980');
    assert.fieldEquals('Offer', offerId, 'gives', '1990');
    assert.fieldEquals('Offer', offerId, 'isFilled', 'false');

    offerSuccess = createOfferSuccessEvent(token0, token1, id, taker, BigInt.fromI32(1990), BigInt.fromI32(980));
    handleOfferSuccess(offerSuccess);

    offerId = `${offerId}-${offerSuccess.transaction.hash.toHex()}-${offerSuccess.logIndex.toHex()}`;
    assert.fieldEquals('Offer', offerId, 'wants', '0');
    assert.fieldEquals('Offer', offerId, 'gives', '0');
    assert.fieldEquals('Offer', offerId, 'isOpen', 'false');
    assert.fieldEquals('Offer', offerId, 'isFilled', 'true');

    assert.entityCount("Offer", 1);
  });

});
