import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { afterEach, assert, beforeEach, clearStore, describe, test } from "matchstick-as/assembly/index";
import { CleanOrder, Kandel, LimitOrder, Market, Offer, Order } from "../../generated/schema";
import { createDummyOffer, createLimitOrder, createOffer, getAccountVolumeByPairId, getEventUniqueId, getOfferId } from "../../src/helpers";
import {
  createNewOffer,
  handleCleanComplete,
  handleCleanStart,
  handleOfferFail,
  handleOfferFailWithPosthookData,
  handleOfferRetract,
  handleOfferSuccess,
  handleOfferSuccessWithPosthookData,
  handleOfferWrite,
  handleOrderComplete,
  handleOrderStart,
  handleSetActive,
  handleSetGasbase
} from "../../src/mangrove";
import {
  createCleanCompleteEvent,
  createCleanOrderStartEvent as createCleanStartEvent,
  createOfferFailEvent,
  createOfferFailWithPosthookDataEvent,
  createOfferRetractEvent,
  createOfferSuccessEvent,
  createOfferSuccessWithPosthookDataEvent,
  createOfferWriteEvent,
  createOrderCompleteEvent,
  createOrderStartEvent,
  createSetActiveEvent,
  createSetGasbaseEvent
} from "./mangrove-utils";
import { createMangroveOrderStartEvent } from "./mangrove-order-utils";
import { handleMangroveOrderStart } from "../../src/mangrove-order";
import { prepareERC20 } from "./helpers";

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

let token0 = Address.fromString("0x0000000000000000000000000000000000000000");
let token1 = Address.fromString("0x0000000000000000000000000000000000000001");
prepareERC20(token0, "token0", "tkn0", 18);
prepareERC20(token1, "token1", "tkn1", 6);

let maker = Address.fromString("0x0000000000000000000000000000000000000002");
let taker = Address.fromString("0x0000000000000000000000000000000000000003");
let owner = Address.fromString("0x0000000000000000000000000000000000000004");
const olKeyHash01 = Bytes.fromHexString(token0.toHex() + token1.toHex());
const olKeyHash10 = Bytes.fromHexString(token1.toHex() + token0.toHex());

