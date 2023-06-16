import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import {
  afterEach,
  assert,
  beforeAll,
  clearStore,
  describe,
  test
} from "matchstick-as/assembly/index";
import { Kandel, Market, Offer } from "../../generated/schema";
import { getEventUniqueId, getMarketId, getOfferId } from "../../src/helpers";
import { createNewOffer, handleOfferFail, handleOfferRetract, handleOfferSuccess, handleOfferWrite, handleOrderComplete, handleOrderStart, handleSetActive, handleSetGasbase } from "../../src/mangrove";
import { createOfferFailEvent, createOfferRetractEvent, createOfferSuccessEvent, createOfferWriteEvent, createOrderCompleteEvent, createOrderStartEvent, createSetActiveEvent, createSetGasbaseEvent } from "./mangrove-utils";

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

let token0 = Address.fromString("0x0000000000000000000000000000000000000000");
let token1 = Address.fromString("0x0000000000000000000000000000000000000001");
let maker = Address.fromString("0x0000000000000000000000000000000000000002")
let taker = Address.fromString("0x0000000000000000000000000000000000000003")
let owner = Address.fromString("0x0000000000000000000000000000000000000004")

describe("Describe entity assertions", () => {
  beforeAll(() => {

  })

  afterEach(() => {
    clearStore()
  })

  test("Market, handleSetActive, true, then false", () => {
    let setActiveEvent = createSetActiveEvent(token0, token1, true);
    handleSetActive(setActiveEvent);
    assert.entityCount("Market", 1);

    const marketId = getMarketId(token0, token1)
    const market = Market.load(marketId);
    assert.assertNotNull(market);

    assert.fieldEquals('Market', marketId, 'active', 'true');

    setActiveEvent = createSetActiveEvent(token0, token1, false);
    handleSetActive(setActiveEvent);
    
    assert.fieldEquals('Market', marketId, 'active', 'false');
    assert.entityCount("Market", 1);
  });

  // test offer write, offer retract, offer success and offer fail individually

  test("Offer, handleOfferWrite, Create new offer", () => {
    // Open market
    let setActiveEvent = createSetActiveEvent(token0, token1, true);
    handleSetActive(setActiveEvent);
    assert.entityCount("Market", 1);

    const gasbaseEvent =  createSetGasbaseEvent(token0, token1, BigInt.fromI32(1000));
    handleSetGasbase(gasbaseEvent);
    assert.entityCount('GasBase', 1)

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
    assert.fieldEquals('Offer', offerId, 'transactionHash', offerWrite.transaction.hash.toHexString())
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
    

  })

  test("Offer, handleOfferWrite, Update exsiting offer", () => {
    // Open market
    let setActiveEvent = createSetActiveEvent(token0, token1, true);
    handleSetActive(setActiveEvent);
    assert.entityCount("Market", 1);

    // Set gasbase for market
    const gasbaseEvent =  createSetGasbaseEvent(token0, token1, BigInt.fromI32(1000));
    handleSetGasbase(gasbaseEvent);
    assert.entityCount('GasBase', 1)

    const id = BigInt.fromI32(1);
    let offerId = getOfferId(token0, token1, id);
    let offer = new Offer(offerId);
    offer.offerId = BigInt.fromI32(1);
    offer.transactionHash = Bytes.fromHexString('0x000123');
    offer.wants = BigInt.fromI32(1234);
    offer.gives = BigInt.fromI32(5678);
    offer.gasprice = BigInt.fromI32(10);
    offer.gasreq = BigInt.fromI32(20);
    offer.gasBase = BigInt.fromI32(30);
    offer.prev = BigInt.fromI32(40);
    offer.isOpen = false;
    offer.isFailed = true;
    offer.isFilled = true;
    offer.isRetracted = true;
    offer.failedReason = Bytes.fromUTF8('failed reason');
    offer.posthookFailReason = Bytes.fromUTF8('posthook fail reason');
    offer.deprovisioned = true;
    offer.market = getMarketId(token0, token1);
    offer.maker = maker;
    offer.save();


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
    //TODO: do we want to update the transaction hash?
    assert.fieldEquals('Offer', offerId, 'transactionHash', '0x000123')
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
    assert.fieldEquals('Offer', offerId, 'deprovisioned', 'false');
    assert.fieldEquals('Offer', offerId, 'market', getMarketId(token0, token1));
    assert.fieldEquals('Offer', offerId, 'maker', maker.toHexString());
    let updatedOffer = Offer.load(offerId)!;
    assert.assertTrue(updatedOffer.kandel === null)
    assert.assertTrue(updatedOffer.owner === null)
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
    kandel.owner = Bytes.fromUTF8('owner');
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
    assert.assertTrue( offer.kandel === maker)
  })

  test("Offer, handleOfferFail", () => {

    const id = BigInt.fromI32(1);
    let offerId = getOfferId(token0, token1, id);
    let offer = new Offer(offerId);
    offer.offerId = BigInt.fromI32(1);
    offer.transactionHash = Bytes.fromHexString('0x000123');
    offer.wants = BigInt.fromI32(1234);
    offer.gives = BigInt.fromI32(5678);
    offer.gasprice = BigInt.fromI32(10);
    offer.gasreq = BigInt.fromI32(20);
    offer.gasBase = BigInt.fromI32(30);
    offer.prev = BigInt.fromI32(40);
    offer.isOpen = true;
    offer.isFailed = true;
    offer.isFilled = true;
    offer.isRetracted = true;
    offer.failedReason = Bytes.fromUTF8('failed reason');
    offer.posthookFailReason = Bytes.fromUTF8('posthook fail reason');
    offer.deprovisioned = false;
    offer.market = getMarketId(token0, token1);
    offer.maker = maker;
    offer.save();


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
    //TODO: do we want to update the transaction hash?
    assert.fieldEquals('Offer', offerId, 'transactionHash', '0x000123')
    assert.fieldEquals('Offer', offerId, 'wants', '1234');
    assert.fieldEquals('Offer', offerId, 'gives', '5678');
    assert.fieldEquals('Offer', offerId, 'gasprice', '10');
    assert.fieldEquals('Offer', offerId, 'gasreq', '20');
    assert.fieldEquals('Offer', offerId, 'gasBase', '30');
    assert.fieldEquals('Offer', offerId, 'prev', '40');
    assert.fieldEquals('Offer', offerId, 'isOpen', 'false');
    assert.fieldEquals('Offer', offerId, 'isFailed', 'true');
    assert.fieldEquals('Offer', offerId, 'isFilled', 'false');
    assert.fieldEquals('Offer', offerId, 'isRetracted', 'false');
    assert.fieldEquals('Offer', offerId, 'failedReason', Bytes.fromUTF8("Failed").toHexString());
    assert.fieldEquals('Offer', offerId, 'posthookFailReason', 'null');
    assert.fieldEquals('Offer', offerId, 'market', getMarketId(token0, token1));
    assert.fieldEquals('Offer', offerId, 'maker', maker.toHexString());
    let updatedOffer = Offer.load(offerId)!;
    assert.assertTrue(updatedOffer.kandel === null)
    assert.assertTrue(updatedOffer.owner === null)
    assert.entityCount("Offer", 1);
  });

  test("Offer, handleOfferSuccess, partial fill", () => {

    const id = BigInt.fromI32(1);
    let offerId = getOfferId(token0, token1, id);
    let offer = new Offer(offerId);
    offer.offerId = BigInt.fromI32(1);
    offer.transactionHash = Bytes.fromHexString('0x000123');
    offer.wants = BigInt.fromI32(40);
    offer.gives = BigInt.fromI32(20);
    offer.gasprice = BigInt.fromI32(10);
    offer.gasreq = BigInt.fromI32(20);
    offer.gasBase = BigInt.fromI32(30);
    offer.prev = BigInt.fromI32(40);
    offer.isOpen = true;
    offer.isFailed = true;
    offer.isFilled = true;
    offer.isRetracted = true;
    offer.failedReason = Bytes.fromUTF8('failed reason');
    offer.posthookFailReason = Bytes.fromUTF8('posthook fail reason');
    offer.deprovisioned = false;
    offer.market = getMarketId(token0, token1);
    offer.maker = maker;
    offer.save();


    let offerSuccess = createOfferSuccessEvent(token0, token1, id, taker, BigInt.fromI32(10), BigInt.fromI32(20));
    handleOfferSuccess(offerSuccess);

    assert.fieldEquals('Offer', offerId, 'offerId', '1');
    //TODO: do we want to update the transaction hash?
    assert.fieldEquals('Offer', offerId, 'transactionHash', '0x000123')
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
    assert.fieldEquals('Offer', offerId, 'posthookFailReason', 'null');
    assert.fieldEquals('Offer', offerId, 'market', getMarketId(token0, token1));
    assert.fieldEquals('Offer', offerId, 'maker', maker.toHexString());
    let updatedOffer = Offer.load(offerId)!;
    assert.assertTrue(updatedOffer.kandel === null)
    assert.assertTrue(updatedOffer.owner === null)
    assert.entityCount("Offer", 1);
  });


  test("Offer, handleOfferSuccess, fully fill", () => {

    const id = BigInt.fromI32(1);
    let offerId = getOfferId(token0, token1, id);
    let offer = new Offer(offerId);
    offer.offerId = BigInt.fromI32(1);
    offer.transactionHash = Bytes.fromHexString('0x000123');
    offer.wants = BigInt.fromI32(40);
    offer.gives = BigInt.fromI32(20);
    offer.gasprice = BigInt.fromI32(10);
    offer.gasreq = BigInt.fromI32(20);
    offer.gasBase = BigInt.fromI32(30);
    offer.prev = BigInt.fromI32(40);
    offer.isOpen = true;
    offer.isFailed = true;
    offer.isFilled = false;
    offer.isRetracted = true;
    offer.failedReason = Bytes.fromUTF8('failed reason');
    offer.posthookFailReason = Bytes.fromUTF8('posthook fail reason');
    offer.deprovisioned = false;
    offer.market = getMarketId(token0, token1);
    offer.maker = maker;
    offer.save();


    let offerSuccess = createOfferSuccessEvent(token0, token1, id, taker, BigInt.fromI32(20), BigInt.fromI32(40));
    handleOfferSuccess(offerSuccess);

    assert.fieldEquals('Offer', offerId, 'offerId', '1');
    //TODO: do we want to update the transaction hash?
    assert.fieldEquals('Offer', offerId, 'transactionHash', '0x000123')
    // TODO: de we want to update the wants and gives?
    assert.fieldEquals('Offer', offerId, 'wants', '40');
    assert.fieldEquals('Offer', offerId, 'gives', '20');
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
    assert.fieldEquals('Offer', offerId, 'market', getMarketId(token0, token1));
    assert.fieldEquals('Offer', offerId, 'maker', maker.toHexString());
    let updatedOffer = Offer.load(offerId)!;
    assert.assertTrue(updatedOffer.kandel === null)
    assert.assertTrue(updatedOffer.owner === null)
    assert.entityCount("Offer", 1);
  });

  // test handleOfferRetract
  test("Offer, handleOfferRetract", () => {
    const id = BigInt.fromI32(1);
    let offerId = getOfferId(token0, token1, id);
    let offer = new Offer(offerId);
    offer.offerId = BigInt.fromI32(1);
    offer.transactionHash = Bytes.fromHexString('0x000123');
    offer.wants = BigInt.fromI32(40);
    offer.gives = BigInt.fromI32(20);
    offer.gasprice = BigInt.fromI32(10);
    offer.gasreq = BigInt.fromI32(20);
    offer.gasBase = BigInt.fromI32(30);
    offer.prev = BigInt.fromI32(40);
    offer.isOpen = true;
    offer.isFailed = true;
    offer.isFilled = true;
    offer.isRetracted = false;
    offer.failedReason = Bytes.fromUTF8('failed reason');
    offer.posthookFailReason = Bytes.fromUTF8('posthook fail reason');
    offer.deprovisioned = false;
    offer.market = getMarketId(token0, token1);
    offer.maker = maker;
    offer.save();


    let offerRetract = createOfferRetractEvent(token0, token1, id, true);
    handleOfferRetract(offerRetract);

    assert.fieldEquals('Offer', offerId, 'offerId', '1');
    //TODO: do we want to update the transaction hash?
    assert.fieldEquals('Offer', offerId, 'transactionHash', '0x000123')
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
    assert.fieldEquals('Offer', offerId, 'market', getMarketId(token0, token1));
    assert.fieldEquals('Offer', offerId, 'maker', maker.toHexString());
    let updatedOffer = Offer.load(offerId)!;
    assert.assertTrue(updatedOffer.kandel === null)
    assert.assertTrue(updatedOffer.owner === null)
    assert.entityCount("Offer", 1);
  })
 
  test('Order, handleOrderSuccess', () => {
    const orderStart =  createOrderStartEvent()
    handleOrderStart(orderStart)
    assert.entityCount('Order', 1)

    const orderId = getEventUniqueId(orderStart);
    assert.fieldEquals('Order', orderId, 'transactionHash', Bytes.fromUTF8(orderStart.transaction.hash.toHex()).toHexString() )

    assert.fieldEquals('Context', 'context', 'ids',  `|${orderId}` );
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

    assert.fieldEquals('Context', 'context', 'ids',  `` );
  })

});
