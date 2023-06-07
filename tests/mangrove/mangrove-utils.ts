import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
  Approval,
  Credit,
  Debit,
  Kill,
  NewMgv,
  OfferFail,
  OfferRetract,
  OfferSuccess,
  OfferWrite,
  OrderComplete,
  OrderStart,
  PosthookFail,
  SetActive,
  SetDensity,
  SetFee,
  SetGasbase,
  SetGasmax,
  SetGasprice,
  SetGovernance,
  SetMonitor,
  SetNotify,
  SetUseOracle
} from "../../generated/Mangrove/Mangrove"

export function createApprovalEvent(
  outbound_tkn: Address,
  inbound_tkn: Address,
  owner: Address,
  spender: Address,
  value: BigInt
): Approval {
  let approvalEvent = changetype<Approval>(newMockEvent())

  approvalEvent.parameters = new Array()

  approvalEvent.parameters.push(
    new ethereum.EventParam(
      "outbound_tkn",
      ethereum.Value.fromAddress(outbound_tkn)
    )
  )
  approvalEvent.parameters.push(
    new ethereum.EventParam(
      "inbound_tkn",
      ethereum.Value.fromAddress(inbound_tkn)
    )
  )
  approvalEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  )
  approvalEvent.parameters.push(
    new ethereum.EventParam("spender", ethereum.Value.fromAddress(spender))
  )
  approvalEvent.parameters.push(
    new ethereum.EventParam("value", ethereum.Value.fromUnsignedBigInt(value))
  )

  return approvalEvent
}

export function createCreditEvent(maker: Address, amount: BigInt): Credit {
  let creditEvent = changetype<Credit>(newMockEvent())

  creditEvent.parameters = new Array()

  creditEvent.parameters.push(
    new ethereum.EventParam("maker", ethereum.Value.fromAddress(maker))
  )
  creditEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return creditEvent
}

export function createDebitEvent(maker: Address, amount: BigInt): Debit {
  let debitEvent = changetype<Debit>(newMockEvent())

  debitEvent.parameters = new Array()

  debitEvent.parameters.push(
    new ethereum.EventParam("maker", ethereum.Value.fromAddress(maker))
  )
  debitEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return debitEvent
}

export function createKillEvent(): Kill {
  let killEvent = changetype<Kill>(newMockEvent())

  killEvent.parameters = new Array()

  return killEvent
}

export function createNewMgvEvent(): NewMgv {
  let newMgvEvent = changetype<NewMgv>(newMockEvent())

  newMgvEvent.parameters = new Array()

  return newMgvEvent
}

export function createOfferFailEvent(
  outbound_tkn: Address,
  inbound_tkn: Address,
  id: BigInt,
  taker: Address,
  takerWants: BigInt,
  takerGives: BigInt,
  mgvData: Bytes
): OfferFail {
  let offerFailEvent = changetype<OfferFail>(newMockEvent())

  offerFailEvent.parameters = new Array()

  offerFailEvent.parameters.push(
    new ethereum.EventParam(
      "outbound_tkn",
      ethereum.Value.fromAddress(outbound_tkn)
    )
  )
  offerFailEvent.parameters.push(
    new ethereum.EventParam(
      "inbound_tkn",
      ethereum.Value.fromAddress(inbound_tkn)
    )
  )
  offerFailEvent.parameters.push(
    new ethereum.EventParam("id", ethereum.Value.fromUnsignedBigInt(id))
  )
  offerFailEvent.parameters.push(
    new ethereum.EventParam("taker", ethereum.Value.fromAddress(taker))
  )
  offerFailEvent.parameters.push(
    new ethereum.EventParam(
      "takerWants",
      ethereum.Value.fromUnsignedBigInt(takerWants)
    )
  )
  offerFailEvent.parameters.push(
    new ethereum.EventParam(
      "takerGives",
      ethereum.Value.fromUnsignedBigInt(takerGives)
    )
  )
  offerFailEvent.parameters.push(
    new ethereum.EventParam("mgvData", ethereum.Value.fromFixedBytes(mgvData))
  )

  return offerFailEvent
}

