import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Address, BigInt } from "@graphprotocol/graph-ts"
import { handleOfferRetract, handleOfferSuccess, handleOfferWrite, handleSetActive } from "../src/mangrove"
import { createOfferRetractEvent, createOfferSuccessEvent, createOfferWriteEvent, createSetActiveEvent } from "./mangrove-utils"
import { Market } from "../src/entities/market";
import { Offer } from "../src/entities/offer";

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

    let market = Market.load(token0, token1);
    assert.assertNotNull(market);

    const id = Market.computeId(token0, token1);
    assert.fieldEquals('Market', id, 'active', 'true');

    setActiveEvent = createSetActiveEvent(token0, token1, false);
    handleSetActive(setActiveEvent);
    
    assert.fieldEquals('Market', id, 'active', 'false');
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

    const offerId = Offer.computeId(id, token0, token1);
    assert.fieldEquals('Offer', offerId.toHexString(), 'isOpen', 'true');

    let offerRetract = createOfferRetractEvent(
      token0,
      token1,
      id,
      false
    );
    handleOfferRetract(offerRetract);

    assert.fieldEquals('Offer', offerId.toHexString(), 'isOpen', 'false');
    assert.entityCount("Offer", 1);
  });

  test("Offer created, partially filled, fully filled", () => {
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

    let offerSuccess = createOfferSuccessEvent(token0, token1, id, taker, BigInt.fromI32(10), BigInt.fromI32(20));
    handleOfferSuccess(offerSuccess);

    const offerId = Offer.computeId(id, token0, token1).toHexString();

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
})
