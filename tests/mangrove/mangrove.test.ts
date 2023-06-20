import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import {
  afterEach,
  assert,
  beforeEach,
  clearStore,
  describe,
  test
} from "matchstick-as/assembly/index";
import { Kandel, LimitOrder, Market, Offer, Order } from "../../generated/schema";
import { createOffer, getEventUniqueId, getMarketId, getOfferId } from "../../src/helpers";
import { createNewOffer, handleOfferFail, handleOfferRetract, handleOfferSuccess, handleOfferWrite, handleOrderComplete, handleOrderStart, handlePosthookFail, handleSetActive, handleSetGasbase } from "../../src/mangrove";
import { createOfferFailEvent, createOfferRetractEvent, createOfferSuccessEvent, createOfferWriteEvent, createOrderCompleteEvent, createOrderStartEvent, createPosthookFailEvent, createSetActiveEvent, createSetGasbaseEvent } from "./mangrove-utils";

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

let token0 = Address.fromString("0x0000000000000000000000000000000000000000");
let token1 = Address.fromString("0x0000000000000000000000000000000000000001");
let maker = Address.fromString("0x0000000000000000000000000000000000000002")
let taker = Address.fromString("0x0000000000000000000000000000000000000003")
let owner = Address.fromString("0x0000000000000000000000000000000000000004")

