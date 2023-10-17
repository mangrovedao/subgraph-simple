import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
  LogIncident,
  Mgv,
  NewOwnedOffer,
  MangroveOrderStart,
  SetAdmin,
  SetExpiry,
  SetRouter,
  MangroveOrderComplete
} from "../../generated/MangroveOrder/MangroveOrder"

export function createLogIncidentEvent(
  mangrove: Address,
  olKeyHash: Bytes,
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
      "olKeyHash",
      ethereum.Value.fromAddress(olKeyHash)
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

export function createMangroveOrderCompleteEvent(): MangroveOrderComplete {
  let mangroveOrderCompleteEvent = changetype<MangroveOrderComplete>(
    newMockEvent()
  )
  return mangroveOrderCompleteEvent
}

export function createMangroveOrderStartEvent(
  olKeyHash: Bytes,
  taker: Address,
  fillOrKill: boolean,
  tick: BigInt,
  fillVolume: BigInt,
  fillWants: boolean,
  resitingOrder: boolean,
  offerId: BigInt,
): MangroveOrderStart {
  let mangroveOrderStartEvent = changetype<MangroveOrderStart>(newMockEvent())

  mangroveOrderStartEvent.parameters = new Array()

  mangroveOrderStartEvent.parameters.push(
    new ethereum.EventParam(
      "olKeyHash",
      ethereum.Value.fromBytes(olKeyHash)
    )
  )
  mangroveOrderStartEvent.parameters.push(
    new ethereum.EventParam("taker", ethereum.Value.fromAddress(taker))
  )
  mangroveOrderStartEvent.parameters.push(
    new ethereum.EventParam(
      "fillOrKill",
      ethereum.Value.fromBoolean(fillOrKill)
    )
  )
  mangroveOrderStartEvent.parameters.push(
    new ethereum.EventParam("tick", ethereum.Value.fromUnsignedBigInt(tick))
  )
  mangroveOrderStartEvent.parameters.push(
    new ethereum.EventParam(
      "fillVolume",
      ethereum.Value.fromUnsignedBigInt(fillVolume)
    )
  )
  mangroveOrderStartEvent.parameters.push(
    new ethereum.EventParam(
      "fillWants",
      ethereum.Value.fromBoolean(fillWants)
    )
  )
  mangroveOrderStartEvent.parameters.push(
    new ethereum.EventParam(
      "resitingOrder",
      ethereum.Value.fromBoolean(resitingOrder)
    )
  )
  mangroveOrderStartEvent.parameters.push(
    new ethereum.EventParam(
      "offerId",
      ethereum.Value.fromUnsignedBigInt(offerId)
    )
  )


  return mangroveOrderStartEvent
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
  olKeyHash: Bytes,
  offerId: BigInt,
  owner: Address
): NewOwnedOffer {
  let newOwnedOfferEvent = changetype<NewOwnedOffer>(newMockEvent())

  newOwnedOfferEvent.parameters = new Array()

  newOwnedOfferEvent.parameters.push(
    new ethereum.EventParam(
      "olKeyHash",
      ethereum.Value.fromBytes(olKeyHash)
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

export function createSetAdminEvent(admin: Address): SetAdmin {
  let setAdminEvent = changetype<SetAdmin>(newMockEvent())

  setAdminEvent.parameters = new Array()

  setAdminEvent.parameters.push(
    new ethereum.EventParam("admin", ethereum.Value.fromAddress(admin))
  )

  return setAdminEvent
}

export function createSetExpiryEvent(
  olKeyHash: Bytes,
  offerId: BigInt,
  date: BigInt
): SetExpiry {
  let setExpiryEvent = changetype<SetExpiry>(newMockEvent())

  setExpiryEvent.parameters = new Array()

  setExpiryEvent.parameters.push(
    new ethereum.EventParam(
      "olKeyHash",
      ethereum.Value.fromBytes(olKeyHash)
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
