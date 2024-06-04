import { SetAdmin } from "../generated/templates/Kandel/Kandel";
import { Kandel as KandelEntity } from "../generated/schema";
import { getOrCreateAccount } from "./helpers";
export function handleSetAdmin(event: SetAdmin): void {
  const kandel = KandelEntity.load(event.address)!; // TODO: use load in block

  const adminAccount = getOrCreateAccount(event.params.admin, event.block.timestamp, false);
  kandel.admin = adminAccount.address;
  kandel.save();
}