export function createOfferRetractEvent(
  outbound_tkn: Address,
  inbound_tkn: Address,
  id: BigInt,
  deprovision: boolean
): OfferRetract {
  let offerRetractEvent = changetype<OfferRetract>(newMockEvent())

  offerRetractEvent.parameters = new Array()

  offerRetractEvent.parameters.push(
    new ethereum.EventParam(
      "outbound_tkn",
      ethereum.Value.fromAddress(outbound_tkn)
    )
  )
  offerRetractEvent.parameters.push(
    new ethereum.EventParam(
      "inbound_tkn",
      ethereum.Value.fromAddress(inbound_tkn)
    )
  )
  offerRetractEvent.parameters.push(
    new ethereum.EventParam("id", ethereum.Value.fromUnsignedBigInt(id))
  )
  offerRetractEvent.parameters.push(
    new ethereum.EventParam(
      "deprovision",
      ethereum.Value.fromBoolean(deprovision)
    )
  )

  return offerRetractEvent
}

export function createOfferSuccessEvent(
  outbound_tkn: Address,
  inbound_tkn: Address,
  id: BigInt,
  taker: Address,
  takerWants: BigInt,
  takerGives: BigInt
): OfferSuccess {
  let offerSuccessEvent = changetype<OfferSuccess>(newMockEvent())

  offerSuccessEvent.parameters = new Array()

  offerSuccessEvent.parameters.push(
    new ethereum.EventParam(
      "outbound_tkn",
      ethereum.Value.fromAddress(outbound_tkn)
    )
  )
  offerSuccessEvent.parameters.push(
    new ethereum.EventParam(
      "inbound_tkn",
      ethereum.Value.fromAddress(inbound_tkn)
    )
  )
  offerSuccessEvent.parameters.push(
    new ethereum.EventParam("id", ethereum.Value.fromUnsignedBigInt(id))
  )
  offerSuccessEvent.parameters.push(
    new ethereum.EventParam("taker", ethereum.Value.fromAddress(taker))
  )
  offerSuccessEvent.parameters.push(
    new ethereum.EventParam(
      "takerWants",
      ethereum.Value.fromUnsignedBigInt(takerWants)
    )
  )
  offerSuccessEvent.parameters.push(
    new ethereum.EventParam(
      "takerGives",
      ethereum.Value.fromUnsignedBigInt(takerGives)
    )
  )

  return offerSuccessEvent
}

export function createOfferWriteEvent(
  outbound_tkn: Address,
  inbound_tkn: Address,
  maker: Address,
  wants: BigInt,
  gives: BigInt,
  gasprice: BigInt,
  gasreq: BigInt,
  id: BigInt,
  prev: BigInt
): OfferWrite {
  let offerWriteEvent = changetype<OfferWrite>(newMockEvent())

  offerWriteEvent.parameters = new Array()

  offerWriteEvent.parameters.push(
    new ethereum.EventParam(
      "outbound_tkn",
      ethereum.Value.fromAddress(outbound_tkn)
    )
  )
  offerWriteEvent.parameters.push(
    new ethereum.EventParam(
      "inbound_tkn",
      ethereum.Value.fromAddress(inbound_tkn)
    )
  )
  offerWriteEvent.parameters.push(
    new ethereum.EventParam("maker", ethereum.Value.fromAddress(maker))
  )
  offerWriteEvent.parameters.push(
    new ethereum.EventParam("wants", ethereum.Value.fromUnsignedBigInt(wants))
  )
  offerWriteEvent.parameters.push(
    new ethereum.EventParam("gives", ethereum.Value.fromUnsignedBigInt(gives))
  )
  offerWriteEvent.parameters.push(
    new ethereum.EventParam(
      "gasprice",
      ethereum.Value.fromUnsignedBigInt(gasprice)
    )
  )
  offerWriteEvent.parameters.push(
    new ethereum.EventParam("gasreq", ethereum.Value.fromUnsignedBigInt(gasreq))
  )
  offerWriteEvent.parameters.push(
    new ethereum.EventParam("id", ethereum.Value.fromUnsignedBigInt(id))
  )
  offerWriteEvent.parameters.push(
    new ethereum.EventParam("prev", ethereum.Value.fromUnsignedBigInt(prev))
  )

  return offerWriteEvent
}