describe("Describe entity assertions", () => {
  beforeEach(() => {
    let setActiveEvent = createSetActiveEvent(olKeyHash01, token0, token1, BigInt.fromI32(1), true);
    handleSetActive(setActiveEvent);
    assert.entityCount("Market", 1);

    setActiveEvent = createSetActiveEvent(olKeyHash10, token1, token0, BigInt.fromI32(1), true);
    handleSetActive(setActiveEvent);
    assert.entityCount("Market", 2);
  });

  afterEach(() => {
    clearStore();
  });

  test("Tokens are created", () => {
    assert.fieldEquals("Token", token0.toHexString(), "address", token0.toHexString());
    assert.fieldEquals("Token", token0.toHexString(), "name", "token0");
    assert.fieldEquals("Token", token0.toHexString(), "symbol", "tkn0");
    assert.fieldEquals("Token", token0.toHexString(), "decimals", "18");

    assert.fieldEquals("Token", token1.toHexString(), "address", token1.toHexString());
    assert.fieldEquals("Token", token1.toHexString(), "name", "token1");
    assert.fieldEquals("Token", token1.toHexString(), "symbol", "tkn1");
    assert.fieldEquals("Token", token1.toHexString(), "decimals", "6");
  });

  test("Offer, handleOfferFail", () => {
    const orderStart = createOrderStartEvent(olKeyHash01, taker, BigInt.fromI32(40), BigInt.fromI32(1), false);
    handleOrderStart(orderStart);

    const id = BigInt.fromI32(1);
    let offerId = getOfferId(olKeyHash01, id);
    createOffer(
      id,
      olKeyHash01,
      Bytes.fromHexString("0x000123"),
      BigInt.fromI32(1),
      BigInt.fromI32(1234),
      BigInt.fromI32(5678),
      BigInt.fromI32(10),
      BigInt.fromI32(20),
      BigInt.fromI32(30),
      true,
      false,
      false,
      false,
      Bytes.fromUTF8("failed reason"),
      Bytes.fromUTF8("posthook fail reason"),
      false,
      maker,
      BigInt.fromI32(100),
      BigInt.fromI32(100),
      BigInt.fromI32(0),
      BigInt.fromI32(0),
      BigInt.fromI32(0),
      BigInt.fromI32(0)
    );

    let offerFail = createOfferFailEvent(
      olKeyHash01,
      id,
      taker,
      BigInt.fromI32(2000),
      BigInt.fromI32(1000),
      BigInt.fromI32(20),
      Bytes.fromUTF8("Failed"),
      Bytes.fromHexString("0x000123"),
      BigInt.fromI32(1),
      BigInt.fromI32(20)
    );
    handleOfferFail(offerFail);

    assert.fieldEquals("Offer", offerId, "offerId", "1");
    assert.fieldEquals("Offer", offerId, "latestTransactionHash", offerFail.transaction.hash.toHexString());
    assert.fieldEquals("Offer", offerId, "latestLogIndex", offerFail.logIndex.toString());
    assert.fieldEquals("Offer", offerId, "tick", "1234");
    assert.fieldEquals("Offer", offerId, "gives", "5678");
    assert.fieldEquals("Offer", offerId, "gasprice", "0");
    assert.fieldEquals("Offer", offerId, "gasreq", "20");
    assert.fieldEquals("Offer", offerId, "gasBase", "30");
    assert.fieldEquals("Offer", offerId, "isOpen", "false");
    assert.fieldEquals("Offer", offerId, "isFailed", "true");
    assert.fieldEquals("Offer", offerId, "isFilled", "false");
    assert.fieldEquals("Offer", offerId, "isRetracted", "false");
    assert.fieldEquals("Offer", offerId, "failedReason", Bytes.fromUTF8("Failed").toHexString());
    assert.fieldEquals("Offer", offerId, "posthookFailReason", "null");
    assert.fieldEquals("Offer", offerId, "totalGot", "0");
    assert.fieldEquals("Offer", offerId, "totalGave", "0");
    assert.fieldEquals("Offer", offerId, "deprovisioned", "false");
    assert.fieldEquals("Offer", offerId, "market", olKeyHash01.toHexString());
    assert.fieldEquals("Offer", offerId, "maker", maker.toHexString());
    assert.fieldEquals("Offer", offerId, "creationDate", "100");
    assert.fieldEquals("Offer", offerId, "latestUpdateDate", "20");
    assert.entityCount("Offer", 1);
    let updatedOffer = Offer.load(offerId)!;
    assert.assertTrue(updatedOffer.prevGives === null);
    assert.assertTrue(updatedOffer.prevTick === null);
    assert.assertTrue(updatedOffer.kandel === null);
    assert.assertTrue(updatedOffer.owner === null);
  });

  test("Offer, handleOfferFailWithPosthookData", () => {
    const orderStart = createOrderStartEvent(olKeyHash01, taker, BigInt.fromI32(40), BigInt.fromI32(1), false);
    handleOrderStart(orderStart);

    const id = BigInt.fromI32(1);
    let offerId = getOfferId(olKeyHash01, id);
    createOffer(
      id,
      olKeyHash01,
      Bytes.fromHexString("0x000123"),
      BigInt.fromI32(1),
      BigInt.fromI32(1234),
      BigInt.fromI32(5678),
      BigInt.fromI32(10),
      BigInt.fromI32(20),
      BigInt.fromI32(30),
      true,
      false,
      false,
      false,
      Bytes.fromUTF8("failed reason"),
      Bytes.fromUTF8("posthook fail reason"),
      false,
      maker,
      BigInt.fromI32(100),
      BigInt.fromI32(100),
      BigInt.fromI32(0),
      BigInt.fromI32(0),
      BigInt.fromI32(0),
      BigInt.fromI32(0)
    );

    let offerFail = createOfferFailWithPosthookDataEvent(
      olKeyHash01,
      id,
      taker,
      BigInt.fromI32(2000),
      BigInt.fromI32(1000),
      BigInt.fromI32(20),
      Bytes.fromUTF8("Failed"),
      Bytes.fromUTF8("Posthook failed"),
      Bytes.fromHexString("0x000123"),
      BigInt.fromI32(1),
      BigInt.fromI32(20)
    );
    handleOfferFailWithPosthookData(offerFail);

    assert.fieldEquals("Offer", offerId, "offerId", "1");
    assert.fieldEquals("Offer", offerId, "latestTransactionHash", offerFail.transaction.hash.toHexString());
    assert.fieldEquals("Offer", offerId, "latestLogIndex", offerFail.logIndex.toString());
    assert.fieldEquals("Offer", offerId, "tick", "1234");
    assert.fieldEquals("Offer", offerId, "gives", "5678");
    assert.fieldEquals("Offer", offerId, "gasprice", "0");
    assert.fieldEquals("Offer", offerId, "gasreq", "20");
    assert.fieldEquals("Offer", offerId, "gasBase", "30");
    assert.fieldEquals("Offer", offerId, "isOpen", "false");
    assert.fieldEquals("Offer", offerId, "isFailed", "true");
    assert.fieldEquals("Offer", offerId, "isFilled", "false");
    assert.fieldEquals("Offer", offerId, "isRetracted", "false");
    assert.fieldEquals("Offer", offerId, "failedReason", Bytes.fromUTF8("Failed").toHexString());
    assert.fieldEquals("Offer", offerId, "posthookFailReason", Bytes.fromUTF8("Posthook failed").toHexString());
    assert.fieldEquals("Offer", offerId, "totalGot", "0");
    assert.fieldEquals("Offer", offerId, "totalGave", "0");
    assert.fieldEquals("Offer", offerId, "deprovisioned", "false");
    assert.fieldEquals("Offer", offerId, "market", olKeyHash01.toHexString());
    assert.fieldEquals("Offer", offerId, "maker", maker.toHexString());
    assert.fieldEquals("Offer", offerId, "creationDate", "100");
    assert.fieldEquals("Offer", offerId, "latestUpdateDate", "20");
    assert.entityCount("Offer", 1);
    let updatedOffer = Offer.load(offerId)!;
    assert.assertTrue(updatedOffer.prevGives === null);
    assert.assertTrue(updatedOffer.prevTick === null);
    assert.assertTrue(updatedOffer.kandel === null);
    assert.assertTrue(updatedOffer.owner === null);
  });

  test("Offer, handleOfferRetract, with deprovision", () => {
    const id = BigInt.fromI32(1);
    let offerId = getOfferId(olKeyHash01, id);

    createOffer(
      id,
      olKeyHash01,
      Bytes.fromHexString("0x000123"),
      BigInt.fromI32(1),
      BigInt.fromI32(40),
      BigInt.fromI32(20),
      BigInt.fromI32(10),
      BigInt.fromI32(20),
      BigInt.fromI32(30),
      true,
      true,
      true,
      false,
      Bytes.fromUTF8("failed reason"),
      Bytes.fromUTF8("posthook fail reason"),
      false,
      maker,
      BigInt.fromI32(100),
      BigInt.fromI32(100),
      BigInt.fromI32(0),
      BigInt.fromI32(0),
      BigInt.fromI32(0),
      BigInt.fromI32(0)
    );

    let offerRetract = createOfferRetractEvent(olKeyHash01, maker, id, true);
    handleOfferRetract(offerRetract);

    assert.fieldEquals("Offer", offerId, "offerId", "1");

    assert.fieldEquals("Offer", offerId, "latestTransactionHash", offerRetract.transaction.hash.toHexString());
    assert.fieldEquals("Offer", offerId, "latestLogIndex", offerRetract.logIndex.toString());
    assert.fieldEquals("Offer", offerId, "tick", "40");
    assert.fieldEquals("Offer", offerId, "gives", "20");
    assert.fieldEquals("Offer", offerId, "gasprice", "0");
    assert.fieldEquals("Offer", offerId, "gasreq", "20");
    assert.fieldEquals("Offer", offerId, "gasBase", "30");
    assert.fieldEquals("Offer", offerId, "isOpen", "false");
    assert.fieldEquals("Offer", offerId, "isFailed", "false");
    assert.fieldEquals("Offer", offerId, "isFilled", "false");
    assert.fieldEquals("Offer", offerId, "isRetracted", "true");
    assert.fieldEquals("Offer", offerId, "failedReason", "null");
    assert.fieldEquals("Offer", offerId, "posthookFailReason", "null");
    assert.fieldEquals("Offer", offerId, "totalGot", "0");
    assert.fieldEquals("Offer", offerId, "totalGave", "0");
    assert.fieldEquals("Offer", offerId, "deprovisioned", "true");
    assert.fieldEquals("Offer", offerId, "market", olKeyHash01.toHexString());
    assert.fieldEquals("Offer", offerId, "maker", maker.toHexString());
    let updatedOffer = Offer.load(offerId)!;
    assert.assertTrue(updatedOffer.prevGives === null);
    assert.assertTrue(updatedOffer.prevTick === null);
    assert.assertTrue(updatedOffer.kandel === null);
    assert.assertTrue(updatedOffer.owner === null);
    assert.fieldEquals("Offer", offerId, "creationDate", "100");
    assert.fieldEquals("Offer", offerId, "latestUpdateDate", "1");
    assert.entityCount("Offer", 1);
  });

  test("Offer, handleOfferRetract, no deprovision", () => {
    const id = BigInt.fromI32(1);
    let offerId = getOfferId(olKeyHash01, id);

    createOffer(
      id,
      olKeyHash01,
      Bytes.fromHexString("0x000123"),
      BigInt.fromI32(1),
      BigInt.fromI32(40),
      BigInt.fromI32(20),
      BigInt.fromI32(10),
      BigInt.fromI32(20),
      BigInt.fromI32(30),
      true,
      true,
      true,
      false,
      Bytes.fromUTF8("failed reason"),
      Bytes.fromUTF8("posthook fail reason"),
      false,
      maker,
      BigInt.fromI32(100),
      BigInt.fromI32(100),
      BigInt.fromI32(0),
      BigInt.fromI32(0),
      BigInt.fromI32(0),
      BigInt.fromI32(0)
    );

    let offerRetract = createOfferRetractEvent(olKeyHash01, maker, id, false);
    handleOfferRetract(offerRetract);

    assert.fieldEquals("Offer", offerId, "offerId", "1");

    assert.fieldEquals("Offer", offerId, "latestTransactionHash", offerRetract.transaction.hash.toHexString());
    assert.fieldEquals("Offer", offerId, "latestLogIndex", offerRetract.logIndex.toString());
    // TODO: de we want to update the tick and gives?
    assert.fieldEquals("Offer", offerId, "tick", "40");
    assert.fieldEquals("Offer", offerId, "gives", "20");
    assert.fieldEquals("Offer", offerId, "gasprice", "10");
    assert.fieldEquals("Offer", offerId, "gasreq", "20");
    assert.fieldEquals("Offer", offerId, "gasBase", "30");
    assert.fieldEquals("Offer", offerId, "isOpen", "false");
    assert.fieldEquals("Offer", offerId, "isFailed", "false");
    assert.fieldEquals("Offer", offerId, "isFilled", "false");
    assert.fieldEquals("Offer", offerId, "isRetracted", "true");
    assert.fieldEquals("Offer", offerId, "failedReason", "null");
    assert.fieldEquals("Offer", offerId, "posthookFailReason", "null");
    assert.fieldEquals("Offer", offerId, "totalGot", "0");
    assert.fieldEquals("Offer", offerId, "totalGave", "0");
    assert.fieldEquals("Offer", offerId, "deprovisioned", "false");
    assert.fieldEquals("Offer", offerId, "market", olKeyHash01.toHexString());
    assert.fieldEquals("Offer", offerId, "maker", maker.toHexString());
    let updatedOffer = Offer.load(offerId)!;
    assert.assertTrue(updatedOffer.prevGives === null);
    assert.assertTrue(updatedOffer.prevTick === null);
    assert.assertTrue(updatedOffer.kandel === null);
    assert.assertTrue(updatedOffer.owner === null);
    assert.fieldEquals("Offer", offerId, "creationDate", "100");
    assert.fieldEquals("Offer", offerId, "latestUpdateDate", "1");
    assert.entityCount("Offer", 1);
  });

  test("Offer, handleOfferSuccess, partial fill", () => {
    const orderStart = createOrderStartEvent(olKeyHash01, taker, BigInt.fromI32(40), BigInt.fromI32(1), false);
    handleOrderStart(orderStart);

    const id = BigInt.fromI32(1);
    let offerId = getOfferId(olKeyHash01, id);

    createOffer(
      id,
      olKeyHash01,
      Bytes.fromHexString("0x000123"),
      BigInt.fromI32(1),
      BigInt.fromI32(40),
      BigInt.fromI32(20),
      BigInt.fromI32(10),
      BigInt.fromI32(20),
      BigInt.fromI32(30),
      true,
      false,
      false,
      false,
      Bytes.fromUTF8("failed reason"),
      Bytes.fromUTF8("posthook fail reason"),
      false,
      maker,
      BigInt.fromI32(100),
      BigInt.fromI32(100),
      BigInt.fromI32(0),
      BigInt.fromI32(0),
      BigInt.fromI32(0),
      BigInt.fromI32(0)
    );

    createLimitOrder("limitOrderId", taker, 0, orderStart.block.timestamp, orderStart.block.timestamp, true, offerId);

    const offer = Offer.load(offerId)!;
    offer.limitOrder = "limitOrderId";
    offer.save();

    let offerSuccess = createOfferSuccessEvent(olKeyHash01, id, taker, BigInt.fromI32(10), BigInt.fromI32(20));
    handleOfferSuccess(offerSuccess);

    assert.fieldEquals("Offer", offerId, "offerId", "1");
    assert.fieldEquals("Offer", offerId, "latestTransactionHash", offerSuccess.transaction.hash.toHexString());
    assert.fieldEquals("Offer", offerId, "latestLogIndex", offerSuccess.logIndex.toString());
    assert.fieldEquals("Offer", offerId, "tick", "40");
    assert.fieldEquals("Offer", offerId, "gives", "0");
    assert.fieldEquals("Offer", offerId, "gasprice", "10");
    assert.fieldEquals("Offer", offerId, "gasreq", "20");
    assert.fieldEquals("Offer", offerId, "gasBase", "30");
    assert.fieldEquals("Offer", offerId, "isOpen", "false");
    assert.fieldEquals("Offer", offerId, "isFailed", "false");
    assert.fieldEquals("Offer", offerId, "isFilled", "false");
    assert.fieldEquals("Offer", offerId, "isRetracted", "false");
    assert.fieldEquals("Offer", offerId, "failedReason", "null");
    assert.fieldEquals("Offer", offerId, "posthookFailReason", "null");
    assert.fieldEquals("Offer", offerId, "totalGot", "20");
    assert.fieldEquals("Offer", offerId, "totalGave", "10");
    assert.fieldEquals("Offer", offerId, "prevGives", "20");
    assert.fieldEquals("Offer", offerId, "prevTick", "40");
    assert.fieldEquals("Offer", offerId, "deprovisioned", "false");
    assert.fieldEquals("Offer", offerId, "latestPenalty", "0");
    assert.fieldEquals("Offer", offerId, "market", olKeyHash01.toHexString());
    assert.fieldEquals("Offer", offerId, "maker", maker.toHexString());
    let updatedOffer = Offer.load(offerId)!;
    assert.assertTrue(updatedOffer.kandel === null);
    assert.assertTrue(updatedOffer.owner === null);
    assert.fieldEquals("Offer", offerId, "creationDate", "100");
    assert.fieldEquals("Offer", offerId, "latestUpdateDate", "1");
    assert.entityCount("Offer", 1);

    const orderId = getEventUniqueId(orderStart);
    assert.fieldEquals("Order", orderId, "takerGot", "10");
    assert.fieldEquals("Order", orderId, "takerGave", "20");

    const accountVolumeByPairId = getAccountVolumeByPairId(maker, token0, token1, true);
    assert.fieldEquals("AccountVolumeByPair", accountVolumeByPairId, "account", maker.toHexString());
    assert.fieldEquals("AccountVolumeByPair", accountVolumeByPairId, "token0", token0.toHexString());
    assert.fieldEquals("AccountVolumeByPair", accountVolumeByPairId, "token1", token1.toHexString());
    assert.fieldEquals("AccountVolumeByPair", accountVolumeByPairId, "token0Sent", "10");
    assert.fieldEquals("AccountVolumeByPair", accountVolumeByPairId, "token1Sent", "0");
    assert.fieldEquals("AccountVolumeByPair", accountVolumeByPairId, "token0Received", "0");
    assert.fieldEquals("AccountVolumeByPair", accountVolumeByPairId, "token1Received", "20");
    assert.fieldEquals("AccountVolumeByPair", accountVolumeByPairId, "updatedDate", orderStart.block.timestamp.toString());
    assert.fieldEquals("AccountVolumeByPair", accountVolumeByPairId, "asMaker", "true");

    assert.fieldEquals("LimitOrder", "limitOrderId", "isOpen", "false");
  });

  test("cffer, handleOfferSuccess, fully fill", () => {
    const orderStart = createOrderStartEvent(olKeyHash01, taker, BigInt.fromI32(40), BigInt.fromI32(1), false);
    handleOrderStart(orderStart);

    const id = BigInt.fromI32(1);
    let offerId = getOfferId(olKeyHash01, id);

    const orderId = "orderId";
    const order = new Order(orderId);
    order.transactionHash = Bytes.fromUTF8("0x0");
    order.creationDate = BigInt.fromI32(100);
    order.takerGot = BigInt.fromI32(100);
    order.takerGave = BigInt.fromI32(50);
    order.fillVolume = BigInt.fromI32(100);
    order.fillWants = false;
    order.maxTick = BigInt.fromI32(1);
    order.penalty = BigInt.fromI32(0);
    order.feePaid = BigInt.fromI32(0);
    order.save();

    const limitOrder = new LimitOrder(offerId);
    limitOrder.realTaker = taker;
    limitOrder.expiryDate = BigInt.fromI32(0);
    limitOrder.orderType = 0;
    limitOrder.offer = offerId;
    limitOrder.tick = BigInt.fromI32(0);
    limitOrder.fillVolume = BigInt.fromI32(0);
    limitOrder.fillWants = false;
    limitOrder.creationDate = BigInt.fromI32(100);
    limitOrder.latestUpdateDate = BigInt.fromI32(1);
    limitOrder.order = orderId;
    limitOrder.inboundRoute = Address.zero();
    limitOrder.outboundRoute = Address.zero();
    limitOrder.save();

    createOffer(
      id,
      olKeyHash01,
      Bytes.fromHexString("0x000123"),
      BigInt.fromI32(1),
      BigInt.fromI32(40),
      BigInt.fromI32(20),
      BigInt.fromI32(10),
      BigInt.fromI32(20),
      BigInt.fromI32(30),
      true,
      true,
      false,
      true,
      Bytes.fromUTF8("failed reason"),
      Bytes.fromUTF8("posthook fail reason"),
      false,
      maker,
      BigInt.fromI32(100),
      BigInt.fromI32(100),
      BigInt.fromI32(20),
      BigInt.fromI32(30),
      BigInt.fromI32(40),
      BigInt.fromI32(50)
    );

    let offerSuccess = createOfferSuccessEvent(olKeyHash01, id, taker, BigInt.fromI32(20), BigInt.fromI32(40));
    handleOfferSuccess(offerSuccess);

    assert.fieldEquals("Offer", offerId, "offerId", "1");

    assert.fieldEquals("Offer", offerId, "latestTransactionHash", offerSuccess.transaction.hash.toHexString());
    assert.fieldEquals("Offer", offerId, "latestLogIndex", offerSuccess.logIndex.toString());
    assert.fieldEquals("Offer", offerId, "tick", "40");
    assert.fieldEquals("Offer", offerId, "gives", "0");
    assert.fieldEquals("Offer", offerId, "gasprice", "10");
    assert.fieldEquals("Offer", offerId, "gasreq", "20");
    assert.fieldEquals("Offer", offerId, "gasBase", "30");
    assert.fieldEquals("Offer", offerId, "isOpen", "false");
    assert.fieldEquals("Offer", offerId, "isFailed", "false");
    assert.fieldEquals("Offer", offerId, "isFilled", "true");
    assert.fieldEquals("Offer", offerId, "isRetracted", "false");
    assert.fieldEquals("Offer", offerId, "failedReason", "null");
    assert.fieldEquals("Offer", offerId, "posthookFailReason", "null");
    assert.fieldEquals("Offer", offerId, "totalGot", "80");
    assert.fieldEquals("Offer", offerId, "totalGave", "70");
    assert.fieldEquals("Offer", offerId, "prevGives", "20");
    assert.fieldEquals("Offer", offerId, "prevTick", "40");
    assert.fieldEquals("Offer", offerId, "deprovisioned", "false");
    assert.fieldEquals("Offer", offerId, "market", olKeyHash01.toHexString());
    assert.fieldEquals("Offer", offerId, "maker", maker.toHexString());
    let updatedOffer = Offer.load(offerId)!;
    assert.assertTrue(updatedOffer.kandel === null);
    assert.assertTrue(updatedOffer.owner === null);
    assert.fieldEquals("Offer", offerId, "creationDate", "100");
    assert.fieldEquals("Offer", offerId, "latestUpdateDate", "1");
    assert.entityCount("Offer", 1);

    offerSuccess = createOfferSuccessEvent(olKeyHash01, id, taker, BigInt.fromI32(20), BigInt.fromI32(40));
    handleOfferSuccess(offerSuccess);

    assert.fieldEquals("Offer", offerId, "totalGot", "120");
    assert.fieldEquals("Offer", offerId, "totalGave", "90");
  });

  test("Offer, handleOfferSuccessWithPosthookData", () => {
    const orderStart = createOrderStartEvent(olKeyHash01, taker, BigInt.fromI32(40), BigInt.fromI32(1), false);
    handleOrderStart(orderStart);

    const id = BigInt.fromI32(1);
    let offerId = getOfferId(olKeyHash01, id);

    const orderId = "orderId";
    const order = new Order(orderId);
    order.transactionHash = Bytes.fromUTF8("0x0");
    order.creationDate = BigInt.fromI32(100);
    order.takerGot = BigInt.fromI32(100);
    order.takerGave = BigInt.fromI32(50);
    order.fillVolume = BigInt.fromI32(100);
    order.fillWants = false;
    order.maxTick = BigInt.fromI32(1);
    order.penalty = BigInt.fromI32(0);
    order.feePaid = BigInt.fromI32(0);
    order.save();

    const limitOrder = new LimitOrder(offerId);
    limitOrder.realTaker = taker;
    limitOrder.expiryDate = BigInt.fromI32(0);
    limitOrder.orderType = 0;
    limitOrder.offer = offerId;
    limitOrder.creationDate = BigInt.fromI32(100);
    limitOrder.latestUpdateDate = BigInt.fromI32(1);
    limitOrder.fillWants = false;
    limitOrder.fillVolume = BigInt.fromI32(0);
    limitOrder.tick = BigInt.fromI32(0);
    limitOrder.order = orderId;
    limitOrder.inboundRoute = Address.zero();
    limitOrder.outboundRoute = Address.zero();
    limitOrder.save();

    createOffer(
      id,
      olKeyHash01,
      Bytes.fromHexString("0x000123"),
      BigInt.fromI32(1),
      BigInt.fromI32(40),
      BigInt.fromI32(20),
      BigInt.fromI32(10),
      BigInt.fromI32(20),
      BigInt.fromI32(30),
      true,
      true,
      false,
      true,
      Bytes.fromUTF8("failed reason"),
      Bytes.fromUTF8("posthook fail reason"),
      false,
      maker,
      BigInt.fromI32(100),
      BigInt.fromI32(100),
      BigInt.fromI32(20),
      BigInt.fromI32(30),
      BigInt.fromI32(40),
      BigInt.fromI32(50)
    );

    let offerSuccess = createOfferSuccessWithPosthookDataEvent(
      olKeyHash01,
      id,
      taker,
      BigInt.fromI32(20),
      BigInt.fromI32(40),
      Bytes.fromUTF8("Posthook failed")
    );
    handleOfferSuccessWithPosthookData(offerSuccess);

    assert.fieldEquals("Offer", offerId, "offerId", "1");

    assert.fieldEquals("Offer", offerId, "latestTransactionHash", offerSuccess.transaction.hash.toHexString());
    assert.fieldEquals("Offer", offerId, "latestLogIndex", offerSuccess.logIndex.toString());
    assert.fieldEquals("Offer", offerId, "tick", "40");
    assert.fieldEquals("Offer", offerId, "gives", "0");
    assert.fieldEquals("Offer", offerId, "gasprice", "10");
    assert.fieldEquals("Offer", offerId, "gasreq", "20");
    assert.fieldEquals("Offer", offerId, "gasBase", "30");
    assert.fieldEquals("Offer", offerId, "isOpen", "false");
    assert.fieldEquals("Offer", offerId, "isFailed", "false");
    assert.fieldEquals("Offer", offerId, "isFilled", "true");
    assert.fieldEquals("Offer", offerId, "isRetracted", "false");
    assert.fieldEquals("Offer", offerId, "failedReason", "null");
    assert.fieldEquals("Offer", offerId, "posthookFailReason", Bytes.fromUTF8("Posthook failed").toHexString());
    assert.fieldEquals("Offer", offerId, "totalGot", "80");
    assert.fieldEquals("Offer", offerId, "totalGave", "70");
    assert.fieldEquals("Offer", offerId, "prevGives", "20");
    assert.fieldEquals("Offer", offerId, "prevTick", "40");
    assert.fieldEquals("Offer", offerId, "deprovisioned", "false");
    assert.fieldEquals("Offer", offerId, "market", olKeyHash01.toHexString());
    assert.fieldEquals("Offer", offerId, "maker", maker.toHexString());
    let updatedOffer = Offer.load(offerId)!;
    assert.assertTrue(updatedOffer.kandel === null);
    assert.assertTrue(updatedOffer.owner === null);
    assert.fieldEquals("Offer", offerId, "creationDate", "100");
    assert.fieldEquals("Offer", offerId, "latestUpdateDate", "1");
    assert.entityCount("Offer", 1);
  });

  test("createNewOffer method, no kandel maker", () => {
    const id = BigInt.fromI32(0);

    let offerWrite = createOfferWriteEvent(olKeyHash01, maker, BigInt.fromI32(1000), BigInt.fromI32(2000), BigInt.fromI32(0), BigInt.fromI32(0), id);

    const offer = createNewOffer(offerWrite);
    assert.entityCount("Offer", 0);
    assert.assertTrue(offer.kandel === null);
  });

  test("createNewOffer method, have kandel maker", () => {
    const kandel = new Kandel(maker);

    kandel.transactionHash = Bytes.fromHexString("0x000123");
    kandel.creationDate = BigInt.fromI32(0);
    kandel.seeder = Bytes.fromUTF8("seeder");
    kandel.address = Bytes.fromUTF8("address");
    kandel.base = token0;
    kandel.quote = token1;
    kandel.baseQuoteOlKeyHash = olKeyHash01;
    kandel.quoteBaseOlKeyHash = olKeyHash10;
    kandel.type = "Kandel";
    kandel.depositedBase = BigInt.fromI32(0);
    kandel.depositedQuote = BigInt.fromI32(0);
    kandel.deployer = Bytes.fromUTF8("owner");
    kandel.admin = Bytes.fromUTF8("admin");
    kandel.offerIndexes = [];
    kandel.save();

    const id = BigInt.fromI32(0);
    let offerWrite = createOfferWriteEvent(olKeyHash01, maker, BigInt.fromI32(1000), BigInt.fromI32(2000), BigInt.fromI32(0), BigInt.fromI32(0), id);

    const offer = createNewOffer(offerWrite);
    assert.entityCount("Offer", 0);
    assert.assertTrue(offer.kandel!.toHexString() == kandel.id.toHexString());
  });

  test("Offer, handleOfferWrite, Create new offer", () => {
    // Open market
    let setActiveEvent = createSetActiveEvent(olKeyHash01, token0, token1, BigInt.fromI32(1), true);
    handleSetActive(setActiveEvent);

    const gasbaseEvent = createSetGasbaseEvent(olKeyHash01, BigInt.fromI32(1000));
    handleSetGasbase(gasbaseEvent);

    const id = BigInt.fromI32(1);
    let offerWrite = createOfferWriteEvent(olKeyHash01, maker, BigInt.fromI32(1000), BigInt.fromI32(2000), BigInt.fromI32(0), BigInt.fromI32(0), id);
    handleOfferWrite(offerWrite);

    let offerId = getOfferId(olKeyHash01, id);
    const offer = Offer.load(offerId)!;
    assert.fieldEquals("Offer", offerId, "offerId", "1");
    assert.fieldEquals("Offer", offerId, "latestTransactionHash", offerWrite.transaction.hash.toHexString());
    assert.fieldEquals("Offer", offerId, "latestLogIndex", offerWrite.logIndex.toString());
    assert.fieldEquals("Offer", offerId, "tick", "1000");
    assert.fieldEquals("Offer", offerId, "gives", "2000");
    assert.fieldEquals("Offer", offerId, "gasprice", "0");
    assert.fieldEquals("Offer", offerId, "gasreq", "0");
    assert.fieldEquals("Offer", offerId, "gasBase", "1000");
    assert.fieldEquals("Offer", offerId, "totalGot", "0");
    assert.fieldEquals("Offer", offerId, "totalGave", "0");
    assert.fieldEquals("Offer", offerId, "isOpen", "true");
    assert.fieldEquals("Offer", offerId, "isFailed", "false");
    assert.fieldEquals("Offer", offerId, "isFilled", "false");
    assert.fieldEquals("Offer", offerId, "isRetracted", "false");
    assert.assertTrue(offer.posthookFailReason === null);
    assert.assertTrue(offer.failedReason === null);
    assert.fieldEquals("Offer", offerId, "deprovisioned", "false");
    assert.fieldEquals("Offer", offerId, "market", olKeyHash01.toHexString());
    assert.fieldEquals("Offer", offerId, "maker", maker.toHexString());
    assert.assertTrue(offer.kandel === null);
    assert.assertTrue(offer.owner === null);
    assert.fieldEquals("Offer", offerId, "creationDate", "1");
    assert.fieldEquals("Offer", offerId, "latestUpdateDate", "1");
    assert.fieldEquals("Offer", offerId, "latestPenalty", "0");
    assert.fieldEquals("Offer", offerId, "totalPenalty", "0");
    assert.fieldEquals("Account", maker.toHex(), "creationDate", offerWrite.block.timestamp.toI32().toString());
    assert.fieldEquals("Account", maker.toHex(), "latestInteractionDate", offerWrite.block.timestamp.toI32().toString());
  });

  test("Offer, handleOfferWrite, Update existing offer", () => {
    // Open market
    let setActiveEvent = createSetActiveEvent(olKeyHash01, token0, token1, BigInt.fromI32(1), true);
    handleSetActive(setActiveEvent);

    // Set gasbase for market
    const gasbaseEvent = createSetGasbaseEvent(olKeyHash01, BigInt.fromI32(1000));
    handleSetGasbase(gasbaseEvent);

    const id = BigInt.fromI32(1);
    let offerId = getOfferId(olKeyHash01, id);
    createOffer(
      id,
      olKeyHash01,
      Bytes.fromHexString("0x000123"),
      BigInt.fromI32(1),
      BigInt.fromI32(1234),
      BigInt.fromI32(5678),
      BigInt.fromI32(10),
      BigInt.fromI32(20),
      BigInt.fromI32(30),
      false,
      true,
      true,
      true,
      Bytes.fromUTF8("failed reason"),
      Bytes.fromUTF8("posthook fail reason"),
      true,
      maker,
      BigInt.fromI32(100),
      BigInt.fromI32(100),
      BigInt.fromI32(10),
      BigInt.fromI32(20),
      BigInt.fromI32(30),
      BigInt.fromI32(40)
    );

    createLimitOrder(
      "limitOrderId",
      taker,
      0,
      gasbaseEvent.block.timestamp,
      gasbaseEvent.block.timestamp,
      false, // should not be open
      offerId
    );

    const offer = Offer.load(offerId)!;
    offer.limitOrder = "limitOrderId";
    offer.save();

    let offerWrite = createOfferWriteEvent(olKeyHash01, maker, BigInt.fromI32(1000), BigInt.fromI32(2000), BigInt.fromI32(0), BigInt.fromI32(0), id);
    handleOfferWrite(offerWrite);

    assert.fieldEquals("Offer", offerId, "offerId", "1");

    assert.fieldEquals("Offer", offerId, "latestTransactionHash", offerWrite.transaction.hash.toHexString());
    assert.fieldEquals("Offer", offerId, "latestLogIndex", offerWrite.logIndex.toString());
    assert.fieldEquals("Offer", offerId, "tick", "1000");
    assert.fieldEquals("Offer", offerId, "gives", "2000");
    assert.fieldEquals("Offer", offerId, "gasprice", "0");
    assert.fieldEquals("Offer", offerId, "gasreq", "0");
    assert.fieldEquals("Offer", offerId, "gasBase", "1000");
    assert.fieldEquals("Offer", offerId, "isOpen", "true");
    assert.fieldEquals("Offer", offerId, "isFailed", "false");
    assert.fieldEquals("Offer", offerId, "isFilled", "false");
    assert.fieldEquals("Offer", offerId, "isRetracted", "false");
    assert.fieldEquals("Offer", offerId, "failedReason", "null");
    assert.fieldEquals("Offer", offerId, "posthookFailReason", "null");
    assert.fieldEquals("Offer", offerId, "totalGot", "30");
    assert.fieldEquals("Offer", offerId, "totalGave", "40");
    assert.fieldEquals("Offer", offerId, "deprovisioned", "false");
    assert.fieldEquals("Offer", offerId, "market", olKeyHash01.toHexString());
    assert.fieldEquals("Offer", offerId, "maker", maker.toHexString());

    let updatedOffer = Offer.load(offerId)!;

    assert.assertTrue(updatedOffer.kandel === null);
    assert.assertTrue(updatedOffer.owner === null);
    assert.assertTrue(updatedOffer.prevGives === null);
    assert.assertTrue(updatedOffer.prevTick === null);
    assert.fieldEquals("Offer", offerId, "creationDate", "100");
    assert.fieldEquals("Offer", offerId, "latestUpdateDate", "1");
    assert.fieldEquals("Offer", offerId, "latestPenalty", "0");
    assert.fieldEquals("Offer", offerId, "totalPenalty", "20");
    assert.entityCount("Offer", 1);

    assert.fieldEquals("LimitOrder", "limitOrderId", "isOpen", "true");
  });

  test("Order, handleOrderStart", () => {
    const orderStart = createOrderStartEvent(olKeyHash01, taker, BigInt.fromI32(40), BigInt.fromI32(1), false);
    handleOrderStart(orderStart);
    assert.entityCount("Order", 1);

    const orderId = getEventUniqueId(orderStart);
    assert.fieldEquals("Order", orderId, "transactionHash", orderStart.transaction.hash.toHex());
    assert.fieldEquals("Order", orderId, "taker", taker.toHexString());
    assert.fieldEquals("Order", orderId, "takerGot", "0");
    assert.fieldEquals("Order", orderId, "takerGave", "0");
    assert.fieldEquals("Order", orderId, "penalty", "0");
    assert.fieldEquals("Order", orderId, "feePaid", "0");
    assert.fieldEquals("Order", orderId, "market", orderStart.params.olKeyHash.toHexString());
    assert.fieldEquals("Order", orderId, "creationDate", orderStart.block.timestamp.toString());
    assert.fieldEquals("Order", orderId, "fillVolume", "1");
    assert.fieldEquals("Order", orderId, "fillWants", "false");
    assert.fieldEquals("Order", orderId, "maxTick", "40");

    assert.fieldEquals("Stack", "Order", "ids", `|${orderId}`);
  });

  test("Order, handleOrderStart, is clean order", () => {
    const cleanStart = createCleanStartEvent(olKeyHash01, taker, BigInt.fromI32(1));
    handleCleanStart(cleanStart);

    const orderStart = createOrderStartEvent(olKeyHash01, taker, BigInt.fromI32(40), BigInt.fromI32(1), false);
    handleOrderStart(orderStart);
    assert.entityCount("Order", 1);

    const orderId = getEventUniqueId(orderStart);
    assert.fieldEquals("Order", orderId, "transactionHash", orderStart.transaction.hash.toHex());
    assert.fieldEquals("Order", orderId, "taker", taker.toHexString());
    assert.fieldEquals("Order", orderId, "takerGot", "0");
    assert.fieldEquals("Order", orderId, "takerGave", "0");
    assert.fieldEquals("Order", orderId, "penalty", "0");
    assert.fieldEquals("Order", orderId, "feePaid", "0");
    assert.fieldEquals("Order", orderId, "market", orderStart.params.olKeyHash.toHexString());
    assert.fieldEquals("Order", orderId, "creationDate", orderStart.block.timestamp.toString());
    assert.fieldEquals("Order", orderId, "fillVolume", "1");
    assert.fieldEquals("Order", orderId, "fillWants", "false");
    assert.fieldEquals("Order", orderId, "maxTick", "40");
    assert.fieldEquals("Order", orderId, "cleanOrder", getEventUniqueId(cleanStart));

    assert.fieldEquals("Stack", "Order", "ids", `|${orderId}`);
  });

  test("Order, handleOrderStart, is limit order", () => {
    const limitOrderStart = createMangroveOrderStartEvent(
      olKeyHash01,
      taker,
      BigInt.fromI32(1),
      BigInt.fromI32(1),
      true,
      BigInt.fromI32(0),
      BigInt.fromI32(0),
      Address.zero(),
      Address.zero()
    );
    handleMangroveOrderStart(limitOrderStart);

    const orderStart = createOrderStartEvent(olKeyHash01, taker, BigInt.fromI32(40), BigInt.fromI32(1), false);
    handleOrderStart(orderStart);
    assert.entityCount("Order", 1);

    const orderId = getEventUniqueId(orderStart);
    assert.fieldEquals("Order", orderId, "transactionHash", orderStart.transaction.hash.toHex());
    assert.fieldEquals("Order", orderId, "taker", taker.toHexString());
    assert.fieldEquals("Order", orderId, "takerGot", "0");
    assert.fieldEquals("Order", orderId, "takerGave", "0");
    assert.fieldEquals("Order", orderId, "penalty", "0");
    assert.fieldEquals("Order", orderId, "feePaid", "0");
    assert.fieldEquals("Order", orderId, "market", orderStart.params.olKeyHash.toHexString());
    assert.fieldEquals("Order", orderId, "creationDate", orderStart.block.timestamp.toString());
    assert.fieldEquals("Order", orderId, "fillVolume", "1");
    assert.fieldEquals("Order", orderId, "fillWants", "false");
    assert.fieldEquals("Order", orderId, "maxTick", "40");
    assert.fieldEquals("Order", orderId, "limitOrder", getEventUniqueId(limitOrderStart));

    assert.fieldEquals("LimitOrder", getEventUniqueId(limitOrderStart), "order", orderId);

    assert.fieldEquals("Stack", "Order", "ids", `|${orderId}`);
  });

  test("Order, handleOrderComplete", () => {
    createDummyOffer(BigInt.fromI32(1), olKeyHash01);
    const orderStart = createOrderStartEvent(olKeyHash01, taker, BigInt.fromI32(40), BigInt.fromI32(1), false);
    handleOrderStart(orderStart);

    const offerSuccessEvent = createOfferSuccessEvent(olKeyHash01, BigInt.fromI32(1), taker, BigInt.fromI32(20), BigInt.fromI32(40));
    handleOfferSuccess(offerSuccessEvent);

    const orderComplete = createOrderCompleteEvent(olKeyHash01, taker, BigInt.fromI32(20));
    handleOrderComplete(orderComplete);
    assert.entityCount("Order", 1);

    const orderId = getEventUniqueId(orderStart);
    assert.fieldEquals("Order", orderId, "transactionHash", orderStart.transaction.hash.toHex());
    assert.fieldEquals("Order", orderId, "taker", taker.toHexString());
    assert.fieldEquals("Order", orderId, "takerGot", "20");
    assert.fieldEquals("Order", orderId, "takerGave", "40");
    assert.fieldEquals("Order", orderId, "penalty", "0");
    assert.fieldEquals("Order", orderId, "feePaid", "20");
    assert.fieldEquals("Order", orderId, "market", orderComplete.params.olKeyHash.toHexString());

    assert.fieldEquals("Stack", "Order", "ids", ``);
    assert.fieldEquals("Account", taker.toHex(), "creationDate", orderComplete.block.timestamp.toI32().toString());
    assert.fieldEquals("Account", taker.toHex(), "latestInteractionDate", orderComplete.block.timestamp.toI32().toString());

    const accountVolumeByPairId = getAccountVolumeByPairId(taker, token0, token1, false);
    assert.fieldEquals("AccountVolumeByPair", accountVolumeByPairId, "account", taker.toHexString());
    assert.fieldEquals("AccountVolumeByPair", accountVolumeByPairId, "token0", token0.toHexString());
    assert.fieldEquals("AccountVolumeByPair", accountVolumeByPairId, "token1", token1.toHexString());
    assert.fieldEquals("AccountVolumeByPair", accountVolumeByPairId, "token0Sent", "0");
    assert.fieldEquals("AccountVolumeByPair", accountVolumeByPairId, "token1Sent", "40");
    assert.fieldEquals("AccountVolumeByPair", accountVolumeByPairId, "token0Received", "20");
    assert.fieldEquals("AccountVolumeByPair", accountVolumeByPairId, "token1Received", "0");
  });

  test("Order, handleCleanStart", () => {
    const cleanOrderStart = createCleanStartEvent(olKeyHash01, taker, BigInt.fromI32(1));
    handleCleanStart(cleanOrderStart);
    assert.entityCount("CleanOrder", 1);

    const cleanOrderId = getEventUniqueId(cleanOrderStart);
    assert.fieldEquals("CleanOrder", cleanOrderId, "transactionHash", cleanOrderStart.transaction.hash.toHex());
    assert.fieldEquals("CleanOrder", cleanOrderId, "taker", taker.toHexString());
    assert.fieldEquals("CleanOrder", cleanOrderId, "market", cleanOrderStart.params.olKeyHash.toHexString());
    assert.fieldEquals("CleanOrder", cleanOrderId, "creationDate", cleanOrderStart.block.timestamp.toString());
    assert.fieldEquals("CleanOrder", cleanOrderId, "offersToBeCleaned", `1`);
  });

  test("Order, handleCleanComplete", () => {
    createDummyOffer(BigInt.fromI32(1), olKeyHash01);

    const cleanOrderStart = createCleanStartEvent(olKeyHash01, taker, BigInt.fromI32(1));
    handleCleanStart(cleanOrderStart);
    const orderStartEvent = createOrderStartEvent(olKeyHash01, taker, BigInt.fromI32(40), BigInt.fromI32(1), false);
    handleOrderStart(orderStartEvent);

    const offerSuccessEvent = createOfferSuccessEvent(olKeyHash01, BigInt.fromI32(1), taker, BigInt.fromI32(20), BigInt.fromI32(40));
    handleOfferSuccess(offerSuccessEvent);

    const orderCompleteEvent = createOrderCompleteEvent(olKeyHash01, taker, BigInt.fromI32(20));
    handleOrderComplete(orderCompleteEvent);

    const cleanOrderComplete = createCleanCompleteEvent();
    handleCleanComplete(cleanOrderComplete);

    assert.fieldEquals("CleanOrder", getEventUniqueId(cleanOrderStart), "offersToBeCleaned", `1`);
  });

  test("Market, handleSetActive, true, then false", () => {
    const marketId = olKeyHash01.toHexString();
    const market = Market.load(marketId);
    assert.assertNotNull(market);

    assert.fieldEquals("Market", marketId, "active", "true");

    const setActiveEvent = createSetActiveEvent(olKeyHash01, token0, token1, BigInt.fromI32(1), false);
    handleSetActive(setActiveEvent);

    assert.fieldEquals("Market", marketId, "active", "false");
    assert.fieldEquals("Market", marketId, "inbound_tkn", token1.toHexString());
    assert.fieldEquals("Market", marketId, "outbound_tkn", token0.toHexString());
    assert.fieldEquals("Market", marketId, "tickSpacing", "1");
  });

  test("Market, handleSetActive, true, then false", () => {
    const marketId = olKeyHash01.toHexString();
    const market = Market.load(marketId);
    assert.assertNotNull(market);

    assert.fieldEquals("Market", marketId, "active", "true");

    const setActiveEvent = createSetActiveEvent(olKeyHash01, token0, token1, BigInt.fromI32(1), false);
    handleSetActive(setActiveEvent);

    assert.fieldEquals("Market", marketId, "active", "false");
  });

  test("Market, handleSetGasBase, new gasbase", () => {
    const setGasBase = createSetGasbaseEvent(olKeyHash01, BigInt.fromI32(20));
    handleSetGasbase(setGasBase);
    assert.entityCount("Market", 2);

    const gasbaseId = olKeyHash01.toHexString();
    assert.fieldEquals("Market", gasbaseId, "gasbase", "20");
    assert.fieldEquals("Market", gasbaseId, "inbound_tkn", token1.toHexString());
    assert.fieldEquals("Market", gasbaseId, "outbound_tkn", token0.toHexString());
  });

  test("Market, handleSetGasBase, update gasbase", () => {
    const setGasBase1 = createSetGasbaseEvent(olKeyHash01, BigInt.fromI32(20));
    handleSetGasbase(setGasBase1);
    assert.entityCount("Market", 2);

    const setGasBase2 = createSetGasbaseEvent(olKeyHash01, BigInt.fromI32(40));
    handleSetGasbase(setGasBase2);

    assert.fieldEquals("Market", olKeyHash01.toHexString(), "gasbase", "40");
    assert.entityCount("Market", 2);
  });
});
