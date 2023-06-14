import { Address, BigInt, Bytes, Value, ethereum } from "@graphprotocol/graph-ts"
import {
  Mangrove,
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
} from "../generated/Mangrove/Mangrove"
import { Market, Account, Order, Offer, Kandel } from "../generated/schema"
import { addOrderToStack, getMarketId, getOfferId, getOrCreateAccount, getOrderFromStack, removeOrderFromStack } from "./helpers";

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
  offer.isFailed = false;

  offer.failedReason = event.params.mgvData.toString();

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

  offer.save();
}

export function handleOfferSuccess(event: OfferSuccess): void {
  const offerId = getOfferId(
    event.params.outbound_tkn, 
    event.params.inbound_tkn,
    event.params.id,
  );
  const offer = Offer.load(offerId)!;

  offer.wants = offer.wants.minus(event.params.takerGives);
  offer.gives = offer.gives.minus(event.params.takerWants);

  const BN_0 = BigInt.fromI32(0);
  if (offer.wants == BN_0 && offer.gives == BN_0) {
    offer.isOpen = false;
    offer.isFilled = true;
  }

  offer.save();
}

export function handleOfferWrite(event: OfferWrite): void {
  const offerId = getOfferId(
    event.params.outbound_tkn, 
    event.params.inbound_tkn,
    event.params.id,
  );

  let offer = Offer.load(offerId);

  if (!offer) {
    offer = new Offer(offerId);
    offer.transactionHash = event.transaction.hash;
    const kandel = Kandel.load(event.params.maker);
    if (kandel) {
      offer.kandel = event.params.maker;
    }
  } else {
    if (offer.isFilled || offer.isFailed || !offer.isOpen) {
      // if the offer wirte match an offer id that is re used then create a new offer entity to 
      // keep track historic data
      const newOfferId = `${offer.id}-${event.transaction.hash.toHex()}-${event.logIndex.toHex()}`;
      offer.id = newOfferId;
      offer.save()

      offer.id = offerId;
    }
  }

  const owner = getOrCreateAccount(event.params.maker);
  offer.maker = owner.id;

  const marketId = getMarketId(
    event.params.outbound_tkn,
    event.params.inbound_tkn,
  );
  const market = Market.load(marketId)!;
  offer.market = market.id;

  offer.offerId = event.params.id;
  offer.wants = event.params.wants,
  offer.initialWants = event.params.wants;

  offer.gives = event.params.gives,
  offer.initialGives = event.params.gives;

  offer.gasprice = event.params.gasprice,
  offer.gasreq = event.params.gasreq,
  offer.prev = event.params.prev,
  offer.isOpen = true;
  offer.isFailed = false;
  offer.isFilled = false;
  offer.isRetracted = false;

  offer.save();
}

export function handleOrderComplete(event: OrderComplete): void {
  const order = getOrderFromStack();

  order.taker = event.params.taker;
  order.realTaker = event.params.taker; // for market order realTaker == event.params.taker
  order.takerGot = event.params.takerGot;
  order.takerGave = event.params.takerGave;
  order.penalty = event.params.penalty;
  order.feePaid = event.params.feePaid;

  order.save();

  removeOrderFromStack();
}

export function handleOrderStart(event: OrderStart): void {
  const order = new Order(`${event.transaction.hash.toHex()}-${event.logIndex.toHex()}`);
  order.transactionHash = Bytes.fromUTF8(event.transaction.hash.toHex());
  order.type = "MARKET";
  order.save();

  addOrderToStack(order);
}

export function handlePosthookFail(event: PosthookFail): void {}

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
  }

  market.active = event.params.value;

  market.save();
}

export function handleSetDensity(event: SetDensity): void {}

export function handleSetFee(event: SetFee): void {}

export function handleSetGasbase(event: SetGasbase): void {}

export function handleSetGasmax(event: SetGasmax): void {}

export function handleSetGasprice(event: SetGasprice): void {}

export function handleSetGovernance(event: SetGovernance): void {}

export function handleSetMonitor(event: SetMonitor): void {}

export function handleSetNotify(event: SetNotify): void {}

export function handleSetUseOracle(event: SetUseOracle): void {}
