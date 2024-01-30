import {
  InitBundle,
  EndBundle,
} from "../generated/MangroveAmplifier/MangroveAmplifier";

import { AmplifiedOffer, AmplifiedOfferElement, Offer } from "../generated/schema";
import { addBundleToStack, getLatestBundleFromStack, removeLatestBundleFromStack } from "./stack";

export function getAmplifiedElementId(
  bundle: AmplifiedOffer,
  offer: Offer,
): string {
  return "bundle:" + bundle.id + "-" + offer.id;
}

export function addOfferToCurrentBundle(
  offer: Offer,
): void {
  const bundle = getLatestBundleFromStack();
  if (bundle === null) {
    return;
  }
  offer.amplifiedOffer = bundle.id;
  const id = getAmplifiedElementId(bundle, offer);
  const amplifiedElement = new AmplifiedOfferElement(id);
  amplifiedElement.offer = offer.id;
  amplifiedElement.save();
  bundle.offers.push(offer.id);
  bundle.save();
}

export function handleInitBundle(event: InitBundle): void {
  const amplifiedOffer = new AmplifiedOffer(event.params.bundleId.toHex());
  amplifiedOffer.offers = [];
  amplifiedOffer.creationDate = event.block.timestamp;
  amplifiedOffer.save();
  addBundleToStack(amplifiedOffer);
}

export function handleEndBundle(event: EndBundle): void {
  removeLatestBundleFromStack();
}