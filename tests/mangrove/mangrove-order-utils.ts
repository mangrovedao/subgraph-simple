import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
  LogIncident,
  Mgv,
  NewOwnedOffer,
  OrderSummary,
  SetAdmin,
  SetExpiry,
  SetRouter
} from "../../generated/MangroveOrder/MangroveOrder"

export function createLogIncidentEvent(
  mangrove: Address,
  outbound_tkn: Address,
  inbound_tkn: Address,
  offerId: BigInt,
  makerData: Bytes,
  mgvData: Bytes
): LogIncident {
  let logIncidentEvent = changetype<LogIncident>(newMockEvent())

  logIncidentEvent.parameters = new Array()

  logIncidentEvent.parameters.push(
    new ethereum.EventParam("mangrove", ethereum.Value.fromAddress(mangrove))
  )
  logIncidentEvent.parameters.push(
    new ethereum.EventParam(
      "outbound_tkn",
      ethereum.Value.fromAddress(outbound_tkn)
    )
  )
  logIncidentEvent.parameters.push(
    new ethereum.EventParam(
      "inbound_tkn",
      ethereum.Value.fromAddress(inbound_tkn)
    )
  )
  logIncidentEvent.parameters.push(
    new ethereum.EventParam(
      "offerId",
      ethereum.Value.fromUnsignedBigInt(offerId)
    )
  )
  logIncidentEvent.parameters.push(
    new ethereum.EventParam(
      "makerData",
      ethereum.Value.fromFixedBytes(makerData)
    )
  )
  logIncidentEvent.parameters.push(
    new ethereum.EventParam("mgvData", ethereum.Value.fromFixedBytes(mgvData))
  )

  return logIncidentEvent
}

export function createMgvEvent(mgv: Address): Mgv {
  let mgvEvent = changetype<Mgv>(newMockEvent())

  mgvEvent.parameters = new Array()

  mgvEvent.parameters.push(
    new ethereum.EventParam("mgv", ethereum.Value.fromAddress(mgv))
  )

  return mgvEvent
}

export function createNewOwnedOfferEvent(
  mangrove: Address,
  outbound_tkn: Address,
  inbound_tkn: Address,
  offerId: BigInt,
  owner: Address
): NewOwnedOffer {
  let newOwnedOfferEvent = changetype<NewOwnedOffer>(newMockEvent())

  newOwnedOfferEvent.parameters = new Array()

  newOwnedOfferEvent.parameters.push(
    new ethereum.EventParam("mangrove", ethereum.Value.fromAddress(mangrove))
  )
  newOwnedOfferEvent.parameters.push(
    new ethereum.EventParam(
      "outbound_tkn",
      ethereum.Value.fromAddress(outbound_tkn)
    )
  )
  newOwnedOfferEvent.parameters.push(
    new ethereum.EventParam(
      "inbound_tkn",
      ethereum.Value.fromAddress(inbound_tkn)
    )
  )
  newOwnedOfferEvent.parameters.push(
    new ethereum.EventParam(
      "offerId",
      ethereum.Value.fromUnsignedBigInt(offerId)
    )
  )
  newOwnedOfferEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  )

  return newOwnedOfferEvent
}

