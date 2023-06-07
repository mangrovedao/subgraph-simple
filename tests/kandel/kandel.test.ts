import { Address } from "@graphprotocol/graph-ts";
import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { createNewKandelEvent } from "./kandel-seeder-utils";
import { handleNewKandel } from "../../src/kandel-seeder";


// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

let token0 = Address.fromString("0x0000000000000000000000000000000000000000");
let token1 = Address.fromString("0x0000000000000000000000000000000000000001");
let owner = Address.fromString("0x0000000000000000000000000000000000000002")
let kandel = Address.fromString("0x0000000000000000000000000000000000000004")

describe("Describe entity assertions", () => {
  beforeAll(() => {
    const newKandelEvent = createNewKandelEvent(owner, token0, token1, kandel);
    handleNewKandel(newKandelEvent);
  });

  afterAll(() => {
    clearStore()
  });

  test("Kandel created and stored", () => {
    assert.entityCount('Kandel', 1);
  });
})
