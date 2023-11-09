import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
  Credit,
  Debit,
  LogIncident,
  Mgv,
  PopulateEnd,
  PopulateStart,
  RetractEnd,
  RetractStart,
  SetAdmin,
  SetBaseQuoteTickOffset,
  SetGasprice,
  SetGasreq,
  SetIndexMapping,
  SetLength,
  SetReserveId,
  SetRouter,
  SetStepSize
} from "../../generated/templates/Kandel/Kandel"

export function createCreditEvent(token: Address, amount: BigInt): Credit {
  let creditEvent = changetype<Credit>(newMockEvent())

  creditEvent.parameters = new Array()

  creditEvent.parameters.push(
    new ethereum.EventParam("token", ethereum.Value.fromAddress(token))
  )
  creditEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return creditEvent
}

export function createDebitEvent(token: Address, amount: BigInt): Debit {
  let debitEvent = changetype<Debit>(newMockEvent())

  debitEvent.parameters = new Array()

  debitEvent.parameters.push(
    new ethereum.EventParam("token", ethereum.Value.fromAddress(token))
  )
  debitEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return debitEvent
}

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

export function createOfferListKeyEvent(olKeyHash: Bytes): Pair {
  let pairEvent = changetype<Pair>(newMockEvent())

  pairEvent.parameters = new Array()

  pairEvent.parameters.push(
    new ethereum.EventParam("olKeyHash", ethereum.Value.fromBytes(olKeyHash))
  )

  return pairEvent
}

export function createPopulateEndEvent(): PopulateEnd {
  let populateEndEvent = changetype<PopulateEnd>(newMockEvent())

  populateEndEvent.parameters = new Array()

  return populateEndEvent
}

export function createPopulateStartEvent(): PopulateStart {
  let populateStartEvent = changetype<PopulateStart>(newMockEvent())

  populateStartEvent.parameters = new Array()

  return populateStartEvent
}

export function createRetractEndEvent(): RetractEnd {
  let retractEndEvent = changetype<RetractEnd>(newMockEvent())

  retractEndEvent.parameters = new Array()

  return retractEndEvent
}

export function createRetractStartEvent(): RetractStart {
  let retractStartEvent = changetype<RetractStart>(newMockEvent())

  retractStartEvent.parameters = new Array()

  return retractStartEvent
}

export function createSetAdminEvent(admin: Address): SetAdmin {
  let setAdminEvent = changetype<SetAdmin>(newMockEvent())

  setAdminEvent.parameters = new Array()

  setAdminEvent.parameters.push(
    new ethereum.EventParam("admin", ethereum.Value.fromAddress(admin))
  )

  return setAdminEvent
}

export function createSetBaseQuoteTickOffsetEvent(
  baseQuoteTickOffset: BigInt
): SetBaseQuoteTickOffset {
  let setCompoundRatesEvent = changetype<SetBaseQuoteTickOffset>(newMockEvent())

  setCompoundRatesEvent.parameters = new Array()

  setCompoundRatesEvent.parameters.push(
    new ethereum.EventParam(
      "value",
      ethereum.Value.fromUnsignedBigInt(baseQuoteTickOffset)
    )
  )

  return setCompoundRatesEvent
}

export function createSetGaspriceEvent(value: BigInt): SetGasprice {
  let setGaspriceEvent = changetype<SetGasprice>(newMockEvent())

  setGaspriceEvent.parameters = new Array()

  setGaspriceEvent.parameters.push(
    new ethereum.EventParam("value", ethereum.Value.fromUnsignedBigInt(value))
  )

  return setGaspriceEvent
}

export function createSetGasreqEvent(value: BigInt): SetGasreq {
  let setGasreqEvent = changetype<SetGasreq>(newMockEvent())

  setGasreqEvent.parameters = new Array()

  setGasreqEvent.parameters.push(
    new ethereum.EventParam("value", ethereum.Value.fromUnsignedBigInt(value))
  )

  return setGasreqEvent
}

export function createSetIndexMappingEvent(
  ba: i32,
  index: BigInt,
  offerId: BigInt
): SetIndexMapping {
  let setIndexMappingEvent = changetype<SetIndexMapping>(newMockEvent())

  setIndexMappingEvent.parameters = new Array()

  setIndexMappingEvent.parameters.push(
    new ethereum.EventParam(
      "ba",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(ba))
    )
  )
  setIndexMappingEvent.parameters.push(
    new ethereum.EventParam("index", ethereum.Value.fromUnsignedBigInt(index))
  )
  setIndexMappingEvent.parameters.push(
    new ethereum.EventParam(
      "offerId",
      ethereum.Value.fromUnsignedBigInt(offerId)
    )
  )

  return setIndexMappingEvent
}

export function createSetLengthEvent(value: BigInt): SetLength {
  let setLengthEvent = changetype<SetLength>(newMockEvent())

  setLengthEvent.parameters = new Array()

  setLengthEvent.parameters.push(
    new ethereum.EventParam("value", ethereum.Value.fromUnsignedBigInt(value))
  )

  return setLengthEvent
}

export function createSetReserveIdEvent(reserveId: Address): SetReserveId {
  let setReserveIdEvent = changetype<SetReserveId>(newMockEvent())

  setReserveIdEvent.parameters = new Array()

  setReserveIdEvent.parameters.push(
    new ethereum.EventParam("reserveId", ethereum.Value.fromAddress(reserveId))
  )

  return setReserveIdEvent
}

export function createSetRouterEvent(router: Address): SetRouter {
  let setRouterEvent = changetype<SetRouter>(newMockEvent())

  setRouterEvent.parameters = new Array()

  setRouterEvent.parameters.push(
    new ethereum.EventParam("router", ethereum.Value.fromAddress(router))
  )

  return setRouterEvent
}

// setStepSize
export function createSetStepSizeEvent(value: BigInt): SetStepSize {
    let setStepSizeEvent = changetype<SetStepSize>(newMockEvent())
    
    setStepSizeEvent.parameters = new Array()
    
    setStepSizeEvent.parameters.push(
        new ethereum.EventParam("value", ethereum.Value.fromUnsignedBigInt(value))
    )
    
    return setStepSizeEvent
}
