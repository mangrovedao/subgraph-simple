import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Address, BigInt, Bytes, Value } from "@graphprotocol/graph-ts"
import { handleOfferRetract, handleOfferSuccess, handleOfferWrite, handleSetActive } from "../src/mangrove"
import { createOfferRetractEvent, createOfferSuccessEvent, createOfferWriteEvent, createSetActiveEvent } from "./mangrove-utils"
import { MarketEntity } from "../src/entities/market";
import { OfferEntity } from "../src/entities/offer";

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

  test("MarketEntity created and stored", () => {
    let setActiveEvent = createSetActiveEvent(token0, token1, true);
    handleSetActive(setActiveEvent);
    assert.entityCount("MarketEntity", 1);

    let market = MarketEntity.load(token0, token1);
    assert.assertNotNull(market);

    const id = Bytes.fromUTF8(`${token0.toHex()}-${token1.toHex()}`).toHexString();

    assert.fieldEquals('MarketEntity', id, 'active', 'true');

    setActiveEvent = createSetActiveEvent(token0, token1, false);
    handleSetActive(setActiveEvent);
    
    assert.fieldEquals('MarketEntity', id, 'active', 'false');
    assert.entityCount("MarketEntity", 1);
  });

  test("OfferEntity created, stored, retracted", () => {
    let setActiveEvent = createSetActiveEvent(token0, token1, true);
    handleSetActive(setActiveEvent);
    assert.entityCount("MarketEntity", 1);

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

    const offerId = OfferEntity.computeId(id, token0, token1);
    assert.fieldEquals('OfferEntity', offerId.toHexString(), 'isOpen', 'true');

    let offerRetract = createOfferRetractEvent(
      token0,
      token1,
      id,
      false
    );
    handleOfferRetract(offerRetract);

    assert.fieldEquals('OfferEntity', offerId.toHexString(), 'isOpen', 'false');
    assert.entityCount("OfferEntity", 1);
  });

  test("OfferEntity created, partially filled, fully filled", () => {
    let setActiveEvent = createSetActiveEvent(token0, token1, true);
    handleSetActive(setActiveEvent);
    assert.entityCount("MarketEntity", 1);

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

    const offerId = OfferEntity.computeId(id, token0, token1).toHexString();

    assert.fieldEquals('OfferEntity', offerId, 'wants', '990');
    assert.fieldEquals('OfferEntity', offerId, 'gives', '1980');

    offerSuccess = createOfferSuccessEvent(token0, token1, id, taker, BigInt.fromI32(990), BigInt.fromI32(1980));
    handleOfferSuccess(offerSuccess);

    assert.fieldEquals('OfferEntity', offerId, 'wants', '0');
    assert.fieldEquals('OfferEntity', offerId, 'gives', '0');
    assert.fieldEquals('OfferEntity', offerId, 'isOpen', 'false');
    assert.fieldEquals('OfferEntity', offerId, 'isFilled', 'false');

    assert.entityCount("OfferEntity", 1);
  });
})
