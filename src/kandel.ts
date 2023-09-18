import { Address, BigInt } from "@graphprotocol/graph-ts"
import {
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
import { KandelDepositWithdraw, Kandel as KandelEntity, KandelPopulateRetract, Offer } from "../generated/schema";
import { getEventUniqueId, getOfferId, getOrCreateAccount, getOrCreateKandelParameters } from "./helpers";

export function handleCredit(event: Credit): void {
  if (event.params.amount.equals(BigInt.fromI32(0))) {
    return;
  }

  const deposit = new KandelDepositWithdraw(
    getEventUniqueId(event),
  );

  deposit.transactionHash = event.transaction.hash;
  deposit.date = event.block.timestamp;
  deposit.token = event.params.token;
  deposit.amount = event.params.amount;
  deposit.isDeposit = true;

  deposit.kandel = event.address;

  const kandel = KandelEntity.load(event.address)!;  // TODO: use load in block

  if (Address.fromBytes(kandel.base).equals(event.params.token)) {
    kandel.depositedBase = kandel.depositedBase.plus(event.params.amount);
  } else {
    kandel.depositedQuote = kandel.depositedQuote.plus(event.params.amount);
  }

  kandel.save()
  deposit.save();
}

export function handleDebit(event: Debit): void {
  if (event.params.amount.equals(BigInt.fromI32(0))) {
    return;
  }

  const withdraw = new KandelDepositWithdraw(
    getEventUniqueId(event),
  );

  withdraw.transactionHash = event.transaction.hash;
  withdraw.date = event.block.timestamp;
  withdraw.token = event.params.token;
  withdraw.amount = event.params.amount;
  withdraw.isDeposit = false;

  withdraw.kandel = event.address;

  const kandel = KandelEntity.load(event.address)!; // TODO: use load in block

  if (Address.fromBytes(kandel.base).equals(event.params.token)) {
    kandel.depositedBase = kandel.depositedBase.minus(event.params.amount);
  } else {
    kandel.depositedQuote = kandel.depositedQuote.minus(event.params.amount);
  }

  kandel.save();
  withdraw.save();
}

export function handleLogIncident(event: LogIncident): void { }

export function handleMgv(event: Mgv): void {
  // nothing to do here as we have one subgraph by mangrove
}

export function handlePair(event: Pair): void {
  // nothing to do we already have this information inside NewKandle
}

export function handlePopulateEnd(event: PopulateEnd): void {
  const kandel = KandelEntity.load(event.address)!; // TODO: use load in block
  const offerIds = getOfferIdsForKandel(kandel);
  const kandelPopulateRetract = KandelPopulateRetract.load(event.transaction.hash.toHex())!; // TODO: use load in block

  for (let i = 0; i < offerIds.length; i++) {
    let offer = Offer.load(offerIds[i])!; // TODO: use load in block
    if (offer.latestTransactionHash == event.transaction.hash && offer.latestLogIndex.gt(kandelPopulateRetract.startLogIndex)) {
      const totalGave = offer.totalGave === null ? BigInt.fromI32(0) : offer.totalGave;
      const totalGot = offer.totalGot === null ? BigInt.fromI32(0) : offer.totalGot;
      kandelPopulateRetract.offerGives = kandelPopulateRetract.offerGives.concat([`${offerIds[i]}-${offer.gives}-${totalGave.toString()}-${totalGot.toString()}`]);
    }
  }
  kandelPopulateRetract.save();
}

export function getOfferIdsForKandel(kandel: KandelEntity): string[] {
  let offerIds = new Array<string>()
  for (let i = 0; i < kandel.offerIndexes.length; i++) {
    const info = kandel.offerIndexes[i].toString().split('-');
    const offerNumber = info[1];
    const ba = info[2];
    if (ba == '1') { // Ask
      offerIds.push(getOfferId(Address.fromBytes(kandel.base), Address.fromBytes(kandel.quote), BigInt.fromString(offerNumber)));
    } else if (ba == '0') { // Bid
      offerIds.push(getOfferId(Address.fromBytes(kandel.quote), Address.fromBytes(kandel.base), BigInt.fromString(offerNumber)));
    }
  }
  return offerIds;
}

export function handlePopulateStart(event: PopulateStart): void {
  const kandelPopulateRetract = new KandelPopulateRetract(event.transaction.hash.toHex());
  kandelPopulateRetract.transactionHash = event.transaction.hash;
  kandelPopulateRetract.creationDate = event.block.timestamp;
  kandelPopulateRetract.isRetract = false;
  kandelPopulateRetract.startLogIndex = event.logIndex;
  kandelPopulateRetract.kandel = event.address;
  kandelPopulateRetract.offerGives = new Array<string>();
  kandelPopulateRetract.save();
}

export function handleRetractEnd(event: RetractEnd): void {
  const kandel = KandelEntity.load(event.address)!; // TODO: use load in block
  const offerIds = getOfferIdsForKandel(kandel);
  const kandelPopulateRetract = KandelPopulateRetract.load(event.transaction.hash.toHex())!; // TODO: use load in block

  for (let i = 0; i < offerIds.length; i++) {
    let offer = Offer.load(offerIds[i])!; // TODO: use load in block
    if (offer.latestTransactionHash == event.transaction.hash && offer.latestLogIndex.gt(kandelPopulateRetract.startLogIndex)) {
      const totalGave = offer.totalGave === null ? BigInt.fromI32(0) : offer.totalGave;
      const totalGot = offer.totalGot === null ? BigInt.fromI32(0) : offer.totalGot;
      kandelPopulateRetract.offerGives = kandelPopulateRetract.offerGives.concat([`${offerIds[i]}-${0}-${totalGave.toString()}-${totalGot.toString()}`]);
    }
  }
  kandelPopulateRetract.save();
}

export function handleRetractStart(event: RetractStart): void {
  const kandelPopulateRetract = new KandelPopulateRetract(event.transaction.hash.toHex());
  kandelPopulateRetract.transactionHash = event.transaction.hash;
  kandelPopulateRetract.creationDate = event.block.timestamp;
  kandelPopulateRetract.isRetract = true;
  kandelPopulateRetract.startLogIndex = event.logIndex;
  kandelPopulateRetract.kandel = event.address;
  kandelPopulateRetract.offerGives = new Array<string>();
  kandelPopulateRetract.save();
}

export function handleSetAdmin(event: SetAdmin): void {
  const kandel = KandelEntity.load(event.address)!; // TODO: use load in block

  const adminAccount = getOrCreateAccount(event.params.admin, event.block.timestamp, false);
  kandel.admin = adminAccount.address;
  kandel.save();
}

export function handleSetCompoundRates(event: SetCompoundRates): void {
  const kandel = KandelEntity.load(event.address)!;
  kandel.compoundRateBase = event.params.compoundRateBase;
  kandel.compoundRateQuote = event.params.compoundRateQuote;
  kandel.save();

  const kandelParams = getOrCreateKandelParameters(event.transaction.hash, event.block.timestamp, event.address);
  kandelParams.compoundRateBase = event.params.compoundRateBase;
  kandelParams.compoundRateQuote = event.params.compoundRateQuote;

  kandelParams.save();
}

export function handleSetGasprice(event: SetGasprice): void {
  const kandel = KandelEntity.load(event.address)!;
  kandel.gasprice = event.params.value;
  kandel.save();

  const kandelParams = getOrCreateKandelParameters(event.transaction.hash, event.block.timestamp, event.address);
  kandelParams.gasprice = event.params.value;

  kandelParams.save();
}

export function handleSetGasreq(event: SetGasreq): void {
  const kandel = KandelEntity.load(event.address)!;
  kandel.gasreq = event.params.value;
  kandel.save();

  const kandelParams = getOrCreateKandelParameters(event.transaction.hash, event.block.timestamp, event.address);
  kandelParams.gasreq = event.params.value;

  kandelParams.save();
}

export function handleSetGeometricParams(event: SetGeometricParams): void {
  const kandel = KandelEntity.load(event.address)!;
  kandel.spread = event.params.spread
  kandel.ratio = event.params.ratio;
  kandel.save();

  const kandelParams = getOrCreateKandelParameters(event.transaction.hash, event.block.timestamp, event.address);
  kandelParams.spread = event.params.spread
  kandelParams.ratio = event.params.ratio;

  kandelParams.save();
}

export function handleSetIndexMapping(event: SetIndexMapping): void {
  const kandel = KandelEntity.load(event.address)!; // TODO: use load in block
  if (event.params.ba === 0) { // bid
    const offer = Offer.load(getOfferId(Address.fromBytes(kandel.quote), Address.fromBytes(kandel.base), event.params.offerId))!;
    offer.kandelIndex = event.params.index;
    offer.save();
  } else { // ask
    const offer = Offer.load(getOfferId(Address.fromBytes(kandel.base), Address.fromBytes(kandel.quote), event.params.offerId))!;
    offer.kandelIndex = event.params.index;
    offer.save();
  }

  kandel.offerIndexes = kandel.offerIndexes.concat([`${event.params.index}-${event.params.offerId}-${event.params.ba}`]);
  kandel.save();
}

export function handleSetLength(event: SetLength): void {
  const kandel = KandelEntity.load(event.address)!; // TODO: use load in block
  kandel.length = event.params.value;
  kandel.save();

  const kandelParams = getOrCreateKandelParameters(event.transaction.hash, event.block.timestamp, event.address);
  kandelParams.length = event.params.value;

  kandelParams.save();
}

export function handleSetReserveId(event: SetReserveId): void {
  const kandel = KandelEntity.load(event.address)!; // TODO: use load in block
  kandel.reserveId = event.params.reserveId;

  kandel.save();
}

export function handleSetRouter(event: SetRouter): void {
  const kandel = KandelEntity.load(event.address)!; //TODO: use load in block
  kandel.router = event.params.router;

  kandel.save();
}
