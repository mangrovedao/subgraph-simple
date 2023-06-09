import { Address, BigInt } from "@graphprotocol/graph-ts";
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
import { createNewKandelEvent } from "./kandel-seeder-utils";
import { handleNewKandel } from "../../src/kandel-seeder";
import { createCreditEvent, createDebitEvent, createSetGaspriceEvent } from "./kandel-utils";
import { handleCredit, handleDebit, handleSetGasprice } from "../../src/kandel";


// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

let token0 = Address.fromString("0x0000000000000000000000000000000000000000");
let token1 = Address.fromString("0x0000000000000000000000000000000000000001");
let owner = Address.fromString("0x0000000000000000000000000000000000000002")
let kandel = Address.fromString("0x0000000000000000000000000000000000000004")

describe("Describe entity assertions", () => {
  beforeEach(() => {
    const newKandelEvent = createNewKandelEvent(owner, token0, token1, kandel);
    handleNewKandel(newKandelEvent);
  });

  afterEach(() => {
    clearStore()
  });

  test("Kandel created and stored", () => {
    assert.entityCount('Kandel', 1);
  });

  test("Kandel setGasPrice", () => {
    assert.entityCount('Kandel', 1);

    const bi10 = BigInt.fromI32(10);
    const setGasPriceEvent = createSetGaspriceEvent(bi10)
    setGasPriceEvent.address = kandel;
    handleSetGasprice(setGasPriceEvent);
     
    assert.fieldEquals('Kandel', kandel.toHexString(), 'gasprice', '10');
  });

  test("Kandel Credit", () => {
    assert.entityCount('Kandel', 1);

    const creditEvent = createCreditEvent(token0, BigInt.fromI32(10));
    creditEvent.address = kandel;
    handleCredit(creditEvent);

    const creditEvent2 = createCreditEvent(token1, BigInt.fromI32(20)); 
    creditEvent2.address = kandel; 
    handleCredit(creditEvent2); 
 
    assert.fieldEquals('Kandel', kandel.toHexString(), 'totalBase', '10');
    assert.fieldEquals('Kandel', kandel.toHexString(), 'depositedBase', '10');

    assert.fieldEquals('Kandel', kandel.toHexString(), 'totalQuote', '20');
    assert.fieldEquals('Kandel', kandel.toHexString(), 'depositedQuote', '20');

    const debitEvent = createDebitEvent(token0, BigInt.fromI32(10));
    debitEvent.address = kandel;
    handleDebit(debitEvent);

    const debitEvent2 = createDebitEvent(token1, BigInt.fromI32(20));
    debitEvent2.address = kandel;
    handleDebit(debitEvent2);

    assert.fieldEquals('Kandel', kandel.toHexString(), 'totalBase', '0');
    assert.fieldEquals('Kandel', kandel.toHexString(), 'depositedBase', '0');

    assert.fieldEquals('Kandel', kandel.toHexString(), 'totalQuote', '0');
    assert.fieldEquals('Kandel', kandel.toHexString(), 'depositedQuote', '0');
  });
})
