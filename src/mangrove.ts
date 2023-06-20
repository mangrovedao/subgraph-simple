import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import {
  Approval,
  Credit,
  Debit,
  Kill,
  NewMgv,
  OfferFail,
  OfferRetract,
  OfferSuccess,
  OfferWrite,
  OrderComplete,
  OrderStart,
  PosthookFail,
  SetActive,
  SetDensity,
  SetFee,
  SetGasbase,
  SetGasmax,
  SetGasprice,
  SetGovernance,
  SetMonitor,
  SetNotify,
  SetUseOracle
} from "../generated/Mangrove/Mangrove";
import { Kandel, Market, Offer, Order } from "../generated/schema";
import { addOrderToStack, getEventUniqueId, getMarketId, getOfferId, getOrCreateAccount, getOrderFromStack, removeOrderFromStack } from "./helpers";

export function handleApproval(event: Approval): void {}

export function handleCredit(event: Credit): void {}

export function handleDebit(event: Debit): void {}

export function handleKill(event: Kill): void {}

export function handleNewMgv(event: NewMgv): void {}

export function handleOfferFail(event: OfferFail): void {
  const offerId = getOfferId(
    event.params.outbound_tkn, 
    event.params.inbound_tkn,
    event.params.id,
  );
  const offer = Offer.load(offerId)!;

  offer.isOpen = false;
  offer.isFailed = true;
  offer.isFilled = false;
  offer.isRetracted = false;
  offer.posthookFailReason = null;
  offer.gasprice = BigInt.fromI32(0);

  offer.failedReason = event.params.mgvData;
  offer.latestUpdateDate = event.block.timestamp;
  offer.latestLogIndex = event.logIndex;
  offer.latestTransactionHash = event.transaction.hash;

  offer.save();
}

export function handleOfferRetract(event: OfferRetract): void {
  const offerId = getOfferId(
    event.params.outbound_tkn, 
    event.params.inbound_tkn,
    event.params.id,
  );
  const offer = Offer.load(offerId)!; 

  offer.isOpen = false;
  offer.isRetracted = true;
  offer.isFailed = false;
  offer.isFilled = false;
  offer.posthookFailReason = null;
  offer.failedReason = null;
  offer.deprovisioned = event.params.deprovision;
  if(event.params.deprovision) {
    offer.gasprice = BigInt.fromI32(0);
  }
  offer.latestUpdateDate = event.block.timestamp;
  offer.latestLogIndex = event.logIndex;
  offer.latestTransactionHash = event.transaction.hash;
  offer.save();
}

export function handleOfferSuccess(event: OfferSuccess): void {
  const offerId = getOfferId(
    event.params.outbound_tkn, 
    event.params.inbound_tkn,
    event.params.id,
  );
  const offer = Offer.load(offerId)!;
  
  offer.isFilled = offer.wants == event.params.takerGives && offer.gives == event.params.takerWants;
  offer.isOpen = false;
  offer.isFailed = false;
  offer.isRetracted = false;
  offer.posthookFailReason = null;
  offer.failedReason = null;
  offer.latestUpdateDate = event.block.timestamp;
  offer.latestLogIndex = event.logIndex;
  offer.latestTransactionHash = event.transaction.hash;

  offer.prevGives = offer.gives;
  offer.prevWants = offer.wants;
  offer.gives = BigInt.fromI32(0);
  offer.totalGot = offer.totalGot !== null ?  event.params.takerGives.plus( offer.totalGot! ) : event.params.takerGives,
  offer.totalGave = offer.totalGave !== null ?  event.params.takerWants.plus( offer.totalGave! ) : event.params.takerWants,

  offer.save();
}

export const createNewOffer = (event: OfferWrite): Offer => {
  const offerId = getOfferId(
    event.params.outbound_tkn, 
    event.params.inbound_tkn,
    event.params.id,
  );
  const offer = new Offer(offerId);
  offer.latestLogIndex = event.logIndex;
  offer.latestTransactionHash = event.transaction.hash;

  const kandel = Kandel.load(event.params.maker);
  if (kandel) {
    offer.kandel = kandel.id;
  }

  return offer;
}