export function createOrderSummaryEvent(
  mangrove: Address,
  outbound_tkn: Address,
  inbound_tkn: Address,
  taker: Address,
  fillOrKill: boolean,
  takerWants: BigInt,
  takerGives: BigInt,
  fillWants: boolean,
  restingOrder: boolean,
  expiryDate: BigInt,
  takerGot: BigInt,
  takerGave: BigInt,
  bounty: BigInt,
  fee: BigInt,
  restingOrderId: BigInt
): OrderSummary {
  let orderSummaryEvent = changetype<OrderSummary>(newMockEvent())

  orderSummaryEvent.parameters = new Array()

  orderSummaryEvent.parameters.push(
    new ethereum.EventParam("mangrove", ethereum.Value.fromAddress(mangrove))
  )
  orderSummaryEvent.parameters.push(
    new ethereum.EventParam(
      "outbound_tkn",
      ethereum.Value.fromAddress(outbound_tkn)
    )
  )
  orderSummaryEvent.parameters.push(
    new ethereum.EventParam(
      "inbound_tkn",
      ethereum.Value.fromAddress(inbound_tkn)
    )
  )
  orderSummaryEvent.parameters.push(
    new ethereum.EventParam("taker", ethereum.Value.fromAddress(taker))
  )
  orderSummaryEvent.parameters.push(
    new ethereum.EventParam(
      "fillOrKill",
      ethereum.Value.fromBoolean(fillOrKill)
    )
  )
  orderSummaryEvent.parameters.push(
    new ethereum.EventParam(
      "takerWants",
      ethereum.Value.fromUnsignedBigInt(takerWants)
    )
  )
  orderSummaryEvent.parameters.push(
    new ethereum.EventParam(
      "takerGives",
      ethereum.Value.fromUnsignedBigInt(takerGives)
    )
  )
  orderSummaryEvent.parameters.push(
    new ethereum.EventParam("fillWants", ethereum.Value.fromBoolean(fillWants))
  )
  orderSummaryEvent.parameters.push(
    new ethereum.EventParam(
      "restingOrder",
      ethereum.Value.fromBoolean(restingOrder)
    )
  )
  orderSummaryEvent.parameters.push(
    new ethereum.EventParam(
      "expiryDate",
      ethereum.Value.fromUnsignedBigInt(expiryDate)
    )
  )
  orderSummaryEvent.parameters.push(
    new ethereum.EventParam(
      "takerGot",
      ethereum.Value.fromUnsignedBigInt(takerGot)
    )
  )
  orderSummaryEvent.parameters.push(
    new ethereum.EventParam(
      "takerGave",
      ethereum.Value.fromUnsignedBigInt(takerGave)
    )
  )
  orderSummaryEvent.parameters.push(
    new ethereum.EventParam("bounty", ethereum.Value.fromUnsignedBigInt(bounty))
  )
  orderSummaryEvent.parameters.push(
    new ethereum.EventParam("fee", ethereum.Value.fromUnsignedBigInt(fee))
  )
  orderSummaryEvent.parameters.push(
    new ethereum.EventParam(
      "restingOrderId",
      ethereum.Value.fromUnsignedBigInt(restingOrderId)
    )
  )

  return orderSummaryEvent
}

export function createSetAdminEvent(admin: Address): SetAdmin {
  let setAdminEvent = changetype<SetAdmin>(newMockEvent())

  setAdminEvent.parameters = new Array()

  setAdminEvent.parameters.push(
    new ethereum.EventParam("admin", ethereum.Value.fromAddress(admin))
  )

  return setAdminEvent
}

export function createSetExpiryEvent(
  outbound_tkn: Address,
  inbound_tkn: Address,
  offerId: BigInt,
  date: BigInt
): SetExpiry {
  let setExpiryEvent = changetype<SetExpiry>(newMockEvent())

  setExpiryEvent.parameters = new Array()

  setExpiryEvent.parameters.push(
    new ethereum.EventParam(
      "outbound_tkn",
      ethereum.Value.fromAddress(outbound_tkn)
    )
  )
  setExpiryEvent.parameters.push(
    new ethereum.EventParam(
      "inbound_tkn",
      ethereum.Value.fromAddress(inbound_tkn)
    )
  )
  setExpiryEvent.parameters.push(
    new ethereum.EventParam(
      "offerId",
      ethereum.Value.fromUnsignedBigInt(offerId)
    )
  )
  setExpiryEvent.parameters.push(
    new ethereum.EventParam("date", ethereum.Value.fromUnsignedBigInt(date))
  )

  return setExpiryEvent
}

export function createSetRouterEvent(router: Address): SetRouter {
  let setRouterEvent = changetype<SetRouter>(newMockEvent())

  setRouterEvent.parameters = new Array()

  setRouterEvent.parameters.push(
    new ethereum.EventParam("router", ethereum.Value.fromAddress(router))
  )

  return setRouterEvent
}
