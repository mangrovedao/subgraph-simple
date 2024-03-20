import { newMockEvent } from "matchstick-as";
import { ethereum, Address, Bytes } from "@graphprotocol/graph-ts";
import { NewKandel } from "../../generated/KandelSeeder/KandelSeeder";
import { NewSmartKandel } from "../../generated/SmartKandelSeeder/SmartKandelSeeder";
// import { NewAaveKandel } from "../../generated/AaveKandelSeeder/AaveKandelSeeder";

// export function createNewAaveKandelEvent(
//   owner: Address,
//   baseQuoteOlKeyHash: Bytes,
//   quoteBaseOlKeyHash: Bytes,
//   aaveKandel: Address,
//   reserveId: Address
// ): NewAaveKandel {
//   let newAaveKandelEvent = changetype<NewAaveKandel>(newMockEvent());
//
//   newAaveKandelEvent.parameters = new Array();
//
//   newAaveKandelEvent.parameters.push(new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner)));
//   newAaveKandelEvent.parameters.push(new ethereum.EventParam("baseQuoteOlKeyHash", ethereum.Value.fromBytes(baseQuoteOlKeyHash)));
//   newAaveKandelEvent.parameters.push(new ethereum.EventParam("quoteBaseOlKeyHash", ethereum.Value.fromBytes(quoteBaseOlKeyHash)));
//   newAaveKandelEvent.parameters.push(new ethereum.EventParam("aaveKandel", ethereum.Value.fromAddress(aaveKandel)));
//   newAaveKandelEvent.parameters.push(new ethereum.EventParam("reserveId", ethereum.Value.fromAddress(reserveId)));
//
//   return newAaveKandelEvent;
// }

export function createNewKandelEvent(owner: Address, baseQuoteOlKeyHash: Bytes, quoteBaseOlKeyHash: Bytes, kandel: Address): NewKandel {
  let newKandelEvent = changetype<NewKandel>(newMockEvent());

  newKandelEvent.parameters = new Array();

  newKandelEvent.parameters.push(new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner)));
  newKandelEvent.parameters.push(new ethereum.EventParam("baseQuoteOlKeyHash", ethereum.Value.fromBytes(baseQuoteOlKeyHash)));
  newKandelEvent.parameters.push(new ethereum.EventParam("quoteBaseOlKeyHash", ethereum.Value.fromBytes(quoteBaseOlKeyHash)));
  newKandelEvent.parameters.push(new ethereum.EventParam("kandel", ethereum.Value.fromAddress(kandel)));

  return newKandelEvent;
}

export function createNewSmartKandelEvent(owner: Address, baseQuoteOlKeyHash: Bytes, quoteBaseOlKeyHash: Bytes, kandel: Address): NewSmartKandel {
  let newKandelEvent = changetype<NewSmartKandel>(newMockEvent());

  newKandelEvent.parameters = new Array();

  newKandelEvent.parameters.push(new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner)));
  newKandelEvent.parameters.push(new ethereum.EventParam("baseQuoteOlKeyHash", ethereum.Value.fromBytes(baseQuoteOlKeyHash)));
  newKandelEvent.parameters.push(new ethereum.EventParam("quoteBaseOlKeyHash", ethereum.Value.fromBytes(quoteBaseOlKeyHash)));
  newKandelEvent.parameters.push(new ethereum.EventParam("kandel", ethereum.Value.fromAddress(kandel)));

  return newKandelEvent;
}