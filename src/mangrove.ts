import { Address, BigInt, Bytes, log } from "@graphprotocol/graph-ts";
import {
  OfferFail,
  OfferFailWithPosthookData,
  OfferRetract,
  OfferSuccess,
  OfferSuccessWithPosthookData,
  OfferWrite,
  OrderComplete,
  OrderStart,
  SetActive
} from "../generated/Mangrove/Mangrove";
import { Kandel, Market, Offer, OfferFilled, Order } from "../generated/schema";
import { getEventUniqueId, getOfferId, getOrCreateAccount } from "./helpers";
import {
  addOfferWriteToStack,
  addOrderToStack,
  getLatestLimitOrderFromStack,
  getLatestOrderFromStack,
  getOfferWriteFromStack,
  removeLatestOrderFromStack
} from "./stack";
import { limitOrderSetIsOpen } from "./mangrove-order";
import { PartialOfferWrite } from "./types";

export function handleOfferFailWithPosthookData(event: OfferFailWithPosthookData): void {
  handleOfferFailEvent(changetype<OfferFail>(event), event.params.posthookData);
}

export function handleOfferFail(event: OfferFail): void {
  handleOfferFailEvent(event);
}

export function handleOfferFailEvent(event: OfferFail, posthookData: Bytes | null = null): void {
  const offerId = getOfferId(event.params.olKeyHash, event.params.id);
  const offer = Offer.load(offerId);

  if (!offer) {
    log.error("Offer not found for id {} in list {}", [offerId, event.params.olKeyHash.toHex()]);
    return;
  }

  offer.isOpen = false;
  offer.posthookFailReason = null;

  offer.failedReason = event.params.mgvData;
  offer.latestUpdateDate = event.block.timestamp;
  offer.latestLogIndex = event.logIndex;
  offer.latestTransactionHash = event.transaction.hash;
  offer.posthookFailReason = posthookData;
  limitOrderSetIsOpen(offer.limitOrder, false);
  offer.save();

  const normalOrder = getLatestOrderFromStack(false);
  if (normalOrder) {
    normalOrder.penalty = normalOrder.penalty !== null ? normalOrder.penalty.plus(event.params.penalty) : event.params.penalty;
    normalOrder.save();
  }
}

export function handleOfferRetract(event: OfferRetract): void {
  const offerId = getOfferId(event.params.olKeyHash, event.params.id);

  const offer = Offer.load(offerId);
  if (!offer) {
    log.error("Offer not found for id {} in list {}", [offerId, event.params.olKeyHash.toHex()]);
    return;
  }

  offer.isOpen = false;
  offer.posthookFailReason = null;
  offer.failedReason = null;

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

export function handleOfferSuccessEvent(event: OfferSuccess, posthookData: Bytes | null = null): void {
  const offerId = getOfferId(event.params.olKeyHash, event.params.id);
  const offer = Offer.load(offerId)!;

  limitOrderSetIsOpen(offer.limitOrder, false);
  offer.isOpen = false;
  offer.posthookFailReason = null;
  offer.failedReason = null;
  offer.latestUpdateDate = event.block.timestamp;
  offer.latestLogIndex = event.logIndex;
  offer.latestTransactionHash = event.transaction.hash;
  offer.totalGot = event.params.takerGives.plus(offer.totalGot);
  offer.totalGave = event.params.takerWants.plus(offer.totalGave);
  offer.posthookFailReason = posthookData;

  const owner = Address.fromBytes(offer.owner !== null ? offer.owner! : offer.maker);

  let order = getLatestOrderFromStack(true);

  const offerFilled = new OfferFilled(getEventUniqueId(event));
  offerFilled.creationDate = event.block.timestamp;
  offerFilled.transactionHash = event.transaction.hash;
  offerFilled.taker = order.taker;
  offerFilled.account = owner;
  offerFilled.makerGot = event.params.takerGives;
  offerFilled.makerGave = event.params.takerWants;
  offerFilled.offer = offer.id;
  offerFilled.market = offer.market;
  offerFilled.save();

  order.takerGot = order.takerGot ? order.takerGot.plus(event.params.takerWants) : event.params.takerWants;
  order.takerGave = order.takerGave ? order.takerGave.plus(event.params.takerGives) : event.params.takerGives;
  order.save();

  offer.save();
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
  }

  offer.latestUpdateDate = offerWrite.timestamp;
  offer.latestLogIndex = offerWrite.logIndex;
  offer.latestTransactionHash = offerWrite.transactionHash;

  const owner = getOrCreateAccount(Address.fromBytes(offerWrite.maker), offerWrite.timestamp, true);
  offer.maker = owner.id;

  const marketId = offerWrite.olKeyHash.toHex();
  const market = Market.load(marketId)!;
  offer.market = market.id;

  offer.offerId = offerWrite.id;

  offer.isOpen = true;
  offer.failedReason = null;
  offer.posthookFailReason = null;
  limitOrderSetIsOpen(offer.limitOrder, true);

  if (offer.kandel) {
    const kandel = Kandel.load(offer.kandel!);
    offer.owner = kandel!.admin;
  }

  offer.save();
};

export function handleOfferWrite(event: OfferWrite): void {
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

export function handleSetActive(event: SetActive): void {
  const marketId = event.params.olKeyHash.toHex();
  let market = Market.load(marketId);

  if (!market) {
    market = new Market(marketId);

    market.outbound_tkn = event.params.outbound_tkn;
    market.inbound_tkn = event.params.inbound_tkn;
    market.tickSpacing = event.params.tickSpacing;
  }

  market.active = event.params.value;

  market.save();
}
