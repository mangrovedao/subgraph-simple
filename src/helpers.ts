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

export const addOrderToStack = (order: Order): void => {
  let context = Contex.load('context');
  if (!context) {
    context = new Contex('context');
    context.ids = ``;
  }
  context.ids = `${context.ids}|${order.id}`

  context.save();
}

export const getOrderFromStack = (): Order => {
  const context = Contex.load('context')!;
  const ids = context.ids;

  const idsArray = ids.split('|');
  const order = Order.load(idsArray[idsArray.length - 1])!;

  return order;
}

export const removeOrderFromStack = (): void => {
  let context = Contex.load('context')!;

  const ids = context.ids;
  for (let i = ids.length - 1 ; i >= 0 ; --i) {
    if (ids.at(i) == '|' || i == 0) {
      context.ids = ids.slice(0, i);
      context.last = ids.slice(i + 1);
      break;
    }
  }

  context.save();
}

export const getLastOrder = (): Order => {
  const context = Contex.load('context')!;

  const order = Order.load(context.last!)!;
  return order;
}
