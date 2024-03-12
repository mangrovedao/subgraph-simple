import { assert, describe, test, clearStore, beforeAll, afterAll } from "matchstick-as/assembly/index";
import { Address, BigInt } from "@graphprotocol/graph-ts";
import { createWeigthsEvent } from "./points-weigths-utils";
import { handleWeigths } from "../../src/points-weigths";
import { getWeightId } from "../../src/points-weigths";

const token0 = Address.fromString("0x0000000000000000000000000000000000000000");
const token1 = Address.fromString("0x0000000000000000000000000000000000000001");

describe("Verify points weigths indexing", () => {
  beforeAll(() => {});

  afterAll(() => {
    clearStore();
  });

  test("Check if weigths are stored", () => {
    const fromBlock = BigInt.fromI32(0);
    const toBlock = BigInt.fromI32(10);

    const takerPointsPerDollar1 = BigInt.fromI32(1);
    const makerToTakerRatio = BigInt.fromI32(2);
    const ncMakerToCMakerRatio = BigInt.fromI32(3);
    const reffererPointsPerDollar1 = BigInt.fromI32(4);

    const setWeigthsEvent = createWeigthsEvent(
      token0,
      token1,
      fromBlock,
      toBlock,
      takerPointsPerDollar1,
      makerToTakerRatio,
      ncMakerToCMakerRatio,
      reffererPointsPerDollar1
    );
    handleWeigths(setWeigthsEvent);

    assert.entityCount("Weight", 1);

    const weigthsId = getWeightId(setWeigthsEvent);
    assert.fieldEquals("Weight", weigthsId, "base", token0.toHex());
    assert.fieldEquals("Weight", weigthsId, "quote", token1.toHex());
    assert.fieldEquals("Weight", weigthsId, "fromBlock", "0");
    assert.fieldEquals("Weight", weigthsId, "toBlock", "10");
    assert.fieldEquals("Weight", weigthsId, "takerPointsPerDollar", "1");
    assert.fieldEquals("Weight", weigthsId, "makerToTakerRatio", "2");
    assert.fieldEquals("Weight", weigthsId, "ncMakerToCMakerRatio", "3");
    assert.fieldEquals("Weight", weigthsId, "maxSpread", "4");
  });
});
