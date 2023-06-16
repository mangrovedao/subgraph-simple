import { Address, BigInt, Value, ethereum } from "@graphprotocol/graph-ts";
import { Account, Context, Order } from "../generated/schema";

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

export const getContext = (): Context => {
  let context = Context.load('context');
  if (!context) {
    context = new Context('context');
    context.ids = ``;

    context.save();
  }

  return context;
}

export const addOrderToStack = (order: Order): void => {
  const context = getContext();

  context.ids = `${context.ids}|${order.id}`

  context.save();
}

export const getOrderFromStack = (): Order => {
  const context = getContext();
  const ids = context.ids;

  const idsArray = ids.split('|');
  const order = Order.load(idsArray[idsArray.length - 1])!;

  return order;
}

export const removeOrderFromStack = (): void => {
  const context = getContext();

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
  const context = getContext();

  const order = Order.load(context.last!)!;
  return order;
}

export const getEventUniqueId = (event: ethereum.Event): string => {
  return `${event.transaction.hash.toHex()}-${event.logIndex.toHex()}`;
}
