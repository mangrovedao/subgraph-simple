import { Address, BigDecimal, BigInt, Bytes, ethereum, log } from "@graphprotocol/graph-ts";
import {
  Approval,
  CleanComplete,
  CleanStart,
  Credit,
  Debit,
  Kill,
  NewMgv,
  OfferFail,
  OfferFailWithPosthookData,
  OfferRetract,
  OfferSuccess,
  OfferSuccessWithPosthookData,
  OfferWrite,
  OrderComplete,
  OrderStart,
  SetActive,
  SetDensity96X32,
  SetFee,
  SetGasbase,
  SetGasmax,
  SetGasprice,
  SetGovernance,
  SetMaxGasreqForFailingOffers,
  SetMaxRecursionDepth,
  SetMonitor,
  SetNotify,
  SetUseOracle
} from "../generated/Mangrove/Mangrove";
import { CleanOrder, Kandel, LimitOrder, Market, MarketPair, Offer, OfferFilled, Order, Token } from "../generated/schema";
import { getEventUniqueId, getMarketPairId, getOfferId, getOrCreateAccount, getOrCreateToken } from "./helpers";
import {
  addCleanOrderToStack,
  addOfferWriteToStack,
  addOrderToStack,
  getLatestCleanOrderFromStack,
  getLatestLimitOrderFromStack,
  getLatestOrderFromStack,
  getOfferWriteFromStack,
  removeLatestCleanOrderFromStack,
  removeLatestOrderFromStack
} from "./stack";
import { limitOrderSetIsOpen } from "./mangrove-order";
import { addOfferToCurrentBundle } from "./mangrove-amplifier";
import { PartialOfferWrite } from "./types";
import { askOrBid, firstIsBase, handleTPV, sendAmount } from "./metrics";

export function handleApproval(event: Approval): void {}

export function handleCredit(event: Credit): void {}

export function handleDebit(event: Debit): void {}

export function handleKill(event: Kill): void {}

export function handleNewMgv(event: NewMgv): void {}

export function handleOfferFailWithPosthookData(event: OfferFailWithPosthookData): void {
  handleOfferFailEvent(changetype<OfferFail>(event), event.params.posthookData);
}

export function handleOfferFail(event: OfferFail): void {
  handleOfferFailEvent(event);
}

export function handleOfferFailEvent(event: OfferFail, posthookData: Bytes | null = null): void {
  const offerId = getOfferId(event.params.olKeyHash, event.params.id);
  const offer = Offer.load(offerId)!;

  offer.isOpen = false;
  offer.isFailed = true;
  offer.isFilled = false;
  offer.isRetracted = false;
  offer.posthookFailReason = null;
  offer.gasPrice = BigInt.fromI32(0);

  offer.failedReason = event.params.mgvData;
  offer.latestUpdateDate = event.block.timestamp;
  offer.latestLogIndex = event.logIndex;
  offer.latestTransactionHash = event.transaction.hash;
  offer.posthookFailReason = posthookData;
  offer.latestPenalty = event.params.penalty;
  offer.totalPenalty = offer.totalPenalty.plus(event.params.penalty);
  limitOrderSetIsOpen(offer.limitOrder, false);
  offer.save();

  const normalOrder = getLatestOrderFromStack(false);
  if (normalOrder) {
    normalOrder.penalty = normalOrder.penalty !== null ? normalOrder.penalty.plus(event.params.penalty) : event.params.penalty;
    normalOrder.save();
  } else {
    // TODO: add proper handling of clean order
  }

  handleTPV(Market.load(offer.market)!, event.block);
}

export function handleOfferRetract(event: OfferRetract): void {
  const offerId = getOfferId(event.params.olKeyHash, event.params.id);
  const offer = Offer.load(offerId)!;

  offer.isOpen = false;
  offer.isRetracted = true;
  offer.isFailed = false;
  offer.isFilled = false;
  offer.posthookFailReason = null;
  offer.failedReason = null;
  offer.deprovisioned = event.params.deprovision;

  if (event.params.deprovision) {
    offer.gasPrice = BigInt.fromI32(0);
  }

  offer.latestUpdateDate = event.block.timestamp;
  offer.latestLogIndex = event.logIndex;
  offer.latestTransactionHash = event.transaction.hash;

  limitOrderSetIsOpen(offer.limitOrder, false);

  offer.save();
  handleTPV(Market.load(offer.market)!, event.block);
}

