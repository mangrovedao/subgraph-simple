import { newMockEvent } from "matchstick-as"
import { ethereum, Address } from "@graphprotocol/graph-ts"
import {
  NewAaveKandel,
  NewKandel
} from "../../generated/KandelSeeder/KandelSeeder"

export function createNewAaveKandelEvent(
  owner: Address,
  base: Address,
  quote: Address,
  aaveKandel: Address,
  reserveId: Address
): NewAaveKandel {
  let newAaveKandelEvent = changetype<NewAaveKandel>(newMockEvent())

  newAaveKandelEvent.parameters = new Array()

  newAaveKandelEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  )
  newAaveKandelEvent.parameters.push(
    new ethereum.EventParam("base", ethereum.Value.fromAddress(base))
  )
  newAaveKandelEvent.parameters.push(
    new ethereum.EventParam("quote", ethereum.Value.fromAddress(quote))
  )
  newAaveKandelEvent.parameters.push(
    new ethereum.EventParam(
      "aaveKandel",
      ethereum.Value.fromAddress(aaveKandel)
    )
  )
  newAaveKandelEvent.parameters.push(
    new ethereum.EventParam("reserveId", ethereum.Value.fromAddress(reserveId))
  )

  return newAaveKandelEvent
}

export function createNewKandelEvent(
  owner: Address,
  base: Address,
  quote: Address,
  kandel: Address
): NewKandel {
  let newKandelEvent = changetype<NewKandel>(newMockEvent())

  newKandelEvent.parameters = new Array()

  newKandelEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  )
  newKandelEvent.parameters.push(
    new ethereum.EventParam("base", ethereum.Value.fromAddress(base))
  )
  newKandelEvent.parameters.push(
    new ethereum.EventParam("quote", ethereum.Value.fromAddress(quote))
  )
  newKandelEvent.parameters.push(
    new ethereum.EventParam("kandel", ethereum.Value.fromAddress(kandel))
  )

  return newKandelEvent
}
