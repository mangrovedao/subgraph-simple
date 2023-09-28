import { BigInt } from "@graphprotocol/graph-ts";
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
  SetUseOracle,
  SnipesCall,
  SnipesForCall,
} from "../generated/Mangrove/Mangrove";
import { Kandel, LimitOrder, Market, Offer, Order } from "../generated/schema";
import { addOrderToStack, currentOrderIsSnipe, getEventUniqueId, getMarketId, getOfferId, getOrCreateAccount, getOrCreateAccountVolumeByPair, getOrderFromStack, getOrderStack, increaseAccountVolume, removeOrderFromStack } from "./helpers";

export function handleApproval(event: Approval): void {}

export function handleCredit(event: Credit): void {}

export function handleDebit(event: Debit): void {}

export function handleKill(event: Kill): void {}

export function handleNewMgv(event: NewMgv): void {}

export const limitOrderSetIsOpen = (offerId: string, value: boolean): void => {
  const limitOrder = LimitOrder.load(offerId);
  if (!limitOrder) {
    return;
  }
  limitOrder.isOpen = value;

  limitOrder.save();
}

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

  limitOrderSetIsOpen(offerId, false); 

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

  limitOrderSetIsOpen(offerId, false); 

  offer.save();
}

export function handleOfferSuccess(event: OfferSuccess): void {
  const offerId = getOfferId(
    event.params.outbound_tkn, 
    event.params.inbound_tkn,
    event.params.id,
  );
  const offer = Offer.load(offerId)!;
 
  if (offer.wants == event.params.takerGives && offer.gives == event.params.takerWants) {
    offer.isFilled = true; 
  }

  limitOrderSetIsOpen(offerId, false); 
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
  offer.totalGot = event.params.takerGives.plus(offer.totalGot);
  offer.totalGave = event.params.takerWants.plus(offer.totalGave);

  const volume = getOrCreateAccountVolumeByPair(offer.owner !== null ? offer.owner! : offer.maker, event.params.outbound_tkn, event.params.inbound_tkn, event.block.timestamp, "Maker");
  increaseAccountVolume(volume, event.params.inbound_tkn, event.params.takerGives, event.params.takerWants, true);

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
    offer.totalGot = BigInt.fromI32(0);
    offer.totalGave = BigInt.fromI32(0);
  }

  offer.latestUpdateDate = event.block.timestamp;
  offer.latestLogIndex = event.logIndex;
  offer.latestTransactionHash = event.transaction.hash;

  const owner = getOrCreateAccount(event.params.maker, event.block.timestamp, true);
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

  limitOrderSetIsOpen(offer.id, true);

  offer.save();
}

export function handleOrderComplete(event: OrderComplete): void {
  const order = getOrderFromStack();

  order.taker = getOrCreateAccount(event.params.taker, event.block.timestamp, true).id;
  order.takerGot = event.params.takerGot;
  order.takerGave = event.params.takerGave;
  order.penalty = event.params.penalty;
  order.feePaid = event.params.feePaid;

  order.market = getMarketId(event.params.outbound_tkn, event.params.inbound_tkn);
  order.save();

  const volume = getOrCreateAccountVolumeByPair(
    event.params.taker, 
    event.params.outbound_tkn, 
    event.params.inbound_tkn, 
    event.block.timestamp, 
    currentOrderIsSnipe() ? "TakerSnipe": "Taker",
  );
  increaseAccountVolume(volume, event.params.outbound_tkn, event.params.takerGot, event.params.takerGave, true);

  removeOrderFromStack();
}

export function handleOrderStart(event: OrderStart): void {
  const order = new Order(getEventUniqueId(event));
  order.transactionHash = event.transaction.hash;
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

export function handleSnipes(call: SnipesCall): void {
  const orderStack = getOrderStack();
  orderStack.nextIsSnipe = true;

  orderStack.save();
}

export function handleSnipesFor(call: SnipesForCall): void {
  const orderStack = getOrderStack();
  orderStack.nextIsSnipe = true;

  orderStack.save();
}
