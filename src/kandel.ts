import { BigInt } from "@graphprotocol/graph-ts"
import {
  Kandel,
  Credit,
  Debit,
  LogIncident,
  Mgv,
  Pair,
  PopulateEnd,
  PopulateStart,
  RetractEnd,
  RetractStart,
  SetAdmin,
  SetCompoundRates,
  SetGasprice,
  SetGasreq,
  SetGeometricParams,
  SetIndexMapping,
  SetLength,
  SetReserveId,
  SetRouter
} from "../generated/templates/Kandel/Kandel"

export function handleCredit(event: Credit): void {
  // Entities can be loaded from the store using a string ID; this ID

}

export function handleDebit(event: Debit): void {}

export function handleLogIncident(event: LogIncident): void {}

export function handleMgv(event: Mgv): void {}

export function handlePair(event: Pair): void {}

export function handlePopulateEnd(event: PopulateEnd): void {}

export function handlePopulateStart(event: PopulateStart): void {}

export function handleRetractEnd(event: RetractEnd): void {}

export function handleRetractStart(event: RetractStart): void {}

export function handleSetAdmin(event: SetAdmin): void {}

export function handleSetCompoundRates(event: SetCompoundRates): void {}

export function handleSetGasprice(event: SetGasprice): void {}

export function handleSetGasreq(event: SetGasreq): void {}

export function handleSetGeometricParams(event: SetGeometricParams): void {}

export function handleSetIndexMapping(event: SetIndexMapping): void {}

export function handleSetLength(event: SetLength): void {}

export function handleSetReserveId(event: SetReserveId): void {}

export function handleSetRouter(event: SetRouter): void {}
