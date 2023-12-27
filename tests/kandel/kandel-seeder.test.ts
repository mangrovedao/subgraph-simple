import { Address, Bytes, BigInt } from "@graphprotocol/graph-ts";
import { assert, beforeEach, describe, test } from "matchstick-as";
import { createNewKandelEvent } from "./kandel-seeder-utils";
import { handleNewAaveKandel, handleNewKandel } from "../../src/kandel-seeder";
import { createNewAaveKandelEvent } from "./kandel-seeder-utils";
import { createSetActiveEvent } from "../mangrove/mangrove-utils";
import { handleSetActive } from "../../src/mangrove";
import { prepareERC20 } from "../mangrove/helpers";

const token0 = Address.fromString("0x0000000000000000000000000000000000000000");
const token1 = Address.fromString("0x0000000000000000000000000000000000000001");
prepareERC20(token0, "token0", "tkn0", 18);
prepareERC20(token1, "token1", "tkn1", 6);

const owner = Address.fromString("0x0000000000000000000000000000000000000002");
const kandelAddress = Address.fromString("0x0000000000000000000000000000000000000004");
const reservedId = Address.fromString("0x0000000000000000000000000000000000000005");
const olKeyHash01 = Bytes.fromHexString(token0.toHex() + token1.toHex());
const olKeyHash10 = Bytes.fromHexString(token1.toHex() + token0.toHex());


describe("KandelSeeder", () => {

    beforeEach(() => {
        const activate01 = createSetActiveEvent(olKeyHash01, token0, token1, BigInt.fromI32(1), true);
        handleSetActive(activate01);
        const activate10 = createSetActiveEvent(olKeyHash10, token1, token0, BigInt.fromI32(1), true);
        handleSetActive(activate10);
    })

  test("NewKandel", () => {
    const kandel = createNewKandelEvent(owner, olKeyHash01, olKeyHash10, kandelAddress);
    handleNewKandel(kandel);

    assert.fieldEquals("Kandel", kandelAddress.toHex(), "transactionHash", kandel.transaction.hash.toHex());
    assert.fieldEquals("Kandel", kandelAddress.toHex(), "creationDate", kandel.block.timestamp.toI32().toString());
    assert.fieldEquals("Kandel", kandelAddress.toHex(), "seeder", kandel.address.toHex());
    assert.fieldEquals("Kandel", kandelAddress.toHex(), "type", "Kandel");
    assert.fieldEquals("Kandel", kandelAddress.toHex(), "base", token0.toHex());
    assert.fieldEquals("Kandel", kandelAddress.toHex(), "quote", token1.toHex());
    assert.fieldEquals("Kandel", kandelAddress.toHex(), "baseQuoteOlKeyHash", olKeyHash01.toHex());
    assert.fieldEquals("Kandel", kandelAddress.toHex(), "quoteBaseOlKeyHash", olKeyHash10.toHex());
    assert.fieldEquals("Kandel", kandelAddress.toHex(), "deployer", owner.toHex());
    assert.fieldEquals("Kandel", kandelAddress.toHex(), "admin", owner.toHex());
    assert.fieldEquals("Kandel", kandelAddress.toHex(), "offerIndexes", "[]");
  });

  test("NewKandelAave", () => {
    const kandel = createNewAaveKandelEvent(owner, olKeyHash01, olKeyHash10, kandelAddress, reservedId);
    handleNewAaveKandel(kandel);

    assert.fieldEquals("Kandel", kandelAddress.toHex(), "transactionHash", kandel.transaction.hash.toHex());
    assert.fieldEquals("Kandel", kandelAddress.toHex(), "creationDate", kandel.block.timestamp.toI32().toString());
    assert.fieldEquals("Kandel", kandelAddress.toHex(), "seeder", kandel.address.toHex());
    assert.fieldEquals("Kandel", kandelAddress.toHex(), "type", "KandelAAVE");
    assert.fieldEquals("Kandel", kandelAddress.toHex(), "base", token0.toHex());
    assert.fieldEquals("Kandel", kandelAddress.toHex(), "quote", token1.toHex());
    assert.fieldEquals("Kandel", kandelAddress.toHex(), "baseQuoteOlKeyHash", olKeyHash01.toHex());
    assert.fieldEquals("Kandel", kandelAddress.toHex(), "quoteBaseOlKeyHash", olKeyHash10.toHex());
    assert.fieldEquals("Kandel", kandelAddress.toHex(), "deployer", owner.toHex());
    assert.fieldEquals("Kandel", kandelAddress.toHex(), "admin", owner.toHex());
    assert.fieldEquals("Kandel", kandelAddress.toHex(), "reserveId", reservedId.toHex());
    assert.fieldEquals("Kandel", kandelAddress.toHex(), "offerIndexes", "[]");
  });

});
