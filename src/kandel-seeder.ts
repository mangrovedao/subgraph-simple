import { NewKandel } from "../generated/KandelSeeder/KandelSeeder";
import { NewSmartKandel } from "../generated/SmartKandelSeeder/SmartKandelSeeder";
import { Kandel } from "../generated/templates";
import { Kandel as KandelEntity } from "../generated/schema";
import { getOrCreateAccount } from "./helpers";

export function handleNewSmartKandel(event: NewSmartKandel): void {
  Kandel.create(event.params.kandel);

  const kandel = new KandelEntity(event.params.kandel);

  kandel.transactionHash = event.transaction.hash;
  kandel.creationDate = event.block.timestamp;
  kandel.seeder = event.address;
  kandel.address = event.params.kandel;
  kandel.type = "SmartKandel";

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

  const adminAccount = getOrCreateAccount(event.params.owner, event.block.timestamp, false);
  kandel.admin = adminAccount.address;

  kandel.offerIndexes = [];

  kandel.save();
}
