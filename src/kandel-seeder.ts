import { NewKandel } from "../generated/KandelSeeder/KandelSeeder";
import { NewSmartKandel } from "../generated/SmartKandelSeeder/SmartKandelSeeder";
// import { NewAaveKandel } from "../generated/AaveKandelSeeder/AaveKandelSeeder";
import { Kandel } from "../generated/templates";
import { Kandel as KandelEntity, Market } from "../generated/schema";
import { BigInt } from "@graphprotocol/graph-ts";
import { getOrCreateAccount } from "./helpers";

// export function handleNewAaveKandel(event: NewAaveKandel): void {
//   Kandel.create(event.params.aaveKandel);
//
//   const kandel = new KandelEntity(event.params.aaveKandel);
//
//   kandel.transactionHash = event.transaction.hash;
//   kandel.creationDate = event.block.timestamp;
//   kandel.seeder = event.address;
//   kandel.address = event.params.aaveKandel;
//   kandel.type = "KandelAAVE";
//   const market = Market.load(event.params.quoteBaseOlKeyHash.toHexString())!;
//   kandel.base = market.inbound_tkn;
//   kandel.quote = market.outbound_tkn;
//   kandel.baseQuoteOlKeyHash = event.params.baseQuoteOlKeyHash;
//   kandel.quoteBaseOlKeyHash = event.params.quoteBaseOlKeyHash;
//
//   kandel.reserveId = event.params.reserveId;
//
//   kandel.depositedBase = BigInt.fromI32(0);
//   kandel.depositedQuote = BigInt.fromI32(0);
//
//   const ownerAccount = getOrCreateAccount(event.params.owner, event.block.timestamp, true);
//   kandel.deployer = ownerAccount.address;
//
//   const adminAccount = getOrCreateAccount(event.params.owner, event.block.timestamp, true);
//   kandel.admin = adminAccount.address;
//
//   kandel.offerIndexes = [];
//
//   kandel.save();
// }

export function handleNewSmartKandel(event: NewSmartKandel): void {
  Kandel.create(event.params.kandel);

  const kandel = new KandelEntity(event.params.kandel);

  kandel.transactionHash = event.transaction.hash;
  kandel.creationDate = event.block.timestamp;
  kandel.seeder = event.address;
  kandel.address = event.params.kandel;
  kandel.type = "SmartKandel";
  const market = Market.load(event.params.quoteBaseOlKeyHash.toHexString())!;
  kandel.base = market.inboundToken;
  kandel.quote = market.outboundToken;
  kandel.baseQuoteOlKeyHash = event.params.baseQuoteOlKeyHash;
  kandel.quoteBaseOlKeyHash = event.params.quoteBaseOlKeyHash;

  kandel.depositedBase = BigInt.fromI32(0);
  kandel.totalPublishedBase = BigInt.fromI32(0);
  kandel.depositedQuote = BigInt.fromI32(0);
  kandel.totalPublishedQuote = BigInt.fromI32(0);

  const ownerAccount = getOrCreateAccount(event.params.owner, event.block.timestamp, true);
  kandel.deployer = ownerAccount.address;

  const adminAccount = getOrCreateAccount(event.params.owner, event.block.timestamp, false);
  kandel.admin = adminAccount.address;

  kandel.offerIndexes = [];

  kandel.save();
}

export function handleNewKandel(event: NewKandel): void {
  Kandel.create(event.params.kandel);

  const kandel = new KandelEntity(event.params.kandel);

  kandel.transactionHash = event.transaction.hash;
  kandel.creationDate = event.block.timestamp;
  kandel.seeder = event.address;
  kandel.address = event.params.kandel;
  kandel.type = "Kandel";
  const market = Market.load(event.params.quoteBaseOlKeyHash.toHexString())!;
  kandel.base = market.inboundToken;
  kandel.quote = market.outboundToken;
  kandel.baseQuoteOlKeyHash = event.params.baseQuoteOlKeyHash;
  kandel.quoteBaseOlKeyHash = event.params.quoteBaseOlKeyHash;

  kandel.depositedBase = BigInt.fromI32(0);
  kandel.totalPublishedBase = BigInt.fromI32(0);
  kandel.depositedQuote = BigInt.fromI32(0);
  kandel.totalPublishedQuote = BigInt.fromI32(0);

  const ownerAccount = getOrCreateAccount(event.params.owner, event.block.timestamp, true);
  kandel.deployer = ownerAccount.address;

  const adminAccount = getOrCreateAccount(event.params.owner, event.block.timestamp, false);
  kandel.admin = adminAccount.address;

  kandel.offerIndexes = [];

  kandel.save();
}
