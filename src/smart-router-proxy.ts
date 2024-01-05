import {
  MakerBind,
  MakerUnbind,
  SetAdmin,
  SetRouteLogic,
} from "../generated/templates/SmartRouterProxy/SmartRouter";
import { getOfferId } from "./helpers";
import { AmplifiedOffer, AmplifiedOfferElement, MangroveOrder, Market, Offer } from "../generated/schema";

export function handleMakerBind(event: MakerBind): void {}

export function handleMakerUnbind(event: MakerUnbind): void {}

export function handleSetAdmin(event: SetAdmin): void {}

export function handleSetRouteLogic(event: SetRouteLogic): void {
  setLogicOnMangroveOrder(event);
  setLogicOnBundle(event);
}

function setLogicOnMangroveOrder(event: SetRouteLogic): void {
  const _offerId = event.params.offerId;
  if (_offerId.isZero()) return;
  const offerId = getOfferId(event.params.olKeyHash, event.params.offerId);
  const offer = Offer.load(offerId);
  if (!offer) return;
  const mangroveOrderId = offer.mangroveOrder;
  if (mangroveOrderId === null) return;
  const mangroveOrder = MangroveOrder.load(mangroveOrderId);
  if (!mangroveOrder) return;
  const market = Market.load(offer.market);
  if (!market) return;
  if (event.params.token.equals(market.outbound_tkn)) {
    mangroveOrder.outboundRoute = event.params.logic;
  } else if (event.params.token.equals(market.inbound_tkn)) {
    mangroveOrder.inboundRoute = event.params.logic;
  } else {
    return;
  }
  mangroveOrder.save();
}

function setLogicOnBundle(event: SetRouteLogic): void {
  const _offerId = event.params.offerId;
  if (_offerId.isZero()) return;
  const offerId = getOfferId(event.params.olKeyHash, event.params.offerId);
  const offer = Offer.load(offerId);
  if (!offer) return;
  const amplifiedOfferID = offer.amplifiedOffer;
  if (amplifiedOfferID === null) return;
  const amplifiedOffer = AmplifiedOffer.load(amplifiedOfferID);
  if (!amplifiedOffer) return;
  const market = Market.load(offer.market);
  if (!market) return;
  if (event.params.token.equals(market.outbound_tkn)) {
    amplifiedOffer.outboundLogic = event.params.logic;
  } else if (event.params.token.equals(market.inbound_tkn)) {
    // iterate over all offers in the beundle to find the one with the same inbound token
    const amplifiedOfferElemetIds = amplifiedOffer.offers;
    for (let i = 0; i < amplifiedOfferElemetIds.length; i++) {
      const el = AmplifiedOfferElement.load(amplifiedOfferElemetIds[i]);
      if (!el) continue;
      const offer = Offer.load(el.offer);
      if (!offer) continue;
      const market = Market.load(offer.market);
      if (!market) continue;
      if (event.params.token.equals(market.inbound_tkn)) {
        el.inboundLogic = event.params.logic;
        el.save();
        break;
      }
    } 
  } else {
    return;
  }
}
