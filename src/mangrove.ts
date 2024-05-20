import { Address, BigDecimal, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
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
import {
  CleanOrder,
  Kandel,
  LimitOrder,
  Market,
  MarketActivity,
  MarketActivityPair,
  Offer,
  OfferFilled,
  Order,
  Token,
  TokenActivity
} from "../generated/schema";
import {
  getEventUniqueId,
  getMarketActivityId,
  getMarketActivityPairId,
  getOfferId,
  getOrCreateAccount,
  getOrCreateToken,
  getTokenActivityId
} from "./helpers";
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
}

export function handleOfferSuccessWithPosthookData(event: OfferSuccessWithPosthookData): void {
  handleOfferSuccessEvent(changetype<OfferSuccess>(event), event.params.posthookData);
}

export function handleOfferSuccess(event: OfferSuccess): void {
  handleOfferSuccessEvent(event);
}

const createNewMarketActivityEntry = (user: Address, market: Market, timestamp: BigInt): MarketActivity => {
  const marketActivityId = getMarketActivityId(user, market);
  const activity = new MarketActivity(marketActivityId);

  activity.creationDate = BigInt.fromI32(0);
  activity.latestInteractionDate = BigInt.fromI32(0);
  activity.account = user;
  activity.market = market.id;
  activity.inboundAmountGot = BigInt.fromI32(0);
  activity.inboundAmountGave = BigInt.fromI32(0);

  activity.outboundAmountGot = BigInt.fromI32(0);
  activity.outboundAmountGave = BigInt.fromI32(0);

  activity.inboundAmountGotDisplay = BigInt.fromI32(0).toBigDecimal();
  activity.inboundAmountGaveDisplay = BigInt.fromI32(0).toBigDecimal();

  activity.outboundAmountGotDisplay = BigInt.fromI32(0).toBigDecimal();
  activity.outboundAmountGaveDisplay = BigInt.fromI32(0).toBigDecimal();

  activity.creationDate = timestamp;

  return activity;
};

const createNewMarketActivityPairEntry = (maker: Address, taker: Address, market: Market, timestamp: BigInt): MarketActivityPair => {
  const marketActivityPairId = getMarketActivityPairId(maker, taker, market);
  const activity = new MarketActivityPair(marketActivityPairId);

  activity.creationDate = BigInt.fromI32(0);
  activity.latestInteractionDate = BigInt.fromI32(0);
  activity.maker = maker;
  activity.taker = taker;
  activity.market = market.id;
  activity.inboundAmount = BigInt.fromI32(0);
  activity.outboundAmount = BigInt.fromI32(0);
  activity.inboundAmountDisplay = BigInt.fromI32(0).toBigDecimal();

  activity.outboundAmountDisplay = BigInt.fromI32(0).toBigDecimal();

  activity.creationDate = timestamp;

  return activity;
};

const createNewTokenActivityEntry = (user: Address, token: Token, timestamp: BigInt): TokenActivity => {
  const tokenActivityId = getTokenActivityId(user, token);
  const activity = new TokenActivity(tokenActivityId);

  activity.creationDate = BigInt.fromI32(0);
  activity.latestInteractionDate = BigInt.fromI32(0);
  activity.account = user;
  activity.token = token.id;
  activity.amountSent = BigInt.fromI32(0);
  activity.amountReceived = BigInt.fromI32(0);
  activity.amountReceivedDisplay = BigInt.fromI32(0).toBigDecimal();
  activity.amountSentDisplay = BigInt.fromI32(0).toBigDecimal();

  activity.creationDate = timestamp;

  return activity;
};

const getOrCreateMarketActivityEntry = (user: Address, market: Market, block: ethereum.Block): MarketActivity => {
  const marketActivityId = getMarketActivityId(user, market);
  let activity = MarketActivity.load(marketActivityId);
  if (!activity) {
    activity = createNewMarketActivityEntry(user, market, block.timestamp);
  }
  return activity;
};

