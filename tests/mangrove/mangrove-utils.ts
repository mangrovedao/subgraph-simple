import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
  Approval,
  CleanComplete,
  CleanStart,
  Credit,
  Debit,
  Kill,
  NewMgv,
  OfferFail,
  OfferFailWithPosthookData,
  OfferRetract,
  OfferSuccess,
  OfferSuccessWithPosthookData,
  OfferWrite,
  OrderComplete,
  OrderStart,
  SetActive,
  SetDensity96X32,
  SetFee,
  SetGasbase,
  SetGasmax,
  SetGasprice,
  SetGovernance,
  SetMaxGasreqForFailingOffers,
  SetMaxRecursionDepth,
  SetMonitor,
  SetNotify,
  SetUseOracle
} from "../../generated/Mangrove/Mangrove"
import { SetRouteLogic } from "../../generated/templates/SmartRouterProxy/SmartRouter"

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

export function reditEvent(maker: Address, amount: BigInt): Credit {
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
  olKeyHash: Bytes,
  id: BigInt,
  taker: Address,
  takerWants: BigInt,
  takerGives: BigInt,
  penalty: BigInt,
  mgvData: Bytes,
  transactionHash: Bytes,
  logIndex: BigInt,
  timestamp: BigInt

): OfferFail {
  let offerFailEvent = changetype<OfferFail>(newMockEvent())

  offerFailEvent.parameters = new Array()

  offerFailEvent.parameters.push(
    new ethereum.EventParam(
      "olKeyHash",
      ethereum.Value.fromBytes(olKeyHash)
    )
  )
  offerFailEvent.parameters.push(
    new ethereum.EventParam("taker", ethereum.Value.fromAddress(taker))
  )
  offerFailEvent.parameters.push(
    new ethereum.EventParam("id", ethereum.Value.fromUnsignedBigInt(id))
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
    new ethereum.EventParam(
      "penalty",
      ethereum.Value.fromUnsignedBigInt(penalty)
    )
  )

  offerFailEvent.parameters.push(
    new ethereum.EventParam("mgvData", ethereum.Value.fromBytes(mgvData))
  )

  // push optional parameters
  offerFailEvent.transaction.hash = transactionHash
  offerFailEvent.logIndex = logIndex
  offerFailEvent.block.timestamp = timestamp

  return offerFailEvent
}

export function createOfferFailWithPosthookDataEvent(
  olKeyHash: Bytes,
  id: BigInt,
  taker: Address,
  takerWants: BigInt,
  takerGives: BigInt,
  penalty: BigInt,
  mgvData: Bytes,
  posthookData: Bytes,
  transactionHash: Bytes,
  logIndex: BigInt,
  timestamp: BigInt
): OfferFailWithPosthookData {
  const offerFailEvent = createOfferFailEvent(
    olKeyHash,
    id,
    taker,
    takerWants,
    takerGives,
    penalty,
    mgvData,
    transactionHash,
    logIndex,
    timestamp
  )
  let offerFailWithPosthookDataEvent = changetype<OfferFailWithPosthookData>(offerFailEvent);
  offerFailWithPosthookDataEvent.parameters.push(
    new ethereum.EventParam(
      "posthookData",
      ethereum.Value.fromBytes(posthookData)
    )
  )
  return offerFailWithPosthookDataEvent;
}

