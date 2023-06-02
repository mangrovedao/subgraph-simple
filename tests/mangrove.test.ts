import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Address, Bytes, Value } from "@graphprotocol/graph-ts"
import { handleSetActive } from "../src/mangrove"
import { createSetActiveEvent } from "./mangrove-utils"
import { MarketEntity } from "../src/entities/market";

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

let token0 = Address.fromString("0x0000000000000000000000000000000000000000");
let token1 = Address.fromString("0x0000000000000000000000000000000000000001");

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
})