const getOrCreateTokenActivityEntry = (user: Address, token: Token, block: ethereum.Block): TokenActivity => {
  const tokenActivityId = getTokenActivityId(user, token);
  let activity = TokenActivity.load(tokenActivityId);
  if (!activity) {
    activity = createNewTokenActivityEntry(user, token, block.timestamp);
  }
  return activity;
};

const getOrCreateMarketActivityPairEntry = (maker: Address, taker: Address, market: Market, block: ethereum.Block): MarketActivityPair => {
  const marketActivityPairId = getMarketActivityPairId(maker, taker, market);
  let activity = MarketActivityPair.load(marketActivityPairId);
  if (!activity) {
    activity = createNewMarketActivityPairEntry(maker, taker, market, block.timestamp);
  }
  return activity;
};

export function scale(amount: BigInt, decimals: BigInt): BigDecimal {
  return amount.toBigDecimal().div(
    BigInt.fromU32(10)
      .pow(<u8>decimals.toU32())
      .toBigDecimal()
  );
}

function setDisplayValuesAndSaveMarket(activity: MarketActivity, inbound: Token, outbound: Token, block: ethereum.Block): void {
  activity.inboundAmountGotDisplay = scale(activity.inboundAmountGot, inbound.decimals);
  activity.inboundAmountGaveDisplay = scale(activity.inboundAmountGave, inbound.decimals);
  activity.outboundAmountGotDisplay = scale(activity.outboundAmountGot, outbound.decimals);
  activity.outboundAmountGaveDisplay = scale(activity.outboundAmountGave, outbound.decimals);
  activity.latestInteractionDate = block.timestamp;
  activity.save();
}

function setDisplayValuesAndSaveMarketPair(activity: MarketActivityPair, inbound: Token, outbound: Token, block: ethereum.Block): void {
  activity.inboundAmountDisplay = scale(activity.inboundAmount, inbound.decimals);
  activity.outboundAmountDisplay = scale(activity.outboundAmount, outbound.decimals);
  activity.latestInteractionDate = block.timestamp;
  activity.save();
}