export function createOfferRetractEvent(
  olKeyHash: Bytes,
  maker: Address,
  id: BigInt,
  deprovision: boolean
): OfferRetract {
  let offerRetractEvent = changetype<OfferRetract>(newMockEvent())

  offerRetractEvent.parameters = new Array()

  offerRetractEvent.parameters.push(
    new ethereum.EventParam(
      "outbound_tkn",
      ethereum.Value.fromBytes(olKeyHash)
    )
  )
  offerRetractEvent.parameters.push(
    new ethereum.EventParam("maker", ethereum.Value.fromAddress(maker))
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
  olKeyHash: Bytes,
  id: BigInt,
  taker: Address,
  takerWants: BigInt,
  takerGives: BigInt
): OfferSuccess {
  let offerSuccessEvent = changetype<OfferSuccess>(newMockEvent())

  offerSuccessEvent.parameters = new Array()

  offerSuccessEvent.parameters.push(
    new ethereum.EventParam(
      "olKeyHash",
      ethereum.Value.fromBytes(olKeyHash)
    )
  )
  offerSuccessEvent.parameters.push(
    new ethereum.EventParam("taker", ethereum.Value.fromAddress(taker))
  )
  offerSuccessEvent.parameters.push(
    new ethereum.EventParam("id", ethereum.Value.fromUnsignedBigInt(id))
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

export function createOfferSuccessWithPosthookDataEvent(
  olKeyHash: Bytes,
  id: BigInt,
  taker: Address,
  takerWants: BigInt,
  takerGives: BigInt,
  posthookData: Bytes
): OfferSuccessWithPosthookData {
  const offerSuccessEvent = createOfferSuccessEvent(
    olKeyHash,
    id,
    taker,
    takerWants,
    takerGives
  )
  let offerSuccessWithPosthookDataEvent = changetype<OfferSuccessWithPosthookData>(offerSuccessEvent);
  offerSuccessWithPosthookDataEvent.parameters.push(
    new ethereum.EventParam(
      "posthookData",
      ethereum.Value.fromBytes(posthookData)
    )
  )
  return offerSuccessWithPosthookDataEvent;
}

export function createOfferWriteEvent(
  olKeyHash: Bytes,
  maker: Address,
  tick: BigInt,
  gives: BigInt,
  gasprice: BigInt,
  gasreq: BigInt,
  id: BigInt,
): OfferWrite {
  let offerWriteEvent = changetype<OfferWrite>(newMockEvent())

  offerWriteEvent.parameters = new Array()

  offerWriteEvent.parameters.push(
    new ethereum.EventParam(
      "olKeyHash",
      ethereum.Value.fromBytes(olKeyHash)
    )
  )
  offerWriteEvent.parameters.push(
    new ethereum.EventParam("maker", ethereum.Value.fromAddress(maker))
  )
  offerWriteEvent.parameters.push(
    new ethereum.EventParam("tick", ethereum.Value.fromSignedBigInt(tick))
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
  return offerWriteEvent
}

export function createOrderCompleteEvent(
  olKeyHash: Bytes,
  taker: Address,
  fee: BigInt
): OrderComplete {
  let orderCompleteEvent = changetype<OrderComplete>(newMockEvent())

  orderCompleteEvent.parameters = new Array()

  orderCompleteEvent.parameters.push(
    new ethereum.EventParam(
      "olKeyHash",
      ethereum.Value.fromBytes(olKeyHash)
    )
  )

  orderCompleteEvent.parameters.push(
    new ethereum.EventParam("taker", ethereum.Value.fromAddress(taker))
  )

  orderCompleteEvent.parameters.push(
    new ethereum.EventParam("fee", ethereum.Value.fromUnsignedBigInt(fee))
  )

  return orderCompleteEvent
}

export function createOrderStartEvent(
  olKeyHash: Bytes,
  taker: Address,
  maxTick: BigInt,
  fillVolume: BigInt,
  fillWants: boolean,
): OrderStart {
  let orderStartEvent = changetype<OrderStart>(newMockEvent())

  orderStartEvent.parameters = new Array()

  orderStartEvent.parameters.push(
    new ethereum.EventParam(
      "olKeyHash",
      ethereum.Value.fromBytes(olKeyHash)
    )
  )

  orderStartEvent.parameters.push(
    new ethereum.EventParam("taker", ethereum.Value.fromAddress(taker))
  )

  orderStartEvent.parameters.push(
    new ethereum.EventParam("maxTick", ethereum.Value.fromSignedBigInt(maxTick))
  )

  orderStartEvent.parameters.push(
    new ethereum.EventParam(
      "fillVolume",
      ethereum.Value.fromUnsignedBigInt(fillVolume)
    )
  )

  orderStartEvent.parameters.push(
    new ethereum.EventParam(
      "fillWants",
      ethereum.Value.fromBoolean(fillWants)
    )
  )

  return orderStartEvent
}

export function createCleanOrderStartEvent(
  olKeyHash: Bytes,
  taker: Address,
  ordersToBeCleaned: BigInt,
): CleanStart {
  let cleanStart = changetype<CleanStart>(newMockEvent())

  cleanStart.parameters = new Array()

  cleanStart.parameters.push(
    new ethereum.EventParam(
      "olKeyHash",
      ethereum.Value.fromBytes(olKeyHash)
    )
  )
  cleanStart.parameters.push(
    new ethereum.EventParam("taker", ethereum.Value.fromAddress(taker))
  )
  cleanStart.parameters.push(
    new ethereum.EventParam(
      "ordersToBeCleaned",
      ethereum.Value.fromUnsignedBigInt(ordersToBeCleaned)
    )
  )


  return cleanStart
}

export function createCleanCompleteEvent(): CleanComplete {
  return changetype<CleanComplete>(newMockEvent())
}

export function createSetActiveEvent(
  olKeyHash: Bytes,
  outbound_tkn: Address,
  inbound_tkn: Address,
  tickSpacing: BigInt,
  value: boolean
): SetActive {
  let setActiveEvent = changetype<SetActive>(newMockEvent())

  setActiveEvent.parameters = new Array()

  setActiveEvent.parameters.push(
    new ethereum.EventParam(
      "olKeyHash",
      ethereum.Value.fromBytes(olKeyHash)
    )
  )

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
    new ethereum.EventParam(
      "tickSpacing",
      ethereum.Value.fromSignedBigInt(tickSpacing)
    )
  )

  setActiveEvent.parameters.push(
    new ethereum.EventParam("value", ethereum.Value.fromBoolean(value))
  )

  return setActiveEvent
}

export function createSetDensityEvent(
  olKeyHash: Bytes,
  value: BigInt
): SetDensity96X32 {
  let setDensityEvent = changetype<SetDensity96X32>(newMockEvent())

  setDensityEvent.parameters = new Array()

  setDensityEvent.parameters.push(
    new ethereum.EventParam(
      "olKeyHash",
      ethereum.Value.fromBytes(olKeyHash)
    )
  )

  setDensityEvent.parameters.push(
    new ethereum.EventParam("value", ethereum.Value.fromUnsignedBigInt(value))
  )

  return setDensityEvent
}

export function createSetFeeEvent(
  olKeyHash: Bytes,
  value: BigInt
): SetFee {
  let setFeeEvent = changetype<SetFee>(newMockEvent())

  setFeeEvent.parameters = new Array()

  setFeeEvent.parameters.push(
    new ethereum.EventParam(
      "olKeyHash",
      ethereum.Value.fromBytes(olKeyHash)
    )
  )

  setFeeEvent.parameters.push(
    new ethereum.EventParam("value", ethereum.Value.fromUnsignedBigInt(value))
  )

  return setFeeEvent
}

export function createSetGasbaseEvent(
  olKeyHash: Bytes,
  offer_gasbase: BigInt
): SetGasbase {
  let setGasbaseEvent = changetype<SetGasbase>(newMockEvent())

  setGasbaseEvent.parameters = new Array()

  setGasbaseEvent.parameters.push(
    new ethereum.EventParam(
      "olKeyHash",
      ethereum.Value.fromBytes(olKeyHash)
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

export function createSetMaxGasreqForFailingOffersEvent(
  value: BigInt
): SetMaxGasreqForFailingOffers {
  let setMaxGasreqForFailingOffers = changetype<SetMaxGasreqForFailingOffers>(newMockEvent())

  setMaxGasreqForFailingOffers.parameters = new Array()

  setMaxGasreqForFailingOffers.parameters.push(
    new ethereum.EventParam("value", ethereum.Value.fromUnsignedBigInt(value))
  )

  return setMaxGasreqForFailingOffers
}

export function createSetMaxRecursionDepthEvent(
  value: BigInt
): SetMaxRecursionDepth {
  let setMaxRecursionDepth = changetype<SetMaxRecursionDepth>(newMockEvent())

  setMaxRecursionDepth.parameters = new Array()

  setMaxRecursionDepth.parameters.push(
    new ethereum.EventParam("value", ethereum.Value.fromUnsignedBigInt(value))
  )

  return setMaxRecursionDepth
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

export function createSetRouteLogicEvent(
  olKeyHash: Bytes,
  token: Address,
  offerId: BigInt,
  logic: Address
): SetRouteLogic {
  let setRouteLogicEvent = changetype<SetRouteLogic>(newMockEvent())

  setRouteLogicEvent.parameters = new Array()

  setRouteLogicEvent.parameters.push(
    new ethereum.EventParam(
      "olKeyHash",
      ethereum.Value.fromBytes(olKeyHash)
    )
  )
  setRouteLogicEvent.parameters.push(
    new ethereum.EventParam("token", ethereum.Value.fromAddress(token))
  )
  setRouteLogicEvent.parameters.push(
    new ethereum.EventParam("offerId", ethereum.Value.fromUnsignedBigInt(offerId))
  )
  setRouteLogicEvent.parameters.push(
    new ethereum.EventParam("logic", ethereum.Value.fromAddress(logic))
  )

  return setRouteLogicEvent
}