import { Address, BigInt } from "@graphprotocol/graph-ts"
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
import { log } from "matchstick-as";

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

  const kandel = KandelEntity.load(event.address)!;

  if (Address.fromBytes(kandel.base).equals(event.params.token)) {
    kandel.depositedBase = kandel.depositedBase.plus(event.params.amount);
    kandel.totalBase = kandel.totalBase.plus(event.params.amount);
  } else {
    kandel.depositedQuote = kandel.depositedQuote.plus(event.params.amount);
    kandel.totalQuote = kandel.totalQuote.plus(event.params.amount);
  }

  kandel.save()
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

  const kandel = KandelEntity.load(event.address)!;

  if (Address.fromBytes(kandel.base).equals(event.params.token)) {
    kandel.depositedBase = kandel.depositedBase.minus(event.params.amount);
    kandel.totalBase = kandel.totalBase.minus(event.params.amount);
  } else {
    kandel.depositedQuote = kandel.depositedQuote.minus(event.params.amount);
    kandel.totalQuote = kandel.totalQuote.minus(event.params.amount);
  }

  kandel.save();
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
