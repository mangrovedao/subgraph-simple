import { Address, BigInt } from "@graphprotocol/graph-ts";
import {
  assert,
  describe,
  test,
  clearStore,
  beforeEach,
  afterEach
} from "matchstick-as/assembly/index"
import { createNewKandelEvent } from "./kandel-seeder-utils";
import { handleNewKandel } from "../../src/kandel-seeder";
import { createCreditEvent, createDebitEvent, createPairEvent, createSetAdminEvent, createSetGaspriceEvent, createSetGasreqEvent, createSetGeometricParamsEvent, createSetReserveIdEvent, createSetRouterEvent } from "./kandel-utils";
import { handleCredit, handleDebit, handlePair, handleSetAdmin, handleSetGasprice, handleSetGasreq, handleSetGeometricParams, handleSetReserveId, handleSetRouter } from "../../src/kandel";
import { createOfferWriteEvent, createSetActiveEvent } from "../mangrove/mangrove-utils";
import { handleOfferWrite, handleSetActive } from "../../src/mangrove";
import { getOfferId } from "../../src/helpers";

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

const token0 = Address.fromString("0x0000000000000000000000000000000000000000");
const token1 = Address.fromString("0x0000000000000000000000000000000000000001");
const owner = Address.fromString("0x0000000000000000000000000000000000000002")
const kandel = Address.fromString("0x0000000000000000000000000000000000000004")
const newOwner = Address.fromString("0x0000000000000000000000000000000000000005")
const router = Address.fromString("0x0000000000000000000000000000000000000006")
const reserveId = Address.fromString("0x0000000000000000000000000000000000000007")

describe("Describe entity assertions", () => {
  beforeEach(() => {
    const newKandelEvent = createNewKandelEvent(owner, token0, token1, kandel);
    handleNewKandel(newKandelEvent);
    assert.entityCount('Kandel', 1);

    const setActiveEvent = createSetActiveEvent(token0, token1, true);
    handleSetActive(setActiveEvent);
    assert.entityCount("Market", 1);
  });

  afterEach(() => {
    clearStore()
  });

  test("Kandel setGasPrice", () => {
    const bi10 = BigInt.fromI32(10);
    const setGasPriceEvent = createSetGaspriceEvent(bi10)
    setGasPriceEvent.address = kandel;
    handleSetGasprice(setGasPriceEvent);
     
    assert.fieldEquals('Kandel', kandel.toHexString(), 'gasprice', '10');
  });

  test("Kandel setAdmin", () => {
    assert.fieldEquals('Kandel', kandel.toHexString(), 'deployer', owner.toHexString());
    assert.fieldEquals('Kandel', kandel.toHexString(), 'admin', owner.toHexString());

    const setAdmin = createSetAdminEvent(newOwner);
    setAdmin.address = kandel;
    handleSetAdmin(setAdmin);

    assert.fieldEquals('Kandel', kandel.toHexString(), 'admin', newOwner.toHexString());
    assert.fieldEquals('Kandel', kandel.toHexString(), 'deployer', owner.toHexString());
  });

  test("Kandel setGasReq", () => {
    const value = BigInt.fromI32(10);
    const setGasReq = createSetGasreqEvent(value);
    setGasReq.address = kandel;
    handleSetGasreq(setGasReq);

    assert.fieldEquals('Kandel', kandel.toHexString(), 'gasreq', value.toString());
  });

  test("Kandel setGeometricParams", () => {
    const spread = BigInt.fromI32(10);
    const ratio = BigInt.fromI32(5);

    const geometricParams = createSetGeometricParamsEvent(
      spread,
      ratio
    );
    geometricParams.address = kandel;
    handleSetGeometricParams(geometricParams);

    assert.fieldEquals('Kandel', kandel.toHexString(), 'spread', spread.toString());
    assert.fieldEquals('Kandel', kandel.toHexString(), 'ratio', ratio.toString());
  });

  test("Kandel setReserveId", () => {
    const setReserveId = createSetReserveIdEvent(reserveId);
    setReserveId.address = kandel;
    handleSetReserveId(setReserveId);

    assert.fieldEquals('Kandel', kandel.toHexString(), 'reserveId', reserveId.toHexString());
  });

  test("Kandel setRouter", () => {
    const setRouter = createSetRouterEvent(router);
    setRouter.address = kandel;
    handleSetRouter(setRouter);

    assert.fieldEquals('Kandel', kandel.toHexString(), 'router', router.toHexString());
  });

  test("Kandel Credit", () => {
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

  test("Kandel offers", () => {
    const id = BigInt.fromI32(0);
    const offerWrite = createOfferWriteEvent(
      token0, 
      token1,
      kandel,
      BigInt.fromI32(1000),
      BigInt.fromI32(2000),
      BigInt.fromI32(0),
      BigInt.fromI32(0),
      id,
      BigInt.fromI32(0),
    );
    handleOfferWrite(offerWrite);

    const offerId = getOfferId(token0, token1, id);
    assert.fieldEquals('Offer', offerId, 'kandel', kandel.toHexString());

    const id2 = BigInt.fromI32(2);
    const offerWrite2 = createOfferWriteEvent(
      token0, 
      token1,
      kandel,
      BigInt.fromI32(500),
      BigInt.fromI32(100),
      BigInt.fromI32(0),
      BigInt.fromI32(0),
      id2,
      BigInt.fromI32(0),
    );
    handleOfferWrite(offerWrite2);

    const offerId2 = getOfferId(token0, token1, id2);
    assert.fieldEquals('Offer', offerId2, 'kandel', kandel.toHexString());
  });
})
