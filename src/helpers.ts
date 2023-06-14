import { Address, BigInt, Value } from "@graphprotocol/graph-ts";
import { Account, Contex, Order } from "../generated/schema";

export const getMarketId = (outbound_tkn: Address, inbound_tkn: Address): string  => {
  return `${outbound_tkn.toHex()}-${inbound_tkn.toHex()}`;
};

export const getOfferId = (outbound_tkn: Address, inbound_tkn: Address, id: BigInt): string => {
  return `${outbound_tkn.toHex()}-${inbound_tkn.toHex()}-${id.toHex()}`;
};

export const getOrCreateAccount = (address: Address): Account => {
  let account = Account.load(address);

  if (!account) {
    account = new Account(address);
    account.address = address;
    account.save();
  }

  return account;
}

export const addOrderToQueue = (order: Order): void => {
  let context = Contex.load('context');
  let currentId = 0;
  if (!context) {
    context = new Contex('context');
    context.currentId = BigInt.fromI32(0);
  } else {
    let valueCurrentId = context.currentId;
    if (valueCurrentId) {
      currentId = valueCurrentId.toI32();
    } else {
      currentId = 0;
    }
  }

  context.set(currentId.toString(), Value.fromString(order.id));

  currentId = currentId + 1;
  context.currentId = BigInt.fromI32(currentId);
  context.last = order.id;

  context.save();
}

export const getOrderFromQueue = (): Order => {
  const context = Contex.load('context')!;

  let currentId = context.currentId!.toI32();
  currentId = currentId - 1;

  const orderId = context.get(currentId.toString())!.toString();

  const order = Order.load(orderId)!;

  return order;
}

export const removeOrderFromQueue = (): void => {
  let context = Contex.load('context')!;
  let currentId = context.currentId!.toI32() - 1;

  context.last = context.get(currentId.toString())!.toString();

  context.unset(currentId.toString());

  currentId = currentId;
  context.currentId = BigInt.fromI32(currentId);

  context.save();
}

export const getLastOrder = (): Order => {
  const context = Contex.load('context')!;
  const order = Order.load(context.last!)!;

  return order;
}
