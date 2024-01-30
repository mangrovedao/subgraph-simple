import {
  MakerBind,
  MakerUnbind,
  SetAdmin,
  SetRouteLogic,
} from "../generated/templates/SmartRouterProxy/SmartRouter";
import { getOfferId } from "./helpers";
import { AmplifiedOffer, AmplifiedOfferElement, LimitOrder, Market, Offer } from "../generated/schema";
import { log } from "matchstick-as";

export function handleMakerBind(event: MakerBind): void {}

export function handleMakerUnbind(event: MakerUnbind): void {}

export function handleSetAdmin(event: SetAdmin): void {}

export function handleSetRouteLogic(event: SetRouteLogic): void {
  setLogicOnLimitOrder(event);
  // setLogicOnBundle(event);
}

function setLogicOnLimitOrder(event: SetRouteLogic): void {
  const _offerId = event.params.offerId;
  if (_offerId.isZero()) {
    return;
  }

  const offerId = getOfferId(event.params.olKeyHash, event.params.offerId);
  const offer = Offer.load(offerId);
  if (!offer) {
    log.error("Setting logic on mangrove order: missing offer with id: {}", [offerId]);
    return;
  }

  const limitOrderId = offer.limitOrder;

  if (limitOrderId === null) {
    return;
  }

  const limitOrder = LimitOrder.load(limitOrderId);
  if (!limitOrder) {
    log.error("Setting logic on mangrove order: missing mangrove order with id: {}", [limitOrderId]);
    return;
  }

  const market = Market.load(offer.market);
  if (!market) {
    log.error("Setting logic on mangrove order: missing market with id: {}", [offer.market]);
    return;
  }

  if (event.params.token.equals(market.outbound_tkn)) {
    limitOrder.outboundRoute = event.params.logic;
  } else if (event.params.token.equals(market.inbound_tkn)) {
    limitOrder.inboundRoute = event.params.logic;
  } else {
    return;
  }
  limitOrder.save();
}

function setLogicOnBundle(event: SetRouteLogic): void {
  const _offerId = event.params.offerId;
  if (_offerId.isZero()) return;
  const offerId = getOfferId(event.params.olKeyHash, event.params.offerId);
  const offer = Offer.load(offerId);
  if (!offer) {
    log.error("Setting logic on amplified offer: missing offer with id: {}", [offerId]);
    return;
  }
  const amplifiedOfferID = offer.amplifiedOffer;
  if (amplifiedOfferID === null) return;
  const amplifiedOffer = AmplifiedOffer.load(amplifiedOfferID);
  if (!amplifiedOffer) {
    log.error("Setting logic on amplified offer: missing amplified offer with id: {}", [amplifiedOfferID]);
    return;
  }
  const market = Market.load(offer.market);
  if (!market) {
    log.error("Setting logic on amplified offer: missing market with id: {}", [offer.market]);
    return;
  }
  if (event.params.token.equals(market.outbound_tkn)) {
    amplifiedOffer.outboundLogic = event.params.logic;
  } else if (event.params.token.equals(market.inbound_tkn)) {
    // iterate over all offers in the beundle to find the one with the same inbound token
    const amplifiedOfferElemetIds = amplifiedOffer.offers;
    let set = false;
    for (let i = 0; i < amplifiedOfferElemetIds.length; i++) {
      const el = AmplifiedOfferElement.load(amplifiedOfferElemetIds[i]);
      if (!el) {
        log.error("Setting logic on amplified offer: missing amplified offer element with id: {}", [
          amplifiedOfferElemetIds[i],
        ]);
        continue;
      }
      const offer = Offer.load(el.offer);
      if (!offer) {
        log.error("Setting logic on amplified offer: missing offer with id: {}", [el.offer]);
        continue;
      }
      const market = Market.load(offer.market);
      if (!market) {
        log.error("Setting logic on amplified offer: missing market with id: {}", [offer.market]);
        continue;
      }
      if (event.params.token.equals(market.inbound_tkn)) {
        el.inboundLogic = event.params.logic;
        el.save();
        set = true;
        break;
      }
    }
    if (!set) {
      log.error("Setting logic on amplified offer: missing offer with inbound token: {}", [
        event.params.token.toHex(),
      ]);
      return;
    }
  } else {
    return;
  }
}