export function handleOfferWrite(event: OfferWrite): void {
  const offerId = getOfferId(
    event.params.outbound_tkn, 
    event.params.inbound_tkn,
    event.params.id,
  );
  let offer = Offer.load(offerId);
  if (!offer) {
    offer = createNewOffer(event);
    offer.creationDate = event.block.timestamp;
  }
  offer.latestUpdateDate = event.block.timestamp;
  offer.latestLogIndex = event.logIndex;
  offer.latestTransactionHash = event.transaction.hash;

  const owner = getOrCreateAccount(event.params.maker);
  offer.maker = owner.id;

  const marketId = getMarketId(
    event.params.outbound_tkn,
    event.params.inbound_tkn,
  );
  const market = Market.load(marketId)!;
  offer.market = market.id;
  offer.gasBase = market.gasbase;

  offer.offerId = event.params.id;

  offer.wants = event.params.wants,
  offer.gives = event.params.gives,

  offer.gasprice = event.params.gasprice,
  offer.gasreq = event.params.gasreq,
  offer.prev = event.params.prev,
  offer.isOpen = true;
  offer.isFailed = false;
  offer.isFilled = false;
  offer.isRetracted = false;
  offer.deprovisioned = false;
  offer.failedReason = null;
  offer.posthookFailReason = null;


  offer.save();
}

export function handleOrderComplete(event: OrderComplete): void {
  const order = getOrderFromStack();

  order.taker = event.params.taker;
  order.takerGot = event.params.takerGot;
  order.takerGave = event.params.takerGave;
  order.penalty = event.params.penalty;
  order.feePaid = event.params.feePaid;

  order.market = getMarketId(event.params.outbound_tkn, event.params.inbound_tkn);
  order.save();

  removeOrderFromStack();
}

export function handleOrderStart(event: OrderStart): void {
  const order = new Order(getEventUniqueId(event));
  order.transactionHash = Bytes.fromUTF8(event.transaction.hash.toHex());
  order.creationDate = event.block.timestamp;
  order.save();

  addOrderToStack(order);
}

export function handlePosthookFail(event: PosthookFail): void {
  const offerId = getOfferId(
    event.params.outbound_tkn,
    event.params.inbound_tkn,
    event.params.offerId,
  );

  const offer = Offer.load(offerId)!;

  offer.posthookFailReason = event.params.posthookData;
  offer.latestUpdateDate = event.block.timestamp;

  offer.save();
}

export function handleSetActive(event: SetActive): void {
  const marketId = getMarketId(
    event.params.outbound_tkn,
    event.params.inbound_tkn,
  );
  let market = Market.load(marketId);

  if (!market) {
    market = new Market(marketId);
    market.outbound_tkn = event.params.outbound_tkn;
    market.inbound_tkn = event.params.inbound_tkn;
    market.gasbase = BigInt.fromI32(0);
  }

  market.active = event.params.value;

  market.save();
}

export function handleSetDensity(event: SetDensity): void {}

export function handleSetFee(event: SetFee): void {}

export function handleSetGasbase(event: SetGasbase): void {
  const marketId = getMarketId(event.params.outbound_tkn, event.params.inbound_tkn)
  let market = Market.load(marketId);
  if (!market) {
    market = new Market(marketId);
    market.inbound_tkn = event.params.inbound_tkn;
    market.outbound_tkn = event.params.outbound_tkn;
    market.active = false;
  }
  market.gasbase = event.params.offer_gasbase;

  market.save();
}

export function handleSetGasmax(event: SetGasmax): void {}

export function handleSetGasprice(event: SetGasprice): void {}

export function handleSetGovernance(event: SetGovernance): void {}

export function handleSetMonitor(event: SetMonitor): void {}

export function handleSetNotify(event: SetNotify): void {}

export function handleSetUseOracle(event: SetUseOracle): void {}
