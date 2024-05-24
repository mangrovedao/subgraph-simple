import { Entity, store } from "@graphprotocol/graph-ts";
import { CleanOrder, LimitOrder, Order, Stack } from "../generated/schema";
import { OfferWrite } from "../generated/Mangrove/Mangrove";
import { PartialOfferWrite } from "./types";

const getStack = (type: string): Stack => {
  let stack = Stack.load(type);
  if (stack === null) {
    stack = new Stack(type);
    stack.ids = ``;

    stack.save();
  }
  return stack;
};

function getLatestFromStack(type: string, shouldThrow: boolean): Entity | null {
  const stack = getStack(type);
  const ids = stack.ids;
  const idsArray = ids.split("|");
  let idWithOptionalParams = idsArray[idsArray.length - 1];

  let encodedOfferWrites = "";

  for (let i = 0; i < idWithOptionalParams.length; i++) {
    if (idWithOptionalParams.at(i) == "@") {
      encodedOfferWrites = idWithOptionalParams.slice(i);
      idWithOptionalParams = idWithOptionalParams.slice(0, i);
    }
  }

  const entity = store.get(type, idWithOptionalParams);
  if (entity === null && shouldThrow) {
    throw new Error(`Entity ${type} with ${idWithOptionalParams} id not found`);
  }
  return entity;
}

export function getOfferWriteFromStack(type: string): Array<PartialOfferWrite> {
  const stack = getStack(type);
  const ids = stack.ids;
  const idsArray = ids.split("|");
  let idWithOptionalParams = idsArray[idsArray.length - 1];

  let encodedOfferWrites = "";

  for (let i = 0; i < idWithOptionalParams.length; i++) {
    if (idWithOptionalParams.at(i) == "@") {
      encodedOfferWrites = idWithOptionalParams.slice(i);
      idWithOptionalParams = idWithOptionalParams.slice(0, i);
    }
  }

  if (encodedOfferWrites.length == 0) {
    return new Array<PartialOfferWrite>();
  }

  const partialOfferWrites = new Array<PartialOfferWrite>();

  let encodedString = encodedOfferWrites.split("@").filter(x => x !== "");

  for (let i = 0; i < encodedString.length; i += PartialOfferWrite.PARAMETERS_COUNT) {
    let offerWrite = PartialOfferWrite.fromEncodedArray(encodedString.slice(i, i + PartialOfferWrite.PARAMETERS_COUNT));
    partialOfferWrites.push(offerWrite);
  }

  return partialOfferWrites;
}

export function getLatestOrderFromStack(shouldThrow: boolean): Order {
  const order = getLatestFromStack("Order", shouldThrow);
  return changetype<Order>(order);
}

export function getLatestLimitOrderFromStack(): LimitOrder | null {
  const order = getLatestFromStack("LimitOrder", false);
  return changetype<LimitOrder | null>(order);
}

export function getLatestCleanOrderFromStack(): CleanOrder | null {
  const order = getLatestFromStack("CleanOrder", false);
  return changetype<CleanOrder | null>(order);
}

function addToStack(type: string, entity: Entity): void {
  const orderStack = getStack(type);
  if (type == "Order") {
    const order = changetype<Order>(entity);
    orderStack.ids = `${orderStack.ids}|${order.id}`;
  } else if (type == "LimitOrder") {
    const order = changetype<LimitOrder>(entity);
    orderStack.ids = `${orderStack.ids}|${order.id}`;
  } else if (type == "CleanOrder") {
    const order = changetype<CleanOrder>(entity);
    orderStack.ids = `${orderStack.ids}|${order.id}`;
  }
  orderStack.save();
}

export function addOfferWriteToStack(type: string, offerWrite: OfferWrite): void {
  const orderStack = getStack(type);

  const params = offerWrite.params;

  orderStack.ids = `${
    orderStack.ids
  }@${offerWrite.block.timestamp.toString()}@${offerWrite.logIndex.toString()}@${offerWrite.transaction.hash.toHex()}@${params.olKeyHash.toHex()}@${params.maker.toHex()}@${params.tick.toString()}@${params.gives.toString()}@${params.gasprice.toString()}@${params.gasreq.toString()}@${params.id.toString()}`;
  orderStack.save();
}

export function addOrderToStack(order: Order): void {
  addToStack("Order", order);
}

export function addLimitOrderToStack(order: LimitOrder): void {
  addToStack("LimitOrder", order);
}

export function addCleanOrderToStack(order: CleanOrder): void {
  addToStack("CleanOrder", order);
}

function removeLatestFromStack(type: string): void {
  let stack = getStack(type);
  const ids = stack.ids;

  for (let i = ids.length - 1; i >= 0; --i) {
    if (ids.at(i) == "|" || i == 0) {
      stack.ids = ids.slice(0, i);
      break;
    }
  }

  stack.save();
}

export function removeLatestOrderFromStack(): void {
  removeLatestFromStack("Order");
}

export function removeLatestLimitOrderFromStack(): void {
  removeLatestFromStack("LimitOrder");
}

export function removeLatestCleanOrderFromStack(): void {
  removeLatestFromStack("CleanOrder");
}
