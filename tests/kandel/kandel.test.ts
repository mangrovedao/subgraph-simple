import { Address, BigInt, Bytes, log } from "@graphprotocol/graph-ts";
import {
  afterEach,
  assert,
  beforeEach,
  clearStore,
  describe,
  test
} from "matchstick-as/assembly/index";
import { Kandel } from "../../generated/schema";
import { getEventUniqueId, getKandelParamsId } from "../../src/helpers";
import { handleCredit, handleDebit, handleSetAdmin, handleSetCompoundRates, handleSetGasprice, handleSetGasreq, handleSetGeometricParams, handleSetIndexMapping, handleSetLength, handleSetReserveId, handleSetRouter } from "../../src/kandel";
import { handleSetActive } from "../../src/mangrove";
import { createSetActiveEvent } from "../mangrove/mangrove-utils";
import { createCreditEvent, createDebitEvent, createSetAdminEvent, createSetCompoundRatesEvent, createSetGaspriceEvent, createSetGasreqEvent, createSetGeometricParamsEvent, createSetIndexMappingEvent, createSetLengthEvent, createSetReserveIdEvent, createSetRouterEvent } from "./kandel-utils";

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

const token0 = Address.fromString("0x0000000000000000000000000000000000000000");
const token1 = Address.fromString("0x0000000000000000000000000000000000000001");
const owner = Address.fromString("0x0000000000000000000000000000000000000002")
const kandelAddress = Address.fromString("0x0000000000000000000000000000000000000004")
const newOwner = Address.fromString("0x0000000000000000000000000000000000000005")
const router = Address.fromString("0x0000000000000000000000000000000000000006")
const reserveId = Address.fromString("0x0000000000000000000000000000000000000007")
const taker = Address.fromString("0x0000000000000000000000000000000000000008")


