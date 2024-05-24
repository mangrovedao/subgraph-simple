import { NewKandel } from "../generated/KandelSeeder/KandelSeeder";
import { NewSmartKandel } from "../generated/SmartKandelSeeder/SmartKandelSeeder";
import { Kandel } from "../generated/templates";
import { Kandel as KandelEntity, Market } from "../generated/schema";
import { BigInt } from "@graphprotocol/graph-ts";
import { getOrCreateAccount } from "./helpers/create";
import { saveKandel } from "./helpers/save";

export function handleNewSmartKandel(event: NewSmartKandel): void {
  Kandel.create(event.params.kandel);

  const kandel = new KandelEntity(event.params.kandel);

  kandel.transactionHash = event.transaction.hash;
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

  const ownerAccount = getOrCreateAccount(event.params.owner, event.block, true);
  kandel.deployer = ownerAccount.address;

  const adminAccount = getOrCreateAccount(event.params.owner, event.block, false);
  kandel.admin = adminAccount.address;

  kandel.offerIndexes = [];
  saveKandel(kandel, event.block);
}

export function handleNewKandel(event: NewKandel): void {
  Kandel.create(event.params.kandel);

  const kandel = new KandelEntity(event.params.kandel);

  kandel.transactionHash = event.transaction.hash;
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

  const ownerAccount = getOrCreateAccount(event.params.owner, event.block, true);
  kandel.deployer = ownerAccount.address;

  const adminAccount = getOrCreateAccount(event.params.owner, event.block, false);
  kandel.admin = adminAccount.address;

  kandel.offerIndexes = [];

  saveKandel(kandel, event.block);
}
