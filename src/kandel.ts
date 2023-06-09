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
import { KandelDepositWithdraw, Kandel as  KandelEntity } from "../generated/schema";

export function handleCredit(event: Credit): void {
  const deposit = new KandelDepositWithdraw(
    `${event.transaction.hash.toHex()}-${event.logIndex}`
  );

  deposit.transactionHash = event.transaction.hash;
  deposit.date = event.block.timestamp;
  deposit.token = event.params.token;
  deposit.amount = event.params.amount;
  deposit.isDeposit = true;

  deposit.kandel = event.address;

  deposit.save();
}

export function handleDebit(event: Debit): void {
  const withdraw = new KandelDepositWithdraw(
    `${event.transaction.hash.toHex()}-${event.logIndex}`
  );

  withdraw.transactionHash = event.transaction.hash;
  withdraw.date = event.block.timestamp;
  withdraw.token = event.params.token;
  withdraw.amount = event.params.amount;
  withdraw.isDeposit = false;

  withdraw.kandel = event.address;

  withdraw.save();
}

export function handleLogIncident(event: LogIncident): void {}

export function handleMgv(event: Mgv): void {}

export function handlePair(event: Pair): void {}

export function handlePopulateEnd(event: PopulateEnd): void {}

export function handlePopulateStart(event: PopulateStart): void {}

export function handleRetractEnd(event: RetractEnd): void {}

export function handleRetractStart(event: RetractStart): void {}

export function handleSetAdmin(event: SetAdmin): void {}

export function handleSetCompoundRates(event: SetCompoundRates): void {}

export function handleSetGasprice(event: SetGasprice): void {
  const kandel = KandelEntity.load(event.address)!;

  kandel.gasprice = event.params.value;

  kandel.save();
}

export function handleSetGasreq(event: SetGasreq): void {}

export function handleSetGeometricParams(event: SetGeometricParams): void {}

export function handleSetIndexMapping(event: SetIndexMapping): void {}

export function handleSetLength(event: SetLength): void {}

export function handleSetReserveId(event: SetReserveId): void {}

export function handleSetRouter(event: SetRouter): void {}