export function createOrderCompleteEvent(
  outbound_tkn: Address,
  inbound_tkn: Address,
  taker: Address,
  takerGot: BigInt,
  takerGave: BigInt,
  penalty: BigInt,
  feePaid: BigInt
): OrderComplete {
  let orderCompleteEvent = changetype<OrderComplete>(newMockEvent())

  orderCompleteEvent.parameters = new Array()

  orderCompleteEvent.parameters.push(
    new ethereum.EventParam(
      "outbound_tkn",
      ethereum.Value.fromAddress(outbound_tkn)
    )
  )
  orderCompleteEvent.parameters.push(
    new ethereum.EventParam(
      "inbound_tkn",
      ethereum.Value.fromAddress(inbound_tkn)
    )
  )
  orderCompleteEvent.parameters.push(
    new ethereum.EventParam("taker", ethereum.Value.fromAddress(taker))
  )
  orderCompleteEvent.parameters.push(
    new ethereum.EventParam(
      "takerGot",
      ethereum.Value.fromUnsignedBigInt(takerGot)
    )
  )
  orderCompleteEvent.parameters.push(
    new ethereum.EventParam(
      "takerGave",
      ethereum.Value.fromUnsignedBigInt(takerGave)
    )
  )
  orderCompleteEvent.parameters.push(
    new ethereum.EventParam(
      "penalty",
      ethereum.Value.fromUnsignedBigInt(penalty)
    )
  )
  orderCompleteEvent.parameters.push(
    new ethereum.EventParam(
      "feePaid",
      ethereum.Value.fromUnsignedBigInt(feePaid)
    )
  )

  return orderCompleteEvent
}

export function createOrderStartEvent(): OrderStart {
  let orderStartEvent = changetype<OrderStart>(newMockEvent())

  orderStartEvent.parameters = new Array()

  return orderStartEvent
}

export function createPosthookFailEvent(
  outbound_tkn: Address,
  inbound_tkn: Address,
  offerId: BigInt,
  posthookData: Bytes
): PosthookFail {
  let posthookFailEvent = changetype<PosthookFail>(newMockEvent())

  posthookFailEvent.parameters = new Array()

  posthookFailEvent.parameters.push(
    new ethereum.EventParam(
      "outbound_tkn",
      ethereum.Value.fromAddress(outbound_tkn)
    )
  )
  posthookFailEvent.parameters.push(
    new ethereum.EventParam(
      "inbound_tkn",
      ethereum.Value.fromAddress(inbound_tkn)
    )
  )
  posthookFailEvent.parameters.push(
    new ethereum.EventParam(
      "offerId",
      ethereum.Value.fromUnsignedBigInt(offerId)
    )
  )
  posthookFailEvent.parameters.push(
    new ethereum.EventParam(
      "posthookData",
      ethereum.Value.fromFixedBytes(posthookData)
    )
  )

  return posthookFailEvent
}

export function createSetActiveEvent(
  outbound_tkn: Address,
  inbound_tkn: Address,
  value: boolean
): SetActive {
  let setActiveEvent = changetype<SetActive>(newMockEvent())

  setActiveEvent.parameters = new Array()

  setActiveEvent.parameters.push(
    new ethereum.EventParam(
      "outbound_tkn",
      ethereum.Value.fromAddress(outbound_tkn)
    )
  )
  setActiveEvent.parameters.push(
    new ethereum.EventParam(
      "inbound_tkn",
      ethereum.Value.fromAddress(inbound_tkn)
    )
  )
  setActiveEvent.parameters.push(
    new ethereum.EventParam("value", ethereum.Value.fromBoolean(value))
  )

  return setActiveEvent
}

export function createSetDensityEvent(
  outbound_tkn: Address,
  inbound_tkn: Address,
  value: BigInt
): SetDensity {
  let setDensityEvent = changetype<SetDensity>(newMockEvent())

  setDensityEvent.parameters = new Array()

  setDensityEvent.parameters.push(
    new ethereum.EventParam(
      "outbound_tkn",
      ethereum.Value.fromAddress(outbound_tkn)
    )
  )
  setDensityEvent.parameters.push(
    new ethereum.EventParam(
      "inbound_tkn",
      ethereum.Value.fromAddress(inbound_tkn)
    )
  )
  setDensityEvent.parameters.push(
    new ethereum.EventParam("value", ethereum.Value.fromUnsignedBigInt(value))
  )

  return setDensityEvent
}