export function handleOfferSuccessWithPosthookData(event: OfferSuccessWithPosthookData): void {
  handleOfferSuccessEvent(changetype<OfferSuccess>(event), event.params.posthookData);
}

export function handleOfferSuccess(event: OfferSuccess): void {
  handleOfferSuccessEvent(event);
}

export function handleOfferSuccessEvent(event: OfferSuccess, posthookData: Bytes | null = null): void {
  const offerId = getOfferId(event.params.olKeyHash, event.params.id);
  const offer = Offer.load(offerId)!;

  if (offer.gives == event.params.takerWants) {
    offer.isFilled = true;
  }
  limitOrderSetIsOpen(offer.limitOrder, false);
  offer.isOpen = false;
  offer.isFailed = false;
  offer.isRetracted = false;
  offer.posthookFailReason = null;
  offer.failedReason = null;
  offer.latestUpdateDate = event.block.timestamp;
  offer.latestLogIndex = event.logIndex;
  offer.latestTransactionHash = event.transaction.hash;
  offer.prevGives = offer.gives;
  offer.prevTick = offer.tick;
  offer.gives = BigInt.fromI32(0);
  offer.totalGot = event.params.takerGives.plus(offer.totalGot);
  offer.totalGave = event.params.takerWants.plus(offer.totalGave);
  offer.posthookFailReason = posthookData;
  offer.latestPenalty = BigInt.fromI32(0);

  let order = getLatestOrderFromStack(true);

  const market = Market.load(offer.market)!;
  const outbound = Token.load(market.outboundToken)!;
  const inbound = Token.load(market.inboundToken)!;

  const offerFilled = new OfferFilled(getEventUniqueId(event));
  offerFilled.creationDate = event.block.timestamp;
  offerFilled.transactionHash = event.transaction.hash;
  offerFilled.taker = order.taker;
  offerFilled.realTaker = order.taker;

  if (order.limitOrder) {
    const takerLO = LimitOrder.load(order.limitOrder!)!;
    offerFilled.realTaker = Address.fromBytes(takerLO.realTaker);
  }

  offerFilled.realMaker = offer.realMaker;
  offerFilled.makerGot = event.params.takerGives;
  offerFilled.makerGotDisplay = event.params.takerGives.toBigDecimal().div(
    BigInt.fromU32(10)
      .pow(<u8>inbound.decimals.toU32())
      .toBigDecimal()
  );
  offerFilled.makerGave = event.params.takerWants;
  offerFilled.makerGaveDisplay = event.params.takerWants.toBigDecimal().div(
    BigInt.fromU32(10)
      .pow(<u8>outbound.decimals.toU32())
      .toBigDecimal()
  );
  offerFilled.offer = offer.id;
  offerFilled.market = offer.market;
  offerFilled.save();

  const taker = Address.fromBytes(offerFilled.realTaker);
  const maker = Address.fromBytes(offerFilled.realMaker);

  sendAmount(taker, maker, market, inbound, outbound, offerFilled.makerGot, offerFilled.makerGave, event.block);

  order.takerGot = order.takerGot ? order.takerGot.plus(event.params.takerWants) : event.params.takerWants;
  order.takerGave = order.takerGave ? order.takerGave.plus(event.params.takerGives) : event.params.takerGives;
  order.save();

  offer.save();

  if (offer.kandel) {
    const kandel = Kandel.load(offer.kandel!)!;
    const market = Market.load(offer.market)!;
    if (market.outboundToken == kandel.base) {
      kandel.totalPublishedBase = kandel.totalPublishedBase.minus(event.params.takerWants);
      kandel.totalPublishedQuote = kandel.totalPublishedQuote.plus(event.params.takerGives);
    } else {
      kandel.totalPublishedBase = kandel.totalPublishedBase.plus(event.params.takerGives);
      kandel.totalPublishedQuote = kandel.totalPublishedQuote.minus(event.params.takerWants);
    }

    kandel.save();
  }

  handleTPV(Market.load(offer.market)!, event.block);
}

