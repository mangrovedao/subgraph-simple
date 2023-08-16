import { Address } from "@graphprotocol/graph-ts";
import { assert, describe, test } from "matchstick-as";
import { createNewKandelEvent } from "./kandel-seeder-utils";
import { handleNewAaveKandel, handleNewKandel } from "../../src/kandel-seeder";
import { createNewAaveKandelEvent } from "./kandel-seeder-utils";

const token0 = Address.fromString("0x0000000000000000000000000000000000000000");
const token1 = Address.fromString("0x0000000000000000000000000000000000000001");
const owner = Address.fromString("0x0000000000000000000000000000000000000002");
const kandelAddress = Address.fromString("0x0000000000000000000000000000000000000004");
const reservedId = Address.fromString("0x0000000000000000000000000000000000000005");

describe("KandelSeeder", () => {

  test("NewKandel", () => {
    const kandel = createNewKandelEvent(owner, token0, token1, kandelAddress);
    handleNewKandel(kandel);

    assert.fieldEquals("Kandel", kandelAddress.toHex(), "transactionHash", kandel.transaction.hash.toHex());
    assert.fieldEquals("Kandel", kandelAddress.toHex(), "creationDate", kandel.block.timestamp.toI32().toString());
    assert.fieldEquals("Kandel", kandelAddress.toHex(), "seeder", kandel.address.toHex());
    assert.fieldEquals("Kandel", kandelAddress.toHex(), "type", "Kandel");
    assert.fieldEquals("Kandel", kandelAddress.toHex(), "base", token0.toHex());
    assert.fieldEquals("Kandel", kandelAddress.toHex(), "quote", token1.toHex());
    assert.fieldEquals("Kandel", kandelAddress.toHex(), "deployer", owner.toHex());
    assert.fieldEquals("Kandel", kandelAddress.toHex(), "admin", owner.toHex());
    assert.fieldEquals("Kandel", kandelAddress.toHex(), "offerIndexes", "[]");
  });

  test("NewKandelAave", () => {
    const kandel = createNewAaveKandelEvent(owner, token0, token1, kandelAddress, reservedId);
    handleNewAaveKandel(kandel);

    assert.fieldEquals("Kandel", kandelAddress.toHex(), "transactionHash", kandel.transaction.hash.toHex());
    assert.fieldEquals("Kandel", kandelAddress.toHex(), "creationDate", kandel.block.timestamp.toI32().toString());
    assert.fieldEquals("Kandel", kandelAddress.toHex(), "seeder", kandel.address.toHex());
    assert.fieldEquals("Kandel", kandelAddress.toHex(), "type", "KandelAAVE");
    assert.fieldEquals("Kandel", kandelAddress.toHex(), "base", token0.toHex());
    assert.fieldEquals("Kandel", kandelAddress.toHex(), "quote", token1.toHex());
    assert.fieldEquals("Kandel", kandelAddress.toHex(), "deployer", owner.toHex());
    assert.fieldEquals("Kandel", kandelAddress.toHex(), "admin", owner.toHex());
    assert.fieldEquals("Kandel", kandelAddress.toHex(), "reserveId", reservedId.toHex());
    assert.fieldEquals("Kandel", kandelAddress.toHex(), "offerIndexes", "[]");
  });

});
