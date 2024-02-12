import {
  InitBundle,
  EndBundle,
} from "../generated/MangroveAmplifier/MangroveAmplifier";

import { AmplifiedOffer, AmplifiedOfferBundle, Offer } from "../generated/schema";
import { addBundleToStack, getLatestBundleFromStack, removeLatestBundleFromStack } from "./stack";

export function addOfferToCurrentBundle(
  offer: Offer,
): void {
  const bundle = getLatestBundleFromStack();
  if (bundle === null) {
    return;
  }
  const amplifiedOffer = new AmplifiedOffer(offer.id);
  amplifiedOffer.bundle = bundle.id 
  amplifiedOffer.save();

  offer.amplifiedOffer = amplifiedOffer.id;
  offer.save();
}

export function handleInitBundle(event: InitBundle): void {
  const bundle = new AmplifiedOfferBundle(event.params.bundleId.toHex());
  bundle.creationDate = event.block.timestamp;
  bundle.save();
  addBundleToStack(bundle);
}

export function handleEndBundle(event: EndBundle): void {
  removeLatestBundleFromStack();
}