export const createNewOffer = (event: PartialOfferWrite): Offer => {
  const offerId = getOfferId(event.olKeyHash, event.id);
  const offer = new Offer(offerId);
  offer.latestLogIndex = event.logIndex;
  offer.latestTransactionHash = event.transactionHash;

  const kandel = Kandel.load(event.maker);
  if (kandel !== null) {
    offer.kandel = kandel.id;
  }

  return offer;
};

const handlePartialOfferWrite = (offerWrite: PartialOfferWrite, block: ethereum.Block): void => {
  const offerId = getOfferId(offerWrite.olKeyHash, offerWrite.id);
  let offer = Offer.load(offerId);

  if (!offer) {
    offer = createNewOffer(offerWrite);
    offer.creationDate = offerWrite.timestamp;
    offer.totalGot = BigInt.fromI32(0);
    offer.totalGave = BigInt.fromI32(0);
    offer.totalPenalty = BigInt.fromI32(0);
    // Adds to current bundle if creating one
    addOfferToCurrentBundle(offer);
  }

  offer.latestUpdateDate = offerWrite.timestamp;
  offer.latestLogIndex = offerWrite.logIndex;
  offer.latestTransactionHash = offerWrite.transactionHash;

  const owner = getOrCreateAccount(Address.fromBytes(offerWrite.maker), offerWrite.timestamp, true);
  offer.maker = owner.id;
  offer.realMaker = owner.id;

  const marketId = offerWrite.olKeyHash.toHex();
  const market = Market.load(marketId)!;
  offer.market = market.id;
  offer.gasBase = market.gasBase;

  offer.offerId = offerWrite.id;

  offer.tick = offerWrite.tick;
  offer.gives = offerWrite.gives;

  offer.gasPrice = offerWrite.gasprice;
  offer.gasReq = offerWrite.gasreq;
  offer.isOpen = true;
  offer.isFailed = false;
  offer.isFilled = false;
  offer.isRetracted = false;
  offer.deprovisioned = false;
  offer.failedReason = null;
  offer.posthookFailReason = null;
  offer.latestPenalty = BigInt.fromI32(0);
  limitOrderSetIsOpen(offer.limitOrder, true);

  if (offer.kandel) {
    const kandel = Kandel.load(offer.kandel!);
    offer.realMaker = kandel!.admin;
  }

  offer.save();
  handleTPV(Market.load(offer.market)!, block);
};

export function handleOfferWrite(event: OfferWrite): void {
  const cleanStack = getLatestCleanOrderFromStack();
  if (cleanStack) {
    addOfferWriteToStack("CleanOrder", event);
    return;
  }

  const orderStack = getLatestOrderFromStack(false);
  if (orderStack) {
    addOfferWriteToStack("Order", event);
    return;
  }

  handlePartialOfferWrite(PartialOfferWrite.fromOfferWrite(event), event.block);
}

export function handleOrderStart(event: OrderStart): void {
  const order = new Order(getEventUniqueId(event));
  order.transactionHash = event.transaction.hash;
  order.creationDate = event.block.timestamp;
  order.fillVolume = event.params.fillVolume;
  order.maxTick = event.params.maxTick;
  order.fillWants = event.params.fillWants;
  order.taker = getOrCreateAccount(event.params.taker, event.block.timestamp, true).id;
  order.market = event.params.olKeyHash.toHex();

  // 0 offers could be matched and therefore have to initialize the 4 fields
  order.penalty = BigInt.fromI32(0);
  order.takerGot = BigInt.fromI32(0);
  order.takerGave = BigInt.fromI32(0);
  order.feePaid = BigInt.fromI32(0);

  const cleanOrder = getLatestCleanOrderFromStack();
  if (cleanOrder != null) {
    order.cleanOrder = cleanOrder.id;
  }

  const limitOrder = getLatestLimitOrderFromStack();
  if (limitOrder !== null) {
    order.limitOrder = limitOrder.id;
    limitOrder.order = order.id;
    limitOrder.save();
  }

  order.save();
  addOrderToStack(order);
}

export function handleOrderComplete(event: OrderComplete): void {
  const order = getLatestOrderFromStack(true);
  order.feePaid = event.params.fee;
  order.save();

  const offerWrites = getOfferWriteFromStack("Order");

  for (let i = 0; i < offerWrites.length; i++) {
    handlePartialOfferWrite(offerWrites.at(i), event.block);
  }

  removeLatestOrderFromStack();
}