function setDisplayValuesAndSaveToken(activity: TokenActivity, token: Token, block: ethereum.Block): void {
  activity.amountReceivedDisplay = scale(activity.amountReceived, token.decimals);
  activity.amountSentDisplay = scale(activity.amountSent, token.decimals);
  activity.latestInteractionDate = block.timestamp;
  activity.save();
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

  const owner = Address.fromBytes(offer.owner !== null ? offer.owner! : offer.maker);

  let order = getLatestOrderFromStack(true);

  const market = Market.load(offer.market)!;
  const outbound = Token.load(market.outboundToken)!;
  const inbound = Token.load(market.inboundToken)!;

  const offerFilled = new OfferFilled(getEventUniqueId(event));
  offerFilled.creationDate = event.block.timestamp;
  offerFilled.transactionHash = event.transaction.hash;
  offerFilled.taker = order.taker;
  offerFilled.account = owner;
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

  const taker = Address.fromBytes(order.taker);
  const maker = Address.fromBytes(offer.realMaker);
  const zero = Address.fromBytes(Address.fromHexString("0x0000000000000000000000000000000000000000"));

  const rootAcc = getOrCreateAccount(zero, event.block.timestamp, true);
  rootAcc.save();

  // TODO: Could use MarketPair here with maker or taker = zero to replace the others
  // TODO: Could use MarketPair with maker AND taker = zero to replace token activity
  const marketActivityPair = getOrCreateMarketActivityPairEntry(taker, maker, market, event.block);

  const tokenActivityInboundTaker = getOrCreateTokenActivityEntry(taker, inbound, event.block);
  const tokenActivityOutboundTaker = getOrCreateTokenActivityEntry(taker, outbound, event.block);

  const tokenActivityInboundMaker = getOrCreateTokenActivityEntry(maker, inbound, event.block);
  const tokenActivityOutboundMaker = getOrCreateTokenActivityEntry(maker, outbound, event.block);

  const tokenActivityTotalInbound = getOrCreateTokenActivityEntry(zero, inbound, event.block);
  const tokenActivityTotalOutbound = getOrCreateTokenActivityEntry(zero, outbound, event.block);

  const marketActivityTaker = getOrCreateMarketActivityEntry(taker, market, event.block); // TODO: Should be "real taker"
  const marketActivityMaker = getOrCreateMarketActivityEntry(maker, market, event.block); // TODO: Should be "real maker"
  const marketActivityTotal = getOrCreateMarketActivityEntry(zero, market, event.block);

  // TODO: Review exactly what is being added here
  marketActivityMaker.outboundAmountGave = marketActivityMaker.outboundAmountGave.plus(offerFilled.makerGave);
  marketActivityMaker.inboundAmountGot = marketActivityMaker.inboundAmountGot.plus(offerFilled.makerGot);

  marketActivityTaker.inboundAmountGave = marketActivityTaker.inboundAmountGave.plus(offerFilled.makerGot);
  marketActivityTaker.outboundAmountGot = marketActivityTaker.outboundAmountGot.plus(offerFilled.makerGave);

  marketActivityTotal.inboundAmountGave = marketActivityTotal.inboundAmountGave.plus(offerFilled.makerGot);
  marketActivityTotal.inboundAmountGot = marketActivityTotal.inboundAmountGot.plus(offerFilled.makerGot);

  marketActivityTotal.outboundAmountGot = marketActivityTotal.outboundAmountGot.plus(offerFilled.makerGave);
  marketActivityTotal.outboundAmountGave = marketActivityTotal.outboundAmountGave.plus(offerFilled.makerGave);

  tokenActivityInboundTaker.amountSent = tokenActivityInboundTaker.amountSent.plus(offerFilled.makerGot);
  tokenActivityOutboundTaker.amountReceived = tokenActivityOutboundTaker.amountReceived.plus(offerFilled.makerGave);

  tokenActivityInboundMaker.amountReceived = tokenActivityInboundMaker.amountReceived.plus(offerFilled.makerGot);
  tokenActivityOutboundMaker.amountSent = tokenActivityOutboundMaker.amountSent.plus(offerFilled.makerGave);

  tokenActivityTotalInbound.amountReceived = tokenActivityTotalInbound.amountReceived.plus(offerFilled.makerGot);
  tokenActivityTotalOutbound.amountSent = tokenActivityTotalOutbound.amountSent.plus(offerFilled.makerGave);

  marketActivityPair.inboundAmount = marketActivityPair.inboundAmount.plus(offerFilled.makerGot);
  marketActivityPair.outboundAmount = marketActivityPair.outboundAmount.plus(offerFilled.makerGave);

  setDisplayValuesAndSaveMarket(marketActivityTaker, inbound, outbound, event.block);
  setDisplayValuesAndSaveMarket(marketActivityMaker, inbound, outbound, event.block);
  setDisplayValuesAndSaveMarket(marketActivityTotal, inbound, outbound, event.block);

  setDisplayValuesAndSaveToken(tokenActivityInboundTaker, inbound, event.block);
  setDisplayValuesAndSaveToken(tokenActivityOutboundTaker, outbound, event.block);

  setDisplayValuesAndSaveToken(tokenActivityInboundMaker, inbound, event.block);
  setDisplayValuesAndSaveToken(tokenActivityOutboundMaker, outbound, event.block);

  setDisplayValuesAndSaveToken(tokenActivityTotalInbound, inbound, event.block);
  setDisplayValuesAndSaveToken(tokenActivityTotalOutbound, outbound, event.block);

  setDisplayValuesAndSaveMarketPair(marketActivityPair, inbound, outbound, event.block);

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

const handlePartialOfferWrite = (offerWrite: PartialOfferWrite): void => {
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
    offer.owner = kandel!.admin;
    offer.realMaker = kandel!.admin;
  }

  if (offer.limitOrder) {
    const limitOrder = LimitOrder.load(offer.limitOrder!);
    offer.realMaker = limitOrder!.realTaker;
  }

  offer.save();
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

  handlePartialOfferWrite(PartialOfferWrite.fromOfferWrite(event));
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
    handlePartialOfferWrite(offerWrites.at(i));
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
    handlePartialOfferWrite(offerWrites.at(i));
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
