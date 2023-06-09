import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts"
import { handleOfferRetract, handleOfferSuccess, handleOfferWrite, handleOrderStart, handleSetActive } from "../../src/mangrove"
import { createOfferRetractEvent, createOfferSuccessEvent, createOfferWriteEvent, createOrderStartEvent, createSetActiveEvent } from "./mangrove-utils"
import { Market } from "../../generated/schema";
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

  afterAll(() => {
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

    const offerId = getOfferId(token0, token1, id);
    assert.fieldEquals('Offer', offerId, 'isOpen', 'true');

    let offerRetract = createOfferRetractEvent(
      token0,
      token1,
      id,
      false
    );
    handleOfferRetract(offerRetract);

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

    const offerId = getOfferId(token0, token1, id);

    assert.fieldEquals('Offer', offerId, 'wants', '980');
    assert.fieldEquals('Offer', offerId, 'gives', '1990');
    assert.fieldEquals('Offer', offerId, 'isFilled', 'false');

    offerSuccess = createOfferSuccessEvent(token0, token1, id, taker, BigInt.fromI32(1990), BigInt.fromI32(980));
    handleOfferSuccess(offerSuccess);

    assert.fieldEquals('Offer', offerId, 'wants', '0');
    assert.fieldEquals('Offer', offerId, 'gives', '0');
    assert.fieldEquals('Offer', offerId, 'isOpen', 'false');
    assert.fieldEquals('Offer', offerId, 'isFilled', 'true');

    assert.entityCount("Offer", 1);
  });

  describe("Order created", () => {
    beforeAll(() => {
      let setActiveEvent = createSetActiveEvent(token0, token1, true);
      handleSetActive(setActiveEvent);
    });
    
    test("OrderStart", () => {
      const order = createOrderStartEvent();
      handleOrderStart(order);

      assert.entityCount("Order", 1);
    });

    test("Order recursive", () => {
      let order = createOrderStartEvent();
      handleOrderStart(order);

      assert.entityCount("Order", 1);

      let id = BigInt.fromI32(0);
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

      order = createOrderStartEvent()
      order.transaction.hash = Bytes.fromUTF8("0xccc");
      handleOrderStart(order);

      id = BigInt.fromI32(1);
      offerWrite = createOfferWriteEvent(
        token0, 
        token1,
        maker,
        BigInt.fromI32(500), // wants
        BigInt.fromI32(1000), // gives
        BigInt.fromI32(0),
        BigInt.fromI32(0),
        id,
        BigInt.fromI32(0),
      );
      handleOfferWrite(offerWrite);

      assert.entityCount("Order", 2);
    });

  });
})
