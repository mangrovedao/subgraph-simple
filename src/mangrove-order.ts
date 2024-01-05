import { log } from "matchstick-as";
import {
  LogIncident,
  MangroveOrderComplete,
  MangroveOrderStart,
  NewOwnedOffer,
  SetAdmin,
  SetReneging,
} from "../generated/MangroveOrder/MangroveOrder";
import { MangroveOrder, Offer } from "../generated/schema";
import { getEventUniqueId, getOfferId, getOrCreateAccount } from "./helpers";
import { addMangroveOrderToStack, getLatestMangroveOrderFromStack, removeLatestMangroveOrderFromStack } from "./stack";

export function handleLogIncident(event: LogIncident): void {}

export const mangroveOrderSetIsOpen = (mangroveOrderId: string | null, value: boolean): void => {
  if(mangroveOrderId === null){
    return;
  }
  const mangroveOrder = MangroveOrder.load(mangroveOrderId);
  if (!mangroveOrder) {
    return;
  }
  mangroveOrder.isOpen = value;

  mangroveOrder.save();
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
  const mangroveOrder = getLatestMangroveOrderFromStack();
  if( mangroveOrder !== null){
    mangroveOrder.offer = offer.id;
    mangroveOrder.isOpen = true;
    offer.mangroveOrder = mangroveOrder.id;
    mangroveOrder.save();
  } else {
    throw new Error(`Missing mangrove order for offer id:${offer.offerId} - market: ${offer.market} - tx: ${event.transaction.hash.toHex()}`);
  }
  offer.save();
}

export function handleMangroveOrderStart(event: MangroveOrderStart): void {
  let mangroveOrder = new MangroveOrder(getEventUniqueId(event));
  mangroveOrder.realTaker = getOrCreateAccount(event.params.taker, event.block.timestamp, true).id;
  mangroveOrder.orderType = i32(event.params.orderType);
  mangroveOrder.creationDate = event.block.timestamp;
  mangroveOrder.latestUpdateDate = event.block.timestamp;
  mangroveOrder.isOpen = false;

  mangroveOrder.inboundRoute = event.params.takerWantsLogic;
  mangroveOrder.outboundRoute = event.params.takerGivesLogic;

  mangroveOrder.save();
  addMangroveOrderToStack(mangroveOrder);
}

export function handleMangroveOrderComplete(event: MangroveOrderComplete): void {
  removeLatestMangroveOrderFromStack();
}

export function handleSetAdmin(event: SetAdmin): void {}

export function handleSetReneging(event: SetReneging): void {
  const offerId = getOfferId(
    event.params.olKeyHash,
    event.params.offerId,
  );
  const mangroveOrder = getLatestMangroveOrderFromStack();
  if (!mangroveOrder) {
    log.debug("Missing mangrove order for offerId {}", [offerId]);
    return;
  }
  mangroveOrder.expiryDate = event.params.date;
  mangroveOrder.maxVolume = event.params.volume;
  mangroveOrder.latestUpdateDate= event.block.timestamp;
  mangroveOrder.save();
}
