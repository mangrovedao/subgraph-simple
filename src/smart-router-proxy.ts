import { MakerBind, MakerUnbind, SetAdmin, SetRouteLogic } from "../generated/templates/SmartRouterProxy/SmartRouter";
import { getOfferId } from "./helpers";
import { AmplifiedOffer, LimitOrder, Market, Offer } from "../generated/schema";
import { log } from "matchstick-as";

export function handleMakerBind(event: MakerBind): void {}

export function handleMakerUnbind(event: MakerUnbind): void {}

export function handleSetAdmin(event: SetAdmin): void {}

export function handleSetRouteLogic(event: SetRouteLogic): void {
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
  if (offer.limitOrder) {
    setLogicOnLimitOrder(offer, event);
  } else if (offer.amplifiedOffer) {
    setLogicOnAmplifiedOffer(offer, event);
  }
}

function setLogicOnLimitOrder(offer: Offer, event: SetRouteLogic): void {
  const limitOrderId = offer.limitOrder!;

  const limitOrder = LimitOrder.load(limitOrderId);
  if (!limitOrder) {
    log.error("Setting logic on mangrove order: missing mangrove order with id: {}", [limitOrderId]);
    return;
  }

  const market = Market.load(offer.market)!;

  if (event.params.token.equals(market.outbound_tkn)) {
    limitOrder.outboundRoute = event.params.logic;
  } else if (event.params.token.equals(market.inbound_tkn)) {
    limitOrder.inboundRoute = event.params.logic;
  } else {
    return;
  }
  limitOrder.save();
}

function setLogicOnAmplifiedOffer(offer: Offer, event: SetRouteLogic): void {
  const amplifiedOfferId = offer.amplifiedOffer!;

  const amplifiedOffer = AmplifiedOffer.load(amplifiedOfferId);
  if (!amplifiedOffer) {
    log.error("Setting logic on mangrove order: missing mangrove order with id: {}", [amplifiedOfferId]);
    return;
  }

  const market = Market.load(offer.market)!;

  if (event.params.token.equals(market.outbound_tkn)) {
    amplifiedOffer.outboundRoute = event.params.logic;
  } else if (event.params.token.equals(market.inbound_tkn)) {
    amplifiedOffer.inboundRoute = event.params.logic;
  } else {
    return;
  }
  amplifiedOffer.save();
}