describe("Describe entity assertions", () => {
  beforeEach(() => {
    let setActiveEvent = createSetActiveEvent(token0, token1, true);
    handleSetActive(setActiveEvent);
    assert.entityCount("Market", 1);

    setActiveEvent = createSetActiveEvent(token1, token0, true);
    handleSetActive(setActiveEvent);
    assert.entityCount("Market", 2);
  })

  afterEach(() => {
    clearStore()
  })

  test("Market, handleSetActive, true, then false", () => {
    const marketId = getMarketId(token0, token1)
    const market = Market.load(marketId);
    assert.assertNotNull(market);

    assert.fieldEquals('Market', marketId, 'active', 'true');

    const setActiveEvent = createSetActiveEvent(token0, token1, false);
    handleSetActive(setActiveEvent);
    
    assert.fieldEquals('Market', marketId, 'active', 'false');
  });

  // test offer write, offer retract, offer success and offer fail individually

  test("Offer, handleOfferWrite, Create new offer", () => {
    // Open market
    let setActiveEvent = createSetActiveEvent(token0, token1, true);
    handleSetActive(setActiveEvent);

    const gasbaseEvent =  createSetGasbaseEvent(token0, token1, BigInt.fromI32(1000));
    handleSetGasbase(gasbaseEvent);

    const id = BigInt.fromI32(1);
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

    let offerId = getOfferId(token0, token1, id);
    const offer = Offer.load(offerId)!;
    assert.fieldEquals('Offer', offerId, 'offerId', '1');
    assert.fieldEquals('Offer', offerId, 'latestTransactionHash', offerWrite.transaction.hash.toHexString())
    assert.fieldEquals('Offer', offerId, 'wants', '1000');
    assert.fieldEquals('Offer', offerId, 'gives', '2000');
    assert.fieldEquals('Offer', offerId, 'gasprice', '0');
    assert.fieldEquals('Offer', offerId, 'gasreq', '0');
    assert.fieldEquals('Offer', offerId, 'gasBase', '1000');
    assert.fieldEquals('Offer', offerId, 'prev', '0');
    assert.fieldEquals('Offer', offerId, 'isOpen', 'true');
    assert.fieldEquals('Offer', offerId, 'isFailed', 'false');
    assert.fieldEquals('Offer', offerId, 'isFilled', 'false');
    assert.fieldEquals('Offer', offerId, 'isRetracted', 'false');
    assert.assertTrue(offer.posthookFailReason === null)
    assert.assertTrue(offer.failedReason === null)
    assert.fieldEquals('Offer', offerId, 'deprovisioned', 'false');
    assert.fieldEquals('Offer', offerId, 'market', getMarketId(token0, token1));
    assert.fieldEquals('Offer', offerId, 'maker', maker.toHexString());
    assert.assertTrue(offer.kandel === null)
    assert.assertTrue(offer.owner === null)
    assert.fieldEquals('Offer', offerId, 'creationDate', '1')
    assert.fieldEquals('Offer', offerId, 'latestUpdateDate', '1')
    

  })

  test("Offer, handleOfferWrite, Update exsiting offer", () => {
    // Open market
    let setActiveEvent = createSetActiveEvent(token0, token1, true);
    handleSetActive(setActiveEvent);

    // Set gasbase for market
    const gasbaseEvent =  createSetGasbaseEvent(token0, token1, BigInt.fromI32(1000));
    handleSetGasbase(gasbaseEvent);

    const id = BigInt.fromI32(1);
    let offerId = getOfferId(token0, token1, id);

    createOffer(
      id,
      token1,
      token0,
      Bytes.fromHexString('0x000123'),
      BigInt.fromI32(1),
      BigInt.fromI32(1234),
      BigInt.fromI32(5678),
      BigInt.fromI32(10),
      BigInt.fromI32(20),
      BigInt.fromI32(30),
      BigInt.fromI32(40),
      false,
      true,
      true,
      true,
      Bytes.fromUTF8('failed reason'),
      Bytes.fromUTF8('posthook fail reason'),
      true,
      maker,
      BigInt.fromI32(100),
      BigInt.fromI32(100),
      BigInt.fromI32(0),
      BigInt.fromI32(0),
    )

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

    assert.fieldEquals('Offer', offerId, 'offerId', '1');
    
    assert.fieldEquals('Offer', offerId, 'latestTransactionHash', offerWrite.transaction.hash.toHexString())
    assert.fieldEquals('Offer', offerId, 'wants', '1000');
    assert.fieldEquals('Offer', offerId, 'gives', '2000');
    assert.fieldEquals('Offer', offerId, 'gasprice', '0');
    assert.fieldEquals('Offer', offerId, 'gasreq', '0');
    assert.fieldEquals('Offer', offerId, 'gasBase', '1000');
    assert.fieldEquals('Offer', offerId, 'prev', '0');
    assert.fieldEquals('Offer', offerId, 'isOpen', 'true');
    assert.fieldEquals('Offer', offerId, 'isFailed', 'false');
    assert.fieldEquals('Offer', offerId, 'isFilled', 'false');
    assert.fieldEquals('Offer', offerId, 'isRetracted', 'false');
    assert.fieldEquals('Offer', offerId, 'failedReason', 'null');
    assert.fieldEquals('Offer', offerId, 'posthookFailReason', 'null');
    assert.fieldEquals('Offer', offerId, 'totalGot', '0');
    assert.fieldEquals('Offer', offerId, 'totalGave', '0');
    assert.fieldEquals('Offer', offerId, 'deprovisioned', 'false');
    assert.fieldEquals('Offer', offerId, 'market', getMarketId(token0, token1));
    assert.fieldEquals('Offer', offerId, 'maker', maker.toHexString());
    let updatedOffer = Offer.load(offerId)!;
    assert.assertTrue(updatedOffer.kandel === null)
    assert.assertTrue(updatedOffer.owner === null)
    assert.assertTrue(updatedOffer.prevGives === null)
    assert.assertTrue(updatedOffer.prevWants === null)
    assert.fieldEquals('Offer', offerId, 'creationDate', '100')
    assert.fieldEquals('Offer', offerId, 'latestUpdateDate', '1')
    assert.entityCount("Offer", 1);
  });

  test('createNewOffer method, no kandel maker', () => {
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
    const offer = createNewOffer(offerWrite)
    assert.entityCount("Offer", 0);
    assert.assertTrue( offer.kandel === null)
  })

  test('createNewOffer method, have kandel maker', () => {
    const kandel =new Kandel(maker);
    kandel.transactionHash = Bytes.fromHexString('0x000123');
    kandel.seeder = Bytes.fromUTF8('seeder');
    kandel.address = Bytes.fromUTF8('address');
    kandel.base = token0;
    kandel.quote = token1;
    kandel.depositedBase = BigInt.fromI32(0);
    kandel.depositedQuote = BigInt.fromI32(0);
    kandel.totalBase = BigInt.fromI32(0);
    kandel.totalQuote = BigInt.fromI32(0);
    kandel.deployer = Bytes.fromUTF8('owner');
    kandel.admin = Bytes.fromUTF8('admin');
    kandel.offerIndexes = [];
    kandel.save()
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
    const offer = createNewOffer(offerWrite)
    assert.entityCount("Offer", 0);
    assert.assertTrue( offer.kandel!.toHexString() == kandel.id.toHexString())
  })

  test("Offer, handleOfferFail", () => {

    const id = BigInt.fromI32(1);
    let offerId = getOfferId(token0, token1, id);

    createOffer(
      id,
      token1,
      token0,
      Bytes.fromHexString('0x000123'),
      BigInt.fromI32(1),
      BigInt.fromI32(1234),
      BigInt.fromI32(5678),
      BigInt.fromI32(10),
      BigInt.fromI32(20),
      BigInt.fromI32(30),
      BigInt.fromI32(40),
      true,
      false,
      false,
      false,
      Bytes.fromUTF8('failed reason'),
      Bytes.fromUTF8('posthook fail reason'),
      false,
      maker,
      BigInt.fromI32(100),
      BigInt.fromI32(100),
      BigInt.fromI32(0),
      BigInt.fromI32(0),
    )

    let offerFail = createOfferFailEvent(
      token0,
      token1,
      id,
      taker,
      BigInt.fromI32(2000), 
      BigInt.fromI32(1000), 
      Bytes.fromUTF8("Failed"),
    );
    handleOfferFail(offerFail);

    assert.fieldEquals('Offer', offerId, 'offerId', '1');
    
    assert.fieldEquals('Offer', offerId, 'latestTransactionHash', offerFail.transaction.hash.toHexString());
    assert.fieldEquals('Offer', offerId, 'wants', '1234');
    assert.fieldEquals('Offer', offerId, 'gives', '5678');
    assert.fieldEquals('Offer', offerId, 'gasprice', '0');
    assert.fieldEquals('Offer', offerId, 'gasreq', '20');
    assert.fieldEquals('Offer', offerId, 'gasBase', '30');
    assert.fieldEquals('Offer', offerId, 'prev', '40');
    assert.fieldEquals('Offer', offerId, 'isOpen', 'false');
    assert.fieldEquals('Offer', offerId, 'isFailed', 'true');
    assert.fieldEquals('Offer', offerId, 'isFilled', 'false');
    assert.fieldEquals('Offer', offerId, 'isRetracted', 'false');
    assert.fieldEquals('Offer', offerId, 'failedReason', Bytes.fromUTF8("Failed").toHexString());
    assert.fieldEquals('Offer', offerId, 'posthookFailReason', 'null');
    assert.fieldEquals('Offer', offerId, 'totalGot', '0');
    assert.fieldEquals('Offer', offerId, 'totalGave', '0');
    assert.fieldEquals('Offer', offerId, 'deprovisioned', 'false');
    assert.fieldEquals('Offer', offerId, 'market', getMarketId(token0, token1));
    assert.fieldEquals('Offer', offerId, 'maker', maker.toHexString());
    let updatedOffer = Offer.load(offerId)!;
    assert.assertTrue(updatedOffer.prevGives === null)
    assert.assertTrue(updatedOffer.prevWants === null)
    assert.assertTrue(updatedOffer.kandel === null)
    assert.assertTrue(updatedOffer.owner === null)
    assert.fieldEquals('Offer', offerId, 'creationDate', '100')
    assert.fieldEquals('Offer', offerId, 'latestUpdateDate', '1')
    assert.entityCount("Offer", 1);
  });

  test("Offer, handleOfferSuccess, partial fill", () => {

    const id = BigInt.fromI32(1);
    let offerId = getOfferId(token0, token1, id);

    createOffer(
      id,
      token1,
      token0,
      Bytes.fromHexString('0x000123'),
      BigInt.fromI32(1),
      BigInt.fromI32(40),
      BigInt.fromI32(20),
      BigInt.fromI32(10),
      BigInt.fromI32(20),
      BigInt.fromI32(30),
      BigInt.fromI32(40),
      true,
      false,
      false,
      false,
      Bytes.fromUTF8('failed reason'),
      Bytes.fromUTF8('posthook fail reason'),
      false,
      maker,
      BigInt.fromI32(100),
      BigInt.fromI32(100),
      BigInt.fromI32(0),
      BigInt.fromI32(0),
    )


    let offerSuccess = createOfferSuccessEvent(token0, token1, id, taker, BigInt.fromI32(10), BigInt.fromI32(20));
    handleOfferSuccess(offerSuccess);

    assert.fieldEquals('Offer', offerId, 'offerId', '1');
    
    assert.fieldEquals('Offer', offerId, 'latestTransactionHash', offerSuccess.transaction.hash.toHexString());
    // TODO: de we want to update the wants and gives?
    assert.fieldEquals('Offer', offerId, 'wants', '40');
    assert.fieldEquals('Offer', offerId, 'gives', '0');
    assert.fieldEquals('Offer', offerId, 'gasprice', '10');
    assert.fieldEquals('Offer', offerId, 'gasreq', '20');
    assert.fieldEquals('Offer', offerId, 'gasBase', '30');
    assert.fieldEquals('Offer', offerId, 'prev', '40');
    assert.fieldEquals('Offer', offerId, 'isOpen', 'false');
    assert.fieldEquals('Offer', offerId, 'isFailed', 'false');
    assert.fieldEquals('Offer', offerId, 'isFilled', 'false');
    assert.fieldEquals('Offer', offerId, 'isRetracted', 'false');
    assert.fieldEquals('Offer', offerId, 'failedReason', 'null');
    assert.fieldEquals('Offer', offerId, 'posthookFailReason', 'null');
    assert.fieldEquals('Offer', offerId, 'totalGot', '20');
    assert.fieldEquals('Offer', offerId, 'totalGave', '10');
    assert.fieldEquals('Offer', offerId, 'prevGives', '20');
    assert.fieldEquals('Offer', offerId, 'prevWants', '40');
    assert.fieldEquals('Offer', offerId, 'deprovisioned', 'false');
    assert.fieldEquals('Offer', offerId, 'market', getMarketId(token0, token1));
    assert.fieldEquals('Offer', offerId, 'maker', maker.toHexString());
    let updatedOffer = Offer.load(offerId)!;
    assert.assertTrue(updatedOffer.kandel === null)
    assert.assertTrue(updatedOffer.owner === null)
    assert.fieldEquals('Offer', offerId, 'creationDate', '100')
    assert.fieldEquals('Offer', offerId, 'latestUpdateDate', '1')
    assert.entityCount("Offer", 1);
  });


  test("Offer, handleOfferSuccess, fully fill", () => {
    const id = BigInt.fromI32(1);
    let offerId = getOfferId(token0, token1, id);

    const orderId ="orderId"
    const order = new Order(orderId);
    order.transactionHash = Bytes.fromUTF8("0x0");
    order.creationDate = BigInt.fromI32(100);
    order.takerGot = BigInt.fromI32(100);
    order.takerGave = BigInt.fromI32(50);
    order.save();


    const limitOrder = new LimitOrder(offerId)
    limitOrder.wants = BigInt.fromI32(1000);
    limitOrder.gives = BigInt.fromI32(500);
    limitOrder.realTaker = taker;
    limitOrder.expiryDate = BigInt.fromI32(0);
    limitOrder.fillOrKill = false;
    limitOrder.fillWants = false;
    limitOrder.restingOrder = true;
    limitOrder.offer = offerId;
    limitOrder.creationDate = BigInt.fromI32(100);
    limitOrder.latestUpdateDate = BigInt.fromI32(1);
    limitOrder.order = orderId;
    limitOrder.save();



    createOffer(
      id,
      token1,
      token0,
      Bytes.fromHexString('0x000123'),
      BigInt.fromI32(1),
      BigInt.fromI32(40),
      BigInt.fromI32(20),
      BigInt.fromI32(10),
      BigInt.fromI32(20),
      BigInt.fromI32(30),
      BigInt.fromI32(40),
      true,
      true,
      false,
      true,
      Bytes.fromUTF8('failed reason'),
      Bytes.fromUTF8('posthook fail reason'),
      false,
      maker,
      BigInt.fromI32(100),
      BigInt.fromI32(100),
      BigInt.fromI32(20),
      BigInt.fromI32(30),
    )

    let offerSuccess = createOfferSuccessEvent(token0, token1, id, taker, BigInt.fromI32(20), BigInt.fromI32(40));
    handleOfferSuccess(offerSuccess);

    assert.fieldEquals('Offer', offerId, 'offerId', '1');
    
    assert.fieldEquals('Offer', offerId, 'latestTransactionHash', offerSuccess.transaction.hash.toHexString());
    assert.fieldEquals('Offer', offerId, 'wants', '40');
    assert.fieldEquals('Offer', offerId, 'gives', '0');
    assert.fieldEquals('Offer', offerId, 'gasprice', '10');
    assert.fieldEquals('Offer', offerId, 'gasreq', '20');
    assert.fieldEquals('Offer', offerId, 'gasBase', '30');
    assert.fieldEquals('Offer', offerId, 'prev', '40');
    assert.fieldEquals('Offer', offerId, 'isOpen', 'false');
    assert.fieldEquals('Offer', offerId, 'isFailed', 'false');
    assert.fieldEquals('Offer', offerId, 'isFilled', 'true');
    assert.fieldEquals('Offer', offerId, 'isRetracted', 'false');
    assert.fieldEquals('Offer', offerId, 'failedReason', 'null');
    assert.fieldEquals('Offer', offerId, 'posthookFailReason', 'null');
    assert.fieldEquals('Offer', offerId, 'totalGot', '60');
    assert.fieldEquals('Offer', offerId, 'totalGave', '50');
    assert.fieldEquals('Offer', offerId, 'prevGives', '20');
    assert.fieldEquals('Offer', offerId, 'prevWants', '40');
    assert.fieldEquals('Offer', offerId, 'deprovisioned', 'false');
    assert.fieldEquals('Offer', offerId, 'market', getMarketId(token0, token1));
    assert.fieldEquals('Offer', offerId, 'maker', maker.toHexString());
    let updatedOffer = Offer.load(offerId)!;
    assert.assertTrue(updatedOffer.kandel === null)
    assert.assertTrue(updatedOffer.owner === null)
    assert.fieldEquals('Offer', offerId, 'creationDate', '100')
    assert.fieldEquals('Offer', offerId, 'latestUpdateDate', '1')
    assert.entityCount("Offer", 1);
  });

  test("Offer, handleOfferRetract, with deporivison", () => {
    const id = BigInt.fromI32(1);
    let offerId = getOfferId(token0, token1, id);

    createOffer(
      id,
      token1,
      token0,
      Bytes.fromHexString('0x000123'),
      BigInt.fromI32(1),
      BigInt.fromI32(40),
      BigInt.fromI32(20),
      BigInt.fromI32(10),
      BigInt.fromI32(20),
      BigInt.fromI32(30),
      BigInt.fromI32(40),
      true,
      true,
      true,
      false,
      Bytes.fromUTF8('failed reason'),
      Bytes.fromUTF8('posthook fail reason'),
      false,
      maker,
      BigInt.fromI32(100),
      BigInt.fromI32(100),
      BigInt.fromI32(0),
      BigInt.fromI32(0),
    )

    let offerRetract = createOfferRetractEvent(token0, token1, id, true);
    handleOfferRetract(offerRetract);

    assert.fieldEquals('Offer', offerId, 'offerId', '1');
    
    assert.fieldEquals('Offer', offerId, 'latestTransactionHash', offerRetract.transaction.hash.toHexString())
    // TODO: de we want to update the wants and gives?
    assert.fieldEquals('Offer', offerId, 'wants', '40');
    assert.fieldEquals('Offer', offerId, 'gives', '20');
    assert.fieldEquals('Offer', offerId, 'gasprice', '0');
    assert.fieldEquals('Offer', offerId, 'gasreq', '20');
    assert.fieldEquals('Offer', offerId, 'gasBase', '30');
    assert.fieldEquals('Offer', offerId, 'prev', '40');
    assert.fieldEquals('Offer', offerId, 'isOpen', 'false');
    assert.fieldEquals('Offer', offerId, 'isFailed', 'false');
    assert.fieldEquals('Offer', offerId, 'isFilled', 'false');
    assert.fieldEquals('Offer', offerId, 'isRetracted', 'true');
    assert.fieldEquals('Offer', offerId, 'failedReason', 'null');
    assert.fieldEquals('Offer', offerId, 'posthookFailReason', 'null');
    assert.fieldEquals('Offer', offerId, 'totalGot', '0');
    assert.fieldEquals('Offer', offerId, 'totalGave', '0');
    assert.fieldEquals('Offer', offerId, 'deprovisioned', 'true');
    assert.fieldEquals('Offer', offerId, 'market', getMarketId(token0, token1));
    assert.fieldEquals('Offer', offerId, 'maker', maker.toHexString());
    let updatedOffer = Offer.load(offerId)!;
    assert.assertTrue(updatedOffer.prevGives === null)
    assert.assertTrue(updatedOffer.prevWants === null)
    assert.assertTrue(updatedOffer.kandel === null)
    assert.assertTrue(updatedOffer.owner === null)
    assert.fieldEquals('Offer', offerId, 'creationDate', '100')
    assert.fieldEquals('Offer', offerId, 'latestUpdateDate', '1')
    assert.entityCount("Offer", 1);
  })

  test("Offer, handleOfferRetract, no deporivison", () => {
    const id = BigInt.fromI32(1);
    let offerId = getOfferId(token0, token1, id);

    createOffer(
      id,
      token1,
      token0,
      Bytes.fromHexString('0x000123'),
      BigInt.fromI32(1),
      BigInt.fromI32(40),
      BigInt.fromI32(20),
      BigInt.fromI32(10),
      BigInt.fromI32(20),
      BigInt.fromI32(30),
      BigInt.fromI32(40),
      true,
      true,
      true,
      false,
      Bytes.fromUTF8('failed reason'),
      Bytes.fromUTF8('posthook fail reason'),
      false,
      maker,
      BigInt.fromI32(100),
      BigInt.fromI32(100),
      BigInt.fromI32(0),
      BigInt.fromI32(0),
    )

    let offerRetract = createOfferRetractEvent(token0, token1, id, false);
    handleOfferRetract(offerRetract);

    assert.fieldEquals('Offer', offerId, 'offerId', '1');
    
    assert.fieldEquals('Offer', offerId, 'latestTransactionHash', offerRetract.transaction.hash.toHexString())
    // TODO: de we want to update the wants and gives?
    assert.fieldEquals('Offer', offerId, 'wants', '40');
    assert.fieldEquals('Offer', offerId, 'gives', '20');
    assert.fieldEquals('Offer', offerId, 'gasprice', '10');
    assert.fieldEquals('Offer', offerId, 'gasreq', '20');
    assert.fieldEquals('Offer', offerId, 'gasBase', '30');
    assert.fieldEquals('Offer', offerId, 'prev', '40');
    assert.fieldEquals('Offer', offerId, 'isOpen', 'false');
    assert.fieldEquals('Offer', offerId, 'isFailed', 'false');
    assert.fieldEquals('Offer', offerId, 'isFilled', 'false');
    assert.fieldEquals('Offer', offerId, 'isRetracted', 'true');
    assert.fieldEquals('Offer', offerId, 'failedReason', 'null');
    assert.fieldEquals('Offer', offerId, 'posthookFailReason', 'null');
    assert.fieldEquals('Offer', offerId, 'totalGot', '0');
    assert.fieldEquals('Offer', offerId, 'totalGave', '0');
    assert.fieldEquals('Offer', offerId, 'deprovisioned', 'false');
    assert.fieldEquals('Offer', offerId, 'market', getMarketId(token0, token1));
    assert.fieldEquals('Offer', offerId, 'maker', maker.toHexString());
    let updatedOffer = Offer.load(offerId)!;
    assert.assertTrue(updatedOffer.prevGives === null)
    assert.assertTrue(updatedOffer.prevWants === null)
    assert.assertTrue(updatedOffer.kandel === null)
    assert.assertTrue(updatedOffer.owner === null)
    assert.fieldEquals('Offer', offerId, 'creationDate', '100')
    assert.fieldEquals('Offer', offerId, 'latestUpdateDate', '1')
    assert.entityCount("Offer", 1);
  })


  test("Offer, handlePosthookFail", () => {
    const id = BigInt.fromI32(1);
    let offerId = getOfferId(token0, token1, id);

    createOffer(
      id,
      token1,
      token0,
      Bytes.fromHexString('0x000123'),
      BigInt.fromI32(1),
      BigInt.fromI32(40),
      BigInt.fromI32(20),
      BigInt.fromI32(10),
      BigInt.fromI32(20),
      BigInt.fromI32(30),
      BigInt.fromI32(40),
      false,
      false,
      false,
      false,
      null,
      Bytes.fromUTF8('posthook fail reason'),
      false,
      maker,
      BigInt.fromI32(100),
      BigInt.fromI32(100),
      BigInt.fromI32(0),
      BigInt.fromI32(0),
    )

    let posthookFailed = createPosthookFailEvent(token0, token1, id, Bytes.fromUTF8("Failed")    );
    handlePosthookFail(posthookFailed);

    assert.fieldEquals('Offer', offerId, 'offerId', '1');
    //TODO: do we want to update the transaction hash?
    assert.fieldEquals('Offer', offerId, 'latestTransactionHash', '0x000123')
    // TODO: de we want to update the wants and gives?
    assert.fieldEquals('Offer', offerId, 'wants', '40');
    assert.fieldEquals('Offer', offerId, 'gives', '20');
    assert.fieldEquals('Offer', offerId, 'gasprice', '10');
    assert.fieldEquals('Offer', offerId, 'gasreq', '20');
    assert.fieldEquals('Offer', offerId, 'gasBase', '30');
    assert.fieldEquals('Offer', offerId, 'prev', '40');
    assert.fieldEquals('Offer', offerId, 'isOpen', 'false');
    assert.fieldEquals('Offer', offerId, 'isFailed', 'false');
    assert.fieldEquals('Offer', offerId, 'isFilled', 'false');
    assert.fieldEquals('Offer', offerId, 'isRetracted', 'false');
    assert.fieldEquals('Offer', offerId, 'failedReason', 'null');
    assert.fieldEquals('Offer', offerId, 'posthookFailReason', Bytes.fromUTF8("Failed").toHexString());
    assert.fieldEquals('Offer', offerId, 'totalGot', '0');
    assert.fieldEquals('Offer', offerId, 'totalGave', '0');
    assert.fieldEquals('Offer', offerId, 'deprovisioned', 'false');
    assert.fieldEquals('Offer', offerId, 'market', getMarketId(token0, token1));
    assert.fieldEquals('Offer', offerId, 'maker', maker.toHexString());
    let updatedOffer = Offer.load(offerId)!;
    assert.assertTrue(updatedOffer.prevGives === null)
    assert.assertTrue(updatedOffer.prevWants === null)
    assert.assertTrue(updatedOffer.kandel === null)
    assert.assertTrue(updatedOffer.owner === null)
    assert.fieldEquals('Offer', offerId, 'creationDate', '100')
    assert.fieldEquals('Offer', offerId, 'latestUpdateDate', '1')
    assert.entityCount("Offer", 1);
  })

 
  test('Order, handleOrderSuccess', () => {
    const orderStart =  createOrderStartEvent()
    handleOrderStart(orderStart)
    assert.entityCount('Order', 1)

    const orderId = getEventUniqueId(orderStart);
    assert.fieldEquals('Order', orderId, 'transactionHash', Bytes.fromUTF8(orderStart.transaction.hash.toHex()).toHexString() )

    assert.fieldEquals('OrderStack', 'orderStack', 'ids',  `|${orderId}` );
  })

  test('Order, handleOrderComplete', () => {
    const orderStart =  createOrderStartEvent()
    handleOrderStart(orderStart)
    const orderComplete =  createOrderCompleteEvent(token1, token0, taker, BigInt.fromI32(20), BigInt.fromI32(40), BigInt.fromI32(1), BigInt.fromI32(2))
    handleOrderComplete(orderComplete)
    assert.entityCount('Order', 1)

    const orderId = getEventUniqueId(orderStart);
    assert.fieldEquals('Order', orderId, 'transactionHash', Bytes.fromUTF8(orderStart.transaction.hash.toHex()).toHexString() )
    assert.fieldEquals('Order', orderId, 'taker', taker.toHexString());
    assert.fieldEquals('Order', orderId, 'takerGot', '20');
    assert.fieldEquals('Order', orderId, 'takerGave', '40');
    assert.fieldEquals('Order', orderId, 'penalty', '1');
    assert.fieldEquals('Order', orderId, 'feePaid', '2');
    assert.fieldEquals('Order', orderId, 'market', getMarketId(orderComplete.params.outbound_tkn, orderComplete.params.inbound_tkn));

    assert.fieldEquals('OrderStack', 'orderStack', 'ids',  `` );
  })

  test('GasBase, handleSetGasBase, new gasbase', () => {
    const setGasBase = createSetGasbaseEvent(token0, token1, BigInt.fromI32(20))
    handleSetGasbase(setGasBase)
    assert.entityCount('Market', 2);

    const gasbaseId = getMarketId(token0, token1);
    assert.fieldEquals('Market', gasbaseId, 'gasbase', '20');
    assert.fieldEquals('Market', gasbaseId, 'inbound_tkn', token1.toHexString());
    assert.fieldEquals('Market', gasbaseId, 'outbound_tkn', token0.toHexString());
  })

  test('GasBase, handleSetGasBase, update gasbase', () => {
    const setGasBase1 = createSetGasbaseEvent(token0, token1, BigInt.fromI32(20))
    handleSetGasbase(setGasBase1)
    assert.entityCount('Market', 2);

    const setGasBase2 = createSetGasbaseEvent(token0, token1, BigInt.fromI32(40))
    handleSetGasbase(setGasBase2)

    const gasbaseId = getMarketId(token0, token1);
    assert.fieldEquals('Market', gasbaseId, 'gasbase', '40');
    assert.entityCount('Market', 2);

  })

});