export function createSetFeeEvent(
  outbound_tkn: Address,
  inbound_tkn: Address,
  value: BigInt
): SetFee {
  let setFeeEvent = changetype<SetFee>(newMockEvent())

  setFeeEvent.parameters = new Array()

  setFeeEvent.parameters.push(
    new ethereum.EventParam(
      "outbound_tkn",
      ethereum.Value.fromAddress(outbound_tkn)
    )
  )
  setFeeEvent.parameters.push(
    new ethereum.EventParam(
      "inbound_tkn",
      ethereum.Value.fromAddress(inbound_tkn)
    )
  )
  setFeeEvent.parameters.push(
    new ethereum.EventParam("value", ethereum.Value.fromUnsignedBigInt(value))
  )

  return setFeeEvent
}

export function createSetGasbaseEvent(
  outbound_tkn: Address,
  inbound_tkn: Address,
  offer_gasbase: BigInt
): SetGasbase {
  let setGasbaseEvent = changetype<SetGasbase>(newMockEvent())

  setGasbaseEvent.parameters = new Array()

  setGasbaseEvent.parameters.push(
    new ethereum.EventParam(
      "outbound_tkn",
      ethereum.Value.fromAddress(outbound_tkn)
    )
  )
  setGasbaseEvent.parameters.push(
    new ethereum.EventParam(
      "inbound_tkn",
      ethereum.Value.fromAddress(inbound_tkn)
    )
  )
  setGasbaseEvent.parameters.push(
    new ethereum.EventParam(
      "offer_gasbase",
      ethereum.Value.fromUnsignedBigInt(offer_gasbase)
    )
  )

  return setGasbaseEvent
}

export function createSetGasmaxEvent(value: BigInt): SetGasmax {
  let setGasmaxEvent = changetype<SetGasmax>(newMockEvent())

  setGasmaxEvent.parameters = new Array()

  setGasmaxEvent.parameters.push(
    new ethereum.EventParam("value", ethereum.Value.fromUnsignedBigInt(value))
  )

  return setGasmaxEvent
}

export function createSetGaspriceEvent(value: BigInt): SetGasprice {
  let setGaspriceEvent = changetype<SetGasprice>(newMockEvent())

  setGaspriceEvent.parameters = new Array()

  setGaspriceEvent.parameters.push(
    new ethereum.EventParam("value", ethereum.Value.fromUnsignedBigInt(value))
  )

  return setGaspriceEvent
}

export function createSetGovernanceEvent(value: Address): SetGovernance {
  let setGovernanceEvent = changetype<SetGovernance>(newMockEvent())

  setGovernanceEvent.parameters = new Array()

  setGovernanceEvent.parameters.push(
    new ethereum.EventParam("value", ethereum.Value.fromAddress(value))
  )

  return setGovernanceEvent
}

export function createSetMonitorEvent(value: Address): SetMonitor {
  let setMonitorEvent = changetype<SetMonitor>(newMockEvent())

  setMonitorEvent.parameters = new Array()

  setMonitorEvent.parameters.push(
    new ethereum.EventParam("value", ethereum.Value.fromAddress(value))
  )

  return setMonitorEvent
}

export function createSetNotifyEvent(value: boolean): SetNotify {
  let setNotifyEvent = changetype<SetNotify>(newMockEvent())

  setNotifyEvent.parameters = new Array()

  setNotifyEvent.parameters.push(
    new ethereum.EventParam("value", ethereum.Value.fromBoolean(value))
  )

  return setNotifyEvent
}

export function createSetUseOracleEvent(value: boolean): SetUseOracle {
  let setUseOracleEvent = changetype<SetUseOracle>(newMockEvent())

  setUseOracleEvent.parameters = new Array()

  setUseOracleEvent.parameters.push(
    new ethereum.EventParam("value", ethereum.Value.fromBoolean(value))
  )

  return setUseOracleEvent
}
