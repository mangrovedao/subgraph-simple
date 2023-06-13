import { log } from "matchstick-as";
import {
  LogIncident,
  Mgv,
  NewOwnedOffer,
  OrderSummary,
  SetAdmin,
  SetExpiry,
  SetRouter
} from "../generated/MangroveOrder/MangroveOrder"
import { Offer } from "../generated/schema"
import { getOfferId } from "./helpers"

export function handleLogIncident(event: LogIncident): void {}

export function handleMgv(event: Mgv): void {}

export function handleNewOwnedOffer(event: NewOwnedOffer): void {
  const offerId = getOfferId(
    event.params.outbound_tkn, 
    event.params.inbound_tkn, 
    event.params.offerId
  );
  const offer = Offer.load(offerId)!;

  log.debug("offerId {} {}", [offerId, event.params.owner.toHex()]);
  offer.owner = event.params.owner;

  offer.save();
}

export function handleOrderSummary(event: OrderSummary): void {}

export function handleSetAdmin(event: SetAdmin): void {}

export function handleSetExpiry(event: SetExpiry): void {}

export function handleSetRouter(event: SetRouter): void {}
