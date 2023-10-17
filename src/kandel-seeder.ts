// import {
//   NewAaveKandel,
//   NewKandel
// } from "../generated/KandelSeeder/KandelSeeder"
// import { Kandel } from "../generated/templates"
// import { Kandel as KandelEntity } from "../generated/schema";
// import { BigInt } from "@graphprotocol/graph-ts";
// import { getOrCreateAccount } from "./helpers";

// export function handleNewAaveKandel(event: NewAaveKandel): void {
//   Kandel.create(event.params.aaveKandel);

//   const kandel = new KandelEntity(event.params.aaveKandel);

//   kandel.transactionHash = event.transaction.hash;
//   kandel.creationDate = event.block.timestamp;
//   kandel.seeder = event.address;
//   kandel.address = event.params.aaveKandel;
//   kandel.type = "KandelAAVE";
//   kandel.base = event.params.base;
//   kandel.quote = event.params.quote;

//   kandel.reserveId = event.params.reserveId;

//   kandel.depositedBase = BigInt.fromI32(0);
//   kandel.depositedQuote = BigInt.fromI32(0);

//   const ownerAccount = getOrCreateAccount(event.params.owner, event.block.timestamp, true);
//   kandel.deployer = ownerAccount.address;

//   const adminAcount = getOrCreateAccount(event.params.owner, event.block.timestamp, true);
//   kandel.admin = adminAcount.address;

//   kandel.offerIndexes = [];

//   kandel.save();
// }

// export function handleNewKandel(event: NewKandel): void {
//   Kandel.create(event.params.kandel);

//   const kandel = new KandelEntity(event.params.kandel);

//   kandel.transactionHash = event.transaction.hash;
//   kandel.creationDate = event.block.timestamp;
//   kandel.seeder = event.address;
//   kandel.address = event.params.kandel;
//   kandel.type = "Kandel";
//   kandel.base = event.params.base;
//   kandel.quote = event.params.quote;

//   kandel.depositedBase = BigInt.fromI32(0);
//   kandel.depositedQuote = BigInt.fromI32(0);

//   const ownerAccount = getOrCreateAccount(event.params.owner, event.block.timestamp, true);
//   kandel.deployer = ownerAccount.address;

//   const adminAcount = getOrCreateAccount(event.params.owner, event.block.timestamp, false);
//   kandel.admin = adminAcount.address;

//   kandel.offerIndexes = [];

//   kandel.save();
// }
