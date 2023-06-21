import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts"
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
import { KandelDepositWithdraw, Kandel as  KandelEntity, KandelPopulateRetract, Offer } from "../generated/schema";
import { getEventUniqueId, getMarketId, getOfferId, getOrCreateKandelParameters } from "./helpers";
import { log } from "matchstick-as";

export function handleCredit(event: Credit): void {
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

export function handleLogIncident(event: LogIncident): void {}

export function handleMgv(event: Mgv): void {
  // nothing to do here as we have one subgraph by mangrove
}

export function handlePair(event: Pair): void {
  // nothing to do we already have this information inside NewKandle
}

export function handlePopulateEnd(event: PopulateEnd): void {
  const kandel = KandelEntity.load(event.address)!; // TODO: use load in block
  const offerIds = getOfferIdsForKandel(kandel);
  const kandelPopulateRetract = KandelPopulateRetract.load( event.transaction.hash.toHex() )!; // TODO: use load in block

  for(let i = 0; i < offerIds.length; i++) {
    let offer = Offer.load(offerIds[i])!; // TODO: use load in block
    if( offer.latestTransactionHash == event.transaction.hash && offer.latestLogIndex.gt( kandelPopulateRetract.startLogIndex) ) {
      const totalGave = offer.totalGave === null ? BigInt.fromI32(0) : offer.totalGave;
      const totalGot = offer.totalGot === null ? BigInt.fromI32(0) : offer.totalGot;
      kandelPopulateRetract.offerGives = kandelPopulateRetract.offerGives.concat([ Bytes.fromUTF8( `${ offerIds[i] }-${ offer.gives }-${ totalGave.toString() }-${ totalGot.toString() }`) ]);
    }
  } 
  kandelPopulateRetract.save();
}

export function getOfferIdsForKandel(kandel: KandelEntity): string[] {
  let offerIds = new Array<string>()
  for (let i = 0; i < kandel.offerIndexes.length; i++) {
    let info = kandel.offerIndexes[i].toString().split('-');
      let offerNumber = info[1];
      let ba = info[2];
      if (ba == '0') {
        offerIds.push( getOfferId( Address.fromBytes( kandel.base ), Address.fromBytes( kandel.quote ), BigInt.fromString(offerNumber) ) );
      } else if (ba == '1') {
        offerIds.push( getOfferId( Address.fromBytes( kandel.quote ), Address.fromBytes( kandel.base ), BigInt.fromString(offerNumber)) );
      }
  }
  return offerIds;
}

export function handlePopulateStart(event: PopulateStart): void {
  const kandelPopulateRetract = new KandelPopulateRetract(event.transaction.hash.toHex() );
  kandelPopulateRetract.transactionHash = event.transaction.hash;
  kandelPopulateRetract.creationDate = event.block.timestamp;
  kandelPopulateRetract.isRetract = false;
  kandelPopulateRetract.startLogIndex = event.logIndex;
  kandelPopulateRetract.kandel = event.address;
  kandelPopulateRetract.offerGives = [];
  kandelPopulateRetract.save();
}

export function handleRetractEnd(event: RetractEnd): void {
  const kandel = KandelEntity.load(event.address)!; // TODO: use load in block
  const offerIds = getOfferIdsForKandel(kandel);
  const kandelPopulateRetract = KandelPopulateRetract.load( event.transaction.hash.toHex() )!; // TODO: use load in block

  for(let i = 0; i < offerIds.length; i++) {
    let offer = Offer.load(offerIds[i])!; // TODO: use load in block
    if( offer.latestTransactionHash == event.transaction.hash && offer.latestLogIndex.gt(kandelPopulateRetract.startLogIndex )) {
      const totalGave = offer.totalGave === null ? BigInt.fromI32(0) : offer.totalGave;
      const totalGot = offer.totalGot === null ? BigInt.fromI32(0) : offer.totalGot;
      kandelPopulateRetract.offerGives = kandelPopulateRetract.offerGives.concat([ Bytes.fromUTF8( `${ offerIds[i] }-${ 0 }-${ totalGave.toString() }-${ totalGot.toString() }`) ]);
    }
  } 
  kandelPopulateRetract.save();
}

export function handleRetractStart(event: RetractStart): void {
  const kandelPopulateRetract = new KandelPopulateRetract(event.transaction.hash.toHex() );
  kandelPopulateRetract.transactionHash = event.transaction.hash;
  kandelPopulateRetract.creationDate = event.block.timestamp;
  kandelPopulateRetract.isRetract = true;
  kandelPopulateRetract.startLogIndex = event.logIndex;
  kandelPopulateRetract.kandel = event.address;
  kandelPopulateRetract.offerGives = [];
  kandelPopulateRetract.save();
}

export function handleSetAdmin(event: SetAdmin): void {
  const kandel = KandelEntity.load(event.address)!; // TODO: use load in block

  kandel.admin = event.params.admin;

  kandel.save();
}

export function handleSetCompoundRates(event: SetCompoundRates): void {
  const kandel = getOrCreateKandelParameters(event.transaction.hash, event.block.timestamp, event.address);
  kandel.compoundRateBase = event.params.compoundRateBase;
  kandel.compoundRateQuote = event.params.compoundRateQuote;

  kandel.save();
}

export function handleSetGasprice(event: SetGasprice): void {
  const kandel = getOrCreateKandelParameters(event.transaction.hash, event.block.timestamp, event.address);
  kandel.creationDate = event.block.timestamp;
  kandel.gasprice = event.params.value;

  kandel.save();
}

export function handleSetGasreq(event: SetGasreq): void {
  const kandel = getOrCreateKandelParameters(event.transaction.hash, event.block.timestamp, event.address);
  kandel.creationDate = event.block.timestamp;
  kandel.gasreq = event.params.value;

  kandel.save();
}

export function handleSetGeometricParams(event: SetGeometricParams): void {
  const kandel = getOrCreateKandelParameters(event.transaction.hash, event.block.timestamp, event.address);
  kandel.creationDate = event.block.timestamp;
  kandel.spread = event.params.spread;
  kandel.ratio = event.params.ratio;

  kandel.save();
}

export function handleSetIndexMapping(event: SetIndexMapping): void {
  const kandel = KandelEntity.load(event.address)!; // TODO: use load in block
  kandel.offerIndexes = kandel.offerIndexes.concat([ Bytes.fromUTF8(`${event.params.index}-${event.params.offerId}-${event.params.ba}`) ] );
  kandel.save();
}

export function handleSetLength(event: SetLength): void {
  const kandel = getOrCreateKandelParameters(event.transaction.hash, event.block.timestamp, event.address);
  kandel.creationDate = event.block.timestamp;
  kandel.length = event.params.value;

  kandel.save();
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
