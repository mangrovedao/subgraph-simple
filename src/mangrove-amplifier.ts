import { log } from "matchstick-as";
import { EndBundle as EndBundleEvent, InitBundle as InitBundleEvent } from "../generated/MangroveAmplifier/MangroveAmplifier";
import { Offer, AmplifiedOffer, AmplifiedOfferBundle } from "../generated/schema";
import { getEventUniqueId } from "./helpers";
import { addBundleToStack, getLatestBundleFromStack, removeLatestBundleFromStack } from "./stack";

export function addOfferToCurrentBundle(offer: Offer): void {
  const bundle = getLatestBundleFromStack();
  if (bundle === null) {
    return;
  }

  const amplifiedOffer = new AmplifiedOffer(offer.id);
  amplifiedOffer.bundle = bundle.id;
  amplifiedOffer.save();

  bundle.offers = bundle.offers.concat([amplifiedOffer.id]);
  bundle.save();

  offer.amplifiedOffer = amplifiedOffer.id;
  // offer.save();
}

export function handleInitBundle(event: InitBundleEvent): void {
  const entity = new AmplifiedOfferBundle(getEventUniqueId(event));
  entity.creationDate = event.block.timestamp;
  entity.offers = new Array<string>();
  entity.save();
  addBundleToStack(entity);
}

export function handleEndBundle(event: EndBundleEvent): void {
  removeLatestBundleFromStack();
}