describe("Describe entity assertions", () => {
  beforeEach(() => {
    const kandel =new Kandel(kandelAddress);
    kandel.transactionHash = Bytes.fromHexString('0x000123');
    kandel.seeder = Bytes.fromUTF8('seeder');
    kandel.address = Bytes.fromUTF8('address');
    kandel.base = token0;
    kandel.quote = token1;
    kandel.depositedBase = BigInt.fromI32(100);
    kandel.depositedQuote = BigInt.fromI32(100);
    kandel.deployer = Bytes.fromUTF8('owner');
    kandel.admin = Bytes.fromUTF8('admin');
    kandel.offerIndexes = [];
    kandel.save()
    assert.entityCount("Kandel", 1);

    const setActiveEvent = createSetActiveEvent(token0, token1, true);
    handleSetActive(setActiveEvent);

    const setActiveEvent2 = createSetActiveEvent(token1, token0, true);
    handleSetActive(setActiveEvent2);
    assert.entityCount("Market", 2);
  });

  afterEach(() => {
    clearStore()
  });

  test("Kandel, handleCredit, base", () => {
    const creditEvent = createCreditEvent(token0, BigInt.fromI32(10));
    creditEvent.address = kandelAddress;
    handleCredit(creditEvent);
    const creditId = getEventUniqueId(creditEvent)
    assert.fieldEquals("Kandel", kandelAddress.toHexString(), "depositedBase", "110");
    assert.fieldEquals("KandelDepositWithdraw",creditId, "transactionHash", creditEvent.transaction.hash.toHexString())
    assert.fieldEquals("KandelDepositWithdraw",creditId, "date", creditEvent.block.timestamp.toString())
    assert.fieldEquals("KandelDepositWithdraw",creditId, "token", creditEvent.params.token.toHexString())
    assert.fieldEquals("KandelDepositWithdraw",creditId, "amount", creditEvent.params.amount.toString())
    assert.fieldEquals("KandelDepositWithdraw",creditId, "isDeposit", 'true')
  })

  test("Kandel, handleCredit, quote", () => {
    const creditEvent2 = createCreditEvent(token1, BigInt.fromI32(20)); 
    creditEvent2.address = kandelAddress; 
    handleCredit(creditEvent2); 
    const creditId2 = getEventUniqueId(creditEvent2)
    assert.fieldEquals("Kandel", kandelAddress.toHexString(), "depositedQuote", "120");
    assert.fieldEquals("KandelDepositWithdraw",creditId2, "transactionHash", creditEvent2.transaction.hash.toHexString())
    assert.fieldEquals("KandelDepositWithdraw",creditId2, "date", creditEvent2.block.timestamp.toString())
    assert.fieldEquals("KandelDepositWithdraw",creditId2, "token", creditEvent2.params.token.toHexString())
    assert.fieldEquals("KandelDepositWithdraw",creditId2, "amount", creditEvent2.params.amount.toString())
    assert.fieldEquals("KandelDepositWithdraw",creditId2, "isDeposit", 'true')
  });

  test("Kandel, handleDebit, base", () => {
    const debitEvent = createDebitEvent(token0, BigInt.fromI32(10));
    debitEvent.address = kandelAddress;
    handleDebit(debitEvent);
    const debitId = getEventUniqueId(debitEvent)
    assert.fieldEquals("Kandel", kandelAddress.toHexString(), "depositedBase", "90");
    assert.fieldEquals("KandelDepositWithdraw",debitId, "transactionHash", debitEvent.transaction.hash.toHexString())
    assert.fieldEquals("KandelDepositWithdraw",debitId, "date", debitEvent.block.timestamp.toString())
    assert.fieldEquals("KandelDepositWithdraw",debitId, "token", debitEvent.params.token.toHexString())
    assert.fieldEquals("KandelDepositWithdraw",debitId, "amount", debitEvent.params.amount.toString())
    assert.fieldEquals("KandelDepositWithdraw",debitId, "isDeposit", 'false')
  })

  test("Kandel, handleDebit, quote", () => {
    const debitEvent2 = createDebitEvent(token1, BigInt.fromI32(20));
    debitEvent2.address = kandelAddress;
    handleDebit(debitEvent2);
    const debitId2 = getEventUniqueId(debitEvent2)
    assert.fieldEquals("Kandel", kandelAddress.toHexString(), "depositedQuote", "80");    
    assert.fieldEquals("KandelDepositWithdraw",debitId2, "transactionHash", debitEvent2.transaction.hash.toHexString())
    assert.fieldEquals("KandelDepositWithdraw",debitId2, "date", debitEvent2.block.timestamp.toString())
    assert.fieldEquals("KandelDepositWithdraw",debitId2, "token", debitEvent2.params.token.toHexString())
    assert.fieldEquals("KandelDepositWithdraw",debitId2, "amount", debitEvent2.params.amount.toString())
    assert.fieldEquals("KandelDepositWithdraw",debitId2, "isDeposit", 'false')
  })

  // populate

  // retract

  test("Kandel, handleSetAdmin", () => {
    const setAdmin = createSetAdminEvent(newOwner);
    setAdmin.address = kandelAddress;
    handleSetAdmin(setAdmin);

    assert.fieldEquals("Kandel", kandelAddress.toHexString(), "admin", newOwner.toHexString());
  });

  test("KandelParameters, handleSetCompoundRates", () => {
    const base = BigInt.fromI32(10);
    const quote = BigInt.fromI32(20);
    const compoundRateEvent = createSetCompoundRatesEvent(base, quote);
    compoundRateEvent.address = kandelAddress;
    handleSetCompoundRates(compoundRateEvent);
    const kandelParamsId= getKandelParamsId(compoundRateEvent.transaction.hash, compoundRateEvent.address)
    
    assert.fieldEquals("KandelParameters", kandelParamsId, "kandel", compoundRateEvent.address.toHex());
    assert.fieldEquals("KandelParameters", kandelParamsId, "transactionHash", compoundRateEvent.transaction.hash.toHexString());
    assert.fieldEquals("KandelParameters", kandelParamsId, "creationDate", compoundRateEvent.block.timestamp.toString());
    assert.fieldEquals("KandelParameters", kandelParamsId, "compoundRateBase",compoundRateEvent.params.compoundRateBase.toString());
    assert.fieldEquals("KandelParameters", kandelParamsId, "compoundRateQuote",compoundRateEvent.params.compoundRateQuote.toString());
  });

  test("KandelParameters, handleSetGasprice", () => {
    const bi10 = BigInt.fromI32(10);
    const setGasPriceEvent = createSetGaspriceEvent(bi10)
    setGasPriceEvent.address = kandelAddress;
    handleSetGasprice(setGasPriceEvent);
    const kandelParamsId= getKandelParamsId(setGasPriceEvent.transaction.hash, setGasPriceEvent.address)
     
    assert.fieldEquals("KandelParameters", kandelParamsId, "gasprice", "10");
    assert.fieldEquals("KandelParameters", kandelParamsId, "kandel", setGasPriceEvent.address.toHex());
    assert.fieldEquals("KandelParameters", kandelParamsId, "transactionHash", setGasPriceEvent.transaction.hash.toHexString());
    assert.fieldEquals("KandelParameters", kandelParamsId, "creationDate", setGasPriceEvent.block.timestamp.toString());
  });

  test("KandelParameters, handleSetGasreq", () => {
    const value = BigInt.fromI32(10);
    const setGasReq = createSetGasreqEvent(value);
    setGasReq.address = kandelAddress;
    handleSetGasreq(setGasReq);
    const kandelParamsId= getKandelParamsId(setGasReq.transaction.hash, setGasReq.address)

    assert.fieldEquals("KandelParameters", kandelParamsId, "gasreq", value.toString());
    assert.fieldEquals("KandelParameters", kandelParamsId, "kandel", setGasReq.address.toHex());
    assert.fieldEquals("KandelParameters", kandelParamsId, "transactionHash", setGasReq.transaction.hash.toHexString());
    assert.fieldEquals("KandelParameters", kandelParamsId, "creationDate", setGasReq.block.timestamp.toString());
    
  });

  test("KandelParameters, handleSetGeometricParams", () => {
    const spread = BigInt.fromI32(10);
    const ratio = BigInt.fromI32(5);

    const geometricParams = createSetGeometricParamsEvent(
      spread,
      ratio
    );
    geometricParams.address = kandelAddress;
    handleSetGeometricParams(geometricParams);
    const kandelParamsId= getKandelParamsId(geometricParams.transaction.hash, geometricParams.address)


    assert.fieldEquals("KandelParameters", kandelParamsId, "spread", spread.toString());
    assert.fieldEquals("KandelParameters", kandelParamsId, "ratio", ratio.toString());
    assert.fieldEquals("KandelParameters", kandelParamsId, "kandel", geometricParams.address.toHex());
    assert.fieldEquals("KandelParameters", kandelParamsId, "transactionHash", geometricParams.transaction.hash.toHexString());
    assert.fieldEquals("KandelParameters", kandelParamsId, "creationDate", geometricParams.block.timestamp.toString());

  });

  test("Kandel, handleSetIndexMapping", () => {
    const setIndexMapping1 = createSetIndexMappingEvent(1, BigInt.fromI32(1), BigInt.fromI32(10));
    setIndexMapping1.address = kandelAddress;
    handleSetIndexMapping(setIndexMapping1);

    const setIndexMapping2 = createSetIndexMappingEvent(0, BigInt.fromI32(1), BigInt.fromI32(1000));
    setIndexMapping2.address = kandelAddress;
    handleSetIndexMapping(setIndexMapping2);
    const kandel =  Kandel.load(kandelAddress)!;
    assert.assertTrue( kandel.offerIndexes.length == 2 );
    assert.assertTrue( kandel.offerIndexes[0] == Bytes.fromUTF8(`${setIndexMapping1.params.index}-${setIndexMapping1.params.offerId}-${setIndexMapping1.params.ba}`)  );
    assert.assertTrue( kandel.offerIndexes[1] == Bytes.fromUTF8(`${setIndexMapping2.params.index}-${setIndexMapping2.params.offerId}-${setIndexMapping2.params.ba}`)  );
  })

  test("Kandel, handleSetLength", () => {
    const value = BigInt.fromI32(32);
    const setLength = createSetLengthEvent(value);
    setLength.address = kandelAddress;
    handleSetLength(setLength);
    const kandelParamsId= getKandelParamsId(setLength.transaction.hash, setLength.address)

    assert.fieldEquals("KandelParameters", kandelParamsId, "length", value.toString());
    assert.fieldEquals("KandelParameters", kandelParamsId, "kandel", setLength.address.toHex());
    assert.fieldEquals("KandelParameters", kandelParamsId, "transactionHash", setLength.transaction.hash.toHexString());
    assert.fieldEquals("KandelParameters", kandelParamsId, "creationDate", setLength.block.timestamp.toString());
  });

  test("Kandel, handleSetReserveId", () => {
    const setReserveId = createSetReserveIdEvent(reserveId);
    setReserveId.address = kandelAddress;
    handleSetReserveId(setReserveId);

    assert.fieldEquals("Kandel", kandelAddress.toHexString(), "reserveId", reserveId.toHexString());
  });

  test("Kandel, handleSetRouter", () => {
    const setRouter = createSetRouterEvent(router);
    setRouter.address = kandelAddress;
    handleSetRouter(setRouter);

    assert.fieldEquals("Kandel", kandelAddress.toHexString(), "router", router.toHexString());
  });

})