export function handleCleanStart(event: CleanStart): void {
  const order = new CleanOrder(getEventUniqueId(event));
  order.transactionHash = event.transaction.hash;
  order.creationDate = event.block.timestamp;
  order.offersToBeCleaned = event.params.offersToBeCleaned;
  order.taker = getOrCreateAccount(event.params.taker, event.block.timestamp, true).id;
  order.market = event.params.olKeyHash.toHex();
  order.save();

  addCleanOrderToStack(order);
}

export function handleCleanComplete(event: CleanComplete): void {
  const offerWrites = getOfferWriteFromStack("CleanOrder");

  for (let i = 0; i < offerWrites.length; i++) {
    handlePartialOfferWrite(offerWrites.at(i), event.block);
  }
  removeLatestCleanOrderFromStack();
}

export function handleSetActive(event: SetActive): void {
  const marketId = event.params.olKeyHash.toHex();
  let market = Market.load(marketId);

  if (!market) {
    market = new Market(marketId);

    getOrCreateToken(event.params.outbound_tkn);
    getOrCreateToken(event.params.inbound_tkn);

    market.outboundToken = event.params.outbound_tkn;
    market.inboundToken = event.params.inbound_tkn;
    market.tickSpacing = event.params.tickSpacing;
    market.gasBase = BigInt.fromI32(0);
    market.fee = BigInt.fromI32(0);

    let base = event.params.outbound_tkn;
    let quote = event.params.inbound_tkn;

    if (firstIsBase(event.params.inbound_tkn, event.params.outbound_tkn)) {
      base = event.params.inbound_tkn;
      quote = event.params.outbound_tkn;
    } else {
      base = event.params.outbound_tkn;
      quote = event.params.inbound_tkn;
    }

    const marketPairId = getMarketPairId(market);
    let marketPair = MarketPair.load(marketPairId);
    const marketSide = askOrBid(event.params.inbound_tkn.toHex(), event.params.outbound_tkn.toHex());

    if (!marketPair) {
      marketPair = new MarketPair(marketPairId);
      marketPair.creationDate = event.block.timestamp;

      marketPair.base = base;
      marketPair.quote = quote;

      marketPair.totalVolumePromisedBase = BigInt.fromI32(0);
      marketPair.totalVolumePromisedQuote = BigInt.fromI32(0);
      marketPair.totalVolumePromisedBaseDisplay = BigInt.fromI32(0).toBigDecimal();
      marketPair.totalVolumePromisedQuoteDisplay = BigInt.fromI32(0).toBigDecimal();
    }

    if (marketSide === "bid") {
      marketPair.bid = marketId;
    } else {
      marketPair.ask = marketId;
    }
    marketPair.latestUpdateDate = event.block.timestamp;
    marketPair.save();
  }

  market.active = event.params.value;

  market.save();
}

export function handleSetDensity(event: SetDensity96X32): void {}

export function handleSetFee(event: SetFee): void {
  const marketId = event.params.olKeyHash.toHex();
  let market = Market.load(marketId);

  if (!market) {
    throw new Error("Market not found for set-fee event " + marketId);
  }

  market.fee = event.params.value;
  market.save();
}

export function handleSetGasbase(event: SetGasbase): void {
  const marketId = event.params.olKeyHash.toHex();
  let market = Market.load(marketId);
  if (!market) {
    market = new Market(marketId);
    market.active = false;
    market.fee = BigInt.fromI32(0);
  }
  market.gasBase = event.params.offer_gasbase;

  market.save();
}

export function handleSetGasmax(event: SetGasmax): void {}

export function handleSetGasprice(event: SetGasprice): void {}

export function handleSetGovernance(event: SetGovernance): void {}

export function handleSetMonitor(event: SetMonitor): void {}

export function handleSetNotify(event: SetNotify): void {}

export function handleSetUseOracle(event: SetUseOracle): void {}

export function handleSetMaxGasreqForFailingOffers(event: SetMaxGasreqForFailingOffers): void {}

export function handleSetMaxRecursionDepth(event: SetMaxRecursionDepth): void {}
