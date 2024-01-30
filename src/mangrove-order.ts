import { log } from "matchstick-as";
import {
  LogIncident,
  MangroveOrderComplete,
  MangroveOrderStart,
  NewOwnedOffer,
  SetAdmin,
  SetReneging,
} from "../generated/MangroveOrder/MangroveOrder";
import { LimitOrder, Offer } from "../generated/schema";
import { getEventUniqueId, getOfferId, getOrCreateAccount } from "./helpers";
import { addLimitOrderToStack, getLatestLimitOrderFromStack, removeLatestLimitOrderFromStack } from "./stack";

export function handleLogIncident(event: LogIncident): void {}

export const limitOrderSetIsOpen = (limitOrderId: string | null, value: boolean): void => {
  if(limitOrderId === null){
    return;
  }
  const limitOrder = LimitOrder.load(limitOrderId);
  if (!limitOrder) {
    return;
  }
  limitOrder.isOpen = value;

  limitOrder.save();
}

export function handleNewOwnedOffer(event: NewOwnedOffer): void {
  const offerId = getOfferId(
    event.params.olKeyHash, 
    event.params.offerId
  );
  const offer = Offer.load(offerId);
  if (!offer) {
    log.error("missing offer with id: {}", [offerId]);
    return;
  }

  const owner = getOrCreateAccount(event.params.owner, event.block.timestamp, true);
  offer.owner = owner.id;
  const limitOrder = getLatestLimitOrderFromStack();
  if( limitOrder !== null){
    limitOrder.offer = offer.id;
    limitOrder.isOpen = true;
    offer.limitOrder = limitOrder.id;
    limitOrder.save();
  } else {
    throw new Error(`Missing mangrove order for offer id:${offer.offerId} - market: ${offer.market} - tx: ${event.transaction.hash.toHex()}`);
  }
  offer.save();
}

export function handleMangroveOrderStart(event: MangroveOrderStart): void {
  let limitOrder = new LimitOrder(getEventUniqueId(event));
  limitOrder.realTaker = getOrCreateAccount(event.params.taker, event.block.timestamp, true).id;
  limitOrder.orderType = event.params.orderType;
  limitOrder.creationDate = event.block.timestamp;
  limitOrder.latestUpdateDate = event.block.timestamp;
  limitOrder.isOpen = false;
  limitOrder.fillVolume = event.params.fillVolume;
  limitOrder.fillWants = event.params.fillWants;
  limitOrder.tick = event.params.tick;

  limitOrder.inboundRoute = event.params.takerWantsLogic;
  limitOrder.outboundRoute = event.params.takerGivesLogic;

  limitOrder.save();
  addLimitOrderToStack(limitOrder);
}

export function handleMangroveOrderComplete(event: MangroveOrderComplete): void {
  removeLatestLimitOrderFromStack();
}

export function handleSetAdmin(event: SetAdmin): void {}

export function handleSetReneging(event: SetReneging): void {
  const offerId = getOfferId(
    event.params.olKeyHash,
    event.params.offerId,
  );
  const limitOrder = getLatestLimitOrderFromStack();
  if (!limitOrder) {
    log.debug("Missing mangrove order for offerId {}", [offerId]);
    return;
  }
  limitOrder.expiryDate = event.params.date;
  limitOrder.maxVolume = event.params.volume;
  limitOrder.latestUpdateDate= event.block.timestamp;
  limitOrder.save();
}
