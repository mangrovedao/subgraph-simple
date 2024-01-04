import {MakerBind, MakerUnbind, SetAdmin, SetRouteLogic} from "../generated/templates/SmartRouterProxy/SmartRouter"
import { getOfferId } from "./helpers";
import { MangroveOrder, Market, Offer } from "../generated/schema";

export function handleMakerBind(event: MakerBind): void {}

export function handleMakerUnbind(event: MakerUnbind): void {}

export function handleSetAdmin(event: SetAdmin): void {}

export function handleSetRouteLogic(event: SetRouteLogic): void {
  const _offerId = event.params.offerId;
  if (_offerId.isZero()) return;
  const offerId = getOfferId(
    event.params.olKeyHash, 
    event.params.offerId
  );
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