import {
  NewAaveKandel,
  NewKandel
} from "../generated/KandelSeeder/KandelSeeder"
import { Kandel } from "../generated/templates"
import { Kandel as KandelEntity } from "./entities//kandel";

export function handleNewAaveKandel(event: NewAaveKandel): void {

}

export function handleNewKandel(event: NewKandel): void {
  Kandel.create(event.params.kandel);

  const kandel = new KandelEntity(event.params.kandel);

  kandel.seeder = event.address;
  kandel.address = event.params.kandel;
  kandel.base = event.params.base;
  kandel.quote = event.params.quote;
  kandel.owner = event.params.owner;

  kandel.save();
}
