import { newMockEvent } from "matchstick-as";
import { ethereum, BigInt, Bytes, Address } from "@graphprotocol/graph-ts";
import { EndBundle, InitBundle, LogIncident, NewOwnedOffer, SetAdmin, SetReneging } from "../../generated/MangroveAmplifier/MangroveAmplifier";

export function createEndBundleEvent(): EndBundle {
  let endBundleEvent = changetype<EndBundle>(newMockEvent());

  endBundleEvent.parameters = new Array();

  return endBundleEvent;
}

export function createInitBundleEvent(bundleId: BigInt, outboundToken: Address): InitBundle {
  let initBundleEvent = changetype<InitBundle>(newMockEvent());

  initBundleEvent.parameters = new Array();

  initBundleEvent.parameters.push(new ethereum.EventParam("bundleId", ethereum.Value.fromUnsignedBigInt(bundleId)));
  initBundleEvent.parameters.push(new ethereum.EventParam("outboundToken", ethereum.Value.fromAddress(outboundToken)));

  return initBundleEvent;
}

export function createLogIncidentEvent(olKeyHash: Bytes, offerId: BigInt, makerData: Bytes, mgvData: Bytes): LogIncident {
  let logIncidentEvent = changetype<LogIncident>(newMockEvent());

  logIncidentEvent.parameters = new Array();

  logIncidentEvent.parameters.push(new ethereum.EventParam("olKeyHash", ethereum.Value.fromFixedBytes(olKeyHash)));
  logIncidentEvent.parameters.push(new ethereum.EventParam("offerId", ethereum.Value.fromUnsignedBigInt(offerId)));
  logIncidentEvent.parameters.push(new ethereum.EventParam("makerData", ethereum.Value.fromFixedBytes(makerData)));
  logIncidentEvent.parameters.push(new ethereum.EventParam("mgvData", ethereum.Value.fromFixedBytes(mgvData)));

  return logIncidentEvent;
}

export function createNewOwnedOfferEvent(olKeyHash: Bytes, offerId: BigInt, owner: Address): NewOwnedOffer {
  let newOwnedOfferEvent = changetype<NewOwnedOffer>(newMockEvent());

  newOwnedOfferEvent.parameters = new Array();

  newOwnedOfferEvent.parameters.push(new ethereum.EventParam("olKeyHash", ethereum.Value.fromFixedBytes(olKeyHash)));
  newOwnedOfferEvent.parameters.push(new ethereum.EventParam("offerId", ethereum.Value.fromUnsignedBigInt(offerId)));
  newOwnedOfferEvent.parameters.push(new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner)));

  return newOwnedOfferEvent;
}

export function createSetAdminEvent(admin: Address): SetAdmin {
  let setAdminEvent = changetype<SetAdmin>(newMockEvent());

  setAdminEvent.parameters = new Array();

  setAdminEvent.parameters.push(new ethereum.EventParam("admin", ethereum.Value.fromAddress(admin)));

  return setAdminEvent;
}

export function createSetRenegingEvent(olKeyHash: Bytes, offerId: BigInt, date: BigInt, volume: BigInt): SetReneging {
  let setRenegingEvent = changetype<SetReneging>(newMockEvent());

  setRenegingEvent.parameters = new Array();

  setRenegingEvent.parameters.push(new ethereum.EventParam("olKeyHash", ethereum.Value.fromFixedBytes(olKeyHash)));
  setRenegingEvent.parameters.push(new ethereum.EventParam("offerId", ethereum.Value.fromUnsignedBigInt(offerId)));
  setRenegingEvent.parameters.push(new ethereum.EventParam("date", ethereum.Value.fromUnsignedBigInt(date)));
  setRenegingEvent.parameters.push(new ethereum.EventParam("volume", ethereum.Value.fromUnsignedBigInt(volume)));

  return setRenegingEvent;
}
